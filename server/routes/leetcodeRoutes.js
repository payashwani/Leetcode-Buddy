const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAIHelp } = require('../controllers/leetcodeController');
const leetcodeController = require('../controllers/leetcodeController'); // ✅ Required import

router.get('/ai-help', auth, leetcodeController.getAIHelp); // ✅ Now this works

module.exports = router;


