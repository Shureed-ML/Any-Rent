const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Prevent user from reviewing the same item multiple times
ReviewSchema.index({ itemId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
