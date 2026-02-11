const { useState } = React;

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

// --- נתוני דמו לשוק (מותאם מהקובץ המקורי, פברואר 2026) ---
const MARKET_DEALS = [
  {
    provider: "Golan Telecom",
    price: 25,
    category: "kosher",
    dataGB: 0,
    calls: "5000 דקות",
    sms: 0,
    extras: "מחיר לכל החיים, כולל סים חינם",
    is5G: false,
    logoUrl: "./logos/golan.png",
  },
  {
    provider: "Cellcom",
    price: 35,
    category: "kosher",
    dataGB: 0,
    calls: "5000 + 500 לחו\"ל",
    sms: 0,
    extras: "קליטה חזקה, שירות VIP",
    is5G: false,
    logoUrl: "./logos/cellcom.png",
  },
  {
    provider: "Hot Mobile",
    price: 26,
    category: "kosher",
    dataGB: 0,
    calls: "5000 דקות",
    sms: 0,
    extras: "כולל 60 דקות לחו\"ל, מחיר לשנה",
    is5G: false,
    logoUrl: "./logos/hot.png",
  },
  {
    provider: "019 Mobile",
    price: 19.9,
    category: "4g",
    dataGB: 12,
    calls: "ללא הגבלה",
    sms: "ללא הגבלה",
    extras: "החבילה הזולה ביותר! מתאים לילדים",
    is5G: false,
    logoUrl: "./logos/019.png",
  },
  {
    provider: "Hot Mobile",
    price: 34.9,
    category: "5g",
    dataGB: 400,
    calls: "ללא הגבלה",
    sms: "ללא הגבלה",
    extras: "חבילת דור 5 משתלמת במיוחד + 3000 דקות",
    is5G: true,
    logoUrl: "./logos/hot.png",
  },
  {
    provider: "Pelephone",
    price: 55,
    category: "5g",
    dataGB: 1000,
    calls: "ללא הגבלה",
    sms: "ללא הגבלה",
    extras: "MAX VIP - תעדוף גלישה בעומס, נפח עצום",
    is5G: true,
    logoUrl: "./logos/pelephone.png",
  },
  {
    provider: "Golan Telecom",
    price: 29.9,
    category: "5g",
    dataGB: 1500,
    calls: "ללא הגבלה",
    sms: "ללא הגבלה",
    extras: "מבצע: מחיר לכל החיים! + 500 דקות לחו\"ל",
    is5G: true,
    logoUrl: "./logos/golan.png",
  },
  {
    provider: "Partner",
    price: 39.9,
    category: "5g",
    dataGB: 500,
    calls: "ללא הגבלה",
    sms: "ללא הגבלה",
    extras: "כולל CyberGuard הגנה ושיחות לחו\"ל",
    is5G: true,
    logoUrl: "./logos/partner.png",
  },
  {
    provider: "Bezeq Fiber",
    price: 119,
    category: "internet",
    dataGB: 2500,
    calls: 0,
    sms: 0,
    extras: "כולל נתב Be, מהירות עד 2.5Gb",
    is5G: false,
    logoUrl: "./logos/bezeq.png",
  },
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
      phone: "02-991-1213",
      hours: "א'-ה': 10:00 - 20:00\nו' וערבי חג: 09:30 - 13:00",
    },
    {
      id: "beitar",
      city: "ביתר עילית",
      address: "מררכז מסחרי כיכר העיר",
      phone: "02-888-8888",
      hours: "א'-ה': 10:30 - 21:00\nו': 09:00 - 13:00",
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
  { key: "bezeq", label: "Bezeq Fiber", path: "./logos/bezeq.png" },
];

// --- קומפוננטת האפליקציה הראשית (ללא Firebase, דמו מקומי מקצועי) ---
function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [packages, setPackages] = useState(() =>
    MARKET_DEALS.map((deal, index) => ({ ...deal, id: `demo-${index}` }))
  );
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [products, setProducts] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState("all");
  const [promoMessage, setPromoMessage] = useState({
    title: "מבצעי השקה!",
    subtitle: "הצטרפו היום וקבלו סים במתנה",
    active: true,
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading] = useState(false);

  // --- Handlers (גירסה מקומית ללא שרת) ---
  const handleLogin = (password) => {
    if (password === "1234") {
      setIsAdmin(true);
      setShowLoginModal(false);
    } else {
      alert("סיסמה שגויה (נסה: 1234)");
    }
  };

  const handleSavePackage = (pkg) => {
    setPackages((prev) => {
      // עדכון חבילה קיימת
      if (pkg.id && prev.some((p) => p.id === pkg.id)) {
        return prev.map((p) => (p.id === pkg.id ? { ...p, ...pkg } : p));
      }
      // הוספת חבילה חדשה
      return [
        ...prev,
        {
          ...pkg,
          id: `local-${Date.now()}-${prev.length}`,
        },
      ];
    });
    setEditingPackage(null);
    setShowAdminModal(false);
  };

  const handleLoadDemoData = () => {
    const withIds = MARKET_DEALS.map((deal, index) => ({
      ...deal,
      id: `demo-${index}`,
    }));
    setPackages(withIds);
    alert("הנתונים נטענו בהצלחה!");
    setShowAdminModal(false);
  };

  const handleDeletePackageConfirmed = () => {
    if (!packageToDelete) return;
    setPackages((prev) => prev.filter((p) => p.id !== packageToDelete.id));
    setPackageToDelete(null);
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
    setPromoMessage((prev) => ({ ...prev, title, subtitle }));
    alert("המבצע עודכן (דמו מקומי, ללא שמירה לשרת).");
  };

  const handleUpdateConfig = (newConfig) => {
    setSiteConfig(newConfig);
    setShowSettingsModal(false);
    alert("הגדרות האתר עודכנו (דמו מקומי בלבד).");
  };

  const handleWhatsAppClick = (pkg) => {
    const text = `שלום B-Phone, אשמח לקבל פרטים ולהצטרף לחבילת ${pkg.provider} ב-${pkg.price}₪ (קטגוריה: ${
      pkg.category === "kosher" ? "כשר" : pkg.category
    }).`;
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

  // --- סינון חבילות ---
  const filteredPackages = packages.filter(
    (pkg) => activeTab === "all" || pkg.category === activeTab
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
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
                onClick={() =>
                  isAdmin ? setIsAdmin(false) : setShowLoginModal(true)
                }
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
                  isAdmin ? setIsAdmin(false) : setShowLoginModal(true);
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
            B-Phone תקשורת
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
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-slate-800">
              חבילות סלולר משתלמות
            </h2>

            {/* Category Tabs - Scrollable on mobile */}
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
                עדיין לא הוזנו חבילות בקטגוריה זו.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 relative group flex flex-col"
                >
                  {/* Top Stripe */}
                  <div
                    className={`h-2 w-full ${
                      pkg.is5G
                        ? "bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600"
                        : "bg-blue-500"
                    }`}
                  ></div>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setEditingPackage(pkg);
                          setShowAdminModal(true);
                        }}
                        className="absolute top-4 left-4 p-2 bg-blue-100 text-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition z-10 ml-9"
                        title="עריכת חבילה"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setPackageToDelete(pkg)}
                        className="absolute top-4 left-4 p-2 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                        title="מחיקת חבילה"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}

                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          pkg.category === "kosher"
                            ? "bg-green-100 text-green-800"
                            : pkg.category === "5g"
                            ? "bg-purple-100 text-purple-800"
                            : pkg.category === "internet"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {pkg.category === "kosher"
                          ? "כשר"
                          : pkg.category === "internet"
                          ? "סיבים אופטיים"
                          : pkg.category === "5g"
                          ? "Hyper Speed"
                          : "סמארטפון"}
                      </span>
                      {pkg.is5G && (
                        <span className="flex items-center gap-1 text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          <Zap size={14} /> 5G
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <ProviderLogo provider={pkg.provider} url={pkg.logoUrl} />
                      <h3 className="text-xl font-bold text-slate-900">
                        {pkg.provider}
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-extrabold text-blue-600">
                        ₪{pkg.price}
                      </span>
                      <span className="text-gray-500 text-sm">/חודש</span>
                    </div>

                    <ul className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
                      <FeatureRow
                        label="נפח גלישה"
                        value={
                          pkg.dataGB ? `${pkg.dataGB} GB` : "ללא גלישה"
                        }
                      />
                      <FeatureRow
                        label="דקות שיחה"
                        value={
                          pkg.calls && pkg.calls !== "unlimited"
                            ? pkg.calls
                            : "ללא הגבלה"
                        }
                      />
                      <FeatureRow
                        label="הודעות"
                        value={
                          pkg.sms === "unlimited"
                            ? "ללא הגבלה"
                            : pkg.sms
                            ? `${pkg.sms} הודעות`
                            : "חסום"
                        }
                      />
                      {pkg.extras && (
                        <li className="text-sm text-gray-600 pt-2 border-t border-gray-200 mt-2">
                          {pkg.extras}
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <button
                      onClick={() => handleWhatsAppClick(pkg)}
                      className="w-full py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      פרטים והצטרפות
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              B-Phone תקשורת
            </h3>
            <p className="mb-4">
              הבית של הסלולר הכשר והחכם בבית שמש וביתר. שירות אמין, מחירים הוגנים,
              מעבדה לתיקון מכשירים ומחשבים במקום והתקנת כל סוגי הסינון הכשר.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">ניווט מהיר</h4>
            <ul className="space-y-2">
              <li>
                <a href="#packages" className="hover:text-white">
                  חבילות סלולר
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-white">
                  מוצרים ומכשירים
                </a>
              </li>
              <li>
                <a href="#locations" className="hover:text-white">
                  צור קשר
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">מידע נוסף</h4>
            <p>
              מצאת טעות במחיר?{" "}
              <a href="#packages" className="underline">
                דווח לנו
              </a>
            </p>
            <p className="mt-2">
              © כל הזכויות שמורות לבי-פון תקשורת 2026
            </p>
          </div>
        </div>
      </footer>

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

function LoginModal({ onClose, onLogin }) {
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
        <p className="text-sm text-gray-500 mb-4">
          לצורכי הדגמה הסיסמה היא: 1234
        </p>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="סיסמה"
          autoFocus
        />
        <button
          onClick={() => onLogin(pass)}
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
        className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">הגדרות אתר</h3>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
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
  const [formData, setFormData] = useState(
    initialData || {
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
    }
  );

  const isEdit = Boolean(initialData && initialData.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      dataGB: Number(formData.dataGB),
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

