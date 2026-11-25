// src/app/admin/products/new/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function AddProductPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [productData, setProductData] = useState({
    name: '',
    brand: '',
    category: 'SEEDS',
    description: '',
    technicalComposition: '',
    cropsInput: '',
    imageUrl: '',
    hsnCode: '',
    gstRate: '0',
  });

  const [variants, setVariants] = useState([
    {
      packSize: '',
      sku: '',
      mrp: '',
      farmerPrice: '',
      retailerPrice: '',
      minRetailerQty: '1',
      stock: '',
    },
  ]);

  const handleProductChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index, e) => {
    const updated = [...variants];
    updated[index][e.target.name] = e.target.value;
    setVariants(updated);
  };

  const addVariantRow = () => {
    setVariants([
      ...variants,
      { packSize: '', sku: '', mrp: '', farmerPrice: '', retailerPrice: '', minRetailerQty: '1', stock: '' },
    ]);
  };

  const removeVariantRow = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const cropsArray = productData.cropsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          crops: cropsArray,
          images: productData.imageUrl ? [productData.imageUrl] : [],
          variants,
        }),
      });

      if (res.ok) {
        setMessage(t.productSaved);
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        const err = await res.json();
        setMessage(err.error || t.somethingWentWrong);
      }
    } catch (error) {
      setMessage(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">{t.addNewProduct}</h1>

      {message && (
        <div className="p-3 mb-4 rounded-lg bg-green-100 text-green-800 font-medium">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow border">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.productName} *</label>
            <input
              type="text"
              name="name"
              required
              onChange={handleProductChange}
              placeholder="e.g., Bayer Confidor Insecticide"
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.brand} *</label>
            <input
              type="text"
              name="brand"
              required
              onChange={handleProductChange}
              placeholder="e.g., Bayer, Pioneer, Syngenta"
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.category} *</label>
            <select
              name="category"
              value={productData.category}
              onChange={handleProductChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="SEEDS">{t.seeds}</option>
              <option value="PESTICIDES">{t.pesticides}</option>
              <option value="FERTILIZERS">{t.fertilizers}</option>
              <option value="EQUIPMENT">{t.equipment}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.technicalComposition}</label>
            <input
              type="text"
              name="technicalComposition"
              onChange={handleProductChange}
              placeholder="e.g., Imidacloprid 17.8% SL"
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.cropsLabel}</label>
            <input
              type="text"
              name="cropsInput"
              onChange={handleProductChange}
              placeholder="Wheat, Paddy, Cotton"
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.hsnCode}</label>
            <input
              type="text"
              name="hsnCode"
              onChange={handleProductChange}
              placeholder="e.g., 3808"
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.gstRate}</label>
            <select
              name="gstRate"
              onChange={handleProductChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="0">0% (Exempt / Seeds)</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t.description} *</label>
          <textarea
            name="description"
            rows="3"
            required
            onChange={handleProductChange}
            className="mt-1 w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Variants & Dual Pricing Section */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">{t.packVariants}</h2>
            <button
              type="button"
              onClick={addVariantRow}
              className="text-sm bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-lg hover:bg-green-200"
            >
              {t.addVariant}
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="p-4 mb-3 bg-gray-50 border rounded-lg space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">{t.packSize} *</label>
                  <input
                    type="text"
                    name="packSize"
                    required
                    value={variant.packSize}
                    onChange={(e) => handleVariantChange(index, e)}
                    placeholder="500 ml"
                    className="mt-1 w-full px-2 py-1.5 text-sm border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">{t.sku} *</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(index, e)}
                    placeholder="BAY-CONF-500"
                    className="mt-1 w-full px-2 py-1.5 text-sm border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">{t.stock} *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, e)}
                    placeholder="50"
                    className="mt-1 w-full px-2 py-1.5 text-sm border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">{t.minRetailerQty}</label>
                  <input
                    type="number"
                    name="minRetailerQty"
                    value={variant.minRetailerQty}
                    onChange={(e) => handleVariantChange(index, e)}
                    placeholder="5"
                    className="mt-1 w-full px-2 py-1.5 text-sm border rounded bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">{t.mrp} (₹) *</label>
                  <input
                    type="number"
                    name="mrp"
                    required
                    value={variant.mrp}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="mt-1 w-full px-2 py-1.5 text-sm border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-700">{t.farmerPrice} (₹) *</label>
                  <input
                    type="number"
                    name="farmerPrice"
                    required
                    value={variant.farmerPrice}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="mt-1 w-full px-2 py-1.5 text-sm border border-green-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-700">{t.wholesalePrice} (₹) *</label>
                  <input
                    type="number"
                    name="retailerPrice"
                    required
                    value={variant.retailerPrice}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="mt-1 w-full px-2 py-1.5 text-sm border border-amber-300 rounded bg-white"
                  />
                </div>
              </div>

              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariantRow(index)}
                  className="text-xs text-red-600 hover:underline"
                >
                  {lang === 'hi' ? 'यह पैक हटाएं' : 'Remove this pack'}
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg transition disabled:opacity-50"
        >
          {loading ? t.savingProduct : t.saveProduct}
        </button>
      </form>
    </div>
  );
}