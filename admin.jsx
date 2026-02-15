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
const IMGBB_API_KEY = typeof window !== "undefined" && window.IMGBB_API_KEY ? window.IMGBB_API_KEY : "";
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

const DEFAULT_CONFIG = {
  mainPhone: "0527151000",
  whatsapp: "0527151000",
  logoUrl: "./logos/logo-bphone.png",
  botLogoUrl: "",
  heroBanners: [],
  heroDefaultBannerIndex: -1,
  heroBannerDurationSeconds: 5,
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
function LoginScreen({ onLogin, onLoginGoogle, showToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const useFirebase = Boolean(auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === "bp0527151000@gmail.com" && password === "123456") {
      onLogin();
      return;
    }
    if (!useFirebase) {
      if (password === "1234") onLogin();
      else if (showToast) showToast("סיסמה שגויה", "error");
      return;
    }
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email.trim(), password);
      onLogin();
    } catch (err) {
      setLoading(false);
      if (showToast) showToast(err.code === "auth/invalid-credential" ? "אימייל או סיסמה שגויים" : "התחברות נכשלה", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2a4a6f] to-[#1e3a5f] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">פאנל ניהול B-Phone</h1>
          <p className="text-slate-500 mt-1">התחבר כדי להמשיך</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg p-3" placeholder="admin@example.com" required autoFocus={!useFirebase} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg p-3" placeholder="••••••" required />
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
  const [activeSection, setActiveSection] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [promoMessage, setPromoMessage] = useState({ title: "מבצעי השקה!", subtitle: "הצטרפו היום", active: true });
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

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
    const unsub = auth.onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) { setLoggedIn(false); return; }
      if (!isAllowedAdmin(user.email)) { auth.signOut(); setLoggedIn(false); return; }
      setLoggedIn(true);
    });
    return unsub;
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
        setSiteConfig((prev) => ({ ...DEFAULT_CONFIG, ...cfg, locations: cfg.locations || prev.locations, services: cfg.services || prev.services }));
        if (cfg.promoMessage) setPromoMessage((p) => ({ ...p, ...cfg.promoMessage }));
      }
      if (pkgs?.length) setPackages(pkgs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)).map((p, i) => ({ ...p, order: p.order ?? i })));
      if (prods?.length) setProducts(prods.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)));
    }).catch(console.warn);
  }, [loggedIn]);

  const handleLogin = () => {
    setLoggedIn(true);
    showToast("התחברת בהצלחה", "success");
  };
  const handleLoginGoogle = () => {
    const auth = getAuth();
    if (!auth || !window.firebase?.auth?.GoogleAuthProvider) return;
    auth.signInWithPopup(new window.firebase.auth.GoogleAuthProvider())
      .then((cred) => {
        if (!cred?.user || !isAllowedAdmin(cred.user.email)) { auth.signOut(); return; }
        setLoggedIn(true);
        showToast("התחברת בהצלחה", "success");
      })
      .catch((e) => { if (e.code !== "auth/popup-closed-by-user") showToast("התחברות נכשלה", "error"); });
  };
  const handleLogout = () => {
    const auth = getAuth();
    if (auth) auth.signOut();
    setLoggedIn(false);
    showToast("התנתקת", "info");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-pulse text-slate-500">טוען...</div></div>;
  if (!loggedIn) return <LoginScreen onLogin={handleLogin} onLoginGoogle={handleLoginGoogle} showToast={showToast} />;

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-10 shadow-lg border-2 border-slate-100">
                <p className="text-slate-500 text-lg font-medium mb-2">חבילות</p>
                <p className="text-5xl font-bold text-[#1e3a5f]">{packages.length}</p>
              </div>
              <div className="bg-white rounded-3xl p-10 shadow-lg border-2 border-slate-100">
                <p className="text-slate-500 text-lg font-medium mb-2">מוצרים</p>
                <p className="text-5xl font-bold text-[#1e3a5f]">{products.length}</p>
              </div>
              <div className="bg-white rounded-3xl p-10 shadow-lg border-2 border-slate-100">
                <p className="text-slate-500 text-lg font-medium mb-2">סניפים</p>
                <p className="text-5xl font-bold text-[#1e3a5f]">{siteConfig.locations?.length || 0}</p>
              </div>
              <div className="col-span-full bg-white rounded-3xl p-10 shadow-lg border-2 border-slate-100">
                <h3 className="font-bold text-2xl text-slate-800 mb-4">ברוך הבא לפאנל הניהול</h3>
                <p className="text-slate-600 text-lg">בחר אחד מהפריטים בתפריט בצד כדי לערוך את האתר. הגדרות אתר, חבילות, מוצרים ומבצע ראשי – כל השינויים נשמרים ב-Firebase.</p>
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
            <PromoSection promo={promoMessage} setPromo={setPromoMessage} showToast={showToast} />
          )}
        </div>
      </main>

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
function PromoSection({ promo, setPromo, showToast }) {
  const [form, setForm] = useState(promo);
  useEffect(() => setForm(promo), [promo]);
  const db = getDb();
  const save = () => {
    if (db) {
      db.doc("config/site").set({ promoMessage: form }, { merge: true })
        .then(() => { setPromo(form); showToast("נשמר", "success"); })
        .catch((e) => { showToast("שגיאה בשמירה", "error"); });
    } else { setPromo(form); showToast("נשמר", "success"); }
  };
  return (
    <div className="bg-white rounded-3xl p-10 shadow-lg max-w-3xl border-2 border-slate-100">
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
  );
}

// --- Settings Section (גדול, ברור, עם הסברים) ---
function SettingsSection({ config, onSave, showToast }) {
  const [form, setForm] = useState(config);
  useEffect(() => setForm(config), [config]);
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
                    <span className="font-bold text-xl text-slate-800 leading-tight">{p.providerName || p.provider}</span>
                    {p.badge && <span className="inline-block w-fit px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">{p.badge}</span>}
                    <span className="text-slate-600 font-semibold text-lg">₪{formatPrice(p.price)}/חודש</span>
                    {p.priceDetail && <span className="text-slate-500 text-sm">{p.priceDetail}</span>}
                  </div>
                </div>
              </div>
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
  const [form, setForm] = useState(pkg || { provider: "", providerName: "", price: "", priceDetail: "", category: "4g", dataGB: 0, calls: "ללא הגבלה", features: [], logoUrl: "", isHot: false, badge: "", afterPrice: "", extras: "", is5G: false, order: 0 });
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
          <button onClick={() => onSave({ ...form, id: pkg?.id, price: Number(form.price) || 0, dataGB: Number(form.dataGB) || 0, order: form.order ?? pkg?.order ?? 0 })} className="flex-1 bg-[#1e3a5f] text-white rounded-xl py-3 font-bold">שמור והוסף לאתר</button>
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
    const payload = { name: prod.name, price: prod.price ?? null, description: prod.description || "", tags: prod.tags || [], images: prod.images || [], order: prod.order ?? maxOrder + 1, badge: prod.badge || "" };
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
              <div className="flex gap-2 flex-wrap mb-1">
                {p.badge && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-medium">{p.badge}</span>}
              </div>
              <p className="font-bold text-base text-slate-800">{p.name}</p>
              <p className="text-slate-600 font-medium text-sm">₪{formatPrice(p.price)}</p>
              {p.description && <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">{p.description}</p>}
              {p.tags?.length > 0 && <p className="text-slate-400 text-xs mt-2">{p.tags.join(", ")}</p>}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 text-sm"><Edit2 /> ערוך</button>
                <button onClick={() => onDeleteRequest(p)} className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 text-sm"><Trash2 /> מחק</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showForm && <ProductFormModal key={editing?.id ?? "new"} product={editing} onSave={(data) => { saveProduct(data); setEditing(null); setShowForm(false); }} onClose={() => { setEditing(null); setShowForm(false); }} />}
    </div>
  );
}

function ProductFormModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product ? { ...product, imagesText: (product.images || []).join("\n"), tagsText: (product.tags || []).join(", ") } : { name: "", price: "", imagesText: "", description: "", tagsText: "", badge: "" });
  const [newFiles, setNewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    const images = form.imagesText ? form.imagesText.split("\n").map((l) => l.trim()).filter(Boolean) : [];
    if (newFiles.length && IMGBB_API_KEY) {
      setUploading(true);
      for (const f of newFiles) { const u = await uploadImageToImgBB(f); if (u) images.push(u); }
      setUploading(false);
    }
    const tags = form.tagsText ? form.tagsText.split(",").map((t) => t.trim()).filter(Boolean) : [];
    onSave({ id: product?.id, name: form.name, price: form.price ? Number(form.price) : null, description: form.description, tags, images, badge: form.badge || "", order: product?.order });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-[#1e3a5f]">{product ? "עריכת מוצר" : "הוספת מוצר חדש"}</h3>
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-1">שם המוצר / המכשיר (חובה)</label>
            <p className="text-xs text-slate-500 mb-2">לדוג׳: iPhone 15, Samsung Galaxy S24, תיקון מסך</p>
            <input value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border-2 border-slate-200 rounded-lg p-3 text-base" placeholder="שם המוצר" required />
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
