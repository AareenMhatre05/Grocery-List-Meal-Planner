// Import the functions you need
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web app configuration, read from environment variables (.env.local).
// See .env.example and the README for setup. Create React App only exposes
// variables prefixed with REACT_APP_, and reads them when `npm start` begins.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // eslint-disable-next-line no-console
  console.error("Firebase config missing: copy .env.example to .env.local, fill in your Firebase values and restart `npm start`.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// App Check (optional): proves requests come from this site, so scripts and bots calling
// your Firebase project directly are rejected once enforcement is on in the Firebase console.
// Enabled only when a reCAPTCHA v3 site key is set in .env.local.
if (process.env.REACT_APP_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export them so other files can use them
export { auth, db };
