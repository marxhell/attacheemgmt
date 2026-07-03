const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  attachee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachee',
    required: [true, 'Attachee is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in time is required'],
  },
  checkOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'permission'],
    default: 'present',
  },
  remarks: {
    type: String,
    trim: true,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Ensure one attendance record per attachee per day
attendanceSchema.index({ attachee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);