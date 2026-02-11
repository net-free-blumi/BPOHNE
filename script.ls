import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  setDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  Phone, 
  Smartphone, 
  Wifi, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit2, 
  Menu, 
  X, 
  Lock,
  LogOut,
  Zap,
  Signal,
  RefreshCw,
  Settings,
  MessageCircle,
  Image as ImageIcon
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Market Data for Demo Loading (Updated Feb 2026) ---
const MARKET_DEALS = [
  { 
    provider: 'Golan Telecom', 
    price: 25, 
    category: 'kosher', 
    dataGB: 0, 
    calls: '5000 דקות', 
    sms: 0, 
    extras: 'מחיר לכל החיים, כולל סים חינם', 
    is5G: false,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Golan_Telecom_Logo.svg/200px-Golan_Telecom_Logo.svg.png'
  },
  { 
    provider: 'Cellcom', 
    price: 35, 
    category: 'kosher', 
    dataGB: 0, 
    calls: '5000 + 500 לחו"ל', 
    sms: 0, 
    extras: 'קליטה חזקה, שירות VIP', 
    is5G: false,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Cellcom_purple_logo_2017.svg/200px-Cellcom_purple_logo_2017.svg.png'
  },
  { 
    provider: 'Hot Mobile', 
    price: 26, 
    category: 'kosher', 
    dataGB: 0, 
    calls: '5000 דקות', 
    sms: 0, 
    extras: 'כולל 60 דקות לחו"ל, מחיר לשנה', 
    is5G: false,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Hot_Mobile_logo.svg/200px-Hot_Mobile_logo.svg.png'
  },
  { 
    provider: '019 Mobile', 
    price: 19.9, 
    category: '4g', 
    dataGB: 12, 
    calls: 'ללא הגבלה', 
    sms: 'ללא הגבלה', 
    extras: 'החבילה הזולה ביותר! מתאים לילדים', 
    is5G: false,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/019_Mobile_logo.svg/200px-019_Mobile_logo.svg.png'
  },
  { 
    provider: 'Hot Mobile', 
    price: 34.9, 
    category: '5g', 
    dataGB: 400, 
    calls: 'ללא הגבלה', 
    sms: 'ללא הגבלה', 
    extras: 'חבילת דור 5 משתלמת במיוחד + 3000 דקות', 
    is5G: true,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Hot_Mobile_logo.svg/200px-Hot_Mobile_logo.svg.png'
  },
  { 
    provider: 'Pelephone', 
    price: 55, 
    category: '5g', 
    dataGB: 1000, 
    calls: 'ללא הגבלה', 
    sms: 'ללא הגבלה', 
    extras: 'MAX VIP - תעדוף גלישה בעומס, נפח עצום', 
    is5G: true,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Pelephone_logo_2018.svg/200px-Pelephone_logo_2018.svg.png'
  },
  { 
    provider: 'Golan Telecom', 
    price: 29.9, 
    category: '5g', 
    dataGB: 1500, 
    calls: 'ללא הגבלה', 
    sms: 'ללא הגבלה', 
    extras: 'מבצע: מחיר לכל החיים! + 500 דקות לחו"ל', 
    is5G: true,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Golan_Telecom_Logo.svg/200px-Golan_Telecom_Logo.svg.png'
  },
  { 
    provider: 'Partner', 
    price: 39.9, 
    category: '5g', 
    dataGB: 500, 
    calls: 'ללא הגבלה', 
    sms: 'ללא הגבלה', 
    extras: 'כולל CyberGuard הגנה ושיחות לחו"ל', 
    is5G: true,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Partner_logo.svg/200px-Partner_logo.svg.png'
  },
  { 
    provider: 'Bezeq Fiber', 
    price: 119, 
    category: 'internet', 
    dataGB: 2500, 
    calls: 0, 
    sms: 0, 
    extras: 'כולל נתב Be, מהירות עד 2.5Gb', 
    is5G: false,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/he/thumb/3/39/Bezeq_Logo_2008.svg/200px-Bezeq_Logo_2008.svg.png'
  },
];

const DEFAULT_CONFIG = {
  mainPhone: '0527151000',
  whatsapp: '0527151000',
  logoUrl: '',
  heroImageUrl: '', // New: Hero background image
  locations: [
    {
      id: 'bs',
      city: 'בית שמש',
      address: 'רחוב יצחק רבין 17, בית שמש',
      phone: '02-991-1213',
      hours: 'א\'-ה\': 10:00 - 20:00\nו\' וערבי חג: 09:30 - 13:00'
    },
    {
      id: 'beitar',
      city: 'ביתר עילית',
      address: 'מרכז מסחרי כיכר העיר',
      phone: '02-888-8888',
      hours: 'א\'-ה\': 10:30 - 21:00\nו\': 09:00 - 13:00'
    }
  ],
  services: [ // New: Editable services
    { title: "מכשירי סלולר", desc: "מכשירים כשרים וסמארטפונים מתקדמים", iconUrl: "" },
    { title: "אביזרים ומיגון", desc: "מגני ספר, מסכים, ומטענים מקוריים", iconUrl: "" },
    { title: "אינטרנט ביתי", desc: "סיבים אופטיים ותשתית יציבה", iconUrl: "" },
    { title: "מעבדה מקצועית", desc: "תיקונים במקום לכל סוגי המכשירים", iconUrl: "" }
  ]
};

const DEFAULT_SERVICE_ICONS = [Smartphone, ShieldCheck, Wifi, Zap];

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [packages, setPackages] = useState([]);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState('all'); 
  const [promoMessage, setPromoMessage] = useState({ title: 'מבצעי השקה!', subtitle: 'הצטרפו היום וקבלו סים במתנה', active: true });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Auth & Data Loading ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
         await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch Data
  useEffect(() => {
    if (!user) return;

    // Packages
    const packagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'packages');
    const qPackages = query(packagesRef);
    
    const unsubPackages = onSnapshot(qPackages, (snapshot) => {
      const pkgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      pkgs.sort((a, b) => a.price - b.price); 
      setPackages(pkgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching packages:", error);
      setLoading(false);
    });

    // Promo
    const promoRef = collection(db, 'artifacts', appId, 'public', 'data', 'promotions');
    const unsubPromos = onSnapshot(promoRef, (snapshot) => {
      if (!snapshot.empty) {
        const promoData = snapshot.docs[0].data();
        setPromoMessage({ ...promoData, id: snapshot.docs[0].id });
      }
    }, (error) => console.error(error));

    // Site Config
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'main');
    const unsubConfig = onSnapshot(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Merge with DEFAULT_CONFIG to ensure new fields (like services) exist if missing in DB
        setSiteConfig(prevConfig => ({
          ...DEFAULT_CONFIG,
          ...data,
          // Ensure nested objects/arrays are also merged correctly if they exist in data
          locations: data.locations || DEFAULT_CONFIG.locations,
          services: data.services || DEFAULT_CONFIG.services
        }));
      }
    });

    return () => {
      unsubPackages();
      unsubPromos();
      unsubConfig();
    };
  }, [user]);

  // --- Handlers ---

  const handleLogin = (password) => {
    if (password === '1234') {
      setIsAdmin(true);
      setShowLoginModal(false);
    } else {
      alert('סיסמה שגויה (נסה: 1234)');
    }
  };

  const handleAddPackage = async (newPackage) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'packages'), {
        ...newPackage,
        createdAt: new Date().toISOString()
      });
      setShowAdminModal(false);
    } catch (e) {
      console.error("Error adding package", e);
      alert("שגיאה בהוספת חבילה");
    }
  };

  const handleLoadDemoData = async () => {
    if (!confirm('פעולה זו תמחק חבילות קיימות ותטען מחירי שוק (פברואר 2026). להמשיך?')) return;
    try {
      const batchPromises = MARKET_DEALS.map(deal => 
        addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'packages'), {
          ...deal,
          createdAt: new Date().toISOString()
        })
      );
      await Promise.all(batchPromises);
      alert('הנתונים נטענו בהצלחה!');
      setShowAdminModal(false);
    } catch (e) {
      console.error("Error loading demo data", e);
      alert('שגיאה בטעינת נתונים');
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm('האם למחוק את החבילה?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'packages', id));
    } catch (e) {
      console.error("Error deleting", e);
    }
  };

  const handleUpdatePromo = async (title, subtitle) => {
    try {
      const promoRef = collection(db, 'artifacts', appId, 'public', 'data', 'promotions');
      if (promoMessage.id) {
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promotions', promoMessage.id), { title, subtitle });
      } else {
         await addDoc(promoRef, { title, subtitle });
      }
      alert('המבצע עודכן בהצלחה!');
    } catch (e) {
      console.error("Error updating promo", e);
    }
  };

  const handleUpdateConfig = async (newConfig) => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'main'), newConfig);
      setShowSettingsModal(false);
      alert('הגדרות האתר עודכנו!');
    } catch(e) {
      console.error("Error updating config", e);
      alert("שגיאה בשמירת הגדרות");
    }
  };

  const handleWhatsAppClick = (pkg) => {
    const text = `שלום B-Phone, אשמח לקבל פרטים ולהצטרף לחבילת ${pkg.provider} ב-${pkg.price}₪ (קטגוריה: ${pkg.category === 'kosher' ? 'כשר' : pkg.category}).`;
    const url = `https://wa.me/972${siteConfig.whatsapp.substring(1)}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // --- Filter Logic ---
  const filteredPackages = packages.filter(pkg => {
    if (activeTab === 'all') return true;
    return pkg.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
      
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              {siteConfig.logoUrl ? (
                <div className="flex-shrink-0 flex items-center">
                  <img src={siteConfig.logoUrl} alt="B-Phone Logo" className="h-12 w-auto object-contain" />
                </div>
              ) : (
                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-blue-900 leading-none">Bפון</h1>
                    <span className="text-xs text-gray-500">תקשורת סלולרית</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 space-x-reverse">
              <a href="#promos" className="text-gray-700 hover:text-blue-600 font-medium transition">מבצעים</a>
              <a href="#packages" className="text-gray-700 hover:text-blue-600 font-medium transition">חבילות</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition">שירותים</a>
              <a href="#locations" className="text-gray-700 hover:text-blue-600 font-medium transition">סניפים</a>
              
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
                onClick={() => isAdmin ? setIsAdmin(false) : setShowLoginModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${isAdmin ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {isAdmin ? <><LogOut size={16}/> יציאה</> : <><Lock size={16}/> ניהול</>}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 p-2">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 pb-4">
            <div className="flex flex-col space-y-2 px-4 pt-2">
              <a href="#promos" className="py-2 border-b border-gray-50" onClick={() => setMobileMenuOpen(false)}>מבצעים</a>
              <a href="#packages" className="py-2 border-b border-gray-50" onClick={() => setMobileMenuOpen(false)}>חבילות</a>
              <a href="#locations" className="py-2 border-b border-gray-50" onClick={() => setMobileMenuOpen(false)}>סניפים</a>
              {isAdmin && (
                 <button onClick={() => {setShowSettingsModal(true); setMobileMenuOpen(false);}} className="py-2 text-right border-b border-gray-50">הגדרות אתר</button>
              )}
              <button 
                onClick={() => {
                  isAdmin ? setIsAdmin(false) : setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                className="mt-2 text-blue-600 font-bold text-right"
              >
                {isAdmin ? 'יציאה' : 'כניסת מנהל'}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero / Promo Section */}
      <div 
        id="promos" 
        className="relative bg-blue-700 text-white overflow-hidden transition-all duration-500"
        style={siteConfig.heroImageUrl ? { 
          backgroundImage: `url(${siteConfig.heroImageUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        } : {}}
      >
        {/* Overlay for readability if image is present */}
        {siteConfig.heroImageUrl && <div className="absolute inset-0 bg-black/50 z-0"></div>}
        
        {/* Default pattern if no image */}
        {!siteConfig.heroImageUrl && <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>}
        
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10 text-center">
          {isAdmin ? (
             <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20 max-w-lg mx-auto mb-6">
               <h3 className="text-sm font-bold mb-2 opacity-80 flex items-center justify-center gap-2"><Edit2 size={14}/> עריכת כותרת ראשית</h3>
               <input 
                 defaultValue={promoMessage.title} 
                 id="promoTitleInput"
                 className="block w-full mb-2 px-3 py-2 rounded text-slate-900" 
                 placeholder="כותרת מבצע"
               />
               <input 
                 defaultValue={promoMessage.subtitle} 
                 id="promoSubInput"
                 className="block w-full mb-2 px-3 py-2 rounded text-slate-900" 
                 placeholder="תת כותרת"
               />
               <button 
                 onClick={() => handleUpdatePromo(document.getElementById('promoTitleInput').value, document.getElementById('promoSubInput').value)}
                 className="bg-green-500 hover:bg-green-600 text-white w-full py-2 rounded font-bold"
               >
                 שמור שינויים
               </button>
             </div>
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
             <a href="#locations" className="px-8 py-3 rounded-lg bg-white text-blue-700 font-bold hover:bg-blue-50 transition shadow-lg">
               מצא סניף קרוב
             </a>
             <a href="#packages" className="px-8 py-3 rounded-lg bg-transparent border-2 border-white text-white font-bold hover:bg-white/10 transition backdrop-blur-sm">
               לכל החבילות
             </a>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <section id="services" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">כל מה שצריך במקום אחד</h2>
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

      {/* Packages Section */}
      <section id="packages" className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-slate-800">חבילות סלולר משתלמות</h2>
            
            {/* Category Tabs - Scrollable on mobile */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
               <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 min-w-max">
                <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="הכל" />
                <TabButton active={activeTab === 'kosher'} onClick={() => setActiveTab('kosher')} label="כשר" icon={<ShieldCheck size={16}/>} />
                <TabButton active={activeTab === '4g'} onClick={() => setActiveTab('4g')} label="דור 4" icon={<Signal size={16}/>} />
                <TabButton active={activeTab === '5g'} onClick={() => setActiveTab('5g')} label="דור 5" icon={<Zap size={16}/>} />
                <TabButton active={activeTab === 'internet'} onClick={() => setActiveTab('internet')} label="אינטרנט ביתי" icon={<Wifi size={16}/>} />
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
            <div className="text-center py-12 text-gray-500">טוען חבילות...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">עדיין לא הוזנו חבילות בקטגוריה זו.</p>
              {isAdmin && <p className="text-blue-500 cursor-pointer mt-2" onClick={() => setShowAdminModal(true)}>לחץ כאן להוספת חבילה ראשונה</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 relative group flex flex-col">
                  {/* Top Stripe */}
                  <div className={`h-2 w-full ${pkg.is5G ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600' : 'bg-blue-500'}`}></div>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="absolute top-4 left-4 p-2 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        pkg.category === 'kosher' ? 'bg-green-100 text-green-800' : 
                        pkg.category === '5g' ? 'bg-purple-100 text-purple-800' :
                        pkg.category === 'internet' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {pkg.category === 'kosher' ? 'כשר ומפוקח' : 
                         pkg.category === 'internet' ? 'סיבים אופטיים' : 
                         pkg.category === '5g' ? 'Hyper Speed' : 'סמארטפון'}
                      </span>
                      {pkg.is5G && <span className="flex items-center gap-1 text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"><Zap size={14}/> 5G</span>}
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <ProviderLogo provider={pkg.provider} url={pkg.logoUrl} />
                      <h3 className="text-xl font-bold text-slate-900">{pkg.provider}</h3>
                    </div>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-extrabold text-blue-600">₪{pkg.price}</span>
                      <span className="text-gray-500 text-sm">/חודש</span>
                    </div>

                    <ul className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
                      <FeatureRow label="נפח גלישה" value={pkg.dataGB ? `${pkg.dataGB} GB` : 'ללא גלישה'} />
                      <FeatureRow label="דקות שיחה" value={pkg.calls && pkg.calls !== 'unlimited' ? pkg.calls : 'ללא הגבלה'} />
                      <FeatureRow label="הודעות" value={pkg.sms === 'unlimited' ? 'ללא הגבלה' : pkg.sms ? `${pkg.sms} הודעות` : 'חסום'} />
                      {pkg.extras && <li className="text-sm text-gray-600 pt-2 border-t border-gray-200 mt-2">{pkg.extras}</li>}
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
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">הסניפים שלנו</h2>
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
            <h3 className="text-white font-bold text-lg mb-4">B-Phone תקשורת</h3>
            <p className="mb-4">הבית של הסלולר הכשר והחכם בבית שמש וביתר. שירות אמין, מחירים הוגנים ומעבדה מקצועית.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">ניווט מהיר</h4>
            <ul className="space-y-2">
              <li><a href="#packages" className="hover:text-white">חבילות סלולר</a></li>
              <li><a href="#services" className="hover:text-white">מכשירים ואביזרים</a></li>
              <li><a href="#locations" className="hover:text-white">צור קשר</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">מידע נוסף</h4>
            <p>מצאת טעות במחיר? <a href="#" className="underline">דווח לנו</a></p>
            <p className="mt-2">© כל הזכויות שמורות לבי-פון תקשורת 2026</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAdminModal && (
        <AdminModal 
          onClose={() => setShowAdminModal(false)} 
          onSubmit={handleAddPackage} 
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
    </div>
  );
}

// --- Sub Components ---

function ProviderLogo({ provider, url }) {
  // If we have a URL, display image, else fallback to initials
  if (url) {
    return (
      <img src={url} alt={provider} className="w-8 h-8 object-contain bg-white rounded-full shadow-sm border border-gray-100" />
    );
  }

  // Fallback
  let colorClass = 'bg-gray-500';
  let initial = provider && typeof provider === 'string' ? provider.charAt(0) : '?';
  
  const pLower = provider && typeof provider === 'string' ? provider.toLowerCase() : '';
  
  if (pLower.includes('cellcom')) { colorClass = 'bg-purple-600'; initial = 'C'; }
  else if (pLower.includes('partner')) { colorClass = 'bg-cyan-500'; initial = 'P'; }
  else if (pLower.includes('pelephone')) { colorClass = 'bg-blue-600'; initial = 'Pe'; }
  else if (pLower.includes('hot')) { colorClass = 'bg-red-600'; initial = 'H'; }
  else if (pLower.includes('019')) { colorClass = 'bg-orange-500'; initial = '019'; }
  else if (pLower.includes('golan')) { colorClass = 'bg-lime-500'; initial = 'G'; }
  else if (pLower.includes('bezeq')) { colorClass = 'bg-blue-500'; initial = 'B'; }

  return (
    <div className={`${colorClass} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
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
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
          <a href={`tel:${phone}`} className="font-bold text-xl text-blue-600 hover:underline">{phone}</a>
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
  const [pass, setPass] = useState('');
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">כניסת מנהל מערכת</h3>
          <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600"/></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">לצורכי הדגמה הסיסמה היא: 1234</p>
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
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">הגדרות אתר</h3>
          <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600"/></button>
        </div>

        <div className="space-y-6">
           <h4 className="font-bold text-lg text-blue-800 border-b pb-2">עיצוב כללי</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold mb-1">לוגו האתר (קישור)</label>
               <input 
                type="text" 
                value={formData.logoUrl || ''} 
                onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                placeholder="https://..."
                className="w-full border rounded-lg p-2"
               />
             </div>
             <div>
               <label className="block text-sm font-bold mb-1">תמונת נושא (רקע עליון)</label>
               <input 
                type="text" 
                value={formData.heroImageUrl || ''} 
                onChange={e => setFormData({...formData, heroImageUrl: e.target.value})}
                placeholder="https://..."
                className="w-full border rounded-lg p-2"
               />
             </div>
           </div>

           <div className="mt-4">
             <label className="block text-sm font-bold mb-1">מספר וואטסאפ ללידים</label>
             <input 
              type="text" 
              value={formData.whatsapp} 
              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              className="w-full border rounded-lg p-2"
             />
           </div>
           
           <h4 className="font-bold text-lg text-blue-800 border-b pb-2 mt-8">סניפים</h4>
           {formData.locations.map((loc, idx) => (
             <div key={idx} className="bg-gray-50 p-4 rounded-lg space-y-3">
               <h5 className="font-bold text-blue-600">סניף {loc.city}</h5>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">כתובת</label>
                   <input type="text" className="w-full border rounded p-2 text-sm" value={loc.address} 
                    onChange={e => handleLocationChange(idx, 'address', e.target.value)} />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">טלפון</label>
                   <input type="text" className="w-full border rounded p-2 text-sm" value={loc.phone} 
                    onChange={e => handleLocationChange(idx, 'phone', e.target.value)} />
                 </div>
                 <div className="col-span-full">
                   <label className="block text-xs font-medium text-gray-500 mb-1">שעות פתיחה</label>
                   <textarea 
                      className="w-full border rounded p-2 text-sm min-h-[60px]" 
                      value={loc.hours} 
                      onChange={e => handleLocationChange(idx, 'hours', e.target.value)} 
                   />
                 </div>
               </div>
             </div>
           ))}

          <h4 className="font-bold text-lg text-blue-800 border-b pb-2 mt-8">שירותים (סמלים וטקסט)</h4>
          <div className="grid gap-4">
             {formData.services.map((service, idx) => (
               <div key={idx} className="bg-gray-50 p-3 rounded flex flex-col md:flex-row gap-3 items-start md:items-center">
                  <div className="flex-shrink-0 bg-white p-2 rounded border">
                    {service.iconUrl ? <img src={service.iconUrl} className="w-6 h-6 object-contain"/> : <ImageIcon size={24} className="text-gray-400"/>}
                  </div>
                  <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input className="border rounded p-1 text-sm" placeholder="כותרת" value={service.title} onChange={e => handleServiceChange(idx, 'title', e.target.value)} />
                    <input className="border rounded p-1 text-sm" placeholder="תיאור" value={service.desc} onChange={e => handleServiceChange(idx, 'desc', e.target.value)} />
                    <input className="border rounded p-1 text-sm" placeholder="קישור לאייקון (אופציונלי)" value={service.iconUrl || ''} onChange={e => handleServiceChange(idx, 'iconUrl', e.target.value)} />
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

function AdminModal({ onClose, onSubmit, onLoadDemo }) {
  const [formData, setFormData] = useState({
    provider: '',
    price: '',
    category: 'kosher',
    dataGB: 0,
    calls: 'ללא הגבלה',
    sms: 'unlimited',
    is5G: false,
    extras: '',
    logoUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      dataGB: Number(formData.dataGB)
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">הוספת חבילה חדשה</h3>
          <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">חברה/ספק</label>
              <input required type="text" className="w-full border rounded-lg p-2" placeholder="לדוג' פרטנר, סלקום" 
                value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר לחודש (₪)</label>
              <input required type="number" className="w-full border rounded-lg p-2" placeholder="35" 
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קישור ללוגו (אופציונלי)</label>
            <input type="text" className="w-full border rounded-lg p-2" placeholder="https://..." 
              value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select className="w-full border rounded-lg p-2" 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="kosher">קו כשר (שיחות בלבד)</option>
              <option value="4g">דור 4 (סמארטפון רגיל)</option>
              <option value="5g">דור 5 (מהירות גבוהה)</option>
              <option value="internet">אינטרנט ביתי (סיבים)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גלישה (GB)</label>
              <input type="number" className="w-full border rounded-lg p-2" placeholder="0 אם אין" 
                value={formData.dataGB} onChange={e => setFormData({...formData, dataGB: e.target.value})} />
            </div>
             <div className="flex items-center mt-6">
              <input type="checkbox" id="5g" className="w-5 h-5 text-blue-600 rounded" 
                checked={formData.is5G} onChange={e => setFormData({...formData, is5G: e.target.checked})} />
              <label htmlFor="5g" className="mr-2 text-sm font-medium text-gray-700">תומך 5G</label>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">דקות שיחה</label>
             <input 
                type="text" 
                className="w-full border rounded-lg p-2" 
                placeholder="לדוג': 5000 או ללא הגבלה"
                value={formData.calls} 
                onChange={e => setFormData({...formData, calls: e.target.value})} 
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות/תוספות</label>
            <input type="text" className="w-full border rounded-lg p-2" placeholder="לדוג': כולל שיחות לחו''ל" 
              value={formData.extras} onChange={e => setFormData({...formData, extras: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4">
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
            <RefreshCw size={18}/> טען נתונים לדוגמה מהשוק (פברואר 2026)
          </button>
        </div>
      </div>
    </div>
  );
}