import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiHome, FiLayers, FiHeart,
  FiLogOut, FiShield, FiArrowRight, FiMoon, FiSun,
  FiShoppingBag, FiSearch, FiChevronDown, FiCoffee,
  FiMoon as FiMoonIcon, FiSmile, FiCalendar, FiPlusCircle,
  FiClock, FiTrendingUp, FiMic, FiZap
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, pendingCount, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  // --- NEW: REJECTION NOTIFICATION LOGIC ---
  useEffect(() => {
    const checkRejections = async () => {
      if (!user) return; // Only check if logged in

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/my-recipes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          const rejected = data.filter(r => r.status === 'rejected');
          if (rejected.length > 0) {
            alert(`👋 Hi ${user.name}! You have ${rejected.length} recipe(s) that need revision. Check your dashboard!`);
          }
        }
      } catch (err) {
        console.error("Notification check failed", err);
      }
    };

    checkRejections();
  }, [user]); 
  // ------------------------------------------

  // Voice Search Logic
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setIsListening(false);
      setIsOpen(false);
      navigate(`/discover?query=${transcript}`);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    if (isOpen) {
      const saved = JSON.parse(localStorage.getItem('kkb_history') || '[]');
      setHistory(saved.slice(0, 3));
    }
  }, [isOpen]);

  const handleLink = (path) => {
    navigate(path);
    setIsOpen(false);
    setActiveAccordion(null);
  };

  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  const containerVariants = {
    open: { x: 0, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
    closed: { x: '100%' }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: 10 }
  };

  return (
    <div className="lg:hidden flex items-center">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="p-3 bg-white/80 backdrop-blur-md rounded-2xl text-orange-600 shadow-sm border border-orange-100 pointer-events-auto"
      >
        <FiMenu size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-orange-950/40 backdrop-blur-md z-[250] pointer-events-auto"
            />

            <motion.div
              variants={containerVariants} initial="closed" animate="open" exit="closed"
              className={`fixed top-0 right-0 h-screen w-[85%] z-[300] flex flex-col shadow-2xl pointer-events-auto ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            >
              {/* HEADER */}
              <div className="p-6 flex justify-between items-center border-b border-gray-100/10">
                <div className="flex flex-col -space-y-3">
                  <span className="font-signature text-4xl text-orange-600">KKB</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300 ml-1">Mastery</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsDark(!isDark)} className="p-3 rounded-xl bg-gray-100/50">
                    {isDark ? <FiSun className="text-yellow-400" /> : <FiMoon />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-red-50 text-red-500 rounded-xl"><FiX /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">

                {/* 1. VOICE SEARCH TRIGGER */}
                <motion.button
                  variants={itemVariants}
                  onClick={startVoiceSearch}
                  className={`w-full flex items-center justify-between p-4 rounded-3xl border-2 transition-all ${isListening ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-transparent shadow-inner'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${isListening ? 'bg-red-500 text-white animate-bounce' : 'bg-white text-orange-600 shadow-sm'}`}>
                      <FiMic size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`text-[11px] font-black uppercase tracking-tight ${isListening ? 'text-red-600' : 'text-gray-800'}`}>
                        {isListening ? 'Listening...' : 'Voice Search'}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Hands-free discovery</span>
                    </div>
                  </div>
                  {!isListening && <FiZap className="text-orange-400" />}
                </motion.button>

                {/* 2. RECENT SEARCHES */}
                {history.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-3">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <FiClock /> Recent Kitchen Trips
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {history.map((term, i) => (
                        <button key={i} onClick={() => handleLink(`/discover?query=${term}`)} className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-600 whitespace-nowrap shadow-sm">
                          {term}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 3. PRIMARY NAVIGATION LINKS */}
                <div className="space-y-2">
                  <MobileLink variants={itemVariants} icon={<FiHome />} label="Home" subtitle="Back to start" onClick={() => handleLink('/')} />

                  {/* DISCOVER ACCORDION */}
                  <div className="flex flex-col">
                    <button onClick={() => toggleAccordion('discover')} className={`flex items-center gap-4 w-full p-4 rounded-3xl transition-all ${activeAccordion === 'discover' ? 'bg-orange-50/50' : ''}`}>
                      <div className="p-2.5 rounded-2xl bg-white text-orange-600 shadow-sm border border-orange-50"><FiTrendingUp /></div>
                      <div className="flex-1 text-left">
                        <p className="font-black uppercase text-xs tracking-tight text-gray-800">Discover</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Explore Recipes</p>
                      </div>
                      <FiChevronDown className={`transition-transform duration-300 ${activeAccordion === 'discover' ? 'rotate-180 text-orange-600' : 'text-gray-300'}`} />
                    </button>
                    <AnimatePresence>
                      {activeAccordion === 'discover' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-6 mt-1 space-y-1">
                          <SubLink label="Breakfast" subtitle="Morning routines" icon={<FiCoffee />} onClick={() => handleLink('/discover?cat=breakfast')} />
                          <SubLink label="Dinner" subtitle="Evening comfort" icon={<FiMoonIcon />} onClick={() => handleLink('/discover?cat=dinner')} />
                          <SubLink label="Junk Food" subtitle="Weekend treats" icon={<FiSmile />} onClick={() => handleLink('/discover?cat=junk')} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* KITCHEN ACCORDION */}
                  <div className="flex flex-col">
                    <button onClick={() => toggleAccordion('kitchen')} className={`flex items-center gap-4 w-full p-4 rounded-3xl transition-all ${activeAccordion === 'kitchen' ? 'bg-orange-50/50' : ''}`}>
                      <div className="p-2.5 rounded-2xl bg-white text-orange-600 shadow-sm border border-orange-50"><FiShoppingBag /></div>
                      <div className="flex-1 text-left">
                        <p className="font-black uppercase text-xs tracking-tight text-gray-800">Kitchen</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Your Workspace</p>
                      </div>
                      <FiChevronDown className={`transition-transform duration-300 ${activeAccordion === 'kitchen' ? 'rotate-180 text-orange-600' : 'text-gray-300'}`} />
                    </button>
                    <AnimatePresence>
                      {activeAccordion === 'kitchen' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-6 mt-1 space-y-1">
                          <SubLink label="Meal Planner" subtitle="Schedule eats" icon={<FiCalendar />} onClick={() => handleLink('/planner')} />
                          <SubLink label="Shopping List" subtitle="Essential picks" icon={<FiShoppingBag />} onClick={() => handleLink('/shopping-list')} />
                          <SubLink label="Favorites" subtitle="Your loved meals" icon={<FiHeart />} onClick={() => handleLink('/favorites')} />
                          <SubLink label="Create Recipe" subtitle="Share your magic" icon={<FiPlusCircle />} onClick={() => handleLink('/create')} highlight />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <motion.button
                    variants={itemVariants}
                    onClick={() => handleLink('/admin')}
                    className="flex items-center justify-between w-full p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-[2rem] font-black uppercase text-[10px] shadow-xl mt-4 border border-white/10"
                  >
                    <div className="flex items-center gap-3"><FiShield size={18} className="text-orange-500" /> Admin Command</div>
                    {pendingCount > 0 && <span className="bg-orange-600 text-white h-6 w-6 flex items-center justify-center rounded-full text-[10px] font-bold animate-pulse">{pendingCount}</span>}
                  </motion.button>
                )}
              </div>

              {/* FOOTER */}
              <div className={`p-8 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} border-t border-gray-100/10`}>
                {user ? (
                  <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full p-5 bg-red-500/10 text-red-500 rounded-3xl font-black uppercase text-[10px] border border-red-500/20 tracking-widest">
                    <FiLogOut /> Log Out
                  </button>
                ) : (
                  <button onClick={() => handleLink('/register')} className="w-full p-5 bg-orange-600 text-white rounded-3xl font-black uppercase text-[10px] shadow-xl tracking-[0.2em] hover:scale-[1.02] transition-transform">
                    Join Mastery
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

const MobileLink = ({ icon, label, subtitle, onClick, variants }) => (
  <motion.button variants={variants} onClick={onClick} className="flex items-center gap-4 w-full p-4 rounded-3xl hover:bg-orange-50/50 group transition-all">
    <div className="p-2.5 rounded-2xl bg-white text-orange-600 shadow-sm border border-orange-50 group-hover:bg-orange-600 group-hover:text-white transition-all">{icon}</div>
    <div className="flex flex-col items-start">
      <span className="text-left font-black uppercase text-xs tracking-tight text-gray-800">{label}</span>
      <span className="text-[9px] font-bold text-gray-400 uppercase">{subtitle}</span>
    </div>
  </motion.button>
);

const SubLink = ({ label, subtitle, icon, onClick, highlight }) => (
  <button onClick={onClick} className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${highlight ? 'bg-orange-600/10 border border-orange-200' : 'hover:bg-gray-50'}`}>
    <div className={`p-2 rounded-xl ${highlight ? 'bg-orange-600 text-white' : 'bg-white text-gray-400 shadow-xs border border-gray-100'}`}>
      {React.cloneElement(icon, { size: 14 })}
    </div>
    <div className="flex flex-col items-start">
      <span className={`text-[10px] font-black uppercase tracking-tight ${highlight ? 'text-orange-600' : 'text-gray-700'}`}>{label}</span>
      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{subtitle}</span>
    </div>
  </button>
);

export default Navbar;