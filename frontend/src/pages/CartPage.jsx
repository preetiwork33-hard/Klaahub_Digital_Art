import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowRight, Shield, Package, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (user?.role === 'artist') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Outfit' }}>Access Denied</h2>
          <p className="text-slate-400 mb-6">Cart and buying functionality are restricted to buyers to maintain marketplace separation and privacy.</p>
          <button onClick={() => navigate('/dashboard/artist')} className="btn-primary flex items-center gap-2 mx-auto">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) { toast.error('Please login to checkout'); navigate('/login'); return; }
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({ artworkId: item._id, price: item.price })),
        totalAmount: cartTotal,
      };
      const res = await orderAPI.create(orderData);
      const order = res.data?.order;

      // Razorpay integration
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_demo',
        amount: cartTotal * 100,
        currency: 'INR',
        name: 'KlaaHub',
        description: `Purchase ${cartCount} artwork(s)`,
        order_id: order?.razorpayOrderId,
        handler: async (response) => {
          try {
            await orderAPI.verifyPayment({ ...response, orderId: order?._id });
            clearCart();
            toast.success('Payment successful! Artworks added to your library.');
            navigate('/dashboard/buyer');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#00d4ff' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Demo mode
        toast.success('Demo: Payment successful! (Razorpay not loaded in dev mode)');
        clearCart();
        navigate('/dashboard/buyer');
      }
    } catch {
      // Demo mode - simulate success
      toast.success('Demo checkout complete! (API not connected)');
      clearCart();
      navigate('/dashboard/buyer');
    } finally {
      setLoading(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-cyan-neon/10 border border-cyan-neon/20 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-cyan-neon" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Outfit' }}>Your cart is empty</h2>
          <p className="text-slate-400 mb-6">Browse our collection and find artwork that speaks to you.</p>
          <button onClick={() => navigate('/explore')} className="btn-primary flex items-center gap-2 mx-auto">
            Explore Art <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-6 pb-16 max-w-screen-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>Shopping Cart</h1>
        <p className="text-slate-400 mt-1">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center gap-4"
            >
              <img
                src={item.imageUrl || '/default-art.png'}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-xl border border-white/10 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold line-clamp-1">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.artist?.name}</p>
                <span className="tag-pill text-xs mt-1 inline-block">{item.licenseType || 'Commercial'} License</span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-cyan-neon font-bold text-lg">₹{item.price?.toLocaleString()}</p>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="mt-1 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-white font-bold text-lg mb-5">Order Summary</h3>
            <div className="space-y-3 mb-5 border-b border-white/5 pb-5">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-slate-400 line-clamp-1 flex-1 mr-2">{item.title}</span>
                  <span className="text-white font-medium flex-shrink-0">₹{item.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white font-medium">₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Platform Fee</span>
              <span className="text-green-400 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-3 mt-3">
              <span className="text-white">Total</span>
              <span className="neon-text">₹{cartTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-navy border-t-transparent animate-spin" />
              ) : (
                <><Shield className="w-4 h-4" /> Proceed to Pay</>
              )}
            </button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5 text-cyan-neon flex-shrink-0" />
                <span>Secured by SSL encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Package className="w-3.5 h-3.5 text-cyan-neon flex-shrink-0" />
                <span>Instant download after payment</span>
              </div>
            </div>

            {/* Payment logos */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-slate-500 text-xs mb-3 text-center">Accepted payments</p>
              <div className="flex items-center justify-center gap-3 text-slate-500 text-xs">
                <span className="glass-card px-2.5 py-1.5 rounded font-mono font-bold text-white text-xs">UPI</span>
                <span className="glass-card px-2.5 py-1.5 rounded font-semibold text-xs">Visa</span>
                <span className="glass-card px-2.5 py-1.5 rounded font-semibold text-xs">MC</span>
                <span className="glass-card px-2.5 py-1.5 rounded font-semibold text-xs">Wallet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
