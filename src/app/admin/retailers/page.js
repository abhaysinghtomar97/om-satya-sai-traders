// src/app/admin/retailers/page.js
'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function VerifyRetailersPage() {
  const { t, lang } = useLanguage();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRetailers = async () => {
    const res = await fetch('/api/admin/retailers');
    if (res.ok) {
      setRetailers(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  const toggleVerification = async (userId, currentStatus) => {
    const res = await fetch('/api/admin/retailers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isVerified: !currentStatus }),
    });
    if (res.ok) {
      fetchRetailers();
    }
  };

  if (loading) {
    return <div className="p-8 text-center">{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.verifyRetailers}</h1>

      {retailers.length === 0 ? (
        <p className="text-gray-500">
          {lang === 'hi' ? 'अभी तक कोई दुकानदार पंजीकृत नहीं है।' : 'No retailers registered yet.'}
        </p>
      ) : (
        <div className="space-y-4">
          {retailers.map((r) => (
            <div
              key={r.id}
              className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{r.shopName || r.name}</h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      r.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.isVerified
                      ? lang === 'hi' ? 'सत्यापित (Verified)' : 'Verified'
                      : lang === 'hi' ? 'लंबित (Pending)' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>{lang === 'hi' ? 'मालिक:' : 'Owner:'}</strong> {r.name} |{' '}
                  <strong>{t.mobileNumber}:</strong> {r.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>{t.licenseNumber}:</strong> {r.licenseNumber || 'N/A'} |{' '}
                  <strong>GST:</strong> {r.gstNumber || 'N/A'}
                </p>
                {r.addresses?.[0] && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {r.addresses[0].villageOrCity}, {r.addresses[0].district} - {r.addresses[0].pincode}
                  </p>
                )}
              </div>

              <button
                onClick={() => toggleVerification(r.id, r.isVerified)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  r.isVerified
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-700 text-white hover:bg-green-800'
                }`}
              >
                {r.isVerified
                  ? lang === 'hi' ? 'सत्यापन रद्द करें' : 'Revoke Access'
                  : lang === 'hi' ? 'दुकानदार स्वीकृत करें' : 'Approve Retailer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}