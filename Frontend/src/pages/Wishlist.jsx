import React, { useState, useEffect, useRef } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
    FaHeart,
    FaTrash,
    FaShoppingCart,
    FaArrowLeft,
    FaRegSadTear,
    FaHome,
    FaStar,
    FaFire,
    FaRuler
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import Tittle from '../components/Tittle';
import ReactDOM from 'react-dom';

// Size Selector Modal Component
const SizeSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSizeSelect, 
  sizes = [], 
  productName 
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0f1a1d] border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-float-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaRuler className="text-cyan-400" />
          Select Size for {productName}
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {sizes.length > 0 ? (
            sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeSelect(size)}
                className="p-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 hover:scale-105"
              >
                {size}
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400 py-4">
              No sizes available
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 border border-gray-600 text-gray-400 rounded-xl hover:border-red-500 hover:text-red-400 transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
};

// Cart Notification Component
const CartNotification = ({ product, isVisible, onClose }) => {
  if (!isVisible || !product) return null;

  return (
    <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-2xl shadow-green-500/30 border border-green-400 max-w-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <span className="text-white text-lg">✓</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Added to Cart! 🎉</p>
            <p className="text-white/90 text-xs">{product.name}</p>
            {product.size && (
              <p className="text-white/80 text-xs">Size: {product.size}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-lg transition-colors"
          >
            ×
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
          <FaShoppingCart className="text-xs" />
          <span>Item successfully added to your shopping cart</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-white/20 rounded-full h-1">
          <div className="bg-white h-1 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
};

const Wishlist = () => {
    const {
        wishlist,
        loading,
        removeFromWishlist,
        clearWishlist,
        getWishlistCount
    } = useWishlist();

    const { addToCart } = useCart();
    const { isAuthenticated, authChecked } = useAuth();
    const navigate = useNavigate();
    const [removingProduct, setRemovingProduct] = useState(null);
    const [cartLoading, setCartLoading] = useState(null);
    const [showSizeSelector, setShowSizeSelector] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState({});
    const [wishlistNotification, setWishlistNotification] = useState({ show: false, product: null });

    // Debug wishlist data
    useEffect(() => {
        console.log('Wishlist data:', wishlist);
        wishlist.forEach((item, index) => {
            console.log(`Item ${index}:`, item);
            console.log(`Product ${index}:`, item.product);
            console.log(`Sizes ${index}:`, item.product?.sizes);
        });
    }, [wishlist]);

    const handleRemoveItem = async (productId, productName, e) => {
        e.stopPropagation();
        setRemovingProduct(productId);
        await removeFromWishlist(productId);
        setRemovingProduct(null);
    };

    const handleClearWishlist = async () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            await clearWishlist();
        }
    };

    const handleAddToCartClick = (product, e) => {
        e.stopPropagation();
        e.preventDefault();
        
        console.log('Add to cart clicked for:', product.name);
        console.log('Product data:', product);
        console.log('Product sizes:', product.sizes);
        
        const productSizes = product.sizes || [];
        const hasSizes = productSizes.length > 0;
        const selectedSize = selectedSizes[product._id];

        console.log('Has sizes:', hasSizes, 'Selected size:', selectedSize);

        if (hasSizes && !selectedSize) {
            console.log('Showing size selector for product:', product._id);
            setShowSizeSelector(product._id);
            return;
        }

        console.log('Adding directly to cart');
        handleAddToCart(product, selectedSize);
    };

    const handleAddToCart = async (product, size = null) => {
        const productId = product._id;
        setCartLoading(productId);
        
        try {
            const storedDiscount = localStorage.getItem(`product_discount_${productId}`);
            const discountPercentage = storedDiscount ? parseInt(storedDiscount) : 20;
            const discountedPrice = product.price - (product.price * discountPercentage / 100);

            const productToAdd = {
                id: productId,
                name: product.name,
                price: discountedPrice,
                originalPrice: product.price,
                image: product.image1,
                category: product.category,
                discountPercentage: discountPercentage,
                size: size
            };

            console.log('Adding to cart:', productToAdd);
            addToCart(productToAdd, 1);
            
            // Show wishlist notification
            setWishlistNotification({ show: true, product: productToAdd });
            setTimeout(() => {
                setWishlistNotification({ show: false, product: null });
            }, 3000);
            
            // Reset selected size after adding to cart
            if (size) {
                setSelectedSizes(prev => ({ ...prev, [productId]: '' }));
            }
        } catch (error) {
            console.error('Add to cart failed:', error);
        } finally {
            setCartLoading(null);
        }
    };

    const handleSizeSelect = (size) => {
        console.log('Size selected:', size, 'for product:', showSizeSelector);
        const productId = showSizeSelector;
        setSelectedSizes(prev => ({ ...prev, [productId]: size }));
        setShowSizeSelector(null);
        
        // Auto-add to cart after size selection
        const product = wishlist.find(item => item.product._id === productId)?.product;
        if (product) {
            console.log('Auto-adding to cart after size selection');
            setTimeout(() => {
                handleAddToCart(product, size);
            }, 300);
        }
    };

    const handleCloseSizeSelector = () => {
        console.log('Closing size selector');
        setShowSizeSelector(null);
    };

    const handleCloseNotification = () => {
        setWishlistNotification({ show: false, product: null });
    };

    const calculateDiscountedPrice = (price, productId) => {
        const storedDiscount = localStorage.getItem(`product_discount_${productId}`);
        const discountPercentage = storedDiscount ? parseInt(storedDiscount) : 20;
        return price - (price * discountPercentage / 100);
    };

    const getDiscountPercentage = (productId) => {
        const storedDiscount = localStorage.getItem(`product_discount_${productId}`);
        return storedDiscount ? parseInt(storedDiscount) : 20;
    };

    // Get product for size selector
    const getProductForSizeSelector = () => {
        if (!showSizeSelector) return null;
        const item = wishlist.find(item => item.product._id === showSizeSelector);
        return item ? item.product : null;
    };

    // Category-based colors
    const getCategoryColor = (category) => {
        const colorMap = {
            'electronics': 'from-blue-500/20 to-cyan-600/20 border-blue-500/30',
            'clothing': 'from-purple-500/20 to-pink-600/20 border-purple-500/30',
            'home': 'from-orange-500/20 to-amber-600/20 border-orange-500/30',
            'beauty': 'from-rose-500/20 to-pink-600/20 border-rose-500/30',
            'sports': 'from-green-500/20 to-emerald-600/20 border-green-500/30',
            'books': 'from-indigo-500/20 to-blue-600/20 border-indigo-500/30',
            'default': 'from-gray-500/20 to-slate-600/20 border-gray-500/30'
        };
        return colorMap[category] || colorMap.default;
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

    const sizeSelectorProduct = getProductForSizeSelector();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-20">
            {/* Size Selector Modal */}
            <SizeSelectorModal
                isOpen={!!showSizeSelector}
                onClose={handleCloseSizeSelector}
                onSizeSelect={handleSizeSelect}
                sizes={sizeSelectorProduct?.sizes || []}
                productName={sizeSelectorProduct?.name || 'Product'}
            />

            {/* Cart Notification for Wishlist Page */}
            <CartNotification
                product={wishlistNotification.product}
                isVisible={wishlistNotification.show}
                onClose={handleCloseNotification}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-cyan-400 hover:text-cyan-300"
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
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-3 rounded-xl border border-red-500/30 transition-all duration-300 hover:scale-105"
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
                                className="border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                            >
                                <FaHome className="text-sm" />
                                Go to Home
                            </button>
                        </div>
                    </div>
                ) : (
                    // Wishlist Items Grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {wishlist.map((item, index) => {
                            const product = item.product;
                            const productSizes = product.sizes || [];
                            const hasSizes = productSizes.length > 0;
                            const discountPercentage = getDiscountPercentage(product._id);
                            const discountedPrice = calculateDiscountedPrice(product.price, product._id);
                            const cardColor = getCategoryColor(product.category);
                            const selectedSize = selectedSizes[product._id];

                            return (
                                <div
                                    key={item._id || product._id}
                                    className="group w-72 h-80 bg-gradient-to-br from-[#1a1a1a] to-[#0f1a1d] rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 flex flex-col border border-gray-700 relative scroll-card visible"
                                    style={{
                                        transitionDelay: `${index * 0.1}s`
                                    }}
                                    onClick={() => navigate(`/product/${product._id}`)}
                                >
                                    {/* Discount Badge */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg border border-red-300/30 flex items-center gap-1 animate-pulse-glow">
                                            <FaFire className="text-xs" />
                                            {discountPercentage}% OFF
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => handleRemoveItem(product._id, product.name, e)}
                                        disabled={removingProduct === product._id}
                                        className={`absolute top-3 right-3 z-10 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                                            removingProduct === product._id ? 'opacity-50' : ''
                                        }`}
                                    >
                                        {removingProduct === product._id ? (
                                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FaTrash className="text-sm text-red-400 hover:text-red-300" />
                                        )}
                                    </button>

                                    {/* Product Image */}
                                    <div className="relative w-full h-48 overflow-hidden bg-gray-800">
                                        <img
                                            src={product.image1}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                        />
                                        
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                        
                                        {/* Quick Add to Cart Button */}
                                        <button
                                            className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg hover:shadow-cyan-500/30"
                                            onClick={(e) => handleAddToCartClick(product, e)}
                                            disabled={cartLoading === product._id}
                                        >
                                            {cartLoading === product._id ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FaShoppingCart className="text-sm" />
                                            )}
                                        </button>

                                        {/* Rating Badge */}
                                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                            <FaStar className="text-yellow-400 text-xs" />
                                            <span className="text-white text-xs font-medium">4.8</span>
                                        </div>

                                        {/* Size Available Indicator */}
                                        {hasSizes && (
                                            <div className="absolute top-3 left-12 bg-blue-500/20 text-blue-400 text-xs font-medium py-1 px-2 rounded-full border border-blue-500/30">
                                                Sizes
                                            </div>
                                        )}

                                        {/* Hover Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-white font-semibold text-[15px] mb-2 line-clamp-2 leading-tight group-hover:text-cyan-100 transition-colors duration-300">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl font-bold text-cyan-400">
                                                    ₹{discountedPrice.toFixed(0)}
                                                </span>
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{product.price}
                                                </span>
                                            </div>

                                            <div className="text-xs text-green-400 font-medium bg-green-400/10 py-1 px-2 rounded-full inline-block animate-bounce-soft">
                                                Save ₹{(product.price * discountPercentage / 100).toFixed(0)}
                                            </div>
                                        </div>

                                        <div
                                            className={`mt-2 text-xs py-1.5 px-3 rounded-full bg-gradient-to-r ${cardColor} text-gray-300 border inline-block self-start transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}
                                        >
                                            {product.category || 'Product'}
                                        </div>
                                    </div>

                                    {/* Border Glow Effect */}
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/40 rounded-2xl transition-all duration-500 pointer-events-none group-hover:shadow-cyan-500/20 group-hover:shadow-xl"></div>
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