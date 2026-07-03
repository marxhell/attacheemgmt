const Attendance = require('../models/Attendance');
const Attachee = require('../models/Attachee');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
exports.markAttendance = async (req, res, next) => {
  try {
    const { attachee, date, checkIn, checkOut, status, remarks } = req.body;

    const existing = await Attendance.findOne({ attachee, date: new Date(date).setHours(0,0,0,0) });
    if (existing) {
      return ResponseHandler.error(res, 'Attendance already marked for this date', 400);
    }

    const attendance = await Attendance.create({
      attachee,
      date,
      checkIn,
      checkOut,
      status: status || 'present',
      remarks,
      verifiedBy: req.user._id,
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('attachee', 'firstName lastName studentId')
      .populate('verifiedBy', 'name');

    return ResponseHandler.created(res, populated, 'Attendance marked successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.attachee) query.attachee = req.query.attachee;
    if (req.query.status) query.status = req.query.status;
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }

    // Supervisor filter
    if (req.user.role === 'supervisor') {
      const supervisor = await require('../models/Supervisor').findOne({ userId: req.user._id });
      if (supervisor) {
        const attachees = await Attachee.find({ supervisor: supervisor._id }).select('_id');
        query.attachee = { $in: attachees.map(a => a._id) };
      }
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('attachee', 'firstName lastName studentId institution')
      .populate('verifiedBy', 'name')
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(limit);

    return ResponseHandler.paginated(res, records, total, page, limit, 'Attendance records retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendanceById = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('attachee', 'firstName lastName studentId institution department')
      .populate('verifiedBy', 'name');
    
    if (!record) return ResponseHandler.notFound(res, 'Attendance record not found');
    return ResponseHandler.success(res, record, 'Attendance record retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private
exports.updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('attachee', 'firstName lastName studentId');

    if (!record) return ResponseHandler.notFound(res, 'Attendance record not found');
    return ResponseHandler.success(res, record, 'Attendance updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
exports.getAttendanceStats = async (req, res, next) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Attendance.countDocuments();
    const today = await Attendance.countDocuments({ date: new Date().setHours(0,0,0,0) });

    const formatted = { total, today, present: 0, absent: 0, late: 0, 'half-day': 0, permission: 0 };
    stats.forEach(s => { formatted[s._id] = s.count; });

    return ResponseHandler.success(res, formatted, 'Attendance stats retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get attachee attendance summary
// @route   GET /api/attendance/summary/:attacheeId
// @access  Private
exports.getAttacheeAttendanceSummary = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const stats = await Attendance.aggregate([
      { $match: { attachee: new mongoose.Types.ObjectId(req.params.attacheeId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const total = await Attendance.countDocuments({ attachee: req.params.attacheeId });
    const formatted = { total, present: 0, absent: 0, late: 0, 'half-day': 0, permission: 0 };
    stats.forEach(s => { formatted[s._id] = s.count; });

    return ResponseHandler.success(res, formatted, 'Attendance summary retrieved');
  } catch (error) {
    next(error);
  }
};
