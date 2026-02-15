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
| Hosting | Cloudflare Pages | חינם |
| OG Logic | Cloudflare Pages Functions | חינם (על Workers) |
| נתוני מוצרים | Firebase Firestore | חינם (Spark) |

---

## שלב 1: Firebase Service Account

צריך מפתח שיאפשר ל־Worker לקרוא מ־Firestore.

1. גלוש ל־https://console.firebase.google.com/project/bphone-4e304/settings/serviceaccounts/adminsdk  
2. לחץ "Generate new private key"
3. שמור את קובץ ה־JSON (זה המפתח – אל תשתף אותו)
4. פתח את הקובץ – תזדקק ל־`project_id`, `client_email`, `private_key`

---

## שלב 2: Cloudflare Pages + Functions

### א. אם האתר כבר על Cloudflare Pages

1. ב־Dashboard: **Workers & Pages** → הפרויקט שלך
2. Settings → **Functions** – וודא ש־Functions מופעלים

### ב. מבנה קבצים חדש

```
קוד לאתר ביפון/
├── functions/
│   └── product/
│       └── [id].ts      ← חדש
├── docs/
├── app.jsx
├── index.html
└── ...
```

---

## שלב 3: קוד ה־Function

הקובץ `functions/product/[id].ts` כבר נוצר בפרויקט. הפונקציה:

- מזהה בוטים לפי User-Agent (WhatsApp, Facebook וכו')
- שולפת את המוצר מ־Firestore עם Service Account
- מחזירה HTML עם `og:title`, `og:image`, `og:description`
- עבור משתמש רגיל – מפנה ל־`/#product-[id]` (302)

### התקנת תלויות

```bash
npm install
```

---

## שלב 4: הוספת ה־Service Account ל־Cloudflare Pages

> ⚠️ **חשוב**: הקובץ `*-firebase-adminsdk*.json` נוסף ל־`.gitignore` – **לעולם אל תעלה אותו ל־Git**.

### 4א. העתקת התוכן

1. פתח את הקובץ שהורדת: `bphone-4e304-firebase-adminsdk-fbsvc-59c88f37f7.json`
2. בחר הכל (Ctrl+A) והעתק (Ctrl+C) – כולל הסוגריים המסולסלים `{` ו־`}`

### 4ב. הוספה ל־Cloudflare Dashboard

1. היכנס ל־https://dash.cloudflare.com
2. בתפריט צד: **Workers & Pages** → בחר את פרויקט האתר (B-Phone)
3. לשונית **Settings** → גלול ל־**Environment variables**
4. לחץ **Add variable** (או **Edit variables**)
5. **Variable name**: `FIREBASE_SERVICE_ACCOUNT`
6. **Value**: הדבק את כל תוכן ה־JSON שהעתקת
7. סמן **Encrypt** (ברירת מחדל)
8. בחר Environment: **Production** (ו־**Preview** אם תרצה לבדוק)
9. **Save**

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

## בדיקה מקומית

```bash
curl -A "WhatsApp/2.0" "https://yoursite.pages.dev/product/מוצר-id"
```

צריך לקבל HTML עם `<meta property="og:title"` וכו׳.

---

## עלויות (סיכום)

- Cloudflare Pages + Functions – **חינם**
- Firebase Firestore – **חינם** עד 50K reads/day
- אין צורך ב־Pro/Workers Paid
