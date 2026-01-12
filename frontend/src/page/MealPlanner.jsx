import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Utensils, ChevronRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const MealPlanner = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Sample state: In the future, this will sync with your database
    const [plan, setPlan] = useState({
        'Monday': { title: 'Smoky Jollof Rice', id: 'jollof-1', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=200' },
        'Wednesday': { title: 'Grilled Chicken', id: 'chicken-2', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=200' }
    });

    const removeMeal = (day) => {
        const newPlan = { ...plan };
        delete newPlan[day];
        setPlan(newPlan);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-5xl mx-auto px-6 pt-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            Meal Planner <Calendar className="text-orange-500" size={32} />
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Plan your week, save time, and eat better.</p>
                    </div>
                    <Link to="/shopping-list" className="flex items-center gap-2 bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-2xl font-bold hover:bg-orange-50 transition-all shadow-sm">
                        <ShoppingCart size={20} />
                        View Shopping List
                    </Link>
                </div>

                {/* Weekly Grid */}
                <div className="space-y-4">
                    {days.map((day) => (
                        <div key={day} className="bg-white rounded-4xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between group hover:border-orange-200 transition-all">

                            <div className="flex items-center gap-6">
                                {/* Day Label */}
                                <div className="w-28">
                                    <span className="text-xs font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                                        {day}
                                    </span>
                                </div>

                                {/* Meal Slot */}
                                {plan[day] ? (
                                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                                        <img src={plan[day].image} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                                        <div>
                                            <Link to={`/Recipejollofdetail/${plan[day].id}`} className="font-bold text-gray-800 hover:text-orange-600 transition-colors block">
                                                {plan[day].title}
                                            </Link>
                                            <span className="text-xs text-gray-400 font-medium italic">Dinner Slot</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button className="text-gray-300 font-bold flex items-center gap-2 hover:text-orange-400 transition-colors py-2">
                                        <div className="w-10 h-10 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                                            <Plus size={18} />
                                        </div>
                                        <span>Assign a Recipe</span>
                                    </button>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 mt-4 md:mt-0 self-end md:self-auto">
                                {plan[day] && (
                                    <>
                                        <button
                                            onClick={() => removeMeal(day)}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Remove from plan"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <Link to={`/Recipejollofdetail/${plan[day].id}`} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all">
                                            <ChevronRight size={18} />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State Help */}
                <div className="mt-12 p-8 bg-orange-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-200">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Need inspiration?</h3>
                        <p className="opacity-80">Browse our most popular recipes to fill your week.</p>
                    </div>
                    <Link to="/" className="bg-white text-orange-600 px-8 py-3 rounded-2xl font-black hover:bg-gray-100 transition-all">
                        Explore Recipes
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MealPlanner;