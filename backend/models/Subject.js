const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, 'Please provide subject name'],
      unique: true,
      trim: true,
      minlength: [2, 'Subject name must be at least 2 characters'],
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subject', subjectSchema);
