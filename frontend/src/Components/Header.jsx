import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUserPlus, FiClock, FiLogOut, FiPlusCircle, FiUser, FiEye, FiTrendingUp, FiX, FiChevronRight, FiShield } from 'react-icons/fi';
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

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const savedSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setUser(parsedUser);
    }
    setRecentSearches(savedSearches);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        try {
          const response = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/search?query=${query}`);
          const data = await response.json();
          setSearchResults(data);
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (recipe) => {
    const updatedRecent = [recipe.title, ...recentSearches.filter(s => s !== recipe.title)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    navigate(`/Recipejollofdetail/${recipe.id}`);
    setSearchOpen(false);
    setQuery("");
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between gap-4">

          {/* BRANDING */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img src={image} alt="Logo" className="h-10 w-auto group-hover:rotate-12 transition-transform" />
            <div className="hidden sm:flex flex-col -space-y-3">
              <span className="font-signature text-4xl text-orange-600">KKB</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Recipes</span>
            </div>
          </Link>

          {/* SEARCH & ACTIONS */}
          <div ref={containerRef} className="flex-1 flex justify-center items-center gap-4 relative">
            <AnimatePresence>
              {searchOpen && (
                <div className="absolute w-full max-w-[500px] top-0">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex items-center bg-white border-2 border-orange-500 rounded-[2rem] shadow-2xl overflow-hidden px-4 py-1"
                  >
                    <FiSearch className="text-orange-500" size={20} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for Jollof, Pasta, or Chefs..."
                      className="w-full bg-transparent outline-none py-3 px-3 text-sm font-bold text-gray-700"
                    />
                    <button onClick={() => { setSearchOpen(false); setQuery("") }}>
                      <FiX className="text-gray-400 hover:text-red-500" size={20} />
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-16 left-0 w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden z-[110] p-3"
                  >
                    {query.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Results</p>
                        {searchResults.length > 0 ? searchResults.map(r => (
                          <div
                            key={r.id}
                            onClick={() => handleResultClick(r)}
                            className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-3xl cursor-pointer group transition-all"
                          >
                            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-gray-100 relative">
                              <img src={r.imageUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                              {r.views > 50 && <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-gray-800 italic">{r.title}</span>
                                {r.views > 50 && <span className="bg-orange-100 text-orange-600 text-[8px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1"><FiTrendingUp /> Trending</span>}
                              </div>
                              <div className="flex gap-3 mt-1">
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase"><FiClock /> {r.time || '30m'}</span>
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase"><FiEye /> {r.views || 0}</span>
                              </div>
                            </div>
                            <FiChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                          </div>
                        )) : (
                          <div className="p-8 text-center font-signature text-2xl text-gray-400 italic">No flavors found...</div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4">
                        <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recent Searches</p>
                        <div className="flex flex-wrap gap-2 px-2">
                          {recentSearches.length > 0 ? recentSearches.map((s, i) => (
                            <button key={i} onClick={() => setQuery(s)} className="bg-gray-100 hover:bg-orange-100 hover:text-orange-600 px-4 py-2 rounded-full text-xs font-bold text-gray-600 transition-all">
                              {s}
                            </button>
                          )) : <p className="text-xs font-bold text-gray-300 px-2 italic">Search something delicious...</p>}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {!searchOpen && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-5 py-2.5 rounded-full hover:border-orange-500 group transition-all"
                >
                  <FiSearch className="text-gray-400 group-hover:text-orange-500" />
                  <span className="text-sm font-bold text-gray-400">Search recipes...</span>
                </button>

                {isLoggedIn ? (
                  <div className="flex items-center gap-2">

                    {/* FIXED: ADMIN BUTTON (Shows only if role is admin) */}
                    {/* {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-full font-bold text-[10px] uppercase hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">
                        <FiShield /> Admin Console
                      </Link>
                    )} */}

                    {/* FIXED: GOOGLE IMAGE DISPLAY */}
                    {/* <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full shadow-sm">
                      <div className="h-7 w-7 rounded-full overflow-hidden border border-orange-200 bg-white">
                        {user?.picture ? (
                          <img src={user.picture} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-orange-100 text-orange-600">
                            <FiUser size={14} />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-black uppercase text-gray-700 italic pr-1">Chef {user?.name?.split(' ')[0]}</span>
                    </div> */}

                    {/* <Link to="/upload-recipe" className="hidden md:flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full font-bold text-[10px] uppercase hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                      <FiPlusCircle /> Upload
                    </Link> */}

                    {/* <button onClick={handleLogout} className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all">
                      <FiLogOut size={18} />
                    </button> */}
                  </div>
                ) : (
                  // <Link to="/register" className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-200">
                  //   Join Kitchen
                  // </Link>
                )}
              </div>
            )}
          </div>
          <Navbar />
        </div>
      </div>
    </motion.header>
  );
}

export default Header;