import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Package, Grid3x3, Globe, MapPin, Share2 } from 'lucide-react';
import ArtworkCard from '../components/ArtworkCard';
import { artistAPI, artworkAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ArtistProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
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
      } catch (err) { 
        toast.error("Failed to load profile"); 
      }
      finally { setLoading(false); }
    };
    if (id) load();
  }, [id]);


  if (!artist) {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-slate-400">Artist not found.</div>;
  }

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
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Artworks', value: artworks.length, icon: Grid3x3 },
            { label: 'Total Sales', value: artworks.reduce((s, a) => s + (a.sales || 0), 0), icon: Package },
            { label: 'Avg Rating', value: (artworks.length ? (artworks.reduce((s, a) => s + (a.rating || 0), 0) / artworks.length).toFixed(1) : '—'), icon: Star },
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
