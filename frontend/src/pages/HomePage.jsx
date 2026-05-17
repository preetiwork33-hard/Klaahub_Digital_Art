import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Zap, Shield, Award, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'Fantasy Art', icon: '🧙', count: 1240, color: 'from-purple-500 to-pink-500' },
  { name: 'Cyberpunk', icon: '⚡', count: 856, color: 'from-cyan-500 to-blue-500' },
  { name: 'Abstract', icon: '🎨', count: 2103, color: 'from-orange-500 to-red-500' },
  { name: '3D Art', icon: '💎', count: 678, color: 'from-emerald-500 to-teal-500' },
  { name: 'Anime', icon: '🌸', count: 1567, color: 'from-pink-500 to-rose-500' },
  { name: 'Paintings', icon: '🖌️', count: 934, color: 'from-amber-500 to-orange-500' },
  { name: 'Concept Art', icon: '🚀', count: 421, color: 'from-blue-500 to-indigo-500' },
  { name: 'Illustrations', icon: '✏️', count: 1882, color: 'from-violet-500 to-purple-500' },
];

// Animated particle
function Particle({ x, y, size, delay }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: 'rgba(0,212,255,0.3)' }}
      animate={{ y: [-20, 20, -20], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay }}
    />
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 3,
  }));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-navy">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        {/* Background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-blue-accent/30" />
          <div className="orb w-96 h-96 bg-cyan-neon top-20 -left-20" />
          <div className="orb w-80 h-80 bg-blue-electric top-40 right-10" style={{ animationDelay: '2s' }} />
          <div className="orb w-64 h-64 bg-purple-500 bottom-20 left-1/3" style={{ animationDelay: '4s' }} />
          {particles.map((p, i) => <Particle key={i} {...p} />)}
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto w-full"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 sm:mb-8 tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <span className="text-white">Explore & Buy</span>
            <br />
            <span className="gradient-text">Digital Art</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-slate-300 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-10 sm:mb-14 leading-relaxed font-light px-2"
          >
            Discover extraordinary digital artworks from the world's most talented artists.
            Buy, sell, and collect unique pieces with full licensing rights.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            onSubmit={handleSearch}
            className="search-pill-container flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 max-w-2xl mx-auto mb-12 sm:mb-16 w-full shadow-2xl"
          >
            <div className="pl-4 sm:pl-6 flex items-center justify-center">
              <Search className="w-5 h-5 text-cyan-neon flex-shrink-0 animate-pulse" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search artworks, artists, styles..."
              className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm sm:text-base md:text-lg pr-2 py-2 sm:py-3"
            />
            <button type="submit" className="btn-primary rounded-full py-3 sm:py-4 px-7 sm:px-10 text-xs sm:text-sm md:text-base font-bold tracking-wider shadow-lg flex items-center gap-2 flex-shrink-0">
              <span>Search</span>
            </button>
          </motion.form>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto px-4 sm:px-0"
          >
            <Link to="/explore" className="btn-primary w-full sm:w-auto justify-center py-3.5 sm:py-4 px-8 sm:px-10 text-sm sm:text-base shadow-xl">
              Explore Collection <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link to="/register?role=artist" className="btn-outline w-full sm:w-auto justify-center py-3.5 sm:py-4 px-8 sm:px-10 text-sm sm:text-base shadow-xl">
              Become an Artist <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-cyan-neon/30 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-cyan-neon animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-cyan-neon text-sm font-semibold tracking-widest uppercase mb-2">✦ Browse</p>
          <h2 className="section-title">Popular Categories</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <Link
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="glass-card p-5 block text-center group hover:border-cyan-neon/40 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg`}>
                  {cat.icon}
                </div>
                <p className="font-semibold text-white group-hover:text-cyan-neon transition-colors">{cat.name}</p>
                <p className="text-slate-500 text-xs mt-1">{cat.count.toLocaleString()} works</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── WHY KLAAHUB ──────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.03) 0%, rgba(10,15,44,0.8) 100%)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-neon text-sm font-semibold tracking-widest uppercase mb-2">✦ Why Us</p>
            <h2 className="section-title">Why Choose KlaaHub</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure Licensing', desc: 'Every purchase comes with a legally binding license. Your rights as a buyer and artist are fully protected.' },
              { icon: Zap, title: 'Instant Download', desc: 'Purchase and access your artwork immediately. High-resolution files delivered straight to your library.' },
              { icon: Award, title: 'Curated Quality', desc: 'Every artwork is reviewed before listing. Only the highest quality digital art makes it to KlaaHub.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="stat-card group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-neon/20 to-blue-500/10 border border-cyan-neon/20 flex items-center justify-center mb-5 group-hover:border-cyan-neon/50 transition-all">
                  <Icon className="w-7 h-7 text-cyan-neon" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
