import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Clock, 
  DollarSign, 
  Key, 
  Tag, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  ShieldCheck, 
  ExternalLink,
  LogOut,
  RefreshCw,
  Gift,
  Zap,
  CalendarDays,
  Timer,
  BarChart3,
  Globe2,
  Download
} from 'lucide-react';
import { Product, Duration, Price, LicenseKey, TrialKey, Coupon, Order, Settings, PreBooking, ApkDownloadLink } from '../types';
import { 
  pushData, 
  updateData, 
  deleteData, 
  setData, 
  seedInitialDataIfEmpty,
  deleteTrialKeyFromDb,
  clearTrialKeysFromDb,
  uploadProductLogo,
  uploadWebsiteLogo
} from '../lib/firebase';

interface AdminPortalProps {
  products: Product[];
  durations: Duration[];
  prices: Price[];
  licenseKeys: LicenseKey[];
  trialKeys?: TrialKey[];
  coupons: Coupon[];
  preBookings: PreBooking[];
  orders: Order[];
  settings: Settings;
  isAdminLoggedIn: boolean;
  onAdminLoginSuccess: () => void;
  onAdminLogout: () => void;
}


interface PreBookingManagementProps {
  preBookings: PreBooking[];
  products: Product[];
  durations: Duration[];
  orders: Order[];
  onAdd: () => void;
  onEdit: (item: PreBooking) => void;
  onDelete: (id: string) => void;
  onRelease: (order: Order) => void;
  onDeleteRelease: (order: Order) => void;
  onPermanentDelete: (order: Order) => void;
  onCancel: (order: Order) => void;
}

const PreBookingManagement: React.FC<PreBookingManagementProps> = ({
  preBookings, products, durations, orders, onAdd, onEdit, onDelete, onRelease, onDeleteRelease, onPermanentDelete, onCancel
}) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  const productName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown Product';
  const filteredBookings = preBookings.filter(item => {
    const name = productName(item.productId).toLowerCase();
    const q = search.trim().toLowerCase();
    return (!q || name.includes(q) || item.id.toLowerCase().includes(q)) &&
      (productFilter === 'all' || item.productId === productFilter);
  });
  const bookingOrders = orders.filter(o => !!o.bookingId);
  const counts = {
    total: bookingOrders.length,
    confirmed: bookingOrders.filter(o => (o.bookingStatus || 'confirmed') === 'confirmed').length,
    pending: bookingOrders.filter(o => o.bookingStatus === 'pending').length,
    released: bookingOrders.filter(o => o.bookingStatus === 'released').length,
    cancelled: bookingOrders.filter(o => o.bookingStatus === 'cancelled').length,
    revenue: bookingOrders.reduce((n,o) => n + Number(o.amount || 0), 0)
  };
  const visibleOrders = bookingOrders.filter(o => {
    const st = o.bookingStatus || 'confirmed';
    const q = search.trim().toLowerCase();
    const name = productName(o.productId).toLowerCase();
    return (!q || name.includes(q) || String(o.bookingId || o.orderId || '').toLowerCase().includes(q) || String(o.email || o.username || '').toLowerCase().includes(q)) &&
      (status === 'all' || st === status) && (productFilter === 'all' || o.productId === productFilter);
  });
  const badge = (st: string) => {
    const cls = st === 'released' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : st === 'cancelled' ? 'bg-red-500/15 text-red-300 border-red-500/20' : st === 'pending' ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' : 'bg-blue-500/15 text-blue-300 border-blue-500/20';
    return <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase whitespace-nowrap ${cls}`}>{st}</span>;
  };
  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h2 className="text-xl font-bold text-white">Pre-Booking Management</h2><p className="text-xs text-slate-400 mt-1">Manage pre-booking configurations, reservations and releases.</p></div>
      <button onClick={onAdd} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300"><Plus className="w-4 h-4"/>Add Pre-Booking</button>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {[['Total Bookings',counts.total],['Confirmed',counts.confirmed],['Pending',counts.pending],['Released',counts.released],['Cancelled',counts.cancelled],['Revenue',`₹${counts.revenue.toFixed(2)}`]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 min-w-0"><div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</div><div className="text-lg font-bold text-white mt-1 truncate">{value}</div></div>)}
    </div>
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px_180px_auto] gap-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search booking ID, user or product" className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-3 outline-none"/></div>
        <select value={productFilter} onChange={e=>setProductFilter(e.target.value)} className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-3"><option value="all">All Products</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-3"><option value="all">All Status</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="released">Released</option><option value="cancelled">Cancelled</option></select>
        <button onClick={()=>{setSearch('');setStatus('all');setProductFilter('all')}} className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">Reset</button>
      </div>
    </div>
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="p-4 border-b border-slate-800"><h3 className="text-sm font-bold text-white">Pre-Booking Configurations</h3></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-xs"><thead className="bg-slate-950/60"><tr className="text-left text-slate-500 uppercase tracking-wider"><th className="px-4 py-3">Product</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Slots</th><th className="px-4 py-3">Release</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800">{filteredBookings.map(b=><tr key={b.id} className="text-slate-300 align-middle"><td className="px-4 py-3 font-semibold text-white">{productName(b.productId)}</td><td className="px-4 py-3">{durations.find(d=>d.id===b.durationId)?.name || '—'}</td><td className="px-4 py-3">₹{Number(b.priceOverride || 0).toFixed(2)}</td><td className="px-4 py-3">{Number(b.slots||0)>0 ? b.slots : 'Unlimited'}</td><td className="px-4 py-3">{b.releaseDate || '—'}</td><td className="px-4 py-3">{b.enabled ? <span className="text-emerald-300 font-bold">Enabled</span> : <span className="text-slate-500">Disabled</span>}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={()=>onEdit(b)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-200 font-bold"><Edit className="w-3.5 h-3.5"/>Edit</button><button onClick={()=>onDelete(b.id)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-300 font-bold"><Trash2 className="w-3.5 h-3.5"/>Delete</button></div></td></tr>)}{filteredBookings.length===0&&<tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No pre-booking configurations found.</td></tr>}</tbody></table></div>
    </div>
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="p-4 border-b border-slate-800"><h3 className="text-sm font-bold text-white">Pre-Booking Orders</h3></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-xs"><thead className="bg-slate-950/60"><tr className="text-left text-slate-500 uppercase tracking-wider"><th className="px-4 py-3">Booking ID</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800">{visibleOrders.map(o=>{const st=o.bookingStatus||'confirmed'; return <tr key={o.id} className="text-slate-300 align-middle"><td className="px-4 py-3 font-bold text-white">{o.bookingId||o.orderId}</td><td className="px-4 py-3">{o.username||o.email||'—'}</td><td className="px-4 py-3">{productName(o.productId)}</td><td className="px-4 py-3">₹{Number(o.amount||0).toFixed(2)}</td><td className="px-4 py-3">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td><td className="px-4 py-3">{badge(st)}</td><td className="px-4 py-3"><div className="flex justify-end gap-2">{st!=='released'&&st!=='cancelled'&&<button onClick={()=>onRelease(o)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold">Release</button>}{st==='released'&&<button onClick={()=>onDeleteRelease(o)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-300 font-bold"><Trash2 className="w-3.5 h-3.5"/>Delete Release</button>}{st!=='cancelled'&&st!=='released'&&<button onClick={()=>onCancel(o)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-300 font-bold">Cancel</button>}<button onClick={()=>onPermanentDelete(o)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600/15 text-rose-300 font-bold border border-rose-500/20" title="Permanently delete this order and its key assignment"><Trash2 className="w-3.5 h-3.5"/>Delete Order</button></div></td></tr>})}{visibleOrders.length===0&&<tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No pre-booking orders found.</td></tr>}</tbody></table></div>
    </div>
  </div>;
};

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  durations,
  prices,
  licenseKeys,
  trialKeys = [],
  coupons,
  preBookings,
  orders,
  settings,
  isAdminLoggedIn,
  onAdminLoginSuccess,
  onAdminLogout
}) => {
  // Login Form States
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Active Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'durations' | 'prices' | 'keys' | 'trials' | 'coupons' | 'prebookings' | 'orders' | 'settings' | 'website' | 'apk-links'
  >('dashboard');

  // Modals / Form States
  // 1. Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productEditId, setProductEditId] = useState<string | null>(null);
  const [productNameInput, setProductNameInput] = useState('');
  const [productCategoryInput, setProductCategoryInput] = useState('');
  const [productDescInput, setProductDescInput] = useState('');
  const [productEnabledInput, setProductEnabledInput] = useState(true);

  // 2. Duration Modal State
  const [durationModalOpen, setDurationModalOpen] = useState(false);
  const [durationEditId, setDurationEditId] = useState<string | null>(null);
  const [durationProductId, setDurationProductId] = useState('');
  const [durationNameInput, setDurationNameInput] = useState('');
  const [durationUnitInput, setDurationUnitInput] = useState<'hours' | 'days' | 'weeks' | 'months' | 'years'>('days');

  // 3. Price Modal State
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceEditId, setPriceEditId] = useState<string | null>(null);
  const [priceProductId, setPriceProductId] = useState('');
  const [priceDurationId, setPriceDurationId] = useState('');
  const [priceValueInput, setPriceValueInput] = useState<number>(0);

  // 4. Keys State
  const [keyProductId, setKeyProductId] = useState('');
  const [keyDurationId, setKeyDurationId] = useState('');
  const [singleKeyInput, setSingleKeyInput] = useState('');
  const [bulkKeysInput, setBulkKeysInput] = useState('');
  const [keyFilterTab, setKeyFilterTab] = useState<'active' | 'used'>('active');

  // 4b. Trial Keys State
  const [trialProductId, setTrialProductId] = useState('');
  const [trialDurationNameInput, setTrialDurationNameInput] = useState('2 Hours Free Trial');
  const [trialGenCountInput, setTrialGenCountInput] = useState<number>(5);
  const [trialSingleKeyInput, setTrialSingleKeyInput] = useState('');
  const [trialCodeInput, setTrialCodeInput] = useState('');
  const [trialFilterTab, setTrialFilterTab] = useState<'active' | 'used'>('active');

  // 5. Coupon Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponEditId, setCouponEditId] = useState<string | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponTypeInput, setCouponTypeInput] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValueInput, setCouponValueInput] = useState<number>(10);
  const [couponMinOrderInput, setCouponMinOrderInput] = useState<number>(0);
  const [couponExpiryInput, setCouponExpiryInput] = useState('');
  const [couponUsageLimitInput, setCouponUsageLimitInput] = useState(0);
  const [couponPerUserLimitInput, setCouponPerUserLimitInput] = useState(0);
  const [couponPrebookingOnlyInput, setCouponPrebookingOnlyInput] = useState(false);
  const [couponActiveInput, setCouponActiveInput] = useState(true);

  // 5b. Pre-Booking State
  const [preBookingModalOpen, setPreBookingModalOpen] = useState(false);
  const [preBookingEditId, setPreBookingEditId] = useState<string | null>(null);
  const [preBookingProductId, setPreBookingProductId] = useState('');
  const [preBookingDurationId, setPreBookingDurationId] = useState('');
  const [preBookingEnabled, setPreBookingEnabled] = useState(true);
  const [preBookingTitle, setPreBookingTitle] = useState('Early Pre-Booking');
  const [preBookingDescription, setPreBookingDescription] = useState('Pay the full amount now and reserve your release.');
  const [preBookingBadge, setPreBookingBadge] = useState('PRE-BOOKING');
  const [preBookingRelease, setPreBookingRelease] = useState('');
  const [preBookingStart, setPreBookingStart] = useState('');
  const [preBookingEnd, setPreBookingEnd] = useState('');
  const [preBookingSlots, setPreBookingSlots] = useState(0);
  const [preBookingPrice, setPreBookingPrice] = useState(0);
  const [preBookingRules, setPreBookingRules] = useState('Full payment is required. Pre-bookings are confirmed after successful payment.');

  // 6. Settings State
  const [rzpKeyIdInput, setRzpKeyIdInput] = useState(settings.razorpayKeyId || '');
  const [adminUserSetting, setAdminUserSetting] = useState(settings.adminUsername || '');
  const [adminPassSetting, setAdminPassSetting] = useState(settings.adminPassword || '');
  const [apkUrlSetting, setApkUrlSetting] = useState(settings.apkUrl || '');
  const [apkNameSetting, setApkNameSetting] = useState(settings.apkAppName || '');
  const [apkVersionSetting, setApkVersionSetting] = useState(settings.apkVersion || '');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);
  const [websiteLogoUrl, setWebsiteLogoUrl] = useState(settings.websiteLogoUrl || '/logo.jpg');
  const [websiteName, setWebsiteName] = useState(settings.websiteName || 'NovaEsp');
  const [navbarHomeText, setNavbarHomeText] = useState(settings.navbarHomeText || 'Home');
  const [navbarStoreText, setNavbarStoreText] = useState(settings.navbarStoreText || 'Store');
  const [navbarPrebookingText, setNavbarPrebookingText] = useState(settings.navbarPrebookingText || 'Pre-Booking');
  const [navbarTrackText, setNavbarTrackText] = useState(settings.navbarTrackText || 'Track Order');
  const [navbarFaqText, setNavbarFaqText] = useState(settings.navbarFaqText || 'FAQ');
  const [navbarSupportText, setNavbarSupportText] = useState(settings.navbarSupportText || 'Support');
  const [heroEyebrow, setHeroEyebrow] = useState(settings.heroEyebrow || 'Auto-Delivery License Portal');
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || 'NovaEsp Licence key Checkout');
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle || 'Select your software or gaming pass below. Receive your original license key immediately upon payment.');
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(!!settings.maintenanceEnabled);
  const [maintenanceTitle, setMaintenanceTitle] = useState(settings.maintenanceTitle || 'Website Under Maintenance');
  const [maintenanceMessage, setMaintenanceMessage] = useState(settings.maintenanceMessage || 'We are currently updating the website. Please check back soon.');
  const [maintenanceContactText, setMaintenanceContactText] = useState(settings.maintenanceContactText || 'Contact Support');
  const [maintenanceContactUrl, setMaintenanceContactUrl] = useState(settings.maintenanceContactUrl || 'https://t.me/KITYGAMER');
  const [footerBrandText, setFooterBrandText] = useState(settings.footerBrandText || 'NovaKey Store');
  const [footerCopyrightText, setFooterCopyrightText] = useState(settings.footerCopyrightText || 'All rights reserved.');
  const [productLogos, setProductLogos] = useState<Record<string, string>>(settings.productLogos || {});
  const [uploadingProductLogo, setUploadingProductLogo] = useState<string | null>(null);
  const [uploadingWebsiteLogo, setUploadingWebsiteLogo] = useState(false);
  const [apkLinkProductId, setApkLinkProductId] = useState('');
  const [apkLinkNameInput, setApkLinkNameInput] = useState('');
  const [apkLinkUrlInput, setApkLinkUrlInput] = useState('');
  const [apkLinkVersionInput, setApkLinkVersionInput] = useState('');
  const [setupChannelUrlSetting, setSetupChannelUrlSetting] = useState(settings.setupChannelUrl || '');


  // Sync settings when props change from Firebase
  useEffect(() => {
    if (settings) {
      setRzpKeyIdInput(settings.razorpayKeyId || '');
      setAdminUserSetting(settings.adminUsername || '');
      setAdminPassSetting(settings.adminPassword || '');
      setApkUrlSetting(settings.apkUrl || '');
      setApkNameSetting(settings.apkAppName || '');
      setApkVersionSetting(settings.apkVersion || '');
      setSetupChannelUrlSetting(settings.setupChannelUrl || '');
      setWebsiteLogoUrl(settings.websiteLogoUrl || '/logo.jpg');
      setWebsiteName(settings.websiteName || 'NovaEsp');
      setNavbarHomeText(settings.navbarHomeText || 'Home');
      setNavbarStoreText(settings.navbarStoreText || 'Store');
      setNavbarPrebookingText(settings.navbarPrebookingText || 'Pre-Booking');
      setNavbarTrackText(settings.navbarTrackText || 'Track Order');
      setNavbarFaqText(settings.navbarFaqText || 'FAQ');
      setNavbarSupportText(settings.navbarSupportText || 'Support');
      setHeroEyebrow(settings.heroEyebrow || 'Auto-Delivery License Portal');
      setHeroTitle(settings.heroTitle || 'NovaEsp Licence key Checkout');
      setHeroSubtitle(settings.heroSubtitle || 'Select your software or gaming pass below. Receive your original license key immediately upon payment.');
      setMaintenanceEnabled(!!settings.maintenanceEnabled);
      setMaintenanceTitle(settings.maintenanceTitle || 'Website Under Maintenance');
      setMaintenanceMessage(settings.maintenanceMessage || 'We are currently updating the website. Please check back soon.');
      setMaintenanceContactText(settings.maintenanceContactText || 'Contact Support');
      setMaintenanceContactUrl(settings.maintenanceContactUrl || 'https://t.me/KITYGAMER');
      setFooterBrandText(settings.footerBrandText || 'NovaKey Store');
      setFooterCopyrightText(settings.footerCopyrightText || 'All rights reserved.');
      setProductLogos(settings.productLogos || {});
    }
  }, [settings]);

  // 7. Orders Filter Search
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // Login Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = settings.adminUsername || 'admin';
    const validPass = settings.adminPassword || 'password123';

    if (loginUser.trim() === validUser && loginPass.trim() === validPass) {
      setLoginError('');
      onAdminLoginSuccess();
    } else {
      setLoginError('Invalid username or password credentials.');
    }
  };

  // If not logged in, render Admin Login Card
  if (!isAdminLoggedIn) {
    return (
      <div className="py-16 max-w-md mx-auto px-4">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Admin Authentication</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">Enter your administrator credentials to access store controls.</p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Username</label>
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Stats Calculations
  const totalOrdersCount = orders.length;
  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((acc, curr) => acc + (curr.finalAmount || 0), 0);
  const activeKeysCount = licenseKeys.filter(k => !k.used).length;
  const usedKeysCount = licenseKeys.filter(k => k.used).length;

  // PRODUCT CRUD
  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setProductEditId(prod.id);
      setProductNameInput(prod.name);
      setProductCategoryInput(prod.category || '');
      setProductDescInput(prod.description || '');
      setProductEnabledInput(prod.enabled !== false);
    } else {
      setProductEditId(null);
      setProductNameInput('');
      setProductCategoryInput('');
      setProductDescInput('');
      setProductEnabledInput(true);
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productNameInput.trim()) return;
    if (productEditId) {
      await updateData(`products/${productEditId}`, {
        name: productNameInput.trim(),
        category: productCategoryInput.trim(),
        description: productDescInput.trim(),
        enabled: productEnabledInput
      });
    } else {
      await pushData('products', {
        name: productNameInput.trim(),
        category: productCategoryInput.trim(),
        description: productDescInput.trim(),
        enabled: productEnabledInput,
        createdAt: Date.now()
      });
    }
    setProductModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteData(`products/${id}`);
    }
  };

  // DURATION CRUD
  const handleOpenDurationModal = (dur?: Duration) => {
    if (dur) {
      setDurationEditId(dur.id);
      setDurationProductId(dur.productId);
      setDurationNameInput(dur.name);
      setDurationUnitInput(dur.unit || 'days');
    } else {
      setDurationEditId(null);
      setDurationProductId(products[0]?.id || '');
      setDurationNameInput('');
      setDurationUnitInput('days');
    }
    setDurationModalOpen(true);
  };

  const handleSaveDuration = async () => {
    if (!durationProductId || !durationNameInput.trim()) return;
    if (durationEditId) {
      await updateData(`durations/${durationEditId}`, {
        productId: durationProductId,
        name: durationNameInput.trim(),
        unit: durationUnitInput
      });
    } else {
      await pushData('durations', {
        productId: durationProductId,
        name: durationNameInput.trim(),
        unit: durationUnitInput,
        createdAt: Date.now()
      });
    }
    setDurationModalOpen(false);
  };

  const handleDeleteDuration = async (id: string) => {
    if (confirm('Delete this duration?')) {
      await deleteData(`durations/${id}`);
    }
  };

  // PRICE CRUD
  const handleOpenPriceModal = (pr?: Price) => {
    if (pr) {
      setPriceEditId(pr.id);
      setPriceProductId(pr.productId);
      setPriceDurationId(pr.durationId);
      setPriceValueInput(pr.price);
    } else {
      setPriceEditId(null);
      setPriceProductId(products[0]?.id || '');
      setPriceDurationId('');
      setPriceValueInput(99);
    }
    setPriceModalOpen(true);
  };

  const handleSavePrice = async () => {
    if (!priceProductId || !priceDurationId || priceValueInput <= 0) return;
    if (priceEditId) {
      await updateData(`prices/${priceEditId}`, {
        productId: priceProductId,
        durationId: priceDurationId,
        price: priceValueInput
      });
    } else {
      await pushData('prices', {
        productId: priceProductId,
        durationId: priceDurationId,
        price: priceValueInput,
        createdAt: Date.now()
      });
    }
    setPriceModalOpen(false);
  };

  const handleDeletePrice = async (id: string) => {
    if (confirm('Delete this price setting?')) {
      await deleteData(`prices/${id}`);
    }
  };

  // LICENSE KEYS
  const handleAddSingleKey = async () => {
    if (!keyProductId || !keyDurationId || !singleKeyInput.trim()) {
      alert('Select product, duration, and enter key text.');
      return;
    }
    await pushData('licenseKeys', {
      productId: keyProductId,
      durationId: keyDurationId,
      key: singleKeyInput.trim(),
      used: false,
      createdAt: Date.now()
    });
    setSingleKeyInput('');
    alert('License key added to stock!');
  };

  const handleImportBulkKeys = async () => {
    if (!keyProductId || !keyDurationId || !bulkKeysInput.trim()) {
      alert('Select product, duration, and paste keys into the textarea.');
      return;
    }
    const lines = bulkKeysInput.split('\n').map(l => l.trim()).filter(l => l);
    let count = 0;
    for (const keyStr of lines) {
      await pushData('licenseKeys', {
        productId: keyProductId,
        durationId: keyDurationId,
        key: keyStr,
        used: false,
        usageCount: 0,
        createdAt: Date.now()
      });
      count++;
    }
    setBulkKeysInput('');
    alert(`${count} keys imported into stock successfully!`);
  };

  const handleDeleteKey = async (id: string) => {
    if (confirm('Remove this license key from database?')) {
      await deleteData(`licenseKeys/${id}`);
    }
  };

  // TRIAL KEYS HANDLERS
  const handleGenerateTrialKeyFromActualKey = async () => {
    let targetProductId = trialProductId || (products[0] ? products[0].id : '');
    if (!targetProductId) {
      alert('Please create at least one product in Product Manager first.');
      return;
    }
    if (!trialSingleKeyInput.trim()) {
      alert('Please enter/paste the actual key that should be delivered when user activates trial!');
      return;
    }

    const manualTrialCode = trialCodeInput.trim();
    if (!manualTrialCode) {
      alert('Please enter the Trial Code manually. Random trial codes are disabled.');
      return;
    }

    const duplicate = trialKeys.some(k =>
      (k.trialCode || k.key || '').trim().toUpperCase() === manualTrialCode.toUpperCase()
    );
    if (duplicate) {
      alert('This Trial Code already exists. Please enter a different code.');
      return;
    }

    try {
      await pushData('trialKeys', {
        productId: targetProductId,
        durationName: trialDurationNameInput.trim() || '2 Hours Free Trial',
        trialCode: manualTrialCode,
        actualKey: trialSingleKeyInput.trim(),
        key: manualTrialCode,
        used: false,
        usageCount: 0,
        createdAt: Date.now()
      });

      const savedKey = trialSingleKeyInput.trim();
      setTrialSingleKeyInput('');
      setTrialCodeInput('');
      setTrialFilterTab('active');
      alert(`Trial Code Saved Successfully!\n\nTrial Code: ${manualTrialCode}\nAttached Actual Key: ${savedKey}\n\nGive this Trial Code to users.`);
    } catch (err) {
      console.error('Error generating trial key:', err);
      alert('Failed to save generated trial key. Please try again.');
    }
  };

  const handleDeleteTrialKey = async (trialKeyItem: TrialKey) => {
    if (!trialKeyItem) return;
    if (confirm('Delete this trial key permanently?')) {
      try {
        await deleteTrialKeyFromDb({
          id: trialKeyItem.id,
          trialCode: trialKeyItem.trialCode,
          key: trialKeyItem.key
        });
        alert('Trial key deleted successfully from Firebase.');
      } catch (err) {
        console.error('Delete trial key error:', err);
        alert(`Failed to delete trial key from Firebase. ${err instanceof Error ? err.message : 'Please check Firebase Database Rules.'}`);
      }
    }
  };

  const handleClearAllFilteredTrialKeys = async () => {
    const listToDelete = trialKeys.filter(k => trialFilterTab === 'active' ? true : (Number(k.usageCount || 0) > 0 || k.used));
    if (listToDelete.length === 0) {
      alert(`No ${trialFilterTab === 'active' ? 'active' : 'claimed/used'} trial keys to delete.`);
      return;
    }
    const label = trialFilterTab === 'active' ? 'Active Trial Codes' : 'Used Trial Codes';
    if (confirm(`Are you sure you want to delete ALL ${listToDelete.length} ${label}?`)) {
      try {
        const result = await clearTrialKeysFromDb(trialFilterTab);
        alert(`${result.deleted} ${label} deleted successfully from Firebase.`);
      } catch (err) {
        console.error('Error clearing trial keys:', err);
        alert(`Failed to delete trial keys from Firebase. ${err instanceof Error ? err.message : 'Please check Firebase Database Rules.'}`);
      }
    }
  };

  // COUPON CRUD
  const handleOpenCouponModal = (coupon?: Coupon) => {
    if (coupon) { setCouponEditId(coupon.id); setCouponCodeInput(coupon.code); setCouponTypeInput(coupon.type); setCouponValueInput(coupon.value); setCouponMinOrderInput(coupon.minOrderValue || 0); setCouponExpiryInput(coupon.expiryDate || ''); setCouponUsageLimitInput(coupon.usageLimit || 0); setCouponPerUserLimitInput(coupon.perUserLimit || 0); setCouponPrebookingOnlyInput(!!coupon.prebookingOnly); setCouponActiveInput(coupon.active !== false); }
    else { setCouponEditId(null); setCouponCodeInput(''); setCouponTypeInput('percentage'); setCouponValueInput(10); setCouponMinOrderInput(0); setCouponExpiryInput(''); setCouponUsageLimitInput(0); setCouponPerUserLimitInput(0); setCouponPrebookingOnlyInput(false); setCouponActiveInput(true); }
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = async () => {
    if (!couponCodeInput.trim() || couponValueInput <= 0) return;
    const payload = { code: couponCodeInput.trim().toUpperCase(), type: couponTypeInput, value: couponValueInput, minOrderValue: couponMinOrderInput || 0, expiryDate: couponExpiryInput || null, usageLimit: couponUsageLimitInput || 0, perUserLimit: couponPerUserLimitInput || 0, prebookingOnly: couponPrebookingOnlyInput, active: couponActiveInput };
    if (couponEditId) await updateData(`coupons/${couponEditId}`, payload); else await pushData('coupons', { ...payload, usageCount: 0, createdAt: Date.now() });
    setCouponModalOpen(false); setCouponEditId(null);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm('Delete this coupon?')) {
      await deleteData(`coupons/${id}`);
    }
  };

  const handleOpenPreBookingModal = (item?: PreBooking) => {
    if (item) {
      setPreBookingEditId(item.id); setPreBookingProductId(item.productId); setPreBookingDurationId(item.durationId); setPreBookingEnabled(item.enabled !== false);
      setPreBookingTitle(item.title || 'Early Pre-Booking'); setPreBookingDescription(item.description || 'Pay the full amount now and reserve your release.'); setPreBookingBadge(item.badgeText || 'PRE-BOOKING');
      setPreBookingRelease(item.releaseDate || ''); setPreBookingPrice(Number(item.priceOverride || 0)); setPreBookingStart(item.startDate || ''); setPreBookingEnd(item.endDate || ''); setPreBookingSlots(Number(item.slots || 0)); setPreBookingRules(item.rules || '');
    } else {
      setPreBookingEditId(null); setPreBookingProductId(products[0]?.id || ''); setPreBookingDurationId(''); setPreBookingEnabled(true); setPreBookingTitle('Early Pre-Booking'); setPreBookingDescription('Pay the full amount now and reserve your release.'); setPreBookingBadge('PRE-BOOKING'); setPreBookingRelease(''); setPreBookingPrice(0); setPreBookingStart(''); setPreBookingEnd(''); setPreBookingSlots(0); setPreBookingRules('Full payment is required. Pre-bookings are confirmed after successful payment.');
    }
    setPreBookingModalOpen(true);
  };

  const handleSavePreBooking = async () => {
    if (!preBookingProductId || !preBookingDurationId) { alert('Select product and duration.'); return; }
    const payload = { productId: preBookingProductId, durationId: preBookingDurationId, enabled: preBookingEnabled, title: preBookingTitle.trim(), description: preBookingDescription.trim(), badgeText: preBookingBadge.trim() || 'PRE-BOOKING', releaseDate: preBookingRelease || null, startDate: preBookingStart || null, endDate: preBookingEnd || null, slots: Math.max(0, preBookingSlots || 0), rules: preBookingRules.trim(), priceOverride: preBookingPrice > 0 ? preBookingPrice : null, ...(preBookingEditId ? {} : { bookedCount: 0, createdAt: Date.now() }) };
    if (preBookingEditId) await updateData(`preBookings/${preBookingEditId}`, payload); else await pushData('preBookings', payload);
    setPreBookingModalOpen(false);
  };

  const handleDeletePreBooking = async (id: string) => { if (confirm('Delete this pre-booking configuration?')) await deleteData(`preBookings/${id}`); };

  const handleReleaseBooking = async (order: Order) => {
    if (order.bookingStatus === 'cancelled') return;

    // A pre-booking can only ever receive one key. If it was released before,
    // reuse the exact same key instead of assigning a new one.
    const existingAssignedKey = licenseKeys.find(
      k => k.orderId === order.orderId && k.productId === order.productId && k.durationId === order.durationId
    ) || licenseKeys.find(
      k => !!order.licenseKey && k.key === order.licenseKey && k.productId === order.productId && k.durationId === order.durationId
    );

    const keyObj = existingAssignedKey || licenseKeys.find(
      k => k.productId === order.productId && k.durationId === order.durationId && !k.used
    );

    if (!keyObj) { alert('No license key is available for this booking yet.'); return; }

    await updateData(`licenseKeys/${keyObj.id}`, {
      used: true,
      usedAt: keyObj.usedAt || Date.now(),
      orderId: order.orderId
    });
    await updateData(`orders/${order.id}`, { bookingStatus: 'released', licenseKey: keyObj.key });
  };

  const handleDeleteRelease = async (order: Order) => {
    if (!confirm(`Delete the release for pre-booking ${order.bookingId || order.orderId}? The assigned key will be preserved and this booking can be released again later with the SAME key.`)) return;

    // IMPORTANT: do not free/delete the key assignment. The order-to-key
    // mapping is permanent until the admin explicitly deletes the order.
    await updateData(`orders/${order.id}`, { bookingStatus: 'confirmed' });
  };

  const handlePermanentDeletePreBookingOrder = async (order: Order) => {
    const id = order.bookingId || order.orderId;
    if (!confirm(`PERMANENTLY DELETE order ${id}? This removes the booking, its permanent key assignment, and the order record. This cannot be undone.`)) return;

    const assignedKey = licenseKeys.find(k =>
      k.orderId === order.orderId ||
      (!!order.licenseKey && k.key === order.licenseKey)
    );

    if (assignedKey) {
      await deleteData(`licenseKeys/${assignedKey.id}`);
    }
    await deleteData(`orders/${order.id}`);
  };

  const handleCancelBooking = async (order: Order) => {
    if (confirm(`Cancel pre-booking ${order.bookingId || order.orderId}?`)) await updateData(`orders/${order.id}`, { bookingStatus: 'cancelled' });
  };

  // PRODUCT APK DOWNLOAD LINKS
  const handleAddApkLink = async () => {
    if (!apkLinkProductId) { alert('Please select a product first.'); return; }
    if (!apkLinkUrlInput.trim()) { alert('Please enter the APK download URL.'); return; }
    const product = products.find(p => p.id === apkLinkProductId);
    if (!product) return;
    const newLink: ApkDownloadLink = {
      id: `apk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: apkLinkNameInput.trim() || `APK Download ${(product.apkLinks?.length || 0) + 1}`,
      url: apkLinkUrlInput.trim(),
      version: apkLinkVersionInput.trim(),
      createdAt: Date.now()
    };
    await updateData(`products/${apkLinkProductId}`, { apkLinks: [...(product.apkLinks || []), newLink] });
    setApkLinkNameInput(''); setApkLinkUrlInput(''); setApkLinkVersionInput('');
    alert('APK download link added to this product.');
  };
  const handleDeleteApkLink = async (product: Product, linkId: string) => {
    if (!confirm('Delete this APK download link?')) return;
    await updateData(`products/${product.id}`, { apkLinks: (product.apkLinks || []).filter(link => link.id !== linkId) });
  };

  // SAVE SETTINGS
  const handleSaveSettings = async () => {
    await setData('settings/razorpay', { keyId: rzpKeyIdInput.trim() });
    await setData('settings/admin', {
      username: adminUserSetting.trim() || 'admin',
      password: adminPassSetting.trim() || 'password123'
    });
    await setData('settings/apk', {
      url: apkUrlSetting.trim(),
      appName: apkNameSetting.trim(),
      version: apkVersionSetting.trim()
    });
    await setData('settings/setup', { channelUrl: setupChannelUrlSetting.trim() });
    await setData('settings/website', {
      websiteLogoUrl: websiteLogoUrl.trim(),
      websiteName: websiteName.trim(),
      navbarHomeText: navbarHomeText.trim(),
      navbarStoreText: navbarStoreText.trim(),
      navbarPrebookingText: navbarPrebookingText.trim(),
      navbarTrackText: navbarTrackText.trim(),
      navbarFaqText: navbarFaqText.trim(),
      navbarSupportText: navbarSupportText.trim(),
      heroEyebrow: heroEyebrow.trim(),
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      maintenanceEnabled,
      maintenanceTitle: maintenanceTitle.trim(),
      maintenanceMessage: maintenanceMessage.trim(),
      maintenanceContactText: maintenanceContactText.trim(),
      maintenanceContactUrl: maintenanceContactUrl.trim(),
      footerBrandText: footerBrandText.trim(),
      footerCopyrightText: footerCopyrightText.trim(),
      productLogos
    });
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  // SEED DEFAULT DATABASE
  const handleSeedDatabase = async () => {
    if (confirm('Populate database with default sample products, prices, and stock keys?')) {
      await seedInitialDataIfEmpty();
      alert('Default data generated!');
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Top Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            Authenticated Admin Mode
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Store Control Center</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDatabase}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-bold transition-all"
            title="Populate initial demo data"
          >
            <Database className="w-3.5 h-3.5" /> Seed DB
          </button>
          <button
            onClick={onAdminLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-6 no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'durations', label: 'Durations', icon: Clock },
          { id: 'prices', label: 'Prices', icon: DollarSign },
          { id: 'keys', label: 'License Keys', icon: Key },
          { id: 'trials', label: 'Trial Keys', icon: Zap },
          { id: 'coupons', label: 'Coupons', icon: Tag },
          { id: 'prebookings', label: 'Pre-Bookings', icon: CalendarDays },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
          { id: 'website', label: 'Website', icon: Globe2 },
          { id: 'apk-links', label: 'APK Downloads', icon: Download }
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Revenue</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">₹{totalRevenue}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Sales</span>
                <div className="text-2xl font-black text-white mt-1">{paidOrders.length} Orders</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Keys In Stock</span>
                <div className="text-2xl font-black text-teal-400 mt-1">{activeKeysCount} Active</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                <Key className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Keys Delivered</span>
                <div className="text-2xl font-black text-cyan-400 mt-1">{usedKeysCount} Sold</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Stock Availability Matrix Cards */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex flex-wrap items-center justify-between gap-2">
              <span>Inventory Stock Overview</span>
              <span className="text-xs font-normal text-slate-400">{activeKeysCount} Total Active Keys</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {durations.map((dur) => {
                const prod = products.find(p => p.id === dur.productId);
                const activeForThis = licenseKeys.filter(
                  k => k.productId === dur.productId && k.durationId === dur.id && !k.used
                ).length;
                const isLow = activeForThis > 0 && activeForThis <= 2;
                const isOut = activeForThis === 0;

                return (
                  <div key={dur.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-sm truncate">{prod?.name || 'Product'}</div>
                        <div className="text-xs text-slate-400 truncate">{dur.name} ({dur.unit})</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        isOut ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        isLow ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div className="text-xl font-extrabold font-mono text-emerald-400 mt-2">
                      {activeForThis} <span className="text-xs font-normal text-slate-400">Keys</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Order ID</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Product</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Duration</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Amount</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id || ord.orderId} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-white whitespace-nowrap">{ord.orderId}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{ord.productName}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{ord.durationName}</td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 whitespace-nowrap">₹{ord.finalAmount}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-white">Products Catalog</h3>
            <button
              onClick={() => handleOpenProductModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Product Name</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Category</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Status</th>
                  <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{p.category || 'General'}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.enabled !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {p.enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenProductModal(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DURATIONS */}
      {activeTab === 'durations' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-white">Access Durations</h3>
            <button
              onClick={() => handleOpenDurationModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Duration
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Product</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Duration Name</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Unit</th>
                  <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {durations.map((d) => {
                  const prod = products.find(p => p.id === d.productId);
                  return (
                    <tr key={d.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">{prod?.name || 'Unknown'}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{d.name}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {d.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDurationModal(d)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDuration(d.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRICES */}
      {activeTab === 'prices' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-white">Pricing Matrix</h3>
            <button
              onClick={() => handleOpenPriceModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" /> Set Price
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Product</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Duration</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Price</th>
                  <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {prices.map((pr) => {
                  const prod = products.find(p => p.id === pr.productId);
                  const dur = durations.find(d => d.id === pr.durationId);
                  return (
                    <tr key={pr.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">{prod?.name || 'Unknown'}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{dur ? `${dur.name} (${dur.unit})` : 'Unknown'}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 whitespace-nowrap">₹{pr.price}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPriceModal(pr)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePrice(pr.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LICENSE KEYS */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          
          {/* Key Import Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <h3 className="text-base font-bold text-white mb-4">Add / Batch Import License Keys</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Select Product</label>
                <select
                  value={keyProductId}
                  onChange={(e) => {
                    setKeyProductId(e.target.value);
                    setKeyDurationId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Select Duration</label>
                <select
                  value={keyDurationId}
                  onChange={(e) => setKeyDurationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose Duration</option>
                  {durations.filter(d => d.productId === keyProductId).map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.unit})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Single Key Adder</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="KEY-1234-ABCD-5678"
                    value={singleKeyInput}
                    onChange={(e) => setSingleKeyInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleAddSingleKey}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shrink-0 transition-all"
                  >
                    Add Key
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Bulk Key Importer (One key per line)</label>
                <textarea
                  rows={3}
                  placeholder={`NOVA-KEY-001-AAA\nNOVA-KEY-002-BBB\nNOVA-KEY-003-CCC`}
                  value={bulkKeysInput}
                  onChange={(e) => setBulkKeysInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleImportBulkKeys}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" /> Import Batch
                </button>
              </div>
            </div>
          </div>

          {/* Keys Inventory Tables */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={() => setKeyFilterTab('active')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  keyFilterTab === 'active'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Active Keys ({activeKeysCount})
              </button>
              <button
                onClick={() => setKeyFilterTab('used')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  keyFilterTab === 'used'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Delivered / Used Keys ({usedKeysCount})
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Product</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Duration</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Key Text</th>
                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {licenseKeys
                    .filter(k => (keyFilterTab === 'active' ? !k.used : k.used))
                    .map((k) => {
                      const prod = products.find(p => p.id === k.productId);
                      const dur = durations.find(d => d.id === k.durationId);
                      return (
                        <tr key={k.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">{prod?.name || 'Unknown'}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">{dur?.name || 'Unknown'}</td>
                          <td className="px-4 py-3.5 font-mono text-emerald-400 select-all whitespace-nowrap">{k.key}</td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteKey(k.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                              title="Delete Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: TRIAL KEYS */}
      {activeTab === 'trials' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span>Free Trial Keys Generator & Management</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select a product, attach your actual license key, and click generate. The system creates a reusable Trial Code. The same code can be activated by unlimited users until you delete it.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Select Target Product</label>
                <select
                  value={trialProductId}
                  onChange={(e) => setTrialProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Trial Duration Title</label>
                <input
                  type="text"
                  value={trialDurationNameInput}
                  onChange={(e) => setTrialDurationNameInput(e.target.value)}
                  placeholder="2 Hours Free Trial"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Single Actual Key Input & Generate Trial Code */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Save Actual Key & Generate Trial Code</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enter the real key below. Enter the Trial Code manually. No random code is generated. When users enter that Trial Code, each user receives this actual key. The same Trial Code can be reused by unlimited users!
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Type Trial Code manually (e.g. NOVA-TRIAL-001)"
                  value={trialCodeInput}
                  onChange={(e) => setTrialCodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl px-3.5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Paste Actual Real Key here (e.g. VIP-REALKEY-9922-8811)"
                  value={trialSingleKeyInput}
                  onChange={(e) => setTrialSingleKeyInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl px-3.5 py-3 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleGenerateTrialKeyFromActualKey}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Generate Trial Code</span>
                </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trial Keys Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setTrialFilterTab('active')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    trialFilterTab === 'active'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Active Trial Codes ({trialKeys.length})
                </button>
                <button
                  onClick={() => setTrialFilterTab('used')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    trialFilterTab === 'used'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Activated Trial Codes ({trialKeys.filter(t => Number(t.usageCount || 0) > 0 || t.used).length})
                </button>
              </div>

              {trialKeys.filter(k => (trialFilterTab === 'active' ? true : (Number(k.usageCount || 0) > 0 || k.used))).length > 0 && (
                <button
                  onClick={handleClearAllFilteredTrialKeys}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All {trialFilterTab === 'active' ? 'Active' : 'Activated'}</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Product</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Duration</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Generated Trial Code (For User)</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Saved Actual Key (Revealed)</th>
                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Claimed By / Date</th>
                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {trialKeys
                    .filter(k => (trialFilterTab === 'active' ? true : (Number(k.usageCount || 0) > 0 || k.used)))
                    .map((k) => {
                      const prod = products.find(p => p.id === k.productId);
                      const displayTrialCode = k.trialCode || k.key || 'N/A';
                      const displayActualKey = k.actualKey || k.key || 'N/A';

                      return (
                        <tr key={k.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">{prod?.name || 'Unknown'}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">{k.durationName || '2 Hours Trial'}</td>
                          <td className="px-4 py-3.5 font-mono text-emerald-400 select-all font-bold whitespace-nowrap">{displayTrialCode}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-300 select-all whitespace-nowrap">{displayActualKey}</td>
                          <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-emerald-400 font-semibold">
                                {Number(k.usageCount || 0)} activation{Number(k.usageCount || 0) === 1 ? '' : 's'} • Unlimited users
                              </span>
                              {k.lastUsedAt && (
                                <span className="text-[10px] text-slate-500">
                                  Last: {k.lastUsedByEmail || 'Trial User'} • {new Date(k.lastUsedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteTrialKey(k)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                              title="Delete Trial Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {trialKeys.filter(k => (trialFilterTab === 'active' ? true : (Number(k.usageCount || 0) > 0 || k.used))).length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                        No {trialFilterTab} trial keys found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-white">Discount Coupons</h3>
            <button
              onClick={() => handleOpenCouponModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Code</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Discount</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Min Order</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Usage</th><th className="px-4 py-3.5 font-bold whitespace-nowrap">Type</th><th className="px-4 py-3.5 font-bold whitespace-nowrap">Expiry</th>
                  <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 whitespace-nowrap">{c.code}</td>
                    <td className="px-4 py-3.5 font-bold whitespace-nowrap">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">₹{c.minOrderValue || 0}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{c.usageCount||0} / {Number(c.usageLimit||0)>0 ? c.usageLimit : 'Unlimited'}</td><td className="px-4 py-3.5 whitespace-nowrap">{c.prebookingOnly ? 'Pre-booking only' : 'All orders'}</td><td className="px-4 py-3.5 whitespace-nowrap">{c.expiryDate || 'No expiry'}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenCouponModal(c)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors mr-1" title="Edit Coupon"><Edit className="w-3.5 h-3.5" /></button>
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRE-BOOKINGS */}
      {activeTab === 'prebookings' && (
        <PreBookingManagement
          preBookings={preBookings}
          products={products}
          durations={durations}
          orders={orders}
          onAdd={() => handleOpenPreBookingModal()}
          onEdit={handleOpenPreBookingModal}
          onDelete={handleDeletePreBooking}
          onRelease={handleReleaseBooking}
          onDeleteRelease={handleDeleteRelease}
          onPermanentDelete={handlePermanentDeletePreBookingOrder}
          onCancel={handleCancelBooking}
        />
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-white">Store Order Logs</h3>
            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value.toLowerCase())}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Order ID</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Product</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Duration</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Pay Amount</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Assigned Key</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {orders
                  .filter(
                    o =>
                      !orderSearchTerm ||
                      o.orderId.toLowerCase().includes(orderSearchTerm) ||
                      o.productName.toLowerCase().includes(orderSearchTerm)
                  )
                  .map((ord) => (
                    <tr key={ord.id || ord.orderId} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-white whitespace-nowrap">{ord.orderId}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{ord.productName}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{ord.durationName}</td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 whitespace-nowrap">₹{ord.finalAmount}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400 select-all whitespace-nowrap">{ord.licenseKey}</td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEBSITE */}
      {activeTab === 'website' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2"><Globe2 className="w-5 h-5 text-emerald-400" /> Website Editor</h3>
              <p className="text-xs text-slate-400 mt-1">Edit the public website content without changing source code.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Website Logo</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center shrink-0">
                    <img src={websiteLogoUrl || '/logo.jpg'} alt="Website logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black cursor-pointer hover:bg-emerald-400 transition">
                        <Upload className="w-4 h-4" />
                        {uploadingWebsiteLogo ? 'Uploading...' : 'Upload Logo'}
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,.gif"
                          className="hidden"
                          disabled={uploadingWebsiteLogo}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            e.currentTarget.value = '';
                            if (!file) return;
                            try {
                              setUploadingWebsiteLogo(true);
                              const url = await uploadWebsiteLogo(file);
                              setWebsiteLogoUrl(url);
                              await setData('settings/website/websiteLogoUrl', url);
                            } catch (err: any) {
                              alert(err?.message || 'Website logo upload failed.');
                            } finally {
                              setUploadingWebsiteLogo(false);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-slate-500">PNG, JPG, WEBP, GIF · max 5 MB</span>
                    </div>
                    <input value={websiteLogoUrl} onChange={e=>setWebsiteLogoUrl(e.target.value)} placeholder="Or paste an image URL..." className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" />
                  </div>
                </div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Website / Navbar Name</label><input value={websiteName} onChange={e=>setWebsiteName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Footer Brand</label><input value={footerBrandText} onChange={e=>setFooterBrandText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-white">Product Download Logos</h4>
              <p className="text-xs text-slate-400 mt-1">Set a separate logo for each product. It will appear beside the Download APK button on purchase and trial success screens.</p>
            </div>
            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3 items-center bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0 flex items-center justify-center">
                      <img src={productLogos[product.id] || product.icon || '/logo.jpg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-white truncate">{product.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black cursor-pointer hover:bg-emerald-400 transition">
                      <Upload className="w-4 h-4" />
                      {uploadingProductLogo === product.id ? 'Uploading...' : 'Upload Logo'}
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.gif"
                        className="hidden"
                        disabled={uploadingProductLogo === product.id}
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          e.currentTarget.value = '';
                          if (!file) return;
                          try {
                            setUploadingProductLogo(product.id);
                            const url = await uploadProductLogo(product.id, file);
                            setProductLogos(prev => ({ ...prev, [product.id]: url }));
                            await setData(`settings/website/productLogos/${product.id}`, url);
                          } catch (err: any) {
                            alert(err?.message || 'Logo upload failed.');
                          } finally {
                            setUploadingProductLogo(null);
                          }
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-slate-500">PNG, JPG, WEBP · max 5 MB</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => { setProductLogos(prev => { const next = { ...prev }; delete next[product.id]; return next; }); await deleteData(`settings/website/productLogos/${product.id}`); }}
                    className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-bold"
                    title="Use default logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {products.length === 0 && <p className="text-xs text-slate-500">Add products first to configure their logos.</p>}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h4 className="text-sm font-bold text-white">Navbar Labels</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[['Home',navbarHomeText,setNavbarHomeText],['Store',navbarStoreText,setNavbarStoreText],['Pre-Booking',navbarPrebookingText,setNavbarPrebookingText],['Track Order',navbarTrackText,setNavbarTrackText],['FAQ',navbarFaqText,setNavbarFaqText],['Support',navbarSupportText,setNavbarSupportText]].map(([label,value,setter])=><div key={label as string}><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label as string}</label><input value={value as string} onChange={e=>(setter as any)(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>)}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h4 className="text-sm font-bold text-white">Homepage Hero Content</h4>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Eyebrow</label><input value={heroEyebrow} onChange={e=>setHeroEyebrow(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Main Heading</label><input value={heroTitle} onChange={e=>setHeroTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Subtitle</label><textarea rows={3} value={heroSubtitle} onChange={e=>setHeroSubtitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 resize-y" /></div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between gap-4"><div><h4 className="text-sm font-bold text-white">Website Maintenance</h4><p className="text-xs text-slate-400 mt-1">When enabled, visitors see the maintenance page while admin remains accessible.</p></div><button onClick={()=>setMaintenanceEnabled(v=>!v)} className={`px-4 py-2 rounded-xl text-xs font-black ${maintenanceEnabled?'bg-rose-500 text-white':'bg-emerald-500 text-slate-950'}`}>{maintenanceEnabled?'ON':'OFF'}</button></div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Maintenance Title</label><input value={maintenanceTitle} onChange={e=>setMaintenanceTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Maintenance Message</label><textarea rows={3} value={maintenanceMessage} onChange={e=>setMaintenanceMessage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Contact Button Text</label><input value={maintenanceContactText} onChange={e=>setMaintenanceContactText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div><div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Contact URL</label><input value={maintenanceContactUrl} onChange={e=>setMaintenanceContactUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div></div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4"><h4 className="text-sm font-bold text-white">Footer</h4><div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Copyright Text</label><input value={footerCopyrightText} onChange={e=>setFooterCopyrightText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div></div>
          <button onClick={handleSaveSettings} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20">Save Website Changes</button>
        </div>
      )}

      {/* TAB CONTENT: APK DOWNLOADS */}
      {activeTab === 'apk-links' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div><h3 className="text-base font-bold text-white flex items-center gap-2"><Download className="w-5 h-5 text-emerald-400" /> Product APK Downloads</h3><p className="text-xs text-slate-400 mt-1">Add unlimited APK download links for each product. They appear on purchase, trial and order lookup pages.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product</label><select value={apkLinkProductId} onChange={e=>setApkLinkProductId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"><option value="">Select product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Name</label><input value={apkLinkNameInput} onChange={e=>setApkLinkNameInput(e.target.value)} placeholder="Main APK / Android 64-bit" className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Download URL</label><input type="url" value={apkLinkUrlInput} onChange={e=>setApkLinkUrlInput(e.target.value)} placeholder="https://example.com/app.apk" className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Version</label><input value={apkLinkVersionInput} onChange={e=>setApkLinkVersionInput(e.target.value)} placeholder="v2.4.0" className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
            </div>
            <button onClick={handleAddApkLink} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">Add APK Link</button>
          </div>
          <div className="space-y-3">
            {products.map(product => <div key={product.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4"><div className="flex items-center justify-between gap-3 mb-3"><span className="text-sm font-bold text-white">{product.name}</span><span className="text-[11px] text-slate-500">{product.apkLinks?.length || 0} link(s)</span></div>{(product.apkLinks || []).length === 0 ? <p className="text-xs text-slate-500">No product-specific APK links.</p> : <div className="space-y-2">{(product.apkLinks || []).map(link => <div key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950/60 border border-slate-800 p-3"><div className="min-w-0"><span className="text-xs font-bold text-white">{link.name}</span>{link.version && <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">{link.version}</span>}<p className="text-[10px] text-slate-500 truncate mt-1">{link.url}</p></div><button onClick={()=>handleDeleteApkLink(product, link.id)} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-bold">Delete</button></div>)}</div>}</div>)}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 max-w-2xl">
          <h3 className="text-base font-bold text-white">Store Configuration & Gateway Settings</h3>

          {settingsSavedMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              All settings saved successfully!
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Razorpay Key ID (Merchant)</label>
            <input
              type="text"
              value={rzpKeyIdInput}
              onChange={(e) => setRzpKeyIdInput(e.target.value)}
              placeholder="rzp_test_..."
              className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl p-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Admin Username</label>
              <input
                type="text"
                value={adminUserSetting}
                onChange={(e) => setAdminUserSetting(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Admin Password</label>
              <input
                type="password"
                value={adminPassSetting}
                onChange={(e) => setAdminPassSetting(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">GitHub / Direct APK Release Download Link</label>
              <input
                type="url"
                value={apkUrlSetting}
                onChange={(e) => setApkUrlSetting(e.target.value)}
                placeholder="https://github.com/user/repo/releases/download/v1.0/app.apk"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">APK App Name</label>
                <input
                  type="text"
                  value={apkNameSetting}
                  onChange={(e) => setApkNameSetting(e.target.value)}
                  placeholder="NovaEsp Android VIP Loader"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">APK Version Tag</label>
                <input
                  type="text"
                  value={apkVersionSetting}
                  onChange={(e) => setApkVersionSetting(e.target.value)}
                  placeholder="v2.4.0"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Setup Guide Channel URL</label><input type="url" value={setupChannelUrlSetting} onChange={e=>setSetupChannelUrlSetting(e.target.value)} placeholder="https://t.me/your_setup_channel" className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /><p className="text-[11px] text-slate-500 mt-1">Shown as Setup Guide on purchase and trial success pages.</p></div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            Save All Settings
          </button>
        </div>
      )}

      {/* MODAL: Product Add/Edit */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {productEditId ? 'Edit Product' : 'Add New Product'}
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product Name</label>
              <input
                type="text"
                value={productNameInput}
                onChange={(e) => setProductNameInput(e.target.value)}
                placeholder="e.g. NovaEsp VIP"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
              <input
                type="text"
                value={productCategoryInput}
                onChange={(e) => setProductCategoryInput(e.target.value)}
                placeholder="e.g. Gaming ESP / Software"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
              <textarea
                value={productDescInput}
                onChange={(e) => setProductDescInput(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableCheck"
                checked={productEnabledInput}
                onChange={(e) => setProductEnabledInput(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
              />
              <label htmlFor="enableCheck" className="text-xs text-white">Enabled in Store</label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProductModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Duration Add/Edit */}
      {durationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {durationEditId ? 'Edit Duration' : 'Add Access Duration'}
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product</label>
              <select
                value={durationProductId}
                onChange={(e) => setDurationProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duration Title</label>
              <input
                type="text"
                value={durationNameInput}
                onChange={(e) => setDurationNameInput(e.target.value)}
                placeholder="e.g. 7 Days Access"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Time Unit</label>
              <select
                value={durationUnitInput}
                onChange={(e) => setDurationUnitInput(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDurationModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDuration}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Price Add/Edit */}
      {priceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Set Pricing</h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product</label>
              <select
                value={priceProductId}
                onChange={(e) => {
                  setPriceProductId(e.target.value);
                  setPriceDurationId('');
                }}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</label>
              <select
                value={priceDurationId}
                onChange={(e) => setPriceDurationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Duration --</option>
                {durations.filter(d => d.productId === priceProductId).map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.unit})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Price (₹)</label>
              <input
                type="number"
                value={priceValueInput}
                onChange={(e) => setPriceValueInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPriceModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrice}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pre-Booking Add/Edit */}
      {preBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-base font-bold text-white">{preBookingEditId?'Edit Pre-Booking':'Create Pre-Booking'}</h3><CalendarDays className="w-5 h-5 text-amber-400"/></div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product</label><select value={preBookingProductId} onChange={e=>{setPreBookingProductId(e.target.value);setPreBookingDurationId('')}} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3">{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</label><select value={preBookingDurationId} onChange={e=>setPreBookingDurationId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"><option value="">Choose duration</option>{durations.filter(d=>d.productId===preBookingProductId).map(d=><option key={d.id} value={d.id}>{d.name} ({d.unit})</option>)}</select></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-slate-400 mb-1">Title</label><input value={preBookingTitle} onChange={e=>setPreBookingTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div><div><label className="block text-xs font-bold text-slate-400 mb-1">Badge</label><input value={preBookingBadge} onChange={e=>setPreBookingBadge(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div></div>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Description</label><textarea value={preBookingDescription} onChange={e=>setPreBookingDescription(e.target.value)} rows={2} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Pre-Booking Price (0 = Use Normal Price)</label><input type="number" min="0" value={preBookingPrice} onChange={e=>setPreBookingPrice(parseFloat(e.target.value)||0)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-slate-400 mb-1">Start Date</label><input type="datetime-local" value={preBookingStart} onChange={e=>setPreBookingStart(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div><div><label className="block text-xs font-bold text-slate-400 mb-1">Close Date</label><input type="datetime-local" value={preBookingEnd} onChange={e=>setPreBookingEnd(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-slate-400 mb-1">Release Date</label><input type="datetime-local" value={preBookingRelease} onChange={e=>setPreBookingRelease(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div><div><label className="block text-xs font-bold text-slate-400 mb-1">Slots (0 = Unlimited)</label><input type="number" min="0" value={preBookingSlots} onChange={e=>setPreBookingSlots(parseInt(e.target.value)||0)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div></div>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Pre-Booking Rules</label><textarea value={preBookingRules} onChange={e=>setPreBookingRules(e.target.value)} rows={4} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"/></div>
            <label className="flex items-center gap-2 text-xs text-white"><input type="checkbox" checked={preBookingEnabled} onChange={e=>setPreBookingEnabled(e.target.checked)}/> Enabled in Store</label>
            <div className="flex gap-2"><button onClick={()=>setPreBookingModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button><button onClick={handleSavePreBooking} className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold">Save Pre-Booking</button></div>
          </div>
        </div>
      )}

      {/* MODAL: Coupon Add */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">{couponEditId ? 'Edit Coupon Code' : 'Create Coupon Code'}</h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="SAVE20"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs uppercase rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Type</label>
              <select
                value={couponTypeInput}
                onChange={(e) => setCouponTypeInput(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Value</label>
              <input
                type="number"
                value={couponValueInput}
                onChange={(e) => setCouponValueInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                value={couponMinOrderInput}
                onChange={(e) => setCouponMinOrderInput(parseFloat(e.target.value) || 0)}
                placeholder="0 = no min"
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={couponExpiryInput}
                onChange={(e) => setCouponExpiryInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Usage Limit (0 = Unlimited)</label><input type="number" min="0" value={couponUsageLimitInput} onChange={e=>setCouponUsageLimitInput(parseInt(e.target.value)||0)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Scope</label><select value={couponPrebookingOnlyInput ? 'pre' : 'all'} onChange={e=>setCouponPrebookingOnlyInput(e.target.value==='pre')} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3"><option value="all">All orders</option><option value="pre">Pre-booking only</option></select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Per User Limit (0 = Unlimited)</label><input type="number" min="0" value={couponPerUserLimitInput} onChange={e=>setCouponPerUserLimitInput(parseInt(e.target.value)||0)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3" /></div>
              <label className="flex items-center gap-2 text-xs text-white pt-6"><input type="checkbox" checked={couponActiveInput} onChange={e=>setCouponActiveInput(e.target.checked)}/> Active Coupon</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCouponModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCoupon}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
