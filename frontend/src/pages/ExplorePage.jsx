import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, Grid3x3, List } from 'lucide-react';
import ArtworkCard from '../components/ArtworkCard';
import { artworkAPI } from '../services/api';

const CATEGORIES = ['All', 'Fantasy Art', 'Paintings', 'Concept Art', 'Illustrations', '3D Art', 'Anime', 'Abstract', 'Cyberpunk'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Lowest Price' },
  { value: 'price_desc', label: 'Highest Price' },
];
const LICENSE_TYPES = ['All', 'Personal', 'Commercial', 'Extended'];
const RATINGS = [4, 3, 2, 1];

const DEMO_ARTWORKS = Array.from({ length: 12 }, (_, i) => ({
  _id: `demo-${i}`,
  title: ['Neon Dreamscape', 'Cyber Genesis', 'Abstract Cosmos', 'Digital Eden', 'Quantum Portrait', 'Neon Solitude', 'Void Walker', 'Crystal Mind', 'Solar Punk City', 'Dark Matter', 'Pixel Heaven', 'Echo Chamber'][i],
  price: Math.floor(Math.random() * 4000) + 999,
  likes: Math.floor(Math.random() * 500) + 50,
  rating: (Math.random() * 2 + 3).toFixed(1),
  isFeatured: i % 4 === 0,
  isTrending: i % 3 === 0,
  category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
  artist: { name: ['Aria Nova', 'Rex Void', 'Luna Kai', 'Zara Flux', 'Max Echo', 'Vera Prism'][i % 6] },
  imageUrl: [
    'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    'https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=800&q=80',
    'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80',
    'https://images.unsplash.com/photo-1633177317976-3f9bc45e1d1d?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
    'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    'https://images.unsplash.com/photo-1481889873009-03c2d06f79eb?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=800&q=80',
  ][i],
}));

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artworks, setArtworks] = useState(DEMO_ARTWORKS);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [total, setTotal] = useState(DEMO_ARTWORKS.length);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    sort: 'latest',
    priceMin: '',
    priceMax: '',
    license: 'All',
    rating: '',
  });

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.sort !== 'latest' && { sort: filters.sort }),
        ...(filters.priceMin && { priceMin: filters.priceMin }),
        ...(filters.priceMax && { priceMax: filters.priceMax }),
        ...(filters.license !== 'All' && { license: filters.license }),
        ...(filters.rating && { minRating: filters.rating }),
      };
      const res = await artworkAPI.getAll(params);
      if (res.data?.artworks?.length > 0) {
        setArtworks(res.data.artworks);
        setTotal(res.data.total || res.data.artworks.length);
      } else {
        setArtworks(DEMO_ARTWORKS);
      }
    } catch {
      setArtworks(DEMO_ARTWORKS);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchArtworks(); }, [fetchArtworks]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: 'All', sort: 'latest', priceMin: '', priceMax: '', license: 'All', rating: '' });
    setPage(1);
  };

  const activeFilterCount = [
    filters.category !== 'All',
    filters.priceMin,
    filters.priceMax,
    filters.license !== 'All',
    filters.rating,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>Explore Art</h1>
            <p className="text-slate-400 text-sm mt-1">{total.toLocaleString()} artworks available</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="glass-input w-auto text-sm py-2 pr-8"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-navy text-white">{o.label}</option>)}
            </select>
            {/* Grid/List toggle */}
            <div className="flex glass-card p-1 rounded-lg">
              <button onClick={() => setGridView(true)} className={`p-1.5 rounded ${gridView ? 'bg-cyan-neon/20 text-cyan-neon' : 'text-slate-400'}`}>
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button onClick={() => setGridView(false)} className={`p-1.5 rounded ${!gridView ? 'bg-cyan-neon/20 text-cyan-neon' : 'text-slate-400'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            {/* Filter toggle mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sm:hidden flex items-center gap-2 btn-outline text-sm py-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-cyan-neon text-navy text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8">
        {/* ─── Sidebar Filters ─── */}
        <AnimatePresence>
          {(sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 640) && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-64 flex-shrink-0 hidden sm:block"
            >
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="glass-card p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search artworks..."
                      value={filters.search}
                      onChange={e => updateFilter('search', e.target.value)}
                      className="glass-input pl-9 text-sm"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="glass-card p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Category</h3>
                  <div className="space-y-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateFilter('category', cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          filters.category === cat
                            ? 'bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="glass-card p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Price Range (₹)</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={e => updateFilter('priceMin', e.target.value)}
                      className="glass-input text-sm py-2"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={e => updateFilter('priceMax', e.target.value)}
                      className="glass-input text-sm py-2"
                    />
                  </div>
                </div>

                {/* License */}
                <div className="glass-card p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">License Type</h3>
                  <div className="space-y-1">
                    {LICENSE_TYPES.map(lic => (
                      <button
                        key={lic}
                        onClick={() => updateFilter('license', lic)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          filters.license === lic
                            ? 'bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {lic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="glass-card p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Min Rating</h3>
                  <div className="space-y-1">
                    {RATINGS.map(r => (
                      <button
                        key={r}
                        onClick={() => updateFilter('rating', filters.rating == r ? '' : r)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                          filters.rating == r
                            ? 'bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {'★'.repeat(r)}{'☆'.repeat(5 - r)} & up
                      </button>
                    ))}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="w-full btn-outline text-sm py-2 flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> Clear Filters ({activeFilterCount})
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ─── Main Grid ─── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="glass-card overflow-hidden">
                  <div className="shimmer-bg" style={{ aspectRatio: '4/3' }} />
                  <div className="p-4 space-y-2">
                    <div className="shimmer-bg h-4 rounded w-3/4" />
                    <div className="shimmer-bg h-3 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-white mb-2">No artworks found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your filters</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${gridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {artworks.map((art, i) => (
                  <ArtworkCard key={art._id} artwork={art} index={i} />
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline text-sm py-2 px-5 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-slate-400 text-sm">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={artworks.length < 12}
                  className="btn-outline text-sm py-2 px-5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
