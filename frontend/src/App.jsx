import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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

  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ✅ FIX 1: Enhanced Sync Logic
  // This ensures that when a user logs in, the state updates EVERYWHERE instantly.
  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('storage', syncUser);
    // Also check on focus to ensure multiple tabs stay in sync
    window.addEventListener('focus', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  // ✅ FIX 2: Loader Timing
  // Reduced time and ensured it doesn't "hang"
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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

      {/* ✅ FIX 3: AnimatePresence for the Loader */}
      <AnimatePresence mode="wait">
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>

      {/* Main Container - Added relative and z-index to stay under Loader */}
      <div className={`min-h-screen flex flex-col bg-white transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>

        {/* Global Toast */}
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <CheckCircle className="text-green-400" size={18} />
            <span className="font-medium whitespace-nowrap">{toast.message}</span>
          </div>
        </div>

        <Header user={user} setUser={setUser} />

        <main className="flex-grow">
          <Routes>
            {/* HOME ROUTE */}
            <Route path="/" element={
              <div className="animate-in fade-in duration-700">
                <Banner />
                <div className="pb-20">
                  <RecipeGrid user={user} />
                </div>
              </div>
            } />

            {/* REDIRECTS & AUTH */}
            <Route path="/homepage" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Register triggerLoading={triggerLoading} showToast={showToast} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/login" element={<Login triggerLoading={triggerLoading} showToast={showToast} onAuthSuccess={handleAuthSuccess} />} />

            {/* RECIPE DETAIL */}
            <Route path="/recipe/:id" element={<Recipejollofdetail showToast={showToast} user={user} />} />

            {/* ADMIN & PROTECTED */}
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
      </div>
    </Router>
  );
}

export default App;