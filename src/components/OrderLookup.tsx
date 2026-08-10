import React, { useState } from 'react';
import { Search, Key, FileText, ShieldAlert, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Order } from '../types';
import { downloadInvoiceTxt } from '../lib/invoice';

interface OrderLookupProps {
  orders: Order[];
  apkUrl?: string;
  apkAppName?: string;
  apkVersion?: string;
}

export const OrderLookup: React.FC<OrderLookupProps> = ({ 
  orders,
  apkUrl,
  apkAppName = 'NovaEsp Loader',
  apkVersion = 'v2.4.0'
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [foundOrders, setFoundOrders] = useState<Order[] | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      setFoundOrders(null);
      setHasSearched(false);
      return;
    }

    const matches = orders.filter(
      o =>
        o.orderId.toLowerCase().includes(query) ||
        o.paymentId.toLowerCase().includes(query) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(query))
    );

    setFoundOrders(matches);
    setHasSearched(true);
  };

  const toggleKeyVisibility = (orderId: string) => {
    setVisibleKeyIds(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="py-10 max-w-3xl mx-auto px-4">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
          <Search className="w-3.5 h-3.5" /> License Key Recovery
        </span>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Track Your Order</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter your Order Reference ID, Razorpay Payment ID, or Email to retrieve your purchased keys.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="e.g. ORD-123456 or pay_Pxxx or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white font-mono text-sm rounded-2xl pl-12 pr-32 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xl"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            Lookup Key
          </button>
        </div>
      </form>

      {/* Search Results */}
      {hasSearched && foundOrders && (
        <div className="space-y-4">
          {foundOrders.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Orders Found</h3>
              <p className="text-xs">Double check your Order Reference or Payment ID and try searching again.</p>
            </div>
          ) : (
            foundOrders.map((ord) => {
              const keyId = ord.id || ord.orderId;
              const isKeyShown = visibleKeyIds[keyId] ?? true;
              return (
                <div
                  key={keyId}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                      <span className="text-base font-bold font-mono text-white">{ord.orderId}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                      <span className="text-xs text-slate-300">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Product:</span>
                      <div className="text-white font-semibold">{ord.productName}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <div className="text-white font-semibold">{ord.durationName}</div>
                    </div>
                  </div>

                  {/* License Key Display */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <Key className="w-3 h-3 text-emerald-400" /> License Key
                      </div>
                      <code className={`font-mono text-sm font-bold text-emerald-400 whitespace-nowrap overflow-hidden text-ellipsis block transition-all duration-300 ${
                        isKeyShown ? 'select-all' : 'blur-md select-none pointer-events-none opacity-60'
                      }`}>
                        {ord.licenseKey}
                      </code>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleKeyVisibility(keyId)}
                        className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                        title="Toggle Key"
                      >
                        {isKeyShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => copyKey(ord.licenseKey, keyId)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 flex items-center gap-1"
                      >
                        {copiedKeyId === keyId ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* APK Download Button inside order card if configured */}
                  {apkUrl && (
                    <div className="p-3.5 rounded-xl bg-teal-950/50 border border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                          <svg className="w-4.5 h-4.5 fill-current text-teal-400" viewBox="0 0 24 24">
                            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997 0-.5511.4482-.9993.9993-.9993.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997 0-.5511.4482-.9993.9993-.9993.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997zm11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1523-.5676.416.416 0 00-.5676.1523l-2.0223 3.503c-1.4801-.6761-3.1491-1.0573-4.9366-1.0573-1.7875 0-3.4565.3812-4.9366 1.0573l-2.0223-3.503a.4158.4158 0 00-.5676-.1523.416.416 0 00-.1523.5676l1.9973 3.4592c-3.3278 1.8385-5.5901 5.1636-5.8344 9.0435h22.0688c-.2443-3.8799-2.5066-7.205-5.8344-9.0435z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">{apkAppName}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 whitespace-nowrap">
                              {apkVersion}
                            </span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={apkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                        <span>Download APK</span>
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">
                      Paid: <strong className="text-emerald-400 font-mono">₹{ord.finalAmount}</strong>
                    </span>

                    <button
                      onClick={() => downloadInvoiceTxt(ord)}
                      className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" /> Download Invoice
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
