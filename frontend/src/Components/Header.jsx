import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  FiSearch, FiX, FiChevronDown, FiPlusCircle, FiHeart,
  FiShoppingBag, FiCalendar, FiCoffee, FiSmile, FiZap, FiMic, FiBarChart2, FiUsers, FiMoon
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
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const navigate = useNavigate();
  const searchWrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // --- 1. SCROLL ANIMATIONS ---
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const headerWidth = useTransform(scrollY, [0, 100], ["100%", "94%"]);
  const headerTop = useTransform(scrollY, [0, 100], ["0px", "16px"]);
  const headerRadius = useTransform(scrollY, [0, 100], ["0px", "32px"]);

  // --- 2. SEARCH LOGIC (RESTORED) ---
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
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col items-center z-[100] px-4 pointer-events-none">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-orange-600 origin-left z-[110]" style={{ scaleX }} />

      <motion.header
        style={{ width: headerWidth, marginTop: headerTop, borderRadius: headerRadius }}
        className="bg-white/90 backdrop-blur-3xl border border-white/20 h-20 px-6 md:px-12 flex items-center justify-between overflow-visible transition-all pointer-events-auto shadow-sm relative"
      >
        {/* BRANDING */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={image} alt="Logo" className="h-10 w-auto" />
          <div className="flex flex-col -space-y-4">
            <span className="font-signature text-5xl text-orange-600">KKB</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        {/* CENTER NAVIGATION (ALWAYS VISIBLE & BALANCED) */}
        <nav className="hidden lg:flex items-center justify-center gap-8 flex-1 h-full">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>

          {/* DISCOVER */}
          <div className="relative group h-full flex items-center">
            <button className="nav-link flex items-center gap-1 group-hover:text-orange-600">
              Discover <FiChevronDown className="group-hover:rotate-180 transition-transform" />
            </button>
            <div className="dropdown-container">
              <DropdownItem to="/discover?cat=breakfast" icon={<FiCoffee />} title="Breakfast" subtitle="Morning" />
              <DropdownItem to="/discover?cat=lunch" icon={<FiZap />} title="Lunch" subtitle="Mid-day" />
              <DropdownItem to="/discover?cat=junk" icon={<FiSmile />} title="Junk Food" subtitle="Treats" />
            </div>
          </div>

          {/* KITCHEN */}
          <div className="relative group h-full flex items-center">
            <button className="nav-link flex items-center gap-1 group-hover:text-orange-600">
              Kitchen <FiChevronDown className="group-hover:rotate-180 transition-transform" />
            </button>
            <div className="dropdown-container">
              <DropdownItem to="/create" icon={<FiPlusCircle />} title="Create" subtitle="New Recipe" />
              <DropdownItem to="/favorites" icon={<FiHeart />} title="Favorites" subtitle="Saved" />
              <DropdownItem to="/shopping-list" icon={<FiShoppingBag />} title="Shopping List" subtitle="Groceries" />
              <DropdownItem to="/planner" icon={<FiCalendar />} title="Meal Planner" subtitle="Schedule" />
            </div>
          </div>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => setSearchOpen(!searchOpen)} className={`p-3 rounded-2xl transition-all ${searchOpen ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600'}`}>
            <FiSearch size={22} />
          </button>
          <Link to="/register" className="bg-orange-600 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest">Join</Link>
          <Navbar user={user} />
        </div>

        {/* --- SEARCH OVERLAY (RESTORED WITH ALL FEATURES) --- */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              ref={searchWrapperRef}
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute top-[110%] left-0 right-0 px-4 md:px-0 flex justify-center pointer-events-auto"
            >
              <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-orange-50 overflow-hidden">
                <div className="p-4 flex items-center border-b border-gray-50">
                  <FiZap className={isSearching ? "animate-pulse text-orange-500" : "text-gray-300"} size={22} />
                  <input
                    ref={searchInputRef} autoFocus value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for Smokey Jollof..."
                    className="w-full px-4 h-12 outline-none font-bold text-gray-800"
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={startListening} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-bounce' : 'text-gray-400'}`}><FiMic size={20} /></button>
                    <button onClick={() => { setSearchOpen(false); setQuery("") }} className="text-gray-300 hover:text-red-500"><FiX size={24} /></button>
                  </div>
                </div>

                {/* Search Results Display */}
                {query && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto bg-gray-50/30">
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Results</h3>
                      {searchResults.map(r => (
                        <div key={r.id} onClick={() => { navigate(`/Recipejollofdetail/${r.id}`); setSearchOpen(false) }} className="flex items-center gap-4 p-2 hover:bg-white rounded-2xl cursor-pointer transition-all mb-2 shadow-sm">
                          <img src={r.imageUrl} className="h-12 w-12 rounded-xl object-cover" alt="" />
                          <p className="font-bold text-xs text-gray-800 uppercase">{r.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <style>{`
        .nav-link { @apply text-[11px] font-black uppercase text-gray-400 transition-all tracking-[0.2em] cursor-pointer hover:text-orange-600; }
        .dropdown-container { 
          @apply absolute top-[100%] left-1/2 -translate-x-1/2 w-[260px] bg-white rounded-[2.5rem] shadow-2xl 
          border border-gray-50 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-[200]; 
        }
      `}</style>
    </div>
  );
}

const DropdownItem = ({ to, icon, title, subtitle }) => (
  <Link to={to} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-2xl transition-all group/item">
    <div className="p-2.5 bg-gray-50 text-orange-600 rounded-xl group-hover/item:bg-orange-600 group-hover/item:text-white transition-all">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase text-gray-800 tracking-tight leading-tight">{title}</span>
      <span className="text-[8px] font-bold text-gray-400 uppercase leading-none">{subtitle}</span>
    </div>
  </Link>
);

export default Header;