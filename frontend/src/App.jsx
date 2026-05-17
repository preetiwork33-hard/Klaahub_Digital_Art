import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import SellArtPage from './pages/SellArtPage';
import ArtistDashboard from './pages/ArtistDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CheckoutPage from './pages/CheckoutPage';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

function AnimatedRoutes() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isDashboardPage = location.pathname.startsWith('/dashboard');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
          <Route path="/artists" element={<ArtistsListPage />} />
          <Route path="/artists/:id" element={<ArtistProfilePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute roles={['buyer']}><CheckoutPage /></ProtectedRoute>
          } />

          <Route path="/login" element={
            <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
          } />

          <Route path="/sell" element={
            <ProtectedRoute roles={['artist', 'admin']}><SellArtPage /></ProtectedRoute>
          } />
          <Route path="/dashboard/artist" element={
            <ProtectedRoute roles={['artist']}><ArtistDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/buyer" element={
            <ProtectedRoute roles={['buyer']}><BuyerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// Inline mini-pages to avoid extra files
function ArtistsListPage() {
  return (
    <div className="min-h-screen pt-20 px-6 pb-16 max-w-screen-xl mx-auto">
      <div className="mb-10">
        <p className="text-cyan-neon text-sm font-semibold tracking-widest uppercase mb-2">✦ Creators</p>
        <h1 className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit' }}>Featured Artists</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { _id: 'a1', name: 'Aria Nova', specialty: 'Cyberpunk Art', artworkCount: 28, followers: 4200 },
          { _id: 'a2', name: 'Rex Void', specialty: '3D Concept Art', artworkCount: 15, followers: 3100 },
          { _id: 'a3', name: 'Luna Kai', specialty: 'Abstract Digital', artworkCount: 42, followers: 7800 },
          { _id: 'a4', name: 'Zara Flux', specialty: 'Fantasy Art', artworkCount: 19, followers: 2900 },
          { _id: 'a5', name: 'Max Echo', specialty: 'Illustrations', artworkCount: 31, followers: 5100 },
          { _id: 'a6', name: 'Vera Prism', specialty: 'Anime Art', artworkCount: 24, followers: 6300 },
          { _id: 'a7', name: 'Nox Digital', specialty: 'Paintings', artworkCount: 17, followers: 1900 },
          { _id: 'a8', name: 'Solar Ink', specialty: 'Concept Art', artworkCount: 38, followers: 4800 },
        ].map((artist, i) => (
          <motion.div
            key={artist._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card glass-card-hover p-6 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-black text-navy mx-auto mb-4" style={{ fontFamily: 'Outfit' }}>
              {artist.name[0]}
            </div>
            <h3 className="font-bold text-white text-lg mb-1">{artist.name}</h3>
            <p className="text-cyan-neon text-sm mb-3">{artist.specialty}</p>
            <div className="flex justify-center gap-4 text-sm text-slate-400 mb-4">
              <span><strong className="text-white">{artist.artworkCount}</strong> works</span>
              <span><strong className="text-white">{(artist.followers / 1000).toFixed(1)}K</strong> followers</span>
            </div>
            <a href={`/artists/${artist._id}`} className="btn-outline w-full text-sm py-2 block text-center">View Profile</a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CategoriesPage() {
  const cats = [
    { name: 'Fantasy Art', icon: '🧙', count: 1240, color: 'from-purple-500 to-pink-500' },
    { name: 'Cyberpunk', icon: '⚡', count: 856, color: 'from-cyan-500 to-blue-500' },
    { name: 'Abstract', icon: '🎨', count: 2103, color: 'from-orange-500 to-red-500' },
    { name: '3D Art', icon: '💎', count: 678, color: 'from-emerald-500 to-teal-500' },
    { name: 'Anime', icon: '🌸', count: 1567, color: 'from-pink-500 to-rose-500' },
    { name: 'Paintings', icon: '🖌️', count: 934, color: 'from-amber-500 to-orange-500' },
    { name: 'Concept Art', icon: '🚀', count: 421, color: 'from-blue-500 to-indigo-500' },
    { name: 'Illustrations', icon: '✏️', count: 1882, color: 'from-violet-500 to-purple-500' },
  ];
  return (
    <div className="min-h-screen pt-20 px-6 pb-16 max-w-screen-xl mx-auto">
      <div className="mb-10">
        <p className="text-cyan-neon text-sm font-semibold tracking-widest uppercase mb-2">✦ Browse</p>
        <h1 className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit' }}>All Categories</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {cats.map((cat, i) => (
          <motion.a
            key={cat.name}
            href={`/explore?category=${encodeURIComponent(cat.name)}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.04, y: -4 }}
            className="glass-card p-6 text-center group hover:border-cyan-neon/40 transition-all"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg`}>
              {cat.icon}
            </div>
            <p className="font-bold text-white group-hover:text-cyan-neon transition-colors text-lg">{cat.name}</p>
            <p className="text-slate-500 text-sm mt-1">{cat.count.toLocaleString()} works</p>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-9xl font-black neon-text mb-4" style={{ fontFamily: 'Outfit' }}>404</div>
        <h2 className="text-3xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 22, 64, 0.95)',
                color: '#e2e8f0',
                border: '1px solid rgba(0, 212, 255, 0.25)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#00d4ff', secondary: '#0a0f2c' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
