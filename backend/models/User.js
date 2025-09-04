const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin:  { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspensionReason: { type: String },
  suspensionDate: { type: Date },
  lastLogin: { type: Date },
  profilePicture: { type: String },
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  warningsCount: { type: Number, default: 0 },
  lastWarningDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
