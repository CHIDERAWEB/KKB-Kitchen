import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Bell } from 'lucide-react';
import io from 'socket.io-client';

// COMPONENTS
import Header from './Components/Header';
import Banner from './Components/Banner';
import RecipeGrid from './Components/RecipeGrid';
import Footer from './Components/Footer';
import Loader from './Components/Loader';
import ProtectedRoutes from './Components/ProtectedRoutes';

// PAGES
import Recipejollofdetail from './page/Recipejollofdetail';
import Register from './page/Register';
import CreateRecipe from './page/CreateRecipes';
import Favorites from './page/Favorites';
import Login from './page/Login';
import ShoppingList from './page/ShoppingList';
import About from './page/About';
import MealPlanner from './page/MealPlanner';
import AdminDashboard from './page/AdminDashboard';
import UploadRecipe from './page/UploadRecipe';
import Homepage from './page/Homepage';
import Revisions from './page/Revisions';
import Contact from './page/Contact'

// Initialize Socket.io 
const socket = io('https://kkb-kitchen-api.onrender.com');

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- STABLE TOAST LOGIC ---
  // useCallback prevents Recipejollofdetail from re-fetching every time a toast is shown
  const showToast = useCallback((msg, type = "success") => {
    setToast({ show: true, message: msg, type: type });
    const duration = type === "error" ? 7000 : 5000;
    const timer = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  // --- SOCKET NOTIFICATION LOGIC ---
  useEffect(() => {
    const userId = user?.id || user?._id;

    if (userId && socket) {
      socket.emit("join_room", userId.toString());

      const handleUpdate = (data) => {
        if (data.type === 'REJECTED') {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.play().catch(() => console.log("Audio blocked"));
          showToast(`REJECTED: "${data.title}". Reason: ${data.message}`, "error");
        } else if (data.type === 'APPROVED') {
          showToast(`CONGRATS! Your recipe "${data.title}" is now live!`, "success");
        }
      };

      socket.on("recipe_update", handleUpdate);

      return () => {
        socket.off("recipe_update", handleUpdate);
      };
    }
  }, [user, showToast]);

  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };
    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const triggerLoading = (duration = 1500) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), duration);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    showToast(`Welcome back, Chef ${userData.name.split(' ')[0]}!`);
  };

  return (
    <Router>
      <ScrollToTop />

      <AnimatePresence mode="wait">
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col bg-white relative"
        >
          {/* GLOBAL TOAST */}
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"}`}>
            <div className={`${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900/95'} backdrop-blur-md text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 border border-white/10 max-w-md`}>
              {toast.type === 'error' ? <Bell className="text-white animate-ring" size={20} /> : <CheckCircle className="text-green-400" size={20} />}
              <span className="text-[11px] font-black uppercase tracking-widest leading-tight">{toast.message}</span>
            </div>
          </div>

          <Header user={user} setUser={setUser} />

          <main className="flex-grow pt-20 lg:pt-24">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <PageWrapper>
                    <Banner />
                    <div className="max-w-[1400px] mx-auto px-4 md:px-10 pb-20">
                      <RecipeGrid user={user} />
                      <Homepage />
                    </div>
                  </PageWrapper>
                } />

                <Route path="/register" element={<Register triggerLoading={triggerLoading} showToast={showToast} onAuthSuccess={handleAuthSuccess} />} />
                <Route path="/login" element={<Login triggerLoading={triggerLoading} showToast={showToast} onAuthSuccess={handleAuthSuccess} />} />
                <Route path="/recipe/:id" element={<Recipejollofdetail showToast={showToast} user={user} />} />
                <Route path="/revisions" element={<Revisions user={user} />} />

                <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/create" element={<PageWrapper><CreateRecipe showToast={showToast} user={user} /></PageWrapper>} />
                <Route path="/upload-recipe" element={<ProtectedRoutes><UploadRecipe showToast={showToast} triggerLoading={triggerLoading} /></ProtectedRoutes>} />

                <Route path="/planner" element={<PageWrapper><MealPlanner user={user} /></PageWrapper>} />
                <Route path="/shopping-list" element={<PageWrapper><ShoppingList user={user} /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                <Route path="/favorites" element={<PageWrapper><Favorites user={user} /></PageWrapper>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>

          <Footer />
        </motion.div>
      )}
    </Router>
  );
}

export default App;