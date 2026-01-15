import React, { useState, useEffect } from 'react';
import { Heart, Clock, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = ({ showToast }) => {
    const [allFavorites, setAllFavorites] = useState([]); // Master list
    const [filteredRecipes, setFilteredRecipes] = useState([]); // Display list
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const userId = user?.id || user?._id;

    const fetchFavorites = async () => {
        if (!token || !userId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const allRecipes = await response.json();

                const filtered = allRecipes.filter(recipe => {
                    return recipe.likedBy?.some(u => {
                        const likedId = typeof u === 'object' ? (u.id || u._id) : u;
                        return likedId?.toString() === userId.toString();
                    });
                });

                setAllFavorites(filtered);
                setFilteredRecipes(filtered);
            }
        } catch (err) {
            console.error("Error fetching favorites:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [token, userId]);

    // Search Logic
    useEffect(() => {
        const filtered = allFavorites.filter(recipe =>
            recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredRecipes(filtered);
    }, [searchQuery, allFavorites]);

    const handleUnfavorite = async (e, recipeId) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(`https://kkb-kitchen-api.onrender.com/api/recipes/${recipeId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: userId })
            });

            if (response.ok) {
                setAllFavorites(prev => prev.filter(r => (r._id || r.id) !== recipeId));
                if (showToast) showToast("Removed from your collection! 🗑️");
            }
        } catch (err) {
            console.error("Unfavorite Error:", err);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <p className="font-black text-orange-500 italic text-xl uppercase tracking-tighter">Opening your cookbook...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">My Favorites ❤️</h1>
                            <p className="text-gray-500 mt-2 font-medium">Your curated collection of culinary masterpieces.</p>
                        </div>
                        <div className="bg-orange-50 px-6 py-2 rounded-2xl border border-orange-100 self-start md:self-auto">
                            <span className="font-black text-orange-600 uppercase text-xs tracking-[0.2em]">
                                {allFavorites.length} Recipes Saved
                            </span>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    {allFavorites.length > 0 && (
                        <div className="relative group max-w-2xl">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by title or category (e.g. Jollof, Breakfast)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-3xl leading-5 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-0 transition-all text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-medium shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                </button>
                            )}
                        </div>
                    )}
                </header>

                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRecipes.map((recipe) => {
                            const rId = recipe._id || recipe.id;
                            return (
                                <Link
                                    to={`/recipe/${rId}`}
                                    key={rId}
                                    className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={recipe.imageUrl || recipe.image}
                                            alt={recipe.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        <button
                                            onClick={(e) => handleUnfavorite(e, rId)}
                                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                                        >
                                            <Heart fill="currentColor" size={20} />
                                        </button>

                                        <div className="absolute bottom-4 left-4">
                                            <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                                {recipe.category || "Main Dish"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                        <h3 className="text-2xl font-black text-gray-900 mb-3 truncate italic uppercase tracking-tighter">
                                            {recipe.title}
                                        </h3>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-2 font-bold text-gray-400 text-xs uppercase">
                                                <Clock size={16} className="text-orange-500" />
                                                {recipe.prepTime || "30-45 mins"}
                                            </div>

                                            <div className="flex items-center gap-1 font-black text-orange-500 text-sm group-hover:gap-3 transition-all">
                                                COOK NOW <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-200">
                        <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                            {allFavorites.length === 0 ? <Heart className="text-gray-200" size={40} /> : <Search className="text-gray-200" size={40} />}
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic">
                            {allFavorites.length === 0 ? "Your kitchen is empty!" : "No results found"}
                        </h2>
                        <p className="text-gray-500 mt-4 font-medium max-w-sm mx-auto">
                            {allFavorites.length === 0
                                ? "Save your favorite recipes here so you never lose a secret ingredient again."
                                : `We couldn't find any recipes matching "${searchQuery}". Try a different term!`}
                        </p>
                        <button
                            onClick={() => allFavorites.length === 0 ? window.location.href = "/" : setSearchQuery("")}
                            className="mt-10 inline-block bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg"
                        >
                            {allFavorites.length === 0 ? "Find Recipes" : "Clear Search"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;