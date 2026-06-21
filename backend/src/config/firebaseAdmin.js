const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
try {
  // Local development: Load from service account JSON
  serviceAccount = require(path.join(__dirname, '../../../clearpath-india-firebase-adminsdk-fbsvc-d8ee8f81d1.json'));
} catch (e) {
  // Production deployment: Reconstruct from env variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
  } else {
    console.warn("Firebase credentials JSON not found, and env variables are incomplete. Falling back to default app credentials.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  admin.initializeApp();
}

module.exports = admin;
