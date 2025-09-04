const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['info', 'warning', 'error', 'critical'],
        required: true
    },
    category: {
        type: String,
        enum: ['auth', 'user', 'item', 'rental', 'payment', 'system', 'security'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
systemLogSchema.index({ level: 1, timestamp: -1 });
systemLogSchema.index({ category: 1, timestamp: -1 });
systemLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
