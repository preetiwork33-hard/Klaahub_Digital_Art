import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { artworkAPI } from '../services/api';
import { useState } from 'react';
import toast from 'react-hot-toast';


export default function ArtworkCard({ artwork, index = 0 }) {
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(artwork.isLiked || false);
  const [likes, setLikes] = useState(artwork.likesCount ?? artwork.likes?.length ?? 0);
  const [imgError, setImgError] = useState(false);

  const imageUrl = (!imgError && artwork.imageUrl) || '/default-art.png';

  const handleLike = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) { toast.error('Please login to like artworks'); return; }
    try {
      const res = await artworkAPI.like(artwork._id);
      setLiked(res.data.liked);
      setLikes(res.data.likesCount);
    } catch { toast.error('Action failed'); }
  };

  const handleCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) { toast.error('Please login to add to cart'); return; }
    addToCart(artwork);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast.error('Please login to purchase artworks');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (user.role === 'artist') {
      toast.error('Artists cannot purchase artworks');
      return;
    }
    navigate(`/checkout?artworkId=${artwork._id}`);
  };

  const inCart = isInCart(artwork._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -8 }}
      className="art-card group cursor-pointer"
      onClick={() => navigate(`/artwork/${artwork._id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={imageUrl}
          alt={artwork.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="art-card-overlay" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {artwork.isFeatured && (
            <span className="tag-pill text-xs">✦ Featured</span>
          )}
          {artwork.isTrending && (
            <span className="bg-orange-500/20 border border-orange-400/30 text-orange-400 text-xs rounded-full px-2 py-0.5">🔥 Trending</span>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-sm bg-black/30 border border-white/10 hover:border-red-400/40 transition-all group/like"
        >
          <Heart
            className={`w-4 h-4 transition-all ${liked ? 'fill-red-400 text-red-400 scale-110' : 'text-white group-hover/like:text-red-400'}`}
          />
        </button>

        {/* Quick view on hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="flex gap-2">
            <button
              onClick={handleCart}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${inCart
                  ? 'bg-cyan-neon/20 border border-cyan-neon/50 text-cyan-neon'
                  : 'bg-cyan-neon text-navy hover:bg-cyan-glow'
                }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {inCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <button className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all">
              <Eye className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-base line-clamp-1 group-hover:text-cyan-neon transition-colors mb-1">
          {artwork.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
            {artwork.artist?.avatar ? (
              <img src={artwork.artist.avatar} alt={artwork.artist?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-navy">{artwork.artist?.name?.[0] || 'A'}</span>
            )}
          </div>
          <span className="text-slate-400 text-sm truncate">{artwork.artist?.name || 'Unknown Artist'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-cyan-neon font-bold text-lg">₹{artwork.price?.toLocaleString()}</span>
            <span className="text-slate-500 text-xs ml-1">/ license</span>
          </div>
          <div className="flex items-center gap-1.5">
            {artwork.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-slate-400 text-xs">{artwork.rating?.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-slate-500" />
              <span className="text-slate-500 text-xs">{likes}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleBuyNow}
          className="w-full mt-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest text-navy bg-cyan-neon hover:bg-cyan-glow transition-all duration-300 shadow-md hover:shadow-cyan-glow flex items-center justify-center gap-1.5 border border-cyan-neon/30"
        >
          <CreditCard className="w-3.5 h-3.5" /> Buy Now
        </button>
      </div>
    </motion.div>
  );
}
