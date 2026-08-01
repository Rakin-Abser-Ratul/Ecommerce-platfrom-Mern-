import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cart/");
      setCart(res.data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await API.post("/cart/items", { product_id: productId, quantity });
      setCart(res.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || "Failed to add to cart" };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await API.put(`/cart/items/${itemId}`, { quantity });
      setCart(res.data);
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      // ✅ Directly execute DELETE request (returns updated CartResponse)
      const res = await API.delete(`/cart/items/${itemId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, updateQuantity, removeFromCart, fetchCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);