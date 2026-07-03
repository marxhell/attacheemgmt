const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  createSupervisor,
  getSupervisors,
  getSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getMyAttachees,
} = require('../controllers/supervisorController');

router.get('/my-attachees', protect, authorize('supervisor'), getMyAttachees);

router.route('/')
  .post(protect, authorize('admin'), createSupervisor)
  .get(protect, getSupervisors);

router.route('/:id')
  .get(protect, getSupervisor)
  .put(protect, authorize('admin'), updateSupervisor)
  .delete(protect, authorize('admin'), deleteSupervisor);

module.exports = router;