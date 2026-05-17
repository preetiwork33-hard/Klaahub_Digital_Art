import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Heart, Package, History, Bell, Star, Eye, CreditCard, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI, wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState('library');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tabParam && ['library', 'wishlist', 'orders', 'payments'].includes(tabParam)) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ordRes, wishRes] = await Promise.all([
        orderAPI.getMyOrders(),
        wishlistAPI.get()
      ]);
      if (ordRes.data?.success && ordRes.data.orders) {
        setOrders(ordRes.data.orders);
      }
      if (wishRes.data?.success && wishRes.data.wishlist) {
        setWishlist(wishRes.data.wishlist);
      }
    } catch (err) {
      console.error('Failed to load buyer dashboard data:', err);
      toast.error('Failed to load real-time collection data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDownload = (artwork, title) => {
    if (!artwork || !artwork.imageUrl) {
      toast.error('Download link not available for this artwork.');
      return;
    }
    try {
      // Force native download via anchor trigger
      const link = document.createElement('a');
      link.href = artwork.imageUrl;
      link.setAttribute('download', `${title || 'KlaaHub_Art'}.jpg`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Successfully downloaded high-resolution "${title || 'Artwork'}"!`);
    } catch (err) {
      toast.error('Failed to trigger download.');
    }
  };

  const handleRemoveWishlist = async (e, artworkId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await wishlistAPI.toggle(artworkId);
      if (res.data?.success) {
        setWishlist(prev => prev.filter(w => w._id !== artworkId));
        toast.success('Removed from wishlist!');
      }
    } catch {
      toast.error('Failed to update wishlist.');
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

  const tabs = [
    { id: 'library', label: 'My Library', icon: Download },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'payments', label: 'Receipts', icon: CreditCard },
  ];

  if (loading && orders.length === 0 && wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-neon border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your art collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-6 pb-16 max-w-screen-xl mx-auto bg-navy">
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <p className="text-cyan-neon text-sm font-semibold tracking-widest uppercase mb-1">Buyer Dashboard</p>
        <h1 className="text-3xl font-black text-white animate-pulse-slow" style={{ fontFamily: 'Outfit' }}>
          My Collection ✦
        </h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name || 'Collector'}</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Artworks Owned', value: orders.length, icon: Download, color: 'from-cyan-400 to-blue-500' },
          { label: 'Saved Wishes', value: wishlist.length, icon: Heart, color: 'from-pink-500 to-rose-500' },
          { label: 'Total Invested', value: `₹${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'from-purple-500 to-indigo-500' },
          { label: 'License Authority', value: 'Commercial', icon: ShieldCheck, color: 'from-emerald-500 to-teal-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} whileHover={{ y: -3 }} className="stat-card text-center">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex gap-1 glass-card p-1 w-fit mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id
                ? 'bg-cyan-neon/20 text-cyan-neon border border-cyan-neon/30 shadow-neon-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: Library (Artworks ready to download) ─── */}
      {tab === 'library' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden group border border-white/5"
              >
                <div className="relative" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={order.artwork?.imageUrl}
                    alt={order.artwork?.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                    <button
                      onClick={() => handleDownload(order.artwork, order.artwork?.title)}
                      className="btn-primary text-sm py-2.5 w-full flex items-center justify-center gap-2 shadow-neon"
                    >
                      <Download className="w-4 h-4" /> Download High-Res
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-navy-light/10">
                  <span className="text-[10px] text-cyan-neon font-mono uppercase bg-cyan-neon/15 px-2 py-0.5 rounded-full border border-cyan-neon/20 mb-2 inline-block">
                    {order.artwork?.licenseType || 'Commercial'} License
                  </span>
                  <h3 className="font-semibold text-white text-base line-clamp-1 mb-1">{order.artwork?.title}</h3>
                  <p className="text-slate-400 text-xs mb-3">by {order.artwork?.artist?.name || 'Aria Nova'}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                    <span className="text-white font-bold text-sm">₹{order.amount?.toLocaleString()}</span>
                    <span className="text-slate-500 text-xs">{order.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {orders.length === 0 && (
              <div className="col-span-3 text-center py-20 glass-card">
                <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg">No Artworks Owned Yet</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                  Browse our high-end marketplace and acquire unique licenses for your personal or commercial projects.
                </p>
                <Link to="/explore" className="btn-primary mt-6 inline-flex items-center gap-2">
                  Explore Art Market <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── TAB 2: Saved Wishlist ─── */}
      {tab === 'wishlist' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden group border border-white/5"
              >
                <div className="relative" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveWishlist(e, item._id)}
                    className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md bg-black/40 border border-white/10 hover:border-red-400/40 text-rose-400 hover:text-red-300 transition-all"
                    title="Remove from Wishlist"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="p-4 bg-navy-light/10">
                  <h3 className="font-semibold text-white text-base line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs mb-4">by {item.artist?.name || 'Unknown Artist'}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-cyan-neon font-black text-lg">₹{item.price?.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Link to={`/artwork/${item._id}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all" title="View details">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link to={`/checkout?artworkId=${item._id}`} className="btn-primary text-xs py-1.5 px-4 font-bold uppercase tracking-wider">
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {wishlist.length === 0 && (
              <div className="col-span-3 text-center py-20 glass-card">
                <Heart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg">Your Wishlist is Empty</h3>
                <p className="text-slate-400 text-sm mt-1">Save unique digital designs to your wishlist to acquire them later.</p>
                <Link to="/explore" className="btn-outline mt-6 inline-flex">Browse Artworks</Link>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── TAB 3: Complete Order History ─── */}
      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left bg-white/2">
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Artwork</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Artist</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Total Charge</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Acquisition Date</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Checkout Status</th>
                    <th className="px-5 py-3 text-slate-400 text-xs uppercase tracking-wider">Digital Copy</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-b border-white/5 hover:bg-white/3 transition-all text-sm">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={order.artwork?.imageUrl}
                            alt={order.artwork?.title}
                            className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                          <span className="text-white font-semibold line-clamp-1">{order.artwork?.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-medium">{order.artwork?.artist?.name || 'Aria Nova'}</td>
                      <td className="px-5 py-4 text-cyan-neon font-bold">₹{order.amount?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-400">{order.date}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">
                          completed
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDownload(order.artwork, order.artwork?.title)}
                          className="flex items-center gap-1.5 text-cyan-neon hover:text-cyan-glow hover:underline font-bold text-xs uppercase tracking-wider"
                        >
                          <Download className="w-3.5 h-3.5" /> Get Asset
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-16 text-slate-500">
                        No transactions registered in order history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 4: Transaction Receipts ─── */}
      {tab === 'payments' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-2">Acquisition Escrow Invoices</h3>
            <p className="text-slate-400 text-sm mb-6">Verify and download detailed transactional records here.</p>
            <div className="space-y-4 max-w-2xl mx-auto">
              {orders.map(order => (
                <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5 gap-4">
                  <div>
                    <h4 className="text-white text-sm font-bold">{order.artwork?.title || 'Digital Asset'}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Order: #{order._id}</p>
                    <p className="text-slate-400 text-xs mt-1">Date: {order.date} · Billing Channel: Digital Wallet</p>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-cyan-neon font-black text-lg">₹{order.amount?.toLocaleString()}</span>
                    <button
                      onClick={() => handleDownload(order.artwork, order.artwork?.title)}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      <Download className="w-3 h-3 text-cyan-neon" /> Invoice
                    </button>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  No payment invoices available.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
