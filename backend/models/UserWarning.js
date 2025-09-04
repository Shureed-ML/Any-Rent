const mongoose = require('mongoose');

const userWarningSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    relatedReview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },
    status: {
        type: String,
        enum: ['active', 'acknowledged', 'resolved'],
        default: 'active'
    },
    acknowledgedAt: {
        type: Date
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
userWarningSchema.index({ userId: 1, createdAt: -1 });
userWarningSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('UserWarning', userWarningSchema);
