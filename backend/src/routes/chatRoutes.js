const router = require('express').Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/followup', authMiddleware, chatController.followUp);

module.exports = router;
