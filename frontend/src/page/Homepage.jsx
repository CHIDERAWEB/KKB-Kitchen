import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, Trophy, Clock, Zap, Star, Search, MapPin, Truck, Utensils, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PopularRecipes from '../Components/PopularRecipes';
import ScrollToTop from '../Components/ScrollToTop';

const Homepage = () => {
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // --- AUTH LOGIC ---
        // This checks if a user exists in memory. 
        // If you logout, 'user' becomes null and the buttons disappear.
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Auth error");
            }
        }

        const fetchRecipes = async () => {
            try {
                const response = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/all');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                const recipeArray = Array.isArray(data) ? data : [];
                setRecipes(recipeArray);
                setFilteredRecipes(recipeArray);
            } catch (error) {
                console.error("Error fetching recipes:", error);
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    // Active Search Filter logic
    useEffect(() => {
        const filtered = recipes.filter(recipe => {
            const titleMatch = recipe.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const categoryMatch = recipe.category?.toLowerCase().includes(searchQuery.toLowerCase());
            return titleMatch || categoryMatch;
        });
        setFilteredRecipes(filtered);
    }, [searchQuery, recipes]);

    const categories = [
        { name: 'All', icon: '🍽️', color: 'bg-orange-100' },
        { name: 'Jollof', icon: '🥘', color: 'bg-red-100' },
        { name: 'Breakfast', icon: '🍳', color: 'bg-yellow-100' },
        { name: 'Vegan', icon: '🌿', color: 'bg-green-100' },
        { name: 'Desserts', icon: '🍰', color: 'bg-pink-100' },
    ];

    return (
        <div className="space-y-24 pb-20 overflow-hidden bg-white">

            {/* --- HERO SECTION --- */}
            <section className="pt-24 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">

                        {/* ADMIN LINK - Only appears if user is Admin */}
                        {user?.role === 'admin' && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                <Link to="/admin" className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg">
                                    Admin Console <Zap size={10} fill="currentColor" />
                                </Link>
                            </motion.div>
                        )}

                        <h1 className="text-6xl md:text-8xl font-black italic text-gray-900 leading-[0.9] tracking-tighter">
                            {user ? (
                                <>Welcome, <br /><span className="text-orange-500 font-serif text-7xl lowercase">Chef {user.name.split(' ')[0]}!</span></>
                            ) : (
                                <>Cook like <br /><span className="text-orange-500 font-serif lowercase">a masterpiece.</span></>
                            )}
                        </h1>

                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                <Zap size={12} fill="currentColor" /> {recipes.length} Live Recipes
                            </span>
                            <span className="flex items-center gap-1 bg-gray-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                <Star size={12} fill="currentColor" className="text-yellow-400" /> Community Led
                            </span>
                        </div>

                        <div className="relative max-w-md group">
                            <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Mummy's secret vault..."
                                className="w-full pl-12 pr-6 py-5 bg-gray-50 rounded-[2rem] border-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-700 shadow-sm transition-all"
                            />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 relative hidden lg:block">
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <div className="img-reveal-container h-full w-full">
                                <img src="https://res.cloudinary.com/dutabdorh/image/upload/v1768835321/kkkb_mwy2wf.png" className="w-full h-full object-cover shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 border-[12px] border-white rounded-2xl" alt="Chef's Special" />
                            </div>
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-6 -right-6 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3 border border-gray-50">
                                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-tighter">Kitchen Open</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- CATEGORY PILLS --- */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-6 no-scrollbar max-w-7xl mx-auto">
                {categories.map((cat) => (
                    <motion.div
                        key={cat.name}
                        whileHover={{ y: -5 }}
                        onClick={() => setSearchQuery(cat.name === 'All' ? "" : cat.name)}
                        className={`shrink-0 flex items-center gap-3 ${cat.color} px-10 py-5 rounded-[2.5rem] cursor-pointer border-2 border-transparent hover:border-orange-500 transition-all shadow-sm`}
                    >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="font-black text-gray-900 uppercase text-xs tracking-widest">{cat.name}</span>
                    </motion.div>
                ))}
            </div>

            <PopularRecipes recipes={recipes} loading={loading} />

            {/* --- FEATURES SECTION --- */}
            <section className="px-6 max-w-7xl mx-auto py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <Truck className="text-orange-500" />, title: "Fresh Ingredients", desc: "Sourced daily from local farmers." },
                        { icon: <Utensils className="text-orange-500" />, title: "Authentic Taste", desc: "Recipes passed down through generations." },
                        { icon: <Heart className="text-orange-500" />, title: "Made with Love", desc: "No preservatives, just pure home cooking." }
                    ].map((feature, i) => (
                        <div key={i} className="p-10 bg-gray-50 rounded-[3rem] space-y-4 hover:bg-orange-50 transition-colors group">
                            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">{feature.icon}</div>
                            <h3 className="text-2xl font-black italic tracking-tighter">{feature.title}</h3>
                            <p className="text-gray-500 font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- RECENT DISCOVERIES --- */}
            <section className="px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h3 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Just In</h3>
                        <h2 className="text-5xl font-black text-gray-900 italic tracking-tighter">
                            {searchQuery ? `Searching for "${searchQuery}"` : "Freshly Cooked."}
                        </h2>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map(n => <div key={n} className="h-96 bg-gray-50 animate-pulse rounded-[3rem]"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredRecipes.length > 0 ? (
                            filteredRecipes.slice(0, 6).map((recipe) => {
                                const recipeId = recipe._id || recipe.id;
                                return (
                                    <Link to={`/recipe/${recipeId}`} key={recipeId}>
                                        <motion.div whileHover={{ y: -15 }} className="recipe-card-glass rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all h-full relative group">
                                            <div className="h-80 overflow-hidden relative">
                                                <img src={recipe.imageUrl || recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md h-12 w-12 flex items-center justify-center rounded-2xl shadow-lg text-orange-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Flame size={20} fill="currentColor" />
                                                </div>
                                            </div>
                                            <div className="p-10">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4 block">{recipe.category || 'Secret Recipe'}</span>
                                                <h3 className="text-3xl font-black text-gray-900 mb-6 italic leading-tight line-clamp-2">{recipe.title}</h3>
                                                <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs">
                                                            {recipe.author?.picture ? <img src={recipe.author.picture} className="rounded-full h-full w-full object-cover" alt="author" /> : (recipe.author?.name?.charAt(0) || 'C')}
                                                        </div>
                                                        <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{recipe.author?.name?.split(' ')[0] || 'Chef'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-black text-gray-400"><Clock size={16} /> {recipe.cookTime || '30m'}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase tracking-widest">
                                No recipes match your search.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* --- LOCATION --- */}
            <section className="px-6 max-w-7xl mx-auto">
                <div className="bg-gray-50 rounded-[4rem] p-12 flex flex-col lg:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                        <div className="h-14 w-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><MapPin size={28} /></div>
                        <h2 className="text-5xl font-black italic tracking-tighter">Find Our Kitchen.</h2>
                        <p className="text-gray-500 font-medium text-lg">Visit us for the real smoky experience.</p>
                        <div className="space-y-2 font-black text-gray-900">
                            <p>📍 123 Jollof Avenue, Lagos, Nigeria</p>
                            <p>📞 +234 800 KKB KITCHEN</p>
                        </div>
                    </div>
                    <div className="flex-[1.5] w-full h-[400px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                        <iframe
                            title="map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.492192739439!2d3.3768223!3d6.4599643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a397c7d60e!2sLagos!5e0!3m2!1sen!2sng!4v1710000000000!5m2!1sen!2sng"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy">
                        </iframe>
                    </div>
                </div>
            </section>

            {/* --- CHALLENGE --- */}
            <motion.section className="mx-6 max-w-7xl lg:mx-auto bg-gray-900 rounded-[5rem] p-16 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 lg:w-1/2">
                    <div className="inline-flex items-center gap-2 bg-orange-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-lg"><Trophy size={16} /> Jollof Wars 2026</div>
                    <h2 className="text-6xl md:text-7xl font-black mb-8 leading-[0.9] italic tracking-tighter">Show us your <br /> Smoky Flavor.</h2>
                    <p className="text-gray-400 mb-12 text-xl font-medium max-w-md">Upload your best recipe and compete for the "Golden Ladle" award.</p>
                    <Link to="/add-recipe" className="bg-white text-black px-14 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center gap-3 w-fit">
                        Join Challenge <ArrowRight size={18} />
                    </Link>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
                    <img src="https://res.cloudinary.com/dutabdorh/image/upload/v1768835321/kkkb_mwy2wf.png" className="h-full w-full object-cover opacity-40 mix-blend-overlay grayscale" alt="Jollof" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent" />
                </div>
            </motion.section>

            <ScrollToTop />
        </div>
    );
};

export default Homepage;