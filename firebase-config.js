/**
 * Firebase – חיבור לענן (חינמי).
 * הוראות: היכנס ל־ https://console.firebase.google.com
 * צור פרויקט חדש → הוסף אפליקציית Web → העתק את ה־config לכאן.
 * בהמשך: Authentication → התחברות → אפשר "אימייל/סיסמה".
 * צור משתמש (אימייל + סיסמה 1234 או אחר) – איתו תיכנס לניהול האתר.
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
