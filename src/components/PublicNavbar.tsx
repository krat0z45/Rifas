import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PublicNavbar() {
  const [settings, setSettings] = useState<any>({});
  
  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl italic tracking-tight text-white group-hover:text-blue-400 transition-colors">
            {settings.systemName || 'RifasPremium'}
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Inicio</Link>
          <Link to="/about" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Quiénes Somos</Link>
        </div>
      </div>
    </nav>
  );
}
