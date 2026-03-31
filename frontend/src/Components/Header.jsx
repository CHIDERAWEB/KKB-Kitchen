import { AnimatePresence, motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCoffee,
  FiHeart,
  FiLayout,
  FiLock,
  FiLogOut,
  FiPlusCircle,
  FiSearch,
  FiShoppingCart,
  FiSmile,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import image from "../assets/image.png";
import Navbar from "./Navbar";
const socket = io("https://kkb-kitchen-api.onrender.com");

const navContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

function Header({ setShowChefModal }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [user, setUser] = useState(null);

  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem("recentSearches") || "[]");
  });

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const syncUser = useCallback(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser({
        ...savedUser,
        displayName: savedUser.name?.toLowerCase().startsWith("USER")
          ? savedUser.name
          : `${savedUser.name?.split(" ")[0] || "KKB"}`,
        picture:
          savedUser.picture ||
          savedUser.avatar ||
          `https://ui-avatars.com/api/?name=${savedUser.name}&background=ea580c&color=fff`,
        token,
      });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    syncUser();
  }, [location.pathname, syncUser]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://kkb-kitchen-api.onrender.com/api/recipes/search?q=${query}`
        );
        const data = await res.json();
        // Check if data is an array before setting
        setSearchResults(Array.isArray(data) ? data : []);

        if (data.length > 0) {
          setRecentSearches((prev) => {
            const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5);
            localStorage.setItem("recentSearches", JSON.stringify(updated));
            return updated;
          });
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

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleLogout = () => {
    localStorage.setItem("was_user_before", "true");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col items-center z-[100] pointer-events-none lg:pt-6">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 90, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute bg-white border border-orange-100 shadow-2xl px-6 py-4 rounded-[2rem] flex items-center gap-4 pointer-events-auto z-[110]"
          >
            <div className={`p-2 rounded-full ${user ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
              {user ? <FiCheckCircle size={20} /> : <FiLock size={20} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-800 tracking-tight">KKB Mastery</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full h-16 px-4 bg-white/80 backdrop-blur-xl border-b border-white/20 lg:max-w-[95%] lg:h-20 lg:px-8 lg:rounded-[2.5rem] lg:border lg:bg-white/95 lg:shadow-2xl flex items-center justify-between pointer-events-auto relative transition-all duration-300"
      >
        {/* LEFT: LOGO */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={image} alt="Logo" className="h-8 lg:h-10 w-auto" />
          <div className="flex flex-col -space-y-3 lg:-space-y-4">
            <span className="font-signature text-3xl lg:text-5xl text-orange-600">KKB</span>
            <span className="text-[7px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1 italic">Mastery</span>
          </div>
        </Link>

        {/* CENTER: NAV */}
        <motion.nav
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex items-center justify-center gap-10 flex-1 h-full"
        >
          <motion.div variants={navItemVariants}><Link to="/" className="nav-link">Home</Link></motion.div>
          <motion.div variants={navItemVariants}><Link to="/about" className="nav-link">About</Link></motion.div>

          <motion.div variants={navItemVariants} className="relative group h-full flex items-center">
            <div className="flex items-center gap-1 cursor-pointer py-2 group-hover:text-orange-600 transition-all">
              <span className="nav-link">Discover</span>
              <FiChevronDown className="text-gray-400 transition-transform duration-300 group-hover:rotate-180" />
            </div>
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <DropdownItem to="/discover?cat=junk" icon={<FiSmile />} title="Junk" subtitle="Quick Treats" />
              <DropdownItem to="/discover?cat=breakfast" icon={<FiCoffee />} title="Breakfast" subtitle="Morning Vibes" />
              <DropdownItem to="/discover?cat=dinner" icon={<FiZap />} title="Dinner" subtitle="Night Specials" />
            </div>
          </motion.div>

          <motion.div variants={navItemVariants} className="relative group h-full flex items-center">
            <div className="flex items-center gap-1 cursor-pointer py-2 group-hover:text-orange-600 transition-all">
              <span className="nav-link">Kitchen</span>
              <FiChevronDown className="text-gray-400 transition-transform duration-300 group-hover:rotate-180" />
            </div>
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              {(user?.role === "chef" || user?.role === "admin") && (
                <DropdownItem to="/create" icon={<FiPlusCircle />} title="Create" subtitle="Post New Recipe" />
              )}
              <DropdownItem to="/favorites" icon={<FiHeart />} title="Favourite" subtitle="Your Loves" />
              <DropdownItem to="/planner" icon={<FiBarChart2 />} title="Meal Planner" subtitle="Schedule" />
            </div>
          </motion.div>
        </motion.nav>

        {/* RIGHT: ACTIONS (FIXED) */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          {/* SEARCH */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-2.5 rounded-2xl transition-all ${searchOpen ? "bg-orange-600 text-white shadow-lg" : "bg-orange-50 text-orange-600"}`}
          >
            <FiSearch size={20} />
          </motion.button>

          {/* NOTIFICATION (ADDED BACK) */}


          {/* CART (ADDED BACK) */}
          {user?.role !== "admin" && (
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => navigate("/cart")}
              className="p-2.5 bg-orange-50 text-gray-600 rounded-2xl hover:text-orange-500 transition-all relative"
            >
              <FiShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                0
              </span>
            </motion.button>
          )}

          {/* PROFILE / JOIN */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 bg-white border border-gray-100 p-1 pr-3 rounded-full shadow-sm">
                <img src={user.picture} className="h-8 w-8 rounded-full object-cover" alt="User" />
                <div className="text-left hidden md:block">
                  <p className="text-[9px] font-black uppercase text-gray-800 leading-none">{user.displayName}</p>
                  <p className="text-[7px] font-bold text-orange-500 uppercase">{user.role}</p>
                </div>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[120%] right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-1.5 z-[200]"
                  >
                    {user.role === "admin" && <DropdownItem to="/admin" icon={<FiLayout />} title="Admin Panel" subtitle="Manage" />}
                    {user.role === "chef" && <DropdownItem to="/notifiction" icon={<FinalizationRegistry />} title="notifiction panel" subtitle="Manage" />}
                    {user.role === "chef" && <DropdownItem to="/chef-dashboard" icon={<ChefHat />} title="Chef Studio" subtitle="Recipes" />}

                    <motion.button
                      whileHover={{ backgroundColor: "#f9fafb" }} // Matches standard dropdown hover
                      onClick={() => navigate("/chef-application")}
                      className="flex items-center w-full p-2 transition-all rounded-xl gap-3"
                    >
                      {/* Icon Container - Balanced with DropdownItem style */}
                      <div className="relative flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg text-red-600 flex-shrink-0">
                        <FiBookOpen size={20} />
                        {/* Notification Dot */}
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full  opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                      </div>

                      {/* Text Container - Exact alignment with Admin Panel */}
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-semibold text-gray-900 leading-tight truncate">
                          Chef Application
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
                          Join the community
                        </span>
                      </div>
                    </motion.button>

                    <div className="my-1 border-t border-gray-100" /> {/* Tiny separator line */}

                    {/* Logout */}
                    <motion.button
                      whileHover={{ backgroundColor: "#fff1f2" }}
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-2.5 transition-all rounded-xl text-red-500 text-sm font-semibold"
                    >
                      <FiLogOut size={18} className="ml-1" />
                      <span>Logout</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-[10px] font-black uppercase text-gray-400 hover:text-orange-600 px-2 transition-colors">Login</Link>
              <Link to="/register" className="bg-orange-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Join</Link>
            </div>
          )}

          <Navbar user={user} setShowChefModal={setShowChefModal} />
        </div>

        {/* SEARCH OVERLAY (FIXED UNDEFINED ERROR) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div ref={searchWrapperRef} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-[110%] left-0 right-0 px-4">
              <div className="w-full max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-orange-50 overflow-hidden pointer-events-auto">
                <div className="p-6 flex items-center gap-4 border-b">
                  <FiSearch className={isSearching ? "animate-pulse text-orange-500" : "text-gray-300"} size={24} />
                  <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes..." className="flex-1 h-12 outline-none font-bold text-gray-800 text-lg bg-transparent" />
                  <FiX onClick={() => { setSearchOpen(false); setQuery(""); }} className="cursor-pointer text-gray-300 hover:text-red-500" size={24} />
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {query.length === 0 && recentSearches.length > 0 && (
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recent Searches</span>
                        <button onClick={clearHistory} className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1"><FiTrash2 size={12} /> Clear</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s, i) => (
                          <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-[11px] font-bold"><FiClock size={12} /> {s}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-2">
                    {searchResults?.map((recipe) => (
                      <Link key={recipe?._id} to={`/recipe/${recipe?._id}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-[1.5rem] transition-all group">
                        {/* Use recipe?.image or recipe?.imageUrl depending on your API */}
                        <img src={recipe?.image || recipe?.imageUrl || "https://via.placeholder.com/150"} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={recipe?.title} />
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase text-gray-800">{recipe?.title || "Untitled Recipe"}</span>
                          <span className="text-[10px] font-bold text-orange-500 uppercase">{recipe?.category || "General"}</span>
                        </div>
                      </Link>
                    ))}

                    {query.length >= 2 && searchResults?.length === 0 && !isSearching && (
                      <div className="p-10 text-center flex flex-col items-center gap-2">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-300"><FiSearch size={32} /></div>
                        <p className="text-sm font-bold text-gray-400">No food found for "{query}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <style>{`.nav-link { @apply text-[10px] font-black uppercase text-gray-400 transition-colors tracking-[0.2em] cursor-pointer hover:text-orange-600; }`}</style>
    </div>
  );
}

const DropdownItem = ({ to, icon, title, subtitle, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-2xl transition-all group">
    <div className="p-2 bg-white text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
      {React.cloneElement(icon, { size: 16 })}
    </div>
    <div className="flex flex-col text-left">
      <span className="text-[9px] font-black uppercase text-gray-800 leading-tight">{title}</span>
      <span className="text-[7px] font-bold text-gray-400 uppercase">{subtitle}</span>
    </div>
  </Link>
);

export default Header;