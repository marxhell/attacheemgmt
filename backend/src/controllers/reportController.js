const Attachee = require('../models/Attachee');
const Attendance = require('../models/Attendance');
const Evaluation = require('../models/Evaluation');
const Logbook = require('../models/Logbook');
const Department = require('../models/Department');
const Supervisor = require('../models/Supervisor');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Generate active attachees report
// @route   GET /api/reports/active-attachees
// @access  Private
exports.activeAttacheesReport = async (req, res, next) => {
  try {
    const attachees = await Attachee.find({ status: 'active' })
      .populate('department', 'name code')
      .populate('supervisor', 'name email')
      .sort({ lastName: 1 });

    const summary = {
      totalActive: attachees.length,
      byDepartment: {},
    };

    attachees.forEach(a => {
      const dept = a.department ? a.department.name : 'Unassigned';
      summary.byDepartment[dept] = (summary.byDepartment[dept] || 0) + 1;
    });

    return ResponseHandler.success(res, {
      reportType: 'Active Attachees',
      generatedAt: new Date(),
      summary,
      attachees,
    }, 'Active attachees report generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate attendance report
// @route   GET /api/reports/attendance
// @access  Private
exports.attendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await Attendance.find(query)
      .populate('attachee', 'firstName lastName studentId institution department')
      .sort({ date: -1 });

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      halfDay: records.filter(r => r.status === 'half-day').length,
      permission: records.filter(r => r.status === 'permission').length,
    };

    return ResponseHandler.success(res, {
      reportType: 'Attendance Report',
      generatedAt: new Date(),
      dateRange: { startDate, endDate },
      summary,
      records,
    }, 'Attendance report generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate evaluation report
// @route   GET /api/reports/evaluations
// @access  Private
exports.evaluationReport = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find()
      .populate('attachee', 'firstName lastName studentId institution')
      .populate('supervisor', 'name')
      .sort({ createdAt: -1 });

    const summary = {
      total: evaluations.length,
      byGrade: {},
      averageScore: 0,
    };

    let totalScore = 0;
    evaluations.forEach(e => {
      summary.byGrade[e.grade] = (summary.byGrade[e.grade] || 0) + 1;
      totalScore += e.averageScore || 0;
    });
    summary.averageScore = evaluations.length > 0 ? (totalScore / evaluations.length).toFixed(2) : 0;

    return ResponseHandler.success(res, {
      reportType: 'Evaluation Report',
      generatedAt: new Date(),
      summary,
      evaluations,
    }, 'Evaluation report generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate departmental placement report
// @route   GET /api/reports/departmental-placement
// @access  Private
exports.departmentalPlacementReport = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true });
    const report = [];

    for (const dept of departments) {
      const total = await Attachee.countDocuments({ department: dept._id });
      const active = await Attachee.countDocuments({ department: dept._id, status: 'active' });
      const completed = await Attachee.countDocuments({ department: dept._id, status: 'completed' });

      report.push({
        department: dept.name,
        code: dept.code,
        total,
        active,
        completed,
      });
    }

    const totalAll = report.reduce((sum, r) => sum + r.total, 0);
    const totalActive = report.reduce((sum, r) => sum + r.active, 0);

    return ResponseHandler.success(res, {
      reportType: 'Departmental Placement Report',
      generatedAt: new Date(),
      summary: { totalDepartments: departments.length, totalAll, totalActive },
      departments: report,
    }, 'Departmental placement report generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate completion report
// @route   GET /api/reports/completion
// @access  Private
exports.completionReport = async (req, res, next) => {
  try {
    const completed = await Attachee.find({ status: 'completed' })
      .populate('department', 'name code')
      .populate('supervisor', 'name')
      .sort({ updatedAt: -1 });

    const summary = {
      totalCompleted: completed.length,
      byDepartment: {},
    };

    completed.forEach(a => {
      const dept = a.department ? a.department.name : 'Unassigned';
      summary.byDepartment[dept] = (summary.byDepartment[dept] || 0) + 1;
    });

    return ResponseHandler.success(res, {
      reportType: 'Attachment Completion Report',
      generatedAt: new Date(),
      summary,
      completed,
    }, 'Completion report generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate supervisor workload report
// @route   GET /api/reports/supervisor-workload
// @access  Private
exports.supervisorWorkloadReport = async (req, res, next) => {
  try {
    const supervisors = await Supervisor.find({ isActive: true });
    const report = [];

    for (const sup of supervisors) {
      const total = await Attachee.countDocuments({ supervisor: sup._id });
      const active = await Attachee.countDocuments({ supervisor: sup._id, status: 'active' });

      report.push({
        supervisor: sup.name,
        email: sup.email,
        department: sup.department,
        totalAttachees: total,
        currentAttachees: active,
        capacity: sup.maxAttachees,
        utilization: sup.maxAttachees > 0 ? Math.round((active / sup.maxAttachees) * 100) : 0,
      });
    }

    return ResponseHandler.success(res, {
      reportType: 'Supervisor Workload Report',
      generatedAt: new Date(),
      summary: { totalSupervisors: supervisors.length },
      supervisors: report,
    }, 'Supervisor workload report generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Get attachee full report (single attachee)
// @route   GET /api/reports/attachee/:id
// @access  Private
exports.attacheeFullReport = async (req, res, next) => {
  try {
    const attachee = await Attachee.findById(req.params.id)
      .populate('department', 'name code')
      .populate('supervisor', 'name email phone')
      .populate('registeredBy', 'name');

    if (!attachee) return ResponseHandler.notFound(res, 'Attachee not found');

    const attendance = await Attendance.find({ attachee: req.params.id }).sort({ date: -1 });
    const evaluations = await Evaluation.find({ attachee: req.params.id })
      .populate('supervisor', 'name')
      .sort({ createdAt: -1 });
    const logbook = await Logbook.find({ attachee: req.params.id })
      .sort({ weekNumber: 1 });

    const attendanceSummary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
    };

    return ResponseHandler.success(res, {
      attachee,
      attendance: { summary: attendanceSummary, records: attendance },
      evaluations,
      logbook,
    }, 'Full attachee report generated');
  } catch (error) {
    next(error);
  }
};