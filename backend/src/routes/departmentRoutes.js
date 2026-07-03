const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Attachee = require('../models/Attachee');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const ResponseHandler = require('../utils/responseHandler');

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    return ResponseHandler.created(res, department, 'Department created successfully');
  } catch (error) {
    next(error);
  }
});

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
    
    const departments = await Department.find(query).sort({ name: 1 });
    
    // Get attachee count per department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const attacheeCount = await Attachee.countDocuments({ department: dept._id });
        return { ...dept.toObject(), currentAttachees: attacheeCount };
      })
    );

    return ResponseHandler.success(res, departmentsWithCount, 'Departments retrieved');
  } catch (error) {
    next(error);
  }
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return ResponseHandler.notFound(res, 'Department not found');

    const attacheeCount = await Attachee.countDocuments({ department: department._id });
    const attachees = await Attachee.find({ department: department._id })
      .populate('supervisor', 'name')
      .sort({ lastName: 1 });

    return ResponseHandler.success(res, {
      ...department.toObject(),
      currentAttachees: attacheeCount,
      attachees,
    }, 'Department retrieved');
  } catch (error) {
    next(error);
  }
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) return ResponseHandler.notFound(res, 'Department not found');
    return ResponseHandler.success(res, department, 'Department updated');
  } catch (error) {
    next(error);
  }
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return ResponseHandler.notFound(res, 'Department not found');
    return ResponseHandler.success(res, null, 'Department deleted');
  } catch (error) {
    next(error);
  }
});

module.exports = router;