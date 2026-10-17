import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Detectar si ya está ejecutándose como aplicación instalada (standalone)
    const standaloneCheck = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standaloneCheck);

    // Detectar si es iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Escuchar evento estándar de instalación PWA en Chrome / Edge / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Si ya está instalada, no mostrar banner de instalación
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback para navegadores móviles donde no disparó antes el evento
      alert('Para instalar la aplicación, pulsa en el menú de opciones de tu navegador (⋮) y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".');
    }
  };

  return (
    <>
      {/* Banner flotante discreto en smartphone */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-bounce-subtle">
          <div className="bg-gradient-to-r from-[#072431] via-[#009ca6] to-[#072431] p-[1.5px] rounded-2xl shadow-2xl">
            <div className="bg-[#072431] px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#009ca6]/20 border border-[#009ca6]/40 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-[#009ca6]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight text-white">Instalar App</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">PWA</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Acceso directo offline en tu pantalla de inicio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="bg-[#009ca6] hover:bg-[#008992] active:scale-95 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBanner(false)}
                  className="p-1.5 text-slate-400 hover:text-white transition rounded-lg"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal interactivo de instrucciones para iPhone / iPad (iOS Safari) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#072431] border border-white/15 w-full max-w-sm rounded-3xl p-6 text-white space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#009ca6]/20 border border-[#009ca6]/40 flex items-center justify-center shrink-0">
                <img src="/images/xiaomi_logo.png" alt="App" className="w-8 h-8 rounded-lg object-cover" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Instalar en tu iPhone</h3>
                <p className="text-xs text-slate-300">Brand Spaces Audit PWA</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-black/25 p-4 rounded-2xl border border-white/5">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#009ca6] text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-slate-200">
                    Pulsa el botón <span className="font-bold text-white inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded"><Share className="w-3.5 h-3.5 text-[#009ca6]" /> Compartir</span> en la barra inferior de Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#009ca6] text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-slate-200">
                    Desliza hacia abajo y pulsa en <span className="font-bold text-white inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded"><PlusSquare className="w-3.5 h-3.5 text-[#009ca6]" /> Añadir a pantalla de inicio</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#009ca6] text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">3</span>
                <div>
                  <p className="font-semibold text-slate-200">
                    Pulsa <span className="font-black text-emerald-400">Añadir</span> en la esquina superior derecha.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-[#009ca6] hover:bg-[#008992] text-white font-black py-3 rounded-2xl text-xs sm:text-sm cursor-pointer shadow-lg transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
