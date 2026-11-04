const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required (1-5)'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment for your review'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same user from reviewing the same material multiple times
reviewSchema.index({ userId: 1, materialId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
