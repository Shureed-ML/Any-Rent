const router = require('express').Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Rental = require('../models/Rental');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
const { logUserActivity, logSystemEvent } = require('../utils/activityLogger');

// Register
router.post('/register', async (req, res) => {
    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        // Save user and return response
        const user = await newUser.save();

        // Log registration activity
        await logUserActivity(user._id, 'register', {
            username: user.username,
            email: user.email
        }, req);

        await logSystemEvent('info', 'user', 'New user registered', {
            userId: user._id,
            username: user.username
        }, user._id, req);

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        // Find user
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json("User not found");

        // Validate password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        // Create and assign token
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Log login activity
        await logUserActivity(user._id, 'login', {
            username: user.username,
            email: user.email
        }, req);

        // Remove password from response
        const { password, ...userWithoutPassword } = user._doc;

        res.status(200).json({
            ...userWithoutPassword,
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { username, email, phone, location } = req.body;
        const userId = req.user.id;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already in use' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...(username && { username }),
                ...(email && { email }),
                ...(phone !== undefined && { phone }),
                ...(location !== undefined && { location })
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete account
router.delete('/account', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete user's items
        await Item.deleteMany({ owner: userId });

        // Delete user's reviews
        await Review.deleteMany({ userId });

        // Delete user's messages
        await Message.deleteMany({
            $or: [{ senderId: userId }, { receiverId: userId }]
        });

        // Delete user's rentals
        await Rental.deleteMany({
            $or: [{ renterId: userId }, { ownerId: userId }]
        });

        // Delete user account
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
