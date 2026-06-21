const router = require('express').Router();
const Intake = require('../models/Intake');
const ActionPlan = require('../models/ActionPlan');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    // 1. Fetch latest intake
    const latestIntake = await Intake.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    
    // 2. Fetch current plan
    const currentPlan = await ActionPlan.findOne({ userId: req.user._id, isCurrent: true });

    // 3. Populate user bookmarks
    await req.user.populate('bookmarks');

    // Mapped response structure
    const activeSituation = latestIntake ? {
      situationId: latestIntake._id,
      problemType: latestIntake.problemType,
      city: latestIntake.city,
      hasRentalAgreement: latestIntake.hasRentalAgreement,
      urgencyLevel: latestIntake.urgencyLevel,
      customProblem: latestIntake.customProblem,
      createdAt: latestIntake.createdAt
    } : null;

    const checklistProgress = currentPlan ? {
      totalSteps: currentPlan.steps.length,
      completedSteps: currentPlan.steps.filter(s => s.isCompleted).length,
      steps: currentPlan.steps.map(s => ({
        stepNumber: s.stepNumber,
        isCompleted: s.isCompleted,
        text: s.text
      }))
    } : null;

    return res.status(200).json({
      success: true,
      activeSituation,
      checklistProgress,
      bookmarks: req.user.bookmarks
    });
  } catch (error) {
    console.error('Get Dashboard Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
