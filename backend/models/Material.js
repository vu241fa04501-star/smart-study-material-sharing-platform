const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide material title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Please select a subject'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileName: {
      type: String,
      default: 'document',
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
      required: true,
    },
    filePublicId: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and sorting
materialSchema.index({ title: 'text', description: 'text' });
materialSchema.index({ status: 1, averageRating: -1 });
materialSchema.index({ status: 1, downloadCount: -1 });
materialSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Material', materialSchema);
