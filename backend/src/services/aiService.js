const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resource = require('../models/Resource');
const planMatcher = require('./planMatcher');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

// Function 1: fetchRelevantLaw
async function fetchRelevantLaw(answers) {
  const { problemType, city } = answers;
  
  // Tag query: contains city (lowercase) AND problemType
  let matchedDocs = [];
  if (city) {
    matchedDocs = await Resource.find({
      tags: { $all: [city.toLowerCase(), problemType] },
      isActive: true
    });
  }

  // If no city-specific match, fall back to national tags
  if (matchedDocs.length === 0) {
    matchedDocs = await Resource.find({
      tags: { $all: [problemType] },
      isActive: true
    });
  }

  // If still empty, fall back to general national tags ('mta' or 'nalsa')
  if (matchedDocs.length === 0) {
    matchedDocs = await Resource.find({
      tags: { $in: ['mta', 'nalsa', 'national'] },
      isActive: true
    });
  }

  const lawText = matchedDocs.map(doc => doc.description.en).join('\n\n');
  const additionalSources = [...new Set(matchedDocs.map(doc => doc.sourceUrl).filter(Boolean))];

  return { lawText, additionalSources };
}

// Function 2: buildPrompt
function buildPrompt(answers, relevantLawText, additionalSources) {
  const sourceUrlsStr = additionalSources.length > 0 ? additionalSources.join(', ') : 'https://indiacode.nic.in';

  return `SYSTEM:
"You are ClearPath India's housing guidance assistant. You help renters in India understand their housing situation in plain, simple language.

STRICT RULES:
- Never say 'you qualify' or 'this is illegal' — always say 'you may' or 'this may not be valid'
- Never give legal advice — always recommend consulting a legal aid centre
- Keep language at 8th grade reading level
- Hindi text must use simple everyday vocabulary, not legal jargon
- Always respond ONLY in the exact JSON format specified below
- Do not add any text before or after the JSON
- The 'hi' fields must contain Devanagari script

USER SITUATION:
- Problem Type: ${answers.problemType}
- City: ${answers.city}
- Has Written Rental Agreement: ${answers.hasRentalAgreement}
- Urgency Level: ${answers.urgencyLevel}
${answers.customProblem ? '- Additional Details: ' + answers.customProblem : ''}

RELEVANT INDIAN HOUSING LAW CONTEXT:
${relevantLawText}

SOURCE URLS FOR THIS LAW:
${sourceUrlsStr}

Respond ONLY in this exact JSON format — no preamble, no markdown:
{
  "interpretation": { "en": "2-3 sentences explaining what this situation means for the user in plain language", "hi": "same in Hindi" },
  "steps": [
    { "stepNumber": 1, "text": { "en": "first action step", "hi": "same in Hindi" } },
    { "stepNumber": 2, "text": { "en": "second action step", "hi": "same in Hindi" } },
    { "stepNumber": 3, "text": { "en": "third action step", "hi": "same in Hindi" } },
    { "stepNumber": 4, "text": { "en": "fourth action step — always recommend DLSA or legal aid", "hi": "same in Hindi" } }
  ],
  "relevantLaw": {
    "name": { "en": "name of the applicable act", "hi": "same in Hindi" },
    "sourceUrl": "URL from the law context above"
  },
  "options": [
    { "title": { "en": "...", "hi": "..." }, "description": { "en": "...", "hi": "..." }, "ctaLabel": { "en": "...", "hi": "..." }, "ctaUrl": "..." }
  ]
}"`;
}

// Function 3: validateGeminiResponse
function validateGeminiResponse(parsed) {
  if (!parsed) return { valid: false, reason: 'Parsed object is empty' };

  // Check interpretation
  if (!parsed.interpretation || !parsed.interpretation.en || !parsed.interpretation.hi) {
    return { valid: false, reason: 'Missing interpretation fields' };
  }

  // Check steps array
  if (!Array.isArray(parsed.steps) || parsed.steps.length < 3) {
    return { valid: false, reason: 'Steps must be an array of at least 3 steps' };
  }

  // Check each step fields and Devanagari Hindi text
  const devanagariRegex = /[\u0900-\u097F]/;
  for (const step of parsed.steps) {
    if (typeof step.stepNumber !== 'number' || !step.text || !step.text.en || !step.text.hi) {
      return { valid: false, reason: `Step is malformed: ${JSON.stringify(step)}` };
    }
    if (!devanagariRegex.test(step.text.hi)) {
      return { valid: false, reason: `Step text in Hindi lacks Devanagari characters: ${step.text.hi}` };
    }
  }

  // Check relevantLaw
  if (!parsed.relevantLaw || !parsed.relevantLaw.name || !parsed.relevantLaw.name.en || !parsed.relevantLaw.sourceUrl) {
    return { valid: false, reason: 'Missing relevantLaw fields' };
  }

  // Check options
  if (!Array.isArray(parsed.options) || parsed.options.length < 1) {
    return { valid: false, reason: 'Options must have at least 1 option' };
  }

  return { valid: true };
}

// Function 4: callGemini
async function callGemini(prompt) {
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

  const responseText = await Promise.race([apiCallPromise, timeoutPromise]);

  // Strip accidental markdown code fences
  let cleanText = responseText.trim();
  if (cleanText.startsWith('```')) {
    // Remove starting line (like ```json or ```)
    cleanText = cleanText.replace(/^```[a-zA-Z]*\n/, '');
    // Remove ending ```
    cleanText = cleanText.replace(/\n```$/, '');
    cleanText = cleanText.trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleanText);
  } catch (err) {
    return { success: false, raw: responseText, reason: 'JSON parsing failed' };
  }

  const validation = validateGeminiResponse(parsed);
  if (!validation.valid) {
    return { success: false, reason: validation.reason, raw: responseText };
  }

  return { success: true, data: parsed };
}

// Function 5: generatePlan
async function generatePlan(answers) {
  try {
    // Step 1: Call fetchRelevantLaw
    const { lawText, additionalSources } = await fetchRelevantLaw(answers);
    
    // Step 2: Build prompt
    const prompt = buildPrompt(answers, lawText, additionalSources);
    
    // Step 3: Call callGemini
    const result = await callGemini(prompt);
    
    if (result.success) {
      return {
        ...result.data,
        additionalSources,
        source: 'ai'
      };
    } else {
      console.warn('Gemini response validation or parse failed:', result.reason);
    }
  } catch (error) {
    console.error('Gemini generatePlan error:', error.message);
  }

  // Fallback
  console.log('Falling back to rule-based planMatcher...');
  const fallbackPlan = planMatcher.matchPlan(answers);
  return {
    ...fallbackPlan,
    source: 'fallback'
  };
}

module.exports = {
  fetchRelevantLaw,
  generatePlan,
  buildPrompt,
  callGemini,
  validateGeminiResponse
};
