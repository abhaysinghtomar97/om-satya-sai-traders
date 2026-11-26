// src/app/cart/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { lang } = useLanguage();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        shippingAddress,
        paymentMethod,
      }),
    });

    if (res.ok) {
      clearCart();
      router.push('/my-orders');
    } else {
      const err = await res.json();
      alert(err.error || 'Order failed');
    }
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {lang === 'hi' ? 'आपका कार्ट खाली है' : 'Your Cart is Empty'}
        </h1>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2.5 bg-green-700 text-white rounded-lg font-semibold"
        >
          {lang === 'hi' ? 'खरीदारी शुरू करें' : 'Browse Products'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-3 gap-6">
      {/* Cart Items */}
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {lang === 'hi' ? 'आपका कार्ट' : 'Your Cart'}
        </h1>
        {cart.map((item) => (
          <div
            key={item.variantId}
            className="bg-white p-4 rounded-xl border flex items-center justify-between gap-4"
          >
            <div>
              <h3 className="font-bold text-gray-900">{item.productName}</h3>
              <p className="text-xs text-gray-500">
                {item.packSize} • ₹{item.price} / unit
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="w-8 h-8 border rounded font-bold"
              >
                -
              </button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="w-8 h-8 border rounded font-bold"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item.variantId)}
                className="ml-2 text-xs text-red-600 hover:underline"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Box */}
      <form onSubmit={handleCheckout} className="bg-white p-5 rounded-xl border h-fit space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">
          {lang === 'hi' ? 'ऑर्डर सारांश' : 'Order Summary'}
        </h2>
        <div className="flex justify-between text-lg font-extrabold text-green-800">
          <span>{lang === 'hi' ? 'कुल राशि:' : 'Total Amount:'}</span>
          <span>₹{cartTotal}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'hi' ? 'डिलीवरी का पूरा पता *' : 'Full Delivery Address *'}
          </label>
          <textarea
            required
            rows="3"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'गाँव/दुकान का नाम, तहसील, जिला, पिनकोड'
                : 'Village/Shop Name, Tehsil, District, Pincode'
            }
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'hi' ? 'भुगतान का तरीका' : 'Payment Method'}
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="COD">
              {lang === 'hi' ? 'कैश ऑन डिलीवरी (COD)' : 'Cash on Delivery (COD)'}
            </option>
            <option value="ONLINE_UPI">UPI / Online Transfer</option>
            {session?.user?.role === 'RETAILER' && session?.user?.isVerified && (
              <option value="CREDIT_LEDGER">
                {lang === 'hi' ? 'खाता / उधार (केवल सत्यापित दुकानदार)' : 'Shop Credit Ledger'}
              </option>
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg transition"
        >
          {loading
            ? lang === 'hi' ? 'ऑर्डर हो रहा है...' : 'Placing Order...'
            : lang === 'hi' ? 'ऑर्डर कन्फर्म करें' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}