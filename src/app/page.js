// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { data: session } = useSession();
  const { t, lang } = useLanguage();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({}); // { productId: variantIndex }

  const isVerifiedRetailer =
    session?.user?.role === 'RETAILER' && session?.user?.isVerified === true;

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedCrop) params.append('crop', selectedCrop);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
      setLoading(false);
    }
    loadProducts();
  }, [selectedCategory, selectedCrop, session]);

  const categories = [
    { key: '', label: lang === 'hi' ? 'सभी उत्पाद' : 'All Products' },
    { key: 'SEEDS', label: t.seeds },
    { key: 'PESTICIDES', label: t.pesticides },
    { key: 'FERTILIZERS', label: t.fertilizers },
    { key: 'EQUIPMENT', label: t.equipment },
  ];

  const crops = [
    { key: 'Wheat', label: lang === 'hi' ? '🌾 गेहूँ (Wheat)' : '🌾 Wheat' },
    { key: 'Paddy', label: lang === 'hi' ? '🌱 धान (Paddy)' : '🌱 Paddy' },
    { key: 'Maize', label: lang === 'hi' ? '🌽 मक्का (Maize)' : '🌽 Maize' },
    { key: 'Vegetables', label: lang === 'hi' ? '🍅 सब्ज़ियाँ (Vegetables)' : '🍅 Vegetables' },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-green-900 to-green-700 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{t.brandName}</h1>
          <p className="text-green-100 text-base md:text-lg max-w-2xl mx-auto">{t.tagline}</p>

          {/* Role Status Pill */}
          {session?.user && (
            <div className="mt-4 inline-block bg-green-950/60 border border-green-400/40 px-4 py-1.5 rounded-full text-sm">
              {isVerifiedRetailer ? (
                <span className="text-amber-300 font-semibold">
                  🏪 {lang === 'hi' ? 'सत्यापित दुकानदार खाता: थोक दरें सक्रिय' : 'Verified Retailer Account: Wholesale Rates Active'}
                </span>
              ) : session.user.role === 'RETAILER' ? (
                <span className="text-amber-200">
                  ⏳ {lang === 'hi' ? 'दुकानदार सत्यापन लंबित है (अभी किसान दरें दिख रही हैं)' : 'Retailer Verification Pending (Showing Farmer Rates)'}
                </span>
              ) : (
                <span className="text-green-200">
                  🌾 {lang === 'hi' ? `स्वागत है, ${session.user.name}` : `Welcome, ${session.user.name}`}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Shop by Crop */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
            {t.shopByCrop}
          </h2>
          <div className="flex flex-wrap gap-2">
            {crops.map((crop) => (
              <button
                key={crop.key}
                onClick={() => setSelectedCrop(selectedCrop === crop.key ? '' : crop.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  selectedCrop === crop.key
                    ? 'bg-amber-500 text-black border-amber-600 font-bold'
                    : 'bg-white text-gray-700 hover:bg-green-50'
                }`}
              >
                {crop.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shop by Category */}
        <div className="mb-8 border-b pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
            {t.shopByCategory}
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedCategory === cat.key
                    ? 'bg-green-800 text-white'
                    : 'bg-white border text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            {lang === 'hi' ? 'उत्पाद लोड हो रहे हैं...' : 'Loading products...'}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-gray-600">
              {lang === 'hi' ? 'कोई उत्पाद नहीं मिला।' : 'No products found.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const activeIdx = selectedVariants[product.id] || 0;
              const activeVariant = product.variants[activeIdx];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border shadow-sm hover:shadow-md transition flex flex-col justify-between p-5"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-green-100 text-green-800">
                        {product.brand}
                      </span>
                      <span className="text-xs text-gray-500">{product.category}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    {product.technicalComposition && (
                      <p className="text-xs text-gray-500 mt-0.5">{product.technicalComposition}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>

                    {/* Pack Size Selector */}
                    {product.variants.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          {lang === 'hi' ? 'पैक आकार चुनें:' : 'Select Pack Size:'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {product.variants.map((v, idx) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() =>
                                setSelectedVariants({ ...selectedVariants, [product.id]: idx })
                              }
                              className={`px-3 py-1 text-xs font-semibold rounded border ${
                                activeIdx === idx
                                  ? 'border-green-700 bg-green-50 text-green-900'
                                  : 'border-gray-200 text-gray-600'
                              }`}
                            >
                              {v.packSize}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dual Pricing Display */}
                  {activeVariant && (
                    <div className="mt-5 pt-4 border-t">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs font-semibold uppercase block text-gray-500">
                            {activeVariant.isWholesale ? t.wholesalePrice : t.farmerPrice}
                          </span>
                          <span className="text-2xl font-extrabold text-green-800">
                            ₹{activeVariant.displayPrice}
                          </span>
                          <span className="text-xs text-gray-400 line-through ml-2">
                            {t.mrp}: ₹{activeVariant.mrp}
                          </span>
                        </div>

                        {activeVariant.isWholesale && activeVariant.minOrderQty > 1 && (
                          <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2 py-1 rounded">
                            {t.minOrderQty}: {activeVariant.minOrderQty}
                          </span>
                        )}
                      </div>

                      <button
                        disabled={activeVariant.stock <= 0}
                        className="mt-4 w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition disabled:bg-gray-300"
                      >
                        {activeVariant.stock > 0
                          ? t.addToCart
                          : lang === 'hi' ? 'स्टॉक समाप्त' : 'Out of Stock'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}