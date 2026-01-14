import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiLogOut, FiPlusCircle, FiUser, FiEye, FiTrendingUp, FiX, FiChevronRight, FiShield, FiClock } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import image from '../assets/image.png';
import Navbar from './Navbar';

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
    setRecentSearches(JSON.parse(localStorage.getItem('recentSearches') || '[]'));
  }, []);

  // Fetch Pending Count for Red Notification
  useEffect(() => {
    const fetchPending = async () => {
      const token = localStorage.getItem('token');
      if (user?.role === 'admin' && token) {
        try {
          const res = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/pending-count', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          setPendingCount(data.count || 0);
        } catch (err) { console.error(err); }
      }
    };
    fetchPending();
  }, [user]);

  // Handle Search Input
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/search?query=${query}`);
        const data = await res.json();
        setSearchResults(data);
      } else { setSearchResults([]); }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <motion.header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">

        {/* BRANDING (Always Visible) */}
        {!searchOpen && (
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={image} alt="Logo" className="h-10 w-auto" />
            <div className="hidden sm:flex flex-col -space-y-3">
              <span className="font-signature text-4xl text-orange-600">KKB</span>
            </div>
          </Link>
        )}

        {/* EXPANDABLE SEARCH BAR */}
        <div className={`relative flex items-center transition-all duration-300 ${searchOpen ? 'flex-1' : 'w-10 md:w-48'}`}>
          <motion.div
            animate={{ width: searchOpen ? "100%" : "100%" }}
            className={`flex items-center bg-gray-50 border border-gray-100 rounded-full transition-all ${searchOpen ? 'ring-2 ring-orange-500 bg-white' : ''}`}
          >
            <button
              onClick={() => setSearchOpen(true)}
              className="p-3 text-gray-400 hover:text-orange-600"
            >
              <FiSearch size={20} />
            </button>

            {searchOpen && (
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search flavors..."
                className="w-full bg-transparent outline-none py-2 px-1 text-sm font-bold"
              />
            )}

            {searchOpen && (
              <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="p-3 text-gray-400 hover:text-red-500">
                <FiX size={18} />
              </button>
            )}
          </motion.div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchOpen && query.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-14 left-0 w-full bg-white rounded-3xl shadow-2xl border p-2 z-[110]">
                {searchResults.map(r => (
                  <div key={r.id} onClick={() => { navigate(`/Recipejollofdetail/${r.id}`); setSearchOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-2xl cursor-pointer">
                    <img src={r.imageUrl} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-bold text-gray-700">{r.title}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIONS & USER (Hides branding on small screens when searching) */}
        {!searchOpen && (
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {isLoggedIn ? (
              <>
                {/* 🔴 ADMIN CONSOLE (With Red Dot) */}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="relative p-2.5 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-600 hover:text-white transition-all">
                    <FiShield size={20} />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 bg-red-600 text-[8px] text-white items-center justify-center rounded-full border-2 border-white animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* USER INFO */}
                <div className="flex items-center gap-2 bg-orange-50 px-2 py-1.5 rounded-full border border-orange-100">
                  <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}`} className="h-7 w-7 rounded-full object-cover" />
                  <span className="hidden md:inline text-[10px] font-black uppercase text-gray-700 italic">Chef {user?.name?.split(' ')[0]}</span>
                </div>

                <button onClick={handleLogout} className="p-2.5 bg-gray-100 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/register" className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase shadow-lg">Join</Link>
            )}

            {/* The Rest of the Navigation Links */}
            <Navbar />
          </div>
        )}
      </div>
    </motion.header>
  );
}

export default Header;