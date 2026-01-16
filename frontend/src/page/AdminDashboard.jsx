import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiClock, FiCheckCircle, FiDatabase, FiRefreshCw, FiEdit2, FiAlertCircle, FiList, FiDownload, FiSearch } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('recipes');
    const [pendingRecipes, setPendingRecipes] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Notification History & Search States
    const [history, setHistory] = useState([]);
    const [historySearch, setHistorySearch] = useState("");

    const socketRef = useRef(null);
    const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const addtoHistory = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setHistory(prev => [{ msg, time, type }, ...prev].slice(0, 20)); // Increased limit to 20
    };

    const downloadReport = () => {
        if (history.length === 0) {
            toast.error("No activity to download");
            return;
        }
        const reportTitle = `KKB Admin Report - ${new Date().toLocaleDateString()}\n\n`;
        const logContent = history.map(item => `[${item.time}] ${item.type.toUpperCase()}: ${item.msg}`).join('\n');
        const blob = new Blob([reportTitle + logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Admin_Activity_${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded!");
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        socketRef.current = io('https://kkb-kitchen-api.onrender.com');

        socketRef.current.on("recipeCreated", (data) => {
            notificationSound.current.play().catch(() => {});
            toast.success(`New: ${data.title}`, { icon: '🔔' });
            addtoHistory(`New recipe submitted: ${data.title}`, 'new');
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
            setStats(data.stats || { total: 0, pending: data.pendingRecipes?.length || 0, approved: 0 });

            const userRes = await fetch('https://kkb-kitchen-api.onrender.com/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await userRes.json();
            setAllUsers(userData || []);
        } catch (err) {
            toast.error("Sync failed");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, title) => {
        try {
            const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/admin/approve/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                toast.success('Approved!');
                addtoHistory(`Approved: ${title}`, 'success');
                fetchData(); 
            }
        } catch (err) {
            toast.error("Failed");
        }
    };

    const handleRejectSubmit = async () => {
        try {
            const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/admin/delete/${selectedRecipe.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            });

            if (res.ok) {
                toast.error('Rejected');
                addtoHistory(`Rejected: ${selectedRecipe.title}`, 'error');
                setShowRejectModal(false);
                setRejectionReason('');
                fetchData(); 
            }
        } catch (err) {
            toast.error("Error");
        }
    };

    // Filtered History Logic
    const filteredHistory = history.filter(item => 
        item.msg.toLowerCase().includes(historySearch.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center min-h-screen font-black text-orange-500 uppercase tracking-widest text-xs">KKB Kitchen Admin...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50 pb-40">
            <Toaster position="top-right" />

            {/* --- REJECT MODAL --- */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-2xl font-black text-red-600 mb-6 uppercase tracking-tighter">Reject Recipe?</h3>
                        <textarea
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-6 outline-none focus:border-red-400 text-sm font-medium"
                            placeholder="State reason for user..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 font-bold text-gray-400 uppercase text-xs">Cancel</button>
                            <button onClick={handleRejectSubmit} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Kitchen Admin</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Shielding the recipe feed 🛡️</p>
                </div>
                <button onClick={fetchData} className="p-4 bg-white rounded-full border border-gray-100 shadow-sm hover:rotate-180 transition-all duration-500 text-gray-400 hover:text-orange-500"><FiRefreshCw /></button>
            </div>

            {/* --- STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total" value={stats.total} color="blue" icon={<FiDatabase />} />
                <StatCard label="Pending" value={pendingRecipes.length} color="orange" icon={<FiClock />} active={true} />
                <StatCard label="Approved" value={stats.approved} color="green" icon={<FiCheckCircle />} />
                <StatCard label="Chefs" value={allUsers.length} color="purple" icon={<FiUsers />} />
            </div>

            <div className="flex gap-8 mb-8 border-b">
                <TabButton label="Queue" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
                <TabButton label="Chefs" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            </div>

            {/* --- MAIN CONTENT --- */}
            {activeTab === 'recipes' ? (
                <div className="space-y-4">
                    {pendingRecipes.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed text-gray-400 font-bold uppercase text-xs">The kitchen is clear. No pending recipes.</div>
                    ) : (
                        pendingRecipes.map(recipe => (
                            <div key={recipe.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md">
                                <div className="flex items-center gap-4 w-full">
                                    {recipe.imageUrl && <img src={recipe.imageUrl} className="w-16 h-16 rounded-2xl object-cover border shadow-sm" alt="" />}
                                    <div>
                                        <h3 className="text-xl font-black text-gray-800 tracking-tight">{recipe.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">By {recipe.author?.name || 'Chef'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button onClick={() => handleApprove(recipe.id, recipe.title)} className="flex-1 bg-green-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 transition-all">Approve</button>
                                    <button onClick={() => { setSelectedRecipe(recipe); setShowRejectModal(true); }} className="flex-1 bg-red-50 text-red-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all">Reject</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Chef Name</th>
                                <th className="p-6">Access Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {allUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-black text-gray-800">{u.name}</td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>{u.role}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- NOTIFICATION HISTORY LOG --- */}
            <div className="mt-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <FiList />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Recent Activity Log</h4>
                    </div>
                    
                    {/* Log Search and Download */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                            <input 
                                type="text" 
                                placeholder="FILTER LOG..."
                                className="w-full pl-8 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-orange-500"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={downloadReport}
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors shrink-0"
                        >
                            <FiDownload /> Export
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    {filteredHistory.length === 0 ? (
                        <p className="p-8 text-center text-gray-300 text-xs italic">
                            {history.length === 0 ? "Waiting for kitchen activity..." : "No matches found in log."}
                        </p>
                    ) : (
                        filteredHistory.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border-b last:border-none hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full shadow-sm ${item.type === 'success' ? 'bg-green-500' : item.type === 'error' ? 'bg-red-500' : 'bg-orange-500'}`} />
                                    <span className="text-sm font-bold text-gray-700">{item.msg}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-300 tracking-tighter">{item.time}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color, active }) => (
    <div className={`${active ? 'bg-orange-500 text-white shadow-xl shadow-orange-100' : 'bg-white border border-gray-100'} p-6 rounded-[2rem] transition-all`}>
        <div className={active ? "text-orange-200" : `text-${color}-500`}>{icon}</div>
        <p className="text-[10px] font-black uppercase mt-2 tracking-widest opacity-70">{label}</p>
        <h2 className="text-3xl font-black tracking-tighter">{value}</h2>
    </div>
);

const TabButton = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`pb-4 px-2 font-black text-xs uppercase tracking-widest transition-all ${active ? 'border-b-4 border-orange-500 text-orange-600' : 'text-gray-300 hover:text-gray-400'}`}>
        {label}
    </button>
);

export default AdminDashboard;