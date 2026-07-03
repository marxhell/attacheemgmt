const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department, designation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.error(res, 'User with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'supervisor',
      phone,
      department,
      designation,
    });

    const token = generateToken(user._id);

    return ResponseHandler.created(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      token,
    }, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ResponseHandler.error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ResponseHandler.error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return ResponseHandler.error(res, 'Account deactivated, contact administrator', 401);
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return ResponseHandler.success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      token,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return ResponseHandler.success(res, user, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      department: req.body.department,
      designation: req.body.designation,
    };

    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    return ResponseHandler.success(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return ResponseHandler.error(res, 'Current password is incorrect', 401);
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    return ResponseHandler.success(res, { token }, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Student self-registration
// @route   POST /api/auth/student-register
// @access  Public
exports.studentRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.error(res, 'User with this email already exists', 400);
    }

    // Create user account with student role
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      phone,
    });

    // Also create attachee record
    const Attachee = require('../models/Attachee');
    const attachee = await Attachee.create({
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || name.split(' ')[0],
      email,
      phone: phone || '',
      nationalId: req.body.nationalId || '',
      institution: req.body.institution || '',
      course: req.body.course || '',
      studentId: req.body.studentId || '',
      attachmentStartDate: req.body.attachmentStartDate || new Date(),
      attachmentEndDate: req.body.attachmentEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    const token = generateToken(user._id);

    return ResponseHandler.created(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      attacheeId: attachee._id,
      token,
    }, 'Student registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    return ResponseHandler.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};
