const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        // Attach a user object similar to prior usage
        req.user = {
            id: decoded.id || decoded._id,
            username: decoded.username || decoded.name || null
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
