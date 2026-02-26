/**
 * B-Phone – פאנל ניהול נפרד
 * דף ניהול מלא, רספונסיבי, נפרד מהאתר הראשי
 */
const { useState, useEffect, useMemo } = React;

// --- Firebase & Utils (זהים ל-app.jsx) ---
function getDb() {
  return typeof window !== "undefined" && window.firebaseApp && window.firebase?.firestore ? window.firebase.firestore() : null;
}
function getAuth() {
  return typeof window !== "undefined" && window.firebaseApp && window.firebase?.auth ? window.firebase.auth() : null;
}
function formatPrice(val) {
  if (val == null || val === "") return "";
  const n = typeof val === "number" ? val : parseInt(String(val).replace(/,/g, ""), 10);
  return Number.isNaN(n) ? String(val) : n >= 1000 ? n.toLocaleString("en-US") : String(n);
}
const ALLOWED_ADMIN_EMAILS = ["bp0527151000@gmail.com", "123123mushh@gmail.com"];
function isAllowedAdmin(email) {
  if (!email || typeof email !== "string") return false;
  return ALLOWED_ADMIN_EMAILS.some((e) => e.toLowerCase() === email.trim().toLowerCase());
}
// דומיין ראשי לאתר (ריק = לא בודקים). אם נכנסים מכתובת אחרת – תוצג אזהרה.
const MAIN_ADMIN_DOMAIN = "b-phone.netlify.app"; // לדוגמה: "bphone.co.il" או "your-site.netlify.app"
function getLoginErrorHebrew(code, message) {
  const t = {
    "auth/invalid-credential": "פרטי התחברות לא נכונים. האימייל או הסיסמה שגויים, או שאין משתמש רשום עם אימייל זה.",
    "auth/invalid-email": "כתובת האימייל לא תקינה. בדוק את פורמט האימייל.",
    "auth/user-disabled": "חשבון המשתמש הושבת. פנה למנהל המערכת.",
    "auth/user-not-found": "לא נמצא משתמש עם אימייל זה במערכת.",
    "auth/wrong-password": "הסיסמה שגויה. האימייל תקין – נסה סיסמה אחרת.",
    "auth/too-many-requests": "ניסיונות התחברות רבים מדי. נסה שוב מאוחר יותר או איפוס סיסמה.",
    "auth/network-request-failed": "שגיאת רשת. בדוק את החיבור לאינטרנט ונסה שוב.",
    "auth/popup-closed-by-user": "ההתחברות עם Google בוטלה (החלון נסגר).",
    "auth/popup-blocked": "הדפדפן חסם את חלון Google. אשר חלונות קופצים לאתר.",
    "auth/operation-not-allowed": "שיטת ההתחברות הזו לא מופעלת בהגדרות הפרויקט.",
    "auth/weak-password": "הסיסמה חלשה מדי (נדרשת לפחות 6 תווים).",
    "auth/email-already-in-use": "האימייל כבר רשום במערכת.",
    "auth/requires-recent-login": "נדרשת התחברות מחדש מסיבות אבטחה.",
  };
  if (t[code]) return t[code];
  return message ? `${code}: ${message}` : `שגיאת התחברות: ${code}`;
}
const IMGBB_API_KEY = typeof window !== "undefined" && window.IMGBB_API_KEY ? window.IMGBB_API_KEY : "";
// אותו API של ביביפ בוט – Gemini דרך Cloudflare Worker (מוגדר ב-admin.html כמו ב-index.html)
const GEMINI_PROXY_URL = typeof window !== "undefined" && window.GEMINI_PROXY_URL ? window.GEMINI_PROXY_URL : "";

async function callGeminiAdmin(prompt, systemInstruction) {
  if (!GEMINI_PROXY_URL) throw new Error("לא הוגדר GEMINI_PROXY_URL");
  const res = await fetch(GEMINI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data.text || "";
}

/** משתמש באותו Gemini של ביביפ בוט – מחזיר המלצות למוצר (תיאור, תגית, תגיות) בסגנון ביפון */
async function suggestProductWithAI(productName) {
  if (!GEMINI_PROXY_URL || !productName || !String(productName).trim()) return null;
  const name = String(productName).trim();
  const systemInstruction = `אתה עוזר לחנות ביפון תקשורת סלולרית – סניפים בבית שמש וביתר. תחזיר רק JSON תקני, בלי טקסט לפני או אחרי.
סגנון התיאורים: משפט פתיחה על המוצר, שורות עם ✔️ או ✅ (ביצועים, מסך, מצלמה, נפח אחסון). לסיים ב"זמין במבחר צבעים" אם מתאים.
תגית מבצע: קצר – "מבצע חם!", "יחידה אחרונה במלאי", "במחיר מיוחד".
תגיות: מותג, דגם, נפח, מופרדות בפסיק.`;
  const prompt = `המוצר/מכשיר: "${name}". החזר JSON עם המפתחות בלבד (עברית): description (תיאור שיווקי עם ✔️), badge (תגית מבצע קצרה), tags (מחרוזת תגיות בפסיקים), priceSuggestion (מספר או null).`;
  try {
    const raw = await callGeminiAdmin(prompt, systemInstruction);
    const jsonMatch = (raw || "").match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    if (parsed && typeof parsed.description === "string") {
      return {
        description: parsed.description,
        badge: typeof parsed.badge === "string" ? parsed.badge : "",
        tagsText: Array.isArray(parsed.tags) ? parsed.tags.join(", ") : (parsed.tags || ""),
        priceSuggestion: typeof parsed.priceSuggestion === "number" ? parsed.priceSuggestion : null,
      };
    }
    return null;
  } catch (e) {
    console.warn("AI suggestion failed", e);
    throw e;
  }
}

async function uploadImageToImgBB(file, retries = 2) {
  if (!IMGBB_API_KEY) return null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const form = new FormData();
      form.append("key", IMGBB_API_KEY);
      form.append("image", file);
      const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data?.data?.url) return data.data.url;
    } catch (_) {}
    if (attempt < retries) await new Promise((r) => setTimeout(r, 800));
  }
  return null;
}

// --- Icons ---
const X = () => <span className="text-lg">✕</span>;
const Menu = () => <span className="text-xl">☰</span>;
const Edit2 = () => <span className="text-base">✏️</span>;
const Trash2 = () => <span className="text-base">🗑️</span>;
const Plus = () => <span className="text-lg">＋</span>;
const ImageIcon = () => <span className="text-base">🖼️</span>;
const Settings = () => <span className="text-base">⚙️</span>;
const LogOut = () => <span className="text-base">↩</span>;
const Package = () => <span className="text-base">📦</span>;
const Product = () => <span className="text-base">📱</span>;
const Layout = () => <span className="text-base">🏠</span>;
const Zap = () => <span className="text-base">⚡</span>;
const ExternalLink = () => <span className="text-base">↗</span>;
const Grip = () => <span className="text-slate-400 cursor-grab active:cursor-grabbing select-none text-lg" title="גרור לשינוי סדר">⋮⋮</span>;
const Eye = () => <span className="text-lg" title="תצוגה מקדימה">👁</span>;
const Refresh = () => <span className="text-base">🔄</span>;

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
  logoUrl: "./logos/logo-bphone.png",
  botLogoUrl: "",
  heroBanners: [],
  heroDefaultBannerIndex: -1,
  heroBannerDurationSeconds: 5,
  siteTexts: DEFAULT_SITE_TEXTS,
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  locations: [
    { id: "bs", city: "בית שמש", address: "רחוב יצחק רבין 17", phone: "052-7151000", hours: "א'-ה': 10:00-21:00" },
    { id: "beitar", city: "ביתר עילית", address: "המגיד ממעזריטש 71", phone: "02-9911213", hours: "א'-ה': 10:00-21:00" }
  ],
  services: [
    { title: "מעבדה לתיקון סמארטפונים", desc: "תיקון מכשירי סלולר במקום", iconUrl: "" },
    { title: "תיקון מחשבים וניידים", desc: "פתרון תקלות חומרה ותוכנה", iconUrl: "" },
    { title: "התקנת סינון אינטרנט כשר", desc: "כשר פליי, הדרן ועוד", iconUrl: "" },
    { title: "אביזרים ומיגון", desc: "מגני ספר, מסכי מגן", iconUrl: "" },
  ],
};
const PROVIDER_LOGO_PRESETS = [
  { key: "golan", label: "Golan", path: "./logos/golan.png" },
  { key: "cellcom", label: "Cellcom", path: "./logos/cellcom.png" },
  { key: "hot", label: "Hot", path: "./logos/hot.png" },
  { key: "pelephone", label: "Pelephone", path: "./logos/pelephone.png" },
  { key: "partner", label: "Partner", path: "./logos/partner.png" },
  { key: "019", label: "019", path: "./logos/019.png" },
  { key: "wecom", label: "WeCom", path: "./logos/wecom.png" },
  { key: "bezeq", label: "Bezeq", path: "./logos/bezeq.png" },
];

// --- Login ---
function LoginScreen({ onLogin, onLoginGoogle, showToast, initialError, onClearInitialError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const auth = getAuth();
  const useFirebase = Boolean(auth);

  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalDev = hostname === "localhost" || hostname === "127.0.0.1";
  const mainDomain = MAIN_ADMIN_DOMAIN && MAIN_ADMIN_DOMAIN.trim();
  const isWrongDomain = mainDomain && hostname !== mainDomain && !hostname.endsWith("." + mainDomain);
  const displayError = initialError || error;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (email === "bp0527151000@gmail.com" && password === "123456") {
      onLogin();
      return;
    }
    if (!useFirebase) {
      if (password === "1234") onLogin();
      else {
        setError("הסיסמה שגויה. נסה שוב או וודא שאתה משתמש בסיסמת הגישה הנכונה.");
        if (showToast) showToast("סיסמה שגויה", "error");
      }
      return;
    }
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email.trim(), password);
      onLogin();
    } catch (err) {
      setLoading(false);
      const msg = getLoginErrorHebrew(err.code || "", err.message || "");
      setError(msg);
      if (showToast) showToast(msg, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2a4a6f] to-[#1e3a5f] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">פאנל ניהול B-Phone</h1>
          <p className="text-slate-500 mt-1">התחבר כדי להמשיך</p>
        </div>

        {isLocalDev && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>סביבת פיתוח:</strong> אתה נכנס מכתובת מקומית (localhost). לניהול האתר במצב לייב יש להיכנס מהדומיין הראשי של האתר.
          </div>
        )}
        {isWrongDomain && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            <strong>דומיין לא ראשי:</strong> אתה לא נמצא בכתובת האתר הרשמית ({mainDomain}). וודא שאתה נכנס מכתובת האתר הנכונה כדי להבטיח גישה מלאה.
          </div>
        )}

        {displayError && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm" role="alert">
            <strong>בעיה בהתחברות:</strong>
            <p className="mt-1">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); if (onClearInitialError) onClearInitialError(); }} className="w-full border rounded-lg p-3" placeholder="admin@example.com" required autoFocus={!useFirebase} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); if (onClearInitialError) onClearInitialError(); }} className="w-full border rounded-lg p-3" placeholder="••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-bold hover:bg-[#2a4a6f] transition disabled:opacity-60">
            {loading ? "מתחבר..." : "כניסה"}
          </button>
          {useFirebase && (
            <button type="button" onClick={onLoginGoogle} className="w-full border-2 border-slate-200 py-3 rounded-lg font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              התחבר עם Google
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

// --- Toast ---
function Toast({ message, type, onClose }) {
  const bg = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-slate-700";
  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm ${bg} text-white px-4 py-3 rounded-lg shadow-lg z-[9999] flex justify-between items-center`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
    </div>
  );
}

// --- Preview Modal (תצוגה מקדימה – שליטה מרחוק) ---
function PreviewModal({ open, onClose, onRefresh, onEditSection, quickEditOpen, setQuickEditOpen, iframeKey }) {
  if (!open) return null;

  const quickEditItems = [
    { id: "promo", label: "כותרת ומסר ראשי (מבצע ראשי)", section: "promo" },
    { id: "settings", label: "כותרות, כפתורים והצגת אזורים", section: "settings" },
    { id: "products", label: "מוצרים ומכשירים", section: "products" },
    { id: "packages", label: "חבילות גלישה", section: "packages" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900" dir="rtl">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#1e3a5f] text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">תצוגה מקדימה של האתר</span>
          <span className="text-white/70 text-sm hidden sm:inline">לחץ על כל טקסט באתר כדי לערוך – השינויים נשמרים אוטומטית</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setQuickEditOpen(!quickEditOpen)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium">
            {quickEditOpen ? "הסתר עריכה מהירה" : "הצג עריכה מהירה"}
          </button>
          <button onClick={onRefresh} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" title="רענן תצוגה"><Refresh /></button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 font-bold">סגור</button>
        </div>
      </header>
      <div className="flex-1 flex min-h-0">
        {quickEditOpen && (
          <aside className="w-64 flex-shrink-0 bg-slate-800 border-l border-slate-700 overflow-y-auto p-4">
            <h3 className="font-bold text-white mb-3 text-sm">עריכה מהירה</h3>
            <p className="text-slate-400 text-xs mb-4">לחץ על פריט כדי לסגור את התצוגה ולעבור לעריכה באזור המתאים.</p>
            <ul className="space-y-2">
              {quickEditItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => { onEditSection(item.section); onClose(); }}
                    className="w-full text-right px-3 py-2.5 rounded-lg bg-slate-700/80 hover:bg-amber-600/90 text-white text-sm font-medium transition"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <div className="flex-1 min-w-0 min-h-0 bg-slate-800 p-2 sm:p-4">
          <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-slate-600 shadow-2xl bg-white">
            <iframe
              key={iframeKey}
              src="/?admin_edit=1"
              title="תצוגה מקדימה של האתר"
              className="w-full h-full border-0 rounded-xl"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Confirm Delete ---
function ConfirmDelete({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border-2 border-slate-100" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-xl text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-600 text-lg mb-6">{message}</p>
        <div className="flex gap-4 justify-end">
          <button onClick={onCancel} className="px-6 py-3 border-2 rounded-xl font-medium">ביטול</button>
          <button onClick={onConfirm} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">מחק</button>
        </div>
      </div>
    </div>
  );
}

// --- Main Admin App ---
function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    try { return sessionStorage.getItem("adminSection") || "dashboard"; } catch { return "dashboard"; }
  });
  const [toast, setToast] = useState(null);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [promoMessage, setPromoMessage] = useState({ title: "מבצעי השקה!", subtitle: "הצטרפו היום", active: true });
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loginErrorMessage, setLoginErrorMessage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [quickEditOpen, setQuickEditOpen] = useState(true);

  const showToast = (msg, type = "info") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      setLoading(false);
      return () => {};
    }
    let unsub = () => {};
    const run = async () => {
      const Persistence = window.firebase?.auth?.Auth?.Persistence;
      if (Persistence?.LOCAL) {
        try { await auth.setPersistence(Persistence.LOCAL); } catch (_) {}
      }
      unsub = auth.onAuthStateChanged((user) => {
        setLoading(false);
        if (!user) { setLoggedIn(false); setLoginErrorMessage(null); return; }
        if (!isAllowedAdmin(user.email)) {
          auth.signOut();
          setLoggedIn(false);
          setLoginErrorMessage("האימייל שלך לא מורשה לגשת לפאנל ניהול. רק כתובות מהרשימת המנהלים יכולות להיכנס. אם אתה מנהל – וודא שהתחברת עם המייל הנכון.");
          return;
        }
        setLoginErrorMessage(null);
        setLoggedIn(true);
      });
    };
    run();
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const db = getDb();
    if (!db) return;
    const configRef = db.doc("config/site");
    const packagesRef = db.collection("packages");
    const productsRef = db.collection("products");
    Promise.all([
      configRef.get().then((s) => (s.exists ? s.data() : null)),
      packagesRef.get().then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      productsRef.get().then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    ]).then(([cfg, pkgs, prods]) => {
      if (cfg) {
        setSiteConfig((prev) => ({
          ...DEFAULT_CONFIG,
          ...cfg,
          locations: cfg.locations || prev.locations,
          services: cfg.services || prev.services,
          siteTexts: { ...DEFAULT_SITE_TEXTS, ...(cfg.siteTexts || {}) },
          sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY, ...(cfg.sectionVisibility || {}) },
        }));
        if (cfg.promoMessage) setPromoMessage((p) => ({ ...p, ...cfg.promoMessage }));
      }
      if (pkgs?.length) setPackages(pkgs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)).map((p, i) => ({ ...p, order: p.order ?? i })));
      if (prods?.length) setProducts(prods.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)));
    }).catch(console.warn);
  }, [loggedIn]);

  useEffect(() => {
    try { sessionStorage.setItem("adminSection", activeSection); } catch (_) {}
  }, [activeSection]);

  useEffect(() => {
    const handler = (event) => {
      const d = event.data;
      if (!d || typeof d.type !== "string") return;
      const db = getDb();
      if (d.type === "EDIT_SITE_TEXT" && d.key != null) {
        setSiteConfig((prev) => {
          const nextSiteTexts = { ...(prev.siteTexts || {}), [d.key]: d.value };
          if (db) db.doc("config/site").set({ siteTexts: nextSiteTexts }, { merge: true }).catch(() => {});
          return { ...prev, siteTexts: nextSiteTexts };
        });
      } else if (d.type === "EDIT_PROMO" && d.field) {
        setPromoMessage((prev) => {
          const next = { ...prev, [d.field]: d.value };
          if (db) db.doc("config/site").set({ promoMessage: next }, { merge: true }).catch(() => {});
          return next;
        });
      } else if (d.type === "EDIT_SERVICE" && typeof d.index === "number" && d.field) {
        setSiteConfig((prev) => {
          const services = [...(prev.services || [])];
          if (services[d.index]) {
            services[d.index] = { ...services[d.index], [d.field]: d.value };
            if (db) db.doc("config/site").set({ services }, { merge: true }).catch(() => {});
            return { ...prev, services };
          }
          return prev;
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    showToast("התחברת בהצלחה", "success");
  };
  const handleLoginGoogle = () => {
    const auth = getAuth();
    if (!auth || !window.firebase?.auth?.GoogleAuthProvider) return;
    const Persistence = window.firebase?.auth?.Auth?.Persistence;
    const setPersistenceThenSignIn = () => {
      if (Persistence?.LOCAL) {
        auth.setPersistence(Persistence.LOCAL).then(() => auth.signInWithPopup(new window.firebase.auth.GoogleAuthProvider())).then(handleGoogleSuccess).catch(handleGoogleError);
      } else {
        auth.signInWithPopup(new window.firebase.auth.GoogleAuthProvider()).then(handleGoogleSuccess).catch(handleGoogleError);
      }
    };
    const handleGoogleSuccess = (cred) => {
      if (!cred?.user || !isAllowedAdmin(cred.user.email)) {
        auth.signOut();
        setLoginErrorMessage("האימייל שלך לא מורשה לגשת לפאנל ניהול. רק כתובות מהרשימת המנהלים יכולות להיכנס.");
        return;
      }
      setLoginErrorMessage(null);
      setLoggedIn(true);
      showToast("התחברת בהצלחה", "success");
    };
    const handleGoogleError = (e) => {
      if (e.code === "auth/popup-closed-by-user") return;
      const msg = getLoginErrorHebrew(e.code || "", e.message || "");
      setLoginErrorMessage(msg);
      showToast(msg, "error");
    };
    setPersistenceThenSignIn();
  };
  const handleLogout = () => {
    const auth = getAuth();
    if (auth) auth.signOut();
    setLoggedIn(false);
    showToast("התנתקת", "info");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-pulse text-slate-500">טוען...</div></div>;
  if (!loggedIn) return <LoginScreen onLogin={handleLogin} onLoginGoogle={handleLoginGoogle} showToast={showToast} initialError={loginErrorMessage} onClearInitialError={() => setLoginErrorMessage(null)} />;

  const openPreviewAndEdit = (section) => {
    setActiveSection(section);
    setPreviewOpen(false);
  };

  const navItems = [
    { id: "dashboard", label: "סקירה", icon: Layout },
    { id: "settings", label: "הגדרות אתר", icon: Settings },
    { id: "packages", label: "חבילות", icon: Package },
    { id: "products", label: "מוצרים", icon: Product },
    { id: "promo", label: "מבצע ראשי", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-80 bg-[#1e3a5f] text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-bold text-lg">B-Phone ניהול</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded">
            <X />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition ${activeSection === item.id ? "bg-orange-500/90" : "hover:bg-white/10"}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-white/10">
          <button onClick={() => { setPreviewOpen(true); setSidebarOpen(false); }} className="flex items-center gap-2 text-white/80 hover:text-white w-full mb-2 py-2 rounded-lg hover:bg-white/10 transition text-right">
            <Eye /> תצוגה מקדימה של האתר
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/80 hover:text-white mb-2">
            <ExternalLink /> פתח את האתר
          </a>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/80 hover:text-white w-full">
            <LogOut /> יציאה
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="flex-1 lg:mr-80 min-h-screen">
        <header className="sticky top-0 z-20 bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu />
          </button>
          <h1 className="font-bold text-xl text-slate-800">{navItems.find((n) => n.id === activeSection)?.label || "ניהול"}</h1>
        </header>

        <div className="p-8 md:p-10 lg:p-12">
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              <div className="text-center sm:text-right">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">ברוך הבא לפאנל הניהול</h2>
                <p className="text-slate-600">בחר לאן לעבור – כל השינויים נשמרים אוטומטית</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-6">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all border-2 border-cyan-500/30"
                >
                  <Eye /> תצוגה מקדימה של האתר
                </button>
                <span className="self-center text-slate-500 text-sm">רואה את האתר כמו שהלקוחות רואים – ועריכה מהירה</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <button
                  type="button"
                  onClick={() => { setActiveSection("products"); setSidebarOpen(false); }}
                  className="group flex flex-col items-center sm:items-start text-right p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all border-2 border-[#1e3a5f]/20"
                >
                  <span className="text-4xl sm:text-5xl mb-3 block">📱</span>
                  <span className="font-bold text-lg sm:text-xl mb-1">עריכת מוצרים</span>
                  <span className="text-white/80 text-sm mb-4">הוסף, ערוך או מחק מוצרים ומכשירים</span>
                  <span className="text-2xl sm:text-3xl font-extrabold">{products.length}</span>
                  <span className="text-white/70 text-sm">מוצרים באתר</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveSection("packages"); setSidebarOpen(false); }}
                  className="group flex flex-col items-center sm:items-start text-right p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all border-2 border-emerald-500/20"
                >
                  <span className="text-4xl sm:text-5xl mb-3 block">📦</span>
                  <span className="font-bold text-lg sm:text-xl mb-1">חבילות גלישה</span>
                  <span className="text-white/80 text-sm mb-4">ניהול חבילות סלולר ואינטרנט</span>
                  <span className="text-2xl sm:text-3xl font-extrabold">{packages.length}</span>
                  <span className="text-white/70 text-sm">חבילות</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveSection("settings"); setSidebarOpen(false); }}
                  className="group flex flex-col items-center sm:items-start text-right p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all border-2 border-amber-400/20"
                >
                  <span className="text-4xl sm:text-5xl mb-3 block">⚙️</span>
                  <span className="font-bold text-lg sm:text-xl mb-1">הגדרות אתר</span>
                  <span className="text-white/80 text-sm mb-4">לוגו, טלפון, סניפים, שירותים ובאנרים</span>
                  <span className="text-2xl sm:text-3xl font-extrabold">{siteConfig.locations?.length || 0}</span>
                  <span className="text-white/70 text-sm">סניפים</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveSection("promo"); setSidebarOpen(false); }}
                  className="group flex flex-col items-center sm:items-start text-right p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all border-2 border-violet-500/20"
                >
                  <span className="text-4xl sm:text-5xl mb-3 block">⚡</span>
                  <span className="font-bold text-lg sm:text-xl mb-1">מבצע ראשי</span>
                  <span className="text-white/80 text-sm mb-4">כותרת ומסר בראש העמוד</span>
                  <span className="text-sm font-medium mt-2 px-3 py-1 rounded-full bg-white/20">{promoMessage?.active ? "פעיל" : "כבוי"}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm">
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium">{products.length} מוצרים</span>
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium">{packages.length} חבילות</span>
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium">{siteConfig.locations?.length || 0} סניפים</span>
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium">{products.filter((p) => p.featured).length + packages.filter((p) => p.featured).length} במבצעים מומלצים</span>
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <SettingsSection config={siteConfig} onSave={setSiteConfig} showToast={showToast} />
          )}
          {activeSection === "packages" && (
            <PackagesSection packages={packages} setPackages={setPackages} onDeleteRequest={setPackageToDelete} showToast={showToast} />
          )}
          {activeSection === "products" && (
            <ProductsSection products={products} setProducts={setProducts} onDeleteRequest={setProductToDelete} showToast={showToast} />
          )}
          {activeSection === "promo" && (
            <PromoSection promo={promoMessage} setPromo={setPromoMessage} showToast={showToast} products={products} packages={packages} onNavigate={setActiveSection} />
          )}
        </div>
      </main>

      {previewOpen && (
        <PreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onRefresh={() => setPreviewKey((k) => k + 1)}
          onEditSection={openPreviewAndEdit}
          quickEditOpen={quickEditOpen}
          setQuickEditOpen={setQuickEditOpen}
          iframeKey={previewKey}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {packageToDelete && (
        <ConfirmDelete
          title="מחיקת חבילה"
          message={`למחוק את החבילה ${packageToDelete.providerName || packageToDelete.provider}?`}
          onConfirm={() => {
            const p = packageToDelete;
            const db = getDb();
            if (db && p.id && !String(p.id).startsWith("demo-")) {
              db.collection("packages").doc(p.id).delete()
                .then(() => { setPackages((prev) => prev.filter((x) => x.id !== p.id)); setPackageToDelete(null); showToast("נמחק", "success"); })
                .catch((e) => { console.error(e); showToast("שגיאה במחיקה", "error"); });
            } else {
              setPackages((prev) => prev.filter((x) => x.id !== p.id));
              setPackageToDelete(null);
              showToast("נמחק", "success");
            }
          }}
          onCancel={() => setPackageToDelete(null)}
        />
      )}
      {productToDelete && (
        <ConfirmDelete
          title="מחיקת מוצר"
          message={`למחוק את המוצר ${productToDelete.name}?`}
          onConfirm={() => {
            const p = productToDelete;
            const db = getDb();
            if (db && p.id && !String(p.id).startsWith("prod-")) {
              db.collection("products").doc(p.id).delete()
                .then(() => { setProducts((prev) => prev.filter((x) => x.id !== p.id)); setProductToDelete(null); showToast("נמחק", "success"); })
                .catch((e) => { console.error(e); showToast("שגיאה במחיקה", "error"); });
            } else {
              setProducts((prev) => prev.filter((x) => x.id !== p.id));
              setProductToDelete(null);
              showToast("נמחק", "success");
            }
          }}
          onCancel={() => setProductToDelete(null)}
        />
      )}
    </div>
  );
}

// --- Promo Section ---
function PromoSection({ promo, setPromo, showToast, products = [], packages = [], onNavigate }) {
  const [form, setForm] = useState(promo);
  useEffect(() => setForm(promo), [promo]);
  const db = getDb();
  const featuredProducts = (products || []).filter((p) => p.featured);
  const featuredPackages = (packages || []).filter((p) => p.featured);

  const save = () => {
    if (db) {
      db.doc("config/site").set({ promoMessage: form }, { merge: true })
        .then(() => { setPromo(form); showToast("נשמר", "success"); })
        .catch((e) => { showToast("שגיאה בשמירה", "error"); });
    } else { setPromo(form); showToast("נשמר", "success"); }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white rounded-3xl p-10 shadow-lg border-2 border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-[#1e3a5f]">מבצע ראשי (כותרת בעמוד הראשי)</h3>
        <p className="text-slate-600 mb-6">הכותרת והמסר שמופיעים בראש העמוד הראשי, מעל החבילות והמוצרים.</p>
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">כותרת</label>
            <input type="text" value={form.title || ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3 text-base" placeholder="לדוג׳: מבצעי השקה!" />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">תת-כותרת</label>
            <input type="text" value={form.subtitle || ""} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3 text-base" placeholder="לדוג׳: הצטרפו היום" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-xl">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-5 h-5" />
            <span className="font-bold text-slate-800">מבצע פעיל</span>
            <span className="text-sm text-slate-500">(אם מסומן – הכותרת תוצג בעמוד הראשי)</span>
          </label>
          <button onClick={save} className="w-full bg-[#1e3a5f] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2a4a6f] transition">שמור מבצע ראשי</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-10 shadow-lg border-2 border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-2 pb-3 border-b-2 border-amber-200">מוצרים וחבילות במבצעים המומלצים</h3>
        <p className="text-slate-600 mb-6">אלה המוצרים והחבילות שסומנו "במבצעים מומלצים" – הם יופיעו בראש האתר. לעריכת פריט או להסרתו מהמבצעים עברו למוצרים או לחבילות.</p>
        <div className="space-y-4">
          {featuredProducts.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><span>📱</span> מוצרים ({featuredProducts.length})</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 mb-2">
                {featuredProducts.map((p) => (
                  <li key={p.id}>{p.name || "ללא שם"}{p.price != null ? ` – ₪${p.price}` : ""}</li>
                ))}
              </ul>
              {onNavigate && <button type="button" onClick={() => onNavigate("products")} className="text-[#1e3a5f] font-medium hover:underline">ערוך מוצרים →</button>}
            </div>
          )}
          {featuredPackages.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><span>📦</span> חבילות ({featuredPackages.length})</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 mb-2">
                {featuredPackages.map((p) => (
                  <li key={p.id}>{p.providerName || p.provider || "ללא שם"} – ₪{p.price}/חודש</li>
                ))}
              </ul>
              {onNavigate && <button type="button" onClick={() => onNavigate("packages")} className="text-[#1e3a5f] font-medium hover:underline">ערוך חבילות →</button>}
            </div>
          )}
          {featuredProducts.length === 0 && featuredPackages.length === 0 && (
            <p className="text-slate-500 py-4">אין עדיין מוצרים או חבילות במבצעים המומלצים. הוסף מוצר או חבילה וסמן "במבצעים מומלצים" בשמירה.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Settings Section (גדול, ברור, עם הסברים) ---
function SettingsSection({ config, onSave, showToast }) {
  const [form, setForm] = useState(config);
  useEffect(() => setForm(config), [config]);
  const texts = form.siteTexts || DEFAULT_SITE_TEXTS;
  const vis = form.sectionVisibility || DEFAULT_SECTION_VISIBILITY;
  const setText = (key, val) => setForm((f) => ({ ...f, siteTexts: { ...(f.siteTexts || DEFAULT_SITE_TEXTS), [key]: val } }));
  const setVis = (key, val) => setForm((f) => ({ ...f, sectionVisibility: { ...(f.sectionVisibility || DEFAULT_SECTION_VISIBILITY), [key]: val } }));
  const [logoUp, setLogoUp] = useState(false);
  const [botUp, setBotUp] = useState(false);
  const db = getDb();

  const uploadLogo = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !IMGBB_API_KEY) return;
    setLogoUp(true);
    const url = await uploadImageToImgBB(f);
    setLogoUp(false);
    if (url) { setForm((f) => ({ ...f, logoUrl: url })); showToast("לוגו הועלה", "success"); }
    e.target.value = "";
  };
  const uploadBot = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !IMGBB_API_KEY) return;
    setBotUp(true);
    const url = await uploadImageToImgBB(f);
    setBotUp(false);
    if (url) { setForm((f) => ({ ...f, botLogoUrl: url })); showToast("לוגו ביביפ הועלה", "success"); }
    e.target.value = "";
  };

  const save = () => {
    if (db) {
      db.doc("config/site").set(form, { merge: true })
        .then(() => { onSave(form); showToast("נשמר", "success"); })
        .catch(() => showToast("שגיאה", "error"));
    } else { onSave(form); showToast("נשמר", "success"); }
  };

  return (
    <div className="bg-white rounded-3xl p-10 shadow-lg max-w-5xl border-2 border-slate-100">
      <h3 className="text-2xl font-bold text-slate-800 mb-8 pb-4 border-b-2 border-[#1e3a5f]">הגדרות אתר</h3>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-200">
            <label className="block text-base font-bold text-slate-800 mb-1">לוגו האתר</label>
            <p className="text-sm text-slate-500 mb-3">הלוגו שמופיע בכותרת האתר. העלה תמונה או הדבק קישור.</p>
            <div className="flex gap-3 items-center flex-wrap mb-3">
              <label className="px-5 py-3 bg-blue-100 text-blue-700 rounded-lg cursor-pointer font-medium hover:bg-blue-200">{logoUp ? "מעלה..." : "העלה לוגו"}<input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={logoUp} /></label>
            </div>
            {form.logoUrl && (
              <div className="mb-3 p-3 bg-white rounded-xl border-2 border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-2">תצוגה מקדימה:</p>
                <img src={form.logoUrl} alt="לוגו" className="h-24 object-contain rounded-lg" onError={(e) => { e.target.style.display = "none"; }} />
              </div>
            )}
            <input type="text" value={form.logoUrl || ""} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3 text-base" placeholder="או הדבק קישור ישיר לתמונה" />
          </div>
          <div className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-200">
            <label className="block text-base font-bold text-slate-800 mb-1">לוגו ביביפ (אייקון הבוט)</label>
            <p className="text-sm text-slate-500 mb-3">אייקון הבוט בצ'אט. מומלץ תמונה מרובעת עם רקע שקוף (PNG).</p>
            <label className="px-5 py-3 bg-blue-100 text-blue-700 rounded-lg cursor-pointer font-medium hover:bg-blue-200 inline-block mb-3">{botUp ? "מעלה..." : "העלה לוגו ביביפ"}<input type="file" accept="image/*" className="hidden" onChange={uploadBot} disabled={botUp} /></label>
            {form.botLogoUrl && (
              <div className="mb-3 p-3 bg-white rounded-xl border-2 border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-2">תצוגה מקדימה:</p>
                <img src={form.botLogoUrl} alt="לוגו ביביפ" className="h-24 w-24 object-contain rounded-lg" onError={(e) => { e.target.style.display = "none"; }} />
              </div>
            )}
            <input type="text" value={form.botLogoUrl || ""} onChange={(e) => setForm((f) => ({ ...f, botLogoUrl: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3 text-base" placeholder="או הדבק קישור לתמונה" />
          </div>
        </div>
        <div className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-200">
          <label className="block text-base font-bold text-slate-800 mb-1">טלפון / וואטסאפ ללידים</label>
          <p className="text-sm text-slate-500 mb-3">המספר שיופיע בכפתורי "פרטים בוואטסאפ" ברחבי האתר. הזן ללא מקף (לדוג׳: 0527151000)</p>
          <input type="text" value={form.mainPhone || ""} onChange={(e) => setForm((f) => ({ ...f, mainPhone: e.target.value, whatsapp: e.target.value }))} className="w-full max-w-xs border-2 border-slate-200 rounded-lg p-3 text-base" placeholder="0527151000" dir="ltr" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-4">סניפים</h4>
          <p className="text-sm text-slate-500 mb-4">כל סניף מופיע בעמוד יצירת קשר עם כתובת, טלפון ושעות פתיחה.</p>
          <div className="space-y-4">
            {(form.locations || []).map((loc, i) => (
              <div key={loc.id || i} className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">עיר</label>
                  <input value={loc.city || ""} onChange={(e) => { const L = [...(form.locations || [])]; L[i] = { ...L[i], city: e.target.value }; setForm((f) => ({ ...f, locations: L })); }} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="לדוג׳: בית שמש" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">כתובת מלאה</label>
                  <input value={loc.address || ""} onChange={(e) => { const L = [...(form.locations || [])]; L[i] = { ...L[i], address: e.target.value }; setForm((f) => ({ ...f, locations: L })); }} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="רחוב, מספר בית" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">טלפון</label>
                  <input value={loc.phone || ""} onChange={(e) => { const L = [...(form.locations || [])]; L[i] = { ...L[i], phone: e.target.value }; setForm((f) => ({ ...f, locations: L })); }} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="02-9911213" dir="ltr" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">שעות פתיחה</label>
                  <textarea value={loc.hours || ""} onChange={(e) => { const L = [...(form.locations || [])]; L[i] = { ...L[i], hours: e.target.value }; setForm((f) => ({ ...f, locations: L })); }} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="א'-ה': 10:00-21:00" rows={2} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-4">שירותים</h4>
          <p className="text-sm text-slate-500 mb-4">כל שירות מופיע בעמוד הראשי עם כותרת ותיאור קצר.</p>
          <div className="space-y-4">
            {(form.services || []).map((srv, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">כותרת השירות</label>
                  <input value={srv.title || ""} onChange={(e) => { const S = [...(form.services || [])]; S[i] = { ...S[i], title: e.target.value }; setForm((f) => ({ ...f, services: S })); }} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="לדוג׳: מעבדה לתיקון סמארטפונים" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">תיאור</label>
                  <input value={srv.desc || ""} onChange={(e) => { const S = [...(form.services || [])]; S[i] = { ...S[i], desc: e.target.value }; setForm((f) => ({ ...f, services: S })); }} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="לדוג׳: תיקון מכשירי סלולר במקום" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-violet-50/70 rounded-2xl border-2 border-violet-200">
          <h4 className="text-lg font-bold text-slate-800 mb-2">הצג / הסתר אזורים באתר</h4>
          <p className="text-sm text-slate-600 mb-4">בחר אילו קטעים יופיעו בעמוד הראשי. כשהתיבה לא מסומנת – האזור לא יוצג כלל (כולל קישורים אליו).</p>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer" title="אזור הכרטיסים בראש האתר – מוצרים וחבילות שסימנת במבצעים מומלצים"><input type="checkbox" checked={vis.featured !== false} onChange={(e) => setVis("featured", e.target.checked)} className="w-5 h-5" /><span>מבצעים מומלצים</span></label>
            <label className="flex items-center gap-2 cursor-pointer" title="אזור רשימת המוצרים והמכשירים"><input type="checkbox" checked={vis.products !== false} onChange={(e) => setVis("products", e.target.checked)} className="w-5 h-5" /><span>אזור מוצרים</span></label>
            <label className="flex items-center gap-2 cursor-pointer" title="אזור חבילות הסלולר והאינטרנט"><input type="checkbox" checked={vis.packages !== false} onChange={(e) => setVis("packages", e.target.checked)} className="w-5 h-5" /><span>אזור חבילות</span></label>
            <label className="flex items-center gap-2 cursor-pointer" title="אזור ארבעת השירותים – מעבדה, סינון כשר וכו׳"><input type="checkbox" checked={vis.services !== false} onChange={(e) => setVis("services", e.target.checked)} className="w-5 h-5" /><span>אזור שירותים</span></label>
            <label className="flex items-center gap-2 cursor-pointer" title="אזור הסניפים – כתובות, טלפונים ושעות"><input type="checkbox" checked={vis.locations !== false} onChange={(e) => setVis("locations", e.target.checked)} className="w-5 h-5" /><span>אזור סניפים</span></label>
          </div>
        </div>

        <div className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-200">
          <h4 className="text-lg font-bold text-slate-800 mb-2">כותרות וטקסטים באתר</h4>
          <p className="text-sm text-slate-600 mb-2">ערוך את הכותרות והמשפטים שמופיעים בעמוד הראשי. ריק = יוצג טקסט ברירת מחדל.</p>
          <p className="text-sm text-amber-700 mb-4 font-medium">כפתורים (למטה): אם תמחק את הטקסט ותשמור – הכפתור ייעלם מהאתר.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">תג מעל כותרת מבצעים מומלצים</label><p className="text-xs text-slate-500 mb-1">התג הצבעוני הקטן (למשל "ההמלצות שלנו")</p><input value={texts.featuredBadge || ""} onChange={(e) => setText("featuredBadge", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="ההמלצות שלנו" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כותרת אזור מבצעים מומלצים</label><p className="text-xs text-slate-500 mb-1">הכותרת הראשית של האזור</p><input value={texts.featuredTitle || ""} onChange={(e) => setText("featuredTitle", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="מבצעים מומלצים" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">תת-כותרת אזור מבצעים מומלצים</label><p className="text-xs text-slate-500 mb-1">משפט מתחת לכותרת</p><input value={texts.featuredSubtitle || ""} onChange={(e) => setText("featuredSubtitle", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="מוצרים וחבילות שנבחרו במיוחד..." /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כותרת אזור המוצרים</label><p className="text-xs text-slate-500 mb-1">מעל רשימת המוצרים</p><input value={texts.productsTitle || ""} onChange={(e) => setText("productsTitle", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="מכשירים ומוצרים בחנות" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כותרת אזור החבילות</label><p className="text-xs text-slate-500 mb-1">מעל רשימת חבילות הסלולר</p><input value={texts.packagesTitle || ""} onChange={(e) => setText("packagesTitle", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="מצאו את החבילה שמתאימה לכם" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כותרת אזור השירותים</label><p className="text-xs text-slate-500 mb-1">מעל ארבעת כרטיסי השירות</p><input value={texts.servicesTitle || ""} onChange={(e) => setText("servicesTitle", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="כל מה שצריך במקום אחד" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">תת-כותרת אזור השירותים</label><p className="text-xs text-slate-500 mb-1">משפט מתחת לכותרת</p><input value={texts.servicesSubtitle || ""} onChange={(e) => setText("servicesSubtitle", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="שירותים ופתרונות תקשורת..." /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כותרת אזור הסניפים</label><p className="text-xs text-slate-500 mb-1">מעל רשימת הסניפים</p><input value={texts.locationsTitle || ""} onChange={(e) => setText("locationsTitle", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="הסניפים שלנו" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כותרת הפוטר (תחילת העמודה)</label><p className="text-xs text-slate-500 mb-1">בתחתית האתר</p><input value={texts.footerTitle || ""} onChange={(e) => setText("footerTitle", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="ביפון B-Phone – תקשורת סלולרית" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">תיאור הפוטר</label><p className="text-xs text-slate-500 mb-1">פסקה מתחת לכותרת הפוטר</p><input value={texts.footerDesc || ""} onChange={(e) => setText("footerDesc", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="הבית של הסלולר הכשר..." /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כפתור „לכל המוצרים” (באזור המבצעים)</label><p className="text-xs text-slate-500 mb-1">ריק = הכפתור לא יופיע</p><input value={texts.btnAllProducts || ""} onChange={(e) => setText("btnAllProducts", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="לכל המוצרים" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כפתור „לכל החבילות” (באזור המבצעים)</label><p className="text-xs text-slate-500 mb-1">ריק = הכפתור לא יופיע</p><input value={texts.btnAllPackages || ""} onChange={(e) => setText("btnAllPackages", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="לכל החבילות" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כפתור „מצא סניף” (בראש העמוד)</label><p className="text-xs text-slate-500 mb-1">ריק = הכפתור לא יופיע</p><input value={texts.btnFindBranch || ""} onChange={(e) => setText("btnFindBranch", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="מצא סניף קרוב" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כפתור „הצג עוד מוצרים” (באזור המוצרים)</label><p className="text-xs text-slate-500 mb-1">ריק = הכפתור לא יופיע</p><input value={texts.btnShowMoreProducts || ""} onChange={(e) => setText("btnShowMoreProducts", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="הצג עוד מוצרים" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">כפתור „הראה עוד” (באזור החבילות)</label><p className="text-xs text-slate-500 mb-1">ריק = הכפתור לא יופיע</p><input value={texts.btnShowMorePackages || ""} onChange={(e) => setText("btnShowMorePackages", e.target.value)} className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm" placeholder="הראה עוד" /></div>
          </div>
        </div>

        <button onClick={save} className="w-full max-w-md mx-auto block px-8 py-4 bg-[#1e3a5f] text-white rounded-xl font-bold text-lg hover:bg-[#2a4a6f]">שמור הגדרות</button>
      </div>
    </div>
  );
}

// --- Packages Section ---
function PackagesSection({ packages, setPackages, onDeleteRequest, showToast }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const db = getDb();

  const sortedPackages = useMemo(() => [...packages].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)), [packages]);

  const reorderPackages = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    const reordered = [...sortedPackages];
    const [item] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, item);
    const withOrder = reordered.map((p, i) => ({ ...p, order: i }));
    setPackages(withOrder);
    setDraggedIndex(null);
    setDropTargetIndex(null);
    if (db) {
      const batch = db.batch();
      withOrder.forEach((p, i) => {
        if (p.id && !String(p.id).startsWith("demo-")) batch.update(db.collection("packages").doc(p.id), { order: i });
      });
      batch.commit().then(() => showToast("הסדר עודכן", "success")).catch(() => showToast("שגיאה בעדכון הסדר", "error"));
    } else showToast("הסדר עודכן", "success");
  };

  const savePackage = (pkg) => {
    const payload = { ...pkg }; delete payload.id;
    if (db && pkg.id && !String(pkg.id).startsWith("demo-")) {
      db.collection("packages").doc(pkg.id).update(payload)
        .then(() => { setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...pkg, id: p.id } : p))); showToast("עודכן", "success"); })
        .catch(() => showToast("שגיאה", "error"));
    } else if (db) {
      const maxOrder = packages.reduce((m, p) => Math.max(m, (p.order ?? -1) + 1), 0);
      const pkgWithOrder = { ...pkg, order: pkg.order ?? maxOrder };
      const payload2 = { ...pkgWithOrder }; delete payload2.id;
      db.collection("packages").add(payload2)
        .then((ref) => { setPackages((prev) => [...prev, { ...pkgWithOrder, id: ref.id }].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))); showToast("נוסף", "success"); })
        .catch(() => showToast("שגיאה", "error"));
    } else {
      setPackages((prev) => [...prev, { ...pkg, id: `pkg-${Date.now()}` }]);
      showToast("נוסף", "success");
    }
  };

  const togglePackageFeatured = async (pkg) => {
    const next = !pkg.featured;
    if (db && pkg.id && !String(pkg.id).startsWith("demo-")) {
      try {
        await db.collection("packages").doc(pkg.id).update({ featured: next });
        setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, featured: next } : p)));
        showToast(next ? "נוסף למבצעים המומלצים" : "הוסר ממבצעים מומלצים", "success");
      } catch { showToast("שגיאה בעדכון", "error"); }
    } else {
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, featured: next } : p)));
      showToast(next ? "נוסף למבצעים" : "הוסר ממבצעים", "success");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <p className="text-slate-600 text-lg font-medium">{packages.length} חבילות</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-bold"><Plus /> הוסף חבילה</button>
      </div>
      <p className="text-slate-500 text-sm">גרור את ⋮⋮ לשינוי סדר התצוגה באתר</p>
      <div className="grid gap-5 sm:gap-6 w-full" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
        {sortedPackages.map((p, idx) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData("text/plain", idx); setDraggedIndex(idx); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (draggedIndex !== null) setDropTargetIndex(idx); }}
            onDragLeave={() => setDropTargetIndex(null)}
            onDrop={(e) => { e.preventDefault(); const from = parseInt(e.dataTransfer.getData("text/plain"), 10); reorderPackages(from, idx); }}
            onDragEnd={() => { setDraggedIndex(null); setDropTargetIndex(null); }}
            className={`bg-white rounded-3xl overflow-hidden shadow-lg border-2 flex flex-col transition-all select-none min-h-[320px] ${draggedIndex === idx ? "opacity-50 scale-95" : ""} ${dropTargetIndex === idx && draggedIndex !== idx ? "border-orange-400 ring-2 ring-orange-200" : "border-slate-100 hover:shadow-xl"}`}
          >
            <div className="relative p-6 pb-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-lg bg-white/95 hover:bg-slate-50 shadow border border-slate-200 touch-none"
                title="גרור לשינוי סדר"
              >
                <Grip />
              </div>
              <div className="flex items-center gap-4 pr-10">
                <div className="w-20 h-20 rounded-2xl bg-white shadow border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt="" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-3xl text-slate-300">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {p.featured && <span className="inline-block px-2 py-0.5 bg-amber-400 text-amber-900 rounded text-xs font-bold" title="במבצעים המומלצים באתר">✓ במבצע מומלץ</span>}
                      <span className="font-bold text-xl text-slate-800 leading-tight">{p.providerName || p.provider}</span>
                    </div>
                    {p.badge && <span className="inline-block w-fit px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">{p.badge}</span>}
                    <span className="text-slate-600 font-semibold text-lg">₪{formatPrice(p.price)}/חודש</span>
                    {p.priceDetail && <span className="text-slate-500 text-sm">{p.priceDetail}</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className={`px-6 py-3 flex items-center gap-2 border-b border-slate-100 bg-amber-50/50`}>
              <label className="flex items-center gap-2 cursor-pointer text-sm" title="סימון/ביטול – יופיע או לא יופיע באזור המבצעים המומלצים">
                <input type="checkbox" checked={!!p.featured} onChange={() => togglePackageFeatured(p)} className="w-4 h-4 rounded border-2 border-amber-400 text-amber-600" onClick={(e) => e.stopPropagation()} />
                <span className="font-medium text-slate-700">במבצע מומלץ</span>
              </label>
            </div>
            <div className={`px-6 py-5 flex-1 min-h-[100px] ${Array.isArray(p.features) && p.features.length > 0 ? "bg-slate-50/70" : "bg-slate-50/30"}`}>
              {Array.isArray(p.features) && p.features.length > 0 ? (
                <ul className="space-y-2.5 text-slate-600 text-base leading-relaxed">
                  {p.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 text-sm">אין יתרונות מוגדרים</p>
              )}
            </div>
            <div className="p-5 flex gap-3 border-t border-slate-100">
              <button onClick={() => { setEditing(p); setShowForm(true); }} className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200"><Edit2 /> ערוך</button>
              <button onClick={() => onDeleteRequest(p)} className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200"><Trash2 /> מחק</button>
            </div>
          </div>
        ))}
      </div>
      {showForm && <PackageFormModal key={editing?.id ?? "new"} pkg={editing} onSave={(data) => { savePackage(data); setEditing(null); setShowForm(false); }} onClose={() => { setEditing(null); setShowForm(false); }} />}
    </div>
  );
}

function PackageFormModal({ pkg, onSave, onClose }) {
  const [form, setForm] = useState(pkg || { provider: "", providerName: "", price: "", priceDetail: "", category: "4g", dataGB: 0, calls: "ללא הגבלה", features: [], logoUrl: "", isHot: false, badge: "", afterPrice: "", extras: "", is5G: false, order: 0, featured: false });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-[#1e3a5f]">{pkg ? "עריכת חבילה" : "הוספת חבילה חדשה"}</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-1">חברה / ספק (חובה)</label>
              <p className="text-xs text-slate-500 mb-2">שם החברה: פרטנר, סלקום, Golan וכו׳</p>
              <input value={form.provider || ""} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="לדוג׳: פרטנר" required />
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-1">שם לתצוגה (אופציונלי)</label>
              <p className="text-xs text-slate-500 mb-2">אם שונה משם החברה – לדוג׳: HOT mobile</p>
              <input value={form.providerName || ""} onChange={(e) => setForm((f) => ({ ...f, providerName: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="סלקום, HOT mobile..." />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-1">מחיר לחודש (₪) (חובה)</label>
              <p className="text-xs text-slate-500 mb-2">המחיר שמוצג בכרטיס החבילה</p>
              <input type="number" value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="35" required />
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-1">פירוט מחיר (תת־כותרת)</label>
              <p className="text-xs text-slate-500 mb-2">מתחת למחיר, לדוג׳: לקו שני ומעלה</p>
              <input value={form.priceDetail || ""} onChange={(e) => setForm((f) => ({ ...f, priceDetail: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="לקו שני ומעלה" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl flex flex-wrap gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.isHot} onChange={(e) => setForm((f) => ({ ...f, isHot: e.target.checked }))} className="w-5 h-5" />
              <span className="font-bold">מבצע מומלץ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer" title="יופיע בראש האתר באזור המבצעים המומלצים">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="w-5 h-5" />
              <span className="font-bold text-amber-800">במבצעים מומלצים</span>
              <span className="text-xs text-slate-500">(למעלה באתר)</span>
            </label>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">תג מבצע (אופציונלי)</label>
              <input value={form.badge || ""} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className="border-2 border-slate-200 rounded-lg p-2 w-40" placeholder="מבצע מטורף" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">מחיר המשך</label>
              <input value={form.afterPrice || ""} onChange={(e) => setForm((f) => ({ ...f, afterPrice: e.target.value }))} className="border-2 border-slate-200 rounded-lg p-2 w-36" placeholder="מחיר המשך 99 ₪" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">רשימת יתרונות</label>
            <p className="text-xs text-slate-500 mb-2">שורה אחת לכל יתרון. לדוג׳: 5000 דקות שיחה, גלישה 800GB</p>
            <textarea value={Array.isArray(form.features) ? form.features.join("\n") : (form.features || "")} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))} className="w-full border-2 border-slate-200 rounded-lg p-4 min-h-[120px] text-base leading-relaxed" placeholder={"5000 דקות שיחה\nגלישה: 800GB\n500 דקות לחו״ל"} rows={5} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-1">קטגוריה</label>
              <select value={form.category || "4g"} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3">
                <option value="kosher">קו כשר (שיחות בלבד)</option>
                <option value="4g">דור 4 (סמארטפון רגיל)</option>
                <option value="5g">דור 5 (מהירות גבוהה)</option>
                <option value="internet">אינטרנט ביתי (סיבים)</option>
              </select>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-1">גלישה (GB)</label>
              <p className="text-xs text-slate-500 mb-2">הכנס 0 אם אין גלישה (קו כשר)</p>
              <input type="number" value={form.dataGB ?? ""} onChange={(e) => setForm((f) => ({ ...f, dataGB: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="0" />
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-1">דקות שיחה</label>
              <input value={form.calls || ""} onChange={(e) => setForm((f) => ({ ...f, calls: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="5000 או ללא הגבלה" />
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <label className="block text-sm font-bold text-slate-800 mb-1">הערות / תוספות</label>
              <input value={form.extras || ""} onChange={(e) => setForm((f) => ({ ...f, extras: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder='לדוג׳: כולל שיחות לחו"ל' />
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">לוגו החברה</label>
            <p className="text-xs text-slate-500 mb-2">בחר לוגו מובנה או הדבק קישור לתמונה</p>
            {form.logoUrl && (
              <div className="mb-3 p-3 bg-white rounded-xl border-2 border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-2">תצוגה מקדימה:</p>
                <img src={form.logoUrl} alt="לוגו ספק" className="h-20 w-20 object-contain rounded-lg" onError={(e) => { e.target.style.display = "none"; }} />
              </div>
            )}
            <select className="w-full border-2 border-slate-200 rounded-lg p-3 mb-2" onChange={(e) => { const p = PROVIDER_LOGO_PRESETS.find((x) => x.key === e.target.value); if (p) setForm((f) => ({ ...f, logoUrl: p.path })); }}>
              <option value="">בחר לוגו מובנה מתיקיית logos</option>
              {PROVIDER_LOGO_PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <input value={form.logoUrl || ""} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="או הדבק קישור לתמונה (https://...)" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border-2 border-slate-300 rounded-xl py-3 font-bold hover:bg-slate-50">ביטול</button>
          <button onClick={() => onSave({ ...form, id: pkg?.id, price: Number(form.price) || 0, dataGB: Number(form.dataGB) || 0, order: form.order ?? pkg?.order ?? 0, featured: !!form.featured })} className="flex-1 bg-[#1e3a5f] text-white rounded-xl py-3 font-bold">שמור והוסף לאתר</button>
        </div>
      </div>
    </div>
  );
}

// --- Products Section ---
function ProductsSection({ products, setProducts, onDeleteRequest, showToast }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const db = getDb();

  const sorted = useMemo(() => [...products].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)), [products]);

  const reorderProducts = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    const reordered = [...sorted];
    const [item] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, item);
    const withOrder = reordered.map((p, i) => ({ ...p, order: i }));
    setProducts(withOrder);
    setDraggedIndex(null);
    setDropTargetIndex(null);
    if (db) {
      const batch = db.batch();
      withOrder.forEach((p, i) => {
        if (p.id && !String(p.id).startsWith("prod-")) batch.update(db.collection("products").doc(p.id), { order: i });
      });
      batch.commit().then(() => showToast("הסדר עודכן", "success")).catch(() => showToast("שגיאה בעדכון הסדר", "error"));
    } else showToast("הסדר עודכן", "success");
  };

  const saveProduct = async (prod) => {
    const maxOrder = products.reduce((m, p) => Math.max(m, p.order ?? 0), 0);
    const payload = { name: prod.name, price: prod.price ?? null, description: prod.description || "", tags: prod.tags || [], images: prod.images || [], order: prod.order ?? maxOrder + 1, badge: prod.badge || "", featured: !!prod.featured };
    if (db) {
      try {
        if (prod.id && !String(prod.id).startsWith("prod-")) {
          await db.collection("products").doc(prod.id).update(payload);
          setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...payload, id: p.id } : p)));
        } else {
          const ref = await db.collection("products").add(payload);
          setProducts((prev) => [...prev, { ...payload, id: ref.id }]);
        }
        showToast("נשמר", "success");
      } catch { showToast("שגיאה", "error"); }
    } else {
      setProducts((prev) => [...prev, { ...payload, id: prod.id || `prod-${Date.now()}` }]);
      showToast("נוסף", "success");
    }
  };

  const toggleProductFeatured = async (prod) => {
    const next = !prod.featured;
    if (db && prod.id && !String(prod.id).startsWith("prod-")) {
      try {
        await db.collection("products").doc(prod.id).update({ featured: next });
        setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, featured: next } : p)));
        showToast(next ? "נוסף למבצעים המומלצים" : "הוסר ממבצעים מומלצים", "success");
      } catch { showToast("שגיאה בעדכון", "error"); }
    } else {
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, featured: next } : p)));
      showToast(next ? "נוסף למבצעים" : "הוסר ממבצעים", "success");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <p className="text-slate-600 text-lg font-medium">{products.length} מוצרים</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-bold"><Plus /> הוסף מוצר</button>
      </div>
      <p className="text-slate-500 text-sm">גרור את ⋮⋮ לשינוי סדר התצוגה באתר</p>
      <div className="grid gap-4 sm:gap-5 w-full" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))" }}>
        {sorted.map((p, idx) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData("text/plain", idx); setDraggedIndex(idx); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (draggedIndex !== null) setDropTargetIndex(idx); }}
            onDragLeave={() => setDropTargetIndex(null)}
            onDrop={(e) => { e.preventDefault(); const from = parseInt(e.dataTransfer.getData("text/plain"), 10); reorderProducts(from, idx); }}
            onDragEnd={() => { setDraggedIndex(null); setDropTargetIndex(null); }}
            className={`bg-white rounded-2xl overflow-hidden shadow-md border-2 flex flex-col transition-all select-none ${draggedIndex === idx ? "opacity-50 scale-95" : ""} ${dropTargetIndex === idx && draggedIndex !== idx ? "border-orange-400 ring-2 ring-orange-200" : "border-slate-100 hover:shadow-lg"}`}
          >
            <div className="relative w-full h-48 sm:h-56 md:h-64 shrink-0 bg-slate-100 flex flex-col overflow-hidden">
              <div className="relative flex-1 flex items-center justify-center min-h-0">
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 z-10 flex items-center justify-center w-9 h-9 rounded-lg bg-white/95 hover:bg-white shadow-md border border-slate-200 touch-none"
                  title="גרור לשינוי סדר"
                >
                  <Grip />
                </div>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl text-slate-300">📱</span>
                )}
              </div>
              {p.images && p.images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 py-2 px-1.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex justify-center items-end gap-1">
                  {p.images.slice(0, 5).map((img, i) => (
                    <div key={i} className={`rounded overflow-hidden border shadow-sm flex-shrink-0 transition-all ${i === 0 ? "w-10 h-10 border-white ring-1 ring-white/80" : "w-7 h-7 border-white/70 opacity-95"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {p.images.length > 5 && (
                    <span className="w-7 h-7 rounded bg-white/95 flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-sm">+{p.images.length - 5}</span>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex gap-2 flex-wrap mb-1 items-center">
                {p.featured && <span className="px-2 py-0.5 bg-amber-400 text-amber-900 rounded text-xs font-bold flex items-center gap-1" title="במבצעים המומלצים באתר">✓ במבצע מומלץ</span>}
                {p.badge && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-medium">{p.badge}</span>}
              </div>
              <p className="font-bold text-base text-slate-800">{p.name}</p>
              <p className="text-slate-600 font-medium text-sm">₪{formatPrice(p.price)}</p>
              {p.description && <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">{p.description}</p>}
              {p.tags?.length > 0 && <p className="text-slate-400 text-xs mt-2">{p.tags.join(", ")}</p>}
              <label className="flex items-center gap-2 mt-2 cursor-pointer group" title="סימון/ביטול – יופיע או לא יופיע באזור המבצעים המומלצים בראש האתר">
                <input type="checkbox" checked={!!p.featured} onChange={() => toggleProductFeatured(p)} className="w-4 h-4 rounded border-2 border-amber-400 text-amber-600" onClick={(e) => e.stopPropagation()} />
                <span className="text-sm font-medium text-slate-600 group-hover:text-amber-700">במבצע מומלץ</span>
              </label>
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 text-sm"><Edit2 /> ערוך</button>
                <button onClick={() => onDeleteRequest(p)} className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 text-sm"><Trash2 /> מחק</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showForm && <ProductFormModal key={editing?.id ?? "new"} product={editing} onSave={(data) => { saveProduct(data); setEditing(null); setShowForm(false); }} onClose={() => { setEditing(null); setShowForm(false); }} showToast={showToast} />}
    </div>
  );
}

function ProductFormModal({ product, onSave, onClose, showToast }) {
  const [form, setForm] = useState(product ? { ...product, imagesText: (product.images || []).join("\n"), tagsText: (product.tags || []).join(", "), featured: !!product.featured } : { name: "", price: "", imagesText: "", description: "", tagsText: "", badge: "", featured: false });
  const [newFiles, setNewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiSuggest = async () => {
    const name = (form.name || "").trim();
    if (!name) {
      if (showToast) showToast("הזן קודם את שם המוצר / דגם המכשיר", "error");
      return;
    }
    if (!GEMINI_PROXY_URL) {
      if (showToast) showToast("לא הוגדר GEMINI_PROXY_URL. הוסף את כתובת ביביפ בוט (כמו ב-index.html) ב-admin.html.", "error");
      return;
    }
    setAiLoading(true);
    try {
      const suggested = await suggestProductWithAI(name);
      if (suggested) {
        setForm((f) => ({
          ...f,
          description: suggested.description || f.description,
          badge: suggested.badge || f.badge,
          tagsText: suggested.tagsText || f.tagsText,
          price: (f.price !== "" && f.price != null) ? f.price : (suggested.priceSuggestion != null ? String(suggested.priceSuggestion) : f.price),
        }));
        if (showToast) showToast("המידע הושלם לפי המלצת AI – ערוך אם צריך", "success");
      } else {
        if (showToast) showToast("לא התקבלה תשובה מתאימה מ-AI. נסה שוב או מלא ידנית.", "error");
      }
    } catch (err) {
      const msg = err?.message || "שגיאה בהמלצת AI";
      if (showToast) showToast(msg, "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    const images = form.imagesText ? form.imagesText.split("\n").map((l) => l.trim()).filter(Boolean) : [];
    if (newFiles.length && IMGBB_API_KEY) {
      setUploading(true);
      for (const f of newFiles) { const u = await uploadImageToImgBB(f); if (u) images.push(u); }
      setUploading(false);
    }
    const tags = form.tagsText ? form.tagsText.split(",").map((t) => t.trim()).filter(Boolean) : [];
    onSave({ id: product?.id, name: form.name, price: form.price ? Number(form.price) : null, description: form.description, tags, images, badge: form.badge || "", order: product?.order, featured: !!form.featured });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-[#1e3a5f]">{product ? "עריכת מוצר" : "הוספת מוצר חדש"}</h3>
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">שם המוצר / המכשיר (חובה)</label>
            <p className="text-xs text-slate-500 mb-2">לדוג׳: iPhone 15, Samsung Galaxy S24, תיקון מסך. אחרי הזנת הדגם – לחץ &quot;המלצת AI&quot; למילוי אוטומטי.</p>
            <div className="flex gap-2 flex-wrap">
              <input value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="flex-1 min-w-[200px] border-2 border-slate-200 rounded-lg p-3 text-base" placeholder="שם המוצר" required />
              <button type="button" onClick={handleAiSuggest} disabled={aiLoading || !GEMINI_PROXY_URL} className="shrink-0 px-4 py-3 rounded-lg font-bold border-2 border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" title={GEMINI_PROXY_URL ? "מלא תיאור, תגית ותגיות לפי דגם המוצר (אותו AI של ביביפ)" : "הוסף GEMINI_PROXY_URL ב-admin.html כמו ב-index.html"}>
                {aiLoading ? "ממלא..." : "✨ המלצת AI"}
              </button>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">מחיר (₪)</label>
            <p className="text-xs text-slate-500 mb-2">המחיר לתצוגה. השאר ריק אם אין מחיר קבוע</p>
            <input type="number" value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3 text-base" placeholder="לדוג׳: 4500" dir="ltr" />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">תגית מבצע (אופציונלי)</label>
            <p className="text-xs text-slate-500 mb-2">יופיע על כרטיס המוצר בפינה – לדוג׳: מבצע חם! / חדש בסניפים / הגיע חדש</p>
            <input value={form.badge || ""} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="מבצע חם! / חדש בסניפים" />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer" title="יופיע בראש האתר באזור המבצעים המומלצים">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="w-5 h-5" />
              <span className="font-bold text-amber-800">הצג במבצעים מומלצים</span>
              <span className="text-xs text-slate-500">(למעלה בעמוד הראשי)</span>
            </label>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">תיאור המוצר</label>
            <p className="text-xs text-slate-500 mb-2">טקסט חופשי שמתאר את המוצר. יכול לכלול מפרט טכני</p>
            <textarea value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-4 min-h-[140px] text-base leading-relaxed" placeholder="תיאור המוצר..." rows={6} />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">תמונות המוצר</label>
            <p className="text-xs text-slate-500 mb-2">העלאה ישירה (ImgBB): בחר קבצים. או הדבק קישורים – שורה אחת לכל תמונה. אם אין מפתח ImgBB ב-index.html – השתמש רק בקישורים.</p>
            <input type="file" accept="image/*" multiple className="mb-3 text-sm border-2 border-slate-200 rounded-lg p-2 w-full" onChange={(e) => setNewFiles((prev) => [...prev, ...Array.from(e.target.files || [])])} />
            {(() => {
              const urlImages = (form.imagesText || "").split("\n").map((l) => l.trim()).filter(Boolean);
              const hasPreviews = newFiles.length > 0 || urlImages.length > 0;
              return hasPreviews ? (
                <div className="mb-3 p-3 bg-white rounded-xl border-2 border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-2">תצוגה מקדימה:</p>
                  <div className="flex flex-wrap gap-2">
                    {newFiles.map((file, idx) => (
                      <img key={`f-${idx}`} src={URL.createObjectURL(file)} alt="" className="h-24 w-24 object-cover rounded-lg border border-slate-200" />
                    ))}
                    {urlImages.map((url, idx) => (
                      <img key={`u-${idx}`} src={url} alt="" className="h-24 w-24 object-cover rounded-lg border border-slate-200" onError={(e) => { e.target.style.display = "none"; }} />
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            <textarea value={form.imagesText || ""} onChange={(e) => setForm((f) => ({ ...f, imagesText: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3 min-h-[80px] font-mono text-sm" placeholder="https://...\nhttps://..." dir="ltr" />
            {uploading && <p className="text-sm text-amber-600 mt-2">מעלה תמונות...</p>}
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">תגיות (מופרדות בפסיק)</label>
            <p className="text-xs text-slate-500 mb-2">לדוג׳: כשר, דור 5, זיכרון 128GB, Apple. עוזר לחיפוש ותצוגה</p>
            <input value={form.tagsText || ""} onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3" placeholder="כשר, דור 5, זיכרון 128GB" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border-2 border-slate-300 rounded-xl py-3 font-bold hover:bg-slate-50">ביטול</button>
          <button onClick={handleSave} disabled={uploading} className="flex-1 bg-[#1e3a5f] text-white rounded-xl py-3 font-bold disabled:opacity-50">שמור והוסף לאתר</button>
        </div>
      </div>
    </div>
  );
}

// --- Mount ---
const root = document.getElementById("root");
if (root) {
  if (ReactDOM.createRoot) ReactDOM.createRoot(root).render(<AdminApp />);
  else ReactDOM.render(<AdminApp />, root);
}
