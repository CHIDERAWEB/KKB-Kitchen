import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, Trophy, Clock, User, Zap, Star, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import PopularRecipes from '../components/PopularRecipes';

const Homepage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchRecipes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/recipes/all');
                const data = await response.json();
                setRecipes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching recipes:", error);
                setRecipes([]); 
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    const categories = [
        { name: 'All', icon: '🍽️', color: 'bg-orange-100' },
        { name: 'Jollof', icon: '🥘', color: 'bg-red-100' },
        { name: 'Breakfast', icon: '🍳', color: 'bg-yellow-100' },
        { name: 'Vegan', icon: '🌿', color: 'bg-green-100' },
        { name: 'Desserts', icon: '🍰', color: 'bg-pink-100' },
    ];

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-16 pb-20 overflow-hidden bg-white">
            
            {/* --- HERO SECTION: PERSONALIZED & VISUAL --- */}
            <section className="pt-24 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 space-y-6"
                    >
                        <h1 className="text-6xl md:text-8xl font-black italic text-gray-900 leading-[0.9] tracking-tighter">
                            {user ? (
                                <>Welcome, <br/><span className="text-orange-500 font-serif lowercase">Chef {user.name.split(' ')[0]}!</span></>
                            ) : (
                                <>Cook like <br/><span className="text-orange-500 font-serif lowercase">a masterpiece.</span></>
                            )}
                        </h1>
                        
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                <Zap size={12} fill="currentColor"/> 12 New Recipes
                            </span>
                            <span className="flex items-center gap-1 bg-gray-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                <Star size={12} fill="currentColor" className="text-yellow-400"/> Pro Community
                            </span>
                        </div>

                        {/* Search Bar - Makes it functional and fills space */}
                        <div className="relative max-w-md group">
                            <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                <Search size={20} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search Mummy's secret vault..." 
                                className="w-full pl-12 pr-6 py-5 bg-gray-50 rounded-[2rem] border-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-700 shadow-sm transition-all"
                            />
                        </div>
                    </motion.div>

                    {/* NEW: Floating Hero Image */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="flex-1 relative hidden lg:block"
                    >
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <img 
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" 
                                className="w-full h-full object-cover rounded-[4rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 border-[12px] border-white"
                                alt="Chef's Special"
                            />
                            {/* Floating "Live" badge */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute -top-6 -right-6 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3 border border-gray-50"
                            >
                                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-tighter">Chef Online</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- SECTION 1: CATEGORY PILLS (STAGGERED) --- */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex gap-4 overflow-x-auto pb-4 px-6 no-scrollbar max-w-7xl mx-auto"
            >
                {categories.map((cat) => (
                    <motion.div
                        key={cat.name}
                        variants={itemVariants}
                        whileHover={{ y: -5, backgroundColor: '#fff', borderColor: '#f97316' }}
                        className={`shrink-0 flex items-center gap-3 ${cat.color} px-10 py-5 rounded-[2.5rem] cursor-pointer border-2 border-transparent transition-all shadow-sm`}
                    >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="font-black text-gray-900 uppercase text-xs tracking-widest">{cat.name}</span>
                    </motion.div>
                ))}
            </motion.div>

            {/* --- SECTION 2: POPULAR (THE SIZZLING SECTION) --- */}
            <PopularRecipes /> 

            {/* --- SECTION 3: RECENT DISCOVERIES --- */}
            <section className="px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h3 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Just In</h3>
                        <h2 className="text-5xl font-black text-gray-900 italic tracking-tighter">Freshly Cooked.</h2>
                    </div>
                    <Link to="/recipes" className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors">
                        View All <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="h-96 bg-gray-50 animate-pulse rounded-[3rem]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {recipes.slice(0, 6).map((recipe) => (
                            <Link to={`/Recipejollofdetail/${recipe.id}`} key={recipe.id}>
                                <motion.div
                                    whileHover={{ y: -15 }}
                                    className="bg-white rounded-[3.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all h-full relative group"
                                >
                                    <div className="h-80 overflow-hidden relative">
                                        <img 
                                            src={recipe.imageUrl || 'https://via.placeholder.com/400x300'} 
                                            alt={recipe.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                        />
                                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md h-12 w-12 flex items-center justify-center rounded-2xl shadow-lg text-orange-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Flame size={20} fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="p-10">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4 block">
                                            {recipe.category || 'Secret Recipe'}
                                        </span>
                                        <h3 className="text-3xl font-black text-gray-900 mb-6 italic leading-tight">{recipe.title}</h3>
                                        
                                        <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs">
                                                    {recipe.author?.name?.charAt(0) || 'C'}
                                                </div>
                                                <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{recipe.author?.name?.split(' ')[0] || 'Chef'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-black text-gray-400">
                                                <Clock size={16} /> {recipe.cookTime || '30m'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* --- SECTION 4: COMMUNITY CHALLENGE --- */}
            <motion.section
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="mx-6 max-w-7xl lg:mx-auto bg-gray-900 rounded-[5rem] p-16 text-white relative overflow-hidden shadow-2xl"
            >
                <div className="relative z-10 lg:w-1/2">
                    <div className="inline-flex items-center gap-2 bg-orange-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-lg">
                        <Trophy size={16} /> The Jollof Wars 2026
                    </div>
                    <h2 className="text-6xl md:text-7xl font-black mb-8 leading-[0.9] italic tracking-tighter">Show us your <br/> Smoky Flavor.</h2>
                    <p className="text-gray-400 mb-12 text-xl font-medium max-w-md">Upload your best Jollof recipe and compete for the "Golden Ladle" award.</p>
                    <button className="bg-white text-black px-14 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95">
                        Join Challenge
                    </button>
                </div>
                
                {/* Visual side of the banner */}
                <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
                    <img 
                        src="https://images.unsplash.com/photo-1567073383164-ce59bda79c0e?q=80&w=2000&auto=format&fit=crop" 
                        className="h-full w-full object-cover opacity-40 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent" />
                </div>
            </motion.section>
        </div>
    );
};

export default Homepage;