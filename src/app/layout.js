// src/app/layout.js
import './globals.css';
import AuthProvider from './components/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from './components/Navbar';
import { CartProvider } from '@/context/CartContext';
export const metadata = {
  title: 'Om Satya Sai Traders | Seeds, Pesticides & Fertilizers',
  description: 'Wholesale and Retail Agricultural Store for Farmers and Retailers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <Navbar />
              <main className="grow">{children}</main>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}