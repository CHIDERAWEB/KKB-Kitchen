import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Banner() {
    const images = [
        "https://res.cloudinary.com/dutabdorh/image/upload/v1767630984/katie-smith-uQs1802D0CQ-unsplash_xexgsy.jpg",
        "https://res.cloudinary.com/dutabdorh/image/upload/v1767632021/pexels-ella-olsson-572949-1640777_oyhwl3.jpg",
        "https://res.cloudinary.com/dutabdorh/image/upload/v1767631933/pexels-framed-by-rania-2454533_pkat1n.jpg",
        "https://res.cloudinary.com/dutabdorh/image/upload/v1757552996/cld-sample-4.jpg"
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className="relative h-[85vh] w-full overflow-hidden bg-gray-900">
            {/* 1. BACKGROUND IMAGES */}
            {images.map((url, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-60" : "opacity-0"
                        }`}
                >
                    <img
                        src={url}
                        alt={`Delicious food ${index}`}
                        className={`w-full h-full object-cover transition-transform duration-[5000ms] ease-linear ${index === currentIndex ? "scale-110" : "scale-100"
                            }`}
                    />
                </div>
            ))}

            {/* 2. GRADIENT OVERLAY - Adjusted 'to-black/80' to anchor the bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

            {/* 3. CENTER CONTENT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`text-${currentIndex}`}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-orange-400 font-black uppercase tracking-[0.4em] text-xs mb-4 block text-shadow-sm">
                        Est. 2024 • Taste of Home
                    </span>

                    <h1 className="text-white text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4">
                        MUMMY'S <br />
                        <span className="font-signature text-orange-500 text-7xl md:text-9xl lowercase block -mt-4 drop-shadow-2xl">
                            Recipes
                        </span>
                    </h1>

                    <div className="flex items-center gap-4 justify-center mt-6">
                        <div className="h-[2px] w-12 bg-white/30" />
                        <p className="text-white/80 font-medium italic tracking-wide">Handcrafted with love</p>
                        <div className="h-[2px] w-12 bg-white/30" />
                    </div>
                </motion.div>
            </div>

            {/* 4. PREMIUM PROGRESS INDICATORS */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className="group py-4 px-2 focus:outline-none"
                    >
                        <div className={`h-[3px] transition-all duration-500 rounded-full ${i === currentIndex
                            ? "w-12 bg-orange-500"
                            : "w-6 bg-white/40 group-hover:bg-white/70"
                            }`} />
                    </button>
                ))}
            </div>

            {/* 5. FIXED SCROLL DECORATION - Changed white to black/transparent to remove glare */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
        </section>
    );
}

export default Banner;