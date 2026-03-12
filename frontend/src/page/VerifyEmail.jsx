import { motion } from 'framer-motion';
import { ArrowRight, ChefHat } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FiRotateCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = ({ showToast }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const navigate = useNavigate();
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Get the email and ensure it's valid
  const storedEmail = localStorage.getItem('temp_email');
  const email = storedEmail ? storedEmail.toLowerCase().trim() : null;

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;
    setTimer(59);
    try {
      const response = await fetch("https://kkb-kitchen-api.onrender.com/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        showToast("New 4-digit PIN sent! 📩");
      } else {
        showToast("Failed to resend. Check if email is correct.");
      }
    } catch (err) {
      showToast("Connection error. Is the server awake? 😴");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join('');

    if (finalOtp.length < 4) {
      showToast("Please enter the full 4-digit code! 🔢");
      return;
    }

    if (!email) {
      showToast("Session expired. Please register again. ⏳");
      navigate('/register');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://kkb-kitchen-api.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: finalOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Email Verified! Welcome Chef! 🍳");
        localStorage.removeItem('temp_email');
        navigate('/login');
      } else {
        showToast(data.message || "Invalid code. Please check again!");
      }
    } catch (err) {
      showToast("Connection error. Server might be waking up...");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-orange-500 p-4 rounded-3xl shadow-xl">
            <ChefHat className="text-white" size={40} />
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-orange-100 text-center">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Check Your Mail</h2>
          <p className="text-sm text-gray-500 mb-8 font-medium">
            We sent a code to <br />
            <span className="text-orange-600 font-bold">{email || "your email"}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-14 h-16 text-2xl font-black text-center bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl transition-all outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
              {isLoading ? <FiRotateCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Didn't get the code? <br />
              {timer > 0 ? (
                <span className="text-gray-400 italic">Resend available in {timer}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-orange-600 font-black hover:underline mt-2"
                >
                  RESEND CODE
                </button>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;