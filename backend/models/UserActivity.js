const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login', 'logout', 'register', 'profile_update',
            'item_create', 'item_update', 'item_delete', 'item_view',
            'review_create', 'review_update', 'review_delete',
            'rental_create', 'rental_return',
            'message_send', 'wishlist_add', 'wishlist_remove',
            'password_change', 'email_change'
        ]
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
