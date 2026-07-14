const Attachee = require('../models/Attachee');
const Supervisor = require('../models/Supervisor');
const Department = require('../models/Department');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const totalAttachees = await Attachee.countDocuments();
    const activeAttachees = await Attachee.countDocuments({ status: 'active' });
    const completedAttachees = await Attachee.countDocuments({ status: 'completed' });
    const pendingAttachees = await Attachee.countDocuments({ status: 'pending' });
    
    const totalSupervisors = await Supervisor.countDocuments({ isActive: true });
    const totalDepartments = await Department.countDocuments({ isActive: true });

    // Get attachees nearing completion (within 2 weeks)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    const nearingCompletion = await Attachee.countDocuments({
      status: 'active',
      attachmentEndDate: { $lte: twoWeeksFromNow, $gte: new Date() },
    });

    // Overdue attachees (past end date but still active)
    const overdueAttachees = await Attachee.countDocuments({
      status: 'active',
      attachmentEndDate: { $lt: new Date() },
    });

    return ResponseHandler.success(res, {
      totalAttachees,
      activeAttachees,
      completedAttachees,
      pendingAttachees,
      totalSupervisors,
      totalDepartments,
      nearingCompletion,
      overdueAttachees,
    }, 'Dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent attachees
// @route   GET /api/dashboard/recent-attachees
// @access  Private
exports.getRecentAttachees = async (req, res, next) => {
  try {
    const attachees = await Attachee.find()
      .populate('department', 'name')
      .populate('supervisor', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return ResponseHandler.success(res, attachees, 'Recent attachees retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly registrations for chart
// @route   GET /api/dashboard/monthly-registrations
// @access  Private
exports.getMonthlyRegistrations = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Attachee.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return ResponseHandler.success(res, data, 'Monthly registrations retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get department distribution
// @route   GET /api/dashboard/department-distribution
// @access  Private
exports.getDepartmentDistribution = async (req, res, next) => {
  try {
    const data = await Attachee.aggregate([
      { $match: { department: { $ne: null } } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    await Department.populate(data, { path: '_id', select: 'name code' });

    return ResponseHandler.success(res, data, 'Department distribution retrieved');
  } catch (error) {
    next(error);
  }
};