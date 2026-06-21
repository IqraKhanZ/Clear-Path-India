const router = require('express').Router();
const planController = require('../controllers/planController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/generate', authMiddleware, planController.generatePlan);
router.get('/current', authMiddleware, planController.getCurrentPlan);
router.patch('/step/:stepNumber', authMiddleware, planController.updatePlanStep);

module.exports = router;
