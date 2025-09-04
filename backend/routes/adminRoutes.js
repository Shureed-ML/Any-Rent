const router = require('express').Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Review = require('../models/Review');
const Rental = require('../models/Rental');
const Message = require('../models/Message');
const Wishlist = require('../models/Wishlist');
const UserActivity = require('../models/UserActivity');
const SystemLog = require('../models/SystemLog');
const UserWarning = require('../models/UserWarning');
const verifyAdmin = require('../middleware/adminAuth');
const bcrypt = require('bcrypt');

// Dashboard Statistics
router.get('/dashboard/stats', verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalItems = await Item.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalRentals = await Rental.countDocuments();
        const activeRentals = await Rental.countDocuments({ status: 'active' });
        const totalMessages = await Message.countDocuments();

        // Recent activity (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const newItemsThisMonth = await Item.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const newRentalsThisMonth = await Rental.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // Top categories
        const topCategories = await Item.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totalUsers,
            totalItems,
            totalReviews,
            totalRentals,
            activeRentals,
            totalMessages,
            newUsersThisMonth,
            newItemsThisMonth,
            newRentalsThisMonth,
            topCategories
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Management
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        
        const query = search ? {
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/users/:id/toggle-admin', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.json({ message: `User ${user.isAdmin ? 'promoted to' : 'demoted from'} admin`, user: { ...user._doc, password: undefined } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get detailed user information
router.get('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user statistics
        const itemsCount = await Item.countDocuments({ owner: req.params.id });
        const reviewsCount = await Review.countDocuments({ userId: req.params.id });
        const rentalsAsRenter = await Rental.countDocuments({ renterId: req.params.id });
        const rentalsAsOwner = await Rental.countDocuments({ ownerId: req.params.id });
        const messagesCount = await Message.countDocuments({
            $or: [{ senderId: req.params.id }, { receiverId: req.params.id }]
        });

        // Get recent activity
        const recentActivity = await UserActivity.find({ userId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(20);

        // Get warnings
        const warnings = await UserWarning.find({ userId: req.params.id })
            .populate('issuedBy', 'username')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            user,
            statistics: {
                itemsCount,
                reviewsCount,
                rentalsAsRenter,
                rentalsAsOwner,
                messagesCount
            },
            recentActivity,
            warnings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Suspend/Unsuspend user
router.patch('/users/:id/suspend', verifyAdmin, async (req, res) => {
    try {
        const { reason, duration } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isAdmin) {
            return res.status(400).json({ error: 'Cannot suspend admin users' });
        }

        user.isSuspended = !user.isSuspended;
        user.suspensionReason = user.isSuspended ? reason : null;
        user.suspensionDate = user.isSuspended ? new Date() : null;

        await user.save();

        // Log the action
        await new SystemLog({
            level: 'info',
            category: 'user',
            message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}`,
            details: { userId: user._id, reason, adminId: req.user.id },
            userId: req.user.id
        }).save();

        res.json({
            message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Issue warning to user
router.post('/users/:id/warn', verifyAdmin, async (req, res) => {
    try {
        const { reason, severity, relatedItem, relatedReview } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const warning = new UserWarning({
            userId: req.params.id,
            issuedBy: req.user.id,
            reason,
            severity: severity || 'medium',
            relatedItem,
            relatedReview
        });

        await warning.save();

        // Update user warning count
        user.warningsCount += 1;
        user.lastWarningDate = new Date();
        await user.save();

        // Log the action
        await new SystemLog({
            level: 'info',
            category: 'user',
            message: 'Warning issued to user',
            details: { userId: user._id, reason, severity, adminId: req.user.id },
            userId: req.user.id
        }).save();

        res.json({ message: 'Warning issued successfully', warning });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify user
router.patch('/users/:id/verify', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body; // 'verified' or 'rejected'
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.verificationStatus = status;
        await user.save();

        res.json({
            message: `User ${status} successfully`,
            user: { ...user._doc, password: undefined }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Don't allow deleting the last admin
        if (user.isAdmin) {
            const adminCount = await User.countDocuments({ isAdmin: true });
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'Cannot delete the last admin user' });
            }
        }

        // Delete user's items, reviews, rentals, messages, and wishlist entries
        await Item.deleteMany({ owner: req.params.id });
        await Review.deleteMany({ userId: req.params.id });
        await Rental.deleteMany({ $or: [{ renterId: req.params.id }, { ownerId: req.params.id }] });
        await Message.deleteMany({ $or: [{ senderId: req.params.id }, { receiverId: req.params.id }] });
        await Wishlist.deleteMany({ userId: req.params.id });
        await UserActivity.deleteMany({ userId: req.params.id });
        await UserWarning.deleteMany({ userId: req.params.id });

        await user.deleteOne();

        // Log the action
        await new SystemLog({
            level: 'warning',
            category: 'user',
            message: 'User account deleted',
            details: { deletedUserId: req.params.id, adminId: req.user.id },
            userId: req.user.id
        }).save();

        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Item Management
router.get('/items', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const category = req.query.category || '';
        
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            query.category = category;
        }

        const items = await Item.find(query)
            .populate('owner', 'username email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Item.countDocuments(query);

        res.json({
            items,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get detailed item information
router.get('/items/:id', verifyAdmin, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('owner', 'username email verificationStatus');

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Get item statistics
        const reviewsCount = await Review.countDocuments({ itemId: req.params.id });
        const rentalsCount = await Rental.countDocuments({ itemId: req.params.id });
        const wishlistCount = await Wishlist.countDocuments({ itemId: req.params.id });

        // Get recent reviews
        const recentReviews = await Review.find({ itemId: req.params.id })
            .populate('userId', 'username')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            item,
            statistics: {
                reviewsCount,
                rentalsCount,
                wishlistCount,
                viewCount: item.viewCount || 0
            },
            recentReviews
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve/Reject item
router.patch('/items/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        item.status = status;
        if (status === 'rejected') {
            item.rejectionReason = rejectionReason;
        }

        await item.save();

        // Log the action
        await new SystemLog({
            level: 'info',
            category: 'item',
            message: `Item ${status}`,
            details: { itemId: item._id, status, rejectionReason, adminId: req.user.id },
            userId: req.user.id
        }).save();

        res.json({
            message: `Item ${status} successfully`,
            item
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle featured status
router.patch('/items/:id/featured', verifyAdmin, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        item.isFeatured = !item.isFeatured;
        await item.save();

        res.json({
            message: `Item ${item.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            item
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk operations on items
router.post('/items/bulk', verifyAdmin, async (req, res) => {
    try {
        const { action, itemIds, data } = req.body;

        let result;
        switch (action) {
            case 'approve':
                result = await Item.updateMany(
                    { _id: { $in: itemIds } },
                    { status: 'approved' }
                );
                break;
            case 'reject':
                result = await Item.updateMany(
                    { _id: { $in: itemIds } },
                    { status: 'rejected', rejectionReason: data.rejectionReason }
                );
                break;
            case 'feature':
                result = await Item.updateMany(
                    { _id: { $in: itemIds } },
                    { isFeatured: true }
                );
                break;
            case 'unfeature':
                result = await Item.updateMany(
                    { _id: { $in: itemIds } },
                    { isFeatured: false }
                );
                break;
            case 'delete':
                // Delete associated data first
                await Review.deleteMany({ itemId: { $in: itemIds } });
                await Rental.deleteMany({ itemId: { $in: itemIds } });
                await Wishlist.deleteMany({ itemId: { $in: itemIds } });
                result = await Item.deleteMany({ _id: { $in: itemIds } });
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        // Log the action
        await new SystemLog({
            level: 'info',
            category: 'item',
            message: `Bulk ${action} operation performed`,
            details: { itemIds, action, adminId: req.user.id },
            userId: req.user.id
        }).save();

        res.json({
            message: `Bulk ${action} completed successfully`,
            modifiedCount: result.modifiedCount || result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/items/:id', verifyAdmin, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Delete associated reviews, rentals, and wishlist entries
        await Review.deleteMany({ itemId: req.params.id });
        await Rental.deleteMany({ itemId: req.params.id });
        await Wishlist.deleteMany({ itemId: req.params.id });

        await item.deleteOne();

        // Log the action
        await new SystemLog({
            level: 'info',
            category: 'item',
            message: 'Item deleted',
            details: { itemId: req.params.id, adminId: req.user.id },
            userId: req.user.id
        }).save();

        res.json({ message: 'Item and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Review Management
router.get('/reviews', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const reviews = await Review.find()
            .populate('userId', 'username email')
            .populate('itemId', 'title')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Review.countDocuments();

        res.json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/reviews/:id', verifyAdmin, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rental Management
router.get('/rentals', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || '';
        
        let query = {};
        if (status) {
            query.status = status;
        }

        const rentals = await Rental.find(query)
            .populate('renterId', 'username email')
            .populate('ownerId', 'username email')
            .populate('itemId', 'title price')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Rental.countDocuments(query);

        res.json({
            rentals,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// System Logs
router.get('/system/logs', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const level = req.query.level || '';
        const category = req.query.category || '';

        let query = {};
        if (level) query.level = level;
        if (category) query.category = category;

        const logs = await SystemLog.find(query)
            .populate('userId', 'username email')
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await SystemLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Activity Monitoring
router.get('/system/activity', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const action = req.query.action || '';
        const userId = req.query.userId || '';

        let query = {};
        if (action) query.action = action;
        if (userId) query.userId = userId;

        const activities = await UserActivity.find(query)
            .populate('userId', 'username email')
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await UserActivity.countDocuments(query);

        res.json({
            activities,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// System Statistics
router.get('/system/stats', verifyAdmin, async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Daily stats
        const dailyStats = {
            users: await User.countDocuments({ createdAt: { $gte: today } }),
            items: await Item.countDocuments({ createdAt: { $gte: today } }),
            rentals: await Rental.countDocuments({ createdAt: { $gte: today } }),
            reviews: await Review.countDocuments({ createdAt: { $gte: today } }),
            logins: await UserActivity.countDocuments({
                action: 'login',
                timestamp: { $gte: today }
            })
        };

        // Weekly stats
        const weeklyStats = {
            users: await User.countDocuments({ createdAt: { $gte: thisWeek } }),
            items: await Item.countDocuments({ createdAt: { $gte: thisWeek } }),
            rentals: await Rental.countDocuments({ createdAt: { $gte: thisWeek } }),
            reviews: await Review.countDocuments({ createdAt: { $gte: thisWeek } })
        };

        // Monthly stats
        const monthlyStats = {
            users: await User.countDocuments({ createdAt: { $gte: thisMonth } }),
            items: await Item.countDocuments({ createdAt: { $gte: thisMonth } }),
            rentals: await Rental.countDocuments({ createdAt: { $gte: thisMonth } }),
            reviews: await Review.countDocuments({ createdAt: { $gte: thisMonth } })
        };

        // System health
        const systemHealth = {
            suspendedUsers: await User.countDocuments({ isSuspended: true }),
            pendingItems: await Item.countDocuments({ status: 'pending' }),
            rejectedItems: await Item.countDocuments({ status: 'rejected' }),
            activeWarnings: await UserWarning.countDocuments({ status: 'active' }),
            errorLogs: await SystemLog.countDocuments({
                level: 'error',
                timestamp: { $gte: today }
            })
        };

        res.json({
            dailyStats,
            weeklyStats,
            monthlyStats,
            systemHealth
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Warnings Management
router.get('/warnings', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || '';

        let query = {};
        if (status) query.status = status;

        const warnings = await UserWarning.find(query)
            .populate('userId', 'username email')
            .populate('issuedBy', 'username')
            .populate('relatedItem', 'title')
            .populate('relatedReview', 'comment')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await UserWarning.countDocuments(query);

        res.json({
            warnings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analytics - User Growth
router.get('/analytics/user-growth', verifyAdmin, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        res.json(userGrowth);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analytics - Revenue (if you have payment system)
router.get('/analytics/revenue', verifyAdmin, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const revenue = await Rental.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    totalRevenue: { $sum: '$totalCost' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        res.json(revenue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Admin User (for initial setup)
router.post('/create-admin', async (req, res) => {
    try {
        // Check if any admin exists
        const adminExists = await User.findOne({ isAdmin: true });
        if (adminExists) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        const { username, email, password } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminUser = new User({
            username,
            email,
            password: hashedPassword,
            isAdmin: true
        });

        await adminUser.save();
        res.status(201).json({ message: 'Admin user created successfully', user: { ...adminUser._doc, password: undefined } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
