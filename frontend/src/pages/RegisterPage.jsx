import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Palette, ArrowRight, Globe, Brush, ShoppingBag, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'buyer', label: 'Art Collector', desc: 'Browse and buy digital artwork', icon: ShoppingBag, color: 'from-blue-500 to-indigo-600' },
  { id: 'artist', label: 'Digital Artist', desc: 'Sell your art to the world', icon: Brush, color: 'from-cyan-400 to-blue-500' },
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ['buyer', 'artist'].includes(searchParams.get('role'))
      ? searchParams.get('role')
      : (searchParams.get('role') === 'digital-artist' ? 'artist' : (searchParams.get('role') === 'art-collector' ? 'buyer' : 'buyer')),
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success(`Welcome to KlaaHub, ${user.name}!`);
      if (user.role === 'artist') navigate('/dashboard/artist');
      else navigate('/explore');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-blue-accent/20">
        <div className="orb w-96 h-96 bg-cyan-neon -top-20 -right-20 opacity-10" />
        <div className="orb w-80 h-80 bg-blue-electric bottom-0 -left-20 opacity-10" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-neon-sm border border-cyan-neon/30">
              <img src="/Klaahublobo.jpeg" alt="KlaaHub Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-2xl text-white" style={{ fontFamily: 'Outfit' }}>
              Klaa<span className="neon-text">Hub</span>
            </span>
          </Link>

          <p className="text-slate-400">Create your free account today</p>
        </div>

        <div className="glass-card p-8">


          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="glass-input"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="glass-input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="glass-input pr-10"
                  placeholder="Min. 6 characters"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className={`glass-input ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-500/50' : ''}`}
                placeholder="Repeat password"
                required
              />
            </div>
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Choose Your Role
              </label>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    role: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-neon backdrop-blur-md"
              >
                <option value="" disabled className="bg-navy text-slate-400">
                  Select Role
                </option>

                <option value="buyer" className="bg-navy text-white">
                  Art Collector (Buyer)
                </option>

                <option value="artist" className="bg-navy text-white">
                  Digital Artist (Artist)
                </option>
              </select>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" required className="mt-0.5 rounded border-white/20 bg-white/5" />
              <label htmlFor="terms" className="text-xs text-slate-400">
                I agree to the{' '}
                <Link to="/terms" className="text-cyan-neon hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-cyan-neon hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-navy border-t-transparent animate-spin" />
              ) : (
                <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button className="w-full flex items-center justify-center gap-3 py-3 glass-input hover:bg-white/10 transition-all rounded-lg">
            <Globe className="w-5 h-5 text-cyan-neon" />
            <span className="text-sm font-medium text-white">Continue with Google</span>
          </button>

          <p className="text-center text-slate-400 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-neon hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
