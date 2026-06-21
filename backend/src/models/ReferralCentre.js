const mongoose = require('mongoose');

const ReferralCentreSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phone: { type: String },
  additionalPhone: { type: String },
  website: { type: String },
  address: {
    en: { type: String },
    hi: { type: String }
  },
  type: { type: String, required: true }, // 'legal_aid' or 'ngo'
  isVerified: { type: Boolean, default: true },
  sourceUrl: { type: String },
  note: {
    en: { type: String },
    hi: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('ReferralCentre', ReferralCentreSchema);
