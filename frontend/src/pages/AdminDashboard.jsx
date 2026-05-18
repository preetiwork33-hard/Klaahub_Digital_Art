import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShieldCheck, BarChart2, Trash2, Check, X, Eye, ArrowUpRight } from 'lucide-react';
import { adminAPI } from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);



const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{
    label: 'Platform Revenue (₹)',
    data: [45000, 72000, 58000, 95000, 120000, 108000, 145000],
    borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.08)', fill: true, tension: 0.4,
  }],
};

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } } },
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, artRes] = await Promise.all([adminAPI.getUsers(), adminAPI.getArtworks()]);
        if (usersRes.data?.users?.length) setUsers(usersRes.data.users);
        if (artRes.data?.artworks?.length) setArtworks(artRes.data.artworks);
      } catch { /* demo */ }
    };
    load();
  }, []);

  const handleDeleteUser = (id) => {
    if (!confirm('Delete this user?')) return;
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const handleDeleteArtwork = (id) => {
    if (!confirm('Delete this artwork?')) return;
    setArtworks(prev => prev.filter(a => a._id !== id));
  };

  const handleApproveArtist = async (id) => {
    try { await adminAPI.approveArtist(id); }
    catch { /* demo */ }
    setUsers(prev => prev.map(u => u._id === id ? { ...u, status: 'active' } : u));
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-16 max-w-screen-xl mx-auto">
      <div className="mb-8">
        <p className="text-cyan-neon text-sm font-semibold tracking-widest uppercase mb-1">⚡ Admin Panel</p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>KlaaHub Admin</h1>
        <p className="text-slate-400 text-sm mt-1">Full platform control and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: '12,841', change: '+24%', color: 'from-cyan-400 to-blue-500', icon: Users },
          { label: 'Total Artworks', value: '50,291', change: '+18%', color: 'from-purple-500 to-pink-500', icon: Package },
          { label: 'Revenue (MTD)', value: '₹14.5L', change: '+32%', color: 'from-emerald-500 to-teal-500', icon: BarChart2 },
          { label: 'Pending Approvals', value: '7', change: '-2', color: 'from-orange-500 to-red-500', icon: ShieldCheck },
        ].map(({ label, value, change, color, icon: Icon }) => (
          <motion.div key={label} whileHover={{ y: -3 }} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{value}</p>
                <span className="text-green-400 text-xs font-medium flex items-center gap-0.5 mt-1">
                  <ArrowUpRight className="w-3 h-3" />{change} this month
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card p-1 w-fit mb-6 overflow-x-auto">
        {['overview', 'users', 'artworks', 'approvals'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${tab === t ? 'bg-cyan-neon/20 text-cyan-neon border border-cyan-neon/30' : 'text-slate-400 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="chart-container">
            <h3 className="text-white font-semibold mb-4">Platform Revenue (2026)</h3>
            <Line data={revenueData} options={chartOptions} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
              {[
                { label: 'Active Artists', value: 8241 },
                { label: 'Active Buyers', value: 4600 },
                { label: 'Artworks Listed', value: 50291 },
                { label: 'Completed Orders', value: 22478 },
              ].map(s => (
                <div key={s.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-slate-400 text-sm">{s.label}</span>
                  <span className="text-white font-semibold text-sm">{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold mb-4">Revenue Breakdown</h3>
              {[
                { label: 'Artist Payouts (80%)', value: '₹11.6L', color: 'bg-cyan-neon' },
                { label: 'Platform Fee (20%)', value: '₹2.9L', color: 'bg-blue-500' },
                { label: 'Tax Collected', value: '₹0.87L', color: 'bg-purple-500' },
              ].map(s => (
                <div key={s.label} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{s.label}</span>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: s.label.includes('80') ? '80%' : s.label.includes('20') ? '20%' : '6%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider hidden sm:table-cell">Role</th>
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">Joined</th>
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-navy">{u.name[0]}</div>
                          <div>
                            <p className="text-white text-sm font-medium">{u.name}</p>
                            <p className="text-slate-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="tag-pill capitalize text-xs">{u.role}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm hidden md:table-cell">{u.joinedDate}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-neon transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Artworks */}
      {tab === 'artworks' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Artwork</th>
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider hidden sm:table-cell">Artist</th>
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Price</th>
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.map(art => (
                    <tr key={art._id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={art.imageUrl} alt={art.title} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                          <span className="text-white text-sm font-medium">{art.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm hidden sm:table-cell">{art.artist}</td>
                      <td className="px-5 py-4 text-cyan-neon text-sm font-bold">₹{art.price?.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${art.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                          {art.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleDeleteArtwork(art._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Approvals */}
      {tab === 'approvals' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="space-y-4">
            {users.filter(u => u.role === 'artist' && u.status === 'pending').map(u => (
              <div key={u._id} className="glass-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xl font-black text-navy flex-shrink-0">{u.name[0]}</div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{u.name}</p>
                  <p className="text-slate-400 text-sm">{u.email} · Joined {u.joinedDate}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Artist Application · {u.artworks} artworks submitted</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveArtist(u._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30 text-sm font-medium transition-all"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-sm font-medium transition-all">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
            {users.filter(u => u.role === 'artist' && u.status === 'pending').length === 0 && (
              <div className="text-center py-16">
                <ShieldCheck className="w-12 h-12 text-cyan-neon mx-auto mb-3 opacity-50" />
                <p className="text-slate-400">No pending approvals 🎉</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
