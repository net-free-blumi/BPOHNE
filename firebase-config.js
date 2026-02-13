/**
 * Firebase – חיבור לענן (חינמי).
 *
 * מה לעשות באתר Firebase (console.firebase.google.com):
 * 1. בחר את הפרויקט → Build → Authentication.
 * 2. Sign-in method: "אימייל/סיסמה" (Email/Password) – חייב להיות מופעל (Enable). שמור.
 * 3. Sign-in method: "Google" – הפעל, בחר אימייל תמיכה, שמור.
 * 4. כדי שהתחברות עם אימייל וסיסמה תעבוד: Authentication → Users → Add user.
 *    הזן אימייל וסיסמה (למשל bp0527151000@gmail.com והסיסמה שבחרת). שמור.
 *    (אם המייל כבר קיים רק מ־Google – אין סיסמה; צריך להתחבר עם גוגל או ליצור משתמש חדש באימייל+סיסמה.)
 * 5. (אופציונלי) Settings → Authorized domains: וודא שהדומיין ברשימה.
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
