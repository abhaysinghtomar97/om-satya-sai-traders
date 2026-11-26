// src/app/my-orders/page.js
'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const PIPELINE_STEPS = [
  'ORDER_PLACED',
  'CONFIRMED',
  'PACKED',
  'DISPATCHED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export default function MyOrdersPage() {
  const { t, lang } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const getStatusLabel = (status) => {
    const map = {
      ORDER_PLACED: t.statusPlaced,
      CONFIRMED: t.statusConfirmed,
      PACKED: t.statusPacked,
      DISPATCHED: t.statusDispatched,
      OUT_FOR_DELIVERY: t.statusOutForDelivery,
      DELIVERED: t.statusDelivered,
      CANCELLED: lang === 'hi' ? 'रद्द किया गया' : 'Cancelled',
    };
    return map[status] || status;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t.myOrders}</h1>

      {orders.map((order) => {
        const currentStepIdx = PIPELINE_STEPS.indexOf(order.currentStatus);

        return (
          <div key={order.id} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center border-b pb-3 gap-2">
              <div>
                <span className="font-bold text-green-800 text-lg">#{order.orderNumber}</span>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Visual End-to-End Progress Pipeline */}
            {order.currentStatus !== 'CANCELLED' && (
              <div className="py-3 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[500px]">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const completed = idx <= currentStepIdx;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center relative">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                            completed ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {completed ? '✓' : idx + 1}
                        </div>
                        <span className="text-[11px] text-center mt-1.5 font-medium text-gray-700">
                          {getStatusLabel(step)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Transport / Driver Details if Dispatched */}
            {(order.driverName || order.vehicleNumber) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                🚚 <strong>{lang === 'hi' ? 'परिवहन विवरण:' : 'Transport Details:'}</strong>{' '}
                {order.driverName} ({order.driverPhone}) •{' '}
                {lang === 'hi' ? 'गाड़ी नं:' : 'Vehicle:'} {order.vehicleNumber}
              </div>
            )}

            {/* Items List */}
            <div className="text-sm text-gray-700 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.productName} ({item.packSize}) × {item.quantity}
                  </span>
                  <span className="font-semibold">₹{item.appliedPrice * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}