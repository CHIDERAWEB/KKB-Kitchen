import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiChevronRight, FiLock, FiEye } from 'react-icons/fi';

const RecipeGrid = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Get current user to allow Admin to bypass the "Lock"
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                // Now fetching ALL (including pending) to keep the site busy
                const response = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/all');
                const data = await response.json();
                setRecipes(data);
            } catch (err) {
                console.error("Grid Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    const handleProtectedNavigation = (recipeId, status) => {
        if (status === 'pending' && user?.role !== 'admin') {
            alert("👨‍🍳 Chef is still tasting this one! Check back once it's approved.");
            return;
        }
        navigate(`/recipe/${recipeId}`);
    };

    if (loading) return <div className="text-center py-20 font-black italic text-orange-500 uppercase tracking-widest">Gathering Ingredients...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-end justify-between mb-12">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Kitchen Feed</h2>
                    <div className="h-1.5 w-20 bg-orange-500 rounded-full" />
                </div>
                <p className="hidden md:block text-gray-400 font-bold uppercase text-xs tracking-widest">
                    {recipes.length} Community Contributions
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {recipes.map((recipe, index) => {
                    const isPending = recipe.status === 'pending';

                    return (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col relative ${isPending ? 'cursor-not-allowed' : ''}`}
                        >
                            {/* --- IMAGE SECTION --- */}
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    src={recipe.imageUrl || recipe.image}
                                    alt={recipe.title}
                                    className={`w-full h-full object-cover transition-transform duration-700 ${!isPending ? 'group-hover:scale-110' : 'blur-[2px] opacity-60'}`}
                                />

                                {/* PENDING OVERLAY: Keeps them busy but prevents viewing */}
                                {isPending && (
                                    <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] flex items-center justify-center flex-col gap-2">
                                        <div className="bg-white/90 p-3 rounded-full shadow-xl">
                                            <FiLock className="text-orange-600" size={24} />
                                        </div>
                                        <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                            Under Review
                                        </span>
                                    </div>
                                )}

                                <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                                    <FiClock className="text-orange-500" />
                                    <span className="text-xs font-black text-gray-800">{recipe.cookTime || "30m"}</span>
                                </div>
                            </div>

                            {/* --- CONTENT SECTION --- */}
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className={`text-2xl font-black text-gray-900 mb-6 transition-colors line-clamp-1 ${!isPending ? 'group-hover:text-orange-600' : 'text-gray-400'}`}>
                                    {recipe.title}
                                </h3>

                                <div className="mt-auto pt-6 border-t border-dashed border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
                                            {recipe.author?.picture ? (
                                                <img src={recipe.author.picture} alt="chef" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-black text-sm">{recipe.author?.name?.charAt(0) || 'K'}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black text-gray-300 tracking-wider">Chef</span>
                                            <span className="font-bold text-sm text-gray-700 leading-none">
                                                {recipe.author?.name || "Chef KKB"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* NAVIGATION BUTTON */}
                                    <button
                                        onClick={() => handleProtectedNavigation(recipe.id, recipe.status)}
                                        className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm group/btn"
                                    >
                                        {isPending ? <FiEye size={20} className="opacity-50" /> : <FiChevronRight size={24} />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecipeGrid;