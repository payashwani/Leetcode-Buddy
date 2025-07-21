const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working!' });
});


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, authController.changePassword);

module.exports = router;