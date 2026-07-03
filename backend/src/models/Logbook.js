const mongoose = require('mongoose');

const logbookEntrySchema = new mongoose.Schema({
  attachee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachee',
    required: [true, 'Attachee is required'],
  },
  weekNumber: {
    type: Number,
    required: [true, 'Week number is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  activities: {
    type: String,
    required: [true, 'Activities are required'],
    trim: true,
  },
  skillsAcquired: {
    type: String,
    trim: true,
  },
  lessonsLearned: {
    type: String,
    trim: true,
  },
  challenges: {
    type: String,
    trim: true,
  },
  supervisorComment: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected'],
    default: 'draft',
  },
  submittedAt: {
    type: Date,
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

logbookEntrySchema.index({ attachee: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('Logbook', logbookEntrySchema);