const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { saveProblem, getProblems, deleteProblem, getAIRecap } = require('../controllers/problemController');

console.log('Registering problem routes');

router.post('/', auth, saveProblem);
router.get('/', auth, getProblems);
router.delete('/:id', auth, deleteProblem);
router.get('/ai-recap', auth, getAIRecap);

module.exports = router;