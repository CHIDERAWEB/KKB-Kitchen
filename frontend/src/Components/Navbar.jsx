import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMenu, FiX, FiHeart, FiCalendar, FiShoppingCart, FiInfo, FiLogOut, FiUser, FiShield, FiPlusCircle } from 'react-icons/fi';
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

  // Sync user state with LocalStorage on every route change
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Auth sync error:", err);
        handleLogout();
      }
    } else {
      setUser(null);
    }
  }, [location]);

  // Admin Notification Polling
  useEffect(() => {
    let interval;
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
    interval = setInterval(fetchPendingCount, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (discoverRef.current && !discoverRef.current.contains(event.target)) setDiscoverOpen(false);
      if (kitchenRef.current && !kitchenRef.current.contains(event.target)) setKitchenOpen(false);
      if (userRef.current && !userRef.current.contains(event.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (href) => {
    setDiscoverOpen(false);
    setKitchenOpen(false);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo(0, 0);
    navigate(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    navigate('/login');
  };

  const mealTypes = [
    { name: 'Breakfast', href: '/discover/breakfast' },
    { name: 'Lunch', href: '/discover/lunch' },
    { name: 'Dinner', href: '/discover/dinner' },
    { name: 'Dessert', href: '/discover/dessert' },
    { name: 'Snack', href: '/discover/snack' },
    { name: 'Junks', href: '/discover/junks' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-[50] border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* LOGO SECTION */}
        <Link to="/" className="text-2xl font-black text-orange-600 tracking-tighter">
          KKB<span className="text-gray-900">.</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-8 font-sans">
          <div className="relative" ref={discoverRef}>
            <button onClick={() => setDiscoverOpen(!discoverOpen)} className="flex items-center text-gray-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wider">
              Discover <FiChevronDown className={`ml-1 transition-transform ${discoverOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {discoverOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 mt-4 w-48 bg-white rounded-2xl shadow-2xl z-[100] border border-gray-100 p-2">
                  {mealTypes.map((item) => (
                    <button key={item.name} onClick={() => handleLinkClick(item.href)} className="block w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all">{item.name}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={kitchenRef}>
            <button onClick={() => setKitchenOpen(!kitchenOpen)} className="flex items-center text-gray-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wider">
              My Kitchen <FiChevronDown className={`ml-1 transition-transform ${kitchenOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {kitchenOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl z-[100] border border-gray-100 p-2">
                  <button onClick={() => handleLinkClick('/favorites')} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiHeart className="text-red-500" /> Favorites</button>
                  <button onClick={() => handleLinkClick('/planner')} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiCalendar className="text-blue-500" /> Meal Planner</button>
                  <button onClick={() => handleLinkClick('/shopping-list')} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-all"><FiShoppingCart className="text-green-500" /> Shopping List</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/about" className="text-gray-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wider">About</Link>
          <Link to="/create" className="flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors text-sm uppercase tracking-wider">
            <FiPlusCircle /> Create
          </Link>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          {user ? (
            <div className="relative" ref={userRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="relative flex items-center gap-3 p-1 pr-4 bg-white rounded-full hover:bg-orange-50 transition-all border border-gray-100 shadow-sm">
                <img src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=f97316&color=fff`} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm font-bold text-gray-700 uppercase">CHEF {user.name?.split(' ')[0]}</span>
                {user.role === 'admin' && pendingCount > 0 && <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold animate-bounce">{pendingCount}</span>}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-52 bg-white rounded-2xl shadow-2xl z-[100] border border-gray-100 p-2">
                    {user.role === 'admin' && (
                      <button onClick={() => handleLinkClick('/admin')} className="flex items-center justify-between w-full px-4 py-3 text-sm font-black text-purple-600 hover:bg-purple-50 rounded-xl">
                        <span className="flex items-center gap-3"><FiShield /> Admin</span>
                        {pendingCount > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount}</span>}
                      </button>
                    )}
                    <button onClick={() => handleLinkClick('/profile')} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 rounded-xl"><FiUser className="text-orange-500" /> My Profile</button>
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl"><FiLogOut /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-400 font-black hover:text-gray-900 text-xs uppercase tracking-widest">Login</Link>
              <Link to="/register" className="rounded-full bg-orange-600 px-6 py-2.5 font-black text-white text-xs uppercase tracking-widest shadow-md hover:bg-orange-700 transition-all">Join KKB</Link>
            </div>
          )}
        </div>

        {/* MOBILE TRIGGER */}
        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-900 text-2xl relative">
          <FiMenu />
          {user?.role === 'admin' && pendingCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white" />}
        </button>

      </div>

      {/* MOBILE MENU PANEL (Same as your previous logic, updated with handleLinkClick) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 bg-white z-[200] p-8 flex flex-col lg:hidden">
            <div className="flex justify-end mb-8">
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full"><FiX size={24} /></button>
            </div>
            {/* Mobile links go here - ensure they use handleLinkClick */}
            <div className="flex flex-col gap-6 text-2xl font-black text-gray-900">
              <button onClick={() => handleLinkClick('/')} className="text-left">Home</button>
              <button onClick={() => handleLinkClick('/about')} className="text-left">About</button>
              <button onClick={() => handleLinkClick('/create')} className="text-left text-orange-600">Create Recipe</button>
              <div className="h-px bg-gray-100 w-full" />
              {user ? (
                <>
                  <button onClick={() => handleLinkClick('/profile')} className="text-left text-gray-500 text-lg">My Profile</button>
                  <button onClick={handleLogout} className="text-left text-red-500 text-lg">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleLinkClick('/login')} className="text-left text-gray-500 text-lg">Login</button>
                  <button onClick={() => handleLinkClick('/register')} className="text-left text-orange-600 text-lg">Register</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;