const Intake = require('../models/Intake');
const ActionPlan = require('../models/ActionPlan');
const aiService = require('../services/aiService');

// Transformer utility to map DB bilingual schema to frontend localized schema
const transformPlan = (plan, lang) => {
  if (!plan) return null;
  
  const interpretationStr = plan.interpretation[lang] || plan.interpretation.en;
  
  const actionPlan = plan.steps.map(step => ({
    stepNumber: step.stepNumber,
    id: step.stepNumber.toString(),
    text: step.text[lang] || step.text.en,
    completed: step.isCompleted
  }));
  
  const sourceTitle = plan.relevantLaw.name[lang] || plan.relevantLaw.name.en;
  const source = {
    title: sourceTitle,
    description: `The ${sourceTitle} regulates the relationship between landlords and tenants. It outlines tenant rights, protects tenants against arbitrary rent increases, provides safeguards against illegal evictions without a court decree, and details the responsibilities for building repairs.`,
    sourceUrl: plan.relevantLaw.sourceUrl
  };
  
  const options = plan.options.map(opt => ({
    id: opt._id ? opt._id.toString() : opt.title.en.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    title: opt.title[lang] || opt.title.en,
    description: opt.description[lang] || opt.description.en,
    cta: opt.ctaLabel[lang] || opt.ctaLabel.en,
    ctaType: opt.ctaUrl === '/help' ? 'help' : (opt.ctaUrl === '/resources' ? 'resources' : 'details'),
    ctaUrl: opt.ctaUrl
  }));

  return {
    _id: plan._id,
    userId: plan.userId,
    situationId: plan.situationId,
    interpretation: interpretationStr,
    actionPlan,
    source,
    options,
    relevantLaw: {
      name: plan.relevantLaw.name,
      sourceUrl: plan.relevantLaw.sourceUrl
    },
    additionalSources: plan.additionalSources || [plan.relevantLaw.sourceUrl],
    isCurrent: plan.isCurrent,
    createdAt: plan.createdAt
  };
};

const generatePlan = async (req, res) => {
  const start = Date.now();
  try {
    const { situationId } = req.body;
    if (!situationId) {
      return res.status(400).json({ success: false, message: 'situationId is required' });
    }

    // Fetch user intake
    const intake = await Intake.findById(situationId);
    if (!intake) {
      return res.status(404).json({ success: false, message: 'Intake situation not found' });
    }

    // Call AI service to generate plan
    const planData = await aiService.generatePlan({
      problemType: intake.problemType,
      city: intake.city,
      hasRentalAgreement: intake.hasRentalAgreement,
      urgencyLevel: intake.urgencyLevel,
      customProblem: intake.customProblem
    });

    const source = planData.source; // 'ai' or 'fallback'

    // Mark previous plans for this user as not current
    await ActionPlan.updateMany({ userId: req.user._id }, { isCurrent: false });

    // Save new plan in database
    const newPlan = await ActionPlan.create({
      userId: req.user._id,
      situationId: intake._id,
      interpretation: planData.interpretation,
      steps: planData.steps,
      relevantLaw: planData.relevantLaw,
      options: planData.options,
      additionalSources: planData.additionalSources,
      isCurrent: true
    });

    // Logging timing
    console.log(`Plan generated in ${Date.now() - start}ms, source: ${source}`);

    // Transform and return to user
    const userLang = req.query.lang || req.user.preferredLanguage || 'en';
    const frontendPlan = transformPlan(newPlan, userLang);

    return res.status(200).json(frontendPlan);
  } catch (error) {
    console.error('Plan Generation Controller Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCurrentPlan = async (req, res) => {
  try {
    const plan = await ActionPlan.findOne({ userId: req.user._id, isCurrent: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'No active plan found' });
    }
    const userLang = req.query.lang || req.user.preferredLanguage || 'en';
    const frontendPlan = transformPlan(plan, userLang);
    return res.status(200).json(frontendPlan);
  } catch (error) {
    console.error('Get Current Plan Controller Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updatePlanStep = async (req, res) => {
  try {
    const { stepNumber } = req.params;
    const { isCompleted } = req.body;

    const plan = await ActionPlan.findOne({ userId: req.user._id, isCurrent: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'No active plan found' });
    }

    // Find step and update it
    const step = plan.steps.find(s => s.stepNumber === parseInt(stepNumber));
    if (!step) {
      return res.status(404).json({ success: false, message: 'Step number not found in plan' });
    }

    step.isCompleted = isCompleted === true;
    await plan.save();

    const userLang = req.query.lang || req.user.preferredLanguage || 'en';
    const frontendPlan = transformPlan(plan, userLang);

    return res.status(200).json({ success: true, plan: frontendPlan });
  } catch (error) {
    console.error('Update Plan Step Controller Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generatePlan,
  getCurrentPlan,
  updatePlanStep
};
