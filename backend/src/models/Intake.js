const mongoose = require('mongoose');

const IntakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemType: { type: String, required: true },
  city: { type: String, required: true },
  hasRentalAgreement: { type: String, required: true },
  urgencyLevel: { type: String, required: true },
  customProblem: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Intake', IntakeSchema);
