import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: 'clearpath-india.firebasestorage.app',
  messagingSenderId: '177630049525',
  appId: '1:177630049525:web:cfdbbb703c3a13f60881bc',
  measurementId: 'G-C5XY65X4BQ'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export let analytics = null;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

export default app;
