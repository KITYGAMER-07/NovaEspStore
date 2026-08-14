import { Order } from '../types';

export function downloadInvoiceTxt(order: Partial<Order> & { productName?: string; durationName?: string; licenseKey?: string }) {
  const orderId = order.orderId || 'ORD-' + Date.now();
  const paymentId = order.paymentId || 'PAY-N/A';
  const productName = order.productName || 'Digital Key';
  const durationName = order.durationName || 'Standard Access';
  const licenseKey = order.licenseKey || 'N/A';
  const originalPrice = order.originalPrice || 0;
  const discountAmount = order.discountAmount || 0;
  const finalAmount = order.finalAmount || 0;
  const couponCode = order.couponCode || null;
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
  const customerEmail = order.customerEmail || 'Guest Customer';

  const invoiceContent = `
================================================================
                    NOVAKEY - OFFICIAL INVOICE                  
================================================================
Store            : NovaKey Digital Store
Website          : https://novakey-store.app
Date             : ${dateStr}
----------------------------------------------------------------
TRANSACTION DETAILS
----------------------------------------------------------------
Order Reference  : ${orderId}
Payment ID       : ${paymentId}
Customer Email   : ${customerEmail}
Status           : PAID / VERIFIED
----------------------------------------------------------------
PURCHASED ITEM
----------------------------------------------------------------
Product          : ${productName}
Duration / Unit  : ${durationName}
Digital License  : ${licenseKey}
----------------------------------------------------------------
PAYMENT SUMMARY
----------------------------------------------------------------
Subtotal         : ₹${originalPrice.toFixed(2)}
${discountAmount > 0 ? `Discount Applied  : -₹${discountAmount.toFixed(2)}${couponCode ? ` (Coupon: ${couponCode})` : ''}\n` : ''}Grand Total Paid : ₹${finalAmount.toFixed(2)}
================================================================
Thank you for your purchase! 
Your digital license key is active and ready to be used.
Need support? Visit our Telegram or Contact us via Store Portal.
================================================================
  `.trim();

  const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice_${orderId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
