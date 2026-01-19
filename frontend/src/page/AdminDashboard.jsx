import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiClock, FiCheckCircle, FiDatabase, FiRefreshCw, 
  FiAlertCircle, FiList, FiDownload, FiSearch, FiShield, 
  FiUser, FiArrowUpCircle 
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('recipes');
    const [pendingRecipes, setPendingRecipes] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
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
        setHistory(prev => [{ msg, time, type }, ...prev].slice(0, 20));
    };

    const fetchData = async (isSoftRefresh = false) => {
        if (!isSoftRefresh) setLoading(true);
        setRefreshing(true);
        try {
            const [dataRes, userRes] = await Promise.all([
                fetch('https://kkb-kitchen-api.onrender.com/api/admin/data', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('https://kkb-kitchen-api.onrender.com/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const data = await dataRes.json();
            const userData = await userRes.json();

            setPendingRecipes(data.pendingRecipes || []);
            setStats({ 
                total: data.total || 0, 
                pending: data.pendingRecipes?.length || 0, 
                approved: data.approved || 0 
            });
            setAllUsers(userData || []);
        } catch (err) {
            toast.error("Sync failed with command server");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        socketRef.current = io('https://kkb-kitchen-api.onrender.com');

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join_room", user.id || user._id);
            addtoHistory("Socket Connection Established", "success");
        });

        socketRef.current.on("recipeCreated", (data) => {
            notificationSound.current.play().catch(() => {
                console.log("Audio playback blocked by browser.");
            });
            toast.success(`New Recipe: ${data.title}`, { 
                icon: '🔥',
                style: { borderRadius: '15px', background: '#333', color: '#fff' }
            });
            addtoHistory(`Chef ${data.author?.name || 'Unknown'} submitted ${data.title}`, 'new');
            fetchData(true); 
        });

        fetchData();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const handleRoleUpdate = async (userId, currentRole, userName) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success(`${userName} updated to ${newRole}`);
                addtoHistory(`${userName} updated to ${newRole}`, 'info');
                fetchData(true);
            }
        } catch (err) {
            toast.error("Role update failed");
        }
    };

    const handleApprove = async (id, title) => {
        try {
            const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/admin/approve/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                confetti({ 
                    particleCount: 150, 
                    spread: 80, 
                    origin: { y: 0.7 }, 
                    colors: ['#f97316', '#fbbf24', '#ffffff'] 
                });
                toast.success('Recipe Approved!');
                addtoHistory(`Approved: ${title}`, 'success');
                fetchData(true); 
            }
        } catch (err) {
            toast.error("Approval failed");
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for the Chef!");
            return;
        }

        const recipeId = selectedRecipe._id || selectedRecipe.id;
        try {
            const res = await fetch(`https://kkb-kitchen-api.onrender.com/api/admin/reject/${recipeId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ adminNote: rejectionReason })
            });

            if (!res.ok) throw new Error("Rejection failed");

            toast.error('Recipe Rejected & Feedback Sent');
            addtoHistory(`Rejected: ${selectedRecipe.title}`, 'error');
            
            setShowRejectModal(false);
            setRejectionReason('');
            fetchData(true); 
            
        } catch (err) {
            toast.error("Rejection Sync Failed.");
        }
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
        toast.success("Report exported!");
    };

    const filteredHistory = history.filter(item => 
        item.msg.toLowerCase().includes(historySearch.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                <FiShield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-xl" />
            </div>
            <p className="mt-4 font-black text-orange-500 uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Command Center</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50 pb-40 selection:bg-orange-500 selection:text-white">
            <Toaster position="top-right" />

            {/* --- REJECT MODAL --- */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><FiAlertCircle size={24}/></div>
                            <h3 className="text-2xl font-black text-red-600 uppercase tracking-tighter">Reject Recipe?</h3>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Chef's Feedback Statement</p>
                        <textarea
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-6 outline-none focus:border-red-400 text-sm font-medium transition-all"
                            placeholder="Why is this being rejected? User will see this..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 font-bold text-gray-400 uppercase text-xs hover:text-gray-600 transition-colors">Go Back</button>
                            <button onClick={handleRejectSubmit} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-red-200 active:scale-95 transition-all">Send & Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex justify-between items-start mb-10">
                <div className="animate-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-[0.2em]">Live Session Active</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-gray-900">Command <span className="text-orange-500">Center</span></h1>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-1">KKB Kitchen • Security & Moderation</p>
                </div>
                <button 
                    onClick={() => fetchData(true)} 
                    className={`p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-700 ${refreshing ? 'rotate-180 text-orange-500 shadow-orange-100' : 'hover:shadow-lg text-gray-400'}`}
                >
                    <FiRefreshCw className={refreshing ? 'animate-spin' : ''}/>
                </button>
            </div>

            {/* --- STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard label="Database" value={stats.total} color="blue" icon={<FiDatabase />} delay="0" />
                <StatCard label="In Queue" value={pendingRecipes.length} color="orange" icon={<FiClock />} active={true} delay="100" />
                <StatCard label="Approved" value={stats.approved} color="green" icon={<FiCheckCircle />} delay="200" />
                <StatCard label="Verified Chefs" value={allUsers.length} color="purple" icon={<FiUsers />} delay="300" />
            </div>

            {/* --- TABS --- */}
            <div className="flex gap-10 mb-8 border-b border-gray-200">
                <TabButton label={`Recipe Queue (${pendingRecipes.length})`} active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
                <TabButton label="Staff & Chefs" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="min-h-[400px]">
                {activeTab === 'recipes' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {pendingRecipes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                <div className="p-6 bg-gray-50 rounded-full text-gray-300 mb-4 animate-bounce"><FiCheckCircle size={40}/></div>
                                <p className="text-gray-400 font-black uppercase text-xs tracking-widest">The queue is empty.</p>
                            </div>
                        ) : (
                            pendingRecipes.map((recipe, idx) => (
                                <div key={recipe.id || recipe._id} style={{animationDelay: `${idx * 50}ms`}} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-xl transition-all animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-6 w-full">
                                        <div className="relative shrink-0">
                                            <img src={recipe.imageUrl || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-[1.8rem] object-cover border-4 border-gray-50" alt="" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-tight mb-2 group-hover:text-orange-500 transition-colors">{recipe.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><FiUser size={12}/></div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">By Chef <span className="text-gray-900 font-black">{recipe.author?.name || 'Anonymous'}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button onClick={() => handleApprove(recipe.id || recipe._id, recipe.title)} className="flex-1 md:w-32 bg-green-500 text-white h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-green-600 active:scale-95 transition-all">Approve</button>
                                        <button onClick={() => { setSelectedRecipe(recipe); setShowRejectModal(true); }} className="flex-1 md:w-32 bg-red-50 text-red-500 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-100 active:scale-95 transition-all">Reject</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-8">Chef Identity</th>
                                        <th className="p-8">Email</th>
                                        <th className="p-8">Status</th>
                                        <th className="p-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {allUsers.map(u => (
                                        <tr key={u.id || u._id} className="hover:bg-orange-50/30 transition-colors group">
                                            <td className="p-8">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${u.role === 'admin' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        {u.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="font-black text-gray-800 uppercase tracking-tight">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-8 font-bold text-gray-400 text-xs">{u.email || 'N/A'}</td>
                                            <td className="p-8">
                                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-8">
                                                <button 
                                                    onClick={() => handleRoleUpdate(u.id || u._id, u.role, u.name)}
                                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${u.role === 'admin' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                                                >
                                                    {u.role === 'admin' ? <><FiUser /> Revoke Admin</> : <><FiArrowUpCircle /> Promote</>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* --- ACTIVITY LOG --- */}
            <div className="mt-24 animate-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                            <FiList size={18}/>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Session Logs</h4>
                        </div>
                        <p className="text-gray-400 text-[10px] font-medium max-w-xs uppercase leading-relaxed">System activity is stored temporarily for this session only.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="FILTER ACTIVITY..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={downloadReport}
                            className="flex items-center gap-2 h-14 px-6 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 active:scale-95 transition-all shadow-xl"
                        >
                            <FiDownload /> Export
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                    {filteredHistory.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic">System idle... no activity matches.</p>
                        </div>
                    ) : (
                        filteredHistory.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-6 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full shadow-lg ${item.type === 'success' ? 'bg-green-500' : item.type === 'error' ? 'bg-red-500' : 'bg-orange-500'}`} />
                                    <span className="text-sm font-bold text-gray-700 tracking-tight">{item.msg}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-300 group-hover:text-gray-500">{item.time}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

/* --- SUB-COMPONENTS --- */

const StatCard = ({ icon, label, value, color, active, delay }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-500',
    orange: 'bg-orange-50 text-orange-500',
    green: 'bg-green-50 text-green-500',
    purple: 'bg-purple-50 text-purple-500'
  };

  return (
    <div 
        style={{animationDelay: `${delay}ms`}}
        className={`${active ? 'bg-orange-500 text-white shadow-2xl shadow-orange-200' : 'bg-white border border-gray-100 shadow-sm'} p-8 rounded-[2.8rem] transition-all duration-500 hover:-translate-y-2 animate-in slide-in-from-bottom-4`}
    >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${active ? 'bg-white/20' : colorMap[color]}`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-white/70' : 'text-gray-400'}`}>{label}</p>
        <h2 className="text-4xl font-black tracking-tighter tabular-nums">{value}</h2>
    </div>
  );
};

const TabButton = ({ label, active, onClick }) => (
    <button 
        onClick={onClick} 
        className={`pb-4 px-2 font-black text-xs uppercase tracking-widest transition-all relative ${active ? 'text-orange-500' : 'text-gray-300 hover:text-gray-400'}`}
    >
        {label}
        {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full animate-in slide-in-from-left duration-500"></div>}
    </button>
);

export default AdminDashboard;