const router = require('express').Router();
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const wishlist = await Wishlist.find({ userId: userId })
            .populate('itemId')
            .sort({ createdAt: -1 });
        
        res.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// Add item to wishlist
router.post('/add', auth, async (req, res) => {
    try {
        const { itemId } = req.body;
        
        if (!itemId) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);
        const itemObjectId = new mongoose.Types.ObjectId(itemId);

        // Check if item is already in wishlist
        const existingWishlist = await Wishlist.findOne({ 
            userId: userId, 
            itemId: itemObjectId 
        });

        if (existingWishlist) {
            return res.status(400).json({ error: 'Item already in wishlist' });
        }

        const wishlistItem = new Wishlist({
            userId: userId,
            itemId: itemObjectId
        });

        const saved = await wishlistItem.save();
        await saved.populate('itemId');
        
        res.status(201).json(saved);
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// Remove item from wishlist
router.delete('/remove/:itemId', auth, async (req, res) => {
    try {
        const { itemId } = req.params;
        
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const itemObjectId = new mongoose.Types.ObjectId(itemId);
        
        const deleted = await Wishlist.findOneAndDelete({ 
            userId: userId, 
            itemId: itemObjectId 
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Item not found in wishlist' });
        }

        res.json({ message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// Check if item is in wishlist
router.get('/check/:itemId', auth, async (req, res) => {
    try {
        const { itemId } = req.params;
        
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const itemObjectId = new mongoose.Types.ObjectId(itemId);
        
        const wishlistItem = await Wishlist.findOne({ 
            userId: userId, 
            itemId: itemObjectId 
        });

        res.json({ inWishlist: !!wishlistItem });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({ error: 'Failed to check wishlist' });
    }
});

module.exports = router;
