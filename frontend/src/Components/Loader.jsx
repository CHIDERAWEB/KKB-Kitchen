// import React from 'react';
// import { motion } from 'framer-motion';

// const Loader = () => {
//     return (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{
//                 y: '-100%',
//                 transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
//             }}
//             className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col items-center justify-center overflow-hidden"
//         >
//             {/* Background Ambient Glow - Made smaller */}
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px]" />

//             <div className="relative z-10 flex flex-col items-center">
//                 {/* The Animated Chef Icon - Scaled down from 80 to 48 */}
//                 <motion.div
//                     animate={{
//                         y: [0, -8, 0],
//                         rotate: [0, -3, 3, 0]
//                     }}
//                     transition={{
//                         duration: 3,
//                         repeat: Infinity,
//                         ease: "easeInOut"
//                     }}
//                     className="mb-6"
//                 >
//                     <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M6 18H18V20H6V18ZM12 4C14.76 4 17 6.24 17 9C17 9.34 16.97 9.67 16.9 10C18.66 10.55 20 12.13 20 14C20 16.21 18.21 18 16 18H8C5.79 18 4 16.21 4 14C4 12.13 5.34 10.55 7.1 10C7.03 9.67 7 9.34 7 9C7 6.24 9.24 4 12 4Z" fill="#f97316" />
//                     </svg>
//                 </motion.div>

//                 {/* Brand Text - Reduced size to text-lg */}
//                 <motion.h2
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="text-white text-lg font-black tracking-[0.2em] mb-1 uppercase"
//                 >
//                     KKB <span className="font-signature text-orange-500 text-2xl lowercase tracking-normal">Kitchen</span>
//                 </motion.h2>

//                 {/* Thinner Progress Bar */}
//                 <div className="w-32 h-[1px] bg-white/10 rounded-full mt-4 relative overflow-hidden">
//                     <motion.div
//                         initial={{ left: "-100%" }}
//                         animate={{ left: "100%" }}
//                         transition={{
//                             duration: 1.5,
//                             repeat: Infinity,
//                             ease: "easeInOut"
//                         }}
//                         className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
//                     />
//                 </div>

//                 {/* Tiny Status Message */}
//                 <motion.p
//                     animate={{ opacity: [0.4, 1, 0.4] }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                     className="text-gray-500 text-[8px] font-bold uppercase tracking-[0.4em] mt-4"
//                 >
//                     Loading...
//                 </motion.p>
//             </div>
//         </motion.div>
//     );
// };

// export default Loader;
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    const text = "Rolling out...".split("");

    // Logic to play sound when the loader is about to finish
    useEffect(() => {
        return () => {
            const audio = new Audio('/pop-sound.mp3'); // Put your sound file in the 'public' folder
            audio.volume = 0.5;
            audio.play().catch(err => console.log("Audio play blocked by browser"));
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
                y: '-100%',
                transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
            }}
            className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-md flex items-center justify-center"
        >
            <div className="flex flex-col items-center">

                {/* THE ROLLING TOY */}
                <div className="relative w-64 h-20 flex items-center justify-center">
                    <div className="absolute bottom-4 w-48 h-[3px] bg-orange-100 rounded-full" />

                    <motion.div
                        animate={{
                            x: [-80, 80, -80],
                            rotate: [0, 360, 0],
                            scale: [1, 0.9, 1.1, 1]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[18px] w-12 h-12 bg-orange-500 rounded-[15px] shadow-xl border-4 border-white flex items-center justify-center"
                    >
                        <span className="text-white text-lg font-bold italic">K</span>
                    </motion.div>
                </div>

                {/* THE DANCING TEXT */}
                <div className="mt-4 flex">
                    {text.map((letter, index) => (
                        <motion.span
                            key={index}
                            className="font-signature text-orange-500 text-4xl inline-block"
                            animate={{ y: [0, -15, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: index * 0.1,
                                ease: "easeInOut"
                            }}
                        >
                            {letter === " " ? "\u00A0" : letter}
                        </motion.span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Loader;