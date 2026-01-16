import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiX, FiChevronDown, FiPlusCircle, FiHeart,
  FiCoffee, FiSmile, FiZap, FiBarChart2, FiLogOut,
  FiLayout, FiUser, FiCheckCircle, FiMic, FiClock, FiTrendingUp, FiLock
} from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import image from '../assets/image.png';
import Navbar from './Navbar';

const socket = io('https://kkb-kitchen-api.onrender.com');

const navContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]');
  });

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const searchWrapperRef = useRef(null);

  // --- 1. UPDATED IDENTITY LOGIC (FIXED) ---
  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncUser = () => {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (savedUser && token) {
        setUser({
          ...savedUser,
          displayName: savedUser.name?.toLowerCase().startsWith('chief')
            ? savedUser.name
            : `Chief ${savedUser.name?.split(' ')[0] || 'KKB'}`,
          picture: savedUser.avatar || savedUser.picture || `https://ui-avatars.com/api/?name=${savedUser.name}&background=ea580c&color=fff`,
          token
        });
      } else {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, [location.pathname]);

  // --- 2. RESTRICTION GATEKEEPER ---
  const handleRestrictedAction = (e, destination) => {
    if (user) return;

    e.preventDefault();
    setSearchOpen(false);

    const isReturningUser = localStorage.getItem('was_user_before');

    if (isReturningUser === 'true') {
      setToastMessage("Welcome back, Chief! Please login to view this content.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/login');
      }, 2000);
    } else {
      setToastMessage("New to KKB Kitchen? Please register to unlock recipes!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/register');
      }, 2000);
    }
  };

  // --- 3. ADMIN STATS FETCH ---
  const fetchAdminStats = async () => {
    // Check localStorage directly to ensure we have the latest token for the fetch
    const savedToken = user?.token || localStorage.getItem('token');
    const savedUser = JSON.parse(localStorage.getItem('user'));

    if (!savedToken || savedUser?.role !== 'admin') return;

    try {
      const res = await fetch('https://kkb-kitchen-api.onrender.com/api/admin/pending-count', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      const data = await res.json();
      setPendingCount(data.count || 0);
    } catch (err) { console.error("Admin API Error:", err); }
  };

  // --- 4. VOICE SEARCH ---
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
  };

  // --- 5. SEARCH LOGIC ---
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/search?q=${query}`);
        const data = await res.json();
        setSearchResults(data);

        if (data.length > 0) {
          const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
          setRecentSearches(updated);
          localStorage.setItem('recentSearches', JSON.stringify(updated));
        }
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // --- 6. FIXED NOTIFICATION & REAL-TIME LOGIC ---
  useEffect(() => {
    // Initial fetch when user object is available
    if (user?.role === 'admin') fetchAdminStats();

    const handleNotification = (data, messagePrefix) => {
      setToastMessage(`${messagePrefix}: "${data.title}"`);
      setShowToast(true);

      // INSTANT FIX: If admin, refresh the badge count right now
      const currentStoredUser = JSON.parse(localStorage.getItem('user'));
      if (currentStoredUser?.role === 'admin') {
        fetchAdminStats();
      }

      setTimeout(() => setShowToast(false), 5000);
    };

    socket.on("recipeApproved", (data) => handleNotification(data, "Recipe Approved"));
    socket.on("recipeCreated", (data) => handleNotification(data, "New Recipe Created"));

    return () => {
      socket.off("recipeApproved");
      socket.off("recipeCreated");
    };
  }, [user]); // Runs when user logs in or state changes

  useEffect(() => {
    if (user?.role === 'admin') {
      const interval = setInterval(fetchAdminStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.setItem('was_user_before', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col items-center z-[100] px-4 py-6 pointer-events-none">
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 90, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="absolute bg-white border border-orange-100 shadow-2xl px-6 py-4 rounded-[2rem] flex items-center gap-4 pointer-events-auto z-[110]">
            <div className={`p-2 rounded-full ${user ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              {user ? <FiCheckCircle size={20} /> : <FiLock size={20} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-800 tracking-tight">KKB Mastery</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-[95%] bg-white/95 backdrop-blur-3xl border border-white/20 h-20 px-8 flex items-center justify-between pointer-events-auto shadow-2xl rounded-[2.5rem] relative">

        <Link to="/" className="flex items-center gap-3 shrink-0">
          <motion.img whileHover={{ scale: 1.1, rotate: 5 }} src={image} alt="Logo" className="h-10 w-auto" />
          <div className="flex flex-col -space-y-4">
            <span className="font-signature text-5xl text-orange-600">KKB</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        <motion.nav variants={navContainerVariants} initial="hidden" animate="visible" className="hidden lg:flex items-center justify-center gap-10 flex-1 h-full">
          <motion.div variants={navItemVariants}><Link to="/" className="nav-link">Home</Link></motion.div>
          <motion.div variants={navItemVariants}><Link to="/about" className="nav-link">About</Link></motion.div>


          {/* DISCOVER DROPDOWN */}
          <motion.div variants={navItemVariants} className="relative group h-full flex items-center">
            <div className="flex items-center gap-1 cursor-pointer py-2 group-hover:text-orange-600 transition-all">
              <span className="nav-link">Discover</span>
              <FiChevronDown className="text-gray-400 transition-transform duration-300 group-hover:rotate-180 group-hover:text-orange-600" />
            </div>

            {/* Fixed Dropdown Container */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="flex flex-col gap-2">
                <DropdownItem onClick={(e) => handleRestrictedAction(e, '/discover')} to="/discover?cat=junk" icon={<FiSmile />} title="Junk" subtitle="Quick Treats" />
                <DropdownItem onClick={(e) => handleRestrictedAction(e, '/discover')} to="/discover?cat=breakfast" icon={<FiCoffee />} title="Breakfast" subtitle="Morning Vibes" />
                <DropdownItem onClick={(e) => handleRestrictedAction(e, '/discover')} to="/discover?cat=dinner" icon={<FiZap />} title="Dinner" subtitle="Night Specials" />
              </div>
            </div>
          </motion.div>

          {/* KITCHEN DROPDOWN */}
          <motion.div variants={navItemVariants} className="relative group h-full flex items-center">
            <div className="flex items-center gap-1 cursor-pointer py-2 group-hover:text-orange-600 transition-all">
              <span className="nav-link">Kitchen</span>
              <FiChevronDown className="text-gray-400 transition-transform duration-300 group-hover:rotate-180 group-hover:text-orange-600" />
            </div>

            {/* Fixed Dropdown Container */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="flex flex-col gap-2">
                <DropdownItem onClick={(e) => handleRestrictedAction(e, '/create')} to="/create" icon={<FiPlusCircle />} title="Create" subtitle="New magic" />
                <DropdownItem onClick={(e) => handleRestrictedAction(e, '/favorites')} to="/favorites" icon={<FiHeart />} title="Favourite" subtitle="Your Loves" />
                <DropdownItem onClick={(e) => handleRestrictedAction(e, '/planner')} to="/planner" icon={<FiBarChart2 />} title="Meal Planner" subtitle="Schedule" />
              </div>
            </div>
          </motion.div>
        </motion.nav>

        <div className="flex items-center gap-4 shrink-0">
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSearchOpen(!searchOpen)}
            className={`p-3 rounded-2xl transition-all ${searchOpen ? 'bg-orange-600 text-white shadow-lg' : 'bg-orange-50 text-orange-600'}`}>
            <FiSearch size={22} />
          </motion.button>

          {user ? (
            <div className="relative" ref={profileRef}>
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 bg-white border border-gray-100 p-1.5 pr-4 rounded-full shadow-sm cursor-pointer">
                <div className="relative">
                  <img src={user.picture} className="h-9 w-9 rounded-full object-cover border-2 border-orange-50" alt="Avatar" />
                  {user.role === 'admin' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative flex items-center justify-center rounded-full h-4 w-4 bg-red-600 text-white font-black text-[8px]">{pendingCount}</span>
                    </span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-[10px] font-black uppercase text-gray-800 leading-none">{user.displayName}</p>
                  <p className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter">{user.role}</p>
                </div>
              </motion.button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                    className="absolute top-[120%] right-0 w-64 bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 p-3 z-[300]">

                    {/* Added Profile Arrow for consistency */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-50"></div>

                    {user.role === 'admin' && (
                      <DropdownItem to="/admin" icon={<FiLayout />} title="Admin Panel" subtitle={`Manage (${pendingCount})`} />
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 hover:bg-red-50 rounded-[1.8rem] transition-all text-left group">
                      <div className="p-2.5 bg-red-100 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all">
                        <FiLogOut size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-800">Logout</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">End Session</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-[10px] font-black uppercase text-gray-400 px-4">Login</Link>
              <Link to="/register"><motion.button whileHover={{ scale: 1.05 }} className="bg-orange-600 text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg">Join</motion.button></Link>
            </div>
          )}
          <Navbar user={user} />
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.div ref={searchWrapperRef} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute top-[115%] left-0 right-0 flex justify-center pointer-events-auto px-4">
              <div className="w-full max-w-5xl bg-white rounded-[3.5rem] shadow-2xl border border-orange-50 overflow-hidden">
                <div className="p-8 flex items-center border-b border-gray-50 bg-gray-50/20 gap-4">
                  <FiSearch className={isSearching ? "animate-pulse text-orange-500" : "text-gray-300"} size={26} />
                  <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes, ingredients, chefs..." className="w-full h-14 outline-none font-bold text-gray-800 bg-transparent text-xl" />
                  <button onClick={handleVoiceSearch} className="p-3 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-600 hover:text-white transition-all"><FiMic size={20} /></button>
                  <FiX onClick={() => { setSearchOpen(false); setQuery(""); }} className="cursor-pointer text-gray-300 hover:text-red-500" size={30} />
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8 max-h-[500px] overflow-y-auto">
                  <div className="md:col-span-3 space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-gray-400">Results</h3>
                    {searchResults.map((recipe) => (
                      <Link key={recipe._id} to={`/recipe/${recipe._id}`} onClick={(e) => handleRestrictedAction(e, `/recipe/${recipe._id}`)} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-2xl transition-all group">
                        <img src={recipe.image || recipe.imageUrl} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" />
                        <div>
                          <p className="text-sm font-black text-gray-800 group-hover:text-orange-600">{recipe.title}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{recipe.category} • Chef {recipe.author?.name || 'KKB'}</p>
                        </div>
                      </Link>
                    ))}
                    {query.length > 2 && searchResults.length === 0 && !isSearching && <p className="text-xs font-bold text-gray-400 italic">No matches for your kitchen...</p>}
                  </div>

                  <div className="space-y-8 border-l border-gray-50 pl-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black uppercase text-gray-400">Recent</h3>
                        <button onClick={clearRecent} className="text-[8px] font-bold text-orange-600 uppercase underline">Clear</button>
                      </div>
                      {recentSearches.map(s => (
                        <button key={s} onClick={() => setQuery(s)} className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 hover:text-orange-600"><FiClock size={12} /> {s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <style>{`
        .nav-link { @apply text-[11px] font-black uppercase text-gray-400 transition-colors tracking-[0.2em] cursor-pointer hover:text-orange-600; }
        .dropdown-menu { 
          @apply absolute top-[100%] left-0 w-[280px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] 
          border border-gray-100 p-3 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible 
          group-hover:translate-y-0 transition-all duration-300 ease-out z-[200] pointer-events-auto flex flex-col gap-1; 
        }
      `}</style>
    </div>
  );
}

const DropdownItem = ({ to, icon, title, subtitle, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-4 p-4 hover:bg-orange-50 rounded-[2rem] transition-all group/item">
    <div className="p-3 bg-white text-orange-600 rounded-2xl group-hover/item:bg-orange-600 group-hover/item:text-white transition-all shadow-sm">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex flex-col text-left">
      <span className="text-[10px] font-black uppercase text-gray-800 leading-tight">{title}</span>
      <span className="text-[8px] font-bold text-gray-400 uppercase">{subtitle}</span>
    </div>
  </Link>
);

export default Header;