// src/shared/Components/Button.jsx
import React from 'react';

const Button = ({ text, onClick, className = "" }) => {
    return (
        <button
            onClick={onClick}
            // Tailwind v4 classes for a modern look
            className={`rounded-full bg-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-orange-700 hover:scale-105 active:scale-95 ${className}`}
        >
            {text}
        </button>
    );
};

export default Button;
