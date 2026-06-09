import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit3, Trash2, Image as ImageIcon } from 'lucide-react';
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
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [raffleToDelete, setRaffleToDelete] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openEditDialog = (raffle: Raffle) => {
    setEditingRaffle(raffle);
    setValue('title', raffle.title);
    setValue('description', raffle.description);
    setValue('instructions', raffle.instructions);
    setValue('totalTickets', raffle.totalTickets);
    setValue('ticketPrice', raffle.ticketPrice);
    
    let parsedImages: string[] = [];
    if (raffle.images) {
      try {
        parsedImages = JSON.parse(raffle.images);
      } catch(e) {}
    }
    
    if (parsedImages.length > 0) {
      setImagesBase64(parsedImages);
    } else if (raffle.prizeImageUrl) {
      setImagesBase64([raffle.prizeImageUrl]);
    } else {
      setImagesBase64([]);
    }
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingRaffle(null);
    reset({
      title: '', description: '', instructions: '', totalTickets: '', ticketPrice: ''
    });
    setImagesBase64([]);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesBase64(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagesBase64(prev => prev.filter((_, i) => i !== index));
  };

  const deleteRaffle = (id: string) => {
    setRaffleToDelete(id);
  };

  const confirmDelete = async () => {
    if (raffleToDelete) {
      try {
        await api.deleteRaffle(raffleToDelete);
        setRaffleToDelete(null);
        fetchRaffles();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (imagesBase64.length === 0) {
        alert("Por favor sube al menos una imagen.");
        return;
      }
      
      const payload = {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        prizeImageUrl: imagesBase64[0], // Use first as main image for backward compatibility
        images: JSON.stringify(imagesBase64), // Save all images
        totalTickets: parseInt(data.totalTickets),
        ticketPrice: parseFloat(data.ticketPrice),
        status: editingRaffle ? editingRaffle.status : 'active'
      };

      if (editingRaffle) {
        await api.updateRaffle(editingRaffle.id, payload);
      } else {
        await api.createRaffle(payload);
      }
      
      reset();
      setImagesBase64([]);
      setEditingRaffle(null);
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
            <button onClick={openNewDialog} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg shadow-emerald-900/20 transition-all">
              <Plus className="w-5 h-5 mr-2" /> Nueva Rifa
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-slate-900 text-slate-200 border-slate-800 font-sans max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingRaffle ? 'Editar Rifa' : 'Crear Nueva Rifa'}
              </DialogTitle>
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
                <Label className="text-slate-400">Imágenes del Premio</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden" 
                />
                
                {imagesBase64.length === 0 ? (
                  <div 
                    className="w-full h-32 bg-slate-950 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-600 transition-colors relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
                    <span className="text-sm text-slate-500">Seleccionar imágenes</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {imagesBase64.map((img, i) => (
                        <div key={i} className={`relative rounded-lg overflow-hidden border-2 h-24 ${i === 0 ? 'border-emerald-500 shadow-md shadow-emerald-500/20' : 'border-slate-800'}`}>
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          {i === 0 && (
                            <div className="absolute top-0 left-0 right-0 bg-emerald-500/90 text-slate-950 text-[9px] font-bold text-center py-0.5 uppercase tracking-wider backdrop-blur-sm">
                              Principal
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute bg-black/60 hover:bg-black/80 rounded-full right-1 top-1 text-white p-1 backdrop-blur-md"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-slate-600 transition-colors"
                      >
                         <Plus className="w-6 h-6 text-slate-500" />
                      </div>
                    </div>
                  </div>
                )}
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
                {editingRaffle ? 'Guardar Cambios' : 'Publicar Rifa'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!raffleToDelete} onOpenChange={(open) => !open && setRaffleToDelete(null)}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-200 font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">¿Eliminar Rifa?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-400">
            Estás a punto de eliminar esta rifa. Esta acción también eliminará todos los boletos reservados para la misma y no se puede deshacer. ¿Deseas continuar?
          </div>
          <div className="flex gap-4 justify-end mt-4">
            <button onClick={() => setRaffleToDelete(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors">
              Cancelar
            </button>
            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold transition-colors shadow-lg shadow-red-900/20">
              Eliminar Definitivamente
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {raffles.map(raffle => (
          <div key={raffle.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20 flex flex-col group relative">
            
            <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditDialog(raffle)} className="bg-blue-600/90 hover:bg-blue-500 p-2 rounded-lg text-white shadow-lg backdrop-blur-sm transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteRaffle(raffle.id)} className="bg-red-600/90 hover:bg-red-500 p-2 rounded-lg text-white shadow-lg backdrop-blur-sm transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="h-48 w-full bg-slate-800 relative">
              <img src={raffle.prizeImageUrl} alt={raffle.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className={`absolute top-4 left-4 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${raffle.status === 'active' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
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
