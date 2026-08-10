import React, { useState, useEffect } from 'react';
import { 
  Product, 
  Duration, 
  Price, 
  LicenseKey, 
  Coupon, 
  Order, 
  Settings 
} from './types';
import { 
  subscribeToPath, 
  seedInitialDataIfEmpty 
} from './lib/firebase';
import { Navbar } from './components/Navbar';
import { StoreFront } from './components/StoreFront';
import { SuccessPage } from './components/SuccessPage';
import { OrderLookup } from './components/OrderLookup';
import { FaqPage } from './components/FaqPage';
import { ContactPage } from './components/ContactPage';
import { AdminPortal } from './components/AdminPortal';
import { Key, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentSection, setCurrentSection] = useState<string>('home');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Database Collections State
  const [products, setProducts] = useState<Product[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings>({
    razorpayKeyId: 'rzp_test_5dd3025e9aa2',
    adminUsername: 'admin',
    adminPassword: 'password123',
    apkUrl: 'https://github.com/novaesp/releases/releases/download/v2.4/NovaEsp_v2.4.apk',
    apkAppName: 'NovaEsp Android VIP Loader',
    apkVersion: 'v2.4.0',
    telegramUrl: 'https://t.me/KITYGAMEROFFICIAL'
  });

  // Seed DB if empty on mount and setup Realtime Listeners
  useEffect(() => {
    seedInitialDataIfEmpty();

    // 1. Subscribe Products
    const unsubProducts = subscribeToPath<Record<string, Omit<Product, 'id'>>>('products', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val } as Product));
        setProducts(list);
      } else {
        setProducts([]);
      }
    });

    // 2. Subscribe Durations
    const unsubDurations = subscribeToPath<Record<string, Omit<Duration, 'id'>>>('durations', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val } as Duration));
        setDurations(list);
      } else {
        setDurations([]);
      }
    });

    // 3. Subscribe Prices
    const unsubPrices = subscribeToPath<Record<string, Omit<Price, 'id'>>>('prices', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val } as Price));
        setPrices(list);
      } else {
        setPrices([]);
      }
    });

    // 4. Subscribe License Keys
    const unsubKeys = subscribeToPath<Record<string, Omit<LicenseKey, 'id'>>>('licenseKeys', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val } as LicenseKey));
        setLicenseKeys(list);
      } else {
        setLicenseKeys([]);
      }
    });

    // 5. Subscribe Coupons
    const unsubCoupons = subscribeToPath<Record<string, Omit<Coupon, 'id'>>>('coupons', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val } as Coupon));
        setCoupons(list);
      } else {
        setCoupons([]);
      }
    });

    // 6. Subscribe Orders
    const unsubOrders = subscribeToPath<Record<string, Omit<Order, 'id'>>>('orders', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val } as Order));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(list);
      } else {
        setOrders([]);
      }
    });

    // 7. Subscribe Settings
    const unsubRzpSettings = subscribeToPath<{ keyId: string }>('settings/razorpay', (rzp) => {
      if (rzp?.keyId) {
        setSettings(prev => ({ ...prev, razorpayKeyId: rzp.keyId }));
      }
    });

    const unsubAdminSettings = subscribeToPath<{ username?: string; password?: string }>('settings/admin', (adm) => {
      if (adm) {
        setSettings(prev => ({
          ...prev,
          adminUsername: adm.username || 'admin',
          adminPassword: adm.password || 'password123'
        }));
      }
    });

    const unsubApkSettings = subscribeToPath<{ url?: string; appName?: string; version?: string }>('settings/apk', (apk) => {
      if (apk) {
        setSettings(prev => ({
          ...prev,
          apkUrl: apk.url || '',
          apkAppName: apk.appName || 'NovaEsp Loader',
          apkVersion: apk.version || 'v2.4'
        }));
      }
    });

    return () => {
      unsubProducts();
      unsubDurations();
      unsubPrices();
      unsubKeys();
      unsubCoupons();
      unsubOrders();
      unsubRzpSettings();
      unsubAdminSettings();
      unsubApkSettings();
    };
  }, []);

  // Order Success Callback
  const handleOrderSuccess = (order: Order) => {
    setLastOrder(order);
    setCurrentSection('success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden w-full max-w-full">
      
      {/* Top Header Navbar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={(sec) => setCurrentSection(sec)}
        isAdmin={isAdminLoggedIn}
        onAdminLogout={() => {
          setIsAdminLoggedIn(false);
          setCurrentSection('home');
        }}
        telegramUrl={settings.telegramUrl || 'https://t.me/KITYGAMEROFFICIAL'}
        telegramSupportUrl="https://t.me/KITYGAMER"
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {currentSection === 'home' && (
          <StoreFront
            products={products}
            durations={durations}
            prices={prices}
            licenseKeys={licenseKeys}
            coupons={coupons}
            razorpayKeyId={settings.razorpayKeyId}
            telegramUrl={settings.telegramUrl}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentSection === 'success' && lastOrder && (
          <SuccessPage
            order={lastOrder}
            apkUrl={settings.apkUrl}
            apkAppName={settings.apkAppName}
            apkVersion={settings.apkVersion}
            onReturnHome={() => setCurrentSection('home')}
          />
        )}

        {currentSection === 'lookup' && (
          <OrderLookup orders={orders} />
        )}

        {currentSection === 'faq' && (
          <FaqPage />
        )}

        {currentSection === 'contact' && (
          <ContactPage 
            telegramUrl={settings.telegramUrl} 
            telegramGroupUrl="https://t.me/KITYGAMEROFFICIAL"
            telegramSupportUrl="https://t.me/KITYGAMER"
          />
        )}

        {(currentSection === 'admin' || currentSection === 'admin-login') && (
          <AdminPortal
            products={products}
            durations={durations}
            prices={prices}
            licenseKeys={licenseKeys}
            coupons={coupons}
            orders={orders}
            settings={settings}
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminLoginSuccess={() => {
              setIsAdminLoggedIn(true);
              setCurrentSection('admin');
            }}
            onAdminLogout={() => {
              setIsAdminLoggedIn(false);
              setCurrentSection('home');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">NovaKey Store</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setCurrentSection('home')} className="hover:text-white transition-colors">Store</button>
            <button onClick={() => setCurrentSection('lookup')} className="hover:text-white transition-colors">Track Order</button>
            <button onClick={() => setCurrentSection('faq')} className="hover:text-white transition-colors">FAQ</button>
            <button onClick={() => setCurrentSection('contact')} className="hover:text-white transition-colors">Support</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
