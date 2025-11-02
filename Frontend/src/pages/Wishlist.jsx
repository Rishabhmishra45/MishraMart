import React, { useState, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    FaHeart,
    FaTrash,
    FaShoppingCart,
    FaArrowLeft,
    FaRegSadTear,
    FaHome,
    FaSearch
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import Tittle from '../components/Tittle';

const Wishlist = () => {
    const {
        wishlist,
        loading,
        removeFromWishlist,
        clearWishlist,
        getWishlistCount
    } = useWishlist();

    const { isAuthenticated, authChecked } = useAuth();
    const navigate = useNavigate();
    const [removingProduct, setRemovingProduct] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleRemoveItem = async (productId, productName) => {
        setRemovingProduct(productId);
        const result = await removeFromWishlist(productId);

        if (result.success) {
            showNotification(`${productName} removed from wishlist`, 'success');
        } else {
            showNotification(result.message, 'error');
        }
        setRemovingProduct(null);
    };

    const handleClearWishlist = async () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            const result = await clearWishlist();
            if (result.success) {
                showNotification('Wishlist cleared successfully', 'success');
            } else {
                showNotification(result.message, 'error');
            }
        }
    };

    const handleAddToCart = (product) => {
        // Implement your add to cart logic here
        console.log('Add to cart:', product);
        showNotification('Product added to cart!', 'success');
    };

    const calculateDiscountedPrice = (price, discountPercentage = 20) => {
        return price - (price * discountPercentage / 100);
    };

    // Wait for auth check to complete
    if (!authChecked) {
        return (
            <LoadingSpinner
                message="Checking authentication..."
                spinnerColor="#aaf5fa"
                textColor="#aaf5fa"
            />
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-20 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="text-6xl mb-4 opacity-50">🔒</div>
                    <h2 className="text-2xl font-bold mb-4">Login Required</h2>
                    <p className="text-gray-400 mb-6">
                        Please login to view your wishlist and save your favorite products.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                        Login Now
                    </button>
                </div>
            </div>
        );
    }

    if (loading && wishlist.length === 0) {
        return (
            <LoadingSpinner
                message="Loading your wishlist..."
                spinnerColor="#aaf5fa"
                textColor="#aaf5fa"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-20">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl max-w-sm ${notification.type === 'success'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                    } text-white transform animate-slide-in-right`}>
                    {notification.message}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <div>
                            <Tittle text1="MY" text2="WISHLIST" />
                            <p className="text-gray-400 text-sm mt-1">
                                {getWishlistCount()} {getWishlistCount() === 1 ? 'item' : 'items'} saved for later
                            </p>
                        </div>
                    </div>

                    {wishlist.length > 0 && (
                        <button
                            onClick={handleClearWishlist}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl border border-red-500/30 transition-all duration-300"
                        >
                            <FaTrash className="text-sm" />
                            Clear All
                        </button>
                    )}
                </div>

                {/* Wishlist Content */}
                {wishlist.length === 0 ? (
                    // Empty Wishlist State
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-[#0f1b1d]/50 to-[#0a1517]/30 rounded-3xl border border-gray-700/30 backdrop-blur-sm">
                        <div className="text-7xl mb-6 opacity-60">
                            <FaRegSadTear />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-300 mb-3">
                            Your wishlist is empty
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Start exploring our collections and add products you love to your wishlist!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/collections')}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20"
                            >
                                Explore Collections
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                            >
                                <FaHome className="inline mr-2" />
                                Go to Home
                            </button>
                        </div>
                    </div>
                ) : (
                    // Wishlist Items Grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => {
                            const product = item.product;
                            const discountedPrice = calculateDiscountedPrice(
                                product.price,
                                product.discountPercentage || 20
                            );

                            return (
                                <div
                                    key={item._id || product._id}
                                    className="group bg-gradient-to-br from-[#1a1a1a] to-[#0f1a1d] rounded-2xl overflow-hidden border border-gray-700 hover:border-cyan-500/30 transition-all duration-300 relative"
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveItem(product._id, product.name)}
                                        disabled={removingProduct === product._id}
                                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50"
                                    >
                                        {removingProduct === product._id ? (
                                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FaTrash className="text-sm" />
                                        )}
                                    </button>

                                    {/* Product Image */}
                                    <div
                                        className="relative w-full h-48 overflow-hidden bg-gray-800 cursor-pointer"
                                        onClick={() => navigate(`/product/${product._id}`)}
                                    >
                                        <img
                                            src={product.image1}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3
                                            className="text-white font-semibold text-[15px] mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-cyan-100 transition-colors duration-300"
                                            onClick={() => navigate(`/product/${product._id}`)}
                                        >
                                            {product.name}
                                        </h3>

                                        {/* Price */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl font-bold text-cyan-400">
                                                ₹{discountedPrice.toFixed(0)}
                                            </span>
                                            <span className="text-sm text-gray-400 line-through">
                                                ₹{product.price}
                                            </span>
                                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                                {product.discountPercentage || 20}% OFF
                                            </span>
                                        </div>

                                        {/* Category */}
                                        {product.category && (
                                            <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full inline-block mb-3">
                                                {product.category}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 rounded-xl font-semibold transition-all duration-300 text-sm"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;