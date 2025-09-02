const router = require('express').Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.userId = verified.id;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// Create a review
router.post('/', verifyToken, async (req, res) => {
    try {
        // Check if item exists
        const item = await Item.findById(req.body.itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Prevent owner from reviewing their own item
        if (item.owner.toString() === req.userId) {
            return res.status(403).json({ error: 'You cannot review your own item' });
        }

        // Check if user has already reviewed this item
        const existingReview = await Review.findOne({
            itemId: req.body.itemId,
            userId: req.userId
        });

        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this item' });
        }

        // Create review
        const review = new Review({
            itemId: req.body.itemId,
            userId: req.userId,
            rating: req.body.rating,
            comment: req.body.comment
        });

        const savedReview = await review.save();
        
        // Populate user details
        const populatedReview = await Review.findById(savedReview._id)
            .populate('userId', 'username');

        res.status(201).json(populatedReview);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'You have already reviewed this item' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Get reviews for an item
router.get('/item/:itemId', async (req, res) => {
    try {
        // Validate if itemId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
            return res.status(400).json({ error: 'Invalid item ID' });
        }

        const reviews = await Review.find({ itemId: req.params.itemId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ reviews });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: err.message });
    }
});
// Get reviews for an item
router.get('/:itemId', async (req, res) => {
    try {
        const reviews = await Review.find({ itemId: req.params.itemId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        const reviewStats = await Review.aggregate([
            { $match: { itemId: mongoose.Types.ObjectId(req.params.itemId) } },
            { 
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        res.json({
            reviews,
            stats: reviewStats[0] || { averageRating: 0, totalReviews: 0 }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a review (optional - if you want to allow users to delete their reviews)
router.delete('/:reviewId', verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own reviews' });
        }

        await review.remove();
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
