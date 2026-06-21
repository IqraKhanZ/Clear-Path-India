const router = require('express').Router();
const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/verify', async (req, res) => {
  try {
    const { firebaseToken, preferredLanguage } = req.body;
    if (!firebaseToken) {
      return res.status(400).json({ success: false, message: 'firebaseToken is required' });
    }

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    
    // Find or create user
    let user = await User.findOne({ uid: decodedToken.uid });
    if (!user) {
      user = await User.create({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        preferredLanguage: preferredLanguage || 'en'
      });
    } else if (preferredLanguage) {
      user.preferredLanguage = preferredLanguage;
      await user.save();
    }

    // Set secure httpOnly cookie
    res.cookie('firebaseToken', firebaseToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      path: '/'
    });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Verify Auth Error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

router.post('/logout', authMiddleware, (req, res) => {
  res.clearCookie('firebaseToken', { path: '/' });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
});

router.patch('/language', authMiddleware, async (req, res) => {
  try {
    const { language } = req.body;
    if (!language) {
      return res.status(400).json({ success: false, message: 'language is required' });
    }
    req.user.preferredLanguage = language;
    await req.user.save();
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.error('Update Language Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
