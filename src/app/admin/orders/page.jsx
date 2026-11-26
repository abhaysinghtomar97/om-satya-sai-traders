// src/app/admin/orders/page.js
'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminOrdersPage() {
  const { t, lang } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [driverInputs, setDriverInputs] = useState({});

  const loadOrders = async () => {
    const res = await fetch('/api/orders');
    if (res.ok) setOrders(await res.json());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const driverInfo = driverInputs[orderId] || {};
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        status: newStatus,
        ...driverInfo,
      }),
    });
    if (res.ok) loadOrders();
  };

  const getWhatsAppLink = (order) => {
    const msg = `Namaste ${order.user.name}, Om Satya Sai Traders se aapka Order #${order.orderNumber} (₹${order.totalAmount}) ab "${order.currentStatus}" status par hai.`;
    return `https://wa.me/91${order.user.phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t.manageOrders}</h1>

      {orders.map((order) => (
        <div key={order.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-3">
            <div>
              <span className="font-bold text-lg text-green-800">#{order.orderNumber}</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 font-semibold">
                {order.user.role}
              </span>
              <p className="text-sm font-medium mt-1">
                {order.user.shopName ? `${order.user.shopName} (${order.user.name})` : order.user.name} • 📞 {order.user.phone}
              </p>
              <p className="text-xs text-gray-500">📍 {order.shippingAddress}</p>
            </div>

            <div className="text-right space-y-2">
              <div className="text-xl font-extrabold text-gray-900">₹{order.totalAmount}</div>
              <a
                href={getWhatsAppLink(order)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                📲 {lang === 'hi' ? 'WhatsApp अपडेट भेजें' : 'Send WhatsApp Update'}
              </a>
            </div>
          </div>

          {/* Pipeline Status Control + Driver Details */}
          <div className="grid md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {lang === 'hi' ? 'ऑर्डर स्थिति बदलें' : 'Update Pipeline Status'}
              </label>
              <select
                value={order.currentStatus}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded bg-white font-semibold"
              >
                <option value="ORDER_PLACED">ORDER_PLACED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PACKED">PACKED</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Driver Name</label>
              <input
                type="text"
                defaultValue={order.driverName || ''}
                onChange={(e) =>
                  setDriverInputs({
                    ...driverInputs,
                    [order.id]: { ...driverInputs[order.id], driverName: e.target.value },
                  })
                }
                placeholder="Driver Name"
                className="w-full px-2 py-1.5 text-sm border rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Driver Phone</label>
              <input
                type="text"
                defaultValue={order.driverPhone || ''}
                onChange={(e) =>
                  setDriverInputs({
                    ...driverInputs,
                    [order.id]: { ...driverInputs[order.id], driverPhone: e.target.value },
                  })
                }
                placeholder="Phone"
                className="w-full px-2 py-1.5 text-sm border rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle No.</label>
              <input
                type="text"
                defaultValue={order.vehicleNumber || ''}
                onChange={(e) =>
                  setDriverInputs({
                    ...driverInputs,
                    [order.id]: { ...driverInputs[order.id], vehicleNumber: e.target.value },
                  })
                }
                placeholder="UP78 XX 1234"
                className="w-full px-2 py-1.5 text-sm border rounded bg-white"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}