import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Smartphone, 
  FileText,
  Key,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { downloadInvoiceTxt } from '../lib/invoice';

interface SuccessPageProps {
  order: Order;
  apkUrl?: string;
  apkAppName?: string;
  apkVersion?: string;
  onReturnHome: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  order,
  apkUrl,
  apkAppName = 'NovaEsp Android VIP Loader',
  apkVersion = 'v2.4.0',
  onReturnHome
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(true);

  // Fire celebratory confetti on mount!
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b']
      });
    } catch (e) {
      console.warn('Confetti effect optional error:', e);
    }
  }, []);

  const handleCopyKey = () => {
    if (!order.licenseKey) return;
    navigator.clipboard.writeText(order.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-10 sm:py-16 max-w-2xl mx-auto px-4">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/30 text-center relative overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 transform hover:scale-105 transition-transform">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest mb-2">
          Payment Confirmed
        </span>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          License Key Issued!
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          Thank you for your purchase. Your digital license key is ready below.
        </p>

        {/* License Key Box */}
        <div className="my-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 relative group">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Key className="w-3.5 h-3.5" /> License Key
            </span>
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 transition-colors"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showKey ? 'Hide' : 'Reveal'}
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
            <code className="font-mono text-base sm:text-lg font-bold text-emerald-400 tracking-wide select-all">
              {showKey ? order.licenseKey : '••••••••-••••••••-••••••••'}
            </code>

            <button
              onClick={handleCopyKey}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 text-left text-xs space-y-2.5 mb-8">
          <div className="flex justify-between border-b border-slate-800/60 pb-2">
            <span className="text-slate-400">Order Reference:</span>
            <span className="text-white font-mono font-bold">{order.orderId}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/60 pb-2">
            <span className="text-slate-400">Payment ID:</span>
            <span className="text-slate-300 font-mono">{order.paymentId}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/60 pb-2">
            <span className="text-slate-400">Product:</span>
            <span className="text-white font-semibold">{order.productName}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/60 pb-2">
            <span className="text-slate-400">Duration:</span>
            <span className="text-white font-semibold">{order.durationName}</span>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-slate-400">Amount Paid:</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">₹{order.finalAmount}</span>
          </div>
        </div>

        {/* APK Download Banner (If URL is configured in settings) */}
        {apkUrl && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-teal-950/80 to-slate-950 border border-teal-500/30 text-left relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{apkAppName}</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {apkVersion}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">Download Android APK Loader to activate key</p>
              </div>
              <a
                href={apkUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download APK</span>
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => downloadInvoiceTxt(order)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Download Invoice TXT</span>
          </button>

          <button
            onClick={onReturnHome}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Buy Another Key</span>
          </button>
        </div>

      </div>
    </div>
  );
};
