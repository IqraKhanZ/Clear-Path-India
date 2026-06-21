const ActionPlan = require('../models/ActionPlan');
const Intake = require('../models/Intake');
const aiService = require('../services/aiService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini for text calls
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

const callGeminiText = async (prompt) => {
  const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS) || 8000;
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  const apiCallPromise = (async () => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  })();

  return await Promise.race([apiCallPromise, timeoutPromise]);
};

const followUp = async (req, res) => {
  try {
    const { message, situationId } = req.body;
    if (!message || !situationId) {
      return res.status(400).json({ success: false, message: 'message and situationId are required' });
    }

    // 1. Fetch user's active ActionPlan
    const plan = await ActionPlan.findOne({ situationId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Action plan not found for this situation' });
    }

    // 2. Fetch the situation details
    const situation = await Intake.findById(situationId);
    if (!situation) {
      return res.status(404).json({ success: false, message: 'Situation details not found' });
    }

    // 3. Fetch relevant law text
    const { lawText } = await aiService.fetchRelevantLaw({
      problemType: situation.problemType,
      city: situation.city
    });

    // Mapped steps as numbered list
    const stepsList = plan.steps
      .map(step => `${step.stepNumber}. EN: ${step.text.en} | HI: ${step.text.hi}`)
      .join('\n');

    // Mapped user preferred language
    const userLang = req.user.preferredLanguage === 'hi' ? 'Hindi' : 'English';

    // 4. Build prompt
    const followUpPrompt = `You are ClearPath India's housing guidance assistant.
The user has already received their housing situation summary.
Their situation details:
- Problem Type: ${situation.problemType}
- City: ${situation.city}
- Rental Agreement: ${situation.hasRentalAgreement}
- Urgency: ${situation.urgencyLevel}
- Custom Details: ${situation.customProblem || 'None'}

Their current action plan steps:
${stepsList}

Relevant Indian housing law:
${lawText}

STRICT RULES:
- Never say 'you qualify' or 'this is illegal' — always say 'you may' or 'this may not be valid'
- Never give legal advice — always recommend consulting a legal aid centre
- Keep language at 8th grade reading level
- Hindi text must use simple everyday vocabulary, not legal jargon
- Answer ONLY the user's specific follow-up question
- Keep answer under 3 sentences
- Always end with: recommend consulting DLSA if this is urgent
- Respond in ${userLang} only (not bilingual — just the user's language)
- Respond as plain text, not JSON

User's follow-up question: ${message}`;

    // 5. Call Gemini
    const replyText = await callGeminiText(followUpPrompt);
    return res.status(200).json({ success: true, reply: replyText.trim() });

  } catch (error) {
    console.error('Follow-Up Chat Controller Error:', error.message);
    
    // 6. Generic Fallback
    const userLang = req.user && req.user.preferredLanguage === 'hi' ? 'hi' : 'en';
    const fallbackMessage = userLang === 'hi'
      ? "मैं अभी इसका उत्तर नहीं दे सकता। कृपया अपने निकटतम DLSA कार्यालय से संपर्क करें। हेल्पलाइन: 1516"
      : "I am not able to answer that right now. Please contact your nearest DLSA office for guidance. Helpline: 1516";
    
    return res.status(200).json({ success: false, reply: fallbackMessage });
  }
};

module.exports = {
  followUp
};
