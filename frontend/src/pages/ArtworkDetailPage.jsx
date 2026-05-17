import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, ShoppingCart, Star, Download, Shield, Share2,
  ZoomIn, ChevronLeft, ChevronRight, Tag, Eye, CheckCircle
} from 'lucide-react';
import { artworkAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ArtworkCard from '../components/ArtworkCard';
import toast from 'react-hot-toast';

const DEMO_ARTWORK = {
  _id: '1',
  title: 'Neon Dreamscape',
  description: 'A breathtaking journey through a neon-lit dreamscape where reality blurs with the digital. This artwork captures the essence of a futuristic cityscape at midnight, with luminescent blues and electric cyans dancing across an impossibly deep sky.',
  price: 2499,
  likes: 342,
  rating: 4.8,
  totalReviews: 47,
  views: 2841,
  licenseType: 'Commercial',
  category: 'Cyberpunk',
  tags: ['neon', 'cyberpunk', 'digital', 'cityscape', 'futuristic'],
  resolution: '4096 × 4096 px',
  fileFormats: ['PNG', 'JPG', 'PSD'],
  isFeatured: true,
  artist: { _id: 'a1', name: 'Aria Nova', bio: 'Digital artist specializing in cyberpunk and futuristic aesthetics. Based in Mumbai.', followers: 4200, artworkCount: 28, rating: 4.9 },
  imageUrl: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1200&q=90',
  gallery: [
    'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    'https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=800&q=80',
  ],
};

const DEMO_RELATED = [
  { _id: '2', title: 'Cyber Genesis', price: 3199, likes: 218, rating: 4.6, isTrending: true, artist: { name: 'Rex Void' }, imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80' },
  { _id: '3', title: 'Abstract Cosmos', price: 1899, likes: 564, rating: 4.9, artist: { name: 'Luna Kai' }, imageUrl: 'https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=800&q=80' },
  { _id: '4', title: 'Digital Eden', price: 4299, likes: 127, rating: 4.5, isFeatured: true, artist: { name: 'Zara Flux' }, imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80' },
];

export default function ArtworkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [artwork, setArtwork] = useState(DEMO_ARTWORK);
  const [related, setRelated] = useState(DEMO_RELATED);
  const [loading, setLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [tab, setTab] = useState('description');
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const res = await artworkAPI.getOne(id);
        if (res.data?.artwork) setArtwork(res.data.artwork);
      } catch { /* use demo */ }
      finally { setLoading(false); }
    };
    if (id && !id.startsWith('demo')) load();
  }, [id]);

  const handleBuyNow = () => {
    if (!user) { toast.error('Please login to purchase'); navigate('/login'); return; }
    addToCart(artwork);
    navigate('/cart');
  };

  const handleLike = async () => {
    if (!user) { toast.error('Please login to like'); return; }
    setLiked(!liked);
    try { await artworkAPI.like(artwork._id); }
    catch { setLiked(liked); }
  };

  const gallery = artwork.gallery?.length ? artwork.gallery : [artwork.imageUrl];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* ─── Image Viewer ─── */}
          <div>
            <div className="relative rounded-2xl overflow-hidden border border-cyan-neon/20 shadow-card group">
              <img
                src={gallery[activeImg] || artwork.imageUrl}
                alt={artwork.title}
                className="w-full object-cover"
                style={{ maxHeight: '560px' }}
              />
              <button className="absolute top-4 right-4 p-2 glass-card rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                <ZoomIn className="w-5 h-5 text-cyan-neon" />
              </button>
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(p => (p - 1 + gallery.length) % gallery.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 glass-card rounded-xl hover:border-cyan-neon/40 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setActiveImg(p => (p + 1) % gallery.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 glass-card rounded-xl hover:border-cyan-neon/40 transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-3 mt-4">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-cyan-neon shadow-neon-sm' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Info Panel ─── */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="tag-pill">{artwork.category}</span>
                <span className="tag-pill">{artwork.licenseType} License</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit' }}>{artwork.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-semibold">{artwork.rating}</span>
                  <span>({artwork.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /><span>{artwork.views?.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" /><span>{artwork.likes} likes</span>
                </div>
              </div>
            </div>

            {/* Artist */}
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-lg font-black text-navy flex-shrink-0">
                {artwork.artist?.name?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{artwork.artist?.name}</p>
                <p className="text-slate-400 text-sm">{artwork.artist?.artworkCount} artworks · {artwork.artist?.followers?.toLocaleString()} followers</p>
              </div>
              <button
                onClick={() => navigate(`/artists/${artwork.artist?._id}`)}
                className="btn-outline text-xs py-1.5 px-4"
              >
                View Profile
              </button>
            </div>

            {/* Price */}
            <div className="glass-card p-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black neon-text" style={{ fontFamily: 'Outfit' }}>₹{artwork.price?.toLocaleString()}</span>
                <span className="text-slate-400 text-sm">one-time purchase</span>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 mb-5">
                <Shield className="w-4 h-4 text-cyan-neon" />
                Includes {artwork.licenseType} License · Lifetime access
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBuyNow}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
                >
                  <Download className="w-4 h-4" /> Buy Now
                </button>
                <button
                  onClick={() => { if (!user) { toast.error('Login first'); return; } addToCart(artwork); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border font-semibold transition-all ${isInCart(artwork._id)
                      ? 'border-cyan-neon/50 bg-cyan-neon/10 text-cyan-neon'
                      : 'btn-outline'
                    }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isInCart(artwork._id) ? 'In Cart' : 'Add to Cart'}
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all text-sm ${liked ? 'border-red-400/40 text-red-400 bg-red-500/10' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} /> Wishlist
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:border-white/20 transition-all text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            {/* File details */}
            <div className="glass-card p-4">
              <h3 className="text-white font-semibold text-sm mb-3">File Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500">Resolution</p><p className="text-white font-medium">{artwork.resolution || '4096×4096'}</p></div>
                <div><p className="text-slate-500">Formats</p><p className="text-white font-medium">{artwork.fileFormats?.join(', ') || 'PNG, JPG'}</p></div>
                <div><p className="text-slate-500">License</p><p className="text-white font-medium">{artwork.licenseType}</p></div>
                <div><p className="text-slate-500">Downloads</p><p className="text-white font-medium flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Unlimited</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="mb-10">
          <div className="flex gap-1 glass-card p-1 w-fit mb-6">
            {['description', 'reviews', 'license'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-cyan-neon/20 text-cyan-neon border border-cyan-neon/30' : 'text-slate-400 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <p className="text-slate-300 leading-relaxed mb-4">{artwork.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {artwork.tags?.map(tag => (
                  <span key={tag} className="tag-pill">#{tag}</span>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="text-white font-semibold mb-4">Write a Review</h3>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReview(p => ({ ...p, rating: s }))}>
                      <Star className={`w-6 h-6 transition-all ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={review.comment}
                  onChange={e => setReview(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Share your experience please"
                  className="glass-input h-24 resize-none mb-3"
                />
                <button className="btn-primary text-sm py-2 px-5">Submit Review</button>
              </div>
              {[
                { user: 'Priya S.', rating: 5, comment: 'Absolutely stunning. The resolution is incredible, perfect for my design project.' },
                { user: 'Rahul M.', rating: 4, comment: 'Beautiful work. Very unique style, exactly what I was looking for.' },
              ].map((r, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-navy">{r.user[0]}</div>
                    <span className="text-white font-medium text-sm">{r.user}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />)}
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">{r.comment}</p>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'license' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-neon" /> {artwork.licenseType} License
              </h3>
              {[
                { label: 'Personal Use', ok: true },
                { label: 'Commercial Use', ok: artwork.licenseType !== 'Personal' },
                { label: 'Print & Merchandise', ok: artwork.licenseType === 'Extended' },
                { label: 'Social Media', ok: true },
                { label: 'Resale', ok: false },
                { label: 'NFT Minting', ok: false },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <CheckCircle className={`w-5 h-5 ${item.ok ? 'text-green-400' : 'text-red-400 opacity-50'}`} />
                  <span className={`text-sm ${item.ok ? 'text-slate-300' : 'text-slate-500 line-through'}`}>{item.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Related */}
        <div>
          <h2 className="section-title text-2xl mb-6">Related Artworks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((art, i) => <ArtworkCard key={art._id} artwork={art} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
