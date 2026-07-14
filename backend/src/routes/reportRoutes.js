const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  activeAttacheesReport,
  departmentalPlacementReport,
  completionReport,
  supervisorWorkloadReport,
  attacheeFullReport,
} = require('../controllers/reportController');

router.get('/active-attachees', protect, activeAttacheesReport);
router.get('/departmental-placement', protect, departmentalPlacementReport);
router.get('/completion', protect, completionReport);
router.get('/supervisor-workload', protect, authorize('admin', 'hr', 'director'), supervisorWorkloadReport);
router.get('/attachee/:id', protect, attacheeFullReport);

module.exports = router;