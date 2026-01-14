import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMenu, FiX, FiHeart, FiCalendar, FiShoppingCart, FiInfo, FiLogOut, FiUser, FiShield } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [kitchenOpen, setKitchenOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [user, setUser] = useState(null);

  const discoverRef = useRef(null);
  const kitchenRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Auth sync error:", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const token = localStorage.getItem('token');
      if (user?.role === 'admin' && token) {
        try {
          const response = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/pending-count', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setPendingCount(data.count || 0);
        } catch (err) {
          console.error("Notification count fetch failed");
        }
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (discoverRef.current && !discoverRef.current.contains(event.target)) setDiscoverOpen(false);
      if (kitchenRef.current && !kitchenRef.current.contains(event.target)) setKitchenOpen(false);
      if (userRef.current && !userRef.current.contains(event.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mealTypes = [
    { name: 'Breakfast', href: '/discover/breakfast' },
    { name: 'Lunch', href: '/discover/lunch' },
    { name: 'Dinner', href: '/discover/dinner' },
    { name: 'Dessert', href: '/discover/dessert' },
    { name: 'Snack', href: '/discover/snack' },
    { name: 'Junks', href: '/discover/junks' },
  ];

  const handleLinkClick = (href) => {
    navigate(href);
    setDiscoverOpen(false);
    setKitchenOpen(false);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-white">
      {/* --- DESKTOP NAVIGATION --- */}
      <div className="hidden lg:flex items-center gap-8 font-sans">

        {/* Home & About - Always Visible */}
        <Link to="/home" className="text-gray-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wider">Home</Link>
        <Link to="/about" className="text-gray-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wider">About</Link>

        {/* Discover Dropdown */}
        <div className="relative" ref={discoverRef}>
          <button
            onClick={() => setDiscoverOpen(!discoverOpen)}
            className="flex items-center text-gray-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wider"
          >
            Discover <FiChevronDown className={`ml-1 transition-transform ${discoverOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {discoverOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 mt-4 w-48 bg-white rounded-2xl shadow-2xl z-[150] border border-gray-100 p-2 overflow-hidden">
                {mealTypes.map((item) => (
                  <button key={item.name} onClick={() => handleLinkClick(item.href)} className="block w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all">{item.name}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Kitchen Dropdown */}
        <div className="relative" ref={kitchenRef}>
          <button
            onClick={() => setKitchenOpen(!kitchenOpen)}
            className="flex items-center text-gray-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wider"
          >
            My Kitchen <FiChevronDown className={`ml-1 transition-transform ${kitchenOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {kitchenOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl z-[150] border border-gray-100 p-2">
                <button onClick={() => handleLinkClick('/favorites')} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiHeart className="text-red-500" /> Favorites</button>
                <button onClick={() => handleLinkClick('/planner')} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiCalendar className="text-blue-500" /> Meal Planner</button>
                <button onClick={() => handleLinkClick('/shopping-list')} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiShoppingCart className="text-green-500" /> Shopping List</button>
                <button onClick={() => handleLinkClick('/create')} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all uppercase tracking-wider text-orange-600">Create Recipe</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- AUTHENTICATION & USER MENU --- */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="relative flex items-center gap-3 p-1 pr-4 bg-white rounded-full hover:bg-orange-50 transition-all border border-gray-100 hover:border-orange-200 shadow-sm"
            >
              {/* 🔴 THE BIG RED NOTIFICATION DOT */}
              {user?.role === 'admin' && pendingCount > 0 && (
                <span className="flex h-3 w-3 shrink-0 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse ml-2" />
              )}

              {/* <img
                src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=f97316&color=fff`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
              />
              <span className="text-sm font-bold text-gray-700 uppercase">CHEF {user.name?.split(' ')[0]}</span>
              <FiChevronDown className={`text-gray-400 text-xs transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} /> */}
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-4 w-52 bg-white rounded-2xl shadow-2xl z-[150] border border-gray-100 p-2 overflow-hidden"
                >
                  {user?.role === 'admin' && (
                    <button onClick={() => handleLinkClick('/admin')} className="flex items-center justify-between w-full px-4 py-3 text-sm font-black text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                      <div className="flex items-center gap-3"><FiShield /> Admin</div>
                      {pendingCount > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount} NEW</span>}
                    </button>
                  )}

                  <button onClick={() => handleLinkClick('/profile')} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all">
                    <FiUser className="text-orange-500" /> My Profile
                  </button>

                  <div className="h-px bg-gray-100 my-1 mx-2" />

                  <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <FiLogOut /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="text-gray-400 font-black hover:text-gray-900 transition-colors text-xs uppercase tracking-[0.2em]">Login</Link>
            <Link to="/register" className="rounded-full bg-orange-600 px-8 py-3 font-black text-white text-xs uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-700 hover:-translate-y-0.5 transition-all">Join KKB</Link>
          </div>
        )}

        {/* --- MOBILE HAMBURGER --- */}
        <div className="lg:hidden relative">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-900 text-3xl p-2 transition-transform active:scale-90">
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
            {!mobileMenuOpen && user?.role === 'admin' && pendingCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 border-2 border-white rounded-full" />
            )}
          </button>
        </div>
      </div>


      {/* <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[80%] bg-white shadow-2xl lg:hidden z-[200] p-8 flex flex-col"
          >
            <div className="flex justify-end mb-8">
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-900"><FiX size={24} /></button>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto">
              <button onClick={() => handleLinkClick('/home')} className="text-left text-2xl font-black text-gray-900">Home</button>
              <button onClick={() => handleLinkClick('/about')} className="text-left text-2xl font-black text-gray-900 flex items-center gap-3">
                About <FiInfo className="text-orange-500" size={20} />
              </button>

              <div className="h-px w-full bg-gray-100 my-2" />

              <button onClick={() => handleLinkClick('/favorites')} className="text-left text-lg font-bold text-gray-600">My Favorites</button>
              <button onClick={() => handleLinkClick('/planner')} className="text-left text-lg font-bold text-gray-600">Meal Planner</button>
              <button onClick={() => handleLinkClick('/create')} className="text-left text-lg font-bold text-orange-600">Create Recipe</button>

              {!user ? (
                <div className="mt-auto space-y-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-4 font-black text-gray-400 uppercase tracking-widest">Login</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-orange-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-orange-100">Register</Link>
                </div>
              ) : (
                <div className="mt-auto flex flex-col gap-4">
                  {user?.role === 'admin' && (
                    <button onClick={() => handleLinkClick('/admin')} className="text-xl font-black text-purple-600 flex items-center justify-between">
                      Admin Panel {pendingCount > 0 && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{pendingCount}</span>}
                    </button>
                  )}
                  <button onClick={handleLogout} className="text-left text-xl font-black text-red-500">Logout</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default Navbar;

