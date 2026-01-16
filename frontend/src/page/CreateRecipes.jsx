import React, { useState } from 'react';
import { Camera, Plus, Trash2, Clock, Users, Utensils, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('https://kkb-kitchen-api.onrender.com');

const CreateRecipe = ({ showToast }) => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [servings, setServings] = useState('');
    const [difficulty, setDifficulty] = useState('Easy'); // NEW STATE
    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState(['']);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const addIngredient = () => setIngredients(prev => [...prev, '']);
    const removeIngredient = (index) => setIngredients(prev => prev.filter((_, i) => i !== index));

    const addStep = () => setSteps(prev => [...prev, '']);
    const removeStep = (index) => setSteps(prev => prev.filter((_, i) => i !== index));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            showToast("Please log in first!", "error");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('cookTime', cookTime);
        formData.append('servings', servings);
        formData.append('difficulty', difficulty); // ADDED TO FORMDATA

        const cleanIngredients = ingredients.filter(i => i.trim() !== '');
        const cleanSteps = steps.filter(s => s.trim() !== '');

        formData.append('ingredients', JSON.stringify(cleanIngredients));
        formData.append('instructions', JSON.stringify(cleanSteps));

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/create', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                // --- INSTANT NOTIFICATION TRIGGER ---
                // This tells the socket server a new recipe exists, 
                // which then tells the Header to show the toast and badge.
                socket.emit("recipeCreated", { title: title });

                showToast("Recipe submitted for admin approval! 🚀");
                setTitle('');
                setIngredients(['']);
                setSteps(['']);
                setDifficulty('Easy');
                setImagePreview(null);
                setImageFile(null);

                setTimeout(() => navigate('/'), 2000);
            } else {
                const errorData = await response.json();
                showToast(errorData.error || "Submission failed", "error");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            showToast("Backend connection failed!", "error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-orange-500 p-8 text-white text-center">
                    <h1 className="text-3xl font-black">Share Your Recipe</h1>
                    <p className="opacity-90">Teach the community your kitchen secrets</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                    {/* PHOTO UPLOAD */}
                    <div className="flex flex-col items-center">
                        <label className="relative cursor-pointer group">
                            <div className="w-full h-48 md:w-96 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden bg-gray-50 group-hover:border-orange-400 transition-all">
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <>
                                        <Camera className="text-gray-400 mb-2" size={40} />
                                        <span className="text-sm text-gray-500 font-bold">Upload Food Photo</span>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>

                    {/* BASIC INFO */}
                    <div className="grid md:grid-cols-3 gap-6"> {/* Changed to grid-cols-3 */}
                        <div className="col-span-3">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Recipe Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Smoky Party Jollof"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Clock size={16} /> Cook Time</label>
                            <input
                                type="text"
                                value={cookTime}
                                onChange={(e) => setCookTime(e.target.value)}
                                placeholder="45 mins"
                                className="w-full p-4 rounded-xl border border-gray-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Users size={16} /> Servings</label>
                            <input
                                type="text"
                                value={servings}
                                onChange={(e) => setServings(e.target.value)}
                                placeholder="4 People"
                                className="w-full p-4 rounded-xl border border-gray-200 outline-none"
                            />
                        </div>
                        {/* DIFFICULTY DROPDOWN ADDED BESIDE SERVINGS */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Utensils size={16} /> Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full p-4 rounded-xl border border-gray-200 outline-none bg-white font-bold text-gray-600 appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="Easy">Easy 🥗</option>
                                <option value="Medium">Medium 🍳</option>
                                <option value="Hard">Hard 👨‍🍳</option>
                            </select>
                        </div>
                    </div>

                    {/* INGREDIENTS */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600"><Plus size={20} /> Ingredients</h3>
                        <div className="space-y-3">
                            {ingredients.map((ing, index) => (
                                <div key={`ing-${index}`} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={ing}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setIngredients(prev => {
                                                const newArr = [...prev];
                                                newArr[index] = val;
                                                return newArr;
                                            });
                                        }}
                                        placeholder={`Ingredient ${index + 1}`}
                                        className="flex-1 p-3 border-b-2 border-gray-100 focus:border-orange-500 outline-none"
                                    />
                                    {ingredients.length > 1 && (
                                        <button type="button" onClick={() => removeIngredient(index)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addIngredient} className="mt-4 text-orange-500 font-bold flex items-center gap-1 text-sm bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                            <Plus size={16} /> Add another
                        </button>
                    </div>

                    {/* INSTRUCTIONS */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600"><Utensils size={20} /> Instructions</h3>
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={`step-${index}`} className="flex gap-4 items-start">
                                    <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 shadow-md">
                                        {index + 1}
                                    </span>
                                    <textarea
                                        value={step}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSteps(prev => {
                                                const newArr = [...prev];
                                                newArr[index] = val;
                                                return newArr;
                                            });
                                        }}
                                        placeholder={`Step ${index + 1}: e.g. Wash the rice until clear...`}
                                        className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all min-h-[100px]"
                                    />
                                    {steps.length > 1 && (
                                        <button type="button" onClick={() => removeStep(index)} className="mt-2 text-red-400 hover:text-red-600">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addStep} className="mt-4 w-full py-3 border-2 border-dashed border-orange-200 text-orange-500 font-bold rounded-2xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
                            <Plus size={16} /> Add Next Step
                        </button>
                    </div>

                    <button type="submit" className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black text-xl shadow-lg shadow-orange-200 hover:bg-orange-600 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3">
                        Submit Recipe <Send size={22} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRecipe;