import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Ticket, DollarSign, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMetrics();
  }, []);

  if (!metrics) return <div className="text-white p-8 text-center">Cargando métricas...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-8">Dashboard General</h2>
      
      <div className="grid gap-6 md:grid-cols-4 whitespace-nowrap">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="text-sm font-medium text-slate-400 mb-2">Ingresos (Pagado)</div>
          <div className="text-3xl font-bold text-emerald-400">${metrics.totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="text-sm font-medium text-slate-400 mb-2">Boletos Vendidos</div>
          <div className="text-3xl font-bold text-white">{metrics.totalTicketsSold}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="text-sm font-medium text-slate-400 mb-2">Rifas Activas</div>
          <div className="text-3xl font-bold text-blue-400">{metrics.activeRaffles} <span className="text-xs text-slate-500">/ {metrics.totalRaffles}</span></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="text-sm font-medium text-slate-400 mb-2">Total Reservas</div>
          <div className="text-3xl font-bold text-purple-400">{metrics.salesByStatus.reduce((acc: number, cur: any) => acc + cur.value, 0)}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-slate-400"/>
            Estado de las Reservas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.salesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.salesByStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '0.5rem' }} 
                  itemStyle={{ color: '#f8fafc' }} 
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-slate-400"/>
            Reservas Recientes
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {metrics.recentReservations.length === 0 ? (
                <p className="text-slate-500 text-sm">No hay reservas recientes.</p>
              ) : (
                metrics.recentReservations.map((res: any) => (
                  <div key={res.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div>
                      <div className="font-bold text-sm text-slate-200">{res.purchaserName}</div>
                      <div className="text-xs text-slate-400">Folio: {res.folio} <span className="mx-1">•</span> {new Date(res.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-emerald-400">${res.totalAmount}</div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 mt-1 rounded inline-block border ${
                        res.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        res.status === 'pending' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-red-500/20 text-red-500 border-red-500/30'
                      }`}>
                        {res.status === 'approved' ? 'Aprobado' : res.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
