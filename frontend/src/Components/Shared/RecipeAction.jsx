// src/components/shared/RecipeActions.jsx
import React, { useState } from 'react';
import { Heart, Share2, Edit3, MessageCircle } from 'lucide-react';

const RecipeActions = ({ recipeTitle, recipeId }) => {
    const [isLiked, setIsLiked] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert(`Link for ${recipeTitle} copied!`);
    };

    return (
        <div className="flex gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 w-fit">
            {/* LIKE */}
            <button onClick={() => setIsLiked(!isLiked)} className={isLiked ? "text-red-500" : "text-gray-400"}>
                <Heart fill={isLiked ? "currentColor" : "none"} size={22} />
            </button>

            {/* COMMENT */}
            <button className="text-gray-400 hover:text-blue-500">
                <MessageCircle size={22} />
            </button>

            {/* SHARE */}
            <button onClick={handleShare} className="text-gray-400 hover:text-green-500">
                <Share2 size={22} />
            </button>

            {/* EDIT */}
            <button className="text-gray-400 hover:text-orange-500">
                <Edit3 size={22} />
            </button>
        </div>
    );
};

export default RecipeActions;