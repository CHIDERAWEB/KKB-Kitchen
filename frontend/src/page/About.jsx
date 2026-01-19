import React from 'react';
import { motion } from 'framer-motion';
import { FiInstagram, FiTwitter, FiYoutube, FiHeart, FiStar, FiCoffee, FiSend } from 'react-icons/fi';

// Custom counter component for the stats
const StatCounter = ({ value, label }) => (
    <div className="flex flex-col">
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-gray-900"
        >
            {value}
        </motion.span>
        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">{label}</span>
    </div>
);

const About = () => {
    return (
        <div className="bg-white min-h-screen selection:bg-orange-100 selection:text-orange-600 overflow-x-hidden">

            {/* 1. Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* The "Doll" Frame */}
                    <div className="rounded-[4rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700 border-[12px] border-white relative z-10">
                        <img
                            src="hhttps://res.cloudinary.com/dutabdorh/image/upload/v1768835321/kkkb_mwy2wf.png"
                            alt="Chef KKB"
                            className="w-full aspect-[4/5] object-cover"
                        />
                    </div>

                    {/* Floating Handwritten Badge */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-6 -left-6 bg-orange-500 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-orange-200 -rotate-6 z-20"
                    >
                        <p className="font-signature text-4xl whitespace-nowrap">It's a passion project</p>
                    </motion.div>
                </motion.div>

                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-orange-600 font-black uppercase tracking-widest text-xs bg-orange-50 px-4 py-2 rounded-full">Established 2024</span>
                        <h1 className="text-7xl font-black text-gray-900 mt-6 leading-tight tracking-tighter">
                            Hey, I'm <br />
                            <span className="font-signature text-orange-500 text-8xl lowercase block -mt-2">KKB</span>
                        </h1>
                        <p className="text-2xl font-bold text-gray-400 mt-2 font-serif italic">Founder & Lead Chef</p>
                    </motion.div>

                    <p className="text-xl text-gray-600 leading-relaxed font-medium">
                        KKB Recipes started with a simple problem: my kitchen was a mess of loose papers and
                        forgotten bookmarks. I wanted to create a home for flavors—a place where <span className="text-orange-500 font-bold">African heritage</span> meets modern convenience.
                    </p>

                    <div className="flex gap-12 items-center">
                        <StatCounter value="500+" label="Recipes Tested" />
                        <div className="w-px h-12 bg-gray-200" />
                        <StatCounter value="12k" label="Happy Cooks" />
                    </div>
                </div>
            </section>

            {/* 2. Values Section */}
            <section className="bg-gray-50/50 py-24 px-6 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 text-orange-100/20 text-[20rem] font-black pointer-events-none select-none -mr-20 -mt-20">KKB</div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Why I built this</h2>
                        <p className="font-signature text-3xl text-orange-500 mt-2 italic">The secret sauce of KKB</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <FiHeart />, title: "Community First", text: "Food tastes better when shared. We build for the people." },
                            { icon: <FiStar />, title: "Quality Always", text: "Every recipe is tested three times before it hits your screen." },
                            { icon: <FiCoffee />, title: "Keep it Simple", text: "No 50-ingredient lists. Just honest, delicious cooking." }
                        ].map((item, i) => (
                            <motion.div
                                whileHover={{ y: -10 }}
                                key={i}
                                className="bg-white p-12 rounded-[3.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100"
                            >
                                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-[1.5rem] flex items-center justify-center mb-8 text-3xl shadow-inner shadow-orange-200/50">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4">{item.title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. The "Postcard" Contact Section */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="bg-gray-900 rounded-[5rem] p-10 md:p-20 relative overflow-hidden flex flex-col lg:flex-row gap-20 items-center">

                    {/* Animated Glow behind Form */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]" />

                    {/* Form Side */}
                    <div className="w-full lg:w-1/2 relative z-10">
                        <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">
                            Let's talk <br />
                            <span className="font-signature text-orange-500 text-6xl lowercase">flavor</span>
                        </h2>
                        <p className="text-gray-400 font-medium mb-12 text-lg">Have a recipe request or just want to say hi? <br />The kitchen is always open.</p>

                        <form className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-gray-500 focus:border-orange-500 focus:bg-white/10 outline-none transition-all" />
                                <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-gray-500 focus:border-orange-500 focus:bg-white/10 outline-none transition-all" />
                            </div>
                            <textarea rows="4" placeholder="What's on your mind?..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-gray-500 focus:border-orange-500 focus:bg-white/10 outline-none transition-all" />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-orange-900/40 transition-all flex items-center justify-center gap-3 text-sm"
                            >
                                Send Message <FiSend size={18} />
                            </motion.button>
                        </form>
                    </div>

                    {/* Postcard Side */}
                    <motion.div
                        initial={{ rotate: 15, y: 50, opacity: 0 }}
                        whileInView={{ rotate: -3, y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-full lg:w-1/2 flex justify-center lg:justify-end"
                    >
                        <div className="bg-[#fffcf5] p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] w-full max-w-[420px] relative border-[12px] border-white ring-1 ring-black/5">

                            {/* Vintage Stamp */}
                            <div className="absolute top-8 right-8 w-20 h-24 bg-orange-100 rounded-lg border-4 border-dashed border-orange-200 flex items-center justify-center flex-col p-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
                                <div className="font-signature text-orange-500 text-3xl">K</div>
                                <div className="text-[10px] font-black text-orange-400 mt-1 uppercase">Postage</div>
                            </div>

                            <div className="space-y-8 pt-12">
                                <p className="font-signature text-4xl text-gray-700 leading-relaxed italic">
                                    "We believe the best conversations happen over a hot plate of food."
                                </p>
                                <div className="h-px w-full bg-gray-200" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">To: My Fellow Chefs</span>
                                    <span className="font-bold text-gray-800 italic text-lg leading-tight">Chef KKB Kitchen,<br />World Wide Web</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 4. Footer */}
            <footer className="py-20 text-center px-6">
                <div className="flex justify-center gap-4 mb-12">
                    {[FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                        <motion.button
                            whileHover={{ y: -5, scale: 1.1 }}
                            key={i}
                            className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all border border-gray-100"
                        >
                            <Icon size={24} />
                        </motion.button>
                    ))}
                </div>
                <p className="text-gray-300 font-black uppercase tracking-[0.5em] text-[10px]">
                    © 2026 KKB Recipes • <span className="text-orange-500 font-signature text-2xl normal-case ml-2">Happy Cooking!</span>
                </p>
            </footer>
        </div>
    );
};

export default About;