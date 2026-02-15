# BPHONE – אתר B-Phone תקשורת

דף נחיתה לנקודת השירות B-Phone:
- ניהול חבילות סלולר (כשר, 4G, 5G, אינטרנט ביתי)
- אזור מוצרים עם תמונות ותיאור
- מודול ניהול למנהל (עריכה, מחיקה, מודאלי אישור)

האתר בנוי כעמוד סטטי עם React + Tailwind דרך CDN, ומיועד לפתיחה ישירה דרך `index.html` או Live Server.

## מבנה הפרויקט

| קובץ/תיקייה | שימוש |
|-------------|--------|
| `index.html` | דף הכניסה – טוען Tailwind, React, Babel ואת `app.jsx` |
| `app.jsx` | כל לוגיקת האתר (React) – גרסה ללא בילד |
| `admin.html` + `admin.jsx` | **פאנל ניהול נפרד** – דף ניהול מלא, רספונסיבי, בכתובת `/admin` |
| `logos/` | תמונות לוגואים של ספקים (golan, cellcom, hot, וכו') + `logo-bphone.png` |
| `README.md` | התיעוד הזה |

אין קבצי build או תלויות npm – פתיחת `index.html` מספיקה.

## חיבור לענן (Firebase – חינמי)

כדי שכל העדכונים (חבילות, מחירים, לוגו, כותרת, הגדרות) יישמרו בענן וכל לקוח יראה אותם מכל מכשיר:

1. היכנס ל־[Firebase Console](https://console.firebase.google.com), צור פרויקט חדש.
2. **Authentication** → התחברות → אפשר **אימייל/סיסמה**. צור משתמש (אימייל + סיסמה, למשל 1234) – איתו תיכנס לניהול האתר.
3. **Firestore Database** → צור מסד נתונים (מצב production). ב־**Rules** הדבק את התוכן של `firestore.rules` (או העלה את הקובץ) ושמור.
4. **Project settings** → הוסף אפליקציית Web → העתק את ה־config ל־`firebase-config.js`: החלף את `YOUR_API_KEY`, `YOUR_PROJECT_ID` וכו' בערכים האמיתיים.
5. רענן את האתר. התחבר עם האימייל והסיסמה שיצרת. לחץ **ניהול חבילות** → **טען נתונים לדוגמה** כדי ליצור את הנתונים בענן בפעם הראשונה.

מעכשיו כל שינוי (חבילות, הגדרות, מבצעים) נשמר אוטומטית ב־Firebase וכל מי שנכנס לאתר רואה את אותם נתונים מעודכנים.

**תמונות מוצרים (חינם):** להעלאה ישירה מהאתר בלי Firebase Storage – קבל מפתח API חינמי מ־[ImgBB](https://api.imgbb.com/) והגדר ב־index.html: `window.IMGBB_API_KEY = "המפתח";`. אחרת אפשר להדביק קישורי תמונות ידנית (העלאה ל־ImgBB/Imgur והדבקת הקישור).

## B-Bot (צ'אט חכם – חינם, בלי Netlify)

כדי שה-Bot יהיה **חכם** (עם AI) **בלי להשתמש בנקודות Netlify**:

1. **Cloudflare Worker (חינם)** – כ־100,000 בקשות ליום, בלי כרטיס אשראי.
2. פתח את הקובץ **`gemini-worker.js`** בפרויקט – יש בו הוראות מלאות.
3. בקצרה: היכנס ל-[Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create Worker → הדבק את קוד `gemini-worker.js` → ב-Settings הוסף משתנה **GEMINI_API_KEY** (Secret) עם המפתח מ-[Google AI Studio](https://aistudio.google.com/app/apikey) → Deploy.
4. העתק את כתובת ה-Worker (למשל `https://gemini-proxy.xxx.workers.dev`) והדבק ב-**index.html** ב־`window.GEMINI_PROXY_URL = "הכתובת";`.

אחרי זה הצ'אט יעבוד עם AI, והנקודות של Netlify לא נוגעים.

