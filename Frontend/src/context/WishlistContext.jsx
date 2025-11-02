import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, serverUrl, authChecked } = useAuth();

  // Fetch wishlist only when user is authenticated and auth check is complete
  useEffect(() => {
    if (authChecked && isAuthenticated && user) {
      fetchWishlist();
    } else if (authChecked && !isAuthenticated) {
      setWishlist([]);
    }
  }, [isAuthenticated, user, authChecked]);

  const fetchWishlist = async () => {
    if (!isAuthenticated || !authChecked) {
      console.log('User not authenticated, skipping wishlist fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching wishlist...');
      const response = await axios.get(`${serverUrl}/api/wishlist`, {
        withCredentials: true
      });
      
      console.log('Wishlist response:', response.data);
      
      if (response.data.success) {
        setWishlist(response.data.wishlist?.items || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.response?.status === 401) {
        console.log('User not authenticated for wishlist');
        setWishlist([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!isAuthenticated || !authChecked) {
      return { success: false, message: "Please login to add to wishlist" };
    }

    try {
      setLoading(true);
      const response = await axios.post(`${serverUrl}/api/wishlist/add`, 
        { productId: product.id || product._id },
        { withCredentials: true }
      );

      if (response.data.success) {
        setWishlist(response.data.wishlist.items);
        return { success: true, message: "Added to wishlist" };
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      if (error.response?.status === 401) {
        return { success: false, message: "Please login to add to wishlist" };
      }
      const message = error.response?.data?.message || "Failed to add to wishlist";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated || !authChecked) {
      return { success: false, message: "Please login to manage wishlist" };
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${serverUrl}/api/wishlist/remove/${productId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setWishlist(response.data.wishlist?.items || []);
        return { success: true, message: "Removed from wishlist" };
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      if (error.response?.status === 401) {
        return { success: false, message: "Please login to manage wishlist" };
      }
      const message = error.response?.data?.message || "Failed to remove from wishlist";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated || !authChecked) {
      return { success: false, message: "Please login to manage wishlist" };
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${serverUrl}/api/wishlist/clear`, {
        withCredentials: true
      });

      if (response.data.success) {
        setWishlist([]);
        return { success: true, message: "Wishlist cleared" };
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      if (error.response?.status === 401) {
        return { success: false, message: "Please login to manage wishlist" };
      }
      const message = error.response?.data?.message || "Failed to clear wishlist";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product._id === productId || item.product === productId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    fetchWishlist,
    setWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};