// src/app/admin/page.js
'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminDashboard() {
  const { t, lang } = useLanguage();

  const cards = [
    {
      title: t.addNewProduct,
      desc: lang === 'hi' ? 'नए बीज, कीटनाशक और उनके थोक/खुदरा रेट जोड़ें' : 'Add new seeds, pesticides, and set dual pricing',
      href: '/admin/products/new',
      icon: '➕',
      color: 'bg-green-50 border-green-200 text-green-900',
    },
    {
      title: t.verifyRetailers,
      desc: lang === 'hi' ? 'नए दुकानदारों के लाइसेंस जांचें और स्वीकृत करें' : 'Review shop licenses and approve wholesale accounts',
      href: '/admin/retailers',
      icon: '🏪',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      title: t.manageOrders,
      desc: lang === 'hi' ? 'आने वाले ऑर्डर देखें और डिलीवरी स्टेटस अपडेट करें' : 'Process orders and update end-to-end delivery tracking',
      href: '/admin/orders',
      icon: '🚚',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.adminDashboard}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition ${card.color}`}
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h2 className="text-lg font-bold mb-1">{card.title}</h2>
            <p className="text-sm opacity-80">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}