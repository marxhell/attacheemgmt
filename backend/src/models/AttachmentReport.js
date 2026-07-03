const mongoose = require('mongoose');

const attachmentReportSchema = new mongoose.Schema({
  attachee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachee',
    required: [true, 'Attachee is required'],
  },
  reportType: {
    type: String,
    enum: ['progress', 'final'],
    required: [true, 'Report type is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'File is required'],
  },
  description: {
    type: String,
    trim: true,
  },
  submittedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'approved', 'rejected'],
    default: 'submitted',
  },
  feedback: {
    type: String,
    trim: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AttachmentReport', attachmentReportSchema);