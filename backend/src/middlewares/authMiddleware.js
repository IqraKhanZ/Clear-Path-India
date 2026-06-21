const admin = require('../config/firebaseAdmin');
const User = require('../models/User');

const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
};

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // Check authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split('Bearer ')[1];
    } else {
      // Check cookies
      const cookies = parseCookies(req.headers.cookie);
      token = cookies.firebaseToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or create user in database
    let user = await User.findOne({ uid: decodedToken.uid });
    if (!user) {
      user = await User.create({
        uid: decodedToken.uid,
        email: decodedToken.email,
        preferredLanguage: 'en'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
