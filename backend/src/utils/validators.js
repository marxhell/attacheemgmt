const { body } = require('express-validator');

exports.registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'supervisor', 'hr', 'director']).withMessage('Invalid role'),
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.attacheeValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('nationalId').trim().notEmpty().withMessage('National ID is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('institution').trim().notEmpty().withMessage('Institution is required'),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
  body('attachmentStartDate').isDate().withMessage('Valid start date is required'),
  body('attachmentEndDate').isDate().withMessage('Valid end date is required'),
];

exports.attendanceValidator = [
  body('attachee').isMongoId().withMessage('Valid attachee ID is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in time is required'),
  body('status').optional().isIn(['present', 'absent', 'late', 'half-day', 'permission']),
];

exports.evaluationValidator = [
  body('attachee').isMongoId().withMessage('Valid attachee ID is required'),
  body('evaluationType').isIn(['mid-term', 'final']).withMessage('Evaluation type must be mid-term or final'),
  body('punctuality').isInt({ min: 1, max: 5 }).withMessage('Punctuality must be 1-5'),
  body('attendance').isInt({ min: 1, max: 5 }).withMessage('Attendance must be 1-5'),
  body('attitude').isInt({ min: 1, max: 5 }).withMessage('Attitude must be 1-5'),
  body('initiative').isInt({ min: 1, max: 5 }).withMessage('Initiative must be 1-5'),
  body('qualityOfWork').isInt({ min: 1, max: 5 }).withMessage('Quality of work must be 1-5'),
  body('technicalSkills').isInt({ min: 1, max: 5 }).withMessage('Technical skills must be 1-5'),
  body('communication').isInt({ min: 1, max: 5 }).withMessage('Communication must be 1-5'),
  body('teamwork').isInt({ min: 1, max: 5 }).withMessage('Teamwork must be 1-5'),
  body('problemSolving').isInt({ min: 1, max: 5 }).withMessage('Problem solving must be 1-5'),
  body('adaptability').isInt({ min: 1, max: 5 }).withMessage('Adaptability must be 1-5'),
];

exports.departmentValidator = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required'),
];

exports.supervisorValidator = [
  body('name').trim().notEmpty().withMessage('Supervisor name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('department').trim().notEmpty().withMessage('Department is required'),
];

exports.logbookValidator = [
  body('attachee').isMongoId().withMessage('Valid attachee ID is required'),
  body('weekNumber').isInt({ min: 1 }).withMessage('Valid week number is required'),
  body('activities').trim().notEmpty().withMessage('Activities are required'),
];

exports.dailyActivityValidator = [
  body('attachee').isMongoId().withMessage('Valid attachee ID is required'),
  body('tasksPerformed').trim().notEmpty().withMessage('Tasks performed is required'),
];