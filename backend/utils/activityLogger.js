const UserActivity = require('../models/UserActivity');
const SystemLog = require('../models/SystemLog');

// Log user activity
const logUserActivity = async (userId, action, details = {}, req = null) => {
    try {
        const activityData = {
            userId,
            action,
            details,
            timestamp: new Date()
        };

        if (req) {
            activityData.ipAddress = req.ip || req.connection.remoteAddress;
            activityData.userAgent = req.get('User-Agent');
        }

        const activity = new UserActivity(activityData);
        await activity.save();
        
        return activity;
    } catch (error) {
        console.error('Error logging user activity:', error);
    }
};

// Log system event
const logSystemEvent = async (level, category, message, details = {}, userId = null, req = null) => {
    try {
        const logData = {
            level,
            category,
            message,
            details,
            userId,
            timestamp: new Date()
        };

        if (req) {
            logData.ipAddress = req.ip || req.connection.remoteAddress;
            logData.userAgent = req.get('User-Agent');
        }

        const log = new SystemLog(logData);
        await log.save();
        
        return log;
    } catch (error) {
        console.error('Error logging system event:', error);
    }
};

// Middleware to automatically log user activities
const activityMiddleware = (action) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json;
        
        // Override json method to log activity after successful response
        res.json = function(data) {
            // Only log if response is successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Extract user ID from request (could be from token, params, etc.)
                const userId = req.user?.id || req.userId || req.params.userId;
                
                if (userId) {
                    logUserActivity(userId, action, {
                        method: req.method,
                        url: req.originalUrl,
                        params: req.params,
                        query: req.query,
                        statusCode: res.statusCode
                    }, req);
                }
            }
            
            // Call original json method
            return originalJson.call(this, data);
        };
        
        next();
    };
};

module.exports = {
    logUserActivity,
    logSystemEvent,
    activityMiddleware
};
