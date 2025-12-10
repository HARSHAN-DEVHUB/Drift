import React, { createContext, useContext, useEffect, useMemo, useState } from "react";


const CartContext = createContext();

const CART_KEY = "drift_enterprises_cart";
const SAVED_FOR_LATER_KEY = "drift_enterprises_saved_for_later";
const ORDERS_KEY = "drift_enterprises_orders";

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadFromStorage(CART_KEY, []));
  const [savedForLater, setSavedForLater] = useState(() => loadFromStorage(SAVED_FOR_LATER_KEY, []));
  const [orders, setOrders] = useState(() => loadFromStorage(ORDERS_KEY, []));

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(savedForLater));
  }, [savedForLater]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const addItem = (product) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === product.id);
      if (existing) {
        return current.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...current,
        { id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 },
      ];
    });
  };

  const removeItem = (productId) => setItems((current) => current.filter((i) => i.id !== productId));

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((current) => current.map((i) => (i.id === productId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const saveForLater = (productId) => {
    const item = items.find(i => i.id === productId);
    if (!item) return;
    
    setSavedForLater((current) => {
      const exists = current.find(i => i.id === productId);
      if (exists) return current;
      return [...current, item];
    });
    
    removeItem(productId);
  };

  const moveToCart = (productId) => {
    const item = savedForLater.find(i => i.id === productId);
    if (!item) return;
    
    setItems((current) => {
      const existing = current.find(i => i.id === productId);
      if (existing) {
        return current.map(i => 
          i.id === productId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...current, item];
    });
    
    setSavedForLater((current) => current.filter(i => i.id !== productId));
  };

  const removeFromSaved = (productId) => {
    setSavedForLater((current) => current.filter(i => i.id !== productId));
  };

  const placeOrder = () => {
    if (items.length === 0) return;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    const newOrder = { id: `ORD-${Date.now()}`, createdAt: new Date().toISOString(), total, subtotal, tax, items, status: 'pending', shippingAddress: null };
    setOrders((current) => [newOrder, ...current]);
    setItems([]);
    return newOrder;
  };

  const { totalItems, subtotal, tax, total } = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    return { totalItems, subtotal, tax, total };
  }, [items]);

  const value = { 
    items, 
    orders, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    placeOrder, 
    totalItems, 
    subtotal, 
    tax, 
    total,
    savedForLater,
    saveForLater,
    moveToCart,
    removeFromSaved
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone) => /^[0-9]{10}$/.test(phone.replace(/[\D]/g, ''));
export const validatePincode = (pincode) => /^[0-9]{6}$/.test(pincode.replace(/[\D]/g, ''));
export const validateForm = (formData, requiredFields) => {
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].toString().trim() === '') {
      return { valid: false, error: `${field} is required` };
    }
  }
  return { valid: true, error: null };
};
