import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiSend, FiCheckCircle, FiLoader, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Contact = () => {
    const form = useRef();
    const [status, setStatus] = useState('idle'); // idle, sending, success

    const sendEmail = (e) => {
        e.preventDefault();
        setStatus('sending');

        // REPLACE THESE WITH YOUR LATEST IDS
        const SERVICE_ID = 'service_0bbjmal';
        const PUBLIC_KEY = 'bjcPAKsChHcddh8l1';
        const ADMIN_TEMPLATE_ID = 'template_6al4lnb';
        const AUTO_REPLY_TEMPLATE_ID = 'template_xtue735';

        // REAL ENGINE ENABLED: Sending both emails simultaneously
        const sendToAdmin = emailjs.sendForm(SERVICE_ID, ADMIN_TEMPLATE_ID, form.current, PUBLIC_KEY);
        const sendAutoReply = emailjs.sendForm(SERVICE_ID, AUTO_REPLY_TEMPLATE_ID, form.current, PUBLIC_KEY);

        Promise.all([sendToAdmin, sendAutoReply])
            .then(() => {
                console.log("SUCCESS! Real emails sent.");
                setStatus('success');
            })
            .catch((error) => {
                console.error("EmailJS Error:", error);
                setStatus('idle');
                // This alert will tell us EXACTLY why it failed (e.g., "Account limit reached")
                alert("Failed to send: " + (error?.text || "Unknown Error"));
            });
    };

    return (
        <div className="min-h-screen bg-white selection:bg-orange-500 selection:text-white pt-32 pb-16 px-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">

                {/* --- DECORATIVE BACKGROUND TEXT --- */}
                <div className="fixed top-20 right-[-5vw] text-[25vw] font-black text-gray-50 -z-10 select-none italic leading-none opacity-50">
                    KKB
                </div>

                {/* --- HEADER --- */}
                <header className="mb-24 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "80px" }}
                        className="h-[3px] bg-orange-600 mb-6"
                    />
                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-7xl md:text-[10rem] font-black italic uppercase text-gray-900 tracking-tighter leading-[0.85]"
                    >
                        Talk To <br />
                        <span className="text-orange-600">The Chef.</span>
                    </motion.h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

                    {/* --- LEFT SIDE: INFO --- */}
                    <div className="space-y-12">
                        <p className="text-2xl text-gray-400 font-medium leading-relaxed max-w-md italic">
                            "Great recipes are meant to be shared. Great ideas are meant to be built."
                        </p>

                        <div className="space-y-6">
                            <ContactDetail icon={<FiMail />} label="Direct Mail" value="chef@kkb-kitchen.onrender.com" />
                            <ContactDetail icon={<FiPhone />} label="Hotline" value="+234 CHIDERA TECH" />
                            <ContactDetail icon={<FiMapPin />} label="Kitchen HQ" value="Lagos, Nigeria" />
                        </div>

                        <div className="flex gap-6 pt-6">
                            {[<FiInstagram />, <FiTwitter />, <FiFacebook />].map((icon, i) => (
                                <motion.a
                                    key={i} href="#"
                                    whileHover={{ y: -5, color: "#ea580c" }}
                                    className="text-2xl text-gray-900 transition-colors"
                                >
                                    {icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* --- RIGHT SIDE: FORM --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 rounded-[3rem] p-10 md:p-16 shadow-2xl relative"
                    >
                        <AnimatePresence mode='wait'>
                            {status === 'success' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-10"
                                >
                                    <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-500/20">
                                        <FiCheckCircle size={48} className="text-white" />
                                    </div>
                                    <h2 className="text-4xl font-black text-white uppercase italic mb-4">Message Sent!</h2>
                                    <p className="text-gray-400 font-bold text-xs tracking-widest uppercase">Check your inbox for a confirmation email.</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-10 text-orange-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors"
                                    >
                                        Click to send another
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    ref={form}
                                    onSubmit={sendEmail}
                                    className="space-y-8"
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FloatingInput name="from_name" label="Chef Name" placeholder="Gordon Ramsay" />
                                        <FloatingInput name="from_email" label="Your Email" placeholder="chef@example.com" type="email" />
                                    </div>

                                    <div className="relative">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4 block">The Secret Message</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows="5"
                                            placeholder="Tell us your recipe ideas..."
                                            className="w-full bg-gray-800 border-2 border-transparent focus:border-orange-600 rounded-[2rem] p-6 text-white outline-none transition-all placeholder:text-gray-600 font-medium"
                                        />
                                    </div>

                                    <button
                                        disabled={status === 'sending'}
                                        className="w-full py-7 bg-orange-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all group disabled:opacity-50"
                                    >
                                        {status === 'sending' ? (
                                            <FiLoader className="animate-spin" size={20} />
                                        ) : (
                                            <>SEND TO KITCHEN <FiSend className="group-hover:translate-x-2 transition-transform" /></>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const ContactDetail = ({ icon, label, value }) => (
    <div className="flex items-center gap-6 group">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-xl text-gray-900 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm">
            {icon}
        </div>
        <div>
            <span className="block text-[9px] font-black uppercase text-gray-400 tracking-widest">{label}</span>
            <span className="text-lg font-bold text-gray-900">{value}</span>
        </div>
    </div>
);

const FloatingInput = ({ label, name, placeholder, type = "text" }) => (
    <div className="relative">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4 block">{label}</label>
        <input
            type={type}
            name={name}
            required
            placeholder={placeholder}
            className="w-full bg-gray-800 border-2 border-transparent focus:border-orange-600 rounded-2xl p-6 text-white outline-none transition-all placeholder:text-gray-600 font-medium"
        />
    </div>
);

export default Contact;