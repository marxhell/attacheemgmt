const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  attachee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachee',
    required: [true, 'Attachee is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  tasksPerformed: {
    type: String,
    required: [true, 'Tasks performed is required'],
    trim: true,
  },
  skillsLearned: {
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
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft',
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

dailyActivitySchema.index({ attachee: 1, date: 1 });

module.exports = mongoose.model('DailyActivity', dailyActivitySchema);