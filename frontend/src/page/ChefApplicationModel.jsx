import { motion } from "framer-motion";
import { useState } from "react";
import toast from 'react-hot-toast';
import { FiCamera, FiCheckCircle, FiChevronLeft, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ChefApply = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        age: "",
        location: "",
        specialty: "",
        experience: "",
        cookTime: "", // When do you usually cook?
        bio: "",
        passionReason: "", // How do you make users happy?
        image: null
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Since we are uploading an image, we use FormData
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        try {
            const response = await fetch("https://kkb-kitchen-api.onrender.com/api/user/apply-chef", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    // Note: Don't set Content-Type header when sending FormData
                },
                body: data,
            });

            if (response.ok) {
                setSuccess(true);
                window.scrollTo(0, 0);
            } else {
                toast.error("Something went wrong. Try again!");
            }
        } catch (err) {
            toast.error("Network error! Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <FiCheckCircle className="text-green-500 text-8xl mx-auto mb-6" />
                    <h1 className="text-4xl font-black text-gray-800 uppercase italic">Application Received!</h1>
                    <p className="text-gray-500 mt-4 font-bold max-w-md mx-auto">
                        Your culinary profile is being reviewed. We'll notify you once you're cleared to start cooking for the community!
                    </p>
                    <button onClick={() => navigate("/")} className="mt-8 bg-orange-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest">Back to Home</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 p-6 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-orange-50 rounded-full text-gray-600 transition-all">
                        <FiChevronLeft size={24} />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Chef Onboarding</h1>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em]">KKB Mastery Elite</p>
                    </div>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-2xl mx-auto mt-10 px-6">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Image Upload Section */}
                    <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 text-center">
                        <div className="mb-4">
                            <h2 className="text-sm font-black uppercase text-gray-800">Professional Identity</h2>
                            <p className="text-[10px] font-bold text-red-500 uppercase mt-1 italic">
                                * Restriction: Photo must be a chef in black/white attire.
                            </p>
                        </div>

                        <div className="relative w-40 h-40 mx-auto">
                            <div className="w-full h-full rounded-[2.5rem] bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <FiCamera className="text-gray-300" size={40} />
                                )}
                            </div>
                            <label className="absolute bottom-[-10px] right-[-10px] bg-orange-600 text-white p-3 rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-all">
                                <FiCamera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                            </label>
                        </div>
                    </section>

                    {/* Personal Details */}
                    <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-5">
                        <h2 className="text-[11px] font-black uppercase text-orange-600 tracking-widest mb-2">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Full Name" placeholder="Chidera Web Tech" onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                            <InputField label="How old are you?" type="number" placeholder="18" onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                        </div>

                        <InputField label="Location" placeholder="Lagos, Nigeria" onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </section>

                    {/* Professional Details */}
                    <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-5">
                        <h2 className="text-[11px] font-black uppercase text-orange-600 tracking-widest mb-2">Cooking Profile</h2>

                        <InputField label="Primary Specialty" placeholder="e.g. Traditional Soul Food" onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Years of Experience" type="number" placeholder="3" onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
                            <InputField label="Best Time to Cook" placeholder="e.g. Weekends, 6PM" onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Bio / Journey</label>
                            <textarea
                                required
                                rows="4"
                                placeholder="Tell us about your culinary path..."
                                className="w-full bg-gray-50 rounded-3xl p-5 mt-1 text-sm font-bold outline-none focus:ring-2 ring-orange-500 transition-all resize-none"
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Why join KKB? (How do you make users happy?)</label>
                            <textarea
                                required
                                rows="3"
                                placeholder="My food brings family together..."
                                className="w-full bg-gray-50 rounded-3xl p-5 mt-1 text-sm font-bold outline-none focus:ring-2 ring-orange-500 transition-all resize-none"
                                onChange={(e) => setFormData({ ...formData, passionReason: e.target.value })}
                            ></textarea>
                        </div>
                    </section>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-orange-600 text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] text-sm shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        {loading ? <FiLoader className="animate-spin" /> : "Submit Chef Application"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Reusable Input Component
const InputField = ({ label, type = "text", placeholder, onChange }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">{label}</label>
        <input
            required
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            className="bg-gray-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-orange-500 transition-all"
        />
    </div>
);

export default ChefApply;