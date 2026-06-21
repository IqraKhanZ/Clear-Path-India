const router = require('express').Router();
const Intake = require('../models/Intake');
const ActionPlan = require('../models/ActionPlan');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { problemType, city, hasRentalAgreement, urgencyLevel, customProblem } = req.body;
    
    // Create new intake record
    const intake = await Intake.create({
      userId: req.user._id,
      problemType,
      city,
      hasRentalAgreement,
      urgencyLevel,
      customProblem: customProblem || ''
    });

    return res.status(201).json({ success: true, situationId: intake._id });
  } catch (error) {
    console.error('Create Intake Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    // Clear current plans and intakes for the user
    await ActionPlan.updateMany({ userId: req.user._id }, { isCurrent: false });
    await Intake.deleteMany({ userId: req.user._id });
    
    return res.status(200).json({ success: true, message: 'Active situation cleared successfully' });
  } catch (error) {
    console.error('Clear Intake Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
