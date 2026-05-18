import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface Reservation {
  id: string;
  raffleId: string;
  folio: string;
  ticketNumbers: number[];
  purchaserName: string;
  phone: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
  totalAmount: number;
  createdAt: string;
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReservations = async () => {
    try {
      const data = await api.getReservations();
      setReservations(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateReservationStatus(id, status);
      fetchReservations();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReservations = reservations.filter(res => 
    res.folio.toLowerCase().includes(searchTerm.toLowerCase()) || 
    res.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    res.phone.includes(searchTerm) || 
    res.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-8">Reservaciones (Boletos)</h2>
      
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Buscar por nombre, folio, ciudad o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200 shadow-inner"
        />
      </div>

      <div className="space-y-4">
        {filteredReservations.map(res => (
          <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-xl font-mono text-blue-400">#{res.folio}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  res.status === 'approved' ? 'bg-emerald-900/30 text-emerald-500 border border-emerald-500/20' : 
                  res.status === 'rejected' ? 'bg-red-900/30 text-red-500 border border-red-500/20' : 
                  'bg-yellow-900/30 text-yellow-500 border border-yellow-500/20'
                }`}>
                  {res.status === 'pending' ? 'Pendiente' : res.status === 'approved' ? 'Aprobado/Pagado' : 'Rechazado'}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                <strong className="text-white">{res.purchaserName}</strong> • <span className="text-slate-400">{res.phone}</span> • <span className="text-slate-400">{res.city}</span>
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 inline-block text-xs text-slate-400 mt-2">
                <span className="mb-1 block">Boletos seleccionados ({res.ticketNumbers.length}):</span>
                <div className="flex flex-wrap gap-1">
                  {res.ticketNumbers.slice(0, 10).map(n => <span key={n} className="bg-blue-900/30 text-blue-300 px-1 border border-blue-800/50 rounded">{n.toString().padStart(3, '0')}</span>)}
                  {res.ticketNumbers.length > 10 && <span className="px-1 text-slate-500">...</span>}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between self-stretch">
              <div className="text-right mb-4">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Monto</span>
                <span className="text-2xl font-bold text-emerald-400">${res.totalAmount.toFixed(2)}</span>
              </div>

              {res.status === 'pending' && (
                <div className="flex space-x-3 mt-auto">
                  <button className="flex items-center px-4 py-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 text-sm font-semibold transition-colors" onClick={() => updateStatus(res.id, 'rejected')}>
                    <X className="w-4 h-4 mr-2" /> Rechazar
                  </button>
                  <button className="flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 text-sm font-semibold transition-colors" onClick={() => updateStatus(res.id, 'approved')}>
                    <Check className="w-4 h-4 mr-2" /> Aprobar Pago
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {reservations.length === 0 && (
          <div className="text-center py-24 text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            No hay reservaciones aún.
          </div>
        )}
      </div>
    </div>
  );
}
