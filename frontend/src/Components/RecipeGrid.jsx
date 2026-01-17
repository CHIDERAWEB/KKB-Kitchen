import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiChevronRight, FiLock, FiEye, FiStar } from 'react-icons/fi';

// ✅ Receive 'user' as a prop from App.js
const RecipeGrid = ({ user }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                // Render APIs spin down after inactivity. 
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

    const handleProtectedNavigation = (recipe, status) => {
        const rawId = recipe.id || recipe._id;

        if (!rawId) {
            console.error("No valid ID found for this recipe:", recipe);
            return;
        }

        // Handle Pending status logic
        if (status === 'pending' && user?.role !== 'admin') {
            alert("👨‍🍳 Chef is still tasting this one! Check back once it's approved.");
            return;
        }

        const cleanId = typeof rawId === 'string' ? rawId : rawId.toString();
        navigate(`/recipe/${cleanId}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <div className="text-center font-black italic text-orange-500 uppercase tracking-widest animate-pulse">
                    Gathering Ingredients...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 gap-4">
                <div>
                    <h2 className="text-5xl md:text-6xl font-black italic text-gray-900 leading-none uppercase tracking-tighter">
                        Kitchen <span className="text-orange-500">Feed</span>
                    </h2>
                    <div className="h-2 w-32 bg-orange-500 rounded-full mt-2" />
                </div>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">
                    {recipes.length} Community Contributions
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {recipes.length > 0 ? (
                    recipes.map((recipe, index) => {
                        const isPending = recipe.status === 'pending';
                        const currentId = recipe._id || recipe.id;
                        
                        // Calculate Rating
                        const rating = recipe.ratings?.length > 0 
                            ? (recipe.ratings.reduce((acc, r) => acc + r.value, 0) / recipe.ratings.length).toFixed(1) 
                            : "5.0";

                        return (
                            <motion.div
                                key={currentId || index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={`group bg-white rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-50 flex flex-col relative ${isPending ? 'cursor-default' : 'cursor-pointer'}`}
                                onClick={() => !isPending && handleProtectedNavigation(recipe, recipe.status)}
                            >
                                {/* Image Container */}
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={recipe.imageUrl || recipe.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={recipe.title || recipe.name}
                                        className={`w-full h-full object-cover transition-transform duration-700 ${!isPending ? 'group-hover:scale-110' : 'blur-[3px] opacity-60'}`}
                                    />

                                    {/* Star Rating Badge */}
                                    {!isPending && (
                                        <div className="absolute top-5 left-5 bg-orange-500 text-white px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 border border-orange-400">
                                            <FiStar size={14} fill="currentColor" />
                                            <span className="text-xs font-black tracking-tighter">{rating}</span>
                                        </div>
                                    )}

                                    {isPending && (
                                        <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px] flex items-center justify-center flex-col gap-2">
                                            <div className="bg-white p-3 rounded-full shadow-xl animate-bounce">
                                                <FiLock className="text-orange-600" size={24} />
                                            </div>
                                            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                                                Under Review
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                                        <FiClock className="text-orange-500" />
                                        <span className="text-xs font-black italic text-gray-800 uppercase">{recipe.cookTime || "30m"}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className={`text-2xl font-black italic uppercase leading-tight mb-6 transition-colors line-clamp-2 ${!isPending ? 'text-gray-900 group-hover:text-orange-600' : 'text-gray-400'}`}>
                                        {recipe.title || recipe.name}
                                    </h3>

                                    <div className="mt-auto pt-6 border-t-2 border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200 overflow-hidden transform rotate-3 group-hover:rotate-0 transition-transform">
                                                {recipe.author?.picture ? (
                                                    <img src={recipe.author.picture} alt="chef" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-black text-lg italic">{(recipe.author?.name || 'K').charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase font-black text-orange-500 tracking-[0.2em]">Chef</span>
                                                <span className="font-bold text-sm text-gray-800 leading-none italic">
                                                    {recipe.author?.name || "Chef KKB"}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProtectedNavigation(recipe, recipe.status);
                                            }}
                                            className="h-12 w-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-xl active:scale-95"
                                        >
                                            {isPending ? <FiEye size={20} className="opacity-50" /> : <FiChevronRight size={28} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100">
                        <p className="text-gray-300 font-black italic text-4xl uppercase tracking-tighter">
                            The Vault is Empty
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeGrid;