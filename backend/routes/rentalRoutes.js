const router = require('express').Router();
const Rental = require('../models/Rental');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Rent an item
router.post('/rent', auth, async (req, res) => {
    try {
        const { itemId } = req.body;
        
        if (!itemId) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        const itemObjectId = new mongoose.Types.ObjectId(itemId);
        const renterId = new mongoose.Types.ObjectId(req.user.id);

        // Get item details
        const item = await Item.findById(itemObjectId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Check if user is trying to rent their own item
        const ownerId = new mongoose.Types.ObjectId(item.owner);
        if (renterId.equals(ownerId)) {
            return res.status(400).json({ error: 'You cannot rent your own item' });
        }

        // Check if item is already rented
        const existingRental = await Rental.findOne({ 
            itemId: itemObjectId, 
            status: 'active' 
        });

        if (existingRental) {
            return res.status(400).json({ error: 'Item is already rented' });
        }

        // Create rental record
        const rental = new Rental({
            itemId: itemObjectId,
            renterId: renterId,
            ownerId: ownerId,
            totalCost: item.price // For now, just the daily price
        });

        const saved = await rental.save();
        await saved.populate('itemId');
        
        res.status(201).json(saved);
    } catch (error) {
        console.error('Error renting item:', error);
        res.status(500).json({ error: 'Failed to rent item' });
    }
});

// Return an item
router.post('/return', auth, async (req, res) => {
    try {
        const { rentalId } = req.body;
        
        if (!rentalId) {
            return res.status(400).json({ error: 'Rental ID is required' });
        }

        const rentalObjectId = new mongoose.Types.ObjectId(rentalId);
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Find the rental
        const rental = await Rental.findOne({ 
            _id: rentalObjectId, 
            renterId: userId, 
            status: 'active' 
        });

        if (!rental) {
            return res.status(404).json({ error: 'Rental not found or already returned' });
        }

        // Update rental status
        rental.status = 'returned';
        rental.returnDate = new Date();
        await rental.save();

        res.json({ message: 'Item returned successfully', rental });
    } catch (error) {
        console.error('Error returning item:', error);
        res.status(500).json({ error: 'Failed to return item' });
    }
});

// Get user's rented items
router.get('/rented', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        const rentedItems = await Rental.find({ 
            renterId: userId, 
            status: 'active' 
        })
        .populate('itemId')
        .sort({ rentalDate: -1 });
        
        res.json(rentedItems);
    } catch (error) {
        console.error('Error fetching rented items:', error);
        res.status(500).json({ error: 'Failed to fetch rented items' });
    }
});

// Get user's rental history
router.get('/history', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        const rentalHistory = await Rental.find({ 
            renterId: userId 
        })
        .populate('itemId')
        .sort({ rentalDate: -1 });
        
        res.json(rentalHistory);
    } catch (error) {
        console.error('Error fetching rental history:', error);
        res.status(500).json({ error: 'Failed to fetch rental history' });
    }
});

// Get items rented by others (for item owners)
router.get('/rented-out', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        const rentedOutItems = await Rental.find({ 
            ownerId: userId, 
            status: 'active' 
        })
        .populate('itemId')
        .populate('renterId', 'username email')
        .sort({ rentalDate: -1 });
        
        res.json(rentedOutItems);
    } catch (error) {
        console.error('Error fetching rented out items:', error);
        res.status(500).json({ error: 'Failed to fetch rented out items' });
    }
});

// Check if item is rented
router.get('/check/:itemId', auth, async (req, res) => {
    try {
        const { itemId } = req.params;
        const itemObjectId = new mongoose.Types.ObjectId(itemId);
        
        const rental = await Rental.findOne({ 
            itemId: itemObjectId, 
            status: 'active' 
        });

        res.json({ isRented: !!rental, rental });
    } catch (error) {
        console.error('Error checking rental status:', error);
        res.status(500).json({ error: 'Failed to check rental status' });
    }
});

module.exports = router;
