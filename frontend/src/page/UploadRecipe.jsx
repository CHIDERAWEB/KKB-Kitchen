import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash, FiUploadCloud } from 'react-icons/fi';

const UploadRecipe = ({ showToast }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        ingredients: [''], // Start with one empty field
        instructions: [''] 
    });

    // Handle adding/removing dynamic fields
    const handleAddField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const handleRemoveField = (field, index) => {
        const newList = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newList });
    };

    const handleListChange = (field, index, value) => {
        const newList = [...formData[field]];
        newList[index] = value;
        setFormData({ ...formData, [field]: newList });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/api/recipes/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the JWT Key
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast("Recipe Shared! 🥘");
                navigate('/');
            } else {
                alert("Upload failed. Make sure you are logged in!");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white mt-10 rounded-3xl shadow-sm border border-orange-100">
            <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter">
                Share a <span className="text-orange-500">New Recipe</span>
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-2">Recipe Title</label>
                        <input 
                            required 
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="e.g. Grandma's Secret Jollof"
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-2">Image URL</label>
                        <input 
                            required 
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Link to food photo"
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        />
                    </div>
                </div>

                {/* Ingredients List */}
                <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Ingredients</label>
                    {formData.ingredients.map((ing, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input 
                                className="flex-1 p-3 bg-gray-50 rounded-xl outline-none"
                                value={ing}
                                onChange={(e) => handleListChange('ingredients', index, e.target.value)}
                                placeholder={`Ingredient #${index + 1}`}
                            />
                            <button type="button" onClick={() => handleRemoveField('ingredients', index)} className="text-red-400"><FiTrash /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddField('ingredients')} className="mt-2 text-xs font-bold text-orange-500 flex items-center gap-1">
                        <FiPlus /> ADD INGREDIENT
                    </button>
                </div>

                <button type="submit" className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 flex justify-center items-center gap-2">
                    <FiUploadCloud size={20} /> Publish Recipe
                </button>
            </form>
        </div>
    );
};

export default UploadRecipe;