const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  attachee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachee',
    required: [true, 'Attachee is required'],
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: [true, 'Supervisor is required'],
  },
  evaluationType: {
    type: String,
    enum: ['mid-term', 'final'],
    required: [true, 'Evaluation type is required'],
  },
  evaluationDate: {
    type: Date,
    default: Date.now,
  },

  // Performance Criteria (1-5 scale)
  punctuality: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  attendance: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  attitude: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  initiative: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  qualityOfWork: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  technicalSkills: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  communication: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  teamwork: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  problemSolving: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  adaptability: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },

  // Overall
  totalScore: {
    type: Number,
  },
  averageScore: {
    type: Number,
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
  },

  // Comments
  strengths: {
    type: String,
    trim: true,
  },
  areasForImprovement: {
    type: String,
    trim: true,
  },
  supervisorRemarks: {
    type: String,
    trim: true,
  },
  generalComment: {
    type: String,
    trim: true,
  },

  // Recommendation
  recommendation: {
    type: String,
    enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'poor'],
  },

  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved'],
    default: 'draft',
  },
}, {
  timestamps: true,
});

// Calculate scores before saving
evaluationSchema.pre('save', function (next) {
  const scores = [
    this.punctuality, this.attendance, this.attitude, this.initiative,
    this.qualityOfWork, this.technicalSkills, this.communication,
    this.teamwork, this.problemSolving, this.adaptability,
  ];
  
  this.totalScore = scores.reduce((a, b) => a + b, 0);
  this.averageScore = Math.round((this.totalScore / scores.length) * 10) / 10;

  // Grade calculation
  if (this.averageScore >= 4.5) this.grade = 'A';
  else if (this.averageScore >= 3.5) this.grade = 'B';
  else if (this.averageScore >= 2.5) this.grade = 'C';
  else if (this.averageScore >= 1.5) this.grade = 'D';
  else this.grade = 'F';

  // Recommendation
  if (this.averageScore >= 4.5) this.recommendation = 'excellent';
  else if (this.averageScore >= 3.5) this.recommendation = 'good';
  else if (this.averageScore >= 2.5) this.recommendation = 'satisfactory';
  else if (this.averageScore >= 1.5) this.recommendation = 'needs_improvement';
  else this.recommendation = 'poor';

  next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema);