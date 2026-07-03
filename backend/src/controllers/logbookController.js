const Logbook = require('../models/Logbook');
const Attachee = require('../models/Attachee');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Create logbook entry
// @route   POST /api/logbook
// @access  Private
exports.createEntry = async (req, res, next) => {
  try {
    const entry = await Logbook.create(req.body);
    const populated = await Logbook.findById(entry._id)
      .populate('attachee', 'firstName lastName studentId');
    return ResponseHandler.created(res, populated, 'Logbook entry created');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all logbook entries
// @route   GET /api/logbook
// @access  Private
exports.getEntries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.attachee) query.attachee = req.query.attachee;
    if (req.query.status) query.status = req.query.status;
    if (req.query.weekNumber) query.weekNumber = parseInt(req.query.weekNumber);

    if (req.user.role === 'supervisor') {
      const supervisor = await require('../models/Supervisor').findOne({ userId: req.user._id });
      if (supervisor) {
        const attachees = await Attachee.find({ supervisor: supervisor._id }).select('_id');
        query.attachee = { $in: attachees.map(a => a._id) };
      }
    }

    const total = await Logbook.countDocuments(query);
    const entries = await Logbook.find(query)
      .populate('attachee', 'firstName lastName studentId institution')
      .populate('reviewedBy', 'name')
      .sort({ weekNumber: -1, date: -1 })
      .skip(skip)
      .limit(limit);

    return ResponseHandler.paginated(res, entries, total, page, limit, 'Logbook entries retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single logbook entry
// @route   GET /api/logbook/:id
// @access  Private
exports.getEntry = async (req, res, next) => {
  try {
    const entry = await Logbook.findById(req.params.id)
      .populate('attachee', 'firstName lastName studentId institution')
      .populate('reviewedBy', 'name');
    if (!entry) return ResponseHandler.notFound(res, 'Logbook entry not found');
    return ResponseHandler.success(res, entry, 'Logbook entry retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update logbook entry
// @route   PUT /api/logbook/:id
// @access  Private
exports.updateEntry = async (req, res, next) => {
  try {
    const entry = await Logbook.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('attachee', 'firstName lastName studentId');
    if (!entry) return ResponseHandler.notFound(res, 'Logbook entry not found');
    return ResponseHandler.success(res, entry, 'Logbook entry updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete logbook entry
// @route   DELETE /api/logbook/:id
// @access  Private/Admin
exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = await Logbook.findByIdAndDelete(req.params.id);
    if (!entry) return ResponseHandler.notFound(res, 'Logbook entry not found');
    return ResponseHandler.success(res, null, 'Logbook entry deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Submit logbook entry for review
// @route   PUT /api/logbook/:id/submit
// @access  Private
exports.submitEntry = async (req, res, next) => {
  try {
    const entry = await Logbook.findByIdAndUpdate(
      req.params.id,
      { status: 'submitted', submittedAt: Date.now() },
      { new: true }
    );
    if (!entry) return ResponseHandler.notFound(res, 'Logbook entry not found');
    return ResponseHandler.success(res, entry, 'Logbook entry submitted for review');
  } catch (error) {
    next(error);
  }
};

// @desc    Review logbook entry
// @route   PUT /api/logbook/:id/review
// @access  Private/Supervisor
exports.reviewEntry = async (req, res, next) => {
  try {
    const { status, supervisorComment } = req.body;
    const entry = await Logbook.findByIdAndUpdate(
      req.params.id,
      {
        status,
        supervisorComment,
        reviewedBy: req.user._id,
        reviewedAt: Date.now(),
      },
      { new: true }
    ).populate('attachee', 'firstName lastName studentId');
    if (!entry) return ResponseHandler.notFound(res, 'Logbook entry not found');
    return ResponseHandler.success(res, entry, `Logbook entry ${status}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attachee logbook summary
// @route   GET /api/logbook/summary/:attacheeId
// @access  Private
exports.getAttacheeLogbookSummary = async (req, res, next) => {
  try {
    const entries = await Logbook.find({ attachee: req.params.attacheeId })
      .sort({ weekNumber: 1 });
    
    const total = entries.length;
    const submitted = entries.filter(e => e.status === 'submitted').length;
    const approved = entries.filter(e => e.status === 'approved').length;
    const reviewed = entries.filter(e => e.status === 'reviewed').length;

    return ResponseHandler.success(res, {
      total,
      submitted,
      approved,
      reviewed,
      entries,
    }, 'Logbook summary retrieved');
  } catch (error) {
    next(error);
  }
};