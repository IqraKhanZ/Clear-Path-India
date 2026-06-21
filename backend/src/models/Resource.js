const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g. 'rights', 'scheme'
  title: {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  sourceUrl: { type: String, required: true },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
