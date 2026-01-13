import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Eye, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PopularRecipes = ({ recipes: initialRecipes, loading: initialLoading }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If the Homepage already gave us recipes, use them!
        if (initialRecipes && initialRecipes.length > 0) {
            // Sort by views to show the most "Popular" ones first
            const sorted = [...initialRecipes].sort((a, b) => (b.views || 0) - (a.views || 0));
            setRecipes(sorted);
            setLoading(initialLoading);
        } else {
            // Fallback: Fetch manually if Homepage didn't provide data
            const fetchPopular = async () => {
                try {
                    const response = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/all');
                    const data = await response.json();
                    const sorted = Array.isArray(data)
                        ? data.sort((a, b) => (b.views || 0) - (a.views || 0))
                        : [];
                    setRecipes(sorted);
                } catch (error) {
                    console.error("Error fetching popular recipes:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPopular();
        }
    }, [initialRecipes, initialLoading]);

    // Show a clean skeleton loader while waiting
    if (loading) return (
        <div className="py-10 px-6 max-w-7xl mx-auto flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="shrink-0 w-[280px] h-[350px] bg-gray-100 animate-pulse rounded-[3rem]" />
            ))}
        </div>
    );

    if (recipes.length === 0) return null;

    return (
        <section className="py-10 px-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black italic text-gray-900 flex items-center gap-2">
                        Trending Now <Flame className="text-orange-500" fill="currentColor" />
                    </h2>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Most viewed by the community</p>
                </div>
            </div>

            {/* Horizontal Scroll for Popular Items */}
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
                {recipes.slice(0, 8).map((r, i) => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="shrink-0 w-[280px] group"
                    >
                        <Link to={`/Recipejollofdetail/${r.id}`}>
                            <div className="relative h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
                                <img
                                    src={r.imageUrl || 'https://via.placeholder.com/300x400'}
                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    alt={r.title}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                {/* Stats Badges */}
                                <div className="absolute top-6 left-6 flex gap-2">
                                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-black uppercase">
                                        <Eye size={12} /> {r.views || 0}
                                    </div>
                                    <div className="bg-orange-500 px-3 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-black uppercase">
                                        <Heart size={12} fill="white" /> {r.likedBy?.length || 0}
                                    </div>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-2">#TopFlavor</p>
                                    <h4 className="font-black text-2xl italic leading-tight">{r.title}</h4>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase text-gray-300">
                                        View Recipe <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default PopularRecipes;