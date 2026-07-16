import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { api, apiWithRetry } from '../utils/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const data = await apiWithRetry('/cart');
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    refreshCart();
  }, [authLoading, user?.id, refreshCart]);

  const addToCart = async (product) => {
    const data = await api('/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
      }),
    });
    setItems(data.items || []);
  };

  const removeFromCart = async (id) => {
    const data = await api(`/cart/items/${id}`, { method: 'DELETE' });
    setItems(data.items || []);
  };

  const updateQuantity = async (id, quantity) => {
    const data = await api(`/cart/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    setItems(data.items || []);
  };

  const clearCart = async () => {
    const data = await api('/cart', { method: 'DELETE' });
    setItems(data.items || []);
  };

  const isInCart = (id) => items.some((i) => i.id === id);

  const placeOrder = async ({ shipping, payment }) => {
    const order = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({ shipping, payment }),
    });
    setLastOrder(order);
    setItems([]);
    return order;
  };

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        totalItems,
        totalPrice,
        lastOrder,
        setLastOrder,
        placeOrder,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
