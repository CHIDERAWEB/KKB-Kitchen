import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiEdit3, FiArrowLeft, FiMessageCircle } from 'react-icons/fi';

const Revisions = ({ user }) => {
    const [rejectedRecipes, setRejectedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRejections = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/my-recipes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                // Filter specifically for rejected status
                setRejectedRecipes(data.filter(r => r.status === 'rejected'));
            } catch (err) {
                console.error("Error fetching revisions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRejections();
    }, []);

    if (loading) return <div className="py-40 text-center font-black animate-pulse text-orange-500">OPENING THE FEEDBACK LOG...</div>;

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-orange-600 transition-colors">
                    <FiArrowLeft /> BACK TO KITCHEN
                </button>

                <h1 className="text-5xl font-black italic uppercase text-gray-900 mb-2">
                    Revision <span className="text-red-600">Center</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-12">
                    {rejectedRecipes.length} Recipes require your attention
                </p>

                <div className="space-y-6">
                    {rejectedRecipes.length > 0 ? (
                        rejectedRecipes.map((recipe) => (
                            <motion.div 
                                key={recipe.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-[2.5rem] border-2 border-red-100 p-8 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Recipe Mini Image */}
                                    <div className="w-full md:w-40 h-40 rounded-3xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover opacity-80" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-2xl font-black italic uppercase text-gray-800">{recipe.title}</h2>
                                            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                <FiAlertCircle /> Needs Action
                                            </div>
                                        </div>

                                        {/* THE FEEDBACK BOX */}
                                        <div className="bg-gray-50 rounded-2xl p-5 mb-6 border-l-4 border-red-500">
                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                <FiMessageCircle size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">Chef's Instructions:</span>
                                            </div>
                                            <p className="text-gray-700 italic text-sm">
                                                "{recipe.adminNote || "No specific instructions provided. Please review the recipe details for accuracy."}"
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                                            className="flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-orange-600 transition-all active:scale-95"
                                        >
                                            <FiEdit3 /> Open Recipe Editor
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                            <p className="text-gray-300 font-black italic text-2xl uppercase">No Revisions Needed!</p>
                            <p className="text-gray-400 text-sm mt-2 font-bold uppercase">All your recipes are either approved or pending.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Revisions;