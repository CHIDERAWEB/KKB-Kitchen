import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronDown, FiMenu, FiX, FiHeart, FiCalendar,
  FiShoppingCart, FiPlusCircle, FiHome, FiInfo,
  FiShield, FiSearch, FiLogOut, FiLayers, FiUser
} from 'react-icons/fi';
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

  // Sync User Auth
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  // Fetch Admin Notifications
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
          console.error("Notification fetch failed");
        }
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close Dropdowns on Click Outside
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
  ];

  const handleLinkClick = (href) => {
    navigate(href);
    setDiscoverOpen(false);
    setKitchenOpen(false);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="flex items-center">
      {/* --- DESKTOP NAVIGATION --- */}
      <div className="hidden lg:flex items-center gap-8 mr-6">
        <Link to="/home" className="text-gray-600 font-bold hover:text-orange-600 text-sm uppercase tracking-widest transition-colors">Home</Link>
        <Link to="/about" className="text-gray-600 font-bold hover:text-orange-600 text-sm uppercase tracking-widest transition-colors">About</Link>

        {/* Discover Dropdown */}
        <div className="relative" ref={discoverRef}>
          <button onClick={() => setDiscoverOpen(!discoverOpen)} className="flex items-center text-gray-600 font-bold hover:text-orange-600 text-sm uppercase tracking-widest">
            Discover <FiChevronDown className={`ml-1 transition-transform ${discoverOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {discoverOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 mt-4 w-48 bg-white rounded-2xl shadow-2xl z-[150] border p-2">
                {mealTypes.map((item) => (
                  <button key={item.name} onClick={() => handleLinkClick(item.href)} className="block w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all">{item.name}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kitchen Dropdown */}
        <div className="relative" ref={kitchenRef}>
          <button onClick={() => setKitchenOpen(!kitchenOpen)} className="flex items-center text-gray-600 font-bold hover:text-orange-600 text-sm uppercase tracking-widest">
            Kitchen <FiChevronDown className={`ml-1 transition-transform ${kitchenOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {kitchenOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl z-[150] border p-2">
                <button onClick={() => handleLinkClick('/favorites')} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiHeart className="text-red-500" /> Favorites</button>
                <button onClick={() => handleLinkClick('/planner')} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiCalendar className="text-blue-500" /> Planner</button>
                <button onClick={() => handleLinkClick('/shopping-list')} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiShoppingCart className="text-green-500" /> Shopping List</button>
                <button onClick={() => handleLinkClick('/create')} className="mt-2 flex items-center gap-3 w-full px-4 py-3 text-sm font-black text-orange-600 bg-orange-50 rounded-xl transition-all"><FiPlusCircle /> CREATE RECIPE</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MOBILE HAMBURGER BUTTON --- */}
      <div className="lg:hidden relative">
        <button onClick={() => setMobileMenuOpen(true)} className="text-gray-900 text-3xl p-2 active:scale-90 transition-transform relative">
          <FiMenu />
          {!mobileMenuOpen && user?.role === 'admin' && pendingCount > 0 && (
            <span className="absolute top-2 right-2 h-3 w-3 bg-red-600 border-2 border-white rounded-full" />
          )}
        </button>
      </div>

      {/* --- FULL SCREEN MOBILE MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[300] flex flex-col p-6 lg:hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <span className="font-signature text-3xl text-orange-600">KKB Kitchen</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-900"><FiX size={24} /></button>
            </div>

            {/* Admin & Create Shortcut */}
            <div className="flex flex-col gap-3 mb-8">
              {user?.role === 'admin' && (
                <button onClick={() => handleLinkClick('/admin')} className="w-full bg-purple-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
                  <span className="flex items-center gap-3 font-bold text-sm uppercase tracking-wider"><FiShield size={20} /> Admin Panel</span>
                  {pendingCount > 0 && <span className="bg-red-500 px-2 py-0.5 rounded-full text-[10px] font-black">{pendingCount}</span>}
                </button>
              )}
              <button onClick={() => handleLinkClick('/create')} className="w-full bg-orange-600 text-white p-4 rounded-2xl flex items-center gap-3 font-bold text-sm uppercase tracking-wider shadow-lg">
                <FiPlusCircle size={20} /> Create New Recipe
              </button>
            </div>

            {/* Scrollable Links */}
            <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Main Menu</p>
              <MobileLink icon={<FiHome />} label="Home" onClick={() => handleLinkClick('/home')} />
              <MobileLink icon={<FiLayers />} label="Discover" onClick={() => handleLinkClick('/discover')} />

              <div className="my-4 border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">My Kitchen</p>
                <MobileLink icon={<FiHeart />} label="Favorites" onClick={() => handleLinkClick('/favorites')} />
                <MobileLink icon={<FiCalendar />} label="Meal Planner" onClick={() => handleLinkClick('/planner')} />
                <MobileLink icon={<FiShoppingCart />} label="Shopping List" onClick={() => handleLinkClick('/shopping-list')} />
                <MobileLink icon={<FiInfo />} label="About KKB" onClick={() => handleLinkClick('/about')} />
              </div>
            </div>

            {/* Mobile Footer Profile */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}`} className="w-12 h-12 rounded-full border-2 border-orange-500 p-0.5" alt="user" />
                <div>
                  <p className="font-black text-gray-800 text-sm uppercase">Chef {user?.name?.split(' ')[0]}</p>
                  <button onClick={() => handleLinkClick('/profile')} className="text-[10px] text-orange-600 font-bold uppercase">View Profile</button>
                </div>
              </div>
              <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 text-sm bg-red-50 px-4 py-2 rounded-xl"><FiLogOut /> Logout</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component for Mobile Links
const MobileLink = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-4 w-full p-4 text-gray-700 font-bold text-lg active:bg-orange-50 rounded-2xl transition-all">
    <span className="text-orange-500 text-xl">{icon}</span> {label}
  </button>
);

export default Navbar;