import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  FiCalendar, FiChevronRight, FiCoffee,
  FiHeart, FiHome, FiLogOut, FiMenu, FiMic,
  FiMoon, FiPlusCircle,
  FiShield,
  FiShoppingBag,
  FiShoppingCart, FiSun, FiTrendingUp, FiX
} from 'react-icons/fi';
import { GiChefToque } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, handleLogout, setShowChefModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  const handleLink = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Not supported");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      setIsListening(false);
      setIsOpen(false);
      navigate(`/discover?query=${e.results[0][0].transcript}`);
    };
    recognition.start();
  };

  // Animation Variants for staggered children
  const containerVars = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  return (
    <div className="lg:hidden flex items-center">
      {/* TRIGGER */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-orange-600 shadow-sm border border-orange-100"
      >
        <FiMenu size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500]"
            />

            {/* SLIDE PANEL */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 h-[100dvh] w-[88%] max-w-[340px] z-[510] flex flex-col shadow-2xl transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-[#F8F9FB] text-gray-900'}`}
            >
              {/* --- HEADER --- */}
              <div className="p-5 flex justify-between items-center border-b border-transparent">
                <div>
                  <h2 className="font-black italic text-2xl text-orange-600 leading-none">KKB.</h2>
                  <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Mastery Kitchen</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsDark(!isDark)} className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white shadow-sm text-gray-500'}`}>
                    {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-red-50 text-red-500 rounded-2xl">
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* --- SCROLLABLE HUB --- */}
              <motion.div
                variants={containerVars} initial="initial" animate="animate"
                className="flex-1 overflow-y-auto px-5 pb-6 space-y-6 no-scrollbar"
              >
                {/* 1. VOICE SEARCH */}
                <motion.div variants={itemVars}>
                  <button
                    onClick={startVoiceSearch}
                    className={`w-full p-4 rounded-[2rem] flex items-center gap-4 border-2 transition-all ${isListening ? 'bg-red-50 border-red-200 animate-pulse' : isDark ? 'bg-gray-900 border-gray-800 shadow-none' : 'bg-white border-transparent shadow-sm'}`}
                  >
                    <div className={`p-3 rounded-2xl ${isListening ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                      <FiMic size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{isListening ? 'Listening...' : 'Tap to speak'}</p>
                      <p className={`text-sm font-black ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Voice Search</p>
                    </div>
                  </button>
                </motion.div>

                {/* 2. MAIN GRID */}
                <motion.div variants={itemVars} className="grid grid-cols-2 gap-3">
                  <HubCard isDark={isDark} icon={<FiHome />} label="Lobby" color="bg-blue-50 text-blue-600" onClick={() => handleLink('/')} />
                  <HubCard isDark={isDark} icon={<FiTrendingUp />} label="Explore" color="bg-purple-50 text-purple-600" onClick={() => handleLink('/discover')} />
                  <HubCard isDark={isDark} icon={<FiHeart />} label="Saved" color="bg-pink-50 text-pink-600" onClick={() => handleLink('/favorites')} />
                  <HubCard isDark={isDark} icon={<FiCalendar />} label="Planner" color="bg-green-50 text-green-600" onClick={() => handleLink('/planner')} />
                </motion.div>

                {/* 3. DYNAMIC ROLE SECTION */}
                <motion.div variants={itemVars}>
                  {user && user.role !== "chef" && user.role !== "admin" ? (
                    <button
                      onClick={() => { setShowChefModal(true); setIsOpen(false); }}
                      className="w-full bg-black p-5 rounded-[2rem] flex items-center justify-between group overflow-hidden relative shadow-xl shadow-black/20"
                    >
                      <div className="z-10 text-left">
                        <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Earn with us</p>
                        <p className="text-white font-black text-lg">Become a Chef</p>
                      </div>
                      <div className="bg-orange-500 p-3 rounded-2xl z-10 text-white group-hover:rotate-12 transition-transform">
                        <GiChefToque size={24} />
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-10 -mt-10" />
                    </button>
                  ) : (user?.role === "chef" || user?.role === "admin") && (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleLink('/create')}
                        className="w-full bg-orange-600 p-5 rounded-[2rem] flex items-center gap-4 text-white shadow-xl shadow-orange-200"
                      >
                        <div className="bg-white/20 p-3 rounded-2xl"><FiPlusCircle size={24} /></div>
                        <div className="text-left">
                          <p className="font-black text-lg">Post Recipe</p>
                          <p className="text-orange-100 text-[9px] font-black uppercase tracking-widest italic">Management Hub</p>
                        </div>
                      </button>

                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleLink('/admin')}
                          className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'}`}
                        >
                          <div className="flex items-center gap-3">
                            <FiShield className="text-orange-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Admin Dashboard</span>
                          </div>
                          <FiChevronRight />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* 4. SUB MENU */}
                <motion.div variants={itemVars} className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-50'} rounded-[2rem] p-2 shadow-sm border`}>
                  <ListLink isDark={isDark} icon={<FiCoffee />} label="Breakfast Mix" onClick={() => handleLink('/discover?cat=breakfast')} />
                  <ListLink isDark={isDark} icon={<FiShoppingBag />} label="My Orders" onClick={() => handleLink('/orders')} />
                  <ListLink isDark={isDark} icon={<FiShoppingCart />} label="Checkout Cart" badge="3" onClick={() => handleLink('/cart')} />
                </motion.div>
              </motion.div>

              {/* --- USER FOOTER --- */}
              <div className={`p-5 border-t ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'}`}>
                {user ? (
                  <div className="flex items-center gap-4 p-2">
                    <div className="relative">
                      <img src={user.picture} className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500 p-0.5" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{user.displayName}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase">{user.role}</p>
                    </div>
                    <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                      <FiLogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleLink('/login')} className="w-full p-4 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-100">
                    Get Started
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- MINI COMPONENTS --- */

const HubCard = ({ icon, label, color, onClick, isDark }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-50'} p-5 rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-sm border group hover:border-orange-100 transition-all`}
  >
    <div className={`p-3 rounded-2xl text-xl transition-transform group-hover:-translate-y-1 ${color}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
  </motion.button>
);

const ListLink = ({ icon, label, onClick, badge, isDark }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
    <div className="flex items-center gap-4">
      <div className="text-gray-400 group-hover:text-orange-500 transition-colors">{icon}</div>
      <span className={`text-[11px] font-black uppercase ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge && <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
      <FiChevronRight className="text-gray-300 group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

export default Navbar;