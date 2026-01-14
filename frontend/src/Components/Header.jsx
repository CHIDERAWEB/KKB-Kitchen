import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  FiSearch, FiX, FiShield, FiChevronDown, FiPlusCircle,
  FiHeart, FiShoppingBag, FiCalendar, FiCoffee, FiMoon, FiSmile,
  FiBarChart2, FiUsers, FiUser, FiLogOut, FiMic, FiZap
} from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import image from '../assets/image.png';
import Navbar from './Navbar';

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // New state for profile menu
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [user, setUser] = useState(null); // Assuming this is handled by your Auth
  const [pendingCount, setPendingCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const navigate = useNavigate();
  const searchWrapperRef = useRef(null);
  const profileRef = useRef(null);

  const playHover = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => { });
  };

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const headerWidth = useTransform(scrollY, [0, 100], ["100%", "92%"]);
  const headerTop = useTransform(scrollY, [0, 100], ["0px", "16px"]);
  const headerRadius = useTransform(scrollY, [0, 100], ["0px", "32px"]);

  // --- Handle Outside Clicks ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setSearchOpen(false);
        setQuery("");
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
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
        className="bg-white/80 backdrop-blur-3xl border border-white/20 h-20 px-6 md:px-12 flex items-center justify-between overflow-visible transition-all pointer-events-auto shadow-sm relative"
      >
        {/* BRANDING */}
        <Link to="/" onMouseEnter={playHover} className="flex items-center gap-3 shrink-0 z-[110]">
          <motion.img whileHover={{ rotate: 15, scale: 1.1 }} src={image} alt="Logo" className="h-10 w-auto" />
          <div className="flex flex-col -space-y-4">
            <span className="font-signature text-5xl text-orange-600">KKB</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        {/* CENTER NAVIGATION & SEARCH */}
        <div ref={searchWrapperRef} className="flex-1 flex justify-center items-center px-4 md:px-12 max-w-4xl relative h-full">
          <AnimatePresence mode="wait">
            {!searchOpen ? (
              <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden lg:flex items-center gap-10">
                <Link to="/" className="nav-link">Home</Link>

                {/* DISCOVER DROPDOWN */}
                <div className="relative group h-20 flex items-center">
                  <button className="nav-link flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                    Discover <FiChevronDown className="group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="dropdown-menu w-[260px]">
                    <DropdownItem to="/discover?cat=breakfast" icon={<FiCoffee />} title="Breakfast" subtitle="Morning vibes" onHover={playHover} />
                    <DropdownItem to="/discover?cat=dinner" icon={<FiMoon />} title="Dinner" subtitle="Night comfort" onHover={playHover} />
                    <DropdownItem to="/discover?cat=junk" icon={<FiSmile />} title="Junk Food" subtitle="Weekend joy" onHover={playHover} />
                  </div>
                </div>

                {/* KITCHEN DROPDOWN */}
                <div className="relative group h-20 flex items-center">
                  <button className="nav-link flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                    Kitchen <FiChevronDown className="group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="dropdown-menu w-[280px]">
                    <DropdownItem to="/planner" icon={<FiCalendar />} title="Planner" subtitle="Schedule" onHover={playHover} />
                    <DropdownItem to="/favorites" icon={<FiHeart />} title="Favorites" subtitle="Saved" onHover={playHover} />
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <DropdownItem to="/create" icon={<FiPlusCircle className="text-orange-600" />} title="Create" subtitle="New Recipe" onHover={playHover} />
                    </div>
                  </div>
                </div>

                <button onClick={() => setSearchOpen(true)} className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-600 hover:text-white transition-all">
                  <FiSearch size={22} />
                </button>
              </motion.nav>
            ) : (
              /* SEARCH INPUT BOX UI (Logic remains from your original) */
              <motion.div layoutId="search-box" className="w-full flex items-center bg-gray-50/50 rounded-full px-6 py-3 border-2 border-orange-500/20 shadow-inner">
                <FiZap className="text-orange-500 mr-4" />
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What are we cooking?" className="bg-transparent w-full outline-none font-bold" />
                <FiX onClick={() => setSearchOpen(false)} className="cursor-pointer text-gray-400 hover:text-red-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: PROFILE DROPDOWN */}
        <div className="flex items-center gap-5 shrink-0 z-[110]">
          {user ? (
            <div className="relative" ref={profileRef}>
              <motion.div
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 bg-gray-50/50 p-1.5 pr-6 rounded-full border border-gray-100 cursor-pointer hover:bg-white transition-all shadow-sm"
              >
                <img src={user.picture || `https://ui-avatars.com/api/?name=${user.name}`} className="h-9 w-9 rounded-full border-2 border-white shadow-sm" alt="Profile" />
                <div className="flex flex-col items-start leading-none md:block hidden">
                  <span className="text-[10px] font-black uppercase text-gray-900">Chef {user.name?.split(' ')[0]}</span>
                  <FiChevronDown className={`text-[10px] text-orange-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </div>
              </motion.div>

              {/* DROPDOWN MENU */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[120%] right-0 w-60 bg-white/95 backdrop-blur-2xl rounded-[2.2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-2 overflow-hidden z-[200]"
                  >
                    <DropdownItem to="/profile" icon={<FiUser />} title="My Kitchen" subtitle="View Profile" onHover={playHover} />
                    {user?.role === 'admin' && (
                      <DropdownItem to="/admin" icon={<FiShield className="text-orange-600" />} title="Admin Panel" subtitle="System Control" onHover={playHover} />
                    )}
                    <div className="border-t border-gray-50 mt-2 pt-2">
                      <button className="flex items-center gap-4 w-full p-4 hover:bg-red-50 rounded-2xl transition-all group">
                        <div className="p-2 bg-red-100 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all">
                          <FiLogOut size={16} />
                        </div>
                        <span className="text-[11px] font-black uppercase text-red-600">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/register" className="bg-orange-600 text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl">Join</Link>
          )}
          <Navbar user={user} pendingCount={pendingCount} />
        </div>
      </motion.header>

      <style>{`
        .nav-link { @apply text-[11px] font-black uppercase text-gray-400 transition-all tracking-[0.2em] cursor-pointer hover:text-orange-600; }
        
        /* THE KEY FIX: Centering the dropdown list */
        .dropdown-menu { 
          @apply absolute top-[100%] left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.12)] 
          border border-white/40 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          group-hover:translate-y-0 translate-y-2 transition-all duration-300 z-[150]; 
        }
      `}</style>
    </div>
  );
}

const DropdownItem = ({ to, icon, title, subtitle, onHover }) => (
  <Link to={to} onMouseEnter={onHover} className="flex items-center gap-4 p-3 hover:bg-orange-600/10 rounded-[1.8rem] transition-all group/item">
    <div className="p-2.5 bg-white/50 text-orange-600 rounded-xl group-hover/item:bg-orange-600 group-hover/item:text-white transition-all shadow-sm">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase text-gray-800 tracking-tight">{title}</span>
      <span className="text-[8px] font-bold text-gray-400 uppercase leading-none">{subtitle}</span>
    </div>
  </Link>
);

export default Header;