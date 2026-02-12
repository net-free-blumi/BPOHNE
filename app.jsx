const { useState, useEffect } = React;

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
const Bot = ({ size = 28, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <circle cx="9" cy="15" r="1.2" fill="currentColor" />
    <circle cx="15" cy="15" r="1.2" fill="currentColor" />
    <path d="M12 10V6M10 6h4" />
    <rect x="9" y="2" width="6" height="4" rx="1" />
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
      if (data.error) throw new Error(data.error);
    } catch (error) {
      console.error("AI Error:", error);
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

const DEFAULT_CONFIG = {
  mainPhone: "0527151000",
  whatsapp: "0527151000",
  // ברירת מחדל: לוגו מתוך קובץ מקומי בתיקיית logos
  logoUrl: "./logos/logo-bphone.png",
  heroImageUrl: "",
  locations: [
    {
      id: "bs",
      city: "בית שמש",
      address: "רחוב יצחק רבין 17, בית שמש",
      phone: "052-7151000",
      hours: "א'-ה': 10:00 - 21:00\nו' וערבי חג: 10:00 - 13:00",
    },
    {
      id: "beitar",
      city: "ביתר עילית",
      address: "המגיד ממעזריטש 71, ביתר עילית",
      phone: "02-9911213",
      hours: "א'-ה': 10:00 - 21:00\nו': 10:00 - 13:00",
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

// --- B-Bot: יועץ AI (Gemini) עם חבילות, מוצרים ופרטי החנות ---
function AiAdvisor({ packages = [], products = [], siteConfig = {}, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "היי! 👋 אני B-Bot, היועץ של B-Phone. אפשר לשאול אותי על חבילות סלולר ואינטרנט, מוצרים, שעות הפתיחה או כל שאלה – ואשמח לכוון אותך. בסוף אפשר גם לשלוח לנו בוואטסאפ!" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const systemPrompt = `
אתה B-Bot, יועץ מכירות ותמיכה ידידותי ומומחה של חנות "B-Phone" בישראל (בית שמש וביתר).

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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-end p-0 sm:p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 sm:ml-4">
        {/* כותרת חמודה */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-3xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">B-Bot</h3>
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [products, setProducts] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [packagesVisibleCount, setPackagesVisibleCount] = useState(3);
  const [promoMessage, setPromoMessage] = useState({
    title: "מבצעי השקה!",
    subtitle: "הצטרפו היום וקבלו סים במתנה",
    active: true,
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);

  const showMessage = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // --- טעינה מהענן (Firebase) או דמו מקומי ---
  useEffect(() => {
    const db = getDb();
    const auth = getAuth();

    const unsubAuth = auth
      ? auth.onAuthStateChanged((user) => {
          setIsAdmin(!!user);
        })
      : () => {};

    if (!db) {
      setPackages(MARKET_DEALS.map((d, i) => ({ ...d, id: `demo-${i}` })));
      setLoading(false);
      return () => unsubAuth();
    }

    const configRef = db.doc("config/site");
    const packagesRef = db.collection("packages");

    Promise.all([
      configRef.get().then((snap) => (snap.exists() ? snap.data() : null)),
      packagesRef.get().then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    ])
      .then(([configData, packagesList]) => {
        if (configData) {
          setSiteConfig((prev) => ({ ...DEFAULT_CONFIG, ...configData, locations: configData.locations || prev.locations, services: configData.services || prev.services }));
          if (configData.promoMessage) setPromoMessage((prev) => ({ ...prev, ...configData.promoMessage }));
        }
        if (packagesList && packagesList.length > 0) {
          setPackages(packagesList.sort((a, b) => (a.price || 0) - (b.price || 0)));
        } else {
          setPackages(MARKET_DEALS.map((d, i) => ({ ...d, id: `demo-${i}` })));
        }
      })
      .catch((err) => {
        console.warn("Firebase load error", err);
        setPackages(MARKET_DEALS.map((d, i) => ({ ...d, id: `demo-${i}` })));
      })
      .finally(() => setLoading(false));

    return () => unsubAuth();
  }, []);

  // --- כניסת מנהל (Firebase אימייל/סיסמה או מקומי 1234) ---
  const handleLogin = (email, password) => {
    const auth = getAuth();
    if (auth) {
      auth
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          setShowLoginModal(false);
          showMessage("התחברת בהצלחה", "success");
        })
        .catch((err) => {
          const code = err.code || "";
          const msg = code.includes("wrong-password") || code.includes("invalid-credential")
            ? "סיסמה או אימייל לא נכונים. נסה שוב."
            : code.includes("user-not-found")
            ? "לא נמצא משתמש עם האימייל הזה."
            : code.includes("invalid-email")
            ? "נא להזין אימייל תקין."
            : "לא הצלחנו להתחבר. בדוק אימייל וסיסמה ונסה שוב.";
          showMessage(msg, "error");
        });
    } else {
      if (password === "1234") {
        setIsAdmin(true);
        setShowLoginModal(false);
        showMessage("התחברת בהצלחה", "success");
      } else {
        showMessage("סיסמה שגויה. נסה 1234", "error");
      }
    }
  };

  const handleSavePackage = (pkg) => {
    const db = getDb();
    const payload = { ...pkg };
    delete payload.id;

    if (db) {
      const packagesRef = db.collection("packages");
      if (pkg.id && pkg.id.startsWith("demo-") === false) {
        packagesRef
          .doc(pkg.id)
          .update(payload)
          .then(() => {
            setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, ...pkg } : p)));
            setEditingPackage(null);
            setShowAdminModal(false);
            showMessage("החבילה עודכנה בהצלחה", "success");
          })
          .catch((err) => {
            console.error(err);
            showMessage("שגיאה בשמירה לענן", "error");
          });
      } else {
        packagesRef
          .add(payload)
          .then((ref) => {
            setPackages((prev) => [...prev, { ...pkg, id: ref.id }].sort((a, b) => (a.price || 0) - (b.price || 0)));
            setEditingPackage(null);
            setShowAdminModal(false);
            showMessage("החבילה נשמרה בהצלחה", "success");
          })
          .catch((err) => {
            console.error(err);
            showMessage("שגיאה בשמירה לענן", "error");
          });
      }
    } else {
      setPackages((prev) => {
        if (pkg.id && prev.some((p) => p.id === pkg.id)) {
          return prev.map((p) => (p.id === pkg.id ? { ...p, ...pkg } : p));
        }
        return [...prev, { ...pkg, id: `local-${Date.now()}-${prev.length}` }];
      });
      setEditingPackage(null);
      setShowAdminModal(false);
    }
  };

  const handleLoadDemoData = () => {
    const db = getDb();
    const withIds = MARKET_DEALS.map((d, i) => ({ ...d, id: `demo-${i}` }));

    if (db) {
      const packagesRef = db.collection("packages");
      const configRef = db.doc("config/site");
      packagesRef
        .get()
        .then((snap) => {
          const batch = db.batch();
          snap.docs.forEach((d) => batch.delete(d.ref));
          return batch.commit();
        })
        .then(() => {
          const batch = db.batch();
          MARKET_DEALS.forEach((d) => {
            const { id, ...rest } = { ...d };
            batch.set(packagesRef.doc(), rest);
          });
          batch.set(configRef, {
            ...DEFAULT_CONFIG,
            promoMessage: { title: promoMessage.title, subtitle: promoMessage.subtitle, active: true },
          }, { merge: true });
          return batch.commit();
        })
        .then(() => packagesRef.get())
        .then((snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.price || 0) - (b.price || 0));
          setPackages(list);
          showMessage("הנתונים נשמרו בענן ונטענו בהצלחה!", "success");
          setShowAdminModal(false);
        })
        .catch((err) => {
          console.error(err);
          showMessage("שגיאה בשמירה בענן", "error");
        });
    } else {
      setPackages(withIds);
      showMessage("הנתונים נטענו בהצלחה!", "success");
      setShowAdminModal(false);
    }
  };

  const handleDeletePackageConfirmed = () => {
    if (!packageToDelete) return;
    const db = getDb();
    if (db && packageToDelete.id && !packageToDelete.id.startsWith("demo-")) {
      db.collection("packages")
        .doc(packageToDelete.id)
        .delete()
        .then(() => {
          setPackages((prev) => prev.filter((p) => p.id !== packageToDelete.id));
          setPackageToDelete(null);
          showMessage("החבילה נמחקה", "success");
        })
        .catch((err) => {
          console.error(err);
          showMessage("שגיאה במחיקה בענן", "error");
        });
    } else {
      setPackages((prev) => prev.filter((p) => p.id !== packageToDelete.id));
      setPackageToDelete(null);
      showMessage("החבילה נמחקה", "success");
    }
  };

  // --- מוצרים (טלפונים/מחשבים למכירה) ---
  const handleSaveProduct = (product) => {
    setProducts((prev) => {
      if (product.id && prev.some((p) => p.id === product.id)) {
        return prev.map((p) => (p.id === product.id ? { ...p, ...product } : p));
      }
      return [
        ...prev,
        {
          ...product,
          id: `prod-${Date.now()}-${prev.length}`,
        },
      ];
    });
    setEditingProduct(null);
    setShowProductModal(false);
  };

  const handleDeleteProductConfirmed = () => {
    if (!productToDelete) return;
    setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    setProductToDelete(null);
  };

  const handleUpdatePromo = (title, subtitle) => {
    const next = { ...promoMessage, title, subtitle };
    setPromoMessage(next);
    const db = getDb();
    if (db) {
      db.doc("config/site")
        .set({ promoMessage: next }, { merge: true })
        .then(() => showMessage("המבצע נשמר בענן", "success"))
        .catch((err) => {
          console.error(err);
          showMessage("שגיאה בשמירה לענן", "error");
        });
    } else {
      showMessage("המבצע עודכן", "success");
    }
  };

  const handleUpdateConfig = (newConfig) => {
    setSiteConfig(newConfig);
    setShowSettingsModal(false);
    const db = getDb();
    if (db) {
      const toSave = { ...newConfig };
      db.doc("config/site")
        .set(toSave, { merge: true })
        .then(() => showMessage("הגדרות האתר נשמרו בענן", "success"))
        .catch((err) => {
          console.error(err);
          showMessage("שגיאה בשמירה לענן", "error");
        });
    } else {
      showMessage("הגדרות האתר עודכנו", "success");
    }
  };

  const handleWhatsAppClick = (pkg) => {
    const name = pkg.providerName || pkg.provider;
    const detail = pkg.priceDetail ? `\nפירוט: ${pkg.priceDetail}` : "";
    const text = `היי B-Phone, אני מעוניין להצטרף לתוכנית הבאה:
-----------------------
*ספק:* ${name}
*מחיר:* ${pkg.price} ₪${detail ? `\n*פירוט:* ${pkg.priceDetail}` : ""}
*קטגוריה:* ${pkg.category === "kosher" ? "כשר" : pkg.category === "internet" ? "אינטרנט ביתי" : pkg.category}
-----------------------
אשמח לקבל פרטים ולהצטרף!`;
    const phone = siteConfig.whatsapp || "0527151000";
    const normalized = phone.replace(/[^0-9]/g, "");
    const withoutLeadingZero = normalized.startsWith("0")
      ? normalized.slice(1)
      : normalized;
    const url = `https://wa.me/972${withoutLeadingZero}?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  };

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

  // איפוס "הצג עוד" כשמשנים טאב או חיפוש
  useEffect(() => {
    setPackagesVisibleCount(3);
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <a
                href="https://b-phone.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:opacity-90 transition"
              >
                {siteConfig.logoUrl ? (
                  <div className="flex-shrink-0 flex items-center">
                    <img
                      src={siteConfig.logoUrl}
                      alt="B-Phone Logo"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-blue-900 leading-none">
                        Bפון
                      </h1>
                      <span className="text-xs text-gray-500">
                        תקשורת סלולרית
                      </span>
                    </div>
                  </div>
                )}
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 space-x-reverse">
              <a
                href="#promos"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                מבצעים
              </a>
              <a
                href="#packages"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                חבילות
              </a>
              <a
                href="#products"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                מוצרים
              </a>
              <a
                href="#services"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                שירותים
              </a>
              <a
                href="#locations"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                סניפים
              </a>

              {isAdmin && (
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                  title="הגדרות אתר"
                >
                  <Settings size={20} />
                </button>
              )}

              <button
                onClick={() => {
                  if (isAdmin) {
                    const auth = getAuth();
                    if (auth) auth.signOut();
                    setIsAdmin(false);
                  } else setShowLoginModal(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                  isAdmin
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isAdmin ? (
                  <>
                    <LogOut size={16} /> יציאה
                  </>
                ) : (
                  <>
                    <Lock size={16} /> ניהול
                  </>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 p-2"
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 pb-4">
            <div className="flex flex-col space-y-2 px-4 pt-2">
              <a
                href="#promos"
                className="py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                מבצעים
              </a>
              <a
                href="#packages"
                className="py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                חבילות
              </a>
              <a
                href="#products"
                className="py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                מוצרים
              </a>
              <a
                href="#locations"
                className="py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                סניפים
              </a>
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 text-right border-b border-gray-50"
                >
                  הגדרות אתר
                </button>
              )}
              <button
                onClick={() => {
                  if (isAdmin) {
                    const auth = getAuth();
                    if (auth) auth.signOut();
                    setIsAdmin(false);
                  } else setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                className="mt-2 text-blue-600 font-bold text-right"
              >
                {isAdmin ? "יציאה" : "כניסת מנהל"}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero / Promo Section */}
      <div
        id="promos"
        className="relative bg-blue-700 text-white overflow-hidden transition-all duration-500"
        style={
          siteConfig.heroImageUrl
            ? {
                backgroundImage: `url(${siteConfig.heroImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {/* Overlay for readability if image is present */}
        {siteConfig.heroImageUrl && (
          <div className="absolute inset-0 bg-black/50 z-0"></div>
        )}

        {/* Default pattern if no image */}
        {!siteConfig.heroImageUrl && (
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10 text-center">
          {isAdmin ? (
            <PromoEditor
              promoMessage={promoMessage}
              onSave={handleUpdatePromo}
            />
          ) : null}

          <span className="inline-block py-1 px-3 rounded-full bg-blue-500 bg-opacity-50 border border-blue-400 text-sm font-semibold tracking-wide mb-4 backdrop-blur-sm">
            B-Phone ביפון תקשורת סלולרית - בית שמש - ביתר
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 drop-shadow-md">
            {promoMessage.title}
          </h2>
          <p className="mt-2 text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-sm">
            {promoMessage.subtitle}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="#locations"
              className="px-8 py-3 rounded-lg bg-white text-blue-700 font-bold hover:bg-blue-50 transition shadow-lg"
            >
              מצא סניף קרוב
            </a>
            <a
              href="#packages"
              className="px-8 py-3 rounded-lg bg-transparent border-2 border-white text-white font-bold hover:bg-white/10 transition backdrop-blur-sm"
            >
              לכל החבילות
            </a>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <section id="services" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
            כל מה שצריך במקום אחד
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {siteConfig.services.map((service, idx) => (
              <ServiceCard
                key={idx}
                iconUrl={service.iconUrl}
                defaultIcon={DEFAULT_SERVICE_ICONS[idx % DEFAULT_SERVICE_ICONS.length]}
                title={service.title}
                desc={service.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section
        id="products"
        className="py-12 bg-white border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-slate-800">
              מכשירים ומוצרים בחנות
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                <Plus size={20} /> ניהול מוצרים
              </button>
            )}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">
                עדיין לא הוזנו מוצרים להצגה.
              </p>
              {isAdmin && (
                <p
                  className="text-blue-500 cursor-pointer mt-2"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
                >
                  לחץ כאן להוספת מוצר ראשון
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={isAdmin}
                  onEdit={() => {
                    setEditingProduct(product);
                    setShowProductModal(true);
                  }}
                  onDelete={() => setProductToDelete(product)}
                  onWhatsApp={handleWhatsAppClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Packages Section */}
      <section
        id="packages"
        className="py-12 bg-slate-50 border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 text-sm text-center max-w-2xl mx-auto">
            המחירים והמבצעים באחריות הספקים ונתונים לשינוי בהתאם לתקנון החברות. ט.ל.ח
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-slate-800">
              מצאו את החבילה שמתאימה לכם
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

          {/* תיבת חיפוש + כפתור איפוס */}
          <div className="mb-6 flex flex-wrap items-center gap-2 max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי חברה, מחיר, כשר, דור 4, אינטרנט..."
              className="flex-1 min-w-[200px] rounded-xl border border-gray-300 bg-white px-4 py-3 text-slate-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              title="איפוס חיפוש"
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${searchQuery.trim() ? "border-gray-300 bg-slate-100 text-slate-700 hover:bg-slate-200" : "border-gray-200 bg-gray-50 text-gray-400 cursor-default"}`}
              disabled={!searchQuery.trim()}
            >
              <RefreshCw size={18} />
              איפוס
            </button>
          </div>

          {isAdmin && (
            <div className="mb-8 text-center">
              <button
                onClick={() => setShowAdminModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                <Plus size={20} /> ניהול חבילות
              </button>
            </div>
          )}

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
                          <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
                          <span className="text-xl font-semibold mr-0.5">₪</span>
                        </div>
                        <p className="text-xs opacity-90 font-medium">/חודש</p>
                        {pkg.priceDetail && (
                          <p className="text-xs opacity-95 mt-1 max-w-xs leading-snug">{pkg.priceDetail}</p>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="absolute top-4 left-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => { setEditingPackage(pkg); setShowAdminModal(true); }} className="p-2 bg-blue-100 text-blue-600 rounded-full shadow" title="עריכת חבילה"><Edit2 size={18} /></button>
                        <button onClick={() => setPackageToDelete(pkg)} className="p-2 bg-red-100 text-red-600 rounded-full shadow" title="מחיקת חבילה"><Trash2 size={18} /></button>
                      </div>
                    )}

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
                        לפרטים והצטרפות בוואטסאפ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {hasMorePackages && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPackagesVisibleCount(filteredPackages.length)}
                  className="px-8 py-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition shadow-md"
                >
                  הראה עוד
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            הסניפים שלנו
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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-amber-900/40 border border-amber-600/50 rounded-lg p-4 mb-8 text-center">
            <p className="text-amber-100 text-sm font-medium leading-relaxed">
              המחירים והמבצעים באחריות הספקים ונתונים לשינוי בהתאם לתקנון החברות. ט.ל.ח
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">
                B-Phone ביפון תקשורת סלולרית – בית שמש וביתר
              </h3>
              <p className="mb-4">
                הבית של הסלולר הכשר והחכם באזור. שירות אמין, מחירים הוגנים,
                מעבדה לתיקון מכשירים ומחשבים והתקנת סינון כשר.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">ניווט מהיר</h4>
              <ul className="space-y-2">
                <li><a href="#packages" className="hover:text-white">חבילות סלולר</a></li>
                <li><a href="#products" className="hover:text-white">מוצרים ומכשירים</a></li>
                <li><a href="#locations" className="hover:text-white">צור קשר</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">מידע נוסף</h4>
              <p>מצאת טעות במחיר? <a href="#packages" className="underline">דווח לנו</a></p>
              <p className="mt-3 text-amber-200/90 text-xs leading-relaxed">
                המחירים והמבצעים באחריות הספקים ונתונים לשינוי בהתאם לתקנון החברות. ט.ל.ח
              </p>
              <p className="mt-3">© כל הזכויות שמורות לבי-פון תקשורת 2026</p>
            </div>
          </div>
        </div>
      </footer>

      {/* כפתור חזרה לראש הדף */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-slate-700 text-white shadow-lg hover:bg-slate-600 hover:scale-110 transition-all flex items-center justify-center"
        title="חזרה לראש הדף"
        aria-label="חזרה לראש הדף"
      >
        <ArrowUp size={24} />
      </button>

      {/* B-Bot – כפתור צף להתייעצות */}
      <button
        type="button"
        onClick={() => setShowAiAdvisor(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 transition-all font-bold"
        title="התייעץ עם B-Bot"
        aria-label="התייעץ עם B-Bot"
      >
        <Bot size={28} />
        <span className="hidden sm:inline">התייעץ עם B-Bot</span>
      </button>

      {showAiAdvisor && (
        <AiAdvisor
          packages={packages}
          products={products}
          siteConfig={siteConfig}
          onClose={() => setShowAiAdvisor(false)}
        />
      )}

      {/* Modals */}
      {showAdminModal && (
        <AdminModal
          onClose={() => {
            setShowAdminModal(false);
            setEditingPackage(null);
          }}
          initialData={editingPackage}
          onSubmit={handleSavePackage}
          onLoadDemo={handleLoadDemoData}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          useFirebase={isFirebaseActive()}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          config={siteConfig}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleUpdateConfig}
        />
      )}

      {showProductModal && (
        <ProductModal
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          initialData={editingProduct}
          onSubmit={handleSaveProduct}
        />
      )}

      {packageToDelete && (
        <ConfirmDeleteModal
          title="מחיקת חבילה"
          message={`האם אתה בטוח שברצונך למחוק את החבילה ${packageToDelete.provider}?`}
          onCancel={() => setPackageToDelete(null)}
          onConfirm={handleDeletePackageConfirmed}
        />
      )}

      {productToDelete && (
        <ConfirmDeleteModal
          title="מחיקת מוצר"
          message={`האם אתה בטוח שברצונך למחוק את המוצר ${productToDelete.name}?`}
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleDeleteProductConfirmed}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// --- קומפוננטות משנה ---

function PromoEditor({ promoMessage, onSave }) {
  const [title, setTitle] = useState(promoMessage.title);
  const [subtitle, setSubtitle] = useState(promoMessage.subtitle);

  return (
    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20 max-w-lg mx-auto mb-6">
      <h3 className="text-sm font-bold mb-2 opacity-80 flex items-center justify-center gap-2">
        <Edit2 size={14} /> עריכת כותרת ראשית
      </h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block w-full mb-2 px-3 py-2 rounded text-slate-900"
        placeholder="כותרת מבצע"
      />
      <input
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        className="block w-full mb-2 px-3 py-2 rounded text-slate-900"
        placeholder="תת כותרת"
      />
      <button
        onClick={() => onSave(title, subtitle)}
        className="bg-green-500 hover:bg-green-600 text-white w-full py-2 rounded font-bold"
      >
        שמור שינויים
      </button>
    </div>
  );
}

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
  return (
    <div className="flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
      <div className="text-blue-600 mb-4 bg-white p-4 rounded-full shadow-sm w-16 h-16 flex items-center justify-center">
        {iconUrl ? (
          <img src={iconUrl} alt={title} className="w-8 h-8 object-contain" />
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
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-600 h-full flex flex-col">
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

      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          נווט ב-Waze
        </button>
      </div>
    </div>
  );
}

function LoginModal({ onClose, onLogin, useFirebase }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">כניסת מנהל מערכת</h3>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        {useFirebase ? (
          <p className="text-sm text-gray-500 mb-4">התחבר עם האימייל והסיסמה שנרשמו ב־Firebase.</p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">למצב מקומי: הסיסמה היא 1234</p>
        )}
        {useFirebase && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="אימייל"
            dir="ltr"
          />
        )}
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="סיסמה"
          autoFocus={!useFirebase}
        />
        <button
          onClick={() => (useFirebase ? onLogin(email, pass) : onLogin("", pass))}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          כניסה
        </button>
      </div>
    </div>
  );
}

function SettingsModal({ config, onClose, onSave }) {
  const [formData, setFormData] = useState(config);

  const handleLocationChange = (index, field, value) => {
    const newLocs = [...formData.locations];
    newLocs[index] = { ...newLocs[index], [field]: value };
    setFormData({ ...formData, locations: newLocs });
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData({ ...formData, services: newServices });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl my-8 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h3 className="text-2xl font-bold text-slate-800">הגדרות אתר</h3>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto flex-1 min-h-0 pr-1 -mr-1">
          <h4 className="font-bold text-lg text-blue-800 border-b pb-2">
            עיצוב כללי
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">
                לוגו האתר (קישור)
              </label>
              <input
                type="text"
                value={formData.logoUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                תמונת נושא (רקע עליון)
              </label>
              <input
                type="text"
                value={formData.heroImageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, heroImageUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold mb-1">
              מספר וואטסאפ ללידים
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp: e.target.value })
              }
              className="w-full border rounded-lg p-2"
            />
          </div>

          <h4 className="font-bold text-lg text-blue-800 border-b pb-2 mt-8">
            סניפים
          </h4>
          {formData.locations.map((loc, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h5 className="font-bold text-blue-600">סניף {loc.city}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    כתובת
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    value={loc.address}
                    onChange={(e) =>
                      handleLocationChange(idx, "address", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    טלפון
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    value={loc.phone}
                    onChange={(e) =>
                      handleLocationChange(idx, "phone", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    שעות פתיחה
                  </label>
                  <textarea
                    className="w-full border rounded p-2 text-sm min-h-[60px]"
                    value={loc.hours}
                    onChange={(e) =>
                      handleLocationChange(idx, "hours", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <h4 className="font-bold text-lg text-blue-800 border-b pb-2 mt-8">
            שירותים (סמלים וטקסט)
          </h4>
          <div className="grid gap-4">
            {formData.services.map((service, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-3 rounded flex flex-col md:flex-row gap-3 items-start md:items-center"
              >
                <div className="flex-shrink-0 bg-white p-2 rounded border">
                  {service.iconUrl ? (
                    <img
                      src={service.iconUrl}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <ImageIcon size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    className="border rounded p-1 text-sm"
                    placeholder="כותרת"
                    value={service.title}
                    onChange={(e) =>
                      handleServiceChange(idx, "title", e.target.value)
                    }
                  />
                  <input
                    className="border rounded p-1 text-sm"
                    placeholder="תיאור"
                    value={service.desc}
                    onChange={(e) =>
                      handleServiceChange(idx, "desc", e.target.value)
                    }
                  />
                  <input
                    className="border rounded p-1 text-sm"
                    placeholder="קישור לאייקון (אופציונלי)"
                    value={service.iconUrl || ""}
                    onChange={(e) =>
                      handleServiceChange(idx, "iconUrl", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSave(formData)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-6"
        >
          שמור שינויים
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product, isAdmin, onEdit, onDelete, onWhatsApp }) {
  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : product.imageUrl;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group">
      {mainImage && (
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-40 object-cover"
        />
      )}
      {isAdmin && (
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={onEdit}
            className="p-2 bg-blue-100 text-blue-700 rounded-full"
            title="עריכת מוצר"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-100 text-red-700 rounded-full"
            title="מחיקת מוצר"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {product.name}
        </h3>
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {product.description}
        </p>
        {product.images && product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.slice(1, 4).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} ${idx + 2}`}
                className="w-12 h-12 object-cover rounded border"
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          {product.price && (
            <div className="text-blue-700 font-extrabold text-xl">
              ₪{product.price}
            </div>
          )}
          <button
            onClick={() =>
              onWhatsApp({
                provider: product.name,
                price: product.price || "",
                category: "product",
              })
            }
            className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 flex items-center gap-1"
          >
            <MessageCircle size={16} />
            פרטים בוואטסאפ
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        id: initialData.id,
        name: initialData.name || "",
        price:
          typeof initialData.price === "number"
            ? String(initialData.price)
            : initialData.price || "",
        imagesText: initialData.images
          ? initialData.images.join("\n")
          : initialData.imageUrl || "",
        description: initialData.description || "",
        tagsText: initialData.tags ? initialData.tags.join(", ") : "",
      };
    }
    return {
      id: undefined,
      name: "",
      price: "",
      imagesText: "",
      description: "",
      tagsText: "",
    };
  });

  const isEdit = Boolean(initialData && initialData.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags =
      formData.tagsText && formData.tagsText.trim().length > 0
        ? formData.tagsText.split(",").map((t) => t.trim())
        : [];
    const images =
      formData.imagesText && formData.imagesText.trim().length > 0
        ? formData.imagesText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];
    onSubmit({
      id: formData.id,
      name: formData.name,
      price: formData.price ? Number(formData.price) : null,
      images,
      description: formData.description,
      tags,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">
            {isEdit ? "עריכת מוצר" : "הוספת מוצר חדש"}
          </h3>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם המוצר / המכשיר
            </label>
            <input
              required
              type="text"
              className="w-full border rounded-lg p-2"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מחיר (₪)
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                קישורי תמונות (שורה לכל כתובת)
              </label>
              <textarea
                className="w-full border rounded-lg p-2 text-sm min-h-[80px]"
                placeholder="העלה את התמונות לשירות ענן (למשל Cloudinary) והדבק כאן את הקישורים, כל קישור בשורה נפרדת"
                value={formData.imagesText}
                onChange={(e) =>
                  setFormData({ ...formData, imagesText: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תגיות (מופרדות בפסיק)
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="לדוג': כשר, דור 5, זיכרון 128GB"
              value={formData.tagsText}
              onChange={(e) =>
                setFormData({ ...formData, tagsText: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תיאור המוצר
            </label>
            <textarea
              className="w-full border rounded-lg p-2 text-sm min-h-[80px]"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4"
          >
            {isEdit ? "שמור שינויים" : "שמור והוסף לאתר"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ title, message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-between gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
          >
            כן, מחק
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminModal({ onClose, onSubmit, onLoadDemo, initialData }) {
  const [formData, setFormData] = useState(() => {
    const base = initialData || {
      id: undefined,
      provider: "",
      price: "",
      category: "kosher",
      dataGB: 0,
      calls: "ללא הגבלה",
      sms: "unlimited",
      is5G: false,
      extras: "",
      logoUrl: "",
      providerName: "",
      priceDetail: "",
      isHot: false,
      badge: "",
      afterPrice: "",
      features: [],
    };
    if (base.features && Array.isArray(base.features)) base.features = base.features.join("\n");
    return base;
  });

  const isEdit = Boolean(initialData && initialData.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const featuresRaw = formData.features;
    const features = typeof featuresRaw === "string"
      ? featuresRaw.split("\n").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(featuresRaw) ? featuresRaw : [];
    onSubmit({
      ...formData,
      price: Number(formData.price),
      dataGB: Number(formData.dataGB),
      features: features.length ? features : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">
            {isEdit ? "עריכת חבילה" : "הוספת חבילה חדשה"}
          </h3>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                חברה/ספק
              </label>
              <input
                required
                type="text"
                className="w-full border rounded-lg p-2"
                placeholder="לדוג' פרטנר, סלקום"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם לתצוגה (אופציונלי)
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                placeholder="סלקום, HOT mobile..."
                value={formData.providerName ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, providerName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מחיר לחודש (₪)
              </label>
              <input
                required
                type="number"
                className="w-full border rounded-lg p-2"
                placeholder="35"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                פירוט מחיר (תת-כותרת)
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                placeholder="לקו שני ומעלה..."
                value={formData.priceDetail ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, priceDetail: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={Boolean(formData.isHot)}
                onChange={(e) =>
                  setFormData({ ...formData, isHot: e.target.checked })
                }
              />
              <span className="text-sm font-medium text-gray-700">מבצע מומלץ (תג על הכרטיס)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">תג (אופציונלי):</span>
              <input
                type="text"
                className="border rounded-lg p-1.5 w-40 text-sm"
                placeholder="מבצע מטורף"
                value={formData.badge ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, badge: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">מחיר המשך:</span>
              <input
                type="text"
                className="border rounded-lg p-1.5 w-36 text-sm"
                placeholder="מחיר המשך 99 ₪"
                value={formData.afterPrice ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, afterPrice: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              רשימת יתרונות (שורה אחת לכל פריט)
            </label>
            <textarea
              className="w-full border rounded-lg p-2 text-sm min-h-[80px]"
              placeholder={"5000 דקות שיחה\nגלישה: 800GB\n500 דקות לחו״ל"}
              value={Array.isArray(formData.features) ? formData.features.join("\n") : (formData.features ?? "")}
              onChange={(e) =>
                setFormData({ ...formData, features: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              קישור ללוגו (אופציונלי)
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              placeholder="https://..."
              value={formData.logoUrl}
              onChange={(e) =>
                setFormData({ ...formData, logoUrl: e.target.value })
              }
            />
            <select
              className="mt-2 w-full border rounded-lg p-2 text-sm bg-gray-50"
              defaultValue=""
              onChange={(e) => {
                const preset = PROVIDER_LOGO_PRESETS.find(
                  (p) => p.key === e.target.value
                );
                if (preset) {
                  setFormData({ ...formData, logoUrl: preset.path });
                }
              }}
            >
              <option value="">או בחר לוגו מובנה מתיקיית logos</option>
              {PROVIDER_LOGO_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              שים את קבצי ה־PNG בתיקייה <code>logos</code> ליד <code>index.html</code>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              קטגוריה
            </label>
            <select
              className="w-full border rounded-lg p-2"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="kosher">קו כשר (שיחות בלבד)</option>
              <option value="4g">דור 4 (סמארטפון רגיל)</option>
              <option value="5g">דור 5 (מהירות גבוהה)</option>
              <option value="internet">אינטרנט ביתי (סיבים)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                גלישה (GB)
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                placeholder="0 אם אין"
                value={formData.dataGB}
                onChange={(e) =>
                  setFormData({ ...formData, dataGB: e.target.value })
                }
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="is5g"
                className="w-5 h-5 text-blue-600 rounded"
                checked={formData.is5G}
                onChange={(e) =>
                  setFormData({ ...formData, is5G: e.target.checked })
                }
              />
              <label
                htmlFor="is5g"
                className="mr-2 text-sm font-medium text-gray-700"
              >
                תומך 5G
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              דקות שיחה
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              placeholder="לדוג': 5000 או ללא הגבלה"
              value={formData.calls}
              onChange={(e) =>
                setFormData({ ...formData, calls: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              הערות/תוספות
            </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                placeholder='לדוג": כולל שיחות לחו"ל'
                value={formData.extras}
                onChange={(e) =>
                  setFormData({ ...formData, extras: e.target.value })
                }
              />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4"
          >
            שמור והוסף לאתר
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">אפשרויות מתקדמות:</p>
          <button
            type="button"
            onClick={onLoadDemo}
            className="w-full bg-green-50 text-green-700 border border-green-200 py-3 rounded-lg font-bold hover:bg-green-100 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> טען נתונים לדוגמה מהשוק (פברואר 2026)
          </button>
        </div>
      </div>
    </div>
  );
}

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

