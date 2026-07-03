const express = require('express');
const router = express.Router();
const { register, login, getMe, updateDetails, updatePassword, studentRegister, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { registerValidator, loginValidator } = require('../utils/validators');

router.post('/register', protect, authorize('admin'), registerValidator, validate, register);
router.post('/student-register', studentRegister);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/logout', protect, logout);

module.exports = router;
