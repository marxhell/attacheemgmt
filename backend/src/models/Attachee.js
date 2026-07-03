const mongoose = require('mongoose');

const attacheeSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    trim: true,
  },

  // Institution Information
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true,
  },
  yearOfStudy: {
    type: String,
    trim: true,
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true,
  },

  // Attachment Details
  attachmentStartDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  attachmentEndDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  duration: {
    type: Number, // in weeks
  },
  
  // Department & Supervisor Assignment
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'terminated', 'extended'],
    default: 'pending',
  },

  // Documents
  documents: {
    studentIdUpload: { type: String },
    nationalIdUpload: { type: String },
    insurance: { type: String },
    schoolLetter: { type: String },
    passportPhoto: { type: String },
  },

  // Emergency Contact
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String },
  },

  // Created by
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Virtual for full name
attacheeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
});

attacheeSchema.set('toJSON', { virtuals: true });
attacheeSchema.set('toObject', { virtuals: true });

// Pre-save to calculate duration
attacheeSchema.pre('save', function (next) {
  if (this.attachmentStartDate && this.attachmentEndDate) {
    const diffTime = Math.abs(this.attachmentEndDate - this.attachmentStartDate);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  }
  next();
});

module.exports = mongoose.model('Attachee', attacheeSchema);