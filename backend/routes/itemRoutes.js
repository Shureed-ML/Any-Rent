const router = require('express').Router();
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');

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
router.post('/', verifyToken, async (req, res) => {
    try {
        const newItem = new Item({
            ...req.body,
            owner: req.userId
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
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

module.exports = router;
