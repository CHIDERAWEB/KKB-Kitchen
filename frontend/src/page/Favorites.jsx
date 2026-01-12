import React from 'react';
import { Heart, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
    // In a real app, this would come from your Database/Backend
    // For now, let's show what a "Saved" recipe looks like
    const favoriteRecipes = [
        {
            id: 'jollof-1',
            title: "Spicy Jollof Rice",
            image: "https://res.cloudinary.com/dutabdorh/image/upload/v1767632021/pexels-ella-olsson-572949-1640777_oyhwl3.jpg",
            time: "45 mins",
            calories: "550 kcal"
        }
    ];

    return (
        <div className="min-h-screen bg-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900">My Favorites ❤️</h1>
                    <p className="text-gray-500 mt-2">Recipes you've saved to cook later.</p>
                </header>

                {favoriteRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favoriteRecipes.map((recipe) => (
                            <Link
                                to={`/Recipejollofdetail/${recipe.id}`}
                                key={recipe.id}
                                className="group bg-white rounded-4xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={recipe.image}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white p-2 rounded-full text-red-500 shadow-md">
                                        <Heart fill="currentColor" size={20} />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                                    <div className="flex items-center justify-between text-gray-500 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} />
                                            {recipe.time}
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-orange-500">
                                            View Recipe <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <Heart className="mx-auto text-gray-300 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900">No favorites yet</h2>
                        <p className="text-gray-500 mt-2">Start hearting recipes to see them here!</p>
                        <Link to="/" className="mt-6 inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-bold">
                            Explore Recipes
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;