import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PublicNavbar from '../components/PublicNavbar';
import { Mail, MapPin, Car, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicAbout() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pt-20 flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <PublicNavbar />
      
      <main className="max-w-4xl mx-auto w-full px-6 py-12 md:py-24 relative z-10 flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center space-x-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <Car className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">{settings.systemName || 'RifasPremium'}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic mb-12 text-white uppercase tracking-tight">
            Quiénes Somos
          </h1>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl mb-12 relative overflow-hidden">
             {/* decorative line inside card */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-400" />
            
            {settings.aboutUs ? (
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {settings.aboutUs}
              </p>
            ) : (
              <p className="text-lg text-slate-500 italic">La información de la empresa aún no ha sido configurada.</p>
            )}
          </div>

          {(settings.address || settings.contactEmail || settings.contactPhone || settings.facebookUrl || settings.instagramUrl) && (
            <div className="grid sm:grid-cols-2 gap-6">
              {(settings.contactEmail || settings.contactPhone || settings.address) && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-6">Contacto Directo</h3>
                  <div className="space-y-6">
                    {settings.contactPhone && (
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Teléfono Directo</p>
                          <a href={`tel:${settings.contactPhone}`} className="text-slate-300 hover:text-white transition-colors block break-all">{settings.contactPhone}</a>
                        </div>
                      </div>
                    )}
                    {settings.contactEmail && (
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Correo Electrónico</p>
                          <a href={`mailto:${settings.contactEmail}`} className="text-slate-300 hover:text-white transition-colors block break-all">{settings.contactEmail}</a>
                        </div>
                      </div>
                    )}
                    {settings.address && (
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Dirección</p>
                          <p className="text-slate-300">{settings.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {(settings.facebookUrl || settings.instagramUrl) && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-white mb-6 text-center sm:text-left">Síguenos en Redes</h3>
                  <div className="flex space-x-4 justify-center sm:justify-start">
                    {settings.facebookUrl && (
                      <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all group scale-100 hover:scale-105 active:scale-95 shadow-lg">
                        <svg className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    {settings.instagramUrl && (
                      <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:border-transparent transition-all group scale-100 hover:scale-105 active:scale-95 shadow-lg">
                        <svg className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
      
      {/* Footer minimalista */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm mt-auto relative z-10 w-full text-center bottom-0">
        &copy; {new Date().getFullYear()} {settings.systemName || 'RifasPremium'}. Todos los derechos reservados.
      </footer>
    </div>
  );
}
