import React, { useState, useEffect } from 'react';
import { 
  Product, 
  Duration, 
  Price, 
  LicenseKey, 
  TrialKey,
  Coupon, 
  Order, 
  Settings,
  PreBooking,
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
  const [focusPreBooking, setFocusPreBooking] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Database Collections State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
  const [trialKeys, setTrialKeys] = useState<TrialKey[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [preBookings, setPreBookings] = useState<PreBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings>({
    razorpayKeyId: 'rzp_test_5dd3025e9aa2',
    adminUsername: 'admin',
    adminPassword: 'password123',
    apkUrl: 'https://github.com/novaesp/releases/releases/download/v2.4/NovaEsp_v2.4.apk',
    apkAppName: 'NovaEsp Android VIP Loader',
    apkVersion: 'v2.4.0',
    telegramUrl: 'https://t.me/KITYGAMEROFFICIAL',
    setupChannelUrl: '',
    websiteLogoUrl: '/logo.jpg',
    websiteName: 'NovaEsp',
    navbarStoreText: 'Store',
    navbarRulesText: 'Follow Rules',
    navbarTrackText: 'Track Order',
    navbarFaqText: 'FAQ',
    navbarSupportText: 'Support',
    navbarTelegramText: 'Telegram Support',
    navbarAdminText: 'Admin',
    navbarMenuText: 'Menu',
    navbarCloseText: 'Close',
    navbarTagline: 'Instant Digital License & Key Portal',
    navbarStoreDescription: 'Products & Licenses',
    navbarRulesDescription: 'Flag Ban Safety',
    navbarTrackDescription: 'Find Key by Order ID',
    navbarFaqDescription: 'Frequently Asked Questions',
    navbarSupportDescription: 'Contact & Ticket',
    navbarTelegramDescription: 't.me/KITYGAMER',
    navbarAdminDescription: 'Login to Control Panel',
    rulesTitle: 'Follow Rules',
    rulesSubtitle: 'Flag Ban Safety Notice',
    rulesDoneText: 'Done & Close',
    heroEyebrow: 'Auto-Delivery License Portal',
    heroTitle: 'NovaEsp Licence key Checkout',
    heroSubtitle: 'Select your software or gaming pass below. Receive your original license key immediately upon payment.',
    maintenanceEnabled: false,
    maintenanceTitle: 'Website Under Maintenance',
    maintenanceMessage: 'We are currently updating the website. Please check back soon.',
    maintenanceContactText: 'Contact Support',
    maintenanceContactUrl: 'https://t.me/KITYGAMER',
    footerBrandText: 'NovaKey Store',
    footerCopyrightText: 'All rights reserved.',
    productLogos: {}
  });

  // Seed DB if empty on mount and setup Realtime Listeners
  useEffect(() => {
    seedInitialDataIfEmpty();

    // Set loading false after initial fetch tick
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    // 1. Subscribe Products
    const unsubProducts = subscribeToPath<Record<string, Omit<Product, 'id'>>>('products', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...val, id } as Product));
        setProducts(list);
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    });

    // 2. Subscribe Durations
    const unsubDurations = subscribeToPath<Record<string, Omit<Duration, 'id'>>>('durations', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...val, id } as Duration));
        setDurations(list);
      } else {
        setDurations([]);
      }
    });

    // 3. Subscribe Prices
    const unsubPrices = subscribeToPath<Record<string, Omit<Price, 'id'>>>('prices', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...val, id } as Price));
        setPrices(list);
      } else {
        setPrices([]);
      }
    });

    // 4. Subscribe License Keys
    const unsubKeys = subscribeToPath<Record<string, Omit<LicenseKey, 'id'>>>('licenseKeys', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...val, id } as LicenseKey));
        setLicenseKeys(list);
      } else {
        setLicenseKeys([]);
      }
    });

    // 5. Subscribe Trial Keys
    const unsubTrialKeys = subscribeToPath<Record<string, Omit<TrialKey, 'id'>>>('trialKeys', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...val, id } as TrialKey));
        setTrialKeys(list);
      } else {
        setTrialKeys([]);
      }
    });

    // 6. Subscribe Coupons
    const unsubCoupons = subscribeToPath<Record<string, Omit<Coupon, 'id'>>>('coupons', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...val, id } as Coupon));
        setCoupons(list);
      } else {
        setCoupons([]);
      }
    });

    // 7. Subscribe Pre-Bookings
    const unsubPreBookings = subscribeToPath<Record<string, Omit<PreBooking, 'id'>>>('preBookings', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...val, id } as PreBooking));
        setPreBookings(list);
      } else {
        setPreBookings([]);
      }
    });

    // 7. Subscribe Orders
    const unsubOrders = subscribeToPath<Record<string, Omit<Order, 'id'>>>('orders', (data) => {
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...val, id } as Order));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(list);
      } else {
        setOrders([]);
      }
    });

    // 8. Subscribe Settings
    const unsubRzpSettings = subscribeToPath<{ keyId?: string }>('settings/razorpay', (rzp) => {
      setSettings(prev => ({ ...prev, razorpayKeyId: rzp?.keyId ?? prev.razorpayKeyId }));
    });

    const unsubAdminSettings = subscribeToPath<{ username?: string; password?: string }>('settings/admin', (adm) => {
      setSettings(prev => ({
        ...prev,
        adminUsername: adm?.username ?? 'admin',
        adminPassword: adm?.password ?? 'password123'
      }));
    });

    const unsubWebsiteSettings = subscribeToPath<Partial<Settings>>('settings/website', (website) => {
      if (website) setSettings(prev => ({ ...prev, ...website }));
    });

    const unsubSetupSettings = subscribeToPath<{ channelUrl?: string }>('settings/setup', (setup) => {
      setSettings(prev => ({ ...prev, setupChannelUrl: setup?.channelUrl ?? '' }));
    });

    const unsubApkSettings = subscribeToPath<{ url?: string; appName?: string; version?: string }>('settings/apk', (apk) => {
      setSettings(prev => ({
        ...prev,
        apkUrl: apk?.url ?? '',
        apkAppName: apk?.appName ?? 'NovaEsp Android VIP Loader',
        apkVersion: apk?.version ?? 'v2.4.0'
      }));
    });

    return () => {
      unsubProducts();
      unsubDurations();
      unsubPrices();
      unsubKeys();
      unsubTrialKeys();
      unsubCoupons();
      unsubPreBookings();
      unsubOrders();
      unsubRzpSettings();
      unsubAdminSettings();
      unsubApkSettings();
      unsubWebsiteSettings();
      unsubSetupSettings();
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
        onNavigate={(sec) => {
          if (sec === 'prebooking') {
            setFocusPreBooking(true);
            setCurrentSection('home');
            return;
          }
          setCurrentSection(sec);
        }}
        isAdmin={isAdminLoggedIn}
        onAdminLogout={() => {
          setIsAdminLoggedIn(false);
          setCurrentSection('home');
        }}
        telegramUrl={settings.telegramUrl || 'https://t.me/KITYGAMEROFFICIAL'}
        telegramSupportUrl="https://t.me/KITYGAMER"
        websiteName={settings.websiteName}
        websiteLogoUrl={settings.websiteLogoUrl}
        navbarStoreText={settings.navbarStoreText}
        navbarRulesText={settings.navbarRulesText}
        navbarTrackText={settings.navbarTrackText}
        navbarFaqText={settings.navbarFaqText}
        navbarSupportText={settings.navbarSupportText}
        navbarTelegramText={settings.navbarTelegramText}
        navbarAdminText={settings.navbarAdminText}
        navbarMenuText={settings.navbarMenuText}
        navbarCloseText={settings.navbarCloseText}
        navbarTagline={settings.navbarTagline}
        navbarStoreDescription={settings.navbarStoreDescription}
        navbarRulesDescription={settings.navbarRulesDescription}
        navbarTrackDescription={settings.navbarTrackDescription}
        navbarFaqDescription={settings.navbarFaqDescription}
        navbarSupportDescription={settings.navbarSupportDescription}
        navbarTelegramDescription={settings.navbarTelegramDescription}
        navbarAdminDescription={settings.navbarAdminDescription}
        rulesTitle={settings.rulesTitle}
        rulesSubtitle={settings.rulesSubtitle}
        rulesDoneText={settings.rulesDoneText}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {settings.maintenanceEnabled && currentSection !== 'admin' && currentSection !== 'admin-login' ? (
          <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-xl w-full text-center bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-white">{settings.maintenanceTitle ?? 'Website Under Maintenance'}</h1>
              <p className="mt-3 text-slate-400 leading-7">{settings.maintenanceMessage ?? 'We are currently updating the website. Please check back soon.'}</p>
              {settings.maintenanceContactUrl && (
                <a href={settings.maintenanceContactUrl} target="_blank" rel="noreferrer" className="inline-flex mt-7 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition">
                  {settings.maintenanceContactText ?? 'Contact Support'}
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
        {currentSection === 'home' && (
          <StoreFront
            products={products}
            durations={durations}
            prices={prices}
            licenseKeys={licenseKeys}
            trialKeys={trialKeys}
            coupons={coupons}
            preBookings={preBookings}
            razorpayKeyId={settings.razorpayKeyId}
            telegramUrl={settings.telegramUrl}
            apkUrl={settings.apkUrl}
            apkAppName={settings.apkAppName}
            apkVersion={settings.apkVersion}
            setupChannelUrl={settings.setupChannelUrl}
            websiteLogoUrl={settings.websiteLogoUrl}
            productLogos={settings.productLogos}
            focusPreBooking={focusPreBooking}
            onPreBookingFocusHandled={() => setFocusPreBooking(false)}
            heroEyebrow={settings.heroEyebrow}
            heroTitle={settings.heroTitle}
            heroSubtitle={settings.heroSubtitle}
            isLoading={isLoading}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentSection === 'success' && lastOrder && (
          <SuccessPage
            order={lastOrder}
            apkUrl={settings.apkUrl}
            apkAppName={settings.apkAppName}
            apkVersion={settings.apkVersion}
            apkLinks={products.find(p => p.id === lastOrder.productId)?.apkLinks || []}
            setupChannelUrl={settings.setupChannelUrl}
            productLogoUrl={settings.productLogos?.[lastOrder.productId] || settings.websiteLogoUrl}
            onReturnHome={() => setCurrentSection('home')}
          />
        )}

        {currentSection === 'lookup' && (
          <OrderLookup 
            orders={orders} 
            products={products}
            apkUrl={settings.apkUrl}
            apkAppName={settings.apkAppName}
            apkVersion={settings.apkVersion}
          />
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
            trialKeys={trialKeys}
            coupons={coupons}
            preBookings={preBookings}
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
        </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">{settings.footerBrandText ?? settings.websiteName ?? 'NovaKey Store'}</span>
            <span>&copy; {new Date().getFullYear()} {settings.footerCopyrightText ?? 'All rights reserved.'}</span>
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
