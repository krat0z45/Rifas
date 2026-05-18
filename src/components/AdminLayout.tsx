import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { removeToken, api } from '@/lib/api';
import { LayoutDashboard, Ticket, Settings, Users, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [systemName, setSystemName] = useState('RifasPremium');

  useEffect(() => {
    api.getSettings().then(res => {
      if(res && res.systemName) setSystemName(res.systemName);
    }).catch(e => console.error(e));
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Rifas', path: '/admin/raffles', icon: Ticket },
    { name: 'Reservaciones', path: '/admin/reservations', icon: Users },
    { name: 'Configuración', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{systemName}</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Admin Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-2 tracking-wide">
          <div className="text-xs font-semibold text-slate-500 uppercase px-2 mb-4">Gestión</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 bg-slate-950/50 m-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
        </div>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
