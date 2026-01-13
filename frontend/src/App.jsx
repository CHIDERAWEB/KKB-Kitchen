import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

// COMPONENTS
import Header from './Components/Header';
import Banner from './Components/Banner';
import RecipeGrid from './Components/RecipeGrid';
import Footer from './Components/Footer';
import Loader from './Components/Loader';
import ProtectedRoute from './Components/ProtectedRoutes';

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

function App() {
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const triggerLoading = (duration = 2000) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), duration);
  };

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  // CLEANED HOME VIEW: Banner + the Grid that shows the food
  const HomeView = (
    <>
      <Banner />
      <RecipeGrid />
    </>
  );

  return (
    <Router>
      <AnimatePresence mode="wait">
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-white">
        {/* Global Toast */}
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <CheckCircle className="text-green-400" size={18} />
            <span className="font-medium whitespace-nowrap">{toast.message}</span>
          </div>
        </div>

        <Header user={user} />

        <main className="flex-grow">
          <Routes>
            {/* HOME ROUTES */}
            <Route path="/" element={HomeView} />
            <Route path="/homepage" element={HomeView} />

            {/* AUTH ROUTES */}
            <Route path="/register" element={<Register triggerLoading={triggerLoading} showToast={showToast} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/login" element={<Login triggerLoading={triggerLoading} showToast={showToast} onAuthSuccess={handleAuthSuccess} />} />

            {/* RECIPE DETAIL - This matches your Recipejollofdetail.jsx */}
            <Route path="/recipe/:id" element={<Recipejollofdetail showToast={showToast} />} />

            {/* ADMIN & TOOLS */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/create" element={<CreateRecipe showToast={showToast} />} />
            <Route path="/edit-recipe/:id" element={<UploadRecipe isEditing={true} />} />

            <Route path="/upload-recipe" element={
              <ProtectedRoute>
                <UploadRecipe showToast={showToast} triggerLoading={triggerLoading} />
              </ProtectedRoute>
            } />

            <Route path="/planner" element={<MealPlanner />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/about" element={<About />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;