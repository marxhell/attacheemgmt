const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../config/multer');

const {
  registerAttachee,
  getAttachees,
  getAttachee,
  updateAttachee,
  deleteAttachee,
  assignDepartment,
  assignSupervisor,
  updateStatus,
  getAttacheeStats,
  uploadDocuments,
} = require('../controllers/attacheeController');

const attacheeRoutes = () => {
  // Stats route must come before /:id routes
  router.get('/stats/counts', protect, getAttacheeStats);

  router.route('/')
    .post(protect, authorize('admin', 'hr'), registerAttachee)
    .get(protect, getAttachees);

  router.route('/:id')
    .get(protect, getAttachee)
    .put(protect, authorize('admin', 'hr'), updateAttachee)
    .delete(protect, authorize('admin'), deleteAttachee);

  router.put('/:id/assign-department', protect, authorize('admin', 'hr'), assignDepartment);
  router.put('/:id/assign-supervisor', protect, authorize('admin', 'hr'), assignSupervisor);
  router.put('/:id/status', protect, authorize('admin', 'hr'), updateStatus);

  router.post('/:id/documents', protect, upload.fields([
    { name: 'studentIdUpload', maxCount: 1 },
    { name: 'nationalIdUpload', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'schoolLetter', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
  ]), uploadDocuments);

  return router;
};

module.exports = attacheeRoutes;