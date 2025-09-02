const router = require('express').Router();
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const express = require('express');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json("Access denied");

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.userId = verified.id;
        next();
    } catch (err) {
        res.status(401).json("Invalid token");
    }
};

// Create a new item
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        console.log('Request body:', req.body); // For debugging
        
        const itemData = {
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            location: req.body.location,
            category: req.body.category,
            owner: req.userId
        };
        
        if (req.file) {
            // If a file was uploaded, add the file path
            itemData.imageUrl = `/uploads/${req.file.filename}`;
        }

        console.log('Item data to save:', itemData); // For debugging
        
        const newItem = new Item(itemData);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error('Error creating item:', err); // For debugging
        res.status(500).json({ error: err.message });
    }
});

// Get all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find().populate('owner', 'username');
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user's items
router.get('/user', verifyToken, async (req, res) => {
    try {
        const items = await Item.find({ owner: req.userId });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get a single item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('owner', 'username');
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an item
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        if (item.owner.toString() !== req.userId) return res.status(403).json({ error: 'Unauthorized' });
        Object.assign(item, req.body);
        const updatedItem = await item.save();
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an item
router.delete('/:id', verifyToken, async (req, res) => {
    console.log('DELETE /items/' + req.params.id, 'User:', req.userId);
    const item = await Item.findById(req.params.id);
    if (!item) {
        console.log('Item not found:', req.params.id);
        return res.status(404).json({ error: 'Item not found' });
    }
    if (item.owner.toString() !== req.userId) {
        console.log('Unauthorized delete attempt by user:', req.userId, 'for item:', req.params.id);
        return res.status(403).json({ error: 'Unauthorized' });
    }
    await item.deleteOne();
    res.status(200).json({ message: 'Item deleted successfully' });
});

module.exports = router;
