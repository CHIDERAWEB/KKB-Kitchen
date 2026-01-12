import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ChefHat } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Login = ({ triggerLoading, showToast }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerLoading(2000);

    try {
      const response = await fetch('https://kkb-kitchen-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      // 1. SAVE THE TOKEN!
      localStorage.setItem('token', data.token);

      // 2. SAVE THE USER OBJECT (for the Role and Name)
      localStorage.setItem('user', JSON.stringify(data.user));

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        // --- ADMIN PROTECTION LOGIC ---
        // This ensures that your specific email is always saved as an admin in the browser
        const userWithRole = {
          ...data.user,
          role: data.user.email === 'gluno5191@gmail.com' ? 'admin' : (data.user.role || 'user')
        };

        localStorage.setItem('user', JSON.stringify(userWithRole));
        // ------------------------------

        setTimeout(() => {
          showToast(`Welcome back, ${data.user.name || 'Chef'}! 👨‍🍳`);
          navigate('/');
        }, 2000);
      } else {
        showToast(data.error || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      showToast("Could not connect to server. Is your Backend running?");
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* LEFT SIDE: ANIMATED PICTURE */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src="https://res.cloudinary.com/dutabdorh/image/upload/v1767632021/pexels-ella-olsson-572949-1640777_oyhwl3.jpg"
            alt="Chef Cooking"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-center px-20 z-10">
          <motion.h2
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-6xl font-black leading-tight"
          >
            WELCOME <br />
            <span className="text-orange-500 font-signature text-8xl lowercase">Back home</span>
          </motion.h2>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent" />
      </div>

      {/* RIGHT SIDE: THE LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-orange-50/30">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="max-w-md w-full"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="bg-orange-500 p-4 rounded-3xl shadow-2xl shadow-orange-200"
            >
              <ChefHat className="text-white" size={40} />
            </motion.div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(251,146,60,0.1)] border border-orange-100">
            <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tighter">Login</h2>
            <p className="text-center text-gray-500 mt-2 font-medium">Manage your secret recipes</p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-2 mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="mummy@example.com"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 px-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Password</label>
                  <button type="button" className="text-xs font-bold text-orange-600 hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex justify-center items-center gap-3 py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all mt-4"
              >
                Log In
                <ArrowRight size={20} />
              </motion.button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full border-t border-gray-100"></div>
                <span className="bg-white px-4 text-xs font-black text-gray-400 uppercase absolute">Or continue with</span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      const response = await fetch('https://kkb-kitchen-api.onrender.com/api/auth/google-login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken: credentialResponse.credential })
                      });

                      const data = await response.json();

                      if (response.ok) {
                        localStorage.setItem('token', data.token);

                        // Force admin role for your email via Google Login too
                        const googleUserWithRole = {
                          ...data.user,
                          role: data.user.email === 'gluno5191@gmail.com' ? 'admin' : (data.user.role || 'user')
                        };

                        localStorage.setItem('user', JSON.stringify(googleUserWithRole));
                        showToast(`Welcome back, ${data.user.name}! 🍳`);
                        navigate('/');
                      } else {
                        showToast(data.message || "Google Login failed");
                      }
                    } catch (err) {
                      console.error("Google Auth Error:", err);
                      showToast("Server connection failed");
                    }
                  }}
                  onError={() => showToast("Google Login Failed")}
                  theme="outline"
                  shape="pill"
                  width="100%"
                />
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 font-medium">
                  New to the kitchen?{' '}
                  <Link to="/register" className="text-orange-600 font-black hover:underline ml-1">JOIN NOW</Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;