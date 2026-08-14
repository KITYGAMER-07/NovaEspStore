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
  Sparkles,
  Zap,
  Download
} from 'lucide-react';
import { Product, Duration, Price, LicenseKey, TrialKey, Coupon, Order, Settings, ApkDownloadLink } from '../types';
import { 
  pushData, 
  updateData, 
  deleteData, 
  setData, 
  seedInitialDataIfEmpty,
  deleteTrialKeyFromDb,
  clearTrialKeysFromDb
} from '../lib/firebase';

interface AdminPortalProps {
  products: Product[];
  durations: Duration[];
  prices: Price[];
  licenseKeys: LicenseKey[];
  trialKeys?: TrialKey[];
  coupons: Coupon[];
  orders: Order[];
  settings: Settings;
  isAdminLoggedIn: boolean;
  onAdminLoginSuccess: () => void;
  onAdminLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  durations,
  prices,
  licenseKeys,
  trialKeys = [],
  coupons,
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
    'dashboard' | 'products' | 'durations' | 'prices' | 'keys' | 'trials' | 'apk-links' | 'coupons' | 'orders' | 'settings'
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
  const [trialFilterTab, setTrialFilterTab] = useState<'active' | 'used'>('active');

  // 4c. Product APK Download Links
  const [apkLinkProductId, setApkLinkProductId] = useState('');
  const [apkLinkNameInput, setApkLinkNameInput] = useState('');
  const [apkLinkUrlInput, setApkLinkUrlInput] = useState('');
  const [apkLinkVersionInput, setApkLinkVersionInput] = useState('');

  // 5. Coupon Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponTypeInput, setCouponTypeInput] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValueInput, setCouponValueInput] = useState<number>(10);
  const [couponMinOrderInput, setCouponMinOrderInput] = useState<number>(0);
  const [couponExpiryInput, setCouponExpiryInput] = useState('');

  // 6. Settings State
  const [rzpKeyIdInput, setRzpKeyIdInput] = useState(settings.razorpayKeyId || '');
  const [adminUserSetting, setAdminUserSetting] = useState(settings.adminUsername || '');
  const [adminPassSetting, setAdminPassSetting] = useState(settings.adminPassword || '');
  const [apkUrlSetting, setApkUrlSetting] = useState(settings.apkUrl || '');
  const [apkNameSetting, setApkNameSetting] = useState(settings.apkAppName || '');
  const [apkVersionSetting, setApkVersionSetting] = useState(settings.apkVersion || '');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Sync settings when props change from Firebase
  useEffect(() => {
    if (settings) {
      setRzpKeyIdInput(settings.razorpayKeyId || '');
      setAdminUserSetting(settings.adminUsername || '');
      setAdminPassSetting(settings.adminPassword || '');
      setApkUrlSetting(settings.apkUrl || '');
      setApkNameSetting(settings.apkAppName || '');
      setApkVersionSetting(settings.apkVersion || '');
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

  // PRODUCT APK DOWNLOAD LINKS
  const handleAddApkLink = async () => {
    if (!apkLinkProductId) {
      alert('Please select a product first.');
      return;
    }
    if (!apkLinkUrlInput.trim()) {
      alert('Please enter the APK download URL.');
      return;
    }

    const product = products.find(p => p.id === apkLinkProductId);
    if (!product) return;

    const newLink: ApkDownloadLink = {
      id: `apk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: apkLinkNameInput.trim() || `APK Download ${(product.apkLinks?.length || 0) + 1}`,
      url: apkLinkUrlInput.trim(),
      version: apkLinkVersionInput.trim(),
      createdAt: Date.now()
    };

    await updateData(`products/${apkLinkProductId}`, {
      apkLinks: [...(product.apkLinks || []), newLink]
    });

    setApkLinkNameInput('');
    setApkLinkUrlInput('');
    setApkLinkVersionInput('');
    alert('APK download link added to this product.');
  };

  const handleDeleteApkLink = async (product: Product, linkId: string) => {
    if (!confirm('Delete this APK download link?')) return;
    const nextLinks = (product.apkLinks || []).filter(link => link.id !== linkId);
    await updateData(`products/${product.id}`, { apkLinks: nextLinks });
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

    const prod = products.find(p => p.id === targetProductId);
    const prodPrefix = prod ? prod.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'NOVA') : 'TRIAL';
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomTrialCode = `TRIAL-${prodPrefix}-${part1}-${part2}`;

    try {
      await pushData('trialKeys', {
        productId: targetProductId,
        durationName: trialDurationNameInput.trim() || '2 Hours Free Trial',
        trialCode: randomTrialCode,
        actualKey: trialSingleKeyInput.trim(),
        key: randomTrialCode, // fallback
        used: false,
        usageCount: 0,
        createdAt: Date.now()
      });

      const savedKey = trialSingleKeyInput.trim();
      setTrialSingleKeyInput('');
      setTrialFilterTab('active'); // Switch to active tab so user sees it immediately
      alert(`Trial Code Generated & Saved to Active List!\n\nGenerated Trial Code: ${randomTrialCode}\nAttached Actual Key: ${savedKey}\n\nGive the Trial Code (${randomTrialCode}) to the user.`);
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
  const handleSaveCoupon = async () => {
    if (!couponCodeInput.trim() || couponValueInput <= 0) return;
    await pushData('coupons', {
      code: couponCodeInput.trim().toUpperCase(),
      type: couponTypeInput,
      value: couponValueInput,
      minOrderValue: couponMinOrderInput || 0,
      expiryDate: couponExpiryInput || null,
      createdAt: Date.now()
    });
    setCouponCodeInput('');
    setCouponModalOpen(false);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm('Delete this coupon?')) {
      await deleteData(`coupons/${id}`);
    }
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
          { id: 'trials', label: 'Trial Keys', icon: Sparkles },
          { id: 'apk-links', label: 'APK Downloads', icon: Download },
          { id: 'coupons', label: 'Coupons', icon: Tag },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'settings', label: 'Settings', icon: SettingsIcon }
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
                  <Sparkles className="w-5 h-5 text-emerald-400" />
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
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Save Actual Key & Generate Random Trial Code</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enter the real key below. When you click generate, a random trial code (e.g., <span className="font-mono text-emerald-400">TRIAL-NOVA-8X92-A2K4</span>) will be generated for the user. When users enter that trial code, each user receives this actual key. The same Trial Code can be reused by unlimited users!
              </p>
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
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Trial Code</span>
                </button>
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

      {/* TAB CONTENT: PRODUCT APK DOWNLOAD LINKS */}
      {activeTab === 'apk-links' && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Product APK Download Links</h3>
                <p className="text-xs text-slate-400">Select a product and add unlimited APK/download links. Users will see only that product's links after payment or trial activation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product</label>
                <select value={apkLinkProductId} onChange={(e) => setApkLinkProductId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500">
                  <option value="">-- Select Product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Link Name</label>
                <input value={apkLinkNameInput} onChange={(e) => setApkLinkNameInput(e.target.value)} placeholder="Main APK / Android 64-bit / Old Version" className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">APK Download URL</label>
                <input type="url" value={apkLinkUrlInput} onChange={(e) => setApkLinkUrlInput(e.target.value)} placeholder="https://example.com/app.apk" className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Version (Optional)</label>
                <input value={apkLinkVersionInput} onChange={(e) => setApkLinkVersionInput(e.target.value)} placeholder="v2.4.0" className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex items-end">
                <button onClick={handleAddApkLink} className="w-full py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all">
                  <Plus className="w-4 h-4 inline mr-1" /> Add APK Download Link
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{product.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{product.apkLinks?.length || 0} APK link(s)</p>
                  </div>
                  <button onClick={() => setApkLinkProductId(product.id)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300">Select</button>
                </div>
                {(product.apkLinks || []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">No product-specific APK links yet.</div>
                ) : (
                  <div className="space-y-2">
                    {(product.apkLinks || []).map(link => (
                      <div key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950/70 border border-slate-800 p-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">{link.name}</span>
                            {link.version && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">{link.version}</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-full sm:max-w-[620px] mt-1">{link.url}</div>
                        </div>
                        <button onClick={() => handleDeleteApkLink(product, link.id)} className="shrink-0 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400" title="Delete APK link">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-white">Discount Coupons</h3>
            <button
              onClick={() => setCouponModalOpen(true)}
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
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Expiry</th>
                  <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 whitespace-nowrap">{c.code}</td>
                    <td className="px-4 py-3.5 font-bold whitespace-nowrap">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">₹{c.minOrderValue || 0}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{c.expiryDate || 'No expiry'}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
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

      {/* MODAL: Coupon Add */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Coupon Code</h3>

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
