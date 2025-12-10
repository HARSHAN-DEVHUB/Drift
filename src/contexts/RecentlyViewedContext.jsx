import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();

const RECENTLY_VIEWED_KEY = 'drift_recently_viewed';
const MAX_ITEMS = 10;

function loadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState(() => loadFromStorage());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed((current) => {
      // Remove if already exists
      const filtered = current.filter((item) => item.id !== product.id);
      // Add to front
      const updated = [{ 
        id: product.id, 
        title: product.title, 
        price: product.price, 
        image: product.image || product.images?.[0],
        category: product.category,
        brand: product.brand,
        viewedAt: new Date().toISOString()
      }, ...filtered];
      // Keep only MAX_ITEMS
      return updated.slice(0, MAX_ITEMS);
    });
  };

  const clearRecentlyViewed = () => setRecentlyViewed([]);

  const value = {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  };

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  return ctx;
}
