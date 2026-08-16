import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  HelpCircle, 
  Mail, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  Store,
  ShieldAlert,
  Send,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  isAdmin: boolean;
  onAdminLogout: () => void;
  telegramUrl?: string;
  telegramSupportUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  isAdmin,
  onAdminLogout,
  telegramUrl = 'https://t.me/KITYGAMEROFFICIAL',
  telegramSupportUrl = 'https://t.me/KITYGAMER'
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const handleNav = (section: string) => {
    onNavigate(section);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!showRulesModal) return;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [showRulesModal]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 group-hover:scale-105 transition-all duration-300 shrink-0">
              <img 
                src="/logo.jpg" 
                alt="NovaEsp Logo" 
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Nova<span className="text-emerald-400">Esp</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Instant Digital License & Key Portal</p>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-slate-950/50 active:scale-95"
            >
              {isMenuOpen ? (
                <>
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4 text-emerald-400" />
                  <span>Menu</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-w-xl mx-auto space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
                Navigation Menu
              </div>

              {/* Store */}
              <button
                onClick={() => handleNav('home')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  currentSection === 'home'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${currentSection === 'home' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'}`}>
                    <Store className="w-4 h-4" />
                  </div>
                  <span>Store</span>
                </div>
                <span className="text-xs text-slate-500">Products & Licenses</span>
              </button>

              {/* Follow Rules */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowRulesModal(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span>Follow Rules</span>
                </div>
                <span className="text-xs text-amber-400/70">Flag Ban Safety</span>
              </button>

              {/* Track Order */}
              <button
                onClick={() => handleNav('lookup')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  currentSection === 'lookup'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${currentSection === 'lookup' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'}`}>
                    <Search className="w-4 h-4" />
                  </div>
                  <span>Track Order</span>
                </div>
                <span className="text-xs text-slate-500">Find Key by Order ID</span>
              </button>

              {/* FAQ */}
              <button
                onClick={() => handleNav('faq')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  currentSection === 'faq'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${currentSection === 'faq' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'}`}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span>FAQ</span>
                </div>
                <span className="text-xs text-slate-500">Frequently Asked Questions</span>
              </button>

              {/* Support */}
              <button
                onClick={() => handleNav('contact')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  currentSection === 'contact'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${currentSection === 'contact' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>Support</span>
                </div>
                <span className="text-xs text-slate-500">Contact & Ticket</span>
              </button>

              {/* Telegram Live Support Link */}
              <a
                href={telegramSupportUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold text-sky-400 hover:bg-sky-500/10 border border-sky-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                    <Send className="w-4 h-4" />
                  </div>
                  <span>Telegram Support</span>
                </div>
                <span className="text-xs text-sky-400/80">t.me/KITYGAMER</span>
              </a>

              {/* Admin Option */}
              <div className="pt-2 border-t border-slate-900">
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNav('admin')}
                      className={`flex-1 flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all ${
                        currentSection === 'admin'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </div>
                      <span className="text-xs opacity-80">Management Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        onAdminLogout();
                        setIsMenuOpen(false);
                      }}
                      title="Logout Admin"
                      className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNav('admin-login')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                      currentSection === 'admin-login'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-900 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span>Admin</span>
                    </div>
                    <span className="text-xs text-slate-500">Login to Control Panel</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {showRulesModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md overscroll-none"
          role="dialog"
          aria-modal="true"
          aria-label="Follow Rules"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="relative flex w-full max-w-lg h-[min(760px,calc(100dvh-24px))] sm:h-[min(760px,calc(100dvh-40px))] flex-col overflow-hidden rounded-3xl bg-slate-900 border border-amber-500/20 shadow-2xl shadow-black/60">
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-7 py-5 border-b border-slate-800/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Follow Rules</h3>
                  <p className="text-[11px] text-slate-400">Flag Ban Safety Notice</p>
                </div>
              </div>
              <button onClick={() => setShowRulesModal(false)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all" aria-label="Close rules">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 text-sm leading-7 text-slate-300">
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5 space-y-3">
                <p className="text-center text-lg font-extrabold text-amber-400">📣 Flag Ban Safety 📣</p>
                <p className="font-extrabold text-white">❗️ IMPORTANT NOTICE – Follow These Rules ❗️</p>
                <p>Guys, please follow these rules strictly 🔺</p>
                <p>🔥 <strong className="text-white">Aimbot is very powerful</strong><br />So don’t misuse it and don’t play like a hacker.</p>
                <p>💀 Don’t play aggressive<br />💀 Don’t kill Rank Pushers<br />💀 Don’t show off</p>
                <p>🎯 <strong className="text-white">Kill Limit: 7–8 only</strong><br />🇺🇸 Play safe<br />📍 Maintain distance<br />📉 Avoid reports at any cost</p>
                <div className="pt-2 border-t border-slate-800">
                  <p className="font-extrabold text-white">Remember:</p>
                  <p>Play smart = <span className="text-emerald-400 font-bold">Safe ID</span></p>
                  <p>Show off = <span className="text-rose-400 font-bold">Flag Ban ❌</span></p>
                </div>
                <p className="text-center font-extrabold text-white pt-2">Stay low. Stay safe</p>
              </div>
            </div>
            <div className="shrink-0 border-t border-slate-800/70 px-5 sm:px-7 py-3">
              <button onClick={() => setShowRulesModal(false)} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all">Done & Close</button>
            </div>
          </div>
        </div>
      , document.body)}
    </header>
  );
};
