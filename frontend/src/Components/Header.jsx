import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  const [user, setUser] = useState(null); // Managed by your auth logic
  const [pendingCount, setPendingCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const searchWrapperRef = useRef(null);

  // 1. MAINTAINED: DYNAMIC SCROLL TRANSFORMATION
  const { scrollY } = useScroll();
  const headerWidth = useTransform(scrollY, [0, 100], ["100%", "92%"]);
  const headerTop = useTransform(scrollY, [0, 100], ["0px", "16px"]);
  const headerRadius = useTransform(scrollY, [0, 100], ["0px", "32px"]);
  const headerShadow = useTransform(scrollY, [0, 100], ["0px 0px 0px rgba(0,0,0,0)", "0px 30px 60px rgba(0,0,0,0.12)"]);

  // 2. MAINTAINED: VOICE SEARCH (Web Speech API)
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

  // 3. MAINTAINED & ENHANCED: API SEARCH LOGIC
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/search?query=${query}`);
          const data = await res.json();
          setSearchResults(data);
          // NEW: Suggest related recipes from results
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

  // Load History on Mount
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

  // Outside Click Logic
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
    <div className="fixed top-0 left-0 right-0 flex justify-center z-[100] px-4 pointer-events-none">
      <motion.header
        style={{ width: headerWidth, marginTop: headerTop, borderRadius: headerRadius, boxShadow: headerShadow }}
        className="bg-white/90 backdrop-blur-3xl border border-white/20 h-20 px-6 md:px-12 flex items-center justify-between overflow-visible transition-all pointer-events-auto"
      >
        {/* BRANDING (Maintained) */}
        <Link to="/" className="flex items-center gap-3 shrink-0 z-[110]">
          <motion.img whileHover={{ rotate: 15, scale: 1.1 }} src={image} alt="Logo" className="h-10 w-auto shadow-orange-200" />
          <div className="flex flex-col -space-y-4">
            <span className="font-signature text-5xl text-orange-600">KKB</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        {/* CENTER: SEARCH & NAV (Maintained Layout) */}
        <div ref={searchWrapperRef} className="flex-1 flex justify-center items-center px-4 md:px-12 max-w-4xl relative">
          <AnimatePresence mode="wait">
            {!searchOpen ? (
              <motion.nav initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="hidden lg:flex items-center gap-10">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>

                {/* DISCOVER DROP (Your requested categories) */}
                <div className="relative group py-7">
                  <button className="nav-link flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                    Discover <FiChevronDown className="group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="dropdown-menu">
                    <DropdownItem to="/discover?cat=breakfast" icon={<FiCoffee />} title="Breakfast" />
                    <DropdownItem to="/discover?cat=dinner" icon={<FiMoon />} title="Dinner" />
                    <DropdownItem to="/discover?cat=junk" icon={<FiSmile />} title="Junk Food" />
                  </div>
                </div>

                {/* KITCHEN DROP (Your requested tools) */}
                <div className="relative group py-7">
                  <button className="nav-link flex items-center gap-1 group-hover:text-orange-600 transition-colors border-r-2 border-orange-50 pr-8">
                    Kitchen <FiChevronDown className="group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="dropdown-menu w-64">
                    <DropdownItem to="/planner" icon={<FiCalendar />} title="Meal Planner" />
                    <DropdownItem to="/shopping-list" icon={<FiShoppingBag />} title="Shopping List" />
                    <DropdownItem to="/favorites" icon={<FiHeart />} title="Favorites" />
                    <div className="border-t border-gray-100 my-2 pt-2">
                      <DropdownItem to="/create" icon={<FiPlusCircle className="text-orange-600" />} title="Create Recipe" />
                    </div>
                  </div>
                </div>

                <button onClick={() => setSearchOpen(true)} className="p-3 bg-orange-50 rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                  <FiSearch size={22} />
                </button>
              </motion.nav>
            ) : (
              <motion.div layoutId="search-box" className="w-full flex flex-col relative">
                <div className="w-full flex items-center bg-gray-50/50 rounded-full px-6 py-4 border-2 border-orange-500/20 shadow-inner group">
                  <FiZap className={`${isSearching ? 'animate-pulse' : ''} text-orange-500 mr-4`} size={20} />
                  <input ref={searchInputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes..." className="bg-transparent w-full outline-none text-base font-bold text-gray-800" autoFocus />
                  <div className="flex items-center gap-3">
                    <button onClick={startListening} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-bounce' : 'text-gray-400'}`}><FiMic size={20} /></button>
                    <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="text-gray-300 hover:text-red-500"><FiX size={24} /></button>
                  </div>
                </div>

                {/* NEW ENHANCED SEARCH DROPDOWN */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-[120%] left-0 right-0 bg-white/95 backdrop-blur-3xl shadow-2xl rounded-[3rem] p-8 z-[200] border border-orange-50">
                  {query ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Main Results</h3>
                        {searchResults.map((r) => (
                          <div key={r.id} onClick={() => { navigate(`/Recipejollofdetail/${r.id}`); saveToHistory(query); setSearchOpen(false); }} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-2xl cursor-pointer transition-all">
                            <img src={r.imageUrl} className="h-12 w-12 rounded-xl object-cover" alt="" />
                            <p className="font-black text-gray-800 uppercase text-xs">{r.title}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50/50 rounded-[2rem] p-5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4 flex items-center gap-2"><FiUsers /> Also Cooked</h3>
                        {relatedRecipes.map(rel => (
                          <div key={rel.id} onClick={() => navigate(`/Recipejollofdetail/${rel.id}`)} className="flex items-center gap-2 mb-3 cursor-pointer group">
                            <div className="h-2 w-2 rounded-full bg-orange-300 group-hover:bg-orange-600 transition-colors" />
                            <p className="text-[10px] font-bold text-gray-600 truncate">{rel.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 flex items-center gap-2"><FiBarChart2 /> Trending</h3>
                        <div className="flex flex-col gap-2">
                          {['Smokey Jollof', 'Italian Pasta', 'Chef KKB Special'].map((t, i) => (
                            <button key={i} onClick={() => setQuery(t)} className="text-left text-sm font-bold text-gray-700 p-2 hover:bg-orange-50 rounded-lg">{t}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex justify-between">History <button onClick={() => setSearchHistory([])} className="text-red-400 lowercase">clear</button></h3>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.map((h, i) => (
                            <button key={i} onClick={() => setQuery(h)} className="px-3 py-1 bg-gray-100 rounded-md text-[10px] font-bold">{h}</button>
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

        {/* RIGHT: PROFILE (Maintained) */}
        <div className="flex items-center gap-5 shrink-0 z-[110]">
          {user ? (
            <div className="flex items-center gap-4 bg-gray-50/50 p-1.5 pr-6 rounded-full border border-gray-100">
              <img src={user.picture || `https://ui-avatars.com/api/?name=${user.name}`} className="h-10 w-10 rounded-full" alt="" />
              <span className="text-[10px] font-black uppercase text-gray-900 leading-none md:block hidden">Chef {user.name?.split(' ')[0]}</span>
            </div>
          ) : (
            <Link to="/register" className="bg-orange-600 text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl">Join</Link>
          )}
          <Navbar user={user} pendingCount={pendingCount} />
        </div>
      </motion.header>

      <style>{`
        .nav-link { @apply text-[11px] font-black uppercase text-gray-400 transition-all tracking-[0.2em] cursor-pointer; }
        .dropdown-menu { @apply absolute top-[100%] left-0 bg-white rounded-[2rem] shadow-2xl border border-gray-50 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 -translate-y-4 transition-all duration-300 z-[150]; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffedd5; border-radius: 10px; }
      `}</style>
    </div>
  );
}

const DropdownItem = ({ to, icon, title }) => (
  <Link to={to} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-2xl transition-all group/item">
    <div className="text-orange-600 group-hover/item:scale-110 transition-transform">{icon}</div>
    <span className="text-[11px] font-black uppercase text-gray-700 tracking-tight text-left">{title}</span>
  </Link>
);

export default Header;