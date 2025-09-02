const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    renterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rentalDate: {
        type: Date,
        default: Date.now
    },
    returnDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'returned'],
        default: 'active'
    },
    totalCost: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Create compound index for efficient queries
rentalSchema.index({ itemId: 1, renterId: 1, status: 1 });

module.exports = mongoose.model('Rental', rentalSchema);
