import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiEdit3, FiArrowLeft, FiMessageCircle, FiLoader } from 'react-icons/fi';

const Revisions = ({ user }) => {
    const [rejectedRecipes, setRejectedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRejections = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetching all recipes owned by this user
                const response = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/my-recipes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                // Logic: Filter specifically for 'rejected' status
                if (Array.isArray(data)) {
                    setRejectedRecipes(data.filter(r => r.status === 'rejected'));
                }
            } catch (err) {
                console.error("Error fetching revisions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRejections();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <FiLoader className="text-orange-500 animate-spin mb-4" size={32} />
            <p className="font-black text-orange-500 uppercase tracking-[0.3em] text-[10px]">Opening the Feedback Log</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-20 selection:bg-red-500 selection:text-white">
            <div className="max-w-4xl mx-auto">
                
                {/* --- NAVIGATION --- */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="group flex items-center gap-2 text-gray-400 font-black text-[10px] tracking-widest mb-8 hover:text-orange-600 transition-all"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                    BACK TO KITCHEN
                </button>

                {/* --- HEADER --- */}
                <div className="mb-12 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em]">Attention Required</span>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase text-gray-900 tracking-tighter leading-none">
                        Revision <span className="text-red-600">Center</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">
                        {rejectedRecipes.length} {rejectedRecipes.length === 1 ? 'Recipe' : 'Recipes'} flagged for feedback
                    </p>
                </div>

                {/* --- CONTENT LIST --- */}
                <div className="space-y-6">
                    {rejectedRecipes.length > 0 ? (
                        rejectedRecipes.map((recipe, idx) => (
                            <motion.div 
                                key={recipe.id || recipe._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-[2.5rem] border-2 border-red-50 p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-red-100 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Thumbnail */}
                                    <div className="relative w-full md:w-44 h-44 rounded-[2rem] overflow-hidden bg-gray-100 shrink-0 shadow-inner">
                                        <img 
                                            src={recipe.imageUrl || 'https://via.placeholder.com/300'} 
                                            alt={recipe.title} 
                                            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>

                                    {/* Info & Feedback */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter leading-none group-hover:text-red-600 transition-colors">
                                                    {recipe.title}
                                                </h2>
                                                <p className="text-[9px] font-black text-gray-400 uppercase mt-2 tracking-widest">
                                                    Submitted: {new Date(recipe.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
                                                <FiAlertCircle className="animate-bounce" /> Action Required
                                            </div>
                                        </div>

                                        {/* THE ADMIN FEEDBACK BOX */}
                                        <div className="bg-gray-50 rounded-3xl p-6 mb-6 border-l-8 border-red-500 relative overflow-hidden">
                                            <div className="flex items-center gap-2 text-red-500/50 mb-3">
                                                <FiMessageCircle size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Administrator Notes</span>
                                            </div>
                                            <p className="text-gray-700 font-bold italic text-sm leading-relaxed relative z-10">
                                                "{recipe.adminNote || "No specific instructions provided. Please ensure all ingredients and steps match the high-quality standards of KKB Kitchen."}"
                                            </p>
                                            <div className="absolute top-[-10px] right-[-10px] text-red-100 opacity-20">
                                                <FiMessageCircle size={100} />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button 
                                            onClick={() => navigate(`/edit-recipe/${recipe.id || recipe._id}`)}
                                            className="flex items-center justify-center gap-3 w-full md:w-auto px-10 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95"
                                        >
                                            <FiEdit3 size={16} /> Update & Resubmit
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-32 bg-white rounded-[3.5rem] border-4 border-dashed border-gray-100"
                        >
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiAlertCircle size={32} className="rotate-180" />
                            </div>
                            <p className="text-gray-300 font-black italic text-3xl uppercase tracking-tighter">Clearance Achieved</p>
                            <p className="text-gray-400 text-[10px] mt-2 font-black uppercase tracking-widest">No recipes require revision at this time.</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Revisions;