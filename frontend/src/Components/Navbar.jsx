import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiHome, FiInfo, FiLayers, FiHeart, 
  FiLogOut, FiShield, FiArrowRight, FiMoon, FiSun,
  FiInstagram, FiTwitter, FiYoutube, FiShoppingBag 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, pendingCount, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false); // Dark Mode State
  const navigate = useNavigate();

  const handleLink = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Animation Variants
  const containerVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 400, damping: 40, staggerChildren: 0.08, delayChildren: 0.1 }
    },
    closed: {
      x: '100%',
      transition: { type: 'spring', stiffness: 400, damping: 40, staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: 20 }
  };

  return (
    <div className="lg:hidden flex items-center">
      {/* TRIGGER */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)} 
        className="p-3 bg-white/80 backdrop-blur-md rounded-2xl text-orange-600 shadow-sm border border-orange-100"
      >
        <FiMenu size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* BLUR OVERLAY */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)} 
              className="fixed inset-0 bg-orange-950/30 backdrop-blur-xl z-[250]" 
            />

            {/* THE DRAWER */}
            <motion.div 
              variants={containerVariants} initial="closed" animate="open" exit="closed"
              className={`fixed top-0 right-0 h-screen w-[85%] sm:w-[420px] z-[300] flex flex-col shadow-[-20px_0_80px_rgba(0,0,0,0.2)] ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            >
              
              {/* HEADER SECTION */}
              <div className="p-8 flex justify-between items-center border-b border-gray-100/10">
                <div className="flex flex-col">
                  <span className="font-signature text-5xl text-orange-600">KKB</span>
                  <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Menu Central</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* DARK MODE TOGGLE */}
                  <button 
                    onClick={() => setIsDark(!isDark)}
                    className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {isDark ? <FiSun size={20}/> : <FiMoon size={20}/>}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-red-50 text-red-500 rounded-2xl"><FiX size={20}/></button>
                </div>
              </div>

              {/* NAVIGATION LINKS */}
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-3">
                <MobileLink variants={itemVariants} isDark={isDark} icon={<FiHome />} label="Home" onClick={() => handleLink('/home')} />
                <MobileLink variants={itemVariants} isDark={isDark} icon={<FiLayers />} label="All Recipes" onClick={() => handleLink('/discover')} />
                <MobileLink variants={itemVariants} isDark={isDark} icon={<FiShoppingBag />} label="My Pantry" onClick={() => handleLink('/kitchen')} />
                <MobileLink variants={itemVariants} isDark={isDark} icon={<FiHeart />} label="Favorites" onClick={() => handleLink('/favorites')} />

                {user?.role === 'admin' && (
                  <motion.button 
                    variants={itemVariants}
                    onClick={() => handleLink('/admin')} 
                    className="flex items-center justify-between w-full p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl mt-6 group"
                  >
                    <div className="flex items-center gap-4">
                      <FiShield size={20} className="group-hover:rotate-12 transition-transform" />
                      <span>Admin Dashboard</span>
                    </div>
                    {pendingCount > 0 && <span className="bg-white text-purple-600 h-6 w-6 flex items-center justify-center rounded-full text-[10px]">{pendingCount}</span>}
                  </motion.button>
                )}
              </div>

              {/* SOCIAL & FOOTER */}
              <div className={`p-8 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} mt-auto space-y-6`}>
                
                {/* SOCIAL ICONS */}
                <div className="flex justify-center gap-6">
                  <SocialIcon icon={<FiInstagram />} href="#" isDark={isDark} />
                  <SocialIcon icon={<FiTwitter />} href="#" isDark={isDark} />
                  <SocialIcon icon={<FiYoutube />} href="#" isDark={isDark} />
                </div>

                {user ? (
                  <motion.button 
                    variants={itemVariants}
                    onClick={() => { handleLogout(); setIsOpen(false); }} 
                    className="flex items-center justify-center gap-3 w-full p-5 bg-red-500/10 text-red-500 rounded-3xl font-black uppercase text-[10px] tracking-widest border border-red-500/20"
                  >
                    <FiLogOut /> Sign Out Chef
                  </motion.button>
                ) : (
                  <motion.button 
                    variants={itemVariants}
                    onClick={() => handleLink('/register')} 
                    className="flex items-center justify-center gap-3 w-full p-5 bg-orange-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-orange-900/20"
                  >
                    Join The Community <FiArrowRight />
                  </motion.button>
                )}
                
                <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">© 2026 KKB Kitchen Global</p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// SUB-COMPONENTS
const MobileLink = ({ icon, label, onClick, variants, isDark }) => (
  <motion.button 
    variants={variants}
    whileTap={{ scale: 0.98, x: 5 }}
    onClick={onClick} 
    className={`flex items-center gap-5 w-full p-4 rounded-3xl transition-all group ${isDark ? 'hover:bg-gray-800' : 'hover:bg-orange-50'}`}
  >
    <div className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-gray-800 text-orange-400 group-hover:bg-orange-600 group-hover:text-white' : 'bg-white text-orange-600 shadow-sm border border-orange-50 group-hover:bg-orange-600 group-hover:text-white'}`}>
      {icon}
    </div>
    <span className={`flex-1 text-left font-black uppercase text-xs tracking-tight ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
    <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-all text-orange-500" />
  </motion.button>
);

const SocialIcon = ({ icon, href, isDark }) => (
  <motion.a 
    href={href}
    whileHover={{ y: -5, scale: 1.1 }}
    className={`p-3 rounded-full text-xl transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:text-orange-400' : 'bg-white text-gray-400 hover:text-orange-600 shadow-sm'}`}
  >
    {icon}
  </motion.a>
);

export default Navbar;