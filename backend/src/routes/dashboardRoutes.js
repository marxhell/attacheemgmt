const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getStats,
  getRecentAttachees,
  getMonthlyRegistrations,
  getDepartmentDistribution,
} = require('../controllers/dashboardController');

router.get('/stats', protect, getStats);
router.get('/recent-attachees', protect, getRecentAttachees);
router.get('/monthly-registrations', protect, getMonthlyRegistrations);
router.get('/department-distribution', protect, getDepartmentDistribution);

module.exports = router;