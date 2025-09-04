const router = require('express').Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Review = require('../models/Review');
const Rental = require('../models/Rental');
const Message = require('../models/Message');
const Wishlist = require('../models/Wishlist');
const verifyAdmin = require('../middleware/adminAuth');
const bcrypt = require('bcrypt');

console.log("🔧 Loading admin routes...");

// Dashboard Statistics
router.get('/dashboard/stats', verifyAdmin, async (req, res) => {
    try {
        console.log("📊 Dashboard stats requested");
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
        console.error("❌ Dashboard stats error:", error);
        res.status(500).json({ error: error.message });
    }
});

// User Management
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        console.log("👥 Users list requested");
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
        console.error("❌ Users list error:", error);
        res.status(500).json({ error: error.message });
    }
});

router.patch('/users/:id/toggle-admin', verifyAdmin, async (req, res) => {
    try {
        console.log("🔄 Toggle admin requested for user:", req.params.id);
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.json({ message: `User ${user.isAdmin ? 'promoted to' : 'demoted from'} admin`, user: { ...user._doc, password: undefined } });
    } catch (error) {
        console.error("❌ Toggle admin error:", error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        console.log("🗑️ Delete user requested:", req.params.id);
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
        
        await user.deleteOne();
        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        console.error("❌ Delete user error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Item Management
router.get('/items', verifyAdmin, async (req, res) => {
    try {
        console.log("📦 Items list requested");
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
        console.error("❌ Items list error:", error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/items/:id', verifyAdmin, async (req, res) => {
    try {
        console.log("🗑️ Delete item requested:", req.params.id);
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Delete associated reviews, rentals, and wishlist entries
        await Review.deleteMany({ itemId: req.params.id });
        await Rental.deleteMany({ itemId: req.params.id });
        await Wishlist.deleteMany({ itemId: req.params.id });
        
        await item.deleteOne();
        res.json({ message: 'Item and all associated data deleted successfully' });
    } catch (error) {
        console.error("❌ Delete item error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Review Management
router.get('/reviews', verifyAdmin, async (req, res) => {
    try {
        console.log("⭐ Reviews list requested");
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
        console.error("❌ Reviews list error:", error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/reviews/:id', verifyAdmin, async (req, res) => {
    try {
        console.log("🗑️ Delete review requested:", req.params.id);
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error("❌ Delete review error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Rental Management
router.get('/rentals', verifyAdmin, async (req, res) => {
    try {
        console.log("🏠 Rentals list requested");
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
        console.error("❌ Rentals list error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Create Admin User (for initial setup)
router.post('/create-admin', async (req, res) => {
    try {
        console.log("👤 Create admin requested");
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
        console.error("❌ Create admin error:", error);
        res.status(500).json({ error: error.message });
    }
});

console.log("✅ Admin routes loaded");
module.exports = router;
