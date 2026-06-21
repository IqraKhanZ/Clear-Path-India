const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  preferredLanguage: { type: String, default: 'en' },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
