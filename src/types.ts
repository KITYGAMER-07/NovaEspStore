export interface Product {
  id: string;
  name: string;
  enabled: boolean;
  icon?: string;
  description?: string;
  category?: string;
  createdAt?: number;
}

export interface Duration {
  id: string;
  productId: string;
  name: string;
  unit: 'hours' | 'days' | 'weeks' | 'months' | 'years';
  createdAt?: number;
}

export interface Price {
  id: string;
  productId: string;
  durationId: string;
  price: number;
  createdAt?: number;
}

export interface LicenseKey {
  id: string;
  productId: string;
  durationId: string;
  key: string;
  used: boolean;
  usedAt?: number;
  orderId?: string;
  createdAt?: number;
}

export interface TrialKey {
  id: string;
  productId: string;
  durationName?: string;
  trialCode: string;
  actualKey: string;
  key?: string; // Fallback for backwards compatibility
  used: boolean;
  usedByEmail?: string;
  usedAt?: number;
  usageCount?: number;
  lastUsedByEmail?: string;
  lastUsedAt?: number;
  createdAt?: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  expiryDate?: string | null;
  createdAt?: number;
}

export interface Order {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  durationId: string;
  durationName: string;
  originalPrice: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string | null;
  licenseKey: string;
  paymentId: string;
  status: 'paid' | 'failed' | 'pending';
  customerEmail?: string;
  createdAt: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  gateway: string;
  status: 'success' | 'failed';
  createdAt: number;
}

export interface Settings {
  razorpayKeyId: string;
  adminUsername: string;
  adminPassword: string;
  apkUrl: string;
  apkAppName?: string;
  apkVersion?: string;
  telegramUrl?: string;
}

export interface StockSummary {
  productId: string;
  productName: string;
  durationId: string;
  durationName: string;
  total: number;
  active: number;
  used: number;
}
