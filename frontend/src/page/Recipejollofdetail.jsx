import React, { useState, useEffect } from 'react';
import { Heart, Share2, Clock, ChevronLeft, CheckCircle, Utensils, MessageSquare, Eye, Trash2, Lock, Printer } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const Recipejollofdetail = ({ showToast }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                // Fetch Main Recipe
                const response = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/${id}`);
                if (!response.ok) throw new Error("Recipe not found");
                const data = await response.json();

                const formattedData = {
                    ...data,
                    ingredients: Array.isArray(data.ingredients) ? data.ingredients : (data.ingredients?.split(',').filter(i => i.trim() !== "") || []),
                    instructions: Array.isArray(data.instructions) ? data.instructions : (data.instructions?.split('.').filter(i => i.trim() !== "") || [])
                };

                setRecipe(formattedData);
                setIsLiked(data.likedBy?.some(u => (typeof u === 'object' ? u.id === user?.id : u === user?.id)) || false);

                // Fetch Recommendations (All recipes, then filter out current one)
                const recRes = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes`);
                const recData = await recRes.json();
                setRecommendations(recData.filter(r => r._id !== id).slice(0, 4));

            } catch (err) {
                console.error(err);
                setRecipe(null);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipeData();
        window.scrollTo(0, 0);
    }, [id, user?.id]);

    const handlePrint = () => window.print();

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        if (showToast) showToast("Link copied to clipboard! 📋");
    };

    const handleLike = async () => {
        if (!user) return showToast("Please login to like recipes! 🔐");
        try {
            await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/${id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId: user?.id })
            });
            setIsLiked(!isLiked);
            setRecipe(prev => ({
                ...prev,
                likedBy: !isLiked ? [...(prev.likedBy || []), user.id] : prev.likedBy.filter(u => (typeof u === 'object' ? u.id !== user.id : u !== user.id))
            }));
            showToast(!isLiked ? "Added to favorites! ❤️" : "Removed from favorites");
        } catch (err) { console.error(err); }
    };

    const handlePostComment = async () => {
        if (!newCommentText.trim() || !user) return;
        try {
            const response = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text: newCommentText, userName: user?.name || "Guest Chef" })
            });
            const savedComment = await response.json();
            setRecipe(prev => ({ ...prev, comments: [savedComment, ...(prev.comments || [])] }));
            setNewCommentText("");
            showToast("Comment posted! 🥂");
        } catch (err) { console.error(err); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Remove this comment?")) return;
        try {
            const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setRecipe(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentId) }));
                showToast("Deleted! 🗑️");
            }
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-orange-500 italic text-3xl">Loading...</div>;
    if (!recipe) return <div className="text-center pt-20 h-screen">Recipe not found</div>;

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* PRINT STYLES */}
            <style>
                {`@media print { .no-print { display: none !important; } .print-area { margin: 0; padding: 0; box-shadow: none; border: none; } }`}
            </style>

            <div className="relative h-96 w-full no-print">
                <img src={recipe.imageUrl} className="w-full h-full object-cover" alt={recipe.title} />
                <Link to="/" className="absolute top-6 left-6 bg-white/80 p-2 rounded-full shadow-lg"><ChevronLeft /></Link>
            </div>

            <div className="max-w-4xl mx-auto -mt-24 relative bg-white rounded-t-[3rem] p-8 md:p-12 shadow-2xl print-area">
                <div className="flex justify-between items-center mb-8 pb-6 border-b no-print">
                    <div className="flex gap-4">
                        <div className="bg-blue-50 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"><Eye size={14} /> {recipe.views || 0}</div>
                        <div className="bg-red-50 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"><Heart size={14} /> {recipe.likedBy?.length || 0}</div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handlePrint} className="p-4 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-all"><Printer size={24} /></button>
                        <button onClick={handleLike} className={`p-4 rounded-full transition-all shadow-md ${isLiked ? 'bg-red-500 text-white' : 'bg-gray-50'}`}><Heart size={24} fill={isLiked ? "white" : "none"} /></button>
                        <button onClick={handleShare} className="p-4 bg-gray-900 text-white rounded-full"><Share2 size={24} /></button>
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black mb-10 italic uppercase leading-none">{recipe.title}</h1>

                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div>
                        <h3 className="text-2xl font-black mb-6 italic text-orange-600 uppercase tracking-widest flex items-center gap-2"><Utensils /> Ingredients</h3>
                        <ul className="space-y-3">
                            {recipe.ingredients.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold text-gray-700 bg-gray-50 p-4 rounded-2xl"><CheckCircle size={20} className="text-orange-500" /> {item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black mb-6 italic text-orange-600 uppercase tracking-widest flex items-center gap-2"><Clock /> Method</h3>
                        <div className="space-y-8">
                            {recipe.instructions.map((step, i) => (
                                <div key={i} className="flex gap-5 group">
                                    <span className="text-4xl font-black text-orange-100 group-hover:text-orange-400 leading-none">{i + 1}</span>
                                    <p className="text-gray-600 font-bold leading-relaxed">{step.trim()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chatter Section */}
                <div className="no-print border-t-4 border-dashed border-gray-100 pt-10">
                    <h3 className="text-3xl font-black mb-8 italic flex items-center gap-3">
                        <MessageSquare size={32} className="text-orange-500" /> Kitchen Chatter
                        <span className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full">{recipe.comments?.length || 0}</span>
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 mb-12">
                        <input type="text" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Secret tips?" className="flex-1 bg-gray-50 rounded-2xl p-5 outline-none font-bold" />
                        <button onClick={handlePostComment} className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black uppercase">Post</button>
                    </div>
                    <div className="space-y-6">
                        {recipe.comments?.map((c) => (
                            <div key={c.id} className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 relative group shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-black text-xl text-gray-900">@{c.userName || 'Chef'}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-black uppercase">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'New'}</span>
                                        {user?.role === 'admin' && <button onClick={() => handleDeleteComment(c.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>}
                                    </div>
                                </div>
                                <p className="text-gray-600 font-bold italic">"{c.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RECOMMENDED SECTION */}
                <div className="no-print mt-20">
                    <h3 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">You might also like...</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {recommendations.map((rec) => (
                            <Link key={rec._id} to={`/recipe/${rec._id}`} className="group">
                                <div className="relative h-40 rounded-3xl overflow-hidden mb-3">
                                    <img src={rec.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rec.title} />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                                </div>
                                <p className="font-black text-sm uppercase tracking-tight group-hover:text-orange-500 transition-colors line-clamp-1">{rec.title}</p>
                            </Link>
                        ))}vf
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recipejollofdetail;