import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FiRotateCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = ({ showToast }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const navigate = useNavigate();

  // Refs for auto-focusing inputs
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
    const finalOtp = otp.join("");

    if (finalOtp.length < 4) {
      showToast("Please enter the full 4-digit code! 🔢");
      return;
    }

    if (!email) {
      showToast("Session expired. Please register again. ⏳");
      // If we are embedded in Register, we should tell parent to switch back
      window.location.reload();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://kkb-kitchen-api.onrender.com/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: finalOtp }),
        },
      );

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Server returned a non-JSON response.");
      }

      if (response.ok) {
        showToast("Email Verified! Welcome Chef! 🍳");
        localStorage.removeItem("temp_email");
        navigate("/login");
      } else {
        showToast(data.message || "Invalid code. Please check again!");
      }
    } catch (err) {
      showToast("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
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
              className="w-14 h-16 text-2xl font-black text-center bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl transition-all outline-none shadow-sm"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${isLoading ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-gray-400 cursor-not-allowed"
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
              type="button"
              onClick={handleResend}
              className="text-orange-600 font-black hover:underline mt-2"
            >
              RESEND CODE
            </button>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default VerifyEmail;