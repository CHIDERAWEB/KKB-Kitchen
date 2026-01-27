import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiHome, FiHeart,
  FiLogOut, FiShield, FiMoon, FiSun,
  FiShoppingBag, FiChevronDown, FiCoffee,
  FiMoon as FiMoonIcon, FiSmile, FiCalendar, FiPlusCircle,
  FiClock, FiTrendingUp, FiMic, FiZap, FiInfo, FiTrash2
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ user, pendingCount, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // --- PERSISTENT HISTORY LOGIC ---
  const updateHistory = (term) => {
    if (!term) return;
    const saved = JSON.parse(localStorage.getItem('kkb_history') || '[]');
    const newHistory = [term, ...saved.filter(t => t !== term)].slice(0, 5);
    localStorage.setItem('kkb_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    localStorage.removeItem('kkb_history');
    setHistory([]);
  };

  // --- REJECTION NOTIFICATION LOGIC ---
  useEffect(() => {
    const checkRejections = async () => {
      const token = localStorage.getItem('token');
      if (!user || !token) return;

      try {
        const response = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/my-recipes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) return;
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          const rejected = data.filter(r => r.status === 'rejected');
          if (rejected.length > 0) {
            alert(`👋 Hi ${user.name}! You have ${rejected.length} recipe(s) that need revision.`);
          }
        }
      } catch (err) {
        console.error("Notification check failed", err);
      }
    };
    checkRejections();
  }, [user]);

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
      updateHistory(transcript);
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

  const handleLink = (path, term = null) => {
    if (term) updateHistory(term);
    navigate(path);
    setIsOpen(false);
    setActiveAccordion(null);
  };

  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  // Helper to check if a sub-link is active
  const isActive = (path) => location.pathname + location.search === path;

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
              variants={{ open: { x: 0 }, closed: { x: '100%' } }}
              initial="closed" animate="open" exit="closed"
              className={`fixed top-0 right-0 h-screen w-[85%] z-[300] flex flex-col shadow-2xl pointer-events-auto transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            >
              {/* HEADER */}
              <div className={`p-6 flex justify-between items-center border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex flex-col -space-y-3">
                  <span className="font-signature text-4xl text-orange-600">KKB</span>
                  <span className={`text-[8px] font-black uppercase tracking-[0.4em] ml-1 ${isDark ? 'text-gray-500' : 'text-gray-300'}`}>Mastery</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsDark(!isDark)} className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100/50'}`}>
                    {isDark ? <FiSun className="text-yellow-400" /> : <FiMoon />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-red-50 text-red-500 rounded-xl"><FiX /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
                {/* VOICE SEARCH */}
                <motion.button
                  onClick={startVoiceSearch}
                  className={`w-full flex items-center justify-between p-4 rounded-3xl border-2 transition-all ${isListening ? 'bg-red-50 border-red-500' : isDark ? 'bg-gray-800 border-transparent' : 'bg-gray-50 border-transparent shadow-inner'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${isListening ? 'bg-red-500 text-white animate-bounce' : 'bg-white text-orange-600 shadow-sm'}`}>
                      <FiMic size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`text-[11px] font-black uppercase tracking-tight ${isListening ? 'text-red-600' : isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {isListening ? 'Listening...' : 'Voice Search'}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Hands-free discovery</span>
                    </div>
                  </div>
                  {!isListening && <FiZap className="text-orange-400" />}
                </motion.button>

                {/* RECENT SEARCHES */}
                {history.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <FiClock /> Recent
                      </h3>
                      <button onClick={clearHistory} className="text-[8px] font-bold text-red-400 uppercase hover:text-red-600 flex items-center gap-1">
                        <FiTrash2 size={10} /> Clear
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {history.map((term, i) => (
                        <button key={i} onClick={() => handleLink(`/discover?query=${term}`, term)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold whitespace-nowrap shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* NAVIGATION */}
                <div className="space-y-2">
                  <MobileLink icon={<FiHome />} label="Home" subtitle="Back to start" onClick={() => handleLink('/')} isDark={isDark} active={isActive('/')} />

                  {/* DISCOVER ACCORDION */}
                  <div className="flex flex-col">
                    <button onClick={() => toggleAccordion('discover')} className={`flex items-center gap-4 w-full p-4 rounded-3xl transition-all ${activeAccordion === 'discover' ? (isDark ? 'bg-gray-800' : 'bg-orange-50/50') : ''}`}>
                      <div className="p-2.5 rounded-2xl bg-white text-orange-600 shadow-sm border border-orange-50"><FiTrendingUp /></div>
                      <div className="flex-1 text-left">
                        <p className={`font-black uppercase text-xs tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Discover</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Explore Recipes</p>
                      </div>
                      <FiChevronDown className={`transition-transform duration-300 ${activeAccordion === 'discover' ? 'rotate-180 text-orange-600' : 'text-gray-300'}`} />
                    </button>
                    <AnimatePresence>
                      {activeAccordion === 'discover' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-6 mt-1 space-y-1">
                          <SubLink label="Breakfast" subtitle="Morning" icon={<FiCoffee />} onClick={() => handleLink('/discover?cat=breakfast')} isDark={isDark} highlight={isActive('/discover?cat=breakfast')} />
                          <SubLink label="Dinner" subtitle="Evening" icon={<FiMoonIcon />} onClick={() => handleLink('/discover?cat=dinner')} isDark={isDark} highlight={isActive('/discover?cat=dinner')} />
                          <SubLink label="Junk Food" subtitle="Treats" icon={<FiSmile />} onClick={() => handleLink('/discover?cat=junk')} isDark={isDark} highlight={isActive('/discover?cat=junk')} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* KITCHEN ACCORDION */}
                  <div className="flex flex-col">
                    <button onClick={() => toggleAccordion('kitchen')} className={`flex items-center gap-4 w-full p-4 rounded-3xl transition-all ${activeAccordion === 'kitchen' ? (isDark ? 'bg-gray-800' : 'bg-orange-50/50') : ''}`}>
                      <div className="p-2.5 rounded-2xl bg-white text-orange-600 shadow-sm border border-orange-50"><FiShoppingBag /></div>
                      <div className="flex-1 text-left">
                        <p className={`font-black uppercase text-xs tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Kitchen</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Workspace</p>
                      </div>
                      <FiChevronDown className={`transition-transform duration-300 ${activeAccordion === 'kitchen' ? 'rotate-180 text-orange-600' : 'text-gray-300'}`} />
                    </button>
                    <AnimatePresence>
                      {activeAccordion === 'kitchen' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-6 mt-1 space-y-1">
                          <SubLink label="Planner" subtitle="Schedule" icon={<FiCalendar />} onClick={() => handleLink('/planner')} isDark={isDark} highlight={isActive('/planner')} />
                          <SubLink label="Favorites" subtitle="Loved" icon={<FiHeart />} onClick={() => handleLink('/favorites')} isDark={isDark} highlight={isActive('/favorites')} />
                          <SubLink label="Create" subtitle="Share" icon={<FiPlusCircle />} onClick={() => handleLink('/create')} isDark={isDark} highlight={isActive('/create')} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className={`p-8 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                {user ? (
                  <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full p-5 bg-red-500/10 text-red-500 rounded-3xl font-black uppercase text-[10px] border border-red-500/20 tracking-widest">
                    <FiLogOut /> Log Out
                  </button>
                ) : (
                  <button onClick={() => handleLink('/login')} className="w-full p-5 bg-orange-600 text-white rounded-3xl font-black uppercase text-[10px] shadow-xl tracking-[0.2em]">
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

const MobileLink = ({ icon, label, subtitle, onClick, isDark, active }) => (
  <button onClick={onClick} className={`flex items-center gap-4 w-full p-4 rounded-3xl transition-all group ${active ? (isDark ? 'bg-gray-800' : 'bg-orange-50') : ''}`}>
    <div className={`p-2.5 rounded-2xl shadow-sm border transition-all ${active ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-50'}`}>{icon}</div>
    <div className="flex flex-col items-start">
      <span className={`text-left font-black uppercase text-xs tracking-tight ${active ? 'text-orange-600' : isDark ? 'text-gray-100' : 'text-gray-800'}`}>{label}</span>
      <span className="text-[9px] font-bold text-gray-400 uppercase">{subtitle}</span>
    </div>
  </button>
);

const SubLink = ({ label, subtitle, icon, onClick, highlight, isDark }) => (
  <button onClick={onClick} className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-all ${highlight ? 'bg-orange-600/10 border border-orange-200' : 'hover:bg-gray-100/10'}`}>
    <div className={`p-2 rounded-xl transition-colors ${highlight ? 'bg-orange-600 text-white' : 'bg-white text-gray-400 shadow-xs border border-gray-100'}`}>
      {React.cloneElement(icon, { size: 14 })}
    </div>
    <div className="flex flex-col items-start">
      <span className={`text-[10px] font-black uppercase tracking-tight ${highlight ? 'text-orange-600' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{subtitle}</span>
    </div>
  </button>
);

export default Navbar;