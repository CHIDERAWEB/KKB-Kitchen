import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiChevronRight, FiClock, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const RecipeGrid = ({ user }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io("https://kkb-kitchen-api.onrender.com");
    socket.on("recipeRejected", (data) => {
      if (user && data.authorId === user.id) {
        alert(`❌ Recipe Rejected: "${data.title}"\nReason: ${data.reason}`);
      }
      setRecipes((prev) =>
        prev.filter((r) => (r._id || r.id) !== data.recipeId),
      );
    });
    return () => {
      socket.off("recipeRejected");
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(
          "https://kkb-kitchen-api.onrender.com/api/recipes/all",
        );
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        console.error("Grid Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const handleProtectedNavigation = (recipe, status) => {
    const rawId = recipe.id || recipe._id;
    if (!rawId) return;
    if (status === "pending" && user?.role !== "admin") {
      alert(
        "👨‍🍳 Chef is still tasting this one! Check back once it's approved.",
      );
      return;
    }
    navigate(`/recipe/${rawId.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-14 h-14 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="font-black italic text-orange-500 uppercase tracking-widest animate-pulse">
          Gathering Ingredients...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
        <div>
          <h2 className="text-4xl md:text-6xl font-black italic text-gray-900 uppercase tracking-tighter">
            Kitchen <span className="text-orange-500">Feed</span>
          </h2>
          <div className="h-1.5 w-20 bg-orange-500 rounded-full mt-2" />
        </div>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
          {recipes.length} Contributions
        </p>
      </div>

      {/* ✅ Staggered Artistic Grid */}
      {/* We use grid-cols-2 for mobile so they are always side-by-side */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8 items-start">
        {recipes.length > 0 ? (
          recipes.map((recipe, index) => {
            const isPending = recipe.status === "pending";
            const currentId = recipe._id || recipe.id;
            const rating =
              recipe.ratings?.length > 0
                ? (
                  recipe.ratings.reduce((acc, r) => acc + r.value, 0) /
                  recipe.ratings.length
                ).toFixed(1)
                : "5.0";

            return (
              <motion.div
                key={currentId || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                // ✅ This is the secret sauce:
                // Every second item (index % 2 === 1) gets a top margin to offset it
                className={`group bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col relative 
                  ${index % 2 === 1 ? "mt-8 md:mt-16" : ""} 
                  ${isPending ? "cursor-default" : "cursor-pointer"}`}
                onClick={() =>
                  !isPending && handleProtectedNavigation(recipe, recipe.status)
                }
              >
                {/* Image Section */}
                <div className="relative h-48 md:h-72 overflow-hidden">
                  <img
                    src={
                      recipe.imageUrl ||
                      recipe.image ||
                      "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt={recipe.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${!isPending ? "group-hover:scale-110" : "blur-[2px] opacity-70"}`}
                  />

                  {isPending && (
                    <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] flex items-center justify-center flex-col">
                      <FiLock className="text-white mb-1" size={20} />
                      <span className="text-white text-[8px] font-black uppercase tracking-widest">
                        Review
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                    <FiClock size={10} className="text-orange-500" />
                    <span className="text-[9px] font-black italic text-gray-800 uppercase">
                      {recipe.cookTime || "30m"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <h3
                    className={`text-sm md:text-xl font-black italic uppercase leading-tight mb-3 line-clamp-2 ${!isPending ? "text-gray-900 group-hover:text-orange-600" : "text-gray-400"}`}
                  >
                    {recipe.title || recipe.name}
                  </h3>

                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200 overflow-hidden transition-transform group-hover:-rotate-6">
                        {recipe.author?.picture ? (
                          <img
                            src={recipe.author.picture}
                            alt="chef"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-black text-xs italic">
                            {(recipe.author?.name || "K").charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="hidden sm:flex flex-col leading-tight">
                        <span className="text-[7px] uppercase font-black text-orange-500 tracking-tighter">
                          Chef
                        </span>
                        <span className="font-bold text-[10px] text-gray-800 italic truncate max-w-[60px]">
                          {recipe.author?.name || "Chef KKB"}
                        </span>
                      </div>
                    </div>

                    <button className="h-8 w-8 md:h-10 md:w-10 bg-gray-900 rounded-lg md:rounded-xl flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-md">
                      <FiChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <p className="text-gray-300 font-black italic text-2xl uppercase tracking-tighter">
              The Vault is Empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGrid;
