const { useState, useEffect, useMemo } = React;

// --- Firebase (ענן) – קריאה/כתיבה אם הוגדר firebase-config.js ---
function getDb() {
  return typeof window !== "undefined" && window.firebaseApp && window.firebase && window.firebase.firestore
    ? window.firebase.firestore()
    : null;
}
function getAuth() {
  return typeof window !== "undefined" && window.firebaseApp && window.firebase && window.firebase.auth
    ? window.firebase.auth()
    : null;
}
function isFirebaseActive() {
  return getDb() && getAuth();
}

// --- פורמט מחיר: פסיק באלפים (למשל 2300 → 2,300) ---
function formatPrice(val) {
  if (val == null || val === "") return "";
  const n = typeof val === "number" ? val : parseInt(String(val).replace(/,/g, ""), 10);
  if (Number.isNaN(n)) return String(val);
  return n >= 1000 ? n.toLocaleString("en-US") : String(n);
}

// --- אימיילים מורשים לניהול (רק הם ייחשבו כמנהלים אחרי התחברות) ---
const ALLOWED_ADMIN_EMAILS = [
  "bp0527151000@gmail.com",
  "123123mushh@gmail.com",

  // אפשר להוסיף כאן אימיילים נוספים של מנהלים
];
function isAllowedAdmin(email) {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
}

// --- ImgBB – העלאת תמונות חינמית (מפתח חינמי: https://api.imgbb.com/) ---
const IMGBB_API_KEY = typeof window !== "undefined" && window.IMGBB_API_KEY ? window.IMGBB_API_KEY : "";

async function uploadImageToImgBB(file, retries = 2) {
  if (!IMGBB_API_KEY) return null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const form = new FormData();
      form.append("key", IMGBB_API_KEY);
      form.append("image", file);
      const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data && data.data && data.data.url) return data.data.url;
    } catch (_) {}
    if (attempt < retries) await new Promise((r) => setTimeout(r, 800));
  }
  return null;
}

// --- אייקונים פשוטים במקום lucide-react (מתאימים ל-RTL ולטיילווינד) ---
const IconWrapper = ({ children, className, size = 20 }) => (
  <span
    className={className}
    style={{ fontSize: size, lineHeight: 1 }}
    aria-hidden="true"
  >
    {children}
  </span>
);

const Phone = (props) => <IconWrapper {...props}>📞</IconWrapper>;
const Smartphone = (props) => <IconWrapper {...props}>📱</IconWrapper>;
const Wifi = (props) => <IconWrapper {...props}>📶</IconWrapper>;
const MapPin = (props) => <IconWrapper {...props}>📍</IconWrapper>;
const Clock = (props) => <IconWrapper {...props}>⏰</IconWrapper>;
const ShieldCheck = (props) => <IconWrapper {...props}>✅</IconWrapper>;
const Plus = (props) => <IconWrapper {...props}>＋</IconWrapper>;
const Trash2 = (props) => <IconWrapper {...props}>🗑️</IconWrapper>;
const Edit2 = (props) => <IconWrapper {...props}>✏️</IconWrapper>;
const Menu = (props) => <IconWrapper {...props}>☰</IconWrapper>;
const X = (props) => <IconWrapper {...props}>✕</IconWrapper>;
const Lock = (props) => <IconWrapper {...props}>🔒</IconWrapper>;
const LogOut = (props) => <IconWrapper {...props}>↩</IconWrapper>;
const Zap = (props) => <IconWrapper {...props}>⚡</IconWrapper>;
const Signal = (props) => <IconWrapper {...props}>📡</IconWrapper>;
const RefreshCw = (props) => <IconWrapper {...props}>🔄</IconWrapper>;
const Settings = (props) => <IconWrapper {...props}>⚙️</IconWrapper>;
const MessageCircle = (props) => <IconWrapper {...props}>💬</IconWrapper>;
const ImageIcon = (props) => <IconWrapper {...props}>🖼️</IconWrapper>;
const Check = (props) => <IconWrapper {...props}>✓</IconWrapper>;
const Accessibility = (props) => <IconWrapper {...props}>♿</IconWrapper>;
const Bot = ({ size = 28, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <circle cx="9" cy="15" r="1.2" fill="currentColor" />
    <circle cx="15" cy="15" r="1.2" fill="currentColor" />
    <path d="M12 10V6M10 6h4" />
    <rect x="9" y="2" width="6" height="4" rx="1" />
  </svg>
);
const Share2 = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.82 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);
const ArrowUp = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

// --- Gemini AI (B-Bot) – עובד דרך Cloudflare Worker (חינם, בלי נקודות Netlify) ---
// הגדר ב-index.html: window.GEMINI_PROXY_URL = "https://הכתובת-שלך.workers.dev"
// ואת המפתח GEMINI_API_KEY תגדיר רק ב-Cloudflare Worker (Variables)
const GEMINI_PROXY_URL = typeof window !== "undefined" && window.GEMINI_PROXY_URL ? window.GEMINI_PROXY_URL : "";

async function callGemini(prompt, systemInstruction = "") {
  if (GEMINI_PROXY_URL) {
    try {
      const res = await fetch(GEMINI_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.text) return data.text;
      const errMsg = data.error || "";
      if (res.status === 429 || /quota|rate.limit|limit: 0/i.test(errMsg)) {
        return "המכסה הזמנית של היועץ מלאה. נסה שוב בעוד דקה־שתיים, או פנה אלינו בוואטסאפ – נשמח לעזור! 💬";
      }
      if (data.error) throw new Error(data.error);
    } catch (error) {
      console.error("AI Error:", error);
      const msg = error && error.message ? error.message : "";
      if (msg.includes("quota") || msg.includes("429")) {
        return "המכסה הזמנית מלאה. נסה שוב בעוד דקה או פנה אלינו בוואטסאפ! 💬";
      }
      return "משהו השתבש. נשמח לעזור בוואטסאפ! 💬";
    }
  }
  return "כדי שה-Bot יהיה חכם: הגדר Worker ב-Cloudflare (חינם) – ראה קובץ gemini-worker.js והערה ב-index.html. בינתיים נשמח לעזור בוואטסאפ! 💬";
}

// --- הודעות יפות (במקום alert) ---
function Toast({ message, type = "info", onClose }) {
  const bg = type === "success" ? "bg-emerald-600" : type === "error" ? "bg-rose-600" : "bg-blue-600";
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] ${bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[280px] max-w-[90vw]`}
      role="alert"
    >
      <span className="text-xl font-bold flex-shrink-0">{icon}</span>
      <p className="font-medium leading-snug flex-grow">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full flex-shrink-0" aria-label="סגור">
        <X className="text-white" size={18} />
      </button>
    </div>
  );
}

// --- נתוני דמו לשוק (מותאם מהקובץ המקורי, פברואר 2026) ---




const MARKET_DEALS = [
  // 5G
  { provider: "Cellcom", providerName: "סלקום", providerNameHe: "סלקום", price: 39.9, priceDetail: "לקו שני ומעלה (קו בודד 59.9)", category: "5g", dataGB: 800, calls: "5000 דקות", sms: 0, extras: "500 דקות לחו״ל", is5G: true, logoUrl: "./logos/cellcom.png", isHot: true, features: ["5000 דקות שיחה", "גלישה: 800GB", "500 דקות לחו״ל"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", providerNameHe: "הוט מובייל", price: 35, priceDetail: "לקו בזוגות (קו בודד 39.9)", category: "5g", dataGB: 300, calls: "3500 דקות", sms: 0, extras: "5G מהיר", is5G: true, logoUrl: "./logos/hot.png", isHot: false, features: ["3500 דקות שיחה", "גלישה: 300GB", "5G מהיר"] },
  { provider: "WeCom", providerName: "ויקום", providerNameHe: "ויקום", price: 34, priceDetail: "מחיר קבוע לשנתיים", category: "5g", dataGB: 300, calls: "3000 דקות", sms: 0, extras: "ללא התחייבות", is5G: true, logoUrl: "./logos/wecom.png", isHot: false, features: ["3000 דקות שיחה", "גלישה: 300GB", "ללא התחייבות"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", providerNameHe: "גולן טלקום", price: 39, priceDetail: "לאחר 3 חודשים 49 קבוע", category: "5g", dataGB: 750, calls: "5000 דקות", sms: 0, extras: "רשת מהירה", is5G: true, logoUrl: "./logos/golan.png", isHot: false, features: ["5000 דקות שיחה", "גלישה: 750GB", "רשת מהירה"] },
  { provider: "Pelephone", providerName: "פלאפון", providerNameHe: "פלאפון", price: 39.9, priceDetail: "החל מקו ראשון!", category: "5g", dataGB: 800, calls: "5000 דקות", sms: 0, extras: "דור 5", is5G: true, logoUrl: "./logos/pelephone.png", isHot: true, features: ["5000 דקות שיחה", "גלישה: 800GB", "דור 5"] },
  { provider: "Partner", providerName: "פרטנר", providerNameHe: "פרטנר", price: 39.9, priceDetail: "מחיר לשנה", category: "5g", dataGB: 500, calls: "5000 דקות", sms: 0, extras: "רשת חזקה", is5G: true, logoUrl: "./logos/partner.png", isHot: false, features: ["5000 דקות שיחה", "גלישה: 500GB", "רשת חזקה"] },
  // 4G
  { provider: "Cellcom", providerName: "סלקום", providerNameHe: "סלקום", price: 34.9, priceDetail: "ל-3 מנויים ומעלה (בודד/זוג 39.9)", category: "4g", dataGB: 400, calls: "3500 דקות", sms: 0, extras: "150 דקות לחו״ל", is5G: false, logoUrl: "./logos/cellcom.png", isHot: false, features: ["3500 דקות שיחה", "גלישה: 400GB", "150 דקות לחו״ל"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", providerNameHe: "הוט מובייל", price: 25, priceDetail: "לקו בזוגות (בודד 29.9)", category: "4g", dataGB: 250, calls: "3000 דקות", sms: 0, extras: "", is5G: false, logoUrl: "./logos/hot.png", isHot: true, features: ["3000 דקות שיחה", "גלישה: 250GB"] },
  { provider: "WeCom", providerName: "ויקום", providerNameHe: "ויקום", price: 28, priceDetail: "מחיר קבוע לשנתיים", category: "4g", dataGB: 300, calls: "3000 דקות", sms: 0, extras: "", is5G: false, logoUrl: "./logos/wecom.png", isHot: false, features: ["3000 דקות שיחה", "גלישה: 300GB"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", providerNameHe: "גולן טלקום", price: 29.9, priceDetail: "מחיר קבוע לשנה וחצי", category: "4g", dataGB: 350, calls: "4000 דקות", sms: 0, extras: "", is5G: false, logoUrl: "./logos/golan.png", isHot: false, features: ["4000 דקות שיחה", "גלישה: 350GB"] },
  { provider: "Pelephone", providerName: "פלאפון", providerNameHe: "פלאפון", price: 29.9, priceDetail: "החל מקו ראשון!", category: "4g", dataGB: 300, calls: "3000 דקות", sms: 0, extras: "", is5G: false, logoUrl: "./logos/pelephone.png", isHot: false, features: ["3000 דקות שיחה", "גלישה: 300GB"] },
  { provider: "Partner", providerName: "פרטנר", providerNameHe: "פרטנר", price: 30, priceDetail: "ל-2 מנויים ומעלה (בודד 39.9)", category: "4g", dataGB: 400, calls: "3500 דקות", sms: 0, extras: "", is5G: false, logoUrl: "./logos/partner.png", isHot: true, features: ["3500 דקות שיחה", "גלישה: 400GB"] },
  { provider: "019 Mobile", providerName: "019 מובייל", providerNameHe: "019 מובייל", price: 19.9, priceDetail: "מתאים לילדים", category: "4g", dataGB: 12, calls: "ללא הגבלה", sms: 0, extras: "החבילה הזולה ביותר!", is5G: false, logoUrl: "./logos/019.png", isHot: false, features: ["ללא הגבלה שיחה", "גלישה: 12GB", "מתאים לילדים"] },
  // כשר
  { provider: "Golan Telecom", providerName: "גולן טלקום", providerNameHe: "גולן טלקום", price: 27.9, priceDetail: "מחיר קבוע", category: "kosher", dataGB: 0, calls: "7000 דקות ללא הגבלה", sms: 0, extras: "500 דקות לחו״ל", is5G: false, logoUrl: "./logos/golan.png", isHot: false, features: ["7000 דקות ללא הגבלה", "500 דקות לחו״ל", "ללא אינטרנט/SMS"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", providerNameHe: "הוט מובייל", price: 25, priceDetail: "לזוג ומעלה (בודד 26)", category: "kosher", dataGB: 0, calls: "5000 דקות ללא הגבלה", sms: 0, extras: "כשר למהדרין", is5G: false, logoUrl: "./logos/hot.png", isHot: true, features: ["5000 דקות ללא הגבלה", "700 דקות לחו״ל", "כשר למהדרין"] },
  { provider: "Cellcom", providerName: "סלקום", providerNameHe: "סלקום", price: 25, priceDetail: "בחיבור 2 קווים (בודד 29.9)", category: "kosher", dataGB: 0, calls: "4000 דקות ללא הגבלה", sms: 0, extras: "סים כשר", is5G: false, logoUrl: "./logos/cellcom.png", isHot: false, features: ["4000 דקות ללא הגבלה", "500 דקות לחו״ל", "סים כשר"] },
  { provider: "Pelephone", providerName: "פלאפון", providerNameHe: "פלאפון", price: 20, priceDetail: "לזוג ומעלה (בודד 29.9)", category: "kosher", dataGB: 0, calls: "4000 דקות ללא הגבלה", sms: 0, extras: "קליטה מעולה", is5G: false, logoUrl: "./logos/pelephone.png", isHot: true, features: ["4000 דקות ללא הגבלה", "קו כשר", "קליטה מעולה"] },
  { provider: "Partner", providerName: "פרטנר", providerNameHe: "פרטנר", price: 25, priceDetail: "לזוג ומעלה (בודד 29.9)", category: "kosher", dataGB: 0, calls: "6000 דקות ללא הגבלה", sms: 0, extras: "מספר כשר", is5G: false, logoUrl: "./logos/partner.png", isHot: false, features: ["6000 דקות ללא הגבלה", "500 דקות לחו״ל", "מספר כשר"] },
  // אינטרנט/סיבים
  { provider: "Cellcom", providerName: "סלקום פייבר", providerNameHe: "סלקום", price: 39, priceDetail: "לחודש (למשך 3 חודשים)", category: "internet", dataGB: 0, calls: 0, sms: 0, extras: "ראוטר WiFi 7 כלול", is5G: false, logoUrl: "./logos/cellcom.png", isHot: true, badge: "מבצע מטורף", afterPrice: "מחיר המשך 99 ₪", features: ["אינטרנט סיבים עוצמתי", "ראוטר WiFi 7 כלול", "מגדיל טווח כלול!", "התקנה מהירה"] },
  { provider: "Cellcom", providerName: "סלקום טריפל", providerNameHe: "סלקום", price: 89, priceDetail: "לחודש (למשך 3 חודשים)", category: "internet", dataGB: 0, calls: 0, sms: 0, extras: "טלוויזיה + אינטרנט", is5G: false, logoUrl: "./logos/cellcom.png", isHot: true, badge: "טריפל שובר שוק", afterPrice: "מחיר המשך 149 ₪", features: ["טלוויזיה + אינטרנט סיבים", "ראוטר WiFi 7 כלול", "מגדיל טווח כלול", "ממיר אחד כלול"] },
  { provider: "Hot", providerName: "HOT סיבים 1000/100", price: 99, priceDetail: "לחודש (למשך שנה)", category: "internet", dataGB: 0, calls: 0, sms: 0, extras: "התקנה חינם (בניין דירות)", is5G: false, logoUrl: "./logos/hot.png", isHot: false, features: ["מהירות עד 1000Mbps", "נתב ומגדיל טווח כלול", "התקנה חינם (בניין דירות)"] },
  { provider: "Hot", providerName: "HOT סיבים 600/100", price: 89, priceDetail: "לחודש (למשך שנה)", category: "internet", dataGB: 0, calls: 0, sms: 0, extras: "נתב ומגדיל טווח כלול", is5G: false, logoUrl: "./logos/hot.png", isHot: false, features: ["מהירות עד 600Mbps", "נתב ומגדיל טווח כלול", "התקנה חינם (בניין דירות)"] },
  { provider: "Hot", providerName: "HOT טריפל NEXT + סיבים 1000", price: 135, priceDetail: "לחודש", category: "internet", dataGB: 0, calls: 0, sms: 0, extras: "אינטרנט + טלוויזיה", is5G: false, logoUrl: "./logos/hot.png", isHot: true, badge: "הכל כלול", features: ["אינטרנט סיבים 1000Mbps", "טלוויזיה NEXT עם VOD", "סטרימר 65 ערוצים", "ראוטר ומגדיל טווח כלול"] },
  { provider: "Bezeq Fiber", providerName: "בזק סיבים", providerNameHe: "בזק", price: 119, priceDetail: "לחודש", category: "internet", dataGB: 0, calls: 0, sms: 0, extras: "כולל נתב Be, מהירות עד 2.5Gb", is5G: false, logoUrl: "./logos/bezeq.png", isHot: false, features: ["כולל נתב Be", "מהירות עד 2.5Gb", "סיבים אופטיים"] },
];

const DEFAULT_SITE_TEXTS = {
  heroBadge: "ביפון תקשורת סלולרית – בית שמש וביתר",
  featuredBadge: "ההמלצות שלנו",
  featuredTitle: "מבצעים מומלצים",
  featuredSubtitle: "מוצרים וחבילות שנבחרו במיוחד – במחיר משתלם",
  productsTitle: "מכשירים ומוצרים בחנות",
  packagesTitle: "מצאו את החבילה שמתאימה לכם",
  servicesTitle: "כל מה שצריך במקום אחד",
  servicesSubtitle: "שירותים ופתרונות תקשורת בסגנון ביפון",
  locationsTitle: "הסניפים שלנו",
  footerTitle: "ביפון B-Phone – תקשורת סלולרית",
  footerDesc: "הבית של הסלולר הכשר והחכם באזור. שירות אמין, מחירים הוגנים, מעבדה לתיקון מכשירים ומחשבים והתקנת סינון כשר.",
  navFeatured: "מבצעים מומלצים",
  navProducts: "אביזרים ומבצעים",
  navPackages: "ניוד קווים",
  navServices: "מעבדה",
  navLocations: "צור קשר",
  btnAllProducts: "לכל המוצרים",
  btnAllPackages: "לכל החבילות",
  btnFindBranch: "מצא סניף קרוב",
  btnShowMoreProducts: "הצג עוד מוצרים",
  btnShowMorePackages: "הראה עוד",
};
const DEFAULT_SECTION_VISIBILITY = { featured: true, products: true, packages: true, services: true, locations: true };

const DEFAULT_CONFIG = {
  mainPhone: "0527151000",
  whatsapp: "0527151000",
  // ברירת מחדל: לוגו מתוך קובץ מקומי בתיקיית logos
  logoUrl: "./logos/logo-bphone.png",
  botLogoUrl: "",
  heroBanners: [],
  heroDefaultBannerIndex: -1,
  heroBannerDurationSeconds: 5,
  heroBannerRotation: true,
  siteTexts: DEFAULT_SITE_TEXTS,
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  locations: [
    {
      id: "bs",
      city: "בית שמש",
      address: "רחוב יצחק רבין 17, בית שמש",
      phone: "052-7151000",
      hours: "א'-ה': 10:00 - 21:00\nימי ו' וערבי חג:\nחורף 10:00 - 13:00\nקיץ 10:00 - 14:00",
    },
    {
      id: "beitar",
      city: "ביתר עילית",
      address: "המגיד ממעזריטש 71, ביתר עילית",
      phone: "02-9911213",
      hours: "א'-ה': 10:00 - 21:00\nימי ו' וערבי חג:\nחורף 10:00 - 12:30\nקיץ 10:00 - 13:00",
    },
  ],
  // שירותים מותאמים: תיקון מכשירים/מחשבים וסינונים כשרים
  services: [
    {
      title: "מעבדה לתיקון סמארטפונים",
      desc: "תיקון מכשירי סלולר במקום – מסכים, סוללות, שקעי טעינה ועוד",
      iconUrl: "",
    },
    {
      title: "תיקון מחשבים וניידים",
      desc: "פתרון תקלות חומרה ותוכנה למחשבים ביתיים וניידים",
      iconUrl: "",
    },
    {
      title: "התקנת סינון אינטרנט כשר",
      desc: "כשר פליי, הדרן, עסקן, נט סמארט ועוד פתרונות סינון מתקדמים",
      iconUrl: "",
    },
    {
      title: "אביזרים ומיגון",
      desc: "מגני ספר, מסכי מגן, מטענים מקוריים ואוזניות איכותיות",
      iconUrl: "",
    },
  ],
};

const DEFAULT_SERVICE_ICONS = [Smartphone, ShieldCheck, Wifi, Zap];

// קבצי לוגו מקומיים מומלצים לחברות (שמור קבצים בתיקייה ./logos עם שמות זהים)
const PROVIDER_LOGO_PRESETS = [
  { key: "golan", label: "Golan Telecom", path: "./logos/golan.png" },
  { key: "cellcom", label: "Cellcom", path: "./logos/cellcom.png" },
  { key: "hot", label: "Hot Mobile", path: "./logos/hot.png" },
  { key: "pelephone", label: "Pelephone", path: "./logos/pelephone.png" },
  { key: "partner", label: "Partner", path: "./logos/partner.png" },
  { key: "019", label: "019 Mobile", path: "./logos/019.png" },
  { key: "wecom", label: "WeCom (ויקום)", path: "./logos/wecom.png" },
  { key: "bezeq", label: "Bezeq Fiber", path: "./logos/bezeq.png" },
];

const INITIAL_ADVISOR_MESSAGE = { role: "assistant", text: "היי! 👋 אני ביביפ, היועץ של B-Phone. אפשר לשאול אותי על חבילות סלולר ואינטרנט, מוצרים, שעות הפתיחה או כל שאלה – ואשמח לכוון אותך. בסוף אפשר גם לשלוח לנו בוואטסאפ!" };

// --- עריכה בתצוגה מקדימה (admin_edit=1) ---
const EditModeContext = React.createContext(null);

function EditableText({ type, editKey, value, as: Tag = "span", className = "", placeholder = "" }) {
  const ctx = React.useContext(EditModeContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  if (!ctx || !ctx.isEditMode) {
    const display = (value === undefined || value === null) ? (placeholder || "") : String(value).trim();
    return <Tag className={className}>{display}</Tag>;
  }

  const save = (newVal) => {
    const v = typeof newVal === "string" ? newVal.trim() : "";
    if (type === "siteTexts") {
      ctx.onEditSiteText(editKey, v);
    } else if (type === "promo") {
      ctx.onEditPromo(editKey, v);
    } else if (type === "service") {
      ctx.onEditService(editKey.serviceIndex, editKey.field, v);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <span className={`inline-block ${className}`}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(draft); if (e.key === "Escape") { setDraft(value ?? ""); setEditing(false); } }}
          className="min-w-[120px] max-w-full px-2 py-1 border-2 border-amber-500 rounded bg-white text-slate-800 text-inherit font-inherit"
          autoFocus
          onBlur={() => save(draft)}
        />
      </span>
    );
  }

  const display = (value ?? "").trim() || (placeholder && "(ריק – לחץ לעריכה)") || "(לחץ לעריכה)";
  return (
    <Tag
      className={`${className} cursor-pointer border-b-2 border-dashed border-amber-400 border-amber-500/80 hover:bg-amber-50/80 rounded px-0.5 -mx-0.5 transition`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDraft(value ?? ""); setEditing(true); }}
      title="לחץ לעריכה"
    >
      {display}
    </Tag>
  );
}

// --- ביביפ: יועץ AI (Gemini) עם חבילות, מוצרים ופרטי החנות ---
function AiAdvisor({ packages = [], products = [], siteConfig = {}, onClose, messages: externalMessages, onMessagesChange }) {
  const [internalMessages, setInternalMessages] = useState([INITIAL_ADVISOR_MESSAGE]);
  const messages = externalMessages !== undefined ? externalMessages : internalMessages;
  const setMessages = onMessagesChange || setInternalMessages;
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const systemPrompt = `
אתה ביביפ, יועץ מכירות ותמיכה ידידותי ומומחה של חנות "B-Phone" בישראל (בית שמש וביתר).

**מידע על החנות (חובה להכיר):**
- כתובות ושעות: ${JSON.stringify(siteConfig.locations || [])}
- שירותים: ${JSON.stringify((siteConfig.services || []).map(s => ({ title: s.title, desc: s.desc })))}
- טלפון/וואטסאפ: ${siteConfig.mainPhone || siteConfig.whatsapp || ""}

**חבילות סלולר ואינטרנט זמינות כרגע:**
${JSON.stringify(packages.map(p => ({
  provider: p.providerNameHe || p.providerName || p.provider,
  price: p.price,
  category: p.category,
  dataGB: p.dataGB,
  features: p.features,
  priceDetail: p.priceDetail,
  isHot: p.isHot,
  extras: p.extras
})))}

**מוצרים בחנות (מכשירים/אביזרים):**
${JSON.stringify(products.map(p => ({ name: p.name, price: p.price, description: p.description || "" })))}

**הנחיות:**
1. כששואלים על חבילות – המל 1–3 חבילות שמתאימות, הסבר בקצרה ולמה.
2. כששואלים על החנות (שעות, כתובת, טלפון) – תן את הנתונים המדויקים מהמידע למעלה.
3. כששואלים על שירותים (תיקון מכשירים, סינון כשר וכו') – תאשר לפי רשימת השירותים.
4. כששואלים על מוצרים – כוון לפי רשימת המוצרים.
5. שאלות טכניות כלליות – ענה בקצרה והצע להגיע לחנות לבעיות מורכבות.
6. ענה תמיד בעברית. טון: חם, מקצועי, מועיל. תשובות קצרות וברורות.
7. בסוף שיחה או כשהלקוח מוכן – הזכר שאפשר לשלוח הודעה בוואטסאפ לחנות להמשך.
`;

  const handleSend = async () => {
    const text = (inputValue || "").trim();
    if (!text || loading) return;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    const reply = await callGemini(text, systemPrompt);
    setLoading(false);
    setMessages((prev) => [...prev, { role: "assistant", text: reply || "מצטער, לא הצלחתי לענות. נסה שוב או פנה אלינו בוואטסאפ." }]);
  };

  const openWhatsApp = () => {
    const phone = (siteConfig.whatsapp || siteConfig.mainPhone || "0527151000").replace(/[^0-9]/g, "");
    const num = phone.startsWith("0") ? phone.slice(1) : phone;
    const url = `https://wa.me/972${num}?text=${encodeURIComponent("היי, הגעתי מהאתר ורוצה להמשיך את השיחה – אשמח לפרטים.")}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-0 sm:p-4 pb-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 sm:rounded-b-3xl sm:ml-4" style={{ marginBottom: "0.5rem" }}>
        {/* כותרת חמודה */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-3xl shrink-0 overflow-visible">
          <div className="flex items-center gap-2 overflow-visible">
            <div className={`flex items-end justify-center overflow-visible ${siteConfig?.botLogoUrl ? "bg-transparent -mb-5" : "rounded-full bg-white/20 w-12 h-12"}`}>
              {siteConfig?.botLogoUrl ? (
                <img src={siteConfig.botLogoUrl} alt="ביביפ" className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg" style={{ minWidth: "80px", minHeight: "80px" }} />
              ) : (
                <Bot size={28} className="text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">ביביפ</h3>
              <p className="text-xs text-blue-100">יועץ החנות – כאן בשבילך</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition" aria-label="סגור">
            <X size={22} />
          </button>
        </div>

        {/* הודעות */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 min-h-[200px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-sm"}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                <span className="text-sm text-slate-500">כותב...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* כפתור וואטסאפ */}
        <div className="px-4 pt-2 shrink-0">
          <button type="button" onClick={openWhatsApp} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition mb-2">
            <MessageCircle size={22} />
            שלח לנו בוואטסאפ
          </button>
        </div>

        {/* שדה שליחה */}
        <div className="p-4 pt-0 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="כתוב שאלה..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-slate-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="button" onClick={handleSend} disabled={loading || !inputValue.trim()} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
            שלח
          </button>
        </div>
      </div>
    </div>
  );
}

// --- קומפוננטת האפליקציה הראשית (ללא Firebase, דמו מקומי מקצועי) ---
function App() {
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [packagesVisibleCount, setPackagesVisibleCount] = useState(3);
  const [productsVisibleCount, setProductsVisibleCount] = useState(6);
  const [promoMessage, setPromoMessage] = useState({
    title: "מבצעי השקה!",
    subtitle: "הצטרפו היום וקבלו סים במתנה",
    active: true,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [productDetailOpen, setProductDetailOpen] = useState(null); // { product, startImageIndex } or null
  const [advisorMessages, setAdvisorMessages] = useState([INITIAL_ADVISOR_MESSAGE]);
  const [accOpen, setAccOpen] = useState(false);
  const [accFontSize, setAccFontSize] = useState(() => {
    try { return localStorage.getItem("bphone_acc_font") || "normal"; } catch { return "normal"; }
  });
  const [accContrast, setAccContrast] = useState(() => {
    try { return localStorage.getItem("bphone_acc_contrast") === "1"; } catch { return false; }
  });
  const [accLinks, setAccLinks] = useState(() => {
    try { return localStorage.getItem("bphone_acc_links") === "1"; } catch { return false; }
  });
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isAdmin = false; // ממשק ניהול הועבר ל-admin.html
  const isEditMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("admin_edit") === "1";

  const handleEditSiteText = (key, value) => {
    setSiteConfig((prev) => ({ ...prev, siteTexts: { ...(prev.siteTexts || DEFAULT_SITE_TEXTS), [key]: value } }));
    try { window.parent.postMessage({ type: "EDIT_SITE_TEXT", key, value }, "*"); } catch (_) {}
  };
  const handleEditPromo = (field, value) => {
    setPromoMessage((prev) => ({ ...prev, [field]: value }));
    try { window.parent.postMessage({ type: "EDIT_PROMO", field, value }, "*"); } catch (_) {}
  };
  const handleEditService = (index, field, value) => {
    setSiteConfig((prev) => {
      const services = (prev.services || []).map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, services };
    });
    try { window.parent.postMessage({ type: "EDIT_SERVICE", index, field, value }, "*"); } catch (_) {}
  };
  const editModeContextValue = isEditMode ? {
    isEditMode: true,
    onEditSiteText: handleEditSiteText,
    onEditPromo: handleEditPromo,
    onEditService: handleEditService,
  } : null;

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroBanners = Array.isArray(siteConfig.heroBanners) ? siteConfig.heroBanners : [];
  const heroDefaultBannerIndex = typeof siteConfig.heroDefaultBannerIndex === "number" ? siteConfig.heroDefaultBannerIndex : -1;
  const heroBannerDurationSeconds = Math.max(1, Math.min(60, siteConfig.heroBannerDurationSeconds ?? 5)) * 1000;
  const useBannerRotation = siteConfig.heroBannerRotation !== false && heroBanners.length > 1;
  const hasBanner = heroBanners.length > 0 && heroDefaultBannerIndex >= 0;

  useEffect(() => {
    if (hasBanner && heroDefaultBannerIndex >= 0) setBannerIndex(heroDefaultBannerIndex);
  }, [hasBanner, heroDefaultBannerIndex]);

  useEffect(() => {
    if (!useBannerRotation || heroBanners.length < 2) return;
    const t = setInterval(() => {
      setBannerIndex((i) => (i + 1) % heroBanners.length);
    }, heroBannerDurationSeconds);
    return () => clearInterval(t);
  }, [useBannerRotation, heroBanners.length, heroBannerDurationSeconds]);

  useEffect(() => {
    try {
      localStorage.setItem("bphone_acc_font", accFontSize);
      localStorage.setItem("bphone_acc_contrast", accContrast ? "1" : "0");
      localStorage.setItem("bphone_acc_links", accLinks ? "1" : "0");
    } catch (_) {}
    const root = document.documentElement;
    root.classList.remove("acc-font-large", "acc-font-x-large", "acc-contrast-high", "acc-links-highlight");
    if (accFontSize === "large") root.classList.add("acc-font-large");
    if (accFontSize === "x-large") root.classList.add("acc-font-x-large");
    if (accContrast) root.classList.add("acc-contrast-high");
    if (accLinks) root.classList.add("acc-links-highlight");
  }, [accFontSize, accContrast, accLinks]);

  const showMessage = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // --- טעינה מהענן (Firebase) או דמו מקומי ---
  useEffect(() => {
    const db = getDb();

    if (!db) {
      setPackages(MARKET_DEALS.map((d, i) => ({ ...d, id: `demo-${i}` })));
      setLoading(false);
      return;
    }

    const configRef = db.doc("config/site");
    const packagesRef = db.collection("packages");
    const productsRef = db.collection("products");

    Promise.all([
      configRef.get().then((snap) => (snap.exists ? snap.data() : null)),
      packagesRef.get().then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      productsRef.get().then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    ])
      .then(([configData, packagesList, productsList]) => {
        if (configData) {
          setSiteConfig((prev) => {
            const merged = { ...DEFAULT_CONFIG, ...configData, locations: configData.locations || prev.locations, services: configData.services || prev.services };
            if (!merged.logoUrl) merged.logoUrl = DEFAULT_CONFIG.logoUrl;
            if (!Array.isArray(merged.heroBanners)) {
              merged.heroBanners = merged.heroImageUrl ? [merged.heroImageUrl] : [];
            }
            if (typeof merged.heroDefaultBannerIndex !== "number") merged.heroDefaultBannerIndex = merged.heroBanners.length > 0 ? 0 : -1;
            if (typeof merged.heroBannerDurationSeconds !== "number") merged.heroBannerDurationSeconds = 5;
            merged.siteTexts = { ...DEFAULT_SITE_TEXTS, ...(configData.siteTexts || {}) };
            merged.sectionVisibility = { ...DEFAULT_SECTION_VISIBILITY, ...(configData.sectionVisibility || {}) };
            return merged;
          });
          if (configData.promoMessage) setPromoMessage((prev) => ({ ...prev, ...configData.promoMessage }));
        }
        if (packagesList && packagesList.length > 0) {
          setPackages(packagesList.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)));
        } else {
          setPackages(MARKET_DEALS.map((d, i) => ({ ...d, id: `demo-${i}` })));
        }
        if (productsList && productsList.length > 0) {
          setProducts(productsList.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)));
        }
      })
      .catch((err) => {
        console.warn("Firebase load error", err);
        setPackages(MARKET_DEALS.map((d, i) => ({ ...d, id: `demo-${i}` })));
      })
      .finally(() => setLoading(false));
  }, []);

  const getWhatsAppNumber = () => {
    const phone = siteConfig.whatsapp || "0527151000";
    const normalized = phone.replace(/[^0-9]/g, "");
    const withoutLeadingZero = normalized.startsWith("0")
      ? normalized.slice(1)
      : normalized;
    return withoutLeadingZero;
  };

  const buildWhatsAppTextForItem = (pkg) => {
    let text;
    if (pkg.category === "product") {
      // מוצר – שולחים את כל המידע מהתיבה
      const name = pkg.name || pkg.provider || "מוצר";
      const priceLine = pkg.price != null && pkg.price !== "" ? `*מחיר:* ${pkg.price} ₪` : "";
      const descLine = pkg.description && String(pkg.description).trim() ? `\n*תיאור:*\n${String(pkg.description).trim()}` : "";
      const tagsLine = pkg.tags && Array.isArray(pkg.tags) && pkg.tags.length > 0
        ? `\n*תגיות:* ${pkg.tags.join(", ")}`
        : "";
      text = `היי B-Phone, אני מתעניין במוצר הבא מהאתר:
-----------------------
*שם המוצר:* ${name}
${priceLine}${descLine}${tagsLine}
-----------------------
אשמח לקבל פרטים ולהזמין!`;
    } else {
      // חבילה סלולר
      const name = pkg.providerName || pkg.provider;
      const detail = pkg.priceDetail ? `\n*פירוט:* ${pkg.priceDetail}` : "";
      const categoryLabel = pkg.category === "kosher" ? "כשר" : pkg.category === "internet" ? "אינטרנט ביתי" : pkg.category;
      text = `היי B-Phone, אני מעוניין להצטרף לתוכנית הבאה:
-----------------------
*ספק:* ${name}
*מחיר:* ${pkg.price} ₪${detail}
*קטגוריה:* ${categoryLabel}
${pkg.features && pkg.features.length ? `*יתרונות:*\n${pkg.features.join("\n")}` : ""}
-----------------------
אשמח לקבל פרטים ולהצטרף!`;
    }

    return text;
  };

  const buildWhatsAppUrlForItem = (pkg) => {
    const withoutLeadingZero = getWhatsAppNumber();
    const text = buildWhatsAppTextForItem(pkg);
    const url = `https://wa.me/972${withoutLeadingZero}?text=${encodeURIComponent(text)}`;
    return url;
  };

  const handleWhatsAppClick = (pkg) => {
    const url = buildWhatsAppUrlForItem(pkg);
    window.open(url, "_blank");
  };

  const handleShareProduct = async (product) => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const productUrl = `${base}/product/${product.id || ""}`;
    const mainLine = `${product.name || "מוצר"}${product.price != null && product.price !== "" ? ` - ${formatPrice(product.price)} ₪` : ""} | B-Phone ביפון`;
    const waFullUrl = buildWhatsAppUrlForItem({ ...product, category: "product" });
    const waDisplayUrl = waFullUrl;

    const waText = buildWhatsAppTextForItem({ ...product, category: "product" });
    const fullText = `${mainLine}\n\n${waText}\n\n1) הצג באתר:\n${productUrl}\n\n2) לפרטים בוואטסאפ:\n${waDisplayUrl}`;
    const shareData = { title: product.name || "מוצר מ-B-Phone", text: fullText };
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
    try {
      if (isMobile && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showMessage("המוצר שותף בהצלחה!", "success");
        return;
      }
    } catch (e) {
      if (e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(fullText);
      showMessage("הקישור הועתק להדבקה!", "success");
    } catch {
      const fallback = fullText;
      const ta = document.createElement("textarea");
      ta.value = fallback;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showMessage("הקישור הועתק להדבקה!", "success");
    }
  };

  // גלילה למוצר כשנכנסים עם hash #product-xxx – רק אחרי טעינת המוצרים
  const productHashId = typeof window !== "undefined" && window.location.hash?.startsWith("#product-") ? window.location.hash.slice(1) : null;
  useEffect(() => {
    if (!productHashId || products.length === 0) return;
    const productId = productHashId.replace(/^product-/, "");
    const idx = products.findIndex((p) => p.id === productId);
    if (idx >= 0 && idx >= productsVisibleCount) {
      setProductsVisibleCount((c) => Math.max(c, idx + 1));
    }
  }, [products, productHashId, productsVisibleCount]);
  useEffect(() => {
    if (!productHashId) return;
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(productHashId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (attempt < 10) setTimeout(() => tryScroll(attempt + 1), 200);
    };
    setTimeout(tryScroll, 300);
  }, [productHashId, products, productsVisibleCount]);

  // --- מיפוי קטגוריה לטקסט לחיפוש ---
  const categoryToLabel = { all: "", kosher: "כשר", "4g": "דור 4", "5g": "דור 5", internet: "אינטרנט ביתי" };

  // --- סינון חבילות (טאב + חיפוש חופשי: חברה, מחיר, סוג, כשר וכו') ---
  const filteredPackages = packages.filter((pkg) => {
    if (activeTab !== "all" && pkg.category !== activeTab) return false;
    const q = (searchQuery || "").trim();
    if (!q) return true;
    const searchable = [
      pkg.providerNameHe,
      pkg.providerName,
      pkg.provider,
      String(pkg.price),
      categoryToLabel[pkg.category] || pkg.category,
      (pkg.features && pkg.features.join(" ")) || "",
      pkg.priceDetail || "",
      pkg.badge || "",
      pkg.extras || "",
    ]
      .filter(Boolean)
      .join(" ");
    return searchable.includes(q);
  });

  const displayedPackages = filteredPackages.slice(0, packagesVisibleCount);
  const hasMorePackages = filteredPackages.length > packagesVisibleCount;

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)),
    [products]
  );
  const displayedProducts = sortedProducts.slice(0, productsVisibleCount);
  const hasMoreProducts = !isAdmin && sortedProducts.length > productsVisibleCount;

  const featuredProducts = useMemo(() => sortedProducts.filter((p) => p.featured), [sortedProducts]);
  const featuredPackages = useMemo(
    () => [...packages].filter((p) => p.featured).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)),
    [packages]
  );
  const hasFeatured = featuredProducts.length > 0 || featuredPackages.length > 0;

  const t = siteConfig.siteTexts || DEFAULT_SITE_TEXTS;
  const v = siteConfig.sectionVisibility || DEFAULT_SECTION_VISIBILITY;

  // איפוס "הצג עוד" כשמשנים טאב או חיפוש
  useEffect(() => {
    setPackagesVisibleCount(3);
  }, [activeTab, searchQuery]);

  // צבעי ביפון: כחול כהה (צי), לבן, כתום (דגש)
  const bphoneNavy = "bg-[#1e3a5f]";
  const bphoneNavyLight = "bg-[#2a4a6f]";
  const bphoneOrange = "text-orange-400";
  const bphoneOrangeBg = "bg-orange-500 hover:bg-orange-400";

  return (
    <EditModeContext.Provider value={editModeContextValue}>
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
      {isEditMode && (
        <div className="bg-amber-500 text-amber-900 text-center py-2 px-4 text-sm font-bold sticky top-0 z-[60] shadow">
          ✏️ מצב עריכה – לחץ על כל טקסט כדי לערוך, לשנות או למחוק. השינויים נשמרים אוטומטית.
        </div>
      )}
      {/* Navigation – סגנון ביפון: כחול כהה, לבן, דגש כתום */}
      <nav className={`${bphoneNavy} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <a
                href="#"
                className="flex items-center hover:opacity-90 transition"
              >
                {siteConfig.logoUrl ? (
                  <div className="flex-shrink-0 flex items-center">
                    <img
                      src={siteConfig.logoUrl}
                      alt="ביפון B-Phone"
                      className="h-14 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white leading-none">
                        ביפון
                      </h1>
                      <span className="text-xs text-sky-200">
                        תקשורת סלולרית
                      </span>
                    </div>
                  </div>
                )}
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#promos" className="text-white/90 hover:text-orange-400 font-medium transition">
                מבצעים
              </a>
              <a href="#packages" className="text-white/90 hover:text-orange-400 font-medium transition">
                חבילות
              </a>
              <a href="#products" className="text-white/90 hover:text-orange-400 font-medium transition">
                מוצרים
              </a>
              <a href="#services" className="text-white/90 hover:text-orange-400 font-medium transition">
                שירותים
              </a>
              <a href="#locations" className="text-white/90 hover:text-orange-400 font-medium transition">
                סניפים
              </a>

            </div>

            {/* Mobile menu button – לבן כדי שייראה על הרקע הכחול */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2.5 rounded-xl hover:bg-white/20 hover:text-orange-300 transition focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu – כותרת ברורה וקישורים בולטים */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#2a4a6f] border-t border-white/20 pb-4 shadow-lg">
            <div className="px-4 pt-4 pb-2">
              <p className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-1">ניווט</p>
              <h2 className="text-white text-lg font-bold">בחר אזור באתר</h2>
            </div>
            <div className="flex flex-col space-y-0 px-4">
              <a href="#promos" className="py-3.5 text-white font-medium hover:text-orange-400 hover:bg-white/5 border-b border-white/10 transition rounded-lg px-2 -mx-2" onClick={() => setMobileMenuOpen(false)}>מבצעים</a>
              <a href="#packages" className="py-3.5 text-white font-medium hover:text-orange-400 hover:bg-white/5 border-b border-white/10 transition rounded-lg px-2 -mx-2" onClick={() => setMobileMenuOpen(false)}>חבילות</a>
              <a href="#products" className="py-3.5 text-white font-medium hover:text-orange-400 hover:bg-white/5 border-b border-white/10 transition rounded-lg px-2 -mx-2" onClick={() => setMobileMenuOpen(false)}>מוצרים</a>
              <a href="#services" className="py-3.5 text-white font-medium hover:text-orange-400 hover:bg-white/5 border-b border-white/10 transition rounded-lg px-2 -mx-2" onClick={() => setMobileMenuOpen(false)}>שירותים</a>
              <a href="#locations" className="py-3.5 text-white font-medium hover:text-orange-400 hover:bg-white/5 border-b border-white/10 transition rounded-lg px-2 -mx-2" onClick={() => setMobileMenuOpen(false)}>סניפים</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero / באנר ביפון – גובה נמוך, רוחב מלא לראות את רוב התמונה */}
      <div
        id="promos"
        className={`relative ${bphoneNavy} text-white overflow-hidden min-h-[200px] sm:min-h-[220px] flex flex-col justify-center transition-all duration-500`}
      >
        {hasBanner && useBannerRotation && heroBanners.map((url, i) => (
          <div
            key={url}
            className="absolute inset-0 z-0 transition-opacity duration-[1.2s] ease-in-out bg-center"
            style={{
              backgroundImage: `url(${url})`,
              backgroundSize: "100% auto",
              backgroundRepeat: "no-repeat",
              opacity: i === bannerIndex ? 1 : 0,
              zIndex: i === bannerIndex ? 1 : 0,
              pointerEvents: "none",
            }}
          />
        ))}
        {hasBanner && !useBannerRotation && heroBanners[heroDefaultBannerIndex] && (
          <div
            className="absolute inset-0 z-0 bg-center"
            style={{
              backgroundImage: `url(${heroBanners[heroDefaultBannerIndex]})`,
              backgroundSize: "100% auto",
              backgroundRepeat: "no-repeat",
              pointerEvents: "none",
            }}
          />
        )}
        {hasBanner && (
          <div className="absolute inset-0 bg-[#1e3a5f]/60 z-[2]" aria-hidden />
        )}
        {!hasBanner && (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/30 to-transparent" />
        )}

        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-white/10 border border-orange-400/50 text-sm font-semibold text-sky-100 mb-4">
              <span className="text-orange-400">◆</span> <EditableText type="siteTexts" editKey="heroBadge" value={t.heroBadge} />
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-white drop-shadow-md">
              <EditableText type="promo" editKey="title" value={promoMessage.title} as="span" />
            </h2>
            <p className="text-lg sm:text-xl text-sky-100/90 max-w-2xl mx-auto mb-8">
              <EditableText type="promo" editKey="subtitle" value={promoMessage.subtitle} as="span" />
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {hasFeatured && v.featured !== false && (
                <a href="#featured" className="px-4 py-2 rounded-lg bg-amber-400 text-amber-900 font-bold hover:bg-amber-300 transition text-sm shadow-lg">
                  <EditableText type="siteTexts" editKey="navFeatured" value={t.navFeatured} placeholder="מבצעים מומלצים" />
                </a>
              )}
              {v.products !== false && (
                <a href="#products" className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-400 transition text-sm">
                  <EditableText type="siteTexts" editKey="navProducts" value={t.navProducts} placeholder="אביזרים ומבצעים" />
                </a>
              )}
              {v.packages !== false && (
                <a href="#packages" className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-orange-500/80 border border-white/20 transition text-sm">
                  <EditableText type="siteTexts" editKey="navPackages" value={t.navPackages} placeholder="ניוד קווים" />
                </a>
              )}
              {v.services !== false && (
                <a href="#services" className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-orange-500/80 border border-white/20 transition text-sm">
                  <EditableText type="siteTexts" editKey="navServices" value={t.navServices} placeholder="מעבדה" />
                </a>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {v.locations !== false && ((t.btnFindBranch || "").trim() || isEditMode) && (
                <a
                  href="#locations"
                  className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-400 transition shadow-lg"
                >
                  <EditableText type="siteTexts" editKey="btnFindBranch" value={t.btnFindBranch} placeholder="מצא סניף קרוב" />
                </a>
              )}
              {v.packages !== false && ((t.btnAllPackages || "").trim() || isEditMode) && (
                <a
                  href="#packages"
                  className="px-6 py-3 rounded-xl bg-transparent border-2 border-white text-white font-bold hover:bg-white/10 transition"
                >
                  <EditableText type="siteTexts" editKey="btnAllPackages" value={t.btnAllPackages} placeholder="לכל החבילות" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* מבצעים מומלצים – כותרת אחת, שורה אחת של מוצרים וחבילות יחד */}
      {v.featured !== false && hasFeatured && (
        <section id="featured" className="py-12 sm:py-16 bg-gradient-to-b from-amber-50/80 to-white border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              {(((t.featuredBadge ?? "").trim()) !== "" || isEditMode) && (
                <span className="inline-block px-4 py-1.5 rounded-full bg-amber-200/80 text-amber-900 text-sm font-bold mb-3"><EditableText type="siteTexts" editKey="featuredBadge" value={t.featuredBadge} placeholder="ההמלצות שלנו" /></span>
              )}
              {(((t.featuredTitle ?? "").trim()) !== "" || isEditMode) && (
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-2"><EditableText type="siteTexts" editKey="featuredTitle" value={t.featuredTitle} as="span" placeholder="מבצעים מומלצים" /></h2>
              )}
              {(((t.featuredSubtitle ?? "").trim()) !== "" || isEditMode) && (
                <p className="text-slate-600 max-w-xl mx-auto"><EditableText type="siteTexts" editKey="featuredSubtitle" value={t.featuredSubtitle} as="span" placeholder="מוצרים וחבילות שנבחרו במיוחד – במחיר משתלם" /></p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {featuredProducts.map((product) => (
                <div key={`p-${product.id}`} className="flex flex-col min-h-[380px]" id={`product-${product.id || ""}`}>
                  <ProductCard
                    product={product}
                    onWhatsApp={handleWhatsAppClick}
                    onShare={handleShareProduct}
                    onOpenDetail={(p, startIndex) => setProductDetailOpen({ product: p, startImageIndex: startIndex ?? 0 })}
                  />
                </div>
              ))}
              {featuredPackages.map((pkg) => {
                const headerClass = getProviderStripeClass(pkg.provider, pkg.is5G);
                const features = getPackageFeatures(pkg);
                const displayName = getProviderDisplayName(pkg);
                return (
                  <div
                    key={`pkg-${pkg.id}`}
                    className="flex flex-col min-h-[380px] bg-white rounded-2xl border-2 border-amber-200/60 shadow-lg hover:shadow-xl transition overflow-hidden"
                  >
                    <div className={`${headerClass} px-4 pt-4 pb-4 text-white text-center relative flex-shrink-0`}>
                      <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full z-10">מבצע מומלץ</div>
                      {pkg.logoUrl ? (
                        <img src={pkg.logoUrl} alt={displayName} className="w-16 h-16 object-contain bg-white rounded-full p-1 shadow-lg border-2 border-white/50 mx-auto mb-2" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 border-2 border-white/50">
                          <ProviderLogo provider={pkg.provider} url={null} />
                        </div>
                      )}
                      <h3 className="text-lg font-bold">{displayName}</h3>
                      <div className="flex justify-center items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold">{formatPrice(pkg.price)}</span>
                        <span className="text-lg font-semibold">₪</span>
                      </div>
                      <p className="text-xs opacity-90">/חודש</p>
                      {pkg.priceDetail && <p className="text-xs opacity-95 mt-1">{pkg.priceDetail}</p>}
                    </div>
                    <div className="p-4 flex-grow flex flex-col min-h-0">
                      <ul className="space-y-2 mb-4 text-sm text-slate-700">
                        {features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check size={14} className="text-green-500 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleWhatsAppClick(pkg)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-auto transition"
                      >
                        <MessageCircle size={20} />
                        להצטרפות
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              {((t.btnAllProducts || "").trim() || isEditMode) && <a href="#products" className="inline-block px-6 py-3 rounded-xl bg-[#1e3a5f] text-white font-bold hover:bg-[#2a4a6f] transition"><EditableText type="siteTexts" editKey="btnAllProducts" value={t.btnAllProducts} placeholder="לכל המוצרים" /></a>}
              {((t.btnAllPackages || "").trim() || isEditMode) && <a href="#packages" className="inline-block px-6 py-3 rounded-xl bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] font-bold hover:bg-slate-50 transition mr-3"><EditableText type="siteTexts" editKey="btnAllPackages" value={t.btnAllPackages} placeholder="לכל החבילות" /></a>}
            </div>
          </div>
        </section>
      )}

      {/* Services Grid */}
      {v.services !== false && (
      <section id="services" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1e3a5f] mb-2">
            <EditableText type="siteTexts" editKey="servicesTitle" value={t.servicesTitle} as="span" placeholder="כל מה שצריך במקום אחד" />
          </h2>
          <p className="text-center text-slate-500 mb-10"><EditableText type="siteTexts" editKey="servicesSubtitle" value={t.servicesSubtitle} as="span" placeholder="שירותים ופתרונות תקשורת בסגנון ביפון" /></p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {siteConfig.services.map((service, idx) => (
              <ServiceCard
                key={idx}
                iconUrl={service.iconUrl}
                defaultIcon={DEFAULT_SERVICE_ICONS[idx % DEFAULT_SERVICE_ICONS.length]}
                title={isEditMode ? <EditableText type="service" editKey={{ serviceIndex: idx, field: "title" }} value={service.title} as="span" placeholder="כותרת" /> : service.title}
                desc={isEditMode ? <EditableText type="service" editKey={{ serviceIndex: idx, field: "desc" }} value={service.desc} as="span" placeholder="תיאור" /> : service.desc}
              />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Products Section */}
      {v.products !== false && (
      <section
        id="products"
        className="py-12 bg-white border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-slate-800">
              <EditableText type="siteTexts" editKey="productsTitle" value={t.productsTitle} as="span" placeholder="מכשירים ומוצרים בחנות" />
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">
                עדיין לא הוזנו מוצרים להצגה.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {displayedProducts.map((product) => (
                  <div key={product.id} id={`product-${product.id || ""}`}>
                    <ProductCard
                      product={product}
                      onWhatsApp={handleWhatsAppClick}
                      onShare={handleShareProduct}
                      onOpenDetail={(p, startIndex) => setProductDetailOpen({ product: p, startImageIndex: startIndex ?? 0 })}
                    />
                  </div>
                ))}
              </div>
              {hasMoreProducts && ((t.btnShowMoreProducts ?? "").trim() || isEditMode) && (
                <div className="text-center mt-8">
                  <button
                    type="button"
                    onClick={() => setProductsVisibleCount((c) => c + 6)}
                    className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-400 transition"
                  >
                    <EditableText type="siteTexts" editKey="btnShowMoreProducts" value={t.btnShowMoreProducts} placeholder="הצג עוד מוצרים" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      )}

      {/* Packages Section */}
      {v.packages !== false && (
      <section
        id="packages"
        className="py-12 bg-slate-50 border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 text-sm text-center max-w-2xl mx-auto">
            המחירים והמבצעים באחריות הספקים ונתונים לשינוי בהתאם לתקנון החברות. ט.ל.ח
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-[#1e3a5f]">
              <EditableText type="siteTexts" editKey="packagesTitle" value={t.packagesTitle} as="span" placeholder="מצאו את החבילה שמתאימה לכם" />
            </h2>

            {/* טאבים */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 min-w-max">
                <TabButton
                  active={activeTab === "all"}
                  onClick={() => setActiveTab("all")}
                  label="הכל"
                />
                <TabButton
                  active={activeTab === "kosher"}
                  onClick={() => setActiveTab("kosher")}
                  label="כשר"
                  icon={<ShieldCheck size={16} />}
                />
                <TabButton
                  active={activeTab === "4g"}
                  onClick={() => setActiveTab("4g")}
                  label="דור 4"
                  icon={<Signal size={16} />}
                />
                <TabButton
                  active={activeTab === "5g"}
                  onClick={() => setActiveTab("5g")}
                  label="דור 5"
                  icon={<Zap size={16} />}
                />
                <TabButton
                  active={activeTab === "internet"}
                  onClick={() => setActiveTab("internet")}
                  label="אינטרנט ביתי"
                  icon={<Wifi size={16} />}
                />
              </div>
            </div>
          </div>

          {/* תיבת חיפוש עם כפתור איפוס בתוך התיבה */}
          <div className="mb-6 max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי חברה, מחיר, כשר, דור 4, אינטרנט..."
              className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 py-3 text-slate-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              title="איפוס חיפוש"
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition ${searchQuery.trim() ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-gray-100 text-gray-400 cursor-default pointer-events-none"}`}
              disabled={!searchQuery.trim()}
            >
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              טוען חבילות...
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">
                {searchQuery.trim() ? "לא נמצאו חבילות התואמות לחיפוש. נסו מילה אחרת או הסירו את החיפוש." : "עדיין לא הוזנו חבילות בקטגוריה זו."}
              </p>
              {isAdmin && (
                <p
                  className="text-blue-500 cursor-pointer mt-2"
                  onClick={() => setShowAdminModal(true)}
                >
                  לחץ כאן להוספת חבילה ראשונה
                </p>
              )}
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPackages.map((pkg) => {
                const headerClass = getProviderStripeClass(pkg.provider, pkg.is5G);
                const features = getPackageFeatures(pkg);
                const displayName = getProviderDisplayName(pkg);
                return (
                  <div
                    key={pkg.id}
                    className="group bg-white rounded-2xl border border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                  >
                    {pkg.isHot && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl z-10 shadow">
                        מבצע מומלץ
                      </div>
                    )}
                    {pkg.badge && (
                      <div className={`absolute top-0 ${pkg.isHot ? "left-0 rounded-br-2xl" : "right-0 rounded-bl-2xl"} bg-amber-400 text-slate-900 text-xs font-bold px-4 py-2 z-10 shadow`}>
                        {pkg.badge}
                      </div>
                    )}

                    {/* ראש צבעוני – לוגו עגול במרכז (קומפקטי) */}
                    <div className={`${headerClass} px-4 pt-4 pb-4 text-white text-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="relative z-10 flex flex-col items-center">
                        {pkg.logoUrl ? (
                          <img src={pkg.logoUrl} alt={displayName} className="w-20 h-20 object-contain bg-white rounded-full p-1 shadow-lg border-2 border-white/50 mb-2" />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-2 border-2 border-white/50 [&>div]:scale-150">
                            <ProviderLogo provider={pkg.provider} url={null} />
                          </div>
                        )}
                        <h3 className="text-lg font-bold tracking-tight opacity-95">{displayName}</h3>
                        <div className="flex justify-center items-baseline gap-1 mt-1.5">
                          <span className="text-4xl font-extrabold tracking-tight">{formatPrice(pkg.price)}</span>
                          <span className="text-xl font-semibold mr-0.5">₪</span>
                        </div>
                        <p className="text-xs opacity-90 font-medium">/חודש</p>
                        {pkg.priceDetail && (
                          <p className="text-xs opacity-95 mt-1 max-w-xs leading-snug">{pkg.priceDetail}</p>
                        )}
                      </div>
                    </div>

                    {/* גוף הכרטיס – יתרונות + כפתור */}
                    <div className="p-6 flex-grow flex flex-col bg-gradient-to-b from-white to-slate-50/60">
                      <ul className="space-y-3.5 mb-6">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Check size={12} />
                            </span>
                            <span className="leading-snug font-medium">{feature}</span>
                          </li>
                        ))}
                        {pkg.afterPrice && (
                          <li className="flex items-start gap-3 text-sm text-slate-500 mt-3 pt-3 border-t border-dashed border-slate-200">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">i</span>
                            <span className="font-medium">{pkg.afterPrice}</span>
                          </li>
                        )}
                      </ul>
                      <button
                        onClick={() => handleWhatsAppClick(pkg)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl mt-auto"
                      >
                        <MessageCircle size={22} />
                        להצטרפות
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {hasMorePackages && ((t.btnShowMorePackages ?? "").trim() || isEditMode) && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPackagesVisibleCount(filteredPackages.length)}
                  className="px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition shadow-md"
                >
                  <EditableText type="siteTexts" editKey="btnShowMorePackages" value={t.btnShowMorePackages} placeholder="הראה עוד" />
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>
      )}

      {/* Locations Section */}
      {v.locations !== false && (
      <section id="locations" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1e3a5f] mb-12">
            <EditableText type="siteTexts" editKey="locationsTitle" value={t.locationsTitle} as="span" placeholder="הסניפים שלנו" />
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {siteConfig.locations.map((loc, idx) => (
              <LocationCard
                key={idx}
                city={loc.city}
                address={loc.address}
                hours={loc.hours}
                phone={loc.phone}
              />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Footer – צבעי ביפון */}
      <footer className="bg-[#1e3a5f] text-sky-100/90 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">
                <EditableText type="siteTexts" editKey="footerTitle" value={t.footerTitle} as="span" placeholder="ביפון B-Phone – תקשורת סלולרית" />
              </h3>
              <p className="mb-4">
                <EditableText type="siteTexts" editKey="footerDesc" value={t.footerDesc} as="span" placeholder="הבית של הסלולר הכשר והחכם באזור..." />
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">ניווט מהיר</h4>
              <ul className="space-y-2">
                {v.featured !== false && hasFeatured && <li><a href="#featured" className="hover:text-orange-400 transition"><EditableText type="siteTexts" editKey="navFeatured" value={t.navFeatured} placeholder="מבצעים מומלצים" /></a></li>}
                {v.packages !== false && <li><a href="#packages" className="hover:text-orange-400 transition"><EditableText type="siteTexts" editKey="navPackages" value={t.navPackages} placeholder="ניוד קווים" /></a></li>}
                {v.products !== false && <li><a href="#products" className="hover:text-orange-400 transition"><EditableText type="siteTexts" editKey="navProducts" value={t.navProducts} placeholder="אביזרים ומבצעים" /></a></li>}
                {v.locations !== false && <li><a href="#locations" className="hover:text-orange-400 transition"><EditableText type="siteTexts" editKey="navLocations" value={t.navLocations} placeholder="צור קשר" /></a></li>}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">מידע נוסף</h4>
              <p>מצאת טעות במחיר? <a href="#packages" className="underline hover:text-orange-400">דווח לנו</a></p>
              <p className="mt-2">
                <button
                  type="button"
                  onClick={() => setAccOpen(true)}
                  className="text-sky-200 hover:text-orange-400 underline cursor-pointer text-sm"
                  aria-label="הגדרות נגישות"
                >
                  נגישות
                </button>
              </p>
              <p className="mt-3 text-sky-200/80 text-xs leading-relaxed">
                המחירים והמבצעים באחריות הספקים ונתונים לשינוי בהתאם לתקנון החברות. ט.ל.ח
              </p>
              <p className="mt-3">© כל הזכויות שמורות לבי-פון תקשורת <a href="/admin.html" className="no-underline hover:no-underline hover:text-inherit cursor-pointer text-inherit">2026</a></p>
            </div>
          </div>
        </div>
      </footer>

      {/* כפתור חזרה לראש הדף – מימין, מופיע רק אחרי גלילה */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#1e3a5f] text-white shadow-lg hover:bg-orange-500 hover:scale-110 flex items-center justify-center transition-all duration-300 ${
          showScrollTop ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        title="חזרה לראש הדף"
        aria-label="חזרה לראש הדף"
        aria-hidden={!showScrollTop}
      >
        <ArrowUp size={24} />
      </button>

      {/* נגישות – לוח גדול בתחתית המסך, עם כפתורים ברורים */}
      {accOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50"
          onClick={() => setAccOpen(false)}
          role="dialog"
          aria-label="הגדרות נגישות"
        >
          <div
            className="w-full bg-[#061824] text-slate-50 border-t border-slate-700/70 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.6)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-700/60">
              <div>
                <p className="text-sm text-amber-400 font-semibold tracking-wide mb-0.5">תפריט נגישות</p>
                <h2 className="text-lg font-bold">התאמת תצוגה לקריאה נוחה</h2>
              </div>
              <button
                type="button"
                onClick={() => setAccOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center hover:bg-slate-700"
                aria-label="סגור נגישות"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-4 pt-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                <button
                  type="button"
                  onClick={() => setAccFontSize("large")}
                  className={`flex flex-col items-center justify-center rounded-2xl px-3 py-3 border-2 ${
                    accFontSize === "large"
                      ? "border-amber-400 bg-amber-500/10 text-amber-200"
                      : "border-slate-600 bg-slate-800/60 hover:bg-slate-700/80"
                  }`}
                >
                  <span className="text-xl font-bold mb-1">A+</span>
                  <span>הגדלת טקסט</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccFontSize("x-large")}
                  className={`flex flex-col items-center justify-center rounded-2xl px-3 py-3 border-2 ${
                    accFontSize === "x-large"
                      ? "border-amber-400 bg-amber-500/10 text-amber-200"
                      : "border-slate-600 bg-slate-800/60 hover:bg-slate-700/80"
                  }`}
                >
                  <span className="text-2xl font-extrabold mb-1">A++</span>
                  <span>טקסט ענק</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccFontSize("normal")}
                  className={`flex flex-col items-center justify-center rounded-2xl px-3 py-3 border-2 ${
                    accFontSize === "normal"
                      ? "border-amber-400 bg-amber-500/10 text-amber-200"
                      : "border-slate-600 bg-slate-800/60 hover:bg-slate-700/80"
                  }`}
                >
                  <span className="text-lg font-bold mb-1">A</span>
                  <span>גודל רגיל</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccContrast(!accContrast)}
                  className={`flex flex-col items-center justify-center rounded-2xl px-3 py-3 border-2 ${
                    accContrast
                      ? "border-amber-400 bg-amber-500/10 text-amber-200"
                      : "border-slate-600 bg-slate-800/60 hover:bg-slate-700/80"
                  }`}
                >
                  <span className="text-xl mb-1">◑</span>
                  <span>ניגודיות גבוהה</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccLinks(!accLinks)}
                  className={`flex flex-col items-center justify-center rounded-2xl px-3 py-3 border-2 ${
                    accLinks
                      ? "border-amber-400 bg-amber-500/10 text-amber-200"
                      : "border-slate-600 bg-slate-800/60 hover:bg-slate-700/80"
                  }`}
                >
                  <span className="text-xl mb-1">🔗</span>
                  <span>הדגשת קישורים</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccFontSize("normal");
                    setAccContrast(false);
                    setAccLinks(false);
                  }}
                  className="col-span-2 md:col-span-2 flex flex-col items-center justify-center rounded-2xl px-3 py-3 border-2 border-red-500/70 text-red-200 bg-red-900/40 hover:bg-red-900/60"
                >
                  <span className="text-base font-bold mb-1">איפוס הגדרות</span>
                  <span className="text-xs opacity-80">חזרה לברירת המחדל של האתר</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                הנגישות מופעלת בדפדפן שבו פתחת את האתר. ייתכן שחלק מהאפשרויות לא יפעלו בדפדפנים ישנים.
              </p>
            </div>
          </div>
        </div>
      )}

      {productDetailOpen && (
        <ProductDetailSheet
          product={productDetailOpen.product}
          startImageIndex={productDetailOpen.startImageIndex ?? 0}
          onClose={() => setProductDetailOpen(null)}
          onWhatsApp={handleWhatsAppClick}
          onShare={handleShareProduct}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {typeof document !== "undefined" && document.body && window.ReactDOM && window.ReactDOM.createPortal(
        <>
          {/* כפתור ביביפ – מוסתר כשהצ'אט פתוח או כשמוצר פתוח; ניתן לכווץ לבועה קטנה */}
          {!showAiAdvisor && !productDetailOpen && (
            <div style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", zIndex: 99999, isolation: "isolate" }}>
              {!aiCollapsed ? (
                <div className="relative inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowAiAdvisor(true)}
                    className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:scale-105 transition-all border-2 border-white/30 overflow-visible ${siteConfig?.botLogoUrl ? "justify-center" : ""}`}
                    title="התייעץ עם ביביפ"
                    aria-label="התייעץ עם ביביפ"
                    style={{ minHeight: "48px", fontFamily: "'Rubik', sans-serif" }}
                  >
                    {siteConfig?.botLogoUrl ? (
                      <>
                        <span className="absolute right-0 bottom-full mb-0.5">
                          <img src={siteConfig.botLogoUrl} alt="" className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg block" />
                        </span>
                        <span className="font-medium text-[0.95rem]">התייעץ עם ביביפ</span>
                      </>
                    ) : (
                      <>
                        <Bot size={28} className="flex-shrink-0" />
                        <span className="font-medium text-[0.95rem]">התייעץ עם ביביפ</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiCollapsed(true)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-xs hover:bg-black"
                    aria-label="הקטן את ביביפ"
                    title="הקטן את ביביפ"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAiAdvisor(true)}
                  className="w-11 h-11 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white/40 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all"
                  aria-label="פתח את ביביפ"
                  title="פתח את ביביפ"
                >
                  <Bot size={22} />
                </button>
              )}
            </div>
          )}
          {showAiAdvisor && (
            <AiAdvisor
              packages={packages}
              products={products}
              siteConfig={siteConfig}
              onClose={() => setShowAiAdvisor(false)}
              messages={advisorMessages}
              onMessagesChange={setAdvisorMessages}
            />
          )}
        </>,
        document.body
      )}
    </div>
    </EditModeContext.Provider>
  );
}

// --- קומפוננטות משנה ---

function getProviderStripeClass(provider, is5G) {
  const p = (provider && typeof provider === "string" ? provider.toLowerCase() : "") || "";
  if (p.includes("cellcom")) return "bg-purple-700";
  if (p.includes("partner")) return "bg-teal-500";
  if (p.includes("pelephone")) return "bg-blue-500";
  if (p.includes("hot")) return "bg-red-600";
  if (p.includes("019")) return "bg-orange-500";
  if (p.includes("wecom")) return "bg-orange-500";
  if (p.includes("golan")) return "bg-pink-600";
  if (p.includes("bezeq")) return "bg-blue-500";
  if (is5G) return "bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600";
  return "bg-blue-500";
}

function getPackageFeatures(pkg) {
  if (pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0) return pkg.features;
  const list = [];
  if (pkg.dataGB != null && pkg.dataGB > 0) list.push(`גלישה: ${pkg.dataGB} GB`);
  else if (pkg.category !== "kosher" && pkg.category !== "internet") list.push("ללא גלישה");
  if (pkg.calls) list.push(`דקות שיחה: ${pkg.calls}`);
  if (pkg.sms && pkg.sms !== "0") list.push(pkg.sms === "unlimited" ? "הודעות: ללא הגבלה" : `הודעות: ${pkg.sms}`);
  if (pkg.extras) list.push(pkg.extras);
  return list.length ? list : ["פרטים במענה"];
}

function getProviderDisplayName(pkg) {
  const he = pkg.providerNameHe || pkg.providerName || pkg.provider;
  const en = pkg.provider;
  if (he === en || !he) return en;
  return `${he} · ${en}`;
}

function ProviderLogo({ provider, url }) {
  if (url) {
    return (
      <img
        src={url}
        alt={provider}
        className="w-14 h-14 object-contain bg-white rounded-full shadow-sm border border-gray-100"
      />
    );
  }

  let colorClass = "bg-gray-500";
  let initial = provider && typeof provider === "string" ? provider.charAt(0) : "?";

  const pLower = provider && typeof provider === "string" ? provider.toLowerCase() : "";

  if (pLower.includes("cellcom")) {
    colorClass = "bg-purple-600";
    initial = "C";
  } else if (pLower.includes("partner")) {
    colorClass = "bg-cyan-500";
    initial = "P";
  } else if (pLower.includes("pelephone")) {
    colorClass = "bg-blue-600";
    initial = "Pe";
  } else if (pLower.includes("hot")) {
    colorClass = "bg-red-600";
    initial = "H";
  } else if (pLower.includes("019")) {
    colorClass = "bg-orange-500";
    initial = "019";
  } else if (pLower.includes("golan")) {
    colorClass = "bg-lime-500";
    initial = "G";
  } else if (pLower.includes("bezeq")) {
    colorClass = "bg-blue-500";
    initial = "B";
  }

  return (
    <div
      className={`${colorClass} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm`}
    >
      {initial}
    </div>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function ServiceCard({ iconUrl, defaultIcon: DefaultIcon, title, desc }) {
  const titleStr = typeof title === "string" ? title : "";
  return (
    <div className="flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
      <div className="text-blue-600 mb-4 bg-white p-4 rounded-full shadow-sm w-16 h-16 flex items-center justify-center">
        {iconUrl ? (
          <img src={iconUrl} alt={titleStr || "שירות"} className="w-8 h-8 object-contain" />
        ) : (
          <DefaultIcon size={32} />
        )}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function FeatureRow({ label, value }) {
  return (
    <li className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </li>
  );
}

function LocationCard({ city, address, hours, phone }) {
  const wazeQuery = [address, city].filter(Boolean).join(", ");
  const wazeUrl = wazeQuery
    ? `https://www.waze.com/ul?q=${encodeURIComponent(wazeQuery)}`
    : "https://www.waze.com";
  const mapsQuery = [address, city].filter(Boolean).join(", ");
  const mapsSearchUrl = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : "https://www.google.com/maps";
  const mapsEmbedUrl = mapsQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`
    : "";

  return (
    <div className="bg-white rounded-2xl shadow-lg border-t-4 border-blue-600 h-full flex flex-col overflow-hidden">
      {mapsEmbedUrl && (
        <div className="w-full aspect-square max-h-72 bg-slate-100">
          <iframe
            src={mapsEmbedUrl}
            title={`מיקום החנות ${city}`}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="text-blue-600" />
          <h3 className="text-2xl font-bold">{city}</h3>
        </div>

        <div className="space-y-4 text-gray-600 flex-grow">
          <p className="flex items-start gap-3">
            <span className="font-bold min-w-[60px]">כתובת:</span>
            {address}
          </p>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 mt-1 text-gray-400" />
            <div>
              <p className="font-bold text-slate-900 mb-1">שעות פתיחה:</p>
              <div className="whitespace-pre-wrap">{hours}</div>
            </div>
          </div>
          <p className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Phone className="w-5 h-5 text-gray-400" />
            <a
              href={`tel:${phone}`}
              className="font-bold text-xl text-blue-600 hover:underline"
            >
              {phone}
            </a>
          </p>
        </div>
      </div>

      <div className="px-8 pb-6 flex flex-col sm:flex-row gap-3">
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-center"
        >
          נווט ב-Waze
        </a>
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-white text-blue-700 border border-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition text-center"
        >
          פתח בגוגל מפות
        </a>
      </div>
    </div>
  );
}

// --- חלונית פרטי מוצר – כמעט מסך מלא, רקע לבן, מקצועי ---
function ProductDetailSheet({ product, startImageIndex = 0, onClose, onWhatsApp, onShare }) {
  const images = (product.images && product.images.length > 0) ? product.images : (product.imageUrl ? [product.imageUrl] : []);
  const [imageIndex, setImageIndex] = useState(Math.min(startImageIndex, Math.max(0, images.length - 1)));
  const mainImage = images[imageIndex];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-5" dir="rtl">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-md" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-3xl h-[96vh] max-h-[96vh] bg-white rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden border border-slate-100"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 truncate ml-2">פרטי מוצר</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            aria-label="סגור"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {images.length > 0 && (
            <div className="relative bg-slate-50 border-b border-slate-100">
              <div className="aspect-square max-h-[45vh] w-full flex items-center justify-center p-4">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition"
                    aria-label="תמונה קודמת"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition"
                    aria-label="תמונה הבאה"
                  >
                    ›
                  </button>
                  <div className="flex gap-2 justify-center pb-3 flex-wrap px-4">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageIndex(idx)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                          idx === imageIndex ? "border-[#1e3a5f] ring-2 ring-[#1e3a5f]/30" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="p-4 sm:p-6">
            {product.badge && (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-3">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 leading-tight">
              {product.name}
            </h1>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {product.description && (
              <p className="text-slate-600 whitespace-pre-line leading-relaxed mb-6">
                {product.description}
              </p>
            )}
            {product.price != null && product.price !== "" && (
              <p className="text-2xl font-extrabold text-[#1e3a5f] mb-6">
                ₪{formatPrice(product.price)}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onWhatsApp?.({ ...product, category: "product" })}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition shadow-lg shadow-green-500/25"
              >
                <MessageCircle size={20} />
                לפרטים
              </button>
              {onShare && (
                <button
                  type="button"
                  onClick={() => onShare(product)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  <Share2 size={18} />
                  שתף מוצר
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductImageLightbox({ product, images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const goNext = () => setIndex((i) => (i + 1) % images.length);
  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4 bg-black/50 text-white shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-2 rounded-full hover:bg-white/20"
          aria-label="סגור"
        >
          <X size={24} />
        </button>
        <span className="text-sm opacity-90">
          {index + 1} / {images.length}
        </span>
        <div className="w-10" />
      </div>
      <div className="flex-1 flex items-center justify-center min-h-0 p-4 overflow-hidden">
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold hover:bg-white/30"
            aria-label="תמונה קודמת"
          >
            ‹
          </button>
        )}
        <img
          src={images[index]}
          alt={product.name}
          className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg cursor-pointer"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
        />
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold hover:bg-white/30"
            aria-label="תמונה הבאה"
          >
            ›
          </button>
        )}
      </div>
      <div
        className="shrink-0 overflow-y-auto max-h-[35vh] p-4 bg-black/70 text-white rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        {product.price && (
          <p className="text-lg text-blue-200 mb-2">₪{formatPrice(product.price)}</p>
        )}
        {product.description && (
          <p className="text-sm text-gray-200 whitespace-pre-line">
            {product.description}
          </p>
        )}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 flex-wrap justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => { e.stopPropagation(); setIndex(idx); }}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                  idx === index ? "border-white" : "border-white/40 opacity-70"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onWhatsApp, onShare, onOpenDetail }) {
  const images = (product.images && product.images.length > 0) ? product.images : (product.imageUrl ? [product.imageUrl] : []);
  const mainImage = images[0];
  const [expanded, setExpanded] = useState(false);

  const openDetail = (imageIndex) => (e) => {
    e.stopPropagation();
    onOpenDetail?.(product, imageIndex);
  };

  const hasLongDescription = product.description && product.description.trim().length > 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[420px] relative group">
      {mainImage && (
        <div
          className="w-full h-48 sm:h-52 bg-slate-100 flex-shrink-0 relative cursor-pointer overflow-hidden"
          onClick={openDetail(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpenDetail?.(product, 0))}
          title="לחץ לצפייה בפרטי המוצר"
          aria-label={`צפה בפרטי ${product.name}`}
        >
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition group-hover:scale-[1.03] duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-3 py-2 rounded-xl">
              צפה בפרטים
            </span>
          </div>
          {onShare && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onShare(product); }}
              className="absolute top-2 left-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition text-[#1e3a5f]"
              title="שתף מוצר"
              aria-label="שתף מוצר"
            >
              <Share2 size={18} />
            </button>
          )}
        </div>
      )}
      {product.badge && (
        <span className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-orange-500 text-white text-xs font-bold shadow">
          {product.badge}
        </span>
      )}
      <div className="p-4 flex-grow flex flex-col min-h-0">
        <h3
          className="text-lg font-bold text-slate-900 mb-1.5 leading-tight cursor-pointer hover:text-[#1e3a5f] hover:underline decoration-2 underline-offset-2 transition"
          onClick={() => onOpenDetail?.(product, 0)}
          role={onOpenDetail ? "button" : undefined}
          tabIndex={onOpenDetail ? 0 : undefined}
          onKeyDown={(e) => onOpenDetail && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpenDetail(product, 0))}
          title="לחץ לצפייה בפרטי המוצר"
        >
          {product.name}
        </h3>
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className={`text-sm text-gray-600 whitespace-pre-line ${expanded ? "" : "line-clamp-3"} flex-grow min-h-0`}>
          {product.description}
        </p>
        {hasLongDescription && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-orange-500 text-sm font-medium mt-1 self-start hover:underline"
          >
            {expanded ? "הצג פחות" : "הצג עוד"}
          </button>
        )}
        {images.length > 1 && (
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {images.slice(1, 7).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={openDetail(idx + 1)}
                className="w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0 hover:ring-2 hover:ring-orange-400 transition focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-1"
                title="לחץ לצפייה בפרטי המוצר"
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
        <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
          {product.price != null && product.price !== "" && (
            <div className="text-[#1e3a5f] font-extrabold text-xl">
              ₪{formatPrice(product.price)}
            </div>
          )}
          <button
            onClick={() =>
              onWhatsApp({
                ...product,
                category: "product",
              })
            }
            className="px-4 py-2.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 flex items-center gap-1.5 shrink-0"
          >
            <MessageCircle size={16} />
            לפרטים
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Admin modals removed: admin UI moved to admin.html ---

// --- הרצת האפליקציה ---
function mountApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element with id 'root' not found");
    return;
  }
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", mountApp);
} else {
  mountApp();
}

