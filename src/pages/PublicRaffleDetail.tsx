import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, Ticket, Shuffle, Send, Building, Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import PublicNavbar from '../components/PublicNavbar';

export default function PublicRaffleDetail() {
  const { raffleId } = useParams();
  const [raffle, setRaffle] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [approvedTickets, setApprovedTickets] = useState<Set<number>>(new Set());
  const [pendingTickets, setPendingTickets] = useState<Set<number>>(new Set());
  
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [randomCount, setRandomCount] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', phone: '', city: '' });
  const [purchaseComplete, setPurchaseComplete] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (!raffleId) return;
        const raffleData = await api.getRaffle(raffleId);
        if (raffleData) {
          setRaffle(raffleData);
        }
        
        // Settings could be loaded first
        const globalSettings = await api.getSettings();
        if (globalSettings) {
          try {
            globalSettings.bankAccounts = JSON.parse(globalSettings.bankInfo);
            if (!Array.isArray(globalSettings.bankAccounts)) globalSettings.bankAccounts = [];
          } catch(e) {
            globalSettings.bankAccounts = [];
          }
          setSettings(globalSettings);
        }

        // Can't efficiently query reservations by raffleId without a specific param endpoint 
        // in our simple API, so we fetch all and filter.
          api.getRaffleReservations(raffleId).then((data: any) => {
          const approved = new Set<number>();
          const pending = new Set<number>();
          data.forEach((r: any) => {
            if (r.status === 'approved') {
              r.ticketNumbers.forEach((n: number) => approved.add(n));
            } else if (r.status === 'pending') {
              r.ticketNumbers.forEach((n: number) => pending.add(n));
            }
          });
          setApprovedTickets(approved);
          setPendingTickets(pending);
        }).catch((e: any) => {
          console.error(e);
        });
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [raffleId]);

  const toggleTicket = (num: number) => {
    if (approvedTickets.has(num) || pendingTickets.has(num)) return;
    if (selectedTickets.includes(num)) {
      setSelectedTickets(prev => prev.filter(n => n !== num));
    } else {
      setSelectedTickets(prev => [...prev, num]);
    }
  };

  const [randomizingOverlay, setRandomizingOverlay] = useState<{ active: boolean, currentNumber: string }>({ active: false, currentNumber: '000' });

  const selectRandom = async () => {
    if (!raffle) return;
    let available: number[] = [];
    for (let i = 1; i <= raffle.totalTickets; i++) {
        if (!approvedTickets.has(i) && !pendingTickets.has(i) && !selectedTickets.includes(i)) available.push(i);
    }
    
    // Fisher-Yates shuffle
    for(let i = available.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    
    const count = Math.min(randomCount, available.length);
    const chosen = available.slice(0, count);
    if(chosen.length === 0) {
      alert("No hay suficientes números disponibles.");
      return;
    }

    setRandomizingOverlay({ active: true, currentNumber: available[Math.floor(Math.random() * available.length)].toString().padStart(3, '0') });
    
    for (let i = 0; i < 30; i++) {
       setRandomizingOverlay({ active: true, currentNumber: available[Math.floor(Math.random() * available.length)].toString().padStart(3, '0') });
       await new Promise(r => setTimeout(r, 30 + (i * 2))); // gets slower
    }

    setRandomizingOverlay({ active: false, currentNumber: '000' });
    setSelectedTickets(prev => [...prev, ...chosen]);
    
    import('canvas-confetti').then(confetti => {
      confetti.default({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    });
  };

  const generateFolio = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTickets.length === 0 || !raffleId) return;

    const folio = generateFolio();
    
    try {
      await api.createReservation({
        raffleId,
        folio,
        ticketNumbers: selectedTickets,
        purchaserName: formData.name,
        phone: formData.phone,
        city: formData.city,
        status: 'pending',
        totalAmount: selectedTickets.length * raffle.ticketPrice,
      });
      
      setPurchaseComplete({ folio, totalAmount: selectedTickets.length * raffle.ticketPrice });
      setIsCheckoutOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Virtualized/Paginated or sliced approach for 10k tickets can be complex.
  // We'll limit to rendering what the user scrolls to if needed.
  // For now, let's use a simple CSS Grid with limited initial rendering if totalTickets > 1000.
  // Wait, rendering 10000 small divs is doable but takes a moment. We'll render them.
  const numbersArray = useMemo(() => {
    if (!raffle) return [];
    const arr = [];
    for (let i = 1; i <= raffle.totalTickets; i++) {
      arr.push(i);
    }
    return arr;
  }, [raffle]);

  if (!raffle) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center font-sans">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pt-20">
      <PublicNavbar />
      {randomizingOverlay.active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="text-center animate-pulse">
             <div className="text-blue-400 font-bold uppercase tracking-[0.5em] mb-4 text-sm">Generando Suerte...</div>
             <div className="text-8xl md:text-[12rem] font-black italic text-emerald-400 tabular-nums">
               {randomizingOverlay.currentNumber}
             </div>
          </div>
        </div>
      )}
      
      <header className="border-b border-slate-800 sticky top-20 bg-slate-950/80 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5 mr-2" /> Volver
          </Link>
          <div className="flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">{selectedTickets.length} Seleccionados</span>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Side: Tickets */}
        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-black italic mb-4 text-white">{raffle.title}</h1>
            <p className="text-slate-400">{raffle.description}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Selecciona tus números</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-slate-600 bg-slate-900" /> <span className="text-[10px] text-slate-400">Disponible</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-yellow-500/50" /> <span className="text-[10px] text-slate-400">Apartado</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500/50" /> <span className="text-[10px] text-slate-400">Vendido</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500" /> <span className="text-[10px] text-slate-400">Selección</span></div>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-2">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {numbersArray.map(num => {
                  const isApproved = approvedTickets.has(num);
                  const isPending = pendingTickets.has(num);
                  const isSelected = selectedTickets.includes(num);
                  return (
                    <button
                      key={num}
                      disabled={isApproved || isPending}
                      onClick={() => toggleTicket(num)}
                      className={`
                        aspect-square rounded flex items-center justify-center text-xs font-mono transition-all cursor-pointer select-none
                        ${isApproved ? 'bg-red-500/20 border border-red-500/40 text-red-400 cursor-not-allowed' : 
                          isPending ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 cursor-not-allowed' :
                          isSelected ? 'bg-blue-500 border border-blue-400 text-white font-bold' : 
                         'bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-300'}
                      `}
                    >
                      {num.toString().padStart(3, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-blue-400 font-bold uppercase mb-1">Modo Automático</div>
                <p className="text-[11px] text-slate-400">Genera números al azar.</p>
              </div>
              <div className="flex space-x-2">
                <Input 
                  type="number" 
                  min={1} 
                  max={100}
                  value={randomCount} 
                  onChange={e => setRandomCount(parseInt(e.target.value) || 1)}
                  className="bg-slate-950 border-slate-700 w-20 text-center focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  onClick={selectRandom} 
                  disabled={randomizingOverlay.active}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors flex items-center"
                >
                  <Shuffle className="w-4 h-4 mr-2" /> Azar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Info & Checkout */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden sticky top-24 flex flex-col">
            <header className="h-48 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded uppercase mr-2">En Curso</span>
              </div>
              <div className="absolute right-4 top-4 z-20 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">Costo por número</div>
                <div className="text-xl font-bold text-white">${raffle.ticketPrice.toFixed(2)}</div>
              </div>
              <div className="absolute inset-0 bg-slate-800">
                <img src={raffle.prizeImageUrl} alt="Premio" className="w-full h-full object-cover opacity-60" />
              </div>
            </header>
            
            <div className="p-6 flex flex-col">
              <h4 className="text-sm font-bold text-white mb-4">Resumen de Apartado</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Boletos seleccionados:</span>
                  <span className="text-white font-mono flex flex-wrap gap-1 justify-end max-w-[150px]">
                    {selectedTickets.length === 0 ? <span className="text-slate-500">-</span> : 
                     selectedTickets.length > 5 ? <span className="bg-blue-600 px-1.5 rounded">{selectedTickets.length} boletos</span> :
                     selectedTickets.map(t => <span key={t} className="bg-blue-600 px-1 rounded">{t.toString().padStart(3, '0')}</span>)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Total a pagar:</span>
                  <span className="text-xl font-bold text-emerald-400">${(selectedTickets.length * raffle.ticketPrice).toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={selectedTickets.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
              >
                APARTAR AHORA
              </button>
              
              <p className="mt-4 text-[10px] text-center text-slate-500">
                Al apartar, recibirás un número de folio para confirmar tu boleto con tu pago.
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h5 className="font-semibold text-xs tracking-widest text-slate-400 uppercase mb-2">Instrucciones:</h5>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{raffle.instructions}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 text-slate-200 border-slate-800 font-sans">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Completa tu reservación</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-4 mt-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-400">Total de boletos:</span>
                <span className="font-bold text-blue-400">{selectedTickets.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Monto a pagar:</span>
                <span className="text-emerald-400 font-bold text-lg">${(selectedTickets.length * raffle.ticketPrice).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nombre Completo" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="tel" className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Teléfono" />
                <input required type="text" className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Ciudad" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-900/20 transition-all">
              GENERAR FOLIO
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase Complete Dialog */}
      <Dialog open={!!purchaseComplete} onOpenChange={(open) => !open && setPurchaseComplete(null)}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-full md:max-w-4xl bg-slate-900 text-slate-200 border-slate-800 font-sans text-center px-4 sm:px-8 py-10 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="overflow-y-auto custom-scrollbar pr-2">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-white">¡Boletos Apartados!</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Tu reservación ha sido registrada. Para confirmar tus boletos, realiza el pago y envía el comprobante.</p>
            
            <div className="bg-slate-950 rounded-2xl p-6 mb-6 border border-slate-800">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Folio de Referencia</p>
              <p className="text-4xl font-mono font-bold tracking-widest text-blue-400">{purchaseComplete?.folio}</p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                <span className="text-sm text-slate-400">Total a depositar:</span>
                <span className="text-emerald-400 font-bold text-lg">${purchaseComplete?.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-left mb-8">
              <strong className="block text-white mb-2 uppercase text-xs tracking-wider"><Building className="inline w-4 h-4 mr-1 text-slate-400"/>Cuentas para depósito</strong>
              {settings.bankAccounts && settings.bankAccounts.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                  {settings.bankAccounts.map((bank: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm">
                      <p className="font-bold text-white mb-1">{bank.bankName}</p>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-emerald-400 font-mono tracking-wider font-bold">{bank.accountNumber}</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(bank.accountNumber);
                            alert('Copiado al portapapeles');
                          }}
                          className="text-slate-500 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-400 text-xs">Beneficiario: {bank.beneficiary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-400">
                  Información bancaria no configurada. Contacta al admin.
                </div>
              )}
            </div>

            <button 
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              onClick={() => {
                if(!settings.adminWhatsApp) {
                  alert("WhatsApp de admin no configurado");
                  return;
                }
                const msg = encodeURIComponent(`Hola, acabo de apartar boletos.\nFolio: *${purchaseComplete.folio}*\nTengo mi comprobante de pago.`);
                window.open(`https://wa.me/${settings.adminWhatsApp}?text=${msg}`, '_blank');
              }}
            >
              <Send className="w-5 h-5" />
              <span>Enviar Comprobante por WhatsApp</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
