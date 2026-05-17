import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Package, Heart, Grid3x3, Share2, Globe, MapPin } from 'lucide-react';
import ArtworkCard from '../components/ArtworkCard';
import { artistAPI, artworkAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DEMO_ARTIST = {
  _id: 'a1',
  name: 'Aria Nova',
  bio: 'Add somthing about your Art style ',
  specialty: 'Cyberpunk Art',
  location: 'Mumbai, India',
  followers: 4200,
  artworkCount: 28,
  totalSales: 142,
  rating: 4.9,
  joinedDate: '2024-01',
  socials: { twitter: '#', instagram: '#' },
  isVerified: true,
  avatar: null,
};

const DEMO_ARTWORKS = [
  { _id: '1', title: 'Neon Dreamscape', price: 2499, likes: 342, rating: 4.8, isFeatured: true, artist: { name: 'Aria Nova' }, imageUrl: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800&q=80' },
  { _id: '2', title: 'Cyber Genesis', price: 3199, likes: 218, rating: 4.6, artist: { name: 'Aria Nova' }, imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80' },
  { _id: '3', title: 'Abstract Cosmos', price: 1899, likes: 564, rating: 4.9, artist: { name: 'Aria Nova' }, imageUrl: 'https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=800&q=80' },
  { _id: '4', title: 'Digital Eden', price: 4299, likes: 127, rating: 4.5, artist: { name: 'Aria Nova' }, imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80' },
];

export default function ArtistProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [artist, setArtist] = useState(DEMO_ARTIST);
  const [artworks, setArtworks] = useState(DEMO_ARTWORKS);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [artistRes, artRes] = await Promise.all([
          artistAPI.getOne(id),
          artworkAPI.getByArtist(id),
        ]);
        if (artistRes.data?.artist) setArtist(artistRes.data.artist);
        if (artRes.data?.artworks?.length) setArtworks(artRes.data.artworks);
      } catch { /* use demo */ }
      finally { setLoading(false); }
    };
    if (id) load();
  }, [id]);

  const handleFollow = async () => {
    if (!user) { toast.error('Please login to follow artists'); return; }
    setFollowing(!following);
    try { await artistAPI.follow(id); }
    catch { setFollowing(following); }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Banner */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-navy to-cyan-900 opacity-60" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="orb w-64 h-64 bg-cyan-neon top-0 -left-20 opacity-20" />
        <div className="orb w-48 h-48 bg-blue-electric bottom-0 right-20 opacity-15" />
      </div>

      <div className="max-w-screen-xl mx-auto px-6">
        {/* Profile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16 mb-8">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-4xl font-black text-navy border-4 border-navy flex-shrink-0 shadow-neon-sm" style={{ fontFamily: 'Outfit' }}>
            {artist.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{artist.name}</h1>
              {artist.isVerified && (
                <span className="w-6 h-6 rounded-full bg-cyan-neon flex items-center justify-center">
                  <span className="text-navy text-xs font-bold">✓</span>
                </span>
              )}
            </div>
            <p className="text-cyan-neon text-sm font-semibold mb-1">{artist.specialty}</p>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              {artist.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{artist.location}</span>
              )}
              <span>Joined {artist.joinedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {artist.socials?.twitter && (
              <a href={artist.socials.twitter} className="p-2 glass-card rounded-xl text-slate-400 hover:text-cyan-neon transition-all"><Share2 className="w-4 h-4" /></a>
            )}
            {artist.socials?.instagram && (
              <a href={artist.socials.instagram} className="p-2 glass-card rounded-xl text-slate-400 hover:text-cyan-neon transition-all"><Globe className="w-4 h-4" /></a>
            )}

            <button
              onClick={handleFollow}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${following ? 'bg-cyan-neon/15 border border-cyan-neon/50 text-cyan-neon' : 'btn-primary'
                }`}
            >
              <Heart className={`w-4 h-4 ${following ? 'fill-cyan-neon' : ''}`} />
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Artworks', value: artist.artworkCount, icon: Grid3x3 },
            { label: 'Followers', value: artist.followers?.toLocaleString(), icon: Users },
            { label: 'Total Sales', value: artist.totalSales, icon: Package },
            { label: 'Avg Rating', value: artist.rating?.toFixed(1), icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="stat-card text-center">
              <Icon className="w-5 h-5 text-cyan-neon mx-auto mb-2" />
              <p className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="glass-card p-6 mb-10">
          <h3 className="text-white font-semibold mb-3">About the Artist</h3>
          <p className="text-slate-300 leading-relaxed">{artist.bio}</p>
        </div>

        {/* Artworks */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>
            Artworks <span className="text-slate-500 text-lg font-normal">({artworks.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {artworks.map((art, i) => <ArtworkCard key={art._id} artwork={art} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
