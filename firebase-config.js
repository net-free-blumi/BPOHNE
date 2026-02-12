/**
 * Firebase – חיבור לענן (חינמי).
 *
 * מה לעשות באתר Firebase (console.firebase.google.com):
 * 1. בחר את הפרויקט → Build → Authentication.
 * 2. Sign-in method: לחץ על "אימייל/סיסמה" והפעל (Enable), שמור.
 * 3. Sign-in method: לחץ על "Google", הפעל (Enable), בחר אימייל תמיכה, שמור.
 * 4. (אופציונלי) Authentication → Settings → Authorized domains: וודא שהדומיין שלך ברשימה
 *    (localhost ו־bphone-4e304.firebaseapp.com כבר שם).
 *
 * רק אימיילים שמופיעים ב־ALLOWED_ADMIN_EMAILS ב־app.jsx נחשבים כמנהלים.
 */
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyD057RSLr9mVBulPH_s7TEuCHt_aaacgq0",
  authDomain: "bphone-4e304.firebaseapp.com",
  projectId: "bphone-4e304",
  storageBucket: "bphone-4e304.firebasestorage.app",
  messagingSenderId: "185015318516",
  appId: "1:185015318516:web:0c7e5454bcbb973badeba1",
  measurementId: "G-6NZ1E34VEF"
};

if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.projectId) {
  try {
    window.firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
  } catch (e) {
    console.warn('Firebase init failed', e);
  }
}
