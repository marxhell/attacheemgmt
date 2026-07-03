const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  getAttendanceStats,
  getAttacheeAttendanceSummary,
} = require('../controllers/attendanceController');

router.get('/stats', protect, getAttendanceStats);
router.get('/summary/:attacheeId', protect, getAttacheeAttendanceSummary);

router.route('/')
  .post(protect, markAttendance)
  .get(protect, getAttendance);

router.route('/:id')
  .get(protect, getAttendanceById)
  .put(protect, updateAttendance);

module.exports = router;