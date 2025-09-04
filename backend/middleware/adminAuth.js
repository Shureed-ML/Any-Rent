const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        };
        
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = verifyAdmin;
