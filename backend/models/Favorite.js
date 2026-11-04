const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites
favoriteSchema.index({ userId: 1, materialId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
