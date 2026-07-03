const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info',
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
  },
  link: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Attachee', 'Evaluation', 'Logbook', 'Attendance'],
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);