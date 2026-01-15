import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiX, FiChevronDown, FiPlusCircle, FiHeart,
  FiCoffee, FiSmile, FiZap, FiBarChart2, FiLogOut,
  FiLayout, FiUser, FiCheckCircle
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
  const [searchResults, setSearchResults] = useState([]); // Added for results
  const [isSearching, setIsSearching] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const [user, setUser] = useState({
    name: "Chef KKB",
    role: "admin",
    picture: "https://ui-avatars.com/api/?name=Chef+KKB&background=ea580c&color=fff",
    token: localStorage.getItem('token')
  });

  // --- SEARCH LOGIC ---
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
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    const handleNotification = (data, messagePrefix) => {
      setToastMessage(`${messagePrefix}: "${data.title}"`);
      setShowToast(true);
      if (user?.role === 'admin') fetchAdminStats();
      setTimeout(() => setShowToast(false), 5000);
    };

    socket.on("recipeApproved", (data) => handleNotification(data, "Recipe Approved"));
    socket.on("recipeCreated", (data) => handleNotification(data, "New Recipe Created"));

    return () => {
      socket.off("recipeApproved");
      socket.off("recipeCreated");
    };
  }, [user]);

  const fetchAdminStats = async () => {
    if (!user?.token) return;
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
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col items-center z-[100] px-4 py-6 pointer-events-none">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 90, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute bg-white border border-green-100 shadow-2xl px-6 py-4 rounded-[2rem] flex items-center gap-4 pointer-events-auto z-[110]"
          >
            <div className="bg-green-100 p-2 rounded-full text-green-600"><FiCheckCircle size={20} /></div>
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
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <motion.img whileHover={{ scale: 1.1, rotate: 5 }} src={image} alt="Logo" className="h-10 w-auto" />
          <div className="flex flex-col -space-y-4">
            <span className="font-signature text-5xl text-orange-600">KKB</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        <motion.nav
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex items-center justify-center gap-10 flex-1 h-full"
        >
          <motion.div variants={navItemVariants}><NavLink to="/" label="Home" /></motion.div>
          <motion.div variants={navItemVariants}><NavLink to="/about" label="About" /></motion.div>

          {/* DISCOVER DROPDOWN */}
          <motion.div variants={navItemVariants} className="relative group h-full flex items-center">
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="nav-link group-hover:text-orange-600 transition-all">Discover</span>
              <FiChevronDown className="text-gray-400 group-hover:rotate-180 transition-transform duration-300 group-hover:text-orange-600" />
            </div>
            <div className="dropdown-menu">
              <DropdownItem to="/discover?cat=junk" icon={<FiSmile />} title="Junk" subtitle="Quick Treats" />
              <DropdownItem to="/discover?cat=breakfast" icon={<FiCoffee />} title="Breakfast" subtitle="Morning Vibes" />
              <DropdownItem to="/discover?cat=dinner" icon={<FiZap />} title="Dinner" subtitle="Night Specials" />
            </div>
          </motion.div>

          {/* KITCHEN DROPDOWN */}
          <motion.div variants={navItemVariants} className="relative group h-full flex items-center">
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="nav-link group-hover:text-orange-600 transition-all">Kitchen</span>
              <FiChevronDown className="text-gray-400 group-hover:rotate-180 transition-transform duration-300 group-hover:text-orange-600" />
            </div>
            <div className="dropdown-menu">
              <DropdownItem to="/create" icon={<FiPlusCircle />} title="Create" subtitle="New magic" />
              <DropdownItem to="/favorites" icon={<FiHeart />} title="Favourite" subtitle="Your Loves" />
              <DropdownItem to="/planner" icon={<FiBarChart2 />} title="Meal Planner" subtitle="Schedule" />
            </div>
          </motion.div>
        </motion.nav>

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
                      <span className="relative flex items-center justify-center rounded-full h-4 w-4 bg-red-600 text-white font-black text-[8px]">{pendingCount}</span>
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
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="absolute top-[120%] right-0 w-64 bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 p-3 z-[300]">
                    <DropdownItem to="/admin" icon={<FiLayout />} title="Admin Panel" subtitle="Manage" />
                    <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 hover:bg-red-50 rounded-[1.8rem] transition-all text-left">
                      <div className="p-2.5 bg-red-100 text-red-500 rounded-xl"><FiLogOut size={18} /></div>
                      <span className="text-[10px] font-black uppercase text-gray-800">Logout</span>
                    </button>
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
            <motion.div ref={searchWrapperRef} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-[115%] left-0 right-0 flex justify-center pointer-events-auto px-4">
              <div className="w-full max-w-5xl bg-white rounded-[3.5rem] shadow-2xl border border-orange-50 overflow-hidden">
                <div className="p-8 flex items-center border-b border-gray-50 bg-gray-50/20">
                  <FiZap className={isSearching ? "animate-pulse text-orange-500" : "text-gray-300"} size={26} />
                  <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes..." className="w-full px-6 h-14 outline-none font-bold text-gray-800 bg-transparent text-xl" />
                  <FiX onClick={() => { setSearchOpen(false); setQuery(""); setSearchResults([]) }} className="cursor-pointer text-gray-300 hover:text-red-500" size={30} />
                </div>
                {/* SEARCH RESULTS LIST */}
                {searchResults.length > 0 && (
                  <div className="max-h-[400px] overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {searchResults.map((recipe) => (
                      <Link key={recipe._id} to={`/recipe/${recipe._id}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-2xl transition-all">
                        <img src={recipe.image} className="w-12 h-12 rounded-xl object-cover" alt={recipe.title} />
                        <div>
                          <p className="text-sm font-black text-gray-800">{recipe.title}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{recipe.category}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <style>{`
        .nav-link { @apply text-[11px] font-black uppercase text-gray-400 transition-colors tracking-[0.2em] cursor-pointer; }
        .dropdown-menu { 
          @apply absolute top-[60px] left-1/2 -translate-x-1/2 w-[280px] bg-white rounded-[2.5rem] shadow-2xl 
          border border-gray-100 p-3 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible 
          group-hover:translate-y-0 transition-all duration-300 ease-out z-[200] pointer-events-auto; 
        }
      `}</style>
    </div>
  );
}

const NavLink = ({ to, label }) => (
  <Link to={to} className="relative group py-2">
    <motion.span whileHover={{ y: -2 }} className="nav-link inline-block">{label}</motion.span>
    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full" />
  </Link>
);

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