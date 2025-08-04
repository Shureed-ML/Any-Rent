const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Item", ItemSchema);
