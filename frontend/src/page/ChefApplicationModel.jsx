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
        cookTime: "",
        bio: "",
        passionReason: "",
        homeServiceRate: "0",
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
        if (!formData.image) return toast.error("Please upload a professional chef photo!");

        setLoading(true);
        const data = new FormData();

        // Append all fields to FormData
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        try {
            // Change to your local port (e.g., 5000) for testing!
            const response = await fetch("https://kkb-kitchen-frontend.onrender.com//api/users/apply-chef", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: data, // Browser sets 'multipart/form-data' automatically
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(true);
                window.scrollTo(0, 0);
            } else {
                toast.error(result.message || "Something went wrong.");
            }
        } catch (err) {
            toast.error("Connection failed! Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <FiCheckCircle className="text-green-500 text-8xl mx-auto mb-6" />
                    <h1 className="text-4xl font-black text-gray-800 uppercase italic">Application Sent!</h1>
                    <p className="text-gray-500 mt-4 font-bold">Admin will review your profile shortly.</p>
                    <button onClick={() => navigate("/")} className="mt-8 bg-orange-600 text-white px-10 py-4 rounded-full font-black uppercase">Back to Home</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b p-6 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-orange-50 rounded-full transition-all"><FiChevronLeft size={24} /></button>
                    <div className="text-center">
                        <h1 className="text-xl font-black text-gray-800 uppercase">Chef Onboarding</h1>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">KKB Mastery</p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto mt-10 px-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Section */}
                    <section className="bg-white p-8 rounded-[3rem] shadow-sm text-center border border-gray-100">
                        <h2 className="text-sm font-black uppercase mb-2">Chef Identity</h2>
                        <p className="text-[10px] font-bold text-red-500 uppercase italic mb-4">* Black/White Chef Attire Required</p>
                        <div className="relative w-40 h-40 mx-auto">
                            <div className="w-full h-full rounded-[2.5rem] bg-gray-100 border-2 border-dashed overflow-hidden flex items-center justify-center">
                                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <FiCamera className="text-gray-300" size={40} />}
                            </div>
                            <label className="absolute bottom-[-10px] right-[-10px] bg-orange-600 text-white p-3 rounded-2xl cursor-pointer hover:scale-110 transition-all">
                                <FiCamera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                            </label>
                        </div>
                    </section>

                    {/* Details Section */}
                    <section className="bg-white p-8 rounded-[3rem] shadow-sm space-y-5 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Full Name" placeholder="Your Name" onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                            <InputField label="Age" type="number" placeholder="18" onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Location" placeholder="Lagos, Nigeria" onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                            <InputField label="Service Rate (₦)" type="number" placeholder="5000" onChange={(e) => setFormData({ ...formData, homeServiceRate: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Specialty" placeholder="Intercontinental" onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} />
                            <InputField label="Exp (Years)" type="number" placeholder="2" onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
                        </div>
                        <InputField label="Best Cooking Time" placeholder="Weekends / Evenings" onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })} />

                        <textarea required rows="3" placeholder="Your Bio..." className="w-full bg-gray-50 rounded-3xl p-5 text-sm font-bold outline-none focus:ring-2 ring-orange-500" onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                        <textarea required rows="3" placeholder="Why join KKB?..." className="w-full bg-gray-50 rounded-3xl p-5 text-sm font-bold outline-none focus:ring-2 ring-orange-500" onChange={(e) => setFormData({ ...formData, passionReason: e.target.value })} />
                    </section>

                    <button disabled={loading} type="submit" className="w-full bg-orange-600 text-white font-black py-6 rounded-[2rem] uppercase tracking-widest shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3">
                        {loading ? <FiLoader className="animate-spin" /> : "Submit Application"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, type = "text", placeholder, onChange }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">{label}</label>
        <input required type={type} placeholder={placeholder} onChange={onChange} className="bg-gray-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-orange-500" />
    </div>
);

export default ChefApply;