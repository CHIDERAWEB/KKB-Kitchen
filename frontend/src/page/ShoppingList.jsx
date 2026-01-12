import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Circle, Trash2, Printer, Plus, Share2 } from 'lucide-react';

const ShoppingList = () => {
    // In a full build, this would pull from your Meal Planner state
    const [items, setItems] = useState([
        { id: 1, name: 'Long Grain Rice', qty: '2kg', category: 'Grains', completed: false },
        { id: 2, name: 'Scotch Bonnet Peppers', qty: '500g', category: 'Vegetables', completed: true },
        { id: 3, name: 'Vegetable Oil', qty: '1 Litre', category: 'Pantry', completed: false },
        { id: 4, name: 'Chicken Breast', qty: '1kg', category: 'Meat', completed: false },
    ]);

    const toggleItem = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const clearCompleted = () => {
        setItems(items.filter(item => !item.completed));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-3xl mx-auto px-6 pt-12">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            Shopping List <ShoppingBag className="text-orange-500" size={32} />
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Items needed for your weekly meal plan.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-orange-600 transition-colors shadow-sm">
                            <Share2 size={20} />
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-orange-600 transition-colors shadow-sm">
                            <Printer size={20} />
                        </button>
                    </div>
                </header>

                {/* Checklist Card */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm">Ingredients Checklist</h3>
                            <button
                                onClick={clearCompleted}
                                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                            >
                                Clear Completed
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border ${item.completed
                                            ? 'bg-gray-50 border-transparent opacity-60'
                                            : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-md'
                                        }`}
                                    onClick={() => toggleItem(item.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="transition-transform active:scale-90">
                                            {item.completed ? (
                                                <div className="bg-green-500 rounded-full p-1 text-white">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                            ) : (
                                                <Circle className="text-gray-300" size={28} />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-lg ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                {item.name}
                                            </p>
                                            <span className="text-xs font-bold text-orange-500/70 uppercase">{item.qty} • {item.category}</span>
                                        </div>
                                    </div>
                                    <button className="text-gray-200 hover:text-red-400 transition-colors p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Quick Add */}
                        <div className="mt-8 relative">
                            <input
                                type="text"
                                placeholder="Add extra item (e.g. Salt, Napkins...)"
                                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-6 pr-14 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-2 rounded-xl shadow-md hover:bg-orange-600">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingList;