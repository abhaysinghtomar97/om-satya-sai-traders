// src/app/login/page.js
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      phone,
      password,
      redirect: false,
    });

    if (res?.error) {
      // Backend se aane wale error ko user ki chuni hui language mein dikhayein
      setError(
        lang === 'hi'
          ? 'गलत मोबाइल नंबर या पासवर्ड। कृपया पुनः प्रयास करें।'
          : 'Invalid mobile number or password. Please try again.'
      );
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 border border-green-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">{t.brandName}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.loginToAccount}</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.mobileNumber}
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.enterPhonePlaceholder}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.password}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? t.loggingIn : t.login}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          {t.dontHaveAccount}{' '}
          <Link href="/register" className="text-green-700 font-semibold hover:underline">
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
}