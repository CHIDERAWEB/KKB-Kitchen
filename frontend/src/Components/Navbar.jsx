import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  FiCalendar,
  FiChevronDown, FiCoffee,
  FiHeart,
  FiHome,
  FiMenu,
  FiMic,
  FiMoon,
  FiShoppingBag,
  FiSun,
  FiTrendingUp,
  FiX
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ user, pendingCount, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // --- RESTORED VOICE SEARCH LOGIC ---
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setIsListening(false);
      setIsOpen(false); // Close menu
      navigate(`/discover?query=${transcript}`); // Go to search results
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleLink = (path) => {
    navigate(path);
    setIsOpen(false);
    setActiveAccordion(null);
  };

  const toggleAccordion = (name) => {
    // This is the "toggle" logic. If click same one, it closes.
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  return (
    <div className="lg:hidden flex items-center">
      {/* Menu Trigger */}
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
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[250]"
            />

            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className={`fixed top-0 right-0 h-screen w-[85%] z-[300] flex flex-col shadow-2xl ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            >
              {/* Header */}
              <div className="p-6 flex justify-between items-center border-b border-gray-100/10">
                <div className="flex flex-col">
                  <span className="font-black italic text-2xl text-orange-600">KKB.</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Mastery Kitchen</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsDark(!isDark)} className="p-3 rounded-xl bg-gray-100/50">
                    {isDark ? <FiSun className="text-yellow-400" /> : <FiMoon />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-red-50 text-red-500 rounded-xl"><FiX /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">

                {/* --- WORKING VOICE SEARCH BUTTON --- */}
                <button
                  onClick={startVoiceSearch}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all ${isListening ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-gray-50 border-transparent'}`}
                >
                  <div className={`p-2 rounded-xl ${isListening ? 'bg-red-500 text-white' : 'bg-white text-orange-500 shadow-sm'}`}>
                    <FiMic size={18} />
                  </div>
                  <div className="text-left">
                    <span className={`text-[11px] font-black uppercase block ${isListening ? 'text-red-600' : ''}`}>
                      {isListening ? 'Listening...' : 'Voice Search'}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Find recipes by voice</span>
                  </div>
                </button>

                {/* Navigation Links */}
                <div className="space-y-2">
                  <button onClick={() => handleLink('/')} className="flex items-center gap-4 w-full p-4 hover:bg-orange-50 rounded-3xl transition-all">
                    <div className="p-2.5 rounded-2xl bg-white text-orange-600 shadow-sm border border-orange-50"><FiHome /></div>
                    <div className="text-left">
                      <p className="font-black uppercase text-xs">Home</p>
                      <p className="text-[9px] font-bold text-gray-400">Main Lobby</p>
                    </div>
                  </button>

                  {/* --- DISCOVER DROPDOWN --- */}
                  <div className="flex flex-col">
                    <button onClick={() => toggleAccordion('discover')} className={`flex items-center gap-4 w-full p-4 rounded-3xl transition-colors ${activeAccordion === 'discover' ? 'bg-orange-50' : ''}`}>
                      <div className="p-2.5 rounded-2xl bg-white text-orange-600 shadow-sm"><FiTrendingUp /></div>
                      <div className="flex-1 text-left">
                        <p className="font-black uppercase text-xs">Discover</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Explore Recipes</p>
                      </div>
                      <FiChevronDown className={`transition-transform duration-300 ${activeAccordion === 'discover' ? 'rotate-180 text-orange-600' : 'text-gray-300'}`} />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === 'discover' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-6 mt-1 space-y-1 overflow-hidden"
                        >
                          <button onClick={() => handleLink('/discover?cat=breakfast')} className="flex items-center gap-3 w-full p-3 hover:bg-orange-50/50 rounded-2xl transition-all">
                            <FiCoffee className="text-orange-500" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Breakfast</span>
                          </button>
                          <button onClick={() => handleLink('/discover?cat=dinner')} className="flex items-center gap-3 w-full p-3 hover:bg-orange-50/50 rounded-2xl transition-all">
                            <FiMoon className="text-orange-500" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Dinner</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* --- KITCHEN DROPDOWN --- */}
                  <div className="flex flex-col">
                    <button onClick={() => toggleAccordion('kitchen')} className={`flex items-center gap-4 w-full p-4 rounded-3xl transition-colors ${activeAccordion === 'kitchen' ? 'bg-orange-50' : ''}`}>
                      <div className="p-2.5 rounded-2xl bg-white text-orange-600 shadow-sm"><FiShoppingBag /></div>
                      <div className="flex-1 text-left">
                        <p className="font-black uppercase text-xs">Kitchen</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Workspace</p>
                      </div>
                      <FiChevronDown className={`transition-transform duration-300 ${activeAccordion === 'kitchen' ? 'rotate-180 text-orange-600' : 'text-gray-300'}`} />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === 'kitchen' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-6 mt-1 space-y-1 overflow-hidden"
                        >
                          <button onClick={() => handleLink('/planner')} className="flex items-center gap-3 w-full p-3 hover:bg-orange-50/50 rounded-2xl transition-all">
                            <FiCalendar className="text-orange-500" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Planner</span>
                          </button>
                          <button onClick={() => handleLink('/favorites')} className="flex items-center gap-3 w-full p-3 hover:bg-orange-50/50 rounded-2xl transition-all">
                            <FiHeart className="text-orange-500" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Favorites</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-gray-100 bg-gray-50">
                {user ? (
                  <button onClick={handleLogout} className="w-full p-5 bg-red-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-lg">
                    Log Out
                  </button>
                ) : (
                  <button onClick={() => handleLink('/login')} className="w-full p-5 bg-orange-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-lg">
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

export default Navbar;