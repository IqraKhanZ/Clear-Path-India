const mongoose = require('mongoose');

const ActionPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  situationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intake', required: true },
  interpretation: {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  steps: [{
    stepNumber: { type: Number, required: true },
    text: {
      en: { type: String, required: true },
      hi: { type: String, required: true }
    },
    isCompleted: { type: Boolean, default: false }
  }],
  relevantLaw: {
    name: {
      en: { type: String, required: true },
      hi: { type: String, required: true }
    },
    sourceUrl: { type: String, required: true }
  },
  options: [{
    title: {
      en: { type: String, required: true },
      hi: { type: String, required: true }
    },
    description: {
      en: { type: String, required: true },
      hi: { type: String, required: true }
    },
    ctaLabel: {
      en: { type: String, required: true },
      hi: { type: String, required: true }
    },
    ctaUrl: { type: String, required: true }
  }],
  additionalSources: [{ type: String }],
  isCurrent: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ActionPlan', ActionPlanSchema);
