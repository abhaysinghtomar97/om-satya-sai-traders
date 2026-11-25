// src/app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang } = useLanguage(); // Language hook
  const [role, setRole] = useState('FARMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    shopName: '',
    gstNumber: '',
    licenseNumber: '',
    villageOrCity: '',
    district: '',
    pincode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role, lang }), // lang bhi API ko bhejein
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.somethingWentWrong);
      } else {
        setSuccess(role === 'RETAILER' ? t.retailerSuccessMsg : t.farmerSuccessMsg);
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 border border-green-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">{t.brandName}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.createNewAccount}</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setRole('FARMER')}
            className={`py-2 text-sm font-semibold rounded-md transition ${
              role === 'FARMER'
                ? 'bg-green-700 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🌾 {t.farmer}
          </button>
          <button
            type="button"
            onClick={() => setRole('RETAILER')}
            className={`py-2 text-sm font-semibold rounded-md transition ${
              role === 'RETAILER'
                ? 'bg-green-700 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏪 {t.retailer}
          </button>
        </div>

        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        {success && <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-lg">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.fullName} *</label>
            <input
              type="text"
              name="name"
              required
              onChange={handleChange}
              placeholder={lang === 'hi' ? 'उदा. रमेश कुमार' : 'e.g., Ramesh Kumar'}
              className="mt-1 w-full  text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.mobileNumber} *</label>
            <input
              type="tel"
              name="phone"
              required
              onChange={handleChange}
              placeholder={lang === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
              className="mt-1 w-full px-3 text-black py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.password} *</label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              placeholder={lang === 'hi' ? 'कम से कम 6 अक्षर' : 'Minimum 6 characters'}
              className="mt-1 w-full px-3 py-2 text-black border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          {/* Retailer Specific Fields */}
          {role === 'RETAILER' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-amber-800 uppercase">
                {t.shopDetailsHeader}
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-700">{t.shopName} *</label>
                <input
                  type="text"
                  name="shopName"
                  required
                  onChange={handleChange}
                  placeholder={lang === 'hi' ? 'उदा. किसान खाद भंडार' : 'e.g., Kisan Khad Bhandar'}
                  className="mt-1 w-full px-3 text-black py-2 text-sm border rounded-lg bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">{t.licenseNumber} *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    required
                    onChange={handleChange}
                    placeholder={lang === 'hi' ? 'लाइसेंस नं.' : 'License No.'}
                    className="mt-1 w-full text-black px-3 py-2 text-sm border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">{t.gstNumber}</label>
                  <input
                    type="text"
                    name="gstNumber"
                    onChange={handleChange}
                    placeholder="09XXXXX..."
                    className="mt-1 w-full px-3 text-black py-2 text-sm border rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Address Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">{t.villageCity} *</label>
              <input
                type="text"
                name="villageOrCity"
                required
                onChange={handleChange}
                className="mt-1 w-full px-3 text-black py-2 text-sm border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">{t.district} *</label>
              <input
                type="text"
                name="district"
                required
                onChange={handleChange}
                className="mt-1 w-full px-3 text-black py-2 text-sm border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">{t.pincode} *</label>
            <input
              type="text"
              name="pincode"
              required
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 text-black text-sm border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? t.registering : t.createAccount}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          {t.alreadyHaveAccount}{' '}
          <Link href="/login" className="text-green-700 font-semibold hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}