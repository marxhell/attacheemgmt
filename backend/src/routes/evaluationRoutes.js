const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  createEvaluation,
  getEvaluations,
  getEvaluation,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationStats,
  getAttacheeEvaluations,
} = require('../controllers/evaluationController');

router.get('/stats', protect, getEvaluationStats);
router.get('/attachee/:attacheeId', protect, getAttacheeEvaluations);

router.route('/')
  .post(protect, authorize('supervisor', 'admin'), createEvaluation)
  .get(protect, getEvaluations);

router.route('/:id')
  .get(protect, getEvaluation)
  .put(protect, authorize('supervisor', 'admin'), updateEvaluation)
  .delete(protect, authorize('admin'), deleteEvaluation);

module.exports = router;