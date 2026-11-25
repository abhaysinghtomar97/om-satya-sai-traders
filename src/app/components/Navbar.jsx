// src/components/Navbar.jsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { data: session } = useSession();
  const { lang, switchLanguage, t } = useLanguage();

  return (
    <nav className="bg-green-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo / Name */}
        <Link href="/" className="text-xl font-bold tracking-wide flex items-center gap-2">
          <span>🌱</span>
          <span>{t.brandName}</span>
        </Link>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-green-950 rounded-full p-0.5 border border-green-600 text-xs font-semibold">
            <button
              onClick={() => switchLanguage('hi')}
              className={`px-2.5 py-1 rounded-full transition ${
                lang === 'hi' ? 'bg-amber-400 text-green-950' : 'text-gray-200 hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => switchLanguage('en')}
              className={`px-2.5 py-1 rounded-full transition ${
                lang === 'en' ? 'bg-amber-400 text-green-950' : 'text-gray-200 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Auth & Role Links */}
          {session ? (
            <div className="flex items-center gap-3 text-sm">
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-1.5 rounded-lg"
                >
                  {t.adminDashboard}
                </Link>
              )}
              <Link href="/my-orders" className="hover:underline">
                {t.myOrders}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg border border-green-400 hover:bg-green-700"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-amber-400 text-green-950 font-semibold hover:bg-amber-300"
              >
                {t.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}