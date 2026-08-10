import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Clock, 
  Lock, 
  Send, 
  ArrowRight,
  Gift,
  HelpCircle,
  Copy,
  Info
} from 'lucide-react';
import { Product, Duration, Price, LicenseKey, Coupon, Order } from '../types';
import { pushData, updateData } from '../lib/firebase';

interface StoreFrontProps {
  products: Product[];
  durations: Duration[];
  prices: Price[];
  licenseKeys: LicenseKey[];
  coupons: Coupon[];
  razorpayKeyId: string;
  telegramUrl?: string;
  onOrderSuccess: (order: Order) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const StoreFront: React.FC<StoreFrontProps> = ({
  products,
  durations,
  prices,
  licenseKeys,
  coupons,
  razorpayKeyId,
  telegramUrl,
  onOrderSuccess
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedDurationId, setSelectedDurationId] = useState<string>('');
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showDemoGatewayModal, setShowDemoGatewayModal] = useState<boolean>(false);

  // Active enabled products
  const enabledProducts = products.filter(p => p.enabled !== false);

  // Durations for selected product
  const availableDurations = durations.filter(d => d.productId === selectedProductId);

  // Find price for product + duration
  const currentPriceObj = prices.find(
    p => p.productId === selectedProductId && p.durationId === selectedDurationId
  );
  const currentPrice = currentPriceObj ? currentPriceObj.price : 0;

  // Available keys count for product + duration
  const availableKeysCount = licenseKeys.filter(
    k => k.productId === selectedProductId && k.durationId === selectedDurationId && !k.used
  ).length;

  // Selected Product & Duration objects
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedDuration = durations.find(d => d.id === selectedDurationId);

  // Reset duration and coupon when product changes
  useEffect(() => {
    setSelectedDurationId('');
    setAppliedCoupon(null);
    setCouponMessage(null);
  }, [selectedProductId]);

  // Re-validate coupon if duration or price changes
  useEffect(() => {
    if (appliedCoupon && currentPrice > 0) {
      if (appliedCoupon.minOrderValue && currentPrice < appliedCoupon.minOrderValue) {
        setAppliedCoupon(null);
        setCouponMessage({
          type: 'warning',
          text: `Coupon removed — requires minimum order of ₹${appliedCoupon.minOrderValue}`
        });
      }
    }
  }, [selectedDurationId, currentPrice]);

  // Calculate Discounts
  let discountAmount = 0;
  if (appliedCoupon && currentPrice > 0) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((currentPrice * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  const finalAmount = Math.max(0, currentPrice - discountAmount);

  // Coupon Handler
  const handleApplyCoupon = () => {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon(null);
      setCouponMessage(null);
      return;
    }

    if (!selectedProductId || !selectedDurationId || currentPrice <= 0) {
      setCouponMessage({
        type: 'error',
        text: 'Please select a product and duration first.'
      });
      return;
    }

    const matchedCoupon = coupons.find(c => c.code.toUpperCase() === code);
    if (!matchedCoupon) {
      setAppliedCoupon(null);
      setCouponMessage({ type: 'error', text: 'Invalid coupon code.' });
      return;
    }

    // Check expiry date
    if (matchedCoupon.expiryDate) {
      const expDate = new Date(matchedCoupon.expiryDate);
      expDate.setHours(23, 59, 59, 999);
      if (expDate < new Date()) {
        setAppliedCoupon(null);
        setCouponMessage({ type: 'error', text: 'Coupon code has expired.' });
        return;
      }
    }

    // Check minimum order value
    const minVal = matchedCoupon.minOrderValue || 0;
    if (currentPrice < minVal) {
      setAppliedCoupon(null);
      setCouponMessage({
        type: 'error',
        text: `Minimum order value of ₹${minVal} required for this coupon.`
      });
      return;
    }

    // Apply valid coupon
    setAppliedCoupon(matchedCoupon);
    const savings = matchedCoupon.type === 'percentage'
      ? Math.round((currentPrice * matchedCoupon.value) / 100)
      : matchedCoupon.value;
    setCouponMessage({
      type: 'success',
      text: `Coupon applied! You saved ₹${savings}.`
    });
  };

  // Process Successful Order Fulfillment
  const handleFulfillOrder = async (paymentId: string) => {
    if (!selectedProduct || !selectedDuration) return;

    setIsProcessing(true);
    try {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      // 1. Find unused key
      const unusedKeyObj = licenseKeys.find(
        k => k.productId === selectedProductId && k.durationId === selectedDurationId && !k.used
      );

      const assignedKey = unusedKeyObj ? unusedKeyObj.key : 'NO-KEY-AVAILABLE-CONTACT-ADMIN';

      // 2. Mark key as used in DB if found
      if (unusedKeyObj) {
        await updateData(`licenseKeys/${unusedKeyObj.id}`, {
          used: true,
          usedAt: Date.now(),
          orderId: orderId
        });
      }

      // 3. Create Order document
      const orderPayload: Order = {
        id: '',
        orderId,
        productId: selectedProductId,
        productName: selectedProduct.name,
        durationId: selectedDurationId,
        durationName: `${selectedDuration.name} (${selectedDuration.unit})`,
        originalPrice: currentPrice,
        discountAmount,
        finalAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        licenseKey: assignedKey,
        paymentId: paymentId,
        status: 'paid',
        customerEmail: customerEmail.trim() || 'Guest Customer',
        createdAt: Date.now()
      };

      const orderKey = await pushData('orders', orderPayload);
      orderPayload.id = orderKey;

      // 4. Save Payment Record
      await pushData('payments', {
        orderId,
        paymentId,
        amount: finalAmount,
        gateway: 'razorpay',
        status: 'success',
        createdAt: Date.now()
      });

      setIsProcessing(false);
      onOrderSuccess(orderPayload);
    } catch (err) {
      console.error('Order fulfillment error:', err);
      setIsProcessing(false);
      alert('Order processed, but error updating database. Please contact support.');
    }
  };

  // Initiate Payment
  const handleInitiatePayment = () => {
    if (!selectedProductId || !selectedDurationId || finalAmount <= 0) return;

    if (availableKeysCount <= 0) {
      alert('Selected item is currently out of stock. Please select another duration or product.');
      return;
    }

    // Check if Razorpay script is loaded and Key ID is configured
    if (typeof window.Razorpay !== 'undefined' && razorpayKeyId && razorpayKeyId.startsWith('rzp_')) {
      const options = {
        key: razorpayKeyId,
        amount: finalAmount * 100, // Razorpay works in paise
        currency: 'INR',
        name: selectedProduct?.name || 'NovaKey Store',
        description: `${selectedProduct?.name} - ${selectedDuration?.name} Pass`,
        handler: function (response: any) {
          handleFulfillOrder(response.razorpay_payment_id || 'PAY_' + Date.now());
        },
        prefill: {
          email: customerEmail || 'customer@novakey.app'
        },
        theme: {
          color: '#10b981'
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          alert('Payment Failed: ' + (response.error?.description || 'Transaction cancelled.'));
        });
        rzp.open();
      } catch (e) {
        console.warn('Razorpay popup blocked or failed, opening test gateway option:', e);
        setShowDemoGatewayModal(true);
      }
    } else {
      // Show simulated instant checkout popup for testing / preview mode
      setShowDemoGatewayModal(true);
    }
  };

  return (
    <div className="relative py-8 sm:py-12 overflow-x-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Hero Tagline */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Delivery License Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            NovaEsp Licence key <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Checkout</span>
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Select your software or gaming pass below. Receive your original license key immediately upon payment.
          </p>
        </div>

        {/* Store Purchase Card */}
        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/20">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Form Column */}
            <div className="md:col-span-7 space-y-6">

              {/* 1. Product Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                  <span>1. Choose Product</span>
                  {selectedProduct && (
                    <span className="text-[10px] normal-case font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedProduct.category || 'Software'}
                    </span>
                  )}
                </label>

                <div className="relative">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white font-medium text-sm rounded-2xl p-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    <option value="">Select Product</option>
                    {enabledProducts.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>

                {selectedProduct && selectedProduct.description && (
                  <p className="mt-2 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                    <Info className="w-3.5 h-3.5 text-emerald-400 inline mr-1.5" />
                    {selectedProduct.description}
                  </p>
                )}
              </div>

              {/* 2. Duration Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                  <span>2. Select Access Duration</span>
                  {selectedDurationId && availableKeysCount > 0 && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      In Stock
                    </span>
                  )}
                </label>

                <div className="relative">
                  <select
                    disabled={!selectedProductId}
                    value={selectedDurationId}
                    onChange={(e) => setSelectedDurationId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white font-medium text-sm rounded-2xl p-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedProductId ? 'Choose a product first' : 'Select Duration'}
                    </option>
                    {availableDurations.map((dur) => {
                      const durPriceObj = prices.find(
                        p => p.productId === selectedProductId && p.durationId === dur.id
                      );
                      const unitStr = dur.unit ? dur.unit.charAt(0).toUpperCase() + dur.unit.slice(1) : '';
                      const priceLabel = durPriceObj ? ` — ₹${durPriceObj.price}` : '';
                      return (
                        <option key={dur.id} value={dur.id}>
                          {dur.name} ({unitStr}){priceLabel}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                {/* Stock Warning Notice */}
                {selectedProductId && selectedDurationId && availableKeysCount === 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Out of stock for this duration. Please pick another option or contact support.</span>
                  </div>
                )}
              </div>

              {/* 3. Coupon Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  3. Coupon Code (Optional)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white font-mono text-sm uppercase rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <Tag className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all active:scale-95"
                  >
                    Apply
                  </button>
                </div>

                {couponMessage && (
                  <div className={`mt-2 text-xs flex items-center gap-1.5 font-medium ${
                    couponMessage.type === 'success' ? 'text-emerald-400' :
                    couponMessage.type === 'warning' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {couponMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                     couponMessage.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {couponMessage.text}
                  </div>
                )}
              </div>

              {/* 4. Customer Email Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  4. Email Address (Optional for Receipt)
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

            </div>

            {/* Right Summary Column */}
            <div className="md:col-span-5 flex flex-col justify-between bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
                  <span>Order Summary</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h3>

                <div className="space-y-3 text-xs mb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Product</span>
                    <span className="text-white font-semibold text-right">
                      {selectedProduct ? selectedProduct.name : 'Not selected'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Duration</span>
                    <span className="text-white font-semibold">
                      {selectedDuration ? `${selectedDuration.name} (${selectedDuration.unit})` : 'Not selected'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Base Price</span>
                    <span className="text-slate-200 font-mono font-medium">
                      ₹{currentPrice}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium pt-1 border-t border-slate-800/50">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="font-mono">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Delivery Mode</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Instant Key
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Display Box */}
              <div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mb-5 text-center">
                  <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Payable</span>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    {discountAmount > 0 && (
                      <span className="text-sm text-slate-500 line-through font-mono">
                        ₹{currentPrice}
                      </span>
                    )}
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                      ₹{finalAmount}
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={!selectedProductId || !selectedDurationId || finalAmount <= 0 || availableKeysCount <= 0 || isProcessing}
                  className="w-full group relative flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Generating License...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Complete Purchase</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="mt-3 text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Encrypted & Secured by Razorpay Gateway
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instant Delivery</h4>
              <p className="text-[11px] text-slate-400">License key revealed in &lt; 2 seconds</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Genuine</h4>
              <p className="text-[11px] text-slate-400">Verified & tested active key stock</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Invoice Included</h4>
              <p className="text-[11px] text-slate-400">Download printable receipt anytime</p>
            </div>
          </div>
        </div>

      </div>

      {/* Demo Checkout Gateway Modal (Fallback if Razorpay Popup or test mode) */}
      {showDemoGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Razorpay Checkout Sandbox</h3>
              <p className="mt-1 text-xs text-slate-400">
                You are purchasing <strong className="text-white">{selectedProduct?.name}</strong> ({selectedDuration?.name}).
              </p>

              <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Merchant:</span>
                  <span className="text-white font-medium">NovaKey Store</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Amount:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">₹{finalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Customer:</span>
                  <span className="text-slate-300 font-mono">{customerEmail || 'Guest'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDemoGatewayModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDemoGatewayModal(false);
                    handleFulfillOrder('PAY_DEMO_' + Date.now());
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Simulate Payment Success
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
