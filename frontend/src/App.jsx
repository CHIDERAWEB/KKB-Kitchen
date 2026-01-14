import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

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

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    showToast(`Welcome back, Chef ${userData.name.split(' ')[0]}!`);
  };

  return (
    <Router>
      <ScrollToTop />

      {/* MASTER LOADER */}
      <AnimatePresence mode="wait">
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>

      {/* Main content only renders fully when not loading to prevent layout jumps */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col bg-white relative"
        >
          {/* GLOBAL TOAST */}
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"}`}>
            <div className="bg-gray-900/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
              <CheckCircle className="text-green-400" size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">{toast.message}</span>
            </div>
          </div>

          <Header user={user} setUser={setUser} />

          <main className="flex-grow pt-20 lg:pt-24">
            <Routes>
              {/* HOME ROUTE */}
              <Route path="/" element={
                <div className="animate-in fade-in zoom-in-95 duration-700">
                  <Banner />
                  <div className="max-w-[1400px] mx-auto px-4 md:px-10 pb-20">
                    <RecipeGrid user={user} />
                    <Homepage />
                  </div>
                </div>
              } />

              {/* AUTH & REDIRECTS */}
              <Route path="/register" element={<Register triggerLoading={triggerLoading} showToast={showToast} onAuthSuccess={handleAuthSuccess} />} />
              <Route path="/login" element={<Login triggerLoading={triggerLoading} showToast={showToast} onAuthSuccess={handleAuthSuccess} />} />

              {/* RECIPE DETAIL */}
              <Route path="/recipe/:id" element={<Recipejollofdetail showToast={showToast} user={user} />} />

              {/* PROTECTED ROUTES */}
              <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
              <Route path="/create" element={<CreateRecipe showToast={showToast} user={user} />} />
              <Route path="/upload-recipe" element={<ProtectedRoutes><UploadRecipe showToast={showToast} triggerLoading={triggerLoading} /></ProtectedRoutes>} />

              <Route path="/planner" element={<MealPlanner user={user} />} />
              <Route path="/shopping-list" element={<ShoppingList user={user} />} />
              <Route path="/about" element={<About />} />
              <Route path="/favorites" element={<Favorites user={user} />} />

              {/* CATCH-ALL */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </motion.div>
      )}
    </Router>
  );
}

export default App;