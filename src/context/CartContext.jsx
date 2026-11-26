// src/context/CartContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('osst_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('osst_cart', JSON.stringify(newCart));
  };

  const addToCart = (product, variant) => {
    const minQty = variant.minOrderQty || 1;
    const existingIndex = cart.findIndex((item) => item.variantId === variant.id);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      saveCart(updated);
    } else {
      saveCart([
        ...cart,
        {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          packSize: variant.packSize,
          price: variant.displayPrice,
          minQty,
          maxStock: variant.stock,
          quantity: minQty,
        },
      ]);
    }
  };

  const updateQuantity = (variantId, newQty) => {
    const updated = cart.map((item) => {
      if (item.variantId === variantId) {
        const validQty = Math.max(item.minQty, Math.min(newQty, item.maxStock));
        return { ...item, quantity: validQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeFromCart = (variantId) => {
    saveCart(cart.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}