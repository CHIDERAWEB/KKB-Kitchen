import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  FiSearch, FiX, FiShield, FiTrendingUp, FiClock, FiChevronRight,
  FiCommand, FiMic, FiZap, FiTarget, FiChevronDown, FiPlusCircle,
  FiHeart, FiShoppingBag, FiCalendar, FiCoffee, FiMoon, FiSmile,
  FiLayers, FiTrash2, FiBarChart2, FiUsers
} from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import image from '../assets/image.png';
import Navbar from './Navbar';

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const searchWrapperRef = useRef(null);

  // --- 1. SOUND EFFECT LOGIC ---
  const playHover = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => { });
  };

  // --- 2. READING PROGRESS BAR LOGIC ---
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const headerWidth = useTransform(scrollY, [0, 100], ["100%", "92%"]);
  const headerTop = useTransform(scrollY, [0, 100], ["0px", "16px"]);
  const headerRadius = useTransform(scrollY, [0, 100], ["0px", "32px"]);
  const headerShadow = useTransform(scrollY, [0, 100], ["0px 0px 0px rgba(0,0,0,0)", "0px 30px 60px rgba(0,0,0,0.12)"]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      setQuery(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/search?query=${query}`);
          const data = await res.json();
          setSearchResults(data);
          setRelatedRecipes(data.length > 2 ? data.slice(-2) : []);
        } catch (err) { console.error(err); }
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setRelatedRecipes([]);
      }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kkb_history') || '[]');
    setSearchHistory(saved);
  }, []);

  const saveToHistory = (term) => {
    if (!term) return;
    const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('kkb_history', JSON.stringify(updated));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setSearchOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col items-center z-[100] px-4 pointer-events-none">

      {/* SCROLL PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-orange-600 origin-left z-[110]"
        style={{ scaleX }}
      />

      <motion.header
        style={{ width: headerWidth, marginTop: headerTop, borderRadius: headerRadius, boxShadow: headerShadow }}
        className="bg-white/80 backdrop-blur-3xl border border-white/20 h-20 px-6 md:px-12 flex items-center justify-between overflow-visible transition-all pointer-events-auto shadow-sm"
      >
        {/* BRANDING */}
        <Link to="/" onMouseEnter={playHover} className="flex items-center gap-3 shrink-0 z-[110] relative">
          <motion.img whileHover={{ rotate: 15, scale: 1.1 }} src={image} alt="Logo" className="h-10 w-auto" />

          {/* LIVE STATUS INDICATOR */}
          {(isSearching || isListening) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex h-3 w-3"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600"></span>
            </motion.div>
          )}

          <div className="flex flex-col -space-y-4">
            <span className="font-signature text-5xl text-orange-600">KKB</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        {/* CENTER NAVIGATION */}
        <div ref={searchWrapperRef} className="flex-1 flex justify-center items-center px-4 md:px-12 max-w-4xl relative">
          <AnimatePresence mode="wait">
            {!searchOpen ? (
              <motion.nav initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="hidden lg:flex items-center gap-10">
                <Link to="/" onMouseEnter={playHover} className="nav-link">Home</Link>

                {/* DISCOVER DROPDOWN */}
                <div className="relative group py-7" onMouseEnter={playHover}>
                  <button className="nav-link flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                    Discover <FiChevronDown className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute top-full left-0 w-full h-4 bg-transparent" />
                  <div className="dropdown-menu w-[260px]">
                    <DropdownItem onHover={playHover} to="/discover?cat=breakfast" icon={<FiCoffee />} title="Breakfast" subtitle="Morning routines" />
                    <DropdownItem onHover={playHover} to="/discover?cat=dinner" icon={<FiMoon />} title="Dinner" subtitle="Evening comfort" />
                    <DropdownItem onHover={playHover} to="/discover?cat=junk" icon={<FiSmile />} title="Junk Food" subtitle="Weekend treats" />
                  </div>
                </div>

                {/* KITCHEN DROPDOWN */}
                <div className="relative group py-7" onMouseEnter={playHover}>
                  <button className="nav-link flex items-center gap-1 group-hover:text-orange-600 transition-colors border-r-2 border-orange-50 pr-8">
                    Kitchen <FiChevronDown className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute top-full left-0 w-full h-4 bg-transparent" />
                  <div className="dropdown-menu w-[280px]">
                    <DropdownItem onHover={playHover} to="/planner" icon={<FiCalendar />} title="Meal Planner" subtitle="Schedule your eats" />
                    <DropdownItem onHover={playHover} to="/shopping-list" icon={<FiShoppingBag />} title="Shopping List" subtitle="Essential ingredients" />
                    <DropdownItem onHover={playHover} to="/favorites" icon={<FiHeart />} title="Favorites" subtitle="Your loved recipes" />
                    <div className="border-t border-gray-100/50 mt-2 pt-2">
                      <DropdownItem onHover={playHover} to="/create" icon={<FiPlusCircle className="text-orange-600" />} title="Create Recipe" subtitle="Share your magic" />
                    </div>
                  </div>
                </div>

                <button onClick={() => setSearchOpen(true)} onMouseEnter={playHover} className="p-3 bg-orange-50 rounded-2xl hover:bg-orange-600 hover:text-white transition-all">
                  <FiSearch size={22} />
                </button>
              </motion.nav>
            ) : (
              <motion.div layoutId="search-box" className="w-full flex flex-col relative">
                <div className="w-full flex items-center bg-gray-50/50 rounded-full px-6 py-4 border-2 border-orange-500/20 shadow-inner group">
                  <FiZap className={`${isSearching ? 'animate-pulse' : ''} text-orange-500 mr-4`} size={20} />
                  <input ref={searchInputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What are we cooking?" className="bg-transparent w-full outline-none text-base font-bold text-gray-800" autoFocus />
                  <div className="flex items-center gap-3">
                    <button onClick={startListening} onMouseEnter={playHover} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-bounce' : 'text-gray-400'}`}><FiMic size={20} /></button>
                    <button onClick={() => { setSearchOpen(false); setQuery(""); }} onMouseEnter={playHover} className="text-gray-300 hover:text-red-500 transition-colors"><FiX size={24} /></button>
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[120%] left-0 right-0 bg-white/90 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-[3rem] p-8 z-[200] border border-orange-50">
                  {query ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Results for "{query}"</h3>
                        {searchResults.slice(0, 4).map((r) => (
                          <div key={r.id} onMouseEnter={playHover} onClick={() => { navigate(`/Recipejollofdetail/${r.id}`); saveToHistory(query); setSearchOpen(false); }} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-2xl cursor-pointer transition-all">
                            <img src={r.imageUrl} className="h-14 w-14 rounded-2xl object-cover" alt="" />
                            <p className="font-black text-gray-800 uppercase text-xs tracking-tight">{r.title}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50/30 rounded-[2.5rem] p-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4 flex items-center gap-2"><FiUsers /> Community Picks</h3>
                        {relatedRecipes.map(rel => (
                          <div key={rel.id} onMouseEnter={playHover} onClick={() => navigate(`/Recipejollofdetail/${rel.id}`)} className="flex items-center gap-3 mb-4 cursor-pointer group">
                            <div className="h-2 w-2 rounded-full bg-orange-400 group-hover:scale-150 transition-transform" />
                            <p className="text-[10px] font-bold text-gray-600 group-hover:text-orange-600 transition-colors">{rel.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="flex flex-col gap-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 flex items-center gap-2"><FiBarChart2 /> Trending Right Now</h3>
                        <div className="flex flex-wrap gap-2">
                          {['Smokey Jollof', 'Italian Pasta', 'Chef KKB Special', 'Vegan Bowl'].map((t, i) => (
                            <button key={i} onMouseEnter={playHover} onClick={() => setQuery(t)} className="px-5 py-3 bg-orange-50/50 hover:bg-orange-600 hover:text-white transition-all text-[11px] font-black uppercase rounded-2xl text-orange-600 tracking-wider border border-orange-100">{t}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: PROFILE */}
        <div className="flex items-center gap-5 shrink-0 z-[110]">
          {user ? (
            <div onMouseEnter={playHover} className="flex items-center gap-4 bg-gray-50/50 p-1.5 pr-6 rounded-full border border-gray-100 cursor-pointer">
              <img src={user.picture || `https://ui-avatars.com/api/?name=${user.name}`} className="h-10 w-10 rounded-full" alt="" />
              <span className="text-[10px] font-black uppercase text-gray-900 leading-none md:block hidden">Chef {user.name?.split(' ')[0]}</span>
            </div>
          ) : (
            <Link to="/register" onMouseEnter={playHover} className="bg-orange-600 text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">Join</Link>
          )}
          <Navbar user={user} pendingCount={pendingCount} />
        </div>
      </motion.header>

      <style>{`
        .nav-link { @apply text-[11px] font-black uppercase text-gray-400 transition-all tracking-[0.2em] cursor-pointer hover:text-orange-600; }
        .dropdown-menu { 
          @apply absolute top-[100%] left-[-20px] bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.12)] 
          border border-white/40 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          group-hover:translate-y-0 -translate-y-4 transition-all duration-300 ease-out z-[150]; 
          transition-delay: 50ms;
        }
      `}</style>
    </div>
  );
}

const DropdownItem = ({ to, icon, title, subtitle, onHover }) => (
  <Link to={to} onMouseEnter={onHover} className="flex items-center gap-4 p-4 hover:bg-orange-600/10 rounded-[2rem] transition-all group/item">
    <div className="p-3 bg-white/50 text-orange-600 rounded-2xl group-hover/item:bg-orange-600 group-hover/item:text-white transition-all shadow-sm">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex flex-col">
      <span className="text-[11px] font-black uppercase text-gray-800 tracking-tight">{title}</span>
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{subtitle}</span>
    </div>
  </Link>
);

export default Header;