const Evaluation = require('../models/Evaluation');
const Attachee = require('../models/Attachee');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Create evaluation
// @route   POST /api/evaluations
// @access  Private/Supervisor
exports.createEvaluation = async (req, res, next) => {
  try {
    const supervisor = await require('../models/Supervisor').findOne({ userId: req.user._id });
    if (!supervisor) return ResponseHandler.error(res, 'Supervisor profile not found', 404);

    req.body.supervisor = supervisor._id;
    const evaluation = await Evaluation.create(req.body);

    const populated = await Evaluation.findById(evaluation._id)
      .populate('attachee', 'firstName lastName studentId institution')
      .populate('supervisor', 'name');

    return ResponseHandler.created(res, populated, 'Evaluation created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all evaluations
// @route   GET /api/evaluations
// @access  Private
exports.getEvaluations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.attachee) query.attachee = req.query.attachee;
    if (req.query.evaluationType) query.evaluationType = req.query.evaluationType;
    if (req.query.status) query.status = req.query.status;

    if (req.user.role === 'supervisor') {
      const supervisor = await require('../models/Supervisor').findOne({ userId: req.user._id });
      if (supervisor) query.supervisor = supervisor._id;
    }

    const total = await Evaluation.countDocuments(query);
    const evaluations = await Evaluation.find(query)
      .populate('attachee', 'firstName lastName studentId institution')
      .populate('supervisor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return ResponseHandler.paginated(res, evaluations, total, page, limit, 'Evaluations retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single evaluation
// @route   GET /api/evaluations/:id
// @access  Private
exports.getEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('attachee', 'firstName lastName studentId institution department')
      .populate('supervisor', 'name email phone');
    
    if (!evaluation) return ResponseHandler.notFound(res, 'Evaluation not found');
    return ResponseHandler.success(res, evaluation, 'Evaluation retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
// @access  Private/Supervisor
exports.updateEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('attachee', 'firstName lastName studentId');

    if (!evaluation) return ResponseHandler.notFound(res, 'Evaluation not found');
    return ResponseHandler.success(res, evaluation, 'Evaluation updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete evaluation
// @route   DELETE /api/evaluations/:id
// @access  Private/Admin
exports.deleteEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) return ResponseHandler.notFound(res, 'Evaluation not found');
    return ResponseHandler.success(res, null, 'Evaluation deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Get evaluation stats
// @route   GET /api/evaluations/stats
// @access  Private
exports.getEvaluationStats = async (req, res, next) => {
  try {
    const total = await Evaluation.countDocuments();
    const byGrade = await Evaluation.aggregate([
      { $group: { _id: '$grade', count: { $sum: 1 } } },
    ]);
    const byType = await Evaluation.aggregate([
      { $group: { _id: '$evaluationType', count: { $sum: 1 } } },
    ]);
    const averageScore = await Evaluation.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$averageScore' } } },
    ]);

    return ResponseHandler.success(res, {
      total,
      byGrade,
      byType,
      averageScore: averageScore.length > 0 ? averageScore[0].avgScore : 0,
    }, 'Evaluation stats retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get attachee evaluations
// @route   GET /api/evaluations/attachee/:attacheeId
// @access  Private
exports.getAttacheeEvaluations = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({ attachee: req.params.attacheeId })
      .populate('supervisor', 'name')
      .sort({ createdAt: -1 });

    return ResponseHandler.success(res, evaluations, 'Attachee evaluations retrieved');
  } catch (error) {
    next(error);
  }
};