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

// --- SVG Icons (inline, no external deps, RTL-safe) ---
const Ic = ({ d, size = 20, className = "", fill = "none", stroke = "currentColor", sw = "2", vb = "0 0 24 24", children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={vb} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);

const Phone        = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.36 18a19.5 19.5 0 0 1-4.5-4.5 19.79 19.79 0 0 1-3.93-8.41A2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></Ic>;
const Smartphone   = ({ size=20, className="" }) => <Ic size={size} className={className}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></Ic>;
const Wifi         = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></Ic>;
const MapPin       = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></Ic>;
const Clock        = ({ size=20, className="" }) => <Ic size={size} className={className}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Ic>;
const ShieldCheck  = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></Ic>;
const Plus         = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M12 5v14M5 12h14"/></Ic>;
const Trash2       = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></Ic>;
const Edit2        = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Ic>;
const Menu         = ({ size=24, className="" }) => <Ic size={size} className={className}><path d="M3 12h18M3 6h18M3 18h18"/></Ic>;
const X            = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M18 6 6 18M6 6l12 12"/></Ic>;
const Lock         = ({ size=20, className="" }) => <Ic size={size} className={className}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Ic>;
const LogOut       = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Ic>;
const Zap          = ({ size=20, className="" }) => <Ic size={size} className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Ic>;
const Signal       = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20v-2"/></Ic>;
const RefreshCw    = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></Ic>;
const Settings     = ({ size=20, className="" }) => <Ic size={size} className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ic>;
const MessageCircle= ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Ic>;
const ImageIcon    = ({ size=20, className="" }) => <Ic size={size} className={className}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></Ic>;
const Check        = ({ size=20, className="" }) => <Ic size={size} className={className}><path d="M20 6 9 17l-5-5"/></Ic>;
const Accessibility= ({ size=20, className="" }) => <Ic size={size} className={className}><circle cx="12" cy="4" r="1"/><path d="m9 9 3 3v8M6 12l6-3 6 3M12 12v5l3 3"/></Ic>;
const Search       = ({ size=20, className="" }) => <Ic size={size} className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></Ic>;
const ChevronDown  = ({ size=16, className="" }) => <Ic size={size} className={className}><path d="m6 9 6 6 6-6"/></Ic>;
const Star         = ({ size=16, className="" }) => <Ic size={size} className={className} fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Ic>;
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

// --- חבילות סלולר ואינטרנט — נתונים מסים פלוס (ideali) אפריל 2026 ---




const MARKET_DEALS = [
  // ══════════════════════ דור 5 ══════════════════════

  // פרטנר 5G
  { provider: "Partner", providerName: "פרטנר", name: "דור 5 golden", priceDetail: "דור 5 golden", price: 39.9, category: "5g", dataGB: 500, calls: "5000 דקות", is5G: true, logoUrl: "./logos/partner.png", isHot: true, features: ["500 GB גלישה", "5000 דקות שיחה", "5000 הודעות"] },
  { provider: "Partner", providerName: "פרטנר", name: "Queen 5G", priceDetail: "Queen 5G", price: 49.9, category: "5g", dataGB: 500, calls: "5000 דקות", is5G: true, logoUrl: "./logos/partner.png", isHot: false, features: ["500 GB גלישה", "5000 דקות שיחה", "5000 הודעות"] },
  { provider: "Partner", providerName: "פרטנר", name: "King 5G", priceDetail: "King 5G", price: 59.9, category: "5g", dataGB: 800, calls: "6000 דקות", is5G: true, logoUrl: "./logos/partner.png", isHot: false, features: ["800 GB גלישה", "6000 דקות שיחה", "6000 הודעות"] },

  // סלקום 5G
  { provider: "Cellcom", providerName: "סלקום", name: "סלקום בשבילך 59.9", priceDetail: "800GB | 2 חודשים ב-59.9₪", price: 39.9, category: "5g", dataGB: 800, calls: "5000 דקות", is5G: true, logoUrl: "./logos/cellcom.png", isHot: true, features: ["800 GB גלישה", "5000 דקות שיחה", "2 חודשים ב-59.9₪"] },
  { provider: "Cellcom", providerName: "סלקום", name: "סלקום בשבילך 49.9 לזוג", priceDetail: "800GB | לזוג ב-49.9₪", price: 39.9, category: "5g", dataGB: 800, calls: "5000 דקות", is5G: true, logoUrl: "./logos/cellcom.png", isHot: false, features: ["800 GB גלישה", "5000 דקות שיחה", "לזוג ב-49.9₪"] },
  { provider: "Cellcom", providerName: "סלקום", name: "5G PRO כולל חול", priceDetail: "1500GB + גלישה בחו\"ל", price: 119.9, category: "5g", dataGB: 1500, calls: "5000 דקות", is5G: true, logoUrl: "./logos/cellcom.png", isHot: false, features: ["1500 GB גלישה", "5000 דקות שיחה", "גלישה בחו\"ל כלולה"] },

  // גולן 5G
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "מבצע דור 5 לזוג", priceDetail: "750GB | לזוג ב-35₪", price: 39.0, category: "5g", dataGB: 750, calls: "5000 דקות", is5G: true, logoUrl: "./logos/golan.png", isHot: true, features: ["750 GB גלישה", "5000 דקות שיחה", "לזוג ב-35₪"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "3 חודשים ב-39₪", priceDetail: "750GB | 3 חודשים ב-39₪", price: 49.0, category: "5g", dataGB: 750, calls: "5000 דקות", is5G: true, logoUrl: "./logos/golan.png", isHot: false, features: ["750 GB גלישה", "5000 דקות שיחה", "5000 הודעות"] },

  // הוט 5G
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "דור 5 - 2 ב-70₪", priceDetail: "300GB | 2 קווים ב-70₪", price: 39.9, category: "5g", dataGB: 300, calls: "3500 דקות", is5G: true, logoUrl: "./logos/hot.png", isHot: true, features: ["300 GB גלישה", "3500 דקות שיחה", "2 קווים ב-70₪"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "BASIC דור 5", priceDetail: "BASIC דור 5", price: 45.9, category: "5g", dataGB: 600, calls: "4000 דקות", is5G: true, logoUrl: "./logos/hot.png", isHot: false, features: ["600 GB גלישה", "4000 דקות שיחה", "4000 הודעות"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "5G Premium כולל חול", priceDetail: "2500GB + גלישה בחו\"ל", price: 89.0, category: "5g", dataGB: 2500, calls: "8000 דקות", is5G: true, logoUrl: "./logos/hot.png", isHot: false, features: ["2500 GB גלישה", "8000 דקות שיחה", "גלישה בחו\"ל כלולה"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "5G Premium MAX כולל חול", priceDetail: "3000GB + גלישה בחו\"ל", price: 109.9, category: "5g", dataGB: 3000, calls: "10000 דקות", is5G: true, logoUrl: "./logos/hot.png", isHot: false, features: ["3000 GB גלישה", "10000 דקות שיחה", "גלישה בחו\"ל כלולה"] },

  // פלאפון 5G
  { provider: "Pelephone", providerName: "פלאפון", name: "מבצע דור 5 - 33₪ לשלושה", priceDetail: "500GB | 3 מנויים ב-33₪", price: 33.0, category: "5g", dataGB: 500, calls: "5000 דקות", is5G: true, logoUrl: "./logos/pelephone.png", isHot: true, features: ["500 GB גלישה", "5000 דקות שיחה", "3 מנויים ב-33₪"] },
  { provider: "Pelephone", providerName: "פלאפון", name: "800 גיגה דור 5", priceDetail: "800GB דור 5", price: 39.9, category: "5g", dataGB: 800, calls: "5000 דקות", is5G: true, logoUrl: "./logos/pelephone.png", isHot: false, features: ["800 GB גלישה", "5000 דקות שיחה", "5000 הודעות"] },
  { provider: "Pelephone", providerName: "פלאפון", name: "1000 גיגה דור 5", priceDetail: "1000GB | חודשיים ב-35₪", price: 49.9, category: "5g", dataGB: 1000, calls: "5000 דקות", is5G: true, logoUrl: "./logos/pelephone.png", isHot: false, features: ["1000 GB גלישה", "5000 דקות שיחה", "5000 הודעות"] },
  { provider: "Pelephone", providerName: "פלאפון", name: "5G חודשיים ב-44.9", priceDetail: "2000GB | חודשיים ב-44.9₪", price: 59.9, category: "5g", dataGB: 2000, calls: "5000 דקות", is5G: true, logoUrl: "./logos/pelephone.png", isHot: false, features: ["2000 GB גלישה", "5000 דקות שיחה", "5000 הודעות"] },

  // wecom 5G
  { provider: "WeCom", providerName: "wecom", name: "wecomFree 5G", priceDetail: "wecomFree 5G", price: 35.0, category: "5g", dataGB: 10000, calls: "5000 דקות", is5G: true, logoUrl: "./logos/wecom.png", isHot: true, features: ["10,000 GB גלישה", "5000 דקות שיחה", "3000 הודעות"] },
  { provider: "WeCom", providerName: "wecom", name: "מבצע עצמאות 5G", priceDetail: "10,000GB | חודש ראשון חינם", price: 35.0, category: "5g", dataGB: 10000, calls: "5000 דקות", is5G: true, logoUrl: "./logos/wecom.png", isHot: false, features: ["10,000 GB גלישה", "5000 דקות שיחה", "חודש ראשון חינם"] },
  { provider: "WeCom", providerName: "wecom", name: "wecom300GB 5G", priceDetail: "wecom300GB 5G", price: 34.0, category: "5g", dataGB: 300, calls: "5000 דקות", is5G: true, logoUrl: "./logos/wecom.png", isHot: false, features: ["300 GB גלישה", "5000 דקות שיחה", "3000 הודעות"] },
  { provider: "WeCom", providerName: "wecom", name: "wecomFree 5G MAX", priceDetail: "wecomFree 5G MAX", price: 39.9, category: "5g", dataGB: 10000, calls: "5000 דקות", is5G: true, logoUrl: "./logos/wecom.png", isHot: false, features: ["10,000 GB גלישה", "5000 דקות שיחה", "3000 הודעות"] },
  { provider: "WeCom", providerName: "wecom", name: "wefunGlobal 5G", priceDetail: "7000GB + גלישה בחו\"ל", price: 59.9, category: "5g", dataGB: 7000, calls: "3000 דקות", is5G: true, logoUrl: "./logos/wecom.png", isHot: false, features: ["7000 GB גלישה", "3000 דקות שיחה", "גלישה בחו\"ל כלולה"] },

  // ══════════════════════ דור 4 ══════════════════════

  // פרטנר 4G
  { provider: "Partner", providerName: "פרטנר", name: "STAR 2 ומעלה ב-30₪", priceDetail: "לזוג ומעלה ב-30₪ | בודד 39.9₪", price: 39.9, category: "4g", dataGB: 400, calls: "3500 דקות", is5G: false, logoUrl: "./logos/partner.png", isHot: false, features: ["400 GB גלישה", "3500 דקות שיחה", "לזוג ב-30₪"] },

  // סלקום 4G
  { provider: "Cellcom", providerName: "סלקום", name: "סלקום מושלם", priceDetail: "סלקום מושלם", price: 39.9, category: "4g", dataGB: 400, calls: "3500 דקות", is5G: false, logoUrl: "./logos/cellcom.png", isHot: false, features: ["400 GB גלישה", "3500 דקות שיחה", "3500 הודעות"] },
  { provider: "Cellcom", providerName: "סלקום", name: "סלקום אקסטרה", priceDetail: "סלקום אקסטרה", price: 39.9, category: "4g", dataGB: 400, calls: "3500 דקות", is5G: false, logoUrl: "./logos/cellcom.png", isHot: false, features: ["400 GB גלישה", "3500 דקות שיחה", "3500 הודעות"] },

  // גולן 4G
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "קיץ 2025", priceDetail: "קיץ 2025", price: 29.9, category: "4g", dataGB: 350, calls: "4000 דקות", is5G: false, logoUrl: "./logos/golan.png", isHot: true, features: ["350 GB גלישה", "4000 דקות שיחה", "4000 הודעות"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "2 קווים ב-60₪", priceDetail: "2 קווים ב-60₪ סה\"כ", price: 30.0, category: "4g", dataGB: 350, calls: "4000 דקות", is5G: false, logoUrl: "./logos/golan.png", isHot: false, features: ["350 GB גלישה", "4000 דקות שיחה", "4000 הודעות"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "1000 גיגה עצמאות", priceDetail: "3 מנויים ב-99₪", price: 33.0, category: "4g", dataGB: 1000, calls: "4000 דקות", is5G: false, logoUrl: "./logos/golan.png", isHot: false, features: ["1000 GB גלישה", "4000 דקות שיחה", "3 מנויים ב-99₪"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "300 גיגה + חו\"ל", priceDetail: "300GB + 240 דק' לחו\"ל", price: 34.9, category: "4g", dataGB: 300, calls: "4000 דקות", is5G: false, logoUrl: "./logos/golan.png", isHot: false, features: ["300 GB גלישה", "4000 דקות שיחה", "240 דקות לחו\"ל"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "חודשיים ב-24.90₪", priceDetail: "חודשיים ראשונים ב-24.90₪", price: 34.9, category: "4g", dataGB: 400, calls: "4000 דקות", is5G: false, logoUrl: "./logos/golan.png", isHot: false, features: ["400 GB גלישה", "4000 דקות שיחה", "4000 הודעות"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "משפחתית 3 קווים", priceDetail: "3 קווים ב-92.70₪ סה\"כ", price: 92.7, category: "4g", dataGB: 0, calls: "4000 דקות", is5G: false, logoUrl: "./logos/golan.png", isHot: false, features: ["4000 דקות שיחה", "4000 הודעות", "3 קווים ב-92.70₪ סה\"כ"] },

  // הוט 4G
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "150 גיגה", priceDetail: "150 GB", price: 25.9, category: "4g", dataGB: 150, calls: "3000 דקות", is5G: false, logoUrl: "./logos/hot.png", isHot: false, features: ["150 GB גלישה", "3000 דקות שיחה", "3000 הודעות"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "200 גיגה מחיר לשנה", priceDetail: "200GB מחיר שנתי", price: 27.9, category: "4g", dataGB: 200, calls: "3000 דקות", is5G: false, logoUrl: "./logos/hot.png", isHot: false, features: ["200 GB גלישה", "3000 דקות שיחה", "3000 הודעות"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "25 למנוי לזוג ומעלה", priceDetail: "לזוג ומעלה ב-25₪", price: 29.9, category: "4g", dataGB: 250, calls: "3000 דקות", is5G: false, logoUrl: "./logos/hot.png", isHot: true, features: ["250 GB גלישה", "3000 דקות שיחה", "לזוג ב-25₪"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "30 למנוי 3 ומעלה", priceDetail: "3 ומעלה ב-30₪", price: 39.9, category: "4g", dataGB: 400, calls: "3500 דקות", is5G: false, logoUrl: "./logos/hot.png", isHot: false, features: ["400 GB גלישה", "3500 דקות שיחה", "3 מנויים ב-30₪"] },

  // פלאפון 4G
  { provider: "Pelephone", providerName: "פלאפון", name: "מבצע 300 GB", priceDetail: "300 GB", price: 29.9, category: "4g", dataGB: 300, calls: "3000 דקות", is5G: false, logoUrl: "./logos/pelephone.png", isHot: false, features: ["300 GB גלישה", "3000 דקות שיחה", "3000 הודעות"] },
  { provider: "Pelephone", providerName: "פלאפון", name: "400 גיגה 5 ומעלה ב-28₪", priceDetail: "5 ומעלה ב-28₪", price: 39.0, category: "4g", dataGB: 400, calls: "3500 דקות", is5G: false, logoUrl: "./logos/pelephone.png", isHot: false, features: ["400 GB גלישה", "3500 דקות שיחה", "5+ ב-28₪"] },

  // wecom 4G
  { provider: "WeCom", providerName: "wecom", name: "wecom300GB 4G", priceDetail: "wecom300GB 4G", price: 28.0, category: "4g", dataGB: 300, calls: "5000 דקות", is5G: false, logoUrl: "./logos/wecom.png", isHot: false, features: ["300 GB גלישה", "5000 דקות שיחה", "3000 הודעות"] },
  { provider: "WeCom", providerName: "wecom", name: "wecomFamily 4G", priceDetail: "לזוג ומעלה", price: 29.9, category: "4g", dataGB: 10000, calls: "5000 דקות", is5G: false, logoUrl: "./logos/wecom.png", isHot: true, features: ["10,000 GB גלישה", "5000 דקות שיחה", "לזוג ומעלה"] },
  { provider: "WeCom", providerName: "wecom", name: "wecomFree 4G", priceDetail: "wecomFree 4G", price: 34.9, category: "4g", dataGB: 10000, calls: "5000 דקות", is5G: false, logoUrl: "./logos/wecom.png", isHot: false, features: ["10,000 GB גלישה", "5000 דקות שיחה", "3000 הודעות"] },
  { provider: "WeCom", providerName: "wecom", name: "wefunGlobal + חו\"ל", priceDetail: "7000GB + גלישה בחו\"ל", price: 49.9, category: "4g", dataGB: 7000, calls: "3000 דקות", is5G: false, logoUrl: "./logos/wecom.png", isHot: false, features: ["7000 GB גלישה", "3000 דקות שיחה", "גלישה בחו\"ל כלולה"] },

  // ══════════════════════ כשר ══════════════════════

  // גולן כשר
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "כשר 5000 דקות", priceDetail: "5000 דקות", price: 25.0, category: "kosher", dataGB: 0, calls: "5000 דקות", is5G: false, logoUrl: "./logos/golan.png", isHot: false, features: ["5000 דקות שיחה", "ללא אינטרנט/SMS", "קו כשר"] },
  { provider: "Golan Telecom", providerName: "גולן טלקום", name: "כשר 7000 דקות", priceDetail: "7000 דקות | מחיר קבוע", price: 27.9, category: "kosher", dataGB: 0, calls: "7000 דקות", is5G: false, logoUrl: "./logos/golan.png", isHot: true, features: ["7000 דקות שיחה", "ללא אינטרנט/SMS", "קו כשר"] },

  // הוט כשר
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "כשר 25 לזוג", priceDetail: "לזוג ב-25₪ | בודד 26₪", price: 26.0, category: "kosher", dataGB: 0, calls: "5000 דקות", is5G: false, logoUrl: "./logos/hot.png", isHot: true, features: ["5000 דקות שיחה", "ללא אינטרנט/SMS", "קו כשר"] },
  { provider: "Hot Mobile", providerName: "הוט מובייל", name: "כשר 10000 דקות + חודש חינם", priceDetail: "קו שני ב-30₪ | חודש ראשון חינם", price: 39.0, category: "kosher", dataGB: 0, calls: "10000 דקות", is5G: false, logoUrl: "./logos/hot.png", isHot: false, features: ["10000 דקות שיחה", "ללא אינטרנט/SMS", "חודש ראשון חינם"] },

  // סלקום כשר
  { provider: "Cellcom", providerName: "סלקום", name: "כשר קו בודד 29₪", priceDetail: "בודד 29₪ | לזוג ב-25₪", price: 29.0, category: "kosher", dataGB: 0, calls: "4000 דקות", is5G: false, logoUrl: "./logos/cellcom.png", isHot: true, features: ["4000 דקות שיחה", "ללא אינטרנט/SMS", "לזוג ב-25₪"] },
  { provider: "Cellcom", providerName: "סלקום", name: "כשר 5000 דקות 35₪", priceDetail: "5000 דקות | 2+ ב-30₪", price: 35.0, category: "kosher", dataGB: 0, calls: "5000 דקות", is5G: false, logoUrl: "./logos/cellcom.png", isHot: false, features: ["5000 דקות שיחה", "ללא אינטרנט/SMS", "2+ ב-30₪"] },

  // פלאפון כשר
  { provider: "Pelephone", providerName: "פלאפון", name: "כשר ללא הגבלה", priceDetail: "2 ומעלה ב-20₪", price: 29.9, category: "kosher", dataGB: 0, calls: "4000 דקות", is5G: false, logoUrl: "./logos/pelephone.png", isHot: false, features: ["4000 דקות שיחה", "ללא אינטרנט/SMS", "2+ ב-20₪"] },
  { provider: "Pelephone", providerName: "פלאפון", name: "קו כשר 25 לזוג", priceDetail: "לזוג ב-25₪", price: 33.0, category: "kosher", dataGB: 0, calls: "4200 דקות", is5G: false, logoUrl: "./logos/pelephone.png", isHot: false, features: ["4200 דקות שיחה", "ללא אינטרנט/SMS", "לזוג ב-25₪"] },

  // פרטנר כשר
  { provider: "Partner", providerName: "פרטנר", name: "כשר 25 לזוג ומעלה", priceDetail: "לזוג ב-25₪ | 6000 דקות", price: 29.9, category: "kosher", dataGB: 0, calls: "6000 דקות", is5G: false, logoUrl: "./logos/partner.png", isHot: false, features: ["6000 דקות שיחה", "ללא אינטרנט/SMS", "לזוג ב-25₪"] },

  // ══════════════════════ אינטרנט ══════════════════════
  { provider: "Cellcom", providerName: "סלקום פייבר", price: 39, priceDetail: "לחודש (למשך 3 חודשים)", category: "internet", dataGB: 0, calls: 0, is5G: false, logoUrl: "./logos/cellcom.png", isHot: true, badge: "מבצע מטורף", afterPrice: "מחיר המשך 99 ₪", features: ["אינטרנט סיבים עוצמתי", "ראוטר WiFi 7 כלול", "מגדיל טווח כלול!", "התקנה מהירה"] },
  { provider: "Cellcom", providerName: "סלקום טריפל", price: 89, priceDetail: "לחודש (למשך 3 חודשים)", category: "internet", dataGB: 0, calls: 0, is5G: false, logoUrl: "./logos/cellcom.png", isHot: true, badge: "טריפל שובר שוק", afterPrice: "מחיר המשך 149 ₪", features: ["טלוויזיה + אינטרנט סיבים", "ראוטר WiFi 7 כלול", "מגדיל טווח כלול", "ממיר אחד כלול"] },
  { provider: "Hot Mobile", providerName: "HOT סיבים 1000/100", price: 99, priceDetail: "לחודש (למשך שנה)", category: "internet", dataGB: 0, calls: 0, is5G: false, logoUrl: "./logos/hot.png", isHot: false, features: ["מהירות עד 1000Mbps", "נתב ומגדיל טווח כלול", "התקנה חינם (בניין דירות)"] },
  { provider: "Hot Mobile", providerName: "HOT סיבים 600/100", price: 89, priceDetail: "לחודש (למשך שנה)", category: "internet", dataGB: 0, calls: 0, is5G: false, logoUrl: "./logos/hot.png", isHot: false, features: ["מהירות עד 600Mbps", "נתב ומגדיל טווח כלול", "התקנה חינם (בניין דירות)"] },
  { provider: "Hot Mobile", providerName: "HOT טריפל NEXT + סיבים 1000", price: 135, priceDetail: "לחודש", category: "internet", dataGB: 0, calls: 0, is5G: false, logoUrl: "./logos/hot.png", isHot: true, badge: "הכל כלול", features: ["אינטרנט סיבים 1000Mbps", "טלוויזיה NEXT עם VOD", "סטרימר 65 ערוצים", "ראוטר ומגדיל טווח כלול"] },
  { provider: "Bezeq Fiber", providerName: "בזק סיבים", price: 119, priceDetail: "לחודש", category: "internet", dataGB: 0, calls: 0, is5G: false, logoUrl: "./logos/bezeq.svg", isHot: false, features: ["כולל נתב Be", "מהירות עד 2.5Gb", "סיבים אופטיים"] },
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
  navPackages: "חבילות סלולר",
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
      phone: "0527151000",
      phoneDisplay: "0527151000 שלוחה 2",
      hours: "א'-ה': 10:00 - 21:00\nימי ו' וערבי חג:\nחורף 10:00 - 13:00\nקיץ 10:00 - 14:00",
    },
    {
      id: "beitar",
      city: "ביתר עילית",
      address: "המגיד ממעזריטש 71, ביתר עילית",
      phone: "0527151000",
      phoneDisplay: "0527151000 שלוחה 1",
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
  const [activeCarrier, setActiveCarrier] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [packagesVisibleCount, setPackagesVisibleCount] = useState(6);
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
  const [quickLead, setQuickLead] = useState(null); // { productName, waUrl }
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
    const sku = (pkg.sku || "").toString().trim();
    const name = pkg.name || pkg.providerName || pkg.provider || "מוצר";
    const pricePart =
      pkg.price != null && pkg.price !== ""
        ? `${formatPrice(pkg.price)} ₪`
        : "";

    let line;
    if (pkg.category === "product") {
      line = `אשמח למידע/רכישה על מוצר${sku ? ` מק״ט ${sku}` : ""} – ${name}${pricePart ? ` (${pricePart})` : ""}.`;
    } else {
      const kind =
        pkg.category === "internet"
          ? "חבילת אינטרנט"
          : "חבילת סלולר";
      line = `אשמח למידע/הצטרפות על ${kind}${sku ? ` מק״ט ${sku}` : ""} – ${name}${pricePart ? ` (${pricePart})` : ""}.`;
    }

    const text = `היי B-Phone, הגעתי מהאתר.\n${line}`;
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
    const productName = pkg.providerName || pkg.name || "";
    setQuickLead({ productName, waUrl: url });
  };

  const handleShareProduct = async (product) => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const productUrl = `${base}/product/${product.id || ""}`;
    const mainLine = `${product.name || "מוצר"}${product.price != null && product.price !== "" ? ` - ${formatPrice(product.price)} ₪` : ""} | B-Phone ביפון`;
    const waFullUrl = buildWhatsAppUrlForItem({ ...product, category: "product" });

    const waText = buildWhatsAppTextForItem({ ...product, category: "product" });
    const fullText = `${mainLine}\n\n${waText}\n\n1) הצג באתר:\n${productUrl}\n\n2) לפרטים בוואטסאפ:\n${waFullUrl}`;
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

  // (שמירת תמיכה עתידית בקישורי וואטסאפ נעשית בצד הלקוח – אין קישורי קיצור דרך האתר כרגע)
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

  // --- סינון חבילות (טאב + חיפוש חופשי: חברה, מחיר, סוג, כשר, מק״ט וכו') ---
  const filteredPackages = packages.filter((pkg) => {
    if (activeTab !== "all" && pkg.category !== activeTab) return false;
    if (activeCarrier !== "all" && pkg.provider !== activeCarrier) return false;
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return true;
    const searchable = [
      pkg.sku,
      pkg.name,
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
      .join(" ")
      .toLowerCase();
    return searchable.includes(q);
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => (a.price || 0) - (b.price || 0));
  const showAllFromSearch = (searchQuery || "").trim().length > 0;
  const displayedPackages = showAllFromSearch ? sortedPackages : sortedPackages.slice(0, packagesVisibleCount);
  const hasMorePackages = !showAllFromSearch && sortedPackages.length > packagesVisibleCount;

  const filteredProducts = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return [...products];
    return products.filter((p) => {
      const searchable = [
        p.sku,
        p.name,
        (p.tags || []).join(" "),
        p.description,
        String(p.price ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [products, searchQuery]);

  const sortedProducts = useMemo(
    () => [...filteredProducts].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)),
    [filteredProducts]
  );
  const displayedProducts = showAllFromSearch ? sortedProducts : sortedProducts.slice(0, productsVisibleCount);
  const hasMoreProducts = !isAdmin && !showAllFromSearch && sortedProducts.length > productsVisibleCount;

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
          מצב עריכה – לחץ על כל טקסט כדי לערוך, לשנות או למחוק. השינויים נשמרים אוטומטית.
        </div>
      )}
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo — החלף את logoUrl בקובץ ה-index.html כדי לשנות לוגו */}
            <a href="#" className="flex items-center gap-2 hover:opacity-85 transition">
              {siteConfig.logoUrl ? (
                <img src={siteConfig.logoUrl} alt="ביפון B-Phone" className="h-14 w-auto object-contain" />
              ) : (
                <>
                  <div className="bg-[#1e3a5f] p-2 rounded-lg">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#1e3a5f] leading-none">ביפון</div>
                    <div className="text-xs text-slate-500 leading-tight">תקשורת סלולרית</div>
                  </div>
                </>
              )}
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {[["#promos","מבצעים"],["#packages","חבילות"],["#products","מוצרים"],["#services","שירותים"],["#locations","סניפים"],["#contact","יצירת קשר"]].map(([href,label]) => (
                <a key={href} href={href} className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-[#1e3a5f] hover:bg-blue-50/70 rounded-xl transition-all">{label}</a>
              ))}
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="mr-2 flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#1e3a5f] transition"
                title="חיפוש" aria-label="חיפוש"
              >
                <Search size={18} />
              </button>
              <a
                href={`https://wa.me/972${(siteConfig.whatsapp||'0527151000').replace(/^0/,'').replace(/\D/g,'')}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm mr-2 flex items-center gap-1.5"
              >
                <Phone size={16} />
                WhatsApp
              </a>
            </div>

            {/* Mobile: search + hamburger */}
            <div className="md:hidden flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                aria-label="חיפוש"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition focus:outline-none"
                aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 shadow-lg pb-5">
            <div className="flex flex-col px-5 pt-3">
              {[["#promos","מבצעים"],["#packages","חבילות"],["#products","מוצרים"],["#services","שירותים"],["#locations","סניפים"],["#contact","יצירת קשר"]].map(([href,label]) => (
                <a
                  key={href} href={href}
                  className="py-3.5 text-slate-700 font-semibold hover:text-[#1e3a5f] border-b border-slate-100 transition flex items-center justify-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                  <span className="text-slate-300 text-lg">‹</span>
                </a>
              ))}
              <a
                href={`https://wa.me/972${(siteConfig.whatsapp||'0527151000').replace(/^0/,'').replace(/\D/g,'')}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-5 btn btn-whatsapp flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* פאנל חיפוש – בתוך ה-nav כדי להישאר sticky */}
        {searchOpen && (
          <div className="bg-white border-t border-gray-100 py-3 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                placeholder="חיפוש לפי שם מוצר, חבילה או מק״ט..."
                className="flex-1 rounded-xl border border-gray-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-lg hover:bg-slate-200 transition"
                title="סגור חיפוש"
                aria-label="סגור חיפוש"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <div
        id="promos"
        className="relative overflow-hidden min-h-[280px] sm:min-h-[380px] flex flex-col justify-center"
        style={hasBanner ? {background:"#1e3a5f"} : {background:"#ffffff"}}
      >
        {/* Banner images */}
        {hasBanner && useBannerRotation && heroBanners.map((url, i) => (
          <div
            key={url}
            className="absolute inset-0 transition-opacity duration-[1.2s] ease-in-out"
            style={{
              backgroundImage: `url(${url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: i === bannerIndex ? 1 : 0,
              zIndex: i === bannerIndex ? 1 : 0,
              pointerEvents: "none",
            }}
          />
        ))}
        {hasBanner && !useBannerRotation && heroBanners[heroDefaultBannerIndex] && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${heroBanners[heroDefaultBannerIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}
        {/* Overlay – רק כשיש תמונת באנר */}
        {hasBanner && <div className="absolute inset-0 bg-slate-900/50 z-[2]" aria-hidden />}
        {/* קו גבול תחתון עדין – ללא באנר */}
        {!hasBanner && <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200" aria-hidden />}

        <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16 sm:px-8 relative z-10 text-center">
          {((t.heroBadge||"").trim()||isEditMode) && (
            <span className={`inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs font-semibold mb-4 fade-up ${hasBanner ? "bg-white/15 border border-white/30 text-white/90" : "bg-orange-50 border border-orange-200 text-orange-600"}`}>
              <EditableText type="siteTexts" editKey="heroBadge" value={t.heroBadge} />
            </span>
          )}
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight fade-up ${hasBanner ? "text-white" : "text-slate-900"}`} style={{animationDelay:".05s", fontFamily:"'Heebo',sans-serif"}}>
            <EditableText type="promo" editKey="title" value={promoMessage.title} as="span" />
          </h2>
          <p className={`text-base sm:text-lg max-w-xl mx-auto mb-8 fade-up font-normal ${hasBanner ? "text-white/80" : "text-slate-500"}`} style={{animationDelay:".1s"}}>
            <EditableText type="promo" editKey="subtitle" value={promoMessage.subtitle} as="span" />
          </p>
          <div className="flex flex-wrap justify-center gap-3 fade-up" style={{animationDelay:".15s"}}>
            {v.packages !== false && ((t.btnAllPackages||"").trim()||isEditMode) && (
              <a href="#packages" className="btn btn-primary px-6 py-3 text-sm">
                <EditableText type="siteTexts" editKey="btnAllPackages" value={t.btnAllPackages} placeholder="לכל החבילות" />
              </a>
            )}
            {v.locations !== false && ((t.btnFindBranch||"").trim()||isEditMode) && (
              <a href="#locations" className={`btn px-6 py-3 text-sm ${hasBanner ? "" : "btn-ghost"}`} style={hasBanner ? {borderColor:"rgba(255,255,255,.5)",color:"#fff",background:"transparent",border:"1.5px solid rgba(255,255,255,.5)",borderRadius:".75rem"} : {}}>
                <EditableText type="siteTexts" editKey="btnFindBranch" value={t.btnFindBranch} placeholder="מצא סניף קרוב" />
              </a>
            )}
            {hasFeatured && v.featured !== false && (
              <a href="#featured" className={`btn px-6 py-3 text-sm ${hasBanner ? "" : "btn-ghost"}`} style={hasBanner ? {borderColor:"rgba(255,255,255,.5)",color:"#fff",background:"transparent",border:"1.5px solid rgba(255,255,255,.5)",borderRadius:".75rem"} : {}}>
                <EditableText type="siteTexts" editKey="navFeatured" value={t.navFeatured} placeholder="מבצעים מומלצים" />
              </a>
            )}
          </div>
          {/* Trust chips */}
          <div className="flex flex-wrap justify-center gap-5 mt-8 fade-up" style={{animationDelay:".2s"}}>
            {[["ShieldCheck","ניסיון 10+ שנה"],["Smartphone","שני סניפים"],["Clock","שירות 6 ימים"]].map(([ic,label])=>(
              <span key={label} className={`flex items-center gap-1.5 text-xs font-medium ${hasBanner ? "text-white/70" : "text-slate-400"}`}>
                {ic==="ShieldCheck" && <ShieldCheck size={13}/>}
                {ic==="Smartphone"  && <Smartphone size={13}/>}
                {ic==="Clock"       && <Clock size={13}/>}
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center items-center gap-6 sm:gap-12">
          {[["500+","לקוחות מרוצים"],["10+","שנות ניסיון"],["2","סניפים פעילים"],["6","ימי שירות"]].map(([num,label], i, arr) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold text-[#1e3a5f]">{num}</span>
                <span className="text-xs text-slate-500 font-medium">{label}</span>
              </div>
              {i < arr.length - 1 && <div className="trust-divider hidden sm:block" />}
            </React.Fragment>
          ))}
          <div className="trust-divider hidden sm:block" />
          <div className="flex flex-wrap justify-center items-center gap-2">
            {["סלקום","פרטנר","הוט","גולן","פלאפון","wecom"].map(name => (
              <span key={name} className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full hover:border-slate-300 transition">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* מבצעים מומלצים */}
      {v.featured !== false && hasFeatured && (
        <section id="featured" className="py-20 bg-slate-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              {(((t.featuredBadge ?? "").trim()) !== "" || isEditMode) && (
                <span className="section-label"><EditableText type="siteTexts" editKey="featuredBadge" value={t.featuredBadge} placeholder="ההמלצות שלנו" /></span>
              )}
              {(((t.featuredTitle ?? "").trim()) !== "" || isEditMode) && (
                <h2 className="section-title"><EditableText type="siteTexts" editKey="featuredTitle" value={t.featuredTitle} as="span" placeholder="מבצעים מומלצים" /></h2>
              )}
              {(((t.featuredSubtitle ?? "").trim()) !== "" || isEditMode) && (
                <p className="section-sub"><EditableText type="siteTexts" editKey="featuredSubtitle" value={t.featuredSubtitle} as="span" placeholder="מוצרים וחבילות שנבחרו במיוחד – במחיר משתלם" /></p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {featuredProducts.map((product) => (
                <div key={`p-${product.id}`} className="flex flex-col" id={`product-${product.id || ""}`}>
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
                    className="bp-card flex flex-col overflow-hidden pkg-stripe"
                  >
                    <div className={`${headerClass} px-4 pt-4 pb-4 text-white text-center relative flex-shrink-0`}>
                      <div className="section-label absolute top-2 right-2 !mb-0 !rounded-lg z-10">מומלץ</div>
                      {pkg.logoUrl ? (
                        <img src={pkg.logoUrl} alt={displayName} className="w-14 h-14 object-contain bg-white rounded-full p-1 shadow-md border-2 border-white/40 mx-auto mb-2" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 border-2 border-white/40">
                          <ProviderLogo provider={pkg.provider} url={null} />
                        </div>
                      )}
                      <h3 className="text-base font-bold">{displayName}</h3>
                      <div className="flex justify-center items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold">{formatPrice(pkg.price)}</span>
                        <span className="text-lg font-semibold">₪</span>
                      </div>
                      <p className="text-xs opacity-80">/חודש</p>
                      {pkg.priceDetail && <p className="text-xs opacity-90 mt-1">{pkg.priceDetail}</p>}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <ul className="space-y-2 mb-4 text-sm text-slate-700">
                        {features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check size={14} className="text-emerald-500 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleWhatsAppClick(pkg)}
                        className="btn btn-whatsapp w-full mt-auto"
                      >
                        <MessageCircle size={18} />
                        להצטרפות
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8 flex flex-wrap justify-center gap-3">
              {((t.btnAllProducts || "").trim() || isEditMode) && <a href="#products" className="btn btn-navy"><EditableText type="siteTexts" editKey="btnAllProducts" value={t.btnAllProducts} placeholder="לכל המוצרים" /></a>}
              {((t.btnAllPackages || "").trim() || isEditMode) && <a href="#packages" className="btn btn-ghost"><EditableText type="siteTexts" editKey="btnAllPackages" value={t.btnAllPackages} placeholder="לכל החבילות" /></a>}
            </div>
          </div>
        </section>
      )}

      {/* Services Grid */}
      {v.services !== false && (
      <section id="services" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-label">שירותים</span>
            <h2 className="section-title">
              <EditableText type="siteTexts" editKey="servicesTitle" value={t.servicesTitle} as="span" placeholder="כל מה שצריך במקום אחד" />
            </h2>
            <p className="section-sub"><EditableText type="siteTexts" editKey="servicesSubtitle" value={t.servicesSubtitle} as="span" placeholder="שירותים ופתרונות תקשורת בסגנון ביפון" /></p>
          </div>
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
        className="py-20 bg-slate-50 border-t border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="section-label">מוצרים</span>
            <h2 className="section-title">
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
                  <button type="button" onClick={() => setProductsVisibleCount((c) => c + 6)} className="btn btn-primary">
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
        className="py-20 bg-white border-t border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <span className="section-label">חבילות סלולר</span>
            <h2 className="section-title">
              <EditableText type="siteTexts" editKey="packagesTitle" value={t.packagesTitle} as="span" placeholder="מצאו את החבילה שמתאימה לכם" />
            </h2>
          </div>
          <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 text-xs text-center max-w-2xl mx-auto">
            המחירים והמבצעים באחריות הספקים ונתונים לשינוי בהתאם לתקנון החברות. ט.ל.ח
          </p>
          {/* טאבים קטגוריה */}
          <div className="flex justify-center mb-3">
            <div className="flex overflow-x-auto -mx-4 px-4">
              <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl min-w-max mx-auto">
                <TabButton
                  active={activeTab === "all"}
                  onClick={() => { setActiveTab("all"); setPackagesVisibleCount(6); }}
                  label="הכל"
                />
                <TabButton
                  active={activeTab === "kosher"}
                  onClick={() => { setActiveTab("kosher"); setPackagesVisibleCount(6); }}
                  label="כשר"
                  icon={<ShieldCheck size={16} />}
                />
                <TabButton
                  active={activeTab === "4g"}
                  onClick={() => { setActiveTab("4g"); setPackagesVisibleCount(6); }}
                  label="דור 4"
                  icon={<Signal size={16} />}
                />
                <TabButton
                  active={activeTab === "5g"}
                  onClick={() => { setActiveTab("5g"); setPackagesVisibleCount(6); }}
                  label="דור 5"
                  icon={<Zap size={16} />}
                />
                <TabButton
                  active={activeTab === "internet"}
                  onClick={() => { setActiveTab("internet"); setPackagesVisibleCount(6); }}
                  label="אינטרנט ביתי"
                  icon={<Wifi size={16} />}
                />
              </div>
            </div>
          </div>

          {/* פילטר חברה */}
          <div className="flex justify-center mb-6">
            <div className="flex overflow-x-auto -mx-4 px-4">
              <div className="flex gap-2 min-w-max mx-auto items-center">
                <button
                  onClick={() => { setActiveCarrier("all"); setPackagesVisibleCount(6); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeCarrier === "all" ? "text-white shadow" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
                  style={activeCarrier === "all" ? { background: "var(--c-primary)", borderColor: "var(--c-primary)" } : {}}
                >
                  כל החברות
                </button>
                {[
                  { id: "Golan Telecom", label: "גולן", logo: "./logos/golan.png" },
                  { id: "Cellcom",       label: "סלקום", logo: "./logos/cellcom.png" },
                  { id: "Hot Mobile",    label: "הוט",   logo: "./logos/hot.png" },
                  { id: "Pelephone",     label: "פלאפון", logo: "./logos/pelephone.png" },
                  { id: "Partner",       label: "פרטנר", logo: "./logos/partner.png" },
                  { id: "WeCom",         label: "wecom",  logo: "./logos/wecom.png" },
                ].map(({ id, label, logo }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveCarrier(activeCarrier === id ? "all" : id); setPackagesVisibleCount(6); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeCarrier === id ? "text-white shadow" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
                    style={activeCarrier === id ? { background: "var(--c-primary)", borderColor: "var(--c-primary)" } : {}}
                  >
                    <img src={logo} alt={label} className="h-4 w-auto" onError={(e) => { e.target.style.display = "none"; }} />
                    {label}
                  </button>
                ))}
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
                    className="bp-card flex flex-col overflow-hidden relative pkg-stripe"
                  >
                    {pkg.isHot && (
                      <div className="section-label absolute top-3 right-3 z-10 !mb-0 !rounded-lg">חם</div>
                    )}
                    {pkg.badge && !pkg.isHot && (
                      <div className="section-label absolute top-3 right-3 z-10 !mb-0 !rounded-lg">{pkg.badge}</div>
                    )}

                    {/* Header */}
                    <div className={`${headerClass} px-4 pt-5 pb-4 text-white text-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="relative z-10 flex flex-col items-center">
                        {pkg.logoUrl ? (
                          <img src={pkg.logoUrl} alt={displayName} className="w-16 h-16 object-contain bg-white rounded-full p-1 shadow-md border-2 border-white/40 mb-2" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2 border-2 border-white/40 [&>div]:scale-125">
                            <ProviderLogo provider={pkg.provider} url={null} />
                          </div>
                        )}
                        <h3 className="text-base font-bold tracking-tight">{displayName}</h3>
                        <div className="flex justify-center items-baseline gap-1 mt-1.5">
                          <span className="text-3xl font-extrabold">{formatPrice(pkg.price)}</span>
                          <span className="text-lg font-semibold">₪</span>
                        </div>
                        <p className="text-xs opacity-80">/חודש</p>
                        {pkg.priceDetail && <p className="text-xs opacity-90 mt-1">{pkg.priceDetail}</p>}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-grow flex flex-col">
                      <ul className="space-y-2.5 mb-5">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-0.5 flex-shrink-0 w-4.5 h-4.5 text-emerald-500">
                              <Check size={14} />
                            </span>
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                        {pkg.afterPrice && (
                          <li className="flex items-start gap-2 text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                            <span className="shrink-0 font-bold">•</span>
                            <span>{pkg.afterPrice}</span>
                          </li>
                        )}
                      </ul>
                      <button
                        onClick={() => handleWhatsAppClick(pkg)}
                        className="btn btn-whatsapp w-full mt-auto"
                      >
                        <MessageCircle size={18} />
                        להצטרפות
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {hasMorePackages && ((t.btnShowMorePackages ?? "").trim() || isEditMode) && (
              <div className="mt-8 text-center">
                <button onClick={() => setPackagesVisibleCount(sortedPackages.length)} className="btn btn-primary">
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
      <section id="locations" className="py-20 bg-slate-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-label">מיקומים</span>
            <h2 className="section-title">
              <EditableText type="siteTexts" editKey="locationsTitle" value={t.locationsTitle} as="span" placeholder="הסניפים שלנו" />
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {siteConfig.locations.map((loc, idx) => (
              <LocationCard
                key={idx}
                city={loc.city}
                address={loc.address}
                hours={loc.hours}
                phone={loc.phone}
                phoneDisplay={loc.phoneDisplay}
              />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-label">לקוחות מרוצים</span>
            <h2 className="section-title">מה אומרים עלינו</h2>
            <p className="section-sub">מאות ביקורות 5 כוכבים בגוגל</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name:"Aron Rosenberg", text:"ממליץ בחום רב. שירות מצויין, אנשים הוגנים ושירותיים מאוד.", stars:5 },
              { name:"צבי ויס", text:"קיבלתי שירות ממשה, מעל ומעבר למצופה. ממליץ לכל מי שרוצה לרכוש מכשיר בחנות איכותית ולקבל שירות סבלני, אכפתי ומקצועי.", stars:5 },
              { name:"יוחנן טרבלו", text:"הגענו לחנות אחרי אכזבות מכל מיני חנויות, והופתענו מהשירות, הזמינות, הדאגה והאיכפתיות. שווה כל שקל, פשוט אלוף העולם יוסי!", stars:5 },
              { name:"חיים רובין", text:"ממליץ בחום על ביפון, חנות עם אבא! יוסי בחור נשמה שנותן את כל כולו ללקוח וכך גם בוחר את העובדים אצלו. לא תתחרטו!", stars:5 },
              { name:"Avraham Turak", text:"שירות מצוין, מחירים הוגנים וצוות מקצועי ואדיב. הגעתי עם בעיה בטלפון וקיבלתי מענה מהיר ויעיל. מקום שאחזור אליו שוב!", stars:5 },
              { name:"ב.ר ריבלין", text:"תמיד קונה רק ביפון! שירות מעולה, מחירים טובים ואנשים שאכפת להם. מומלץ מאוד.", stars:5 },
            ].map(({ name, text, stars }) => (
              <div key={name} className="bp-card p-5 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {Array.from({length:stars}).map((_,i)=><Star key={i} size={14} className="text-amber-400"/>)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-grow">"{text}"</p>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] font-bold text-sm">
                    {name[0]}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── טופס לידים ── */}
      <LeadCaptureSection />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="text-white font-bold text-base mb-3">
                <EditableText type="siteTexts" editKey="footerTitle" value={t.footerTitle} as="span" placeholder="ביפון B-Phone – תקשורת סלולרית" />
              </h3>
              <p className="leading-relaxed text-slate-400">
                <EditableText type="siteTexts" editKey="footerDesc" value={t.footerDesc} as="span" placeholder="הבית של הסלולר הכשר והחכם באזור..." />
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">ניווט מהיר</h4>
              <ul className="space-y-2">
                {v.featured !== false && hasFeatured && <li><a href="#featured" className="hover:text-orange-400 transition"><EditableText type="siteTexts" editKey="navFeatured" value={t.navFeatured} placeholder="מבצעים מומלצים" /></a></li>}
                {v.packages !== false && <li><a href="#packages" className="hover:text-orange-400 transition"><EditableText type="siteTexts" editKey="navPackages" value={t.navPackages} placeholder="חבילות סלולר" /></a></li>}
                {v.products !== false && <li><a href="#products" className="hover:text-orange-400 transition"><EditableText type="siteTexts" editKey="navProducts" value={t.navProducts} placeholder="אביזרים ומבצעים" /></a></li>}
                {v.locations !== false && <li><a href="#locations" className="hover:text-orange-400 transition"><EditableText type="siteTexts" editKey="navLocations" value={t.navLocations} placeholder="סניפים" /></a></li>}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">יצירת קשר</h4>
              <p className="text-xs leading-relaxed text-slate-500 mb-3">
                המחירים והמבצעים באחריות הספקים ונתונים לשינוי בהתאם לתקנון החברות. ט.ל.ח
              </p>
              <button
                type="button"
                onClick={() => setAccOpen(true)}
                className="text-slate-400 hover:text-orange-400 underline cursor-pointer text-xs"
                aria-label="הגדרות נגישות"
              >
                נגישות
              </button>
              <p className="mt-3 text-slate-600 text-xs">© כל הזכויות שמורות לבי-פון תקשורת <a href="/admin.html" className="text-slate-600 hover:text-slate-400">2026</a></p>
            </div>
          </div>
        </div>
      </footer>

      {/* כפתור WhatsApp צף – תמיד מוצג בפינה הימנית התחתונה */}
      <a
        href={`https://wa.me/972${getWhatsAppNumber()}?text=${encodeURIComponent("היי B-Phone, הגעתי מהאתר ואשמח לפרטים!")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] text-white shadow-md hover:bg-[#1ebe5d] hover:shadow-lg rounded-full px-4 py-3 font-semibold text-sm transition-all duration-200"
        title="שלח הודעה בוואטסאפ"
        aria-label="שלח הודעה בוואטסאפ"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        <span className="text-sm hidden sm:inline">WhatsApp</span>
      </a>

      {/* כפתור חזרה לראש הדף – מעל כפתור WhatsApp, מופיע רק אחרי גלילה */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-[88px] right-6 z-40 w-11 h-11 rounded-full bg-[#1e3a5f] text-white shadow-lg hover:bg-orange-500 hover:scale-110 flex items-center justify-center transition-all duration-300 ${
          showScrollTop ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        title="חזרה לראש הדף"
        aria-label="חזרה לראש הדף"
        aria-hidden={!showScrollTop}
      >
        <ArrowUp size={22} />
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
                  <span className="text-xl mb-1">—</span>
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
      {quickLead && (
        <QuickLeadModal
          productName={quickLead.productName}
          waUrl={quickLead.waUrl}
          onClose={() => setQuickLead(null)}
        />
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
  return pkg.providerNameHe || pkg.providerName || pkg.provider;
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
      className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
        active
          ? "bg-[#1e3a5f] text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a5f]"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function QuickLeadModal({ productName, waUrl, onClose }) {
  const [name, setName]     = React.useState("");
  const [phone, setPhone]   = React.useState("");
  const [branch, setBranch] = React.useState("בית שמש");
  const [status, setStatus] = React.useState("idle"); // idle | loading | success
  const [err, setErr]       = React.useState("");

  const openWa = () => { window.open(waUrl, "_blank"); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setStatus("loading");
    setErr("");
    try {
      const res = await fetch("https://bippon-crm.vercel.app/api/leads/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), product: productName, branch }),
      });
      if (!res.ok) { const d = await res.json().catch(()=>{}); throw new Error(d?.error || "שגיאה"); }
      setStatus("success");
      setTimeout(() => { window.open(waUrl, "_blank"); onClose(); }, 1200);
    } catch (ex) {
      setErr(ex.message || "שגיאה, נסה שוב");
      setStatus("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4"
      dir="rtl"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-700 text-xl font-bold leading-none"
          aria-label="סגור"
        >×</button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Check size={28} className="text-emerald-600" />
            </div>
            <p className="font-bold text-green-700 text-lg">הפרטים התקבלו!</p>
            <p className="text-gray-500 text-sm mt-1">מעביר לוואטסאפ...</p>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-1">השאר פרטים ונחזור אליך</h3>
            {productName && <p className="text-sm text-gray-500 mb-4">בנוגע ל: {productName}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="שם מלא *"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none"
              />
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                placeholder="מספר טלפון *" dir="ltr"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none"
              />
              <select value={branch} onChange={e => setBranch(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white">
                <option value="בית שמש">סניף בית שמש</option>
                <option value="ביתר עילית">סניף ביתר עילית</option>
              </select>
              {err && <p className="text-red-500 text-xs">{err}</p>}
              <button
                type="submit" disabled={status === "loading"}
                className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white font-bold py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
              >
                {status === "loading" ? "שולח..." : "שלח ופתח וואטסאפ"}
              </button>
            </form>
            <button
              type="button" onClick={openWa}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 underline"
            >
              דלג ישר לוואטסאפ ←
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ iconUrl, defaultIcon: DefaultIcon, title, desc }) {
  const titleStr = typeof title === "string" ? title : "";
  return (
    <div className="bp-card flex flex-col items-center p-7 text-center group">
      <div className="text-[#1e3a5f] mb-5 bg-gradient-to-br from-blue-50 to-orange-50 p-4 rounded-2xl w-[68px] h-[68px] flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-300">
        {iconUrl ? (
          <img src={iconUrl} alt={titleStr || "שירות"} className="w-9 h-9 object-contain" />
        ) : (
          <DefaultIcon size={32} />
        )}
      </div>
      <h3 className="font-bold text-base mb-2 text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
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

function LocationCard({ city, address, hours, phone, phoneDisplay }) {
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
    <div className="bp-card h-full flex flex-col overflow-hidden">
      {mapsEmbedUrl && (
        <div className="w-full aspect-video max-h-56 bg-slate-100">
          <iframe
            src={mapsEmbedUrl}
            title={`מיקום החנות ${city}`}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2.5 mb-5">
          <MapPin size={20} className="text-[#1e3a5f]" />
          <h3 className="text-xl font-bold text-slate-800">{city}</h3>
        </div>
        <div className="space-y-3 text-slate-600 flex-grow text-sm">
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 text-slate-400 shrink-0" />
            <span>{address}</span>
          </p>
          <div className="flex items-start gap-2">
            <Clock size={16} className="mt-0.5 text-slate-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-700 mb-0.5">שעות פתיחה</p>
              <div className="whitespace-pre-wrap text-slate-500">{hours}</div>
            </div>
          </div>
          <p className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <Phone size={16} className="text-slate-400 shrink-0" />
            <a href={`tel:${phone}`} className="font-bold text-lg text-[#1e3a5f] hover:text-orange-500 transition">{phoneDisplay || phone}</a>
          </p>
        </div>
      </div>
      <div className="px-6 pb-5 flex flex-col sm:flex-row gap-2.5">
        <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
          className="btn btn-navy btn-sm flex-1 text-center">נווט ב-Waze</a>
        <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer"
          className="btn btn-ghost btn-sm flex-1 text-center">גוגל מפות</a>
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
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-2">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 leading-tight">
              {product.name}
            </h1>
            {product.sku && (
              <p className="text-xs text-slate-400 mb-3">
                מק״ט: <span className="font-mono tracking-widest">{product.sku}</span>
              </p>
            )}
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
    <div className="bp-card overflow-hidden flex flex-col h-full relative group cursor-pointer">
      {mainImage && (
        <div
          className="w-full h-52 sm:h-56 bg-slate-50 flex-shrink-0 relative cursor-pointer overflow-hidden"
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
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
            onClick={() => onWhatsApp({ ...product, category: "product" })}
            className="btn btn-whatsapp btn-sm shrink-0"
          >
            <MessageCircle size={16} />
            לפרטים
          </button>
        </div>
      </div>
    </div>
  );
}

// --- טופס לידים — מחובר ל-CRM של ביפון ---
const CRM_LEAD_ENDPOINT = "https://bippon-crm.vercel.app/api/leads/public";

function LeadCaptureSection({ defaultBranch = "לא משנה", defaultProduct = "" }) {
  const [name, setName]       = React.useState("");
  const [phone, setPhone]     = React.useState("");
  const [interest, setInterest] = React.useState(defaultProduct);
  const [notes, setNotes]     = React.useState("");
  const [branch, setBranch]   = React.useState(defaultBranch);
  const [status, setStatus]   = React.useState("idle");
  const [errMsg, setErrMsg]   = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(CRM_LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), interest, notes: notes.trim() || null, branch }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "שגיאה");
      setStatus("success");
    } catch (err) {
      setErrMsg(err.message || "שגיאה, נסה שוב");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  if (status === "success") {
    return (
      <section className="bg-slate-50 py-16 border-t border-gray-100" dir="rtl">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">הפרטים התקבלו!</h2>
          <p className="text-slate-500">נציג שלנו יחזור אליך בהקדם</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="bg-slate-50 py-16 border-t border-gray-100" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="section-label">יצירת קשר</span>
          <h2 className="section-title mt-2">רוצה שנחזור אליך?</h2>
          <p className="section-sub">השאר שם וטלפון — נציג יחזור אליך תוך שעות ספורות</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-md border border-slate-200">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">שם מלא</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="ישראל ישראלי"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">מספר טלפון</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="05X-XXXXXXX" dir="ltr"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">מה מעניין אותך?</label>
              <select value={interest} onChange={e => setInterest(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">בחר נושא...</option>
                <option value="סלולר">חבילת סלולר</option>
                <option value="מכשיר">מכשיר טלפון</option>
                <option value="אינטרנט">אינטרנט ביתי</option>
                <option value="ניוד">ניוד קו</option>
                <option value="אחר">אחר</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">סניף מועדף</label>
              <select value={branch} onChange={e => setBranch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="לא משנה">לא משנה — כל סניף</option>
                <option value="בית שמש">סניף בית שמש</option>
                <option value="ביתר עילית">סניף ביתר עילית</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">הערות (אופציונלי)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="כל דבר נוסף שתרצה לציין..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>
          {status === "error" && <p className="text-red-500 text-sm text-center">{errMsg}</p>}
          <button type="submit" disabled={status === "loading"}
            className="btn btn-primary w-full text-base disabled:opacity-60 mt-1">
            {status === "loading" ? "שולח..." : "שלח פרטים"}
          </button>
          <p className="text-slate-400 text-xs text-center">הפרטים שלך מאובטחים ולא יועברו לגורם שלישי</p>
        </form>
      </div>
    </section>
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

