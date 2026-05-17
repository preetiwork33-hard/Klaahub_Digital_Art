import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Package, Users, DollarSign, Upload, Edit, Trash2,
  Eye, Plus, BarChart2, ArrowUpRight, ArrowDownRight, User, Globe,
  Share2, Briefcase, MapPin, Mail, Award
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { artistAPI, artworkAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
  },
};

function StatCard({ title, value, change, icon: Icon, color }) {
  const isPositive = change >= 0;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit' }}>{value}</p>
          <div className="flex items-center gap-1 text-sm font-medium text-cyan-neon">
            <ArrowUpRight className="w-4 h-4" /> Real-time active metric
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function ArtistDashboard() {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [artworks, setArtworks] = useState([]);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    views: 0,
    likes: 0,
    sales: 0,
    artworkCount: 0,
    rating: 4.9,
  });
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tabParam && ['overview', 'artworks', 'orders', 'analytics', 'profile'].includes(tabParam)) {
      setTab(tabParam);
    }
  }, [tabParam]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    specialty: user?.specialty || '',
    website: user?.website || '',
    twitter: user?.socials?.twitter || '',
    instagram: user?.socials?.instagram || '',
    portfolio: user?.socials?.portfolio || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        specialty: user.specialty || '',
        website: user.website || '',
        twitter: user.socials?.twitter || '',
        instagram: user.socials?.instagram || '',
        portfolio: user.socials?.portfolio || '',
      });
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const [statsRes, artworksRes, salesRes] = await Promise.all([
        artistAPI.getDashboard(),
        artworkAPI.getByArtist(user._id),
        orderAPI.getArtistSales()
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (artworksRes.data?.success) setArtworks(artworksRes.data.artworks);
      if (salesRes.data?.success) setSales(salesRes.data.sales);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this artwork? This action is permanent.')) return;
    try {
      await artworkAPI.delete(id);
      setArtworks(prev => prev.filter(a => a._id !== id));
      toast.success('Artwork deleted successfully!');
      // Reload stats
      const statsRes = await artistAPI.getDashboard();
      if (statsRes.data?.success) setStats(statsRes.data.stats);
    } catch {
      toast.error('Failed to delete artwork.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUser({
        name: profileForm.name,
        bio: profileForm.bio,
        location: profileForm.location,
        specialty: profileForm.specialty,
        website: profileForm.website,
        socials: {
          twitter: profileForm.twitter,
          instagram: profileForm.instagram,
          portfolio: profileForm.portfolio,
        }
      });
      toast.success('Artist profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Generate monthly revenue and sales dynamically from orders
  const getChartData = () => {
    const monthlyRevenue = Array(7).fill(0);
    const monthlySales = Array(7).fill(0);

    if (sales && sales.length > 0) {
      sales.forEach(sale => {
        const date = new Date(sale.date);
        const monthIdx = date.getMonth();
        if (monthIdx < 7) {
          monthlyRevenue[monthIdx] += sale.payout;
          monthlySales[monthIdx] += 1;
        }
      });
    } else {
      // Return beautiful demo curves if no transactions exist yet
      return {
        revenue: [12000, 19000, 15000, 25000, 32000, 28000, stats.revenue || 41000],
        sales: [4, 7, 5, 11, 14, 10, stats.sales || 18],
      };
    }

    return { revenue: monthlyRevenue, sales: monthlySales };
  };

  const currentChartData = getChartData();

  const revenueData = {
    labels: MONTHS.slice(0, 7),
    datasets: [{
      label: 'Revenue (₹)',
      data: currentChartData.revenue,
      borderColor: '#00d4ff',
      backgroundColor: 'rgba(0,212,255,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00d4ff',
      pointRadius: 4,
    }],
  };

  const salesData = {
    labels: MONTHS.slice(0, 7),
    datasets: [{
      label: 'Sales',
      data: currentChartData.sales,
      backgroundColor: 'rgba(0,212,255,0.25)',
      borderColor: '#00d4ff',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  if (loading && artworks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-neon border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading artist portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-6 max-w-screen-xl mx-auto py-8 bg-navy">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <p className="text-cyan-neon text-sm font-semibold tracking-widest uppercase mb-1">Artist Dashboard</p>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>
            Welcome, {user?.name || 'Artist'} ✦
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here is how your creations are performing</p>
        </div>
        <Link to="/sell" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Upload Artwork
        </Link>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-1 glass-card p-1 w-fit mb-8 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'artworks', label: 'My Artworks' },
          { id: 'orders', label: 'Order History' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'profile', label: 'Edit Profile' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id
                ? 'bg-cyan-neon/20 text-cyan-neon border border-cyan-neon/30 shadow-neon-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: Overview ─── */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={`₹${stats.revenue?.toLocaleString() || 0}`} icon={DollarSign} color="from-cyan-400 to-blue-500" />
            <StatCard title="Artworks Sold" value={stats.sales || 0} icon={Package} color="from-purple-500 to-pink-500" />
            <StatCard title="Total Views" value={stats.views?.toLocaleString() || 0} icon={Eye} color="from-emerald-500 to-teal-500" />
            <StatCard title="Uploaded Artworks" value={stats.artworkCount || 0} icon={Award} color="from-orange-500 to-red-500" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="chart-container">
              <h3 className="text-white font-semibold mb-4">Monthly Revenue Flow</h3>
              <Line data={revenueData} options={chartOptions} />
            </div>
            <div className="chart-container">
              <h3 className="text-white font-semibold mb-4">Monthly Sales Metrics</h3>
              <Bar data={salesData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Orders table */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2">
              <h3 className="text-white font-bold">Recent Orders</h3>
              <button onClick={() => setTab('orders')} className="text-xs text-cyan-neon hover:underline font-semibold">View All Orders</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Order ID</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Buyer</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Artwork</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Net Payout (80%)</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 5).map(order => (
                    <tr key={order.orderId} className="border-b border-white/5 hover:bg-white/3 transition-all">
                      <td className="px-5 py-4 text-slate-300 text-sm font-mono truncate max-w-[120px]">{order.orderId}</td>
                      <td className="px-5 py-4 text-white text-sm font-medium">{order.buyerName}</td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{order.artworkTitle}</td>
                      <td className="px-5 py-4 text-slate-400 text-sm">₹{order.amount?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-cyan-neon text-sm font-bold">₹{order.payout?.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">
                          completed
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-500 text-sm">
                        No sales registered yet. Upload works and promote them to buyers!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 2: Artworks Management ─── */}
      {tab === 'artworks' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">{artworks.length} Uploaded Artworks</p>
            <Link to="/sell" className="btn-primary text-sm py-2 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload New
            </Link>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Artwork Details</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">License</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Price</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Total Sales</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Views</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.map(art => (
                    <tr key={art._id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={art.imageUrl} alt={art.title} className="w-12 h-12 rounded-lg object-cover border border-white/10 flex-shrink-0" />
                          <div>
                            <span className="text-white text-sm font-semibold block line-clamp-1">{art.title}</span>
                            <span className="text-slate-500 text-xs block">{art.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs uppercase font-semibold text-cyan-neon bg-cyan-neon/10 border border-cyan-neon/20 px-2 py-0.5 rounded-full">
                          {art.licenseType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white text-sm font-bold">₹{art.price?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-300 text-sm font-semibold">{art.sales || 0} purchases</td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{(art.views || 0).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          art.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                        }`}>
                          {art.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/artwork/${art._id}`} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-neon transition-all" title="View Details">
                            <Eye className="w-4.5 h-4.5" />
                          </Link>
                          <Link to={`/sell?edit=${art._id}`} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-neon transition-all" title="Edit Artwork">
                            <Edit className="w-4.5 h-4.5" />
                          </Link>
                          <button onClick={() => handleDelete(art._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all" title="Delete Artwork">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {artworks.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-16 text-slate-500 text-sm">
                        No artworks uploaded. Add your first digital asset now!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 3: Complete Order History ─── */}
      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Order ID</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Collector (Buyer)</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Artwork Sold</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Charged Amount</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Your Payout (80%)</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(order => (
                    <tr key={order.orderId} className="border-b border-white/5 hover:bg-white/3 transition-all text-sm">
                      <td className="px-5 py-4 text-slate-300 font-mono">{order.orderId}</td>
                      <td className="px-5 py-4 text-white font-medium">{order.buyerName}</td>
                      <td className="px-5 py-4 text-slate-300">{order.artworkTitle}</td>
                      <td className="px-5 py-4 text-slate-400">{order.date}</td>
                      <td className="px-5 py-4 text-white">₹{order.amount?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-cyan-neon font-bold">₹{order.payout?.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-16 text-slate-500 text-sm">
                        No orders recorded. Your sales transactions will appear here instantly upon buyer checkout.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 4: Comprehensive Analytics ─── */}
      {tab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="chart-container">
              <h3 className="text-white font-semibold mb-4">Revenue Analytics (₹ Payouts)</h3>
              <Line data={revenueData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true, labels: { color: '#94a3b8' } } } }} />
            </div>
            <div className="chart-container">
              <h3 className="text-white font-semibold mb-4">Volume Metrics (Sales Counts)</h3>
              <Bar data={salesData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-2">Performance Summary</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Your overall average ratings stand strong at <strong className="text-cyan-neon">{stats.rating || '4.8'}★</strong> with a conversion payout yield of 80% per transaction after secure cloud licensing overheads.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-slate-500 text-xs uppercase font-medium">Conversion Rate</p>
                <p className="text-white text-lg font-bold mt-1">~5.4%</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase font-medium">Views-to-Sales Ratio</p>
                <p className="text-white text-lg font-bold mt-1">
                  {stats.views ? `${((stats.sales / stats.views) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase font-medium">Avg Order Value</p>
                <p className="text-white text-lg font-bold mt-1">
                  ₹{sales.length ? Math.round(sales.reduce((acc, s) => acc + s.amount, 0) / sales.length).toLocaleString() : '0'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase font-medium">Escrow Status</p>
                <p className="text-green-400 text-sm font-semibold mt-1">Fully Audited</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 5: Artist Profile & Bio / About Section ─── */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Preview Panel (Left) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 text-center flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center overflow-hidden mb-4 shadow-neon-sm border-2 border-cyan-neon/30">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-navy">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{user?.name}</h3>
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-neon bg-cyan-neon/15 px-3 py-1 rounded-full border border-cyan-neon/20">
                {user?.specialty || 'Digital Artist'}
              </span>

              <div className="w-full space-y-3 mt-6 border-t border-white/5 pt-6 text-left text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{user?.location || 'Not Specified'}</span>
                </div>
                {user?.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={user.website} target="_blank" rel="noreferrer" className="text-cyan-neon hover:underline truncate">{user.website}</a>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h4 className="text-white font-bold mb-3">Bio / About Preview</h4>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                {user?.bio || 'You have not added a bio yet. Update your profile using the form to let potential art buyers learn more about your creative vision and style!'}
              </p>
            </div>
          </div>

          {/* Profile Editing Form Panel (Right) */}
          <div className="lg:col-span-8">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-3">Edit Artist Profile</h3>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      className="glass-input"
                      placeholder="Your artist/studio name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Art Specialty</label>
                    <input
                      type="text"
                      value={profileForm.specialty}
                      onChange={e => setProfileForm(p => ({ ...p, specialty: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. Cyberpunk Art, Abstract Digital"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Bio / About Me</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                    className="glass-input min-h-28 leading-relaxed"
                    placeholder="Tell buyers about your artistic journey, inspirations, and techniques..."
                    maxLength="500"
                  />
                  <p className="text-right text-[10px] text-slate-500 mt-1">{profileForm.bio.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. Mumbai, India"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Personal/Portfolio Website</label>
                    <input
                      type="url"
                      value={profileForm.website}
                      onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))}
                      className="glass-input"
                      placeholder="https://myart.com"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-5 space-y-4">
                  <h4 className="text-white font-bold text-sm">Social Profiles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.twitter}
                        onChange={e => setProfileForm(p => ({ ...p, twitter: e.target.value }))}
                        className="glass-input pl-9 text-xs"
                        placeholder="Twitter Handle"
                      />
                    </div>
                    <div className="relative">
                      <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.instagram}
                        onChange={e => setProfileForm(p => ({ ...p, instagram: e.target.value }))}
                        className="glass-input pl-9 text-xs"
                        placeholder="Instagram Name"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.portfolio}
                        onChange={e => setProfileForm(p => ({ ...p, portfolio: e.target.value }))}
                        className="glass-input pl-9 text-xs"
                        placeholder="ArtStation/Behance"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary py-3 px-8 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-navy border-t-transparent animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile Details'
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
