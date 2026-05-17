import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, User, Menu, X, Palette, ChevronDown,
  LogOut, LayoutDashboard, Heart, Package, Settings, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Explore Art', path: '/explore' },
  { label: 'Artists', path: '/artists' },
  { label: 'Categories', path: '/categories' },
  { label: 'Sell Art', path: '/sell' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user?.role === 'artist') return '/dashboard/artist';
    if (user?.role === 'admin') return '/dashboard/admin';
    return '/dashboard/buyer';
  };

  const getWishlistPath = () => {
    if (user?.role === 'artist') return '/dashboard/artist';
    return '/dashboard/buyer?tab=wishlist';
  };

  const getOrdersPath = () => {
    if (user?.role === 'artist') return '/dashboard/artist?tab=orders';
    return '/dashboard/buyer?tab=orders';
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-glass' : 'bg-transparent'}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-neon-sm transition-all duration-300 group-hover:shadow-neon border border-cyan-neon/40 flex-shrink-0 bg-navy">
                <img src="/Klaahublobo.jpeg" alt="KlaaHub Logo" className="w-full h-full object-cover" />
              </div>
              <span className="logo-text tracking-wide group-hover:scale-105 transition-transform duration-300 flex items-center pt-1">
                KlaaHub
              </span>
            </Link>


            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-cyan-neon bg-cyan-neon/10 border border-cyan-neon/20 shadow-neon-sm'
                      : 'text-slate-300 hover:text-cyan-neon hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full text-slate-400 hover:text-cyan-neon hover:bg-white/5 transition-all border border-transparent hover:border-cyan-neon/20"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 rounded-full text-slate-400 hover:text-cyan-neon hover:bg-white/5 transition-all border border-transparent hover:border-cyan-neon/20">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-neon text-navy text-xs font-bold rounded-full flex items-center justify-center animate-pulse-neon shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-cyan-neon/20 hover:border-cyan-neon/50 bg-white/5 hover:bg-white/10 transition-all shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden shadow-inner">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-navy">{user.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-slate-200 max-w-24 truncate pl-1">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform mr-1 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-52 glass-card py-2 shadow-card overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          <span className="tag-pill text-xs mt-2 inline-block capitalize">{user.role}</span>
                        </div>
                        <Link to={getDashboardPath()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-cyan-neon hover:bg-white/5 transition-all">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to={getWishlistPath()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-cyan-neon hover:bg-white/5 transition-all">
                          <Heart className="w-4 h-4" /> Wishlist
                        </Link>
                        <Link to={getOrdersPath()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-cyan-neon hover:bg-white/5 transition-all">
                          <Package className="w-4 h-4" /> Orders
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-cyan-neon hover:bg-white/5 transition-all">
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                        <div className="border-t border-white/5 mt-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-300 hover:text-cyan-neon hover:bg-white/5 transition-all border border-transparent hover:border-cyan-neon/20">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2.5 px-6 shadow-md">
                    Join Free
                  </Link>
                </div>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-full text-slate-400 hover:text-cyan-neon hover:bg-white/5 transition-all border border-transparent hover:border-cyan-neon/20"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden nav-glass border-t border-cyan-neon/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-3 rounded-full text-sm font-medium text-slate-300 hover:text-cyan-neon hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <div className="pt-4 pb-2 flex flex-col gap-3 px-2">
                    <Link to="/login" className="btn-outline text-center text-sm py-3">Login</Link>
                    <Link to="/register" className="btn-primary text-center text-sm py-3">Join Free</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/80 backdrop-blur-md flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="w-full max-w-2xl"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="search-pill-container p-2 flex items-center gap-3">
                <Search className="w-5 h-5 text-cyan-neon ml-4 flex-shrink-0 animate-pulse" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search artworks, artists, categories..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-base sm:text-lg py-2"
                  autoFocus
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2.5 rounded-full hover:bg-white/10 transition-all mr-1 border border-transparent hover:border-cyan-neon/30">
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </form>
              <p className="text-center text-slate-400 text-xs sm:text-sm mt-4 font-light tracking-wide">Press Enter to search · Esc to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
