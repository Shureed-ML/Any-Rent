const router = require('express').Router();

console.log("🔧 Loading test admin routes...");

// Simple test route
router.get('/test', (req, res) => {
    console.log("📞 Admin test route called");
    res.json({ message: 'Admin routes are working!' });
});

console.log("✅ Test admin routes loaded");
module.exports = router;
