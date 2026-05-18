import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Ticket, ArrowRight, Car, Search, CheckCircle2, Clock, XCircle, Download, CreditCard, Copy, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import html2canvas from 'html2canvas';
import PublicNavbar from '../components/PublicNavbar';

export default function PublicLanding() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ systemName: 'RifasPremium' });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFolio, setSearchFolio] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isBanksOpen, setIsBanksOpen] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [rafflesData, settingsData] = await Promise.all([
          api.getRaffles(),
          api.getSettings()
        ]);
        setRaffles(rafflesData.filter((r: any) => r.status === 'active'));
        if (settingsData) {
          try {
            settingsData.bankAccounts = JSON.parse(settingsData.bankInfo);
            if (!Array.isArray(settingsData.bankAccounts)) settingsData.bankAccounts = [];
          } catch(e) {
            settingsData.bankAccounts = [];
          }
          setSettings(settingsData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInitData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans pt-20">
      <PublicNavbar />
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:py-48 flex flex-col items-center justify-center text-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <Car className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">{settings.systemName || 'RifasPremium'}</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic mb-6 tracking-tight leading-[0.9]">
            TU NUEVO AUTO<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              TE ESPERA
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            Participa en nuestras rifas exclusivas. Compra tus números de la suerte y conviértete en el próximo gran ganador.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#raffles" className="inline-flex w-full sm:w-auto justify-center items-center space-x-2 bg-emerald-600 shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-lg transition-all">
              <Ticket className="w-5 h-5" />
              <span>VER RIFAS DISPONIBLES</span>
            </a>
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex w-full sm:w-auto justify-center items-center space-x-2 bg-slate-900 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              <Search className="w-5 h-5 text-blue-400" />
              <span>BUSCAR MI FOLIO</span>
            </button>

            <button 
              onClick={() => setIsBanksOpen(true)}
              className="inline-flex w-full sm:w-auto justify-center items-center space-x-2 bg-slate-900 border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>MÉTODOS DE PAGO</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Raffles Section */}
      <section id="raffles" className="px-6 py-24 bg-slate-950 relative z-10 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-100">Eventos Activos</h2>
              <p className="text-slate-400">Selecciona la rifa de tu interés y elige tus números.</p>
            </div>
          </div>

          {raffles.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-slate-700/50 rounded-3xl bg-slate-900/50">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-400">Pronto habrán nuevas rifas</h3>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {raffles.map((raffle, idx) => (
                <motion.div 
                  key={raffle.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={`/raffle/${raffle.id}`} className="group block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-colors shadow-xl shadow-black/20">
                    <div className="aspect-[4/3] relative overflow-hidden bg-slate-800">
                      <img 
                        src={raffle.prizeImageUrl} 
                        alt={raffle.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                      <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        En curso
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-2xl font-black italic mb-2 group-hover:text-blue-400 transition-colors">{raffle.title}</h3>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2">{raffle.description}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Precio x Boleto</p>
                          <p className="font-bold text-xl text-emerald-400">${raffle.ticketPrice}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-blue-600 transition-all group-hover:border-blue-500">
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm z-10 relative">
        &copy; {new Date().getFullYear()} {settings.systemName || 'RifasPremium'}. Todos los derechos reservados.
      </footer>

      {/* Folio Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={(open) => {
        setIsSearchOpen(open);
        if(!open) {
          setSearchFolio('');
          setSearchResult(null);
          setSearchError('');
        }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 text-slate-200 border-slate-800 font-sans">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-400" />
              Estado de mi Folio
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="flex space-x-2 mb-6">
              <Input 
                value={searchFolio}
                onChange={e => setSearchFolio(e.target.value.toUpperCase())}
                placeholder="Ej. AB123C"
                className="bg-slate-950 border-slate-700 uppercase"
              />
              <button 
                onClick={async () => {
                  if(!searchFolio.trim()) return;
                  setIsSearching(true);
                  setSearchError('');
                  setSearchResult(null);
                  try {
                    const data = await api.getReservationByFolio(searchFolio.trim());
                    setSearchResult(data);
                    if (data.status === 'approved') {
                      import('canvas-confetti').then(confetti => {
                        confetti.default({
                          particleCount: 150,
                          spread: 100,
                          origin: { y: 0.6 }
                        });
                      });
                    }
                  } catch (e: any) {
                    setSearchError(e.message || 'Folio no encontrado');
                  } finally {
                    setIsSearching(false);
                  }
                }}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold disabled:opacity-50"
              >
                Buscar
              </button>
            </div>

            {searchError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {searchError}
              </div>
            )}

            {searchResult && searchResult.status === 'approved' && (
              <div className="relative p-1 bg-gradient-to-br from-emerald-400 via-blue-500 to-emerald-600 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
                <div ref={ticketRef} className="bg-slate-950 rounded-[22px] p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                  
                  <div className="mb-4">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-2 drop-shadow-lg" />
                    <h3 className="font-black italic text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">¡Pago Confirmado!</h3>
                    <p className="text-slate-400 text-sm mt-1">¡Mucha Suerte, {searchResult.purchaserName}!</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-4 relative z-10 hidden-scrollbar">
                    <h4 className="text-white font-bold mb-3">{searchResult.raffleTitle}</h4>
                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Tus Números de la Suerte</p>
                    <div className="flex flex-wrap justify-center gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1 pb-1">
                      {searchResult.ticketNumbers.map((n: number) => (
                        <span key={n} className="bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-900/50 px-3 py-1.5 rounded-lg text-lg font-mono text-white font-black border border-blue-400">
                          {n.toString().padStart(3, '0')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest bg-slate-900 inline-block px-3 py-1.5 rounded-lg border border-slate-800">
                    Folio Oficial: <span className="text-slate-300 font-bold">{searchResult.folio}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-center pb-2">
                  <button 
                    onClick={async () => {
                      if (ticketRef.current) {
                        const canvas = await html2canvas(ticketRef.current, { backgroundColor: '#020617', scale: 2 });
                        const url = canvas.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.download = `Ticket-Folio-${searchResult.folio}.png`;
                        link.href = url;
                        link.click();
                      }
                    }}
                    className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-6 rounded-xl transition-colors shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span>Descargar o Guardar Ticket</span>
                  </button>
                </div>
              </div>
            )}

            {searchResult && searchResult.status !== 'approved' && (
              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white mb-1">{searchResult.raffleTitle}</h3>
                    <p className="text-xs text-slate-400">{searchResult.purchaserName}</p>
                  </div>
                  {searchResult.status === 'pending' && <Badge icon={<Clock className="w-3 h-3 mr-1"/>} color="blue">Pendiente</Badge>}
                  {searchResult.status === 'rejected' && <Badge icon={<XCircle className="w-3 h-3 mr-1"/>} color="red">Rechazado</Badge>}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs tracking-widest text-slate-500 uppercase mb-2">Tus boletos:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {searchResult.ticketNumbers.map((n: number) => (
                        <span key={n} className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs font-mono">
                          {n.toString().padStart(3, '0')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <span className="text-sm text-slate-400">Total a pagar:</span>
                    <span className="font-bold text-lg text-emerald-400">${searchResult.totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Banks Dialog */}
      <Dialog open={isBanksOpen} onOpenChange={setIsBanksOpen}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-full md:max-w-4xl bg-slate-900 text-slate-200 border-slate-800 font-sans">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center mb-4">
              <CreditCard className="w-6 h-6 mr-3 text-emerald-400" />
              Cuentas Bancarias / Métodos de Pago
            </DialogTitle>
          </DialogHeader>
          
          <div className={`${settings.bankAccounts && settings.bankAccounts.length > 0 ? 'grid md:grid-cols-2 gap-4' : ''} max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar`}>
            {settings.bankAccounts && settings.bankAccounts.length > 0 ? (
              settings.bankAccounts.map((bank: any, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative group overflow-hidden">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shadow-inner">
                          <Building className="w-5 h-5 text-slate-400" />
                        </div>
                        <h4 className="font-extrabold text-lg text-white">{bank.bankName}</h4>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center group/copy hover:border-slate-700 transition-colors">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Número de Cuenta / CLABE</p>
                          <p className="font-mono text-emerald-400 font-bold text-lg tracking-wider">{bank.accountNumber}</p>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(bank.accountNumber);
                            alert('Copiado al portapapeles');
                          }}
                          className="p-2 text-slate-500 hover:text-white bg-slate-950 rounded-md transition-colors"
                          title="Copiar número"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">A nombre de (Beneficiario)</p>
                        <p className="text-slate-300 font-medium">{bank.beneficiary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-500">No hay cuentas bancarias registradas.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ children, color, icon }: any) {
  const c = color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
            color === 'blue' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
            'bg-red-500/20 text-red-400 border-red-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded border text-[10px] uppercase font-bold tracking-wider ${c}`}>
      {icon} {children}
    </span>
  )
}
