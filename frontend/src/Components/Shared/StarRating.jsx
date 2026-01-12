import React from 'react';

const StarRating = ({ rating, reviews, size = "text-xl" }) => {
    return (
        <div className="flex items-center gap-2">
            {/* The Stars */}
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={size}>
                        {i < Math.floor(rating) ? "★" : "☆"}
                    </span>
                ))}
            </div>

            {/* The Review Count (Only shows if 'reviews' is provided) */}
            {reviews && (
                <span className="text-gray-500 font-medium text-sm">
                    {rating} <span className="mx-1 text-gray-300">|</span> {reviews} Reviews
                </span>
            )}
        </div>
    );
};

export default StarRating;