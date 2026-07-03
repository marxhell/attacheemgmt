const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  submitEntry,
  reviewEntry,
  getAttacheeLogbookSummary,
} = require('../controllers/logbookController');

router.get('/summary/:attacheeId', protect, getAttacheeLogbookSummary);
router.put('/:id/submit', protect, submitEntry);
router.put('/:id/review', protect, authorize('supervisor', 'admin'), reviewEntry);

router.route('/')
  .post(protect, createEntry)
  .get(protect, getEntries);

router.route('/:id')
  .get(protect, getEntry)
  .put(protect, updateEntry)
  .delete(protect, authorize('admin'), deleteEntry);

module.exports = router;