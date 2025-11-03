import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [showCartNotification, setShowCartNotification] = useState(false);
    const [notificationProduct, setNotificationProduct] = useState(null);

    // Load cart from localStorage
    useEffect(() => {
        const loadCart = () => {
            try {
                if (isAuthenticated && user) {
                    const savedCart = localStorage.getItem(`mishramart_cart_${user._id}`);
                    if (savedCart) {
                        setCartItems(JSON.parse(savedCart));
                    }
                } else {
                    const guestCart = localStorage.getItem('mishramart_guest_cart');
                    if (guestCart) {
                        setCartItems(JSON.parse(guestCart));
                    }
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setCartItems([]);
            }
        };

        loadCart();
    }, [user, isAuthenticated]);

    // Save cart to localStorage
    useEffect(() => {
        const saveCart = () => {
            try {
                if (isAuthenticated && user) {
                    localStorage.setItem(`mishramart_cart_${user._id}`, JSON.stringify(cartItems));
                } else {
                    localStorage.setItem('mishramart_guest_cart', JSON.stringify(cartItems));
                }
            } catch (error) {
                console.error('Error saving cart:', error);
            }
        };

        saveCart();
    }, [cartItems, user, isAuthenticated]);

    const showNotification = (product) => {
        console.log('Showing notification for:', product); // Debug log
        setNotificationProduct(product);
        setShowCartNotification(true);
        
        // Auto hide after 3 seconds
        const timer = setTimeout(() => {
            setShowCartNotification(false);
        }, 3000);

        return () => clearTimeout(timer);
    };

    const addToCart = (product, quantity = 1) => {
        console.log('Adding to cart:', product); // Debug log
        
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.id === product.id && item.size === product.size
            );

            let newItems;
            
            if (existingItemIndex >= 0) {
                // Item exists, update quantity
                newItems = prevItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Item doesn't exist, add new item
                const cartProduct = {
                    ...product,
                    quantity: quantity,
                    price: product.price || product.originalPrice,
                    originalPrice: product.originalPrice || product.price,
                    discountPercentage: product.discountPercentage || 0,
                    size: product.size || null
                };
                newItems = [...prevItems, cartProduct];
            }

            // Show notification with complete product details
            showNotification({
                id: product.id,
                name: product.name,
                price: product.price || product.originalPrice,
                image: product.image,
                quantity: quantity,
                size: product.size || null,
                discountPercentage: product.discountPercentage || 0
            });
            
            return newItems;
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => 
            prevItems.filter(item => item.id !== productId)
        );
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        showCartNotification,
        notificationProduct,
        setShowCartNotification
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;