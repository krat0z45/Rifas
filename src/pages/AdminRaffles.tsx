import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Raffle {
  id: string;
  title: string;
  description: string;
  instructions: string;
  prizeImageUrl: string;
  images: string; // JSON array of base64
  totalTickets: number;
  ticketPrice: number;
  status: 'active' | 'paused' | 'completed';
}

export default function AdminRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchRaffles = async () => {
    try {
      const data = await api.getRaffles();
      setRaffles(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await api.createRaffle({
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        prizeImageUrl: data.prizeImageUrl,
        totalTickets: parseInt(data.totalTickets),
        ticketPrice: parseFloat(data.ticketPrice),
        status: 'active'
      });
      reset();
      setIsDialogOpen(false);
      fetchRaffles();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = async (raffle: Raffle) => {
    try {
      const newStatus = raffle.status === 'active' ? 'paused' : 'active';
      await api.updateRaffle(raffle.id, { status: newStatus });
      fetchRaffles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Rifas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg shadow-emerald-900/20 transition-all">
              <Plus className="w-5 h-5 mr-2" /> Nueva Rifa
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-slate-900 text-slate-200 border-slate-800 font-sans">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Crear Nueva Rifa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-400">Título de la Rifa</Label>
                <input required {...register("title")} placeholder="Ej. Automóvil 2026" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Descripción</Label>
                <textarea required rows={3} {...register("description")} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Instrucciones de Pago</Label>
                <textarea required rows={4} {...register("instructions")} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">URL Imagen del Premio</Label>
                <input required {...register("prizeImageUrl")} type="url" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-400">Total de Boletos</Label>
                  <input required type="number" {...register("totalTickets")} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Precio x Boleto ($)</Label>
                  <input required type="number" step="0.01" {...register("ticketPrice")} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">
                Publicar Rifa
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {raffles.map(raffle => (
          <div key={raffle.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20 flex flex-col">
            <div className="h-48 w-full bg-slate-800 relative">
              <img src={raffle.prizeImageUrl} alt={raffle.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${raffle.status === 'active' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                {raffle.status === 'active' ? 'Activa' : 'Pausada'}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-black italic text-xl text-white mb-2">{raffle.title}</h3>
              <p className="text-sm text-slate-400 mb-6 line-clamp-2">{raffle.description}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center py-4 border-y border-slate-800 mb-4">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Boletos</span>
                    <span className="font-bold text-slate-300">{raffle.totalTickets}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Precio</span>
                    <span className="font-bold text-emerald-400">${raffle.ticketPrice.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleStatus(raffle)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                    raffle.status === 'active' 
                      ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600' 
                      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/30'
                  }`}
                >
                  {raffle.status === 'active' ? 'Pausar Venta' : 'Activar Venta'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
