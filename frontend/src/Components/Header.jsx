import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FiSearch, FiX, FiShield, FiTrendingUp, FiClock, FiChevronRight, FiCommand, FiMic, FiZap, FiTarget } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import image from '../assets/image.png';
import Navbar from './Navbar';

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  // 1. DYNAMIC SCROLL TRANSFORMATION
  const { scrollY } = useScroll();
  const headerWidth = useTransform(scrollY, [0, 100], ["100%", "92%"]);
  const headerTop = useTransform(scrollY, [0, 100], ["0px", "16px"]);
  const headerRadius = useTransform(scrollY, [0, 100], ["0px", "32px"]);
  const headerShadow = useTransform(scrollY, [0, 100], ["0px 0px 0px rgba(0,0,0,0)", "0px 30px 60px rgba(0,0,0,0.12)"]);

  // 2. VOICE SEARCH (Web Speech API)
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

  // 3. API SEARCH LOGIC
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/search?query=${query}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (err) { console.error(err); }
        setIsSearching(false);
      } else { setSearchResults([]); }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click to close search
  const searchWrapperRef = useRef(null);
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
        {/* LEFT: BRANDING */}
        <Link to="/" className="flex items-center gap-3 shrink-0 z-[110]">
          <motion.img whileHover={{ rotate: 15, scale: 1.1 }} src={image} alt="Logo" className="h-10 w-auto shadow-orange-200" />
          <div className="flex flex-col -space-y-4">
            <span className="font-signature text-5xl text-orange-600">KKB</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        {/* CENTER: SEARCH MORPHING SYSTEM */}
        <div ref={searchWrapperRef} className="flex-1 flex justify-center items-center px-4 md:px-12 max-w-4xl relative">
          <AnimatePresence mode="wait">
            {!searchOpen ? (
              <motion.nav
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="hidden lg:flex items-center gap-12"
              >
                <div className="flex items-center gap-10 pr-12 border-r-2 border-orange-50">
                  {['Home', 'About', 'Discover', 'Kitchen'].map((item) => (
                    <Link key={item} to={`/${item.toLowerCase()}`} className="text-[11px] font-black uppercase text-gray-400 hover:text-orange-600 transition-all tracking-[0.2em] relative group">
                      {item}
                      <motion.span className="absolute -bottom-2 left-0 w-0 h-1 bg-orange-600 rounded-full transition-all group-hover:w-full" />
                    </Link>
                  ))}
                </div>
                <button onClick={() => setSearchOpen(true)} className="flex items-center gap-4 text-gray-400 hover:text-orange-600 group transition-all">
                  <div className="p-3 bg-orange-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                    <FiSearch size={22} />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Explore</span>
                    <span className="text-[9px] font-bold text-gray-300 flex items-center gap-1"><FiCommand size={10} /> K</span>
                  </div>
                </button>
              </motion.nav>
            ) : (
              <motion.div layoutId="search-box" className="w-full flex flex-col relative">
                <div className="w-full flex items-center bg-gray-50/50 rounded-full px-6 py-4 border-2 border-orange-500/20 shadow-inner group">
                  <FiZap className={`${isSearching ? 'animate-pulse' : ''} text-orange-500 mr-4`} size={20} />
                  <input
                    ref={searchInputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search recipes, ingredients or chefs..."
                    className="bg-transparent w-full outline-none text-base font-bold text-gray-800"
                  />
                  <div className="flex items-center gap-3">
                    <button onClick={startListening} className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-bounce' : 'text-gray-400 hover:text-orange-600'}`}>
                      <FiMic size={20} />
                    </button>
                    <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="text-gray-300 hover:text-red-500"><FiX size={24} /></button>
                  </div>
                </div>

                {/* MASSIVE SMART DROPDOWN */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute top-[120%] left-0 right-0 bg-white/95 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-[3rem] border border-white p-8 z-[200]"
                >
                  {!query ? (
                    <div className="grid grid-cols-2 gap-10">
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6 flex items-center gap-2"><FiTrendingUp /> Trending Now</h3>
                        <div className="flex flex-col gap-4">
                          {['Smokey Jollof Rice', 'Italian Pasta', 'Chef KKB Specials'].map(t => (
                            <button key={t} onClick={() => setQuery(t)} className="flex items-center justify-between text-left p-4 hover:bg-orange-50 rounded-2xl transition-all font-black text-gray-700 text-sm group">
                              {t} <FiChevronRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                        <div className="bg-orange-100 p-4 rounded-full text-orange-600 mb-4"><FiTarget size={30} /></div>
                        <p className="font-black text-xs uppercase tracking-widest text-gray-800">Chef's Choice</p>
                        <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-tighter">Discover recipes tailored to your taste</p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-6">
                      {searchResults.map((r, i) => (
                        <motion.div
                          key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          onClick={() => { navigate(`/Recipejollofdetail/${r.id}`); setSearchOpen(false) }}
                          className="flex items-center gap-5 p-4 hover:bg-white hover:shadow-xl hover:shadow-orange-100/50 rounded-[2.5rem] cursor-pointer group transition-all border border-transparent hover:border-orange-100"
                        >
                          <img src={r.imageUrl} className="h-24 w-24 rounded-[2rem] object-cover shadow-2xl group-hover:scale-105 transition-transform" />
                          <div className="text-left flex-1">
                            <p className="font-black text-gray-800 text-base mb-1 tracking-tighter uppercase">{r.title}</p>
                            <div className="flex gap-4">
                              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><FiClock /> {r.time || '30m'}</span>
                              <span className="text-[10px] font-black text-orange-500 flex items-center gap-1">GO TO RECIPE <FiChevronRight /></span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: PROFILE & MOBILE */}
        <div className="flex items-center gap-5 shrink-0 z-[110]">
          {user ? (
            <div className="flex items-center gap-4 bg-gray-50/50 p-1.5 pr-6 rounded-full border border-gray-100">
              <div className="relative">
                <img src={user.picture || `https://ui-avatars.com/api/?name=${user.name}`} className="h-10 w-10 rounded-full border-2 border-white shadow-xl group-hover:scale-110" />
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-900 leading-none">Chef {user.name?.split(' ')[0]}</span>
                {user.role === 'admin' && <span className="text-[8px] font-bold text-purple-600 uppercase tracking-widest mt-0.5">Kitchen Admin</span>}
              </div>
            </div>
          ) : (
            <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-100 transition-all active:scale-95">Start Cooking</Link>
          )}
          <Navbar user={user} pendingCount={pendingCount} />
        </div>
      </motion.header>
    </div>
  );
}

export default Header;