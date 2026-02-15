# OG Tags למוצרים – מדריך מלא (חינמי)

כדי שוואטסאפ יראה תמונה, כותרת ומחיר של כל מוצר כשמשתפים קישור – צריך להחזיר HTML עם meta tags מותאמים **לפני** שהדף נטען. בלי JavaScript, בלי React.

> ⚠️ **אם שיתפת את קובץ ה־JSON (כולל במסנג'ר או צ'אט)**: עבור ל־Firebase Console → Service Accounts → Keys, מחק את המפתח הנוכחי וייצר מפתח חדש. השתמש רק במפתח החדש.

## איך זה עובד

1. **קישור למוצר** – משתמשים בקישור מסוג `https://yoursite.com/product/123` (לא hash)
2. **בוט וואטסאפ** מבקר ב־URL ומבקש את ה־HTML
3. **שרת/וורקר** מזהה שזה בוט, שולף את פרטי המוצר מ־Firebase, ומחזיר דף HTML קצר עם:
   - `og:title` – שם המוצר
   - `og:image` – תמונת המוצר
   - `og:description` – תיאור/מחיר
4. **משתמש רגיל** שפותח את הקישור – מנותב ל־`/#product-123` והאתר מגליל למוצר כרגיל

---

## ארכיטקטורה (חינמי)

| רכיב | שירות | עלות |
|------|-------|------|
| Hosting | Netlify | חינם |
| OG Logic | Netlify Edge Functions | חינם |
| נתוני מוצרים | Firebase Firestore | חינם (Spark) |

> האתר מריץ על **Netlify**. יש גם גרסה ל־Cloudflare Pages בתיקייה `functions/`.

---

## שלב 1: Firebase Service Account

צריך מפתח שיאפשר ל־Worker לקרוא מ־Firestore.

1. גלוש ל־https://console.firebase.google.com/project/bphone-4e304/settings/serviceaccounts/adminsdk  
2. לחץ "Generate new private key"
3. שמור את קובץ ה־JSON (זה המפתח – אל תשתף אותו)
4. פתח את הקובץ – תזדקק ל־`project_id`, `client_email`, `private_key`

---

## שלב 2: Netlify – קבצים

הפרויקט כולל:

```
קוד לאתר ביפון/
├── netlify/
│   └── edge-functions/
│       └── product-og.ts    ← OG tags למוצרים
├── netlify.toml             ← SPA redirect + Edge Function
├── app.jsx
├── index.html
└── ...
```

---

## שלב 3: הוספת FIREBASE_SERVICE_ACCOUNT ל־Netlify

> ⚠️ **חשוב**: האתר רץ על **Netlify** – צריך להגדיר את המשתנה ב־Netlify, לא ב־Cloudflare.

### 3א. העתקת התוכן

1. פתח את קובץ ה־JSON של ה־Service Account
2. בחר הכל (Ctrl+A) והעתק (Ctrl+C)

### 3ב. הוספה ב־Netlify Dashboard

1. היכנס ל־https://app.netlify.com
2. בחר את האתר (b-phone)
3. **Site configuration** → **Environment variables**
4. **Add a variable** → **Add a single variable**
5. **Key**: `FIREBASE_SERVICE_ACCOUNT`
6. **Value**: הדבק את כל תוכן ה־JSON
7. סמן **Sensitive** (מומלץ)
8. **Save**
9. **Trigger deploy** כדי שה־Edge Function יעבוד עם המשתנה החדש

---

## שלב 5: קישור השתף באפליקציה

האפליקציה כבר מעודכנת – קישור השתף הוא `/product/[id]`. כשמשתמש רגיל נכנס לקישור, הפונקציה מפנה אותו אוטומטית ל־`/#product-[id]` והאתר מגליל למוצר.

---

## רשימת User-Agents של בוטים

וואטסאפ ופייסבוק משתמשים ב־User-Agent שמכיל:
- `WhatsApp`
- `facebookexternalhit`
- `Facebot`
- `TelegramBot`
- `Twitterbot`
- `LinkedInBot`
- `Slurp` (Yahoo)
- `Discordbot`

אם ה־User-Agent כולל אחד מאלה – מחזירים HTML עם OG. אחרת – מפנים לדף הראשי עם hash.

---

## בדיקה

```bash
curl -A "WhatsApp/2.0" "https://b-phone.netlify.app/product/Z4YIywg61Wg5ZYJkbhcp"
```

צריך לקבל HTML עם `<meta property="og:title"` ו־`og:image`.

---

## עלויות (סיכום)

- Netlify + Edge Functions – **חינם**
- Firebase Firestore – **חינם** עד 50K reads/day
