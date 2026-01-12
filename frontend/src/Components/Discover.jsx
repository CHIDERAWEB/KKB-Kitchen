// import React from 'react';
// import Homepage from '../page/Homepage';
// const Discover = () => {
//     const recipes = [
//         {
//             id: 1,
//             title: "Garlic Butter Shrimp",
//             image: "https://res.cloudinary.com/dutabdorh/image/upload/v1767631933/pexels-framed-by-rania-2454533_pkat1n.jpg",
//             time: "20 mins",
//             rating: 5, // Out of 5
//         },
//         // Add more here...
//     ];

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* 1. DISCOVER BANNER (Clean & Simple) */}
//             <div className="relative h-60 bg-orange-600 flex items-center justify-center">
//                 <img
//                     src="https://res.cloudinary.com/dutabdorh/image/upload/v1767632021/pexels-ella-olsson-572949-1640777_oyhwl3.jpg"
//                     className="absolute inset-0 w-full h-full object-cover opacity-40"
//                     alt="Discover Background"
//                 />
//                 <div className="relative text-center">
//                     <h1 className="text-white text-4xl font-bold mb-4">Discover Recipes</h1>
//                     <input
//                         type="text"
//                         placeholder="Search by ingredient or dish..."
//                         className="w-80 md:w-125 px-6 py-3 rounded-full shadow-lg outline-none focus:ring-2 focus:ring-orange-400"
//                     />
//                 </div>
//             </div>

//             {/* 2. THE RECIPE LIST */}
//             <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
//                 {recipes.map((recipe) => (
//                     <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-[1.02] transition-transform">
//                         <img src={recipe.image} className="h-48 w-full object-cover" alt={recipe.title} />

//                         <div className="p-5">
//                             <h3 className="font-bold text-xl mb-1">{recipe.title}</h3>

//                             {/* TIME AND RATING ROW */}
//                             <div className="flex justify-between items-center mt-3">
//                                 <span className="text-gray-500 text-sm flex items-center">
//                                     <span className="mr-1">🕒</span> {recipe.time}
//                                 </span>

//                                 {/* 3. THE RATING STARS LOGIC */}
//                                 <div className="flex text-yellow-400">
//                                     {[...Array(5)].map((_, i) => (
//                                         <span key={i}>{i < recipe.rating ? "★" : "☆"}</span>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };
// <Homepage />

// export default Discover;