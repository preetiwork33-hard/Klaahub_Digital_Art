import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  const getCartKey = (currentUser) => {
    return currentUser ? `klaahub_cart_${currentUser._id}` : 'klaahub_cart_guest';
  };

  useEffect(() => {
    const key = getCartKey(user);
    const stored = localStorage.getItem(key);
    setCartItems(stored ? JSON.parse(stored) : []);
  }, [user]);

  const addToCart = (artwork) => {
    if (cartItems.find(item => item._id === artwork._id)) {
      toast.error('Already in cart');
      return;
    }
    const updated = [...cartItems, artwork];
    setCartItems(updated);
    localStorage.setItem(getCartKey(user), JSON.stringify(updated));
    toast.success('Added to cart!');
  };

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item._id !== id);
    setCartItems(updated);
    localStorage.setItem(getCartKey(user), JSON.stringify(updated));
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem(getCartKey(user), JSON.stringify([]));
  };

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
