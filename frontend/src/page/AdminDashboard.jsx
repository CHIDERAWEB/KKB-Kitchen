import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiClock, FiCheckCircle, FiDatabase, FiRefreshCw, FiEdit2, FiAlertCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('recipes');
    const [pendingRecipes, setPendingRecipes] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);

    const socketRef = useRef(null);
    // Notification Sound Object
    const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        socketRef.current = io('https://kkb-kitchen-api.onrender.com');

        socketRef.current.on("recipeCreated", (data) => {
            // Play Sound
            notificationSound.play().catch(e => console.log("Audio play blocked by browser"));

            toast(`New Recipe: "${data.title}" by ${data.author}`, {
                icon: '🔔',
                duration: 6000,
                style: {
                    borderRadius: '20px',
                    background: '#f97316',
                    color: '#fff',
                    fontWeight: 'bold',
                    border: '2px solid white'
                },
            });

            fetchData();
        });

        fetchData();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('https://kkb-kitchen-api.onrender.com/api/admin/data', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPendingRecipes(data.pendingRecipes || []);
            setStats(data.stats || { total: 0, pending: 0, approved: 0 });

            const userRes = await fetch('https://kkb-kitchen-api.onrender.com/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await userRes.json();
            setAllUsers(userData || []);
        } catch (err) {
            toast.error("Server connection lost.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/admin/approve/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#f97316', '#fbbf24', '#ffffff']
                });

                toast.success('Recipe Approved! It is now live. ✅');
                setPendingRecipes(prev => prev.filter(r => r.id !== id));
                setStats(prev => ({
                    ...prev,
                    approved: (prev.approved || 0) + 1,
                    pending: (prev.pending || 0) - 1
                }));
            }
        } catch (err) {
            toast.error("Approval failed.");
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }

        try {
            const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/admin/reject/${selectedRecipe.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectionReason })
            });

            if (res.ok) {
                toast.error('Recipe rejected and user notified. 🗑️');
                setPendingRecipes(prev => prev.filter(r => r.id !== selectedRecipe.id));
                setStats(prev => ({
                    ...prev,
                    total: (prev.total || 0) - 1,
                    pending: (prev.pending || 0) - 1
                }));
                setShowRejectModal(false);
                setRejectionReason('');
            }
        } catch (err) {
            toast.error("Rejection failed.");
        }
    };

    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (window.confirm(`Change user to ${newRole}?`)) {
            try {
                const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/admin/users/role/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: newRole })
                });
                if (res.ok) {
                    toast.success(`User role updated to ${newRole}! 🛡️`);
                    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
                }
            } catch (err) {
                toast.error("Role update failed.");
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="font-bold text-orange-500 uppercase tracking-widest text-xs">Initialising Admin Panel...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50 relative">
            <Toaster position="top-right" reverseOrder={false} />

            {/* --- REJECTION MODAL --- */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <FiAlertCircle size={28} />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Reject Recipe?</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm font-medium">
                            Briefly explain to <span className="text-orange-600 font-bold">{selectedRecipe?.author?.name}</span> why this isn't ready.
                        </p>
                        <textarea
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-400 transition-all min-h-[120px] mb-6 font-medium text-sm"
                            placeholder="e.g., Image quality is low or instructions are unclear..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-2xl transition-all">Cancel</button>
                            <button onClick={handleRejectSubmit} className="flex-1 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all">Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Admin Panel</h1>
                    <p className="text-gray-500 font-medium italic">Shielding the kitchen, {user?.name} 🛡️</p>
                </div>
                <button onClick={fetchData} className="p-3 bg-white rounded-full shadow-sm hover:rotate-180 transition-all duration-500 text-gray-400 hover:text-orange-500 border border-gray-100"><FiRefreshCw size={20} /></button>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                <StatCard icon={<FiDatabase size={24} />} label="Total" value={stats.total} color="blue" />
                <StatCard icon={<FiClock size={24} />} label="Pending" value={stats.pending} color="orange" active={true} />
                <StatCard icon={<FiCheckCircle size={24} />} label="Approved" value={stats.approved} color="green" />
                <StatCard icon={<FiUsers size={24} />} label="Chefs" value={allUsers.length} color="purple" />
            </div>

            {/* --- TABS & SEARCH --- */}
            <div className="flex gap-8 mb-8 border-b border-gray-200">
                <TabButton label={`Queue (${pendingRecipes.length})`} active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
                <TabButton label={`Chefs (${allUsers.length})`} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            </div>

            <input
                type="text"
                placeholder={activeTab === 'recipes' ? "Search recipes..." : "Search chefs..."}
                className="w-full p-5 rounded-2xl border-none shadow-sm outline-none focus:ring-2 focus:ring-orange-500 font-medium mb-8"
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* --- CONTENT --- */}
            {activeTab === 'recipes' ? (
                <div className="space-y-4">
                    {pendingRecipes.filter(r => r.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(recipe => (
                        <div key={recipe.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4 w-full">
                                    {recipe.imageUrl && <img src={recipe.imageUrl} className="w-16 h-16 rounded-2xl object-cover border" alt="preview" />}
                                    <div>
                                        <h3 className="text-xl font-black text-gray-800">{recipe.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">By {recipe.author?.name || 'Chef'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button onClick={() => navigate(`/edit-recipe/${recipe.id}`)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-black text-[10px] uppercase hover:bg-blue-100 flex items-center gap-1"><FiEdit2 size={12} /> Edit</button>
                                    <button onClick={() => handleApprove(recipe.id)} className="bg-green-500 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase hover:bg-green-600 shadow-md transition-all active:scale-95">Approve</button>
                                    <button onClick={() => { setSelectedRecipe(recipe); setShowRejectModal(true); }} className="bg-red-50 text-red-500 px-6 py-2 rounded-full font-black text-[10px] uppercase hover:bg-red-100 transition-all">Reject</button>
                                </div>
                            </div>
                            <button onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)} className="text-orange-600 text-[10px] font-black uppercase tracking-widest mt-4">
                                {expandedId === recipe.id ? "Close ▲" : "Review Content ▼"}
                            </button>
                            {expandedId === recipe.id && (
                                <div className="mt-6 pt-6 border-t text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="bg-gray-50 p-5 rounded-2xl">
                                        <strong className="block mb-2 uppercase text-[10px] font-black text-gray-400">Ingredients</strong>
                                        <p>{Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients}</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-2xl">
                                        <strong className="block mb-2 uppercase text-[10px] font-black text-gray-400">Instructions</strong>
                                        <p className="leading-relaxed">{recipe.instructions}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Name</th>
                                <th className="p-8">Email</th>
                                <th className="p-8">Role</th>
                                <th className="p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allUsers.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                                <tr key={u.id} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="p-8 font-black text-gray-800">{u.name}</td>
                                    <td className="p-8 text-gray-500 text-sm">{u.email}</td>
                                    <td className="p-8">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{u.role}</span>
                                    </td>
                                    <td className="p-8 text-right">
                                        {u.id !== user.id && (
                                            <button onClick={() => handleRoleChange(u.id, u.role)} className="border border-gray-200 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:border-orange-500 transition-all">Toggle Role</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Helper Components 
const StatCard = ({ icon, label, value, color, active }) => (
    <div className={`${active ? 'bg-orange-500 text-white shadow-lg' : 'bg-white border border-gray-100 shadow-sm'} p-6 rounded-[2rem] transition-all`}>
        <div className={active ? "text-orange-200" : `text-${color}-500`}>{icon}</div>
        <p className={`${active ? "text-orange-100" : "text-gray-400"} text-[10px] font-black uppercase tracking-widest mt-2`}>{label}</p>
        <h2 className="text-3xl font-black">{value}</h2>
    </div>
);

const TabButton = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`pb-4 px-2 font-black text-xs uppercase tracking-widest transition-all ${active ? 'border-b-4 border-orange-500 text-orange-600' : 'text-gray-400'}`}>
        {label}
    </button>
);

export default AdminDashboard;