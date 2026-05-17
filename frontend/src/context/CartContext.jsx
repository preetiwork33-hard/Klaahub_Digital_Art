import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('klaahub_cart');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('klaahub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (artwork) => {
    if (cartItems.find(item => item._id === artwork._id)) {
      toast.error('Already in cart');
      return;
    }
    setCartItems(prev => [...prev, artwork]);
    toast.success('Added to cart!');
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
    toast.success('Removed from cart');
  };

  const clearCart = () => setCartItems([]);

  const isInCart = (id) => cartItems.some(item => item._id === id);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const cartCount = cartItems.length;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
