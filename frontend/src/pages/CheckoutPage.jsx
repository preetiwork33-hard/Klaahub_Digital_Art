import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, QrCode, Wallet, Smartphone, ShieldCheck,
  CheckCircle, ArrowLeft, Loader2, Info, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { artworkAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const artworkId = searchParams.get('artworkId');

  // State
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeMethod, setActiveMethod] = useState('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [step, setStep] = useState('processing'); // processing, completed

  // Card Form State
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  // UPI State
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);

  // QR Code State
  const [timer, setTimer] = useState(300); // 5 minutes

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('');

  // Fetch artwork if buying directly
  useEffect(() => {
    if (artworkId) {
      const getArtwork = async () => {
        setFetching(true);
        try {
          const res = await artworkAPI.getOne(artworkId);
          if (res.data?.artwork) {
            setPurchaseItem(res.data.artwork);
          }
        } catch (err) {
          toast.error('Failed to load artwork details.');
          navigate('/explore');
        } finally {
          setFetching(false);
        }
      };
      getArtwork();
    }
  }, [artworkId, navigate]);

  // QR Code Timer countdown
  useEffect(() => {
    if (activeMethod === 'qr' && timer > 0 && !paymentSuccess) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeMethod, timer, paymentSuccess]);

  // Derived Values
  const getItems = () => {
    if (artworkId) {
      return purchaseItem ? [purchaseItem] : [];
    }
    return cartItems;
  };

  const itemsToBuy = getItems();
  const totalAmount = artworkId ? (purchaseItem?.price || 0) : cartTotal;

  // Form Verification
  const validateCard = () => {
    const { number, name, expiry, cvv } = cardForm;
    if (number.replace(/\s/g, '').length !== 16) {
      toast.error('Card number must be 16 digits');
      return false;
    }
    if (!name.trim()) {
      toast.error('Cardholder name is required');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      toast.error('Expiry date must be in MM/YY format');
      return false;
    }
    if (cvv.length !== 3) {
      toast.error('CVV must be 3 digits');
      return false;
    }
    return true;
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. name@bank)');
      return;
    }
    setVerifyingUpi(true);
    setTimeout(() => {
      setUpiVerified(true);
      setVerifyingUpi(false);
      toast.success('UPI ID verified successfully!');
    }, 1500);
  };

  // Payment Execution Handler
  const handlePaymentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (itemsToBuy.length === 0) return;

    if (activeMethod === 'card' && !validateCard()) return;
    if (activeMethod === 'upi' && !upiVerified) {
      toast.error('Please verify your UPI ID first');
      return;
    }
    if (activeMethod === 'wallet' && !selectedWallet) {
      toast.error('Please select a wallet provider');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the order in pending state on the backend
      const orderData = {
        items: itemsToBuy.map(item => ({ artworkId: item._id, price: item.price })),
        totalAmount,
      };

      const orderRes = await orderAPI.create(orderData);
      const order = orderRes.data?.order;
      if (!order) throw new Error('Order creation failed');

      // 2. Perform payment verification (Simulation of banking handshake)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Processing delay

      const verifyRes = await orderAPI.verifyPayment({
        orderId: order._id,
        razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        razorpayOrderId: order.razorpayOrderId || null,
        razorpaySignature: null,
      });

      if (verifyRes.data?.success) {
        setCreatedOrder(verifyRes.data.order);
        setPaymentSuccess(true);
        if (!artworkId) {
          clearCart();
        }
        toast.success('Transaction Completed Successfully!');
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format QR Code Timer
  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-neon animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Fetching checkout details...</p>
        </div>
      </div>
    );
  }

  if (itemsToBuy.length === 0 && !paymentSuccess) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="text-center glass-card p-8 max-w-md">
          <Info className="w-12 h-12 text-cyan-neon mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Items Found</h2>
          <p className="text-slate-400 mb-6">You don't have any items to purchase right now.</p>
          <button onClick={() => navigate('/explore')} className="btn-primary w-full">Browse Artworks</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-16 relative overflow-hidden bg-navy">
      {/* Visual background details */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-blue-accent/15 z-0">
        <div className="orb w-96 h-96 bg-cyan-neon -top-20 -left-20 opacity-5" />
        <div className="orb w-80 h-80 bg-blue-electric -bottom-10 right-0 opacity-5" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-neon transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <AnimatePresence mode="wait">
          {!paymentSuccess ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* LEFT COLUMN: Payment Gateways */}
              <div className="lg:col-span-7 space-y-6">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit' }}>Payment Method</h2>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                      <Lock className="w-3.5 h-3.5 text-cyan-neon" /> Secured 256-bit
                    </span>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {[
                      { id: 'card', label: 'Cards', icon: CreditCard },
                      { id: 'upi', label: 'UPI', icon: Smartphone },
                      { id: 'qr', label: 'Scan QR', icon: QrCode },
                      { id: 'wallet', label: 'Wallets', icon: Wallet },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setActiveMethod(method.id)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-sm font-medium transition-all gap-2 bg-navy-light/40 ${
                          activeMethod === method.id
                            ? 'border-cyan-neon bg-cyan-neon/10 text-cyan-neon shadow-neon-sm'
                            : 'border-white/5 hover:border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <method.icon className={`w-5 h-5 ${activeMethod === method.id ? 'text-cyan-neon animate-pulse' : 'text-slate-400'}`} />
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {/* Payment Forms */}
                  <div className="min-h-56">
                    {/* 1. Debit/Credit Card */}
                    {activeMethod === 'card' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Interactive live Credit Card layout */}
                        <div className="relative w-full max-w-sm h-48 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800 p-6 text-white shadow-xl overflow-hidden flex flex-col justify-between border border-cyan-neon/30">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-cyan-100 opacity-80">KlaaHub Secure Card</p>
                              <span className="font-mono text-xl tracking-widest text-white mt-1 block">
                                {cardForm.number || '•••• •••• •••• ••••'}
                              </span>
                            </div>
                            <span className="text-cyan-neon font-black italic text-lg">VISA</span>
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-cyan-100 opacity-60">Card Holder</p>
                              <p className="font-bold text-sm tracking-wider uppercase truncate max-w-[200px]">
                                {cardForm.name || 'Your Name'}
                              </p>
                            </div>
                            <div className="flex gap-4">
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-cyan-100 opacity-60">Expires</p>
                                <p className="font-bold text-sm tracking-wider">{cardForm.expiry || 'MM/YY'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-cyan-100 opacity-60">CVV</p>
                                <p className="font-bold text-sm tracking-wider">{cardForm.cvv || '•••'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card input forms */}
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Card Number</label>
                            <input
                              type="text"
                              value={cardForm.number}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                                setCardForm(p => ({ ...p, number: formatted }));
                              }}
                              placeholder="4111 2222 3333 4444"
                              className="glass-input text-base font-mono"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Cardholder Name</label>
                            <input
                              type="text"
                              value={cardForm.name}
                              onChange={(e) => setCardForm(p => ({ ...p, name: e.target.value }))}
                              placeholder="Name on Credit Card"
                              className="glass-input"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                              <input
                                type="text"
                                value={cardForm.expiry}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                  if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                                  setCardForm(p => ({ ...p, expiry: val }));
                                }}
                                placeholder="MM/YY"
                                className="glass-input font-mono"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">CVV / CVC</label>
                              <input
                                type="password"
                                value={cardForm.cvv}
                                onChange={(e) => setCardForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').substring(0, 3) }))}
                                placeholder="•••"
                                className="glass-input font-mono"
                                required
                              />
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* 2. UPI Payments */}
                    {activeMethod === 'upi' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="bg-cyan-neon/5 border border-cyan-neon/20 rounded-xl p-4 flex gap-3 mb-4">
                          <Info className="w-5 h-5 text-cyan-neon flex-shrink-0" />
                          <p className="text-slate-300 text-xs leading-relaxed">
                            Pay securely using your UPI ID. Compatible with BHIM, Google Pay, PhonePe, Paytm, or any banking app.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Enter Virtual Payment Address (UPI ID)</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => {
                                  setUpiId(e.target.value);
                                  setUpiVerified(false);
                                }}
                                placeholder="username@upi"
                                className={`glass-input font-semibold tracking-wide ${
                                  upiVerified ? 'border-green-500/50 focus:ring-green-400' : ''
                                }`}
                              />
                              {upiVerified && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-bold rounded-full px-2 py-0.5 uppercase">
                                  Verified
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleVerifyUpi}
                              disabled={verifyingUpi || !upiId}
                              className="px-5 rounded-xl border border-cyan-neon/30 text-cyan-neon hover:bg-cyan-neon hover:text-navy font-semibold transition-all text-sm disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              {verifyingUpi ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify'}
                            </button>
                          </div>
                        </div>

                        {upiVerified && (
                          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-4 rounded-xl bg-white/3 border border-white/5">
                            <p className="text-slate-400 text-xs">Payer Account</p>
                            <p className="text-white text-sm font-bold mt-0.5">{user?.name}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* 3. QR Code Payments */}
                    {activeMethod === 'qr' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                        <p className="text-slate-300 text-xs font-medium uppercase tracking-wider">Scan this QR to pay instantly</p>

                        <div className="relative w-44 h-44 mx-auto p-3 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-cyan-neon/30 group">
                          {/* Pulsing light border effect */}
                          <div className="absolute inset-0 rounded-2xl border-4 border-cyan-neon opacity-20 animate-ping group-hover:scale-105" />
                          {/* Simulated QR Code image */}
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=klaahub@axisbank%26pn=KlaaHub%26am=${totalAmount}%26cu=INR`}
                            alt="Payment QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="max-w-xs mx-auto space-y-1">
                          <p className="text-white text-sm font-bold">₹{totalAmount.toLocaleString()}</p>
                          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <span>Code expires in:</span>
                            <span className="font-bold text-orange-400 font-mono">{timer > 0 ? formatTime(timer) : 'Expired'}</span>
                          </div>
                        </div>

                        <div className="flex justify-center gap-3 items-center pt-2">
                          <button
                            onClick={handlePaymentSubmit}
                            disabled={loading || timer <= 0}
                            className="btn-outline py-2 px-6 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-cyan-neon" /> Confirm Mobile payment
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* 4. Wallet Payments */}
                    {activeMethod === 'wallet' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Select Wallet Provider</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: 'Paytm', color: 'from-[#002E6E] to-[#00b9f5]' },
                            { name: 'PhonePe', color: 'from-[#5F259F] to-[#7E43BF]' },
                            { name: 'Google Pay', color: 'from-[#4285F4] to-[#34A853]' },
                            { name: 'Amazon Pay', color: 'from-[#FF9900] to-[#E47911]' },
                          ].map(wallet => (
                            <button
                              key={wallet.name}
                              type="button"
                              onClick={() => setSelectedWallet(wallet.name)}
                              className={`p-4 rounded-xl border flex flex-col justify-between items-start transition-all relative overflow-hidden bg-navy-light/40 ${
                                selectedWallet === wallet.name
                                  ? 'border-cyan-neon shadow-neon-sm'
                                  : 'border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${wallet.color} flex items-center justify-center text-white text-xs font-black shadow-md`}>
                                {wallet.name[0]}
                              </div>
                              <span className="text-white text-sm font-bold mt-4">{wallet.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Primary Pay Button */}
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={loading || (activeMethod === 'qr' && timer <= 0)}
                    className="btn-primary w-full py-4 mt-8 flex items-center justify-center gap-2.5 text-base shadow-neon font-bold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Secure Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Pay ₹{totalAmount.toLocaleString()} Securely
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Order Summary */}
              <div className="lg:col-span-5">
                <div className="glass-card p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-3">Order Summary</h3>

                  {/* List items to buy */}
                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 mb-5">
                    {itemsToBuy.map(item => (
                      <div key={item._id} className="flex gap-3 bg-white/3 border border-white/5 rounded-xl p-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-14 h-14 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white text-sm font-semibold truncate">{item.title}</h4>
                          <p className="text-slate-400 text-xs truncate">by {item.artist?.name || 'Aria Nova'}</p>
                          <span className="text-[10px] text-cyan-neon font-mono mt-0.5 inline-block uppercase bg-cyan-neon/10 px-2 py-0.5 rounded-full border border-cyan-neon/20">
                            {item.licenseType || 'Commercial'}
                          </span>
                        </div>
                        <span className="text-white font-bold text-sm">₹{item.price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing break downs */}
                  <div className="space-y-3 mb-5 border-b border-white/5 pb-5">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Item Subtotal ({itemsToBuy.length})</span>
                      <span className="text-white font-medium">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Licensing fees</span>
                      <span className="text-white font-medium">Included</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Platform transaction commission</span>
                      <span className="text-green-400 font-medium">Free</span>
                    </div>
                  </div>

                  {/* Total price */}
                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-white text-base font-bold">Total Payout</span>
                    <span className="neon-text text-2xl font-black font-mono">₹{totalAmount.toLocaleString()}</span>
                  </div>

                  {/* Trust Signals */}
                  <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-cyan-neon flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-xs font-semibold">Immediate Library Activation</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">
                          Purchased digital artworks will instantly become available in your Buyer Dashboard for download in high definition.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-cyan-neon flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-xs font-semibold">Protected Escrow Guarantee</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">
                          Payments are securely processed. Artists receive earnings and sales metrics update automatically on their portal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* PAYMENT SUCCESS SCREEN */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center glass-card p-8 shadow-card flex flex-col items-center"
            >
              {/* Confetti & pulsing check animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 shadow-neon-sm"
              >
                <CheckCircle className="w-12 h-12 text-green-400" />
              </motion.div>

              <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit' }}>Payment Verified!</h2>
              <p className="text-cyan-neon font-semibold text-sm mb-4 tracking-widest uppercase">Transaction Successful</p>

              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Thank you for your purchase! The artwork licenses have been generated and added to your buyer collection. Artist metrics have been updated in real-time.
              </p>

              {/* Order breakdown */}
              <div className="w-full text-left space-y-2 border-t border-b border-white/5 py-4 mb-6 text-xs text-slate-300 font-mono bg-navy-light/20 px-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="text-white">{createdOrder?._id || 'ORD-000000000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="text-white">{createdOrder?.payment?.razorpayPaymentId || 'TXN-9999999'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Charged:</span>
                  <span className="text-cyan-neon font-bold font-sans">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Channel:</span>
                  <span className="text-white capitalize">{activeMethod}</span>
                </div>
              </div>

              <div className="space-y-3 w-full">
                <button
                  onClick={() => navigate('/dashboard/buyer')}
                  className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Go to Buyer Dashboard
                </button>
                <button
                  onClick={() => navigate('/explore')}
                  className="btn-outline w-full py-3 text-sm text-slate-300 hover:text-white"
                >
                  Continue Browsing
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
