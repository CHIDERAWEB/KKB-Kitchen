import React from 'react';
import { motion } from 'framer-motion';
import { FiInstagram, FiTwitter, FiYoutube, FiMail, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 pt-24 pb-12 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* 1. TOP SECTION: Newsletter */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-20 border-b border-white/10 pb-20">
                    <div>
                        <h2 className="text-4xl font-black text-white mb-4 leading-tight">
                            Get the <span className="font-signature text-orange-500 text-5xl lowercase">secret</span> recipes <br />
                            straight to your inbox.
                        </h2>
                        <p className="text-gray-400 font-medium">Join 12,000+ home cooks. No spam, just deliciousness.</p>
                    </div>

                    <div className="relative">
                        <div className="flex bg-white/5 p-2 rounded-3xl border border-white/10 focus-within:border-orange-500 transition-all">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-transparent border-none outline-none px-6 py-4 text-white w-full placeholder:text-gray-500"
                            />
                            <button className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-500 transition-all">
                                Join <FiArrowRight />
                            </button>
                        </div>
                        {/* Decorative Handwritten Note */}
                        <motion.p
                            initial={{ opacity: 0, rotate: -10 }}
                            whileInView={{ opacity: 1, rotate: -5 }}
                            className="absolute -bottom-10 right-4 font-signature text-orange-400/60 text-xl"
                        >
                            Unsubscribe anytime!
                        </motion.p>
                    </div>
                </div>

                {/* 2. MIDDLE SECTION: Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="text-3xl font-black text-white flex items-center gap-2 mb-6">
                            KKB<span className="text-orange-600">.</span>
                        </Link>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Curating the finest African and modern flavors for the everyday chef.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Explore</h4>
                        <ul className="space-y-4 text-gray-400 font-bold">
                            <li><Link to="/discover" className="hover:text-orange-500 transition-colors">Discover</Link></li>
                            <li><Link to="/planner" className="hover:text-orange-500 transition-colors">Meal Planner</Link></li>
                            <li><Link to="/shopping-list" className="hover:text-orange-500 transition-colors">Shopping List</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Company</h4>
                        <ul className="space-y-4 text-gray-400 font-bold">
                            <li><Link to="/about" className="hover:text-orange-500 transition-colors">Our Story</Link></li>
                            <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link></li>
                            <li><Link to="/careers" className="hover:text-orange-500 transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Connect</h4>
                        <div className="flex gap-4">
                            {[FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM SECTION: Legal */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
                        © 2026 KKB RECIPES. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-8 text-gray-600 text-xs font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                    <p className="font-signature text-orange-500/40 text-2xl select-none">
                        Made with love by KKB
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;