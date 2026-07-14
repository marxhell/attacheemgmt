const Attachee = require('../models/Attachee');
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

    return ResponseHandler.success(res, {
      attachee,
    }, 'Full attachee report generated');
  } catch (error) {
    next(error);
  }
};
