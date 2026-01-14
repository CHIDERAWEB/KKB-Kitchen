import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiX, FiChevronDown, FiPlusCircle, FiHeart, FiClock,
  FiCoffee, FiSmile, FiZap, FiBarChart2, FiUsers, FiLogOut,
  FiLayout, FiUser, FiTrash2, FiChevronRight, FiCheckCircle
} from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client'; // 1. Added Socket Import
import image from '../assets/image.png';
import Navbar from './Navbar';

// 2. Initialize Socket Connection
const socket = io('https://kkb-kitchen-api.onrender.com');

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Recipe has been approved!"); // Added dynamic message state

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const searchWrapperRef = useRef(null);

  // --- AUTH STATE ---
  const [user, setUser] = useState({
    name: "Chef KKB",
    role: "admin",
    picture: "https://ui-avatars.com/api/?name=Chef+KKB&background=ea580c&color=fff",
    token: localStorage.getItem('token')
  });

  // --- 1. REAL-TIME SOCKET LISTENER ---
  // Inside Header.js
  useEffect(() => {
    socket.on("recipeApproved", (data) => {
      // This matches the { title } you are sending from the controller
      setToastMessage(`"${data.title}" has been approved!`);
      setShowToast(true);

      // Refresh the pending badge count
      if (user?.role === 'admin') {
        fetchAdminStats();
      }

      // Auto-hide the notification after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    });

    return () => socket.off("recipeApproved");
  }, [user]);

  // --- 2. ADMIN SYNC: Initial Load & Polling Fallback ---
  const fetchAdminStats = async () => {
    try {
      const res = await fetch('https://kkb-kitchen-api.onrender.com/api/admin/pending-count', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setPendingCount(data.count || 0);
    } catch (err) { console.error("Admin API Error:", err); }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminStats();
      const interval = setInterval(fetchAdminStats, 30000); // Polling slower now because we have Sockets
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  // --- 3. SEARCH LOGIC (History + API) ---
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kkb_history') || '[]');
    setSearchHistory(saved);
  }, []);

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
      } else {
        setSearchResults([]);
      }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const addToHistory = (term) => {
    const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('kkb_history', JSON.stringify(updated));
  };

  const handleResultClick = (recipeId, title) => {
    addToHistory(title);
    setSearchOpen(false);
    setQuery("");
    navigate(`/Recipejollofdetail/${recipeId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // --- 4. CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col items-center z-[100] px-4 py-6 pointer-events-none">

      {/* --- REAL-TIME APPROVAL TOAST --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-4 bg-white border border-green-100 shadow-2xl px-6 py-4 rounded-[2rem] flex items-center gap-4 pointer-events-auto"
          >
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <FiCheckCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-800 tracking-tight">Chef Notification</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-[95%] bg-white/95 backdrop-blur-3xl border border-white/20 h-20 px-8 flex items-center justify-between pointer-events-auto shadow-2xl rounded-[2.5rem] relative"
      >
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <motion.img whileHover={{ scale: 1.1, rotate: 5 }} src={image} alt="Logo" className="h-10 w-auto" />
          <div className="flex flex-col -space-y-4">
            <span className="font-signature text-5xl text-orange-600">KKB</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center justify-center gap-10 flex-1 h-full">
          <Link to="/" className="nav-link">Home</Link>

          <div className="relative group h-full flex flex-col items-center justify-center">
            <span className="nav-link flex items-center gap-1 cursor-pointer group-hover:text-orange-600 transition-all">
              Discover <FiChevronDown className="group-hover:rotate-180 transition-transform" />
            </span>
            <div className="dropdown-menu">
              <DropdownItem to="/discover?cat=breakfast" icon={<FiCoffee />} title="Breakfast" subtitle="Morning" />
              <DropdownItem to="/discover?cat=junk" icon={<FiSmile />} title="Junk Food" subtitle="Treats" />
            </div>
          </div>

          <div className="relative group h-full flex flex-col items-center justify-center">
            <span className="nav-link flex items-center gap-1 cursor-pointer group-hover:text-orange-600 transition-all">
              Kitchen <FiChevronDown className="group-hover:rotate-180 transition-transform" />
            </span>
            <div className="dropdown-menu">
              <DropdownItem to="/create" icon={<FiPlusCircle />} title="Create" subtitle="New magic" />
              <DropdownItem to="/favorites" icon={<FiHeart />} title="Favorites" subtitle="Saved" />
            </div>
          </div>
        </nav>

        {/* PROFILE & ACTIONS */}
        <div className="flex items-center gap-4 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-3 rounded-2xl transition-all ${searchOpen ? 'bg-orange-600 text-white shadow-lg' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
          >
            <FiSearch size={22} />
          </motion.button>

          {user ? (
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 bg-white border border-gray-100 p-1.5 pr-4 rounded-full shadow-sm"
              >
                <div className="relative">
                  <img src={user.picture} className="h-9 w-9 rounded-full object-cover border-2 border-orange-50" alt="Avatar" />
                  {user.role === 'admin' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative flex items-center justify-center rounded-full h-4 w-4 bg-red-600 text-[8px] text-white font-black">{pendingCount}</span>
                    </span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-[10px] font-black uppercase text-gray-800 leading-none">Chef {user.name.split(' ')[0]}</p>
                  <p className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter">{user.role}</p>
                </div>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute top-[120%] right-0 w-64 bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 p-3 z-[300]"
                  >
                    {user.role === 'admin' ? (
                      <>
                        <DropdownItem to="/admin/dashboard" icon={<FiLayout className="text-orange-600" />} title="Admin Panel" subtitle={`${pendingCount} Pending`} />
                        <DropdownItem to="/profile" icon={<FiUser />} title="Admin Profile" subtitle="Account" />
                      </>
                    ) : (
                      <>
                        <DropdownItem to="/profile" icon={<FiUser />} title="My Profile" subtitle="Cook Details" />
                        <DropdownItem to="/favorites" icon={<FiHeart />} title="My Favorites" subtitle="Loved Items" />
                      </>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-50">
                      <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 hover:bg-red-50 rounded-[1.8rem] transition-all group/out text-left">
                        <div className="p-2.5 bg-red-100 text-red-500 rounded-xl group-hover/out:bg-red-500 group-hover/out:text-white transition-all"><FiLogOut size={18} /></div>
                        <span className="text-[10px] font-black uppercase text-gray-800">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/register"><motion.button whileHover={{ scale: 1.05 }} className="bg-orange-600 text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg">Join</motion.button></Link>
          )}
          <Navbar user={user} />
        </div>

        {/* SEARCH OVERLAY */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              ref={searchWrapperRef}
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute top-[115%] left-0 right-0 flex justify-center pointer-events-auto px-4"
            >
              <div className="w-full max-w-5xl bg-white rounded-[3.5rem] shadow-2xl border border-orange-50 overflow-hidden">
                <div className="p-8 flex items-center border-b border-gray-50 bg-gray-50/20">
                  <FiZap className={isSearching ? "animate-pulse text-orange-500" : "text-gray-300"} size={26} />
                  <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes..." className="w-full px-6 h-14 outline-none font-bold text-gray-800 bg-transparent text-xl" />
                  <FiX onClick={() => { setSearchOpen(false); setQuery("") }} className="cursor-pointer text-gray-300 hover:text-red-500" size={30} />
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-12 gap-12 max-h-[500px] overflow-y-auto">
                  <div className="md:col-span-7">
                    {!query ? (
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><FiClock /> Recent</h3>
                        {searchHistory.map((term, i) => (
                          <div key={i} className="flex items-center group bg-gray-50 p-1 rounded-2xl hover:bg-orange-50 transition-all cursor-pointer">
                            <div className="flex-1 px-5 py-3 text-[12px] font-bold text-gray-600" onClick={() => setQuery(term)}>"{term}"</div>
                            <button onClick={(e) => { e.stopPropagation(); setSearchHistory(searchHistory.filter(h => h !== term)); }} className="p-2 text-gray-300 hover:text-red-500"><FiTrash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {searchResults.map(r => (
                          <div key={r.id} onClick={() => handleResultClick(r.id, r.title)} className="flex items-center gap-5 p-4 hover:bg-orange-50 rounded-[2rem] cursor-pointer transition-all border border-transparent hover:border-orange-100 group">
                            <img src={r.imageUrl} className="h-16 w-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                            <div>
                              <p className="font-black text-gray-800 uppercase text-xs tracking-tight">{r.title}</p>
                              <p className="text-[9px] text-orange-600 font-bold uppercase flex items-center gap-1">Chef's Secret <FiChevronRight /></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-5 bg-orange-50/50 rounded-[2.5rem] p-8">
                    <h3 className="text-[10px] font-black uppercase text-orange-600 mb-6 flex items-center gap-2"><FiBarChart2 /> Trending</h3>
                    {['Smokey Jollof', 'Native Rice', 'Afang Soup'].map((item, i) => (
                      <div key={i} onClick={() => setQuery(item)} className="mb-4 text-xs font-black uppercase text-gray-700 hover:text-orange-600 cursor-pointer flex items-center gap-3">
                        <span className="text-orange-300">0{i + 1}</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <style>{`
        .nav-link { @apply text-[11px] font-black uppercase text-gray-400 transition-all tracking-[0.2em] cursor-pointer hover:text-orange-600; }
        .dropdown-menu { 
          @apply absolute top-[85%] left-1/2 -translate-x-1/2 w-[280px] bg-white rounded-[2.5rem] shadow-2xl 
          border border-gray-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-[200]; 
        }
      `}</style>
    </div>
  );
}

const DropdownItem = ({ to, icon, title, subtitle }) => (
  <Link to={to} className="flex items-center gap-4 p-4 hover:bg-orange-50 rounded-[2rem] transition-all group/item">
    <div className="p-3 bg-white text-orange-600 rounded-2xl group-hover/item:bg-orange-600 group-hover/item:text-white transition-all shadow-sm">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase text-gray-800 leading-tight">{title}</span>
      <span className="text-[8px] font-bold text-gray-400 uppercase">{subtitle}</span>
    </div>
  </Link>
);

export default Header;