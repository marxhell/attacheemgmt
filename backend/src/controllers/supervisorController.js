const Supervisor = require('../models/Supervisor');
const Attachee = require('../models/Attachee');
const User = require('../models/User');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Create supervisor
// @route   POST /api/supervisors
// @access  Private/Admin
exports.createSupervisor = async (req, res, next) => {
  try {
    const supervisor = await Supervisor.create(req.body);
    return ResponseHandler.created(res, supervisor, 'Supervisor created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all supervisors
// @route   GET /api/supervisors
// @access  Private
exports.getSupervisors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const total = await Supervisor.countDocuments(query);
    const supervisors = await Supervisor.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Get attachee count for each supervisor
    const supervisorsWithCount = await Promise.all(
      supervisors.map(async (supervisor) => {
        const attacheeCount = await Attachee.countDocuments({ supervisor: supervisor._id, status: 'active' });
        return { ...supervisor.toObject(), currentAttachees: attacheeCount };
      })
    );

    return ResponseHandler.paginated(res, supervisorsWithCount, total, page, limit, 'Supervisors retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single supervisor
// @route   GET /api/supervisors/:id
// @access  Private
exports.getSupervisor = async (req, res, next) => {
  try {
    const supervisor = await Supervisor.findById(req.params.id);
    if (!supervisor) return ResponseHandler.notFound(res, 'Supervisor not found');

    const attacheeCount = await Attachee.countDocuments({ supervisor: supervisor._id, status: 'active' });
    const attachees = await Attachee.find({ supervisor: supervisor._id })
      .populate('department', 'name code')
      .sort({ lastName: 1 });

    return ResponseHandler.success(res, {
      ...supervisor.toObject(),
      currentAttachees: attacheeCount,
      attachees,
    }, 'Supervisor retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update supervisor
// @route   PUT /api/supervisors/:id
// @access  Private/Admin
exports.updateSupervisor = async (req, res, next) => {
  try {
    const supervisor = await Supervisor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supervisor) return ResponseHandler.notFound(res, 'Supervisor not found');
    return ResponseHandler.success(res, supervisor, 'Supervisor updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supervisor
// @route   DELETE /api/supervisors/:id
// @access  Private/Admin
exports.deleteSupervisor = async (req, res, next) => {
  try {
    const supervisor = await Supervisor.findByIdAndDelete(req.params.id);
    if (!supervisor) return ResponseHandler.notFound(res, 'Supervisor not found');
    return ResponseHandler.success(res, null, 'Supervisor deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Get supervisor's assigned attachees
// @route   GET /api/supervisors/my-attachees
// @access  Private/Supervisor
exports.getMyAttachees = async (req, res, next) => {
  try {
    const supervisor = await Supervisor.findOne({ userId: req.user._id });
    if (!supervisor) return ResponseHandler.error(res, 'Supervisor profile not found', 404);

    const attachees = await Attachee.find({ supervisor: supervisor._id })
      .populate('department', 'name code')
      .sort({ lastName: 1 });

    return ResponseHandler.success(res, attachees, 'Your attachees retrieved');
  } catch (error) {
    next(error);
  }
};