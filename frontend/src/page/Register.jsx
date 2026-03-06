import React, { useState, useMemo } from 'react';
import { Mail, Lock, User, ChefHat, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import emailjs from '@emailjs/browser';
import { FiEye, FiEyeOff, FiRotateCw } from 'react-icons/fi';

const Register = ({ triggerLoading, showToast }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Maintain state for inputs
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    // --- 1. CONFIGURATION ---
    const EMAILJS_CONFIG = {
        SERVICE_ID: 'service_sfmp6aa',
        TEMPLATE_ID: 'template_fpi87ui',
        PUBLIC_KEY: '3lP6lGl7a3HYu-fJb'
    };

    // --- 2. VALIDATION LOGIC ---
    
    const passwordRequirements = useMemo(() => [
      { label: "8+ Characters", test: formData.password.length >= 8 },
      { label: "At least one number", test: /\d/.test(formData.password) },
      { label: "One uppercase letter", test: /[A-Z]/.test(formData.password) },
      { label: "One special character", test: /[!@#$%^&*]/.test(formData.password) },
    ], [formData.password]);
    
    const strengthScore = passwordRequirements.filter(req => req.test).length;
    
    const getStrengthColor = () => {
      if (strengthScore <= 1) return 'bg-red-500';
      if (strengthScore <= 3) return 'bg-orange-500';
      return 'bg-green-500';
    };
    
    const isFormValid = useMemo(() => {
        return formData.name.trim().length >= 3 && 
        formData.email.includes("@") && 
        strengthScore === 4 //
    }, [formData.name, formData.email, strengthScore]);

    // --- 3. EMAIL AUTOMATION ---
    const triggerWelcomeEmail = (name, email) => {
        const templateParams = {
            user_name: name,
            user_email: email,
        };

        emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
        )
        .then((res) => console.log('✅ Welcome email sent!', res.status))
        .catch((err) => console.error('❌ EmailJS Error:', err));
    };

    // --- 4. FORM SUBMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid) {
            showToast("Please fill in the password, email and username! 💪");
            return;
        }

        if (strengthScore < 4) {
            showToast("Please make your password stronger! 💪");
            return;
        }

        setIsLoading(true);
        // triggerLoading(2500); // Keeping this hidden as you requested

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password
            };

            const response = await fetch('https://kkb-kitchen-api.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                // Store the email temporarily so the OTP page knows who is verifying
                localStorage.setItem('temp_email', formData.email);
                
                // We still save the user data but they aren't "verified" yet
                localStorage.setItem('token', data.token);
                const userWithRole = {
                    ...data.user,
                    role: data.user.email === 'gluno5191@gmail.com' ? 'admin' : (data.user.role || 'user')
                };
                localStorage.setItem('user', JSON.stringify(userWithRole));

                triggerWelcomeEmail(formData.name, formData.email);

                setTimeout(() => {
                    showToast(`Chef ${formData.name}, check your email for the 4-digit code! 🍳`);
                    setIsLoading(false);
                    // REDIRECT TO OTP PAGE
                    localStorage.setItem('temp_email', formData.email);
                    navigate('/verify-email'); 
                }, 2000);
            } else {
                setIsLoading(false);
                showToast(data.message || data.error || "Registration failed.");
            }
        } catch (err) {
            setIsLoading(false);
            showToast("Connection error. Is the server running?");
        }
    };

    return (
        <div className="min-h-screen flex bg-white overflow-hidden">
            {/* LEFT SIDE: DECORATIVE */}
            <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.7 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <img
                        src="https://res.cloudinary.com/dutabdorh/image/upload/v1767630984/katie-smith-uQs1802D0CQ-unsplash_xexgsy.jpg"
                        alt="Cooking"
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
                        START YOUR <br />
                        <span className="text-orange-500 font-signature text-8xl lowercase">
                            Culinary Journey
                        </span>
                    </motion.h2>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-transparent" />
            </div>

            {/* RIGHT SIDE: THE FORM */}
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

                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-orange-100">
                        <h2 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tighter">
                            Create Account
                        </h2>

                        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
                            {/* Name Input */}
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 ml-2 mb-2">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        placeholder="Mummy Doe"
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 ml-2 mb-2">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        placeholder="mummy@kitchen.com"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 ml-2 mb-2">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500" size={18} />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 z-10"
                                    >
                                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                    </button>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <AnimatePresence>
                                    {formData.password.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                                        >
                                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-3">
                                                <motion.div
                                                    animate={{ width: `${(strengthScore / 4) * 100}%` }}
                                                    className={`h-full ${getStrengthColor()} transition-all duration-500`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {passwordRequirements.map((req, i) => (
                                                    <div key={i} className={`flex items-center gap-2 text-[10px] font-bold uppercase ${req.test ? "text-green-600" : "text-gray-400"}`}>
                                                        {req.test ? <Check size={12} /> : <X size={12} />} {req.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <motion.button
  type="submit"
  disabled={isLoading || !isFormValid}
  whileHover={isFormValid && !isLoading ? { scale: 1.02 } : {}}
  whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
  className={`w-full flex justify-center items-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all mt-8 ${
    !isFormValid
      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
      : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
  }`}
>
  {isLoading ? (
    <div className="flex items-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="flex items-center"
      >
        <FiRotateCw size={24} />
      </motion.div>
      <span>Creating Account...</span>
    </div>
  ) : (
    "Sign Up Now"
  )}
</motion.button>
                        </form>
                        <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full border-t border-gray-100"></div>
                <span className="bg-white px-4 text-xs font-black text-gray-400 uppercase absolute">
                  Or continue with
                </span>
              </div>
              </div>

                        <div className="flex flex-col items-center gap-4">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      const response = await fetch(
                        "https://kkb-kitchen-api.onrender.com/api/auth/google-login",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            idToken: credentialResponse.credential,
                          }),
                        },
                      );

                      const data = await response.json();

                      if (response.ok) {
                        localStorage.setItem("token", data.token);

                        // Force admin role for your email via Google Login too
                        const googleUserWithRole = {
                          ...data.user,
                          role:
                            data.user.email === "gluno5191@gmail.com"
                              ? "admin"
                              : data.user.role || "user",
                        };

                        localStorage.setItem(
                          "user",
                          JSON.stringify(googleUserWithRole),
                        );
                        showToast(`Welcome back, ${data.user.name}! 🍳`);
                        navigate("/");
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
                                Already a chef? <Link to="/login" className="text-orange-600 font-black hover:underline ml-1">LOG IN</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Register;