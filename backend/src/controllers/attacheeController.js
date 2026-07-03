const Attachee = require('../models/Attachee');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Register a new attachee
// @route   POST /api/attachees
// @access  Private/Admin/HR
exports.registerAttachee = async (req, res, next) => {
  try {
    req.body.registeredBy = req.user._id;
    const attachee = await Attachee.create(req.body);
    return ResponseHandler.created(res, attachee, 'Attachee registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attachees
// @route   GET /api/attachees
// @access  Private
exports.getAttachees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by department
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Filter by supervisor
    if (req.query.supervisor) {
      query.supervisor = req.query.supervisor;
    }

    // Search by name, institution, or student ID
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { institution: searchRegex },
        { studentId: searchRegex },
        { nationalId: searchRegex },
      ];
    }

    // Supervisor can only see their assigned attachees
    if (req.user.role === 'supervisor') {
      const supervisor = await require('../models/Supervisor').findOne({ userId: req.user._id });
      if (supervisor) {
        query.supervisor = supervisor._id;
      }
    }

    const total = await Attachee.countDocuments(query);
    const attachees = await Attachee.find(query)
      .populate('department', 'name code')
      .populate('supervisor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return ResponseHandler.paginated(res, attachees, total, page, limit, 'Attachees retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attachee
// @route   GET /api/attachees/:id
// @access  Private
exports.getAttachee = async (req, res, next) => {
  try {
    const attachee = await Attachee.findById(req.params.id)
      .populate('department', 'name code')
      .populate('supervisor', 'name email phone')
      .populate('registeredBy', 'name email');

    if (!attachee) {
      return ResponseHandler.notFound(res, 'Attachee not found');
    }

    return ResponseHandler.success(res, attachee, 'Attachee retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update attachee
// @route   PUT /api/attachees/:id
// @access  Private/Admin/HR
exports.updateAttachee = async (req, res, next) => {
  try {
    const attachee = await Attachee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!attachee) {
      return ResponseHandler.notFound(res, 'Attachee not found');
    }

    return ResponseHandler.success(res, attachee, 'Attachee updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attachee
// @route   DELETE /api/attachees/:id
// @access  Private/Admin
exports.deleteAttachee = async (req, res, next) => {
  try {
    const attachee = await Attachee.findByIdAndDelete(req.params.id);

    if (!attachee) {
      return ResponseHandler.notFound(res, 'Attachee not found');
    }

    return ResponseHandler.success(res, null, 'Attachee deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Assign department to attachee
// @route   PUT /api/attachees/:id/assign-department
// @access  Private/Admin/HR
exports.assignDepartment = async (req, res, next) => {
  try {
    const { department } = req.body;

    const attachee = await Attachee.findByIdAndUpdate(
      req.params.id,
      { department, status: 'active' },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!attachee) {
      return ResponseHandler.notFound(res, 'Attachee not found');
    }

    return ResponseHandler.success(res, attachee, 'Department assigned successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Assign supervisor to attachee
// @route   PUT /api/attachees/:id/assign-supervisor
// @access  Private/Admin/HR
exports.assignSupervisor = async (req, res, next) => {
  try {
    const { supervisor } = req.body;

    const attachee = await Attachee.findByIdAndUpdate(
      req.params.id,
      { supervisor },
      { new: true, runValidators: true }
    ).populate('supervisor', 'name email phone');

    if (!attachee) {
      return ResponseHandler.notFound(res, 'Attachee not found');
    }

    return ResponseHandler.success(res, attachee, 'Supervisor assigned successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update attachee status
// @route   PUT /api/attachees/:id/status
// @access  Private/Admin/HR
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const attachee = await Attachee.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!attachee) {
      return ResponseHandler.notFound(res, 'Attachee not found');
    }

    return ResponseHandler.success(res, attachee, `Attachee status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attachee count by status
// @route   GET /api/attachees/stats/counts
// @access  Private
exports.getAttacheeStats = async (req, res, next) => {
  try {
    const stats = await Attachee.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Attachee.countDocuments();
    
    const formattedStats = {
      total,
      pending: 0,
      active: 0,
      completed: 0,
      terminated: 0,
      extended: 0,
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    return ResponseHandler.success(res, formattedStats, 'Attachee stats retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Upload attachee documents
// @route   POST /api/attachees/:id/documents
// @access  Private
exports.uploadDocuments = async (req, res, next) => {
  try {
    const attachee = await Attachee.findById(req.params.id);
    if (!attachee) {
      return ResponseHandler.notFound(res, 'Attachee not found');
    }

    const documents = {};
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        documents[key] = req.files[key][0].path;
      });
    }

    if (Object.keys(documents).length > 0) {
      attachee.documents = { ...attachee.documents, ...documents };
      await attachee.save();
    }

    return ResponseHandler.success(res, attachee, 'Documents uploaded successfully');
  } catch (error) {
    next(error);
  }
};