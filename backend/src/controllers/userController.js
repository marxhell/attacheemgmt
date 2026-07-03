const User = require('../models/User');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ name: 1 }).skip(skip).limit(limit);

    return ResponseHandler.paginated(res, users, total, page, limit, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return ResponseHandler.notFound(res, 'User not found');
    return ResponseHandler.success(res, user, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, phone, department, designation, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, department, designation, isActive },
      { new: true, runValidators: true }
    );
    if (!user) return ResponseHandler.notFound(res, 'User not found');
    return ResponseHandler.success(res, user, 'User updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return ResponseHandler.notFound(res, 'User not found');
    return ResponseHandler.success(res, null, 'User deleted');
  } catch (error) {
    next(error);
  }
};