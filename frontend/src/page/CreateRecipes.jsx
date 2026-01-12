import React, { useState } from 'react';
import { Camera, Plus, Trash2, Clock, Users, Utensils, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // NEW: For redirection

const CreateRecipe = ({ showToast }) => {
    const navigate = useNavigate(); // NEW: Hook to handle page navigation

    const [title, setTitle] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState(['']);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const addIngredient = () => setIngredients([...ingredients, '']);
    const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
    const addStep = () => setSteps([...steps, '']);
    const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));

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
        formData.append('ingredients', ingredients.filter(i => i.trim() !== '').join(','));
        formData.append('instructions', steps.filter(s => s.trim() !== '').join('.'));

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            // NEW CLOUD NUMBER (Works everywhere in the world)
            const response = await fetch('https://kkb-kitchen-api.onrender.com/api/recipes/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                // SUCCESS: Notify, then Redirect
                showToast("Recipe submitted for admin approval! 🚀");

                // Clear state
                setTitle('');
                setIngredients(['']);
                setSteps(['']);
                setImagePreview(null);
                setImageFile(null);

                // WAIT 2 SECONDS THEN REDIRECT
                setTimeout(() => {
                    navigate('/'); // Takes them back to home page
                }, 2000);

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
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="col-span-2">
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
                    </div>

                    {/* INGREDIENTS */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600"><Plus size={20} /> Ingredients</h3>
                        <div className="space-y-3">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={ing}
                                        onChange={(e) => {
                                            const newIngs = [...ingredients];
                                            newIngs[index] = e.target.value;
                                            setIngredients(newIngs);
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
                        <button type="button" onClick={addIngredient} className="mt-4 text-orange-500 font-bold flex items-center gap-1 text-sm"><Plus size={16} /> Add another</button>
                    </div>

                    {/* INSTRUCTIONS */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600"><Utensils size={20} /> Instructions</h3>
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">{index + 1}</span>
                                    <textarea
                                        value={step}
                                        onChange={(e) => {
                                            const newSteps = [...steps];
                                            newSteps[index] = e.target.value;
                                            setSteps(newSteps);
                                        }}
                                        placeholder={`Step ${index + 1}`}
                                        className="flex-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                    {steps.length > 1 && (
                                        <button type="button" onClick={() => removeStep(index)} className="mt-2 text-red-400"><Trash2 size={18} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addStep} className="mt-4 text-orange-500 font-bold flex items-center gap-1 text-sm"><Plus size={16} /> Add step</button>
                    </div>

                    <button type="submit" className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xl shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3">
                        Submit Recipe <Send size={22} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRecipe;