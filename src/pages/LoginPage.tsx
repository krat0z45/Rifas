import { Navigate, useNavigate } from 'react-router-dom';
import { api, setToken } from '@/lib/api';
import React, { useEffect, useState } from 'react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { token } = await api.login({ email, password });
        setToken(token);
        window.location.href = '/admin';
      } else {
        const { token } = await api.register({ email, password });
        setToken(token);
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans p-4">
      <div className="mx-auto max-w-sm w-full space-y-8 text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl shadow-black/20 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 w-full space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-black italic bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">AdminLogin</h1>
            <p className="text-slate-400 text-sm mt-2">{isLogin ? 'Ingresa tus credenciales para continuar.' : 'Crea tu cuenta de administrador.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200"
              />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200"
              />
            </div>

            {error && <p className="text-red-400 text-xs text-left">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrar Admin')}
            </button>
          </form>

          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
