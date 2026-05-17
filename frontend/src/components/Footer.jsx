import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-neon/10 bg-navy py-12 px-6">
      {/* Glow top line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-cyan-neon to-transparent opacity-60" />

      <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center gap-6 text-center">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-neon-sm transition-all duration-300 group-hover:shadow-neon border border-cyan-neon/40 flex-shrink-0 bg-navy">
            <img src="/Klaahublobo.jpeg" alt="KlaaHub Logo" className="w-full h-full object-cover" />
          </div>
          <span className="logo-text tracking-wide group-hover:scale-105 transition-transform duration-300 flex items-center pt-1">
            KlaaHub
          </span>
        </Link>

        {/* Simple copyright text */}
        <p className="text-slate-400 text-sm font-light tracking-wide">
          © 2026 KlaaHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
