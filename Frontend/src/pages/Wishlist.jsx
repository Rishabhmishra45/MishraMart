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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-3xl border shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2 min-w-0">
            <span
              className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in oklab, var(--surface) 80%, transparent)", borderColor: "var(--border)" }}
            >
              <FaRuler className="text-cyan-500" />
            </span>
            <span className="truncate">
              Select Size
              <span className="hidden sm:inline"> for {productName}</span>
            </span>
          </h3>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded-2xl border transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            style={{
              background: "color-mix(in oklab, var(--surface) 92%, transparent)",
              borderColor: "var(--border)"
            }}
            aria-label="Close size selector"
            type="button"
          >
            ✕
          </button>
        </div>

        <p className="text-xs sm:text-sm opacity-70 mb-4">
          Choose the size to add this item to your cart.
        </p>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
          {sizes.length > 0 ? (
            sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeSelect(size)}
                className="min-h-[44px] px-3 py-2 rounded-2xl border text-sm font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                style={{
                  background: "color-mix(in oklab, var(--surface) 88%, transparent)",
                  borderColor: "var(--border)"
                }}
                type="button"
              >
                {size}
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center opacity-70 py-6 text-sm">
              No sizes available
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full min-h-[48px] rounded-2xl border font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500/30"
          style={{
            background: "transparent",
            borderColor: "var(--border)",
            color: "var(--text)"
          }}
          type="button"
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
    <div className="fixed top-[76px] sm:top-[88px] right-3 sm:right-6 z-50">
      <div className="rounded-3xl p-4 shadow-2xl border max-w-[92vw] sm:max-w-sm backdrop-blur-md animate-slide-in-right"
        style={{
          background: "color-mix(in oklab, var(--surface) 88%, transparent)",
          borderColor: "color-mix(in oklab, var(--border) 70%, transparent)",
          color: "var(--text)"
        }}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-2xl border flex items-center justify-center"
            style={{
              background: "color-mix(in oklab, var(--surface) 78%, transparent)",
              borderColor: "var(--border)"
            }}
          >
            <span className="text-lg">✓</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm">Added to Cart 🎉</p>
            <p className="opacity-80 text-xs truncate">{product.name}</p>
            {product.size && (
              <p className="opacity-70 text-xs">Size: {product.size}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded-2xl border transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            style={{
              background: "transparent",
              borderColor: "var(--border)"
            }}
            aria-label="Close notification"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
          <FaShoppingCart className="text-xs" />
          <span>Item successfully added to your shopping cart</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full rounded-full h-1" style={{ background: "color-mix(in oklab, var(--border) 55%, transparent)" }}>
          <div className="h-1 rounded-full animate-progress bg-cyan-500"></div>
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

  // Category-based colors (soft, theme-friendly)
  const getCategoryPillStyle = () => {
    return {
      background: "color-mix(in oklab, var(--surface) 88%, transparent)",
      borderColor: "var(--border)"
    };
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
      <div className="min-h-[100svh] pt-[88px] sm:pt-[96px] flex items-center justify-center px-4"
        style={{ background: "var(--background)", color: "var(--text)" }}
      >
        <div className="text-center w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="text-6xl mb-4 opacity-60">🔒</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Login Required</h2>
          <p className="opacity-70 mb-6 text-sm sm:text-base">
            Please login to view your wishlist and save your favorite products.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="min-h-[48px] px-8 py-3 rounded-2xl font-extrabold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            style={{
              background: "linear-gradient(90deg, rgb(6 182 212), rgb(59 130 246))",
              color: "white"
            }}
            type="button"
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
    <div className="min-h-[100svh] pt-[88px] sm:pt-[96px] pb-[92px]"
      style={{ background: "var(--background)", color: "var(--text)" }}
    >
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

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="min-h-[44px] min-w-[44px] grid place-items-center rounded-2xl border transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              style={{
                background: "color-mix(in oklab, var(--surface) 88%, transparent)",
                borderColor: "var(--border)"
              }}
              type="button"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-base opacity-90" />
            </button>

            <div className="min-w-0">
              <Tittle text1="MY" text2="WISHLIST" />
              <p className="opacity-70 text-xs sm:text-sm mt-1">
                {getWishlistCount()} {getWishlistCount() === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500/30"
              style={{
                background: "color-mix(in oklab, var(--surface) 88%, transparent)",
                borderColor: "var(--border)"
              }}
              type="button"
            >
              <FaTrash className="text-sm text-red-500" />
              <span className="truncate">Clear All</span>
            </button>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          // Empty Wishlist State
          <div className="flex flex-col items-center justify-center py-14 sm:py-20 text-center rounded-3xl border shadow-sm"
            style={{
              background: "color-mix(in oklab, var(--surface) 86%, transparent)",
              borderColor: "var(--border)"
            }}
          >
            <div className="text-6xl sm:text-7xl mb-5 opacity-60">
              <FaRegSadTear />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold mb-2">
              Your wishlist is empty
            </h3>
            <p className="opacity-70 mb-6 max-w-md text-sm sm:text-base px-4">
              Start exploring our collections and add products you love to your wishlist!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/collections')}
                className="min-h-[48px] px-7 sm:px-8 py-3 rounded-2xl font-extrabold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                style={{
                  background: "linear-gradient(90deg, rgb(6 182 212), rgb(59 130 246))",
                  color: "white"
                }}
                type="button"
              >
                Explore Collections
              </button>
              <button
                onClick={() => navigate('/')}
                className="min-h-[48px] px-7 sm:px-8 py-3 rounded-2xl font-semibold border transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 inline-flex items-center justify-center gap-2"
                style={{
                  background: "transparent",
                  borderColor: "var(--border)",
                  color: "var(--text)"
                }}
                type="button"
              >
                <FaHome className="text-sm opacity-80" />
                Go to Home
              </button>
            </div>
          </div>
        ) : (
          // Wishlist Items Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            {wishlist.map((item, index) => {
              const product = item.product;
              const productSizes = product.sizes || [];
              const hasSizes = productSizes.length > 0;
              const discountPercentage = getDiscountPercentage(product._id);
              const discountedPrice = calculateDiscountedPrice(product.price, product._id);
              const selectedSize = selectedSizes[product._id];

              return (
                <div
                  key={item._id || product._id}
                  className="group rounded-3xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1 border shadow-sm"
                  style={{
                    background: "color-mix(in oklab, var(--surface) 88%, transparent)",
                    borderColor: "var(--border)"
                  }}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden"
                    style={{ background: "color-mix(in oklab, var(--surface) 75%, transparent)" }}
                  >
                    <img
                      src={product.image1}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-100" />

                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="text-white text-[11px] font-extrabold py-1.5 px-3 rounded-full shadow border border-white/20 flex items-center gap-1"
                        style={{ background: "linear-gradient(90deg, rgb(239 68 68), rgb(236 72 153))" }}
                      >
                        <FaFire className="text-[10px]" />
                        {discountPercentage}% OFF
                      </div>
                    </div>

                    {/* Sizes indicator */}
                    {hasSizes && (
                      <div className="absolute top-3 left-[92px] z-10">
                        <div className="text-[11px] font-bold py-1.5 px-3 rounded-full border"
                          style={{
                            background: "color-mix(in oklab, var(--surface) 70%, transparent)",
                            borderColor: "color-mix(in oklab, var(--border) 60%, transparent)",
                            color: "var(--text)"
                          }}
                        >
                          Sizes
                        </div>
                      </div>
                    )}

                    {/* Rating badge */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="rounded-full px-2.5 py-1 flex items-center gap-1 border"
                        style={{
                          background: "color-mix(in oklab, var(--surface) 65%, transparent)",
                          borderColor: "color-mix(in oklab, var(--border) 60%, transparent)",
                          color: "var(--text)"
                        }}
                      >
                        <FaStar className="text-yellow-400 text-[11px]" />
                        <span className="text-[11px] font-bold">4.8</span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={(e) => handleRemoveItem(product._id, product.name, e)}
                      disabled={removingProduct === product._id}
                      className="absolute top-3 right-3 z-10 min-h-[44px] min-w-[44px] grid place-items-center rounded-2xl border transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      style={{
                        background: "color-mix(in oklab, var(--surface) 75%, transparent)",
                        borderColor: "color-mix(in oklab, var(--border) 60%, transparent)"
                      }}
                      aria-label="Remove from wishlist"
                      type="button"
                    >
                      {removingProduct === product._id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTrash className="text-sm text-red-500" />
                      )}
                    </button>

                    {/* Quick Add to cart */}
                    <button
                      className="absolute bottom-3 right-3 z-10 min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center text-white transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      style={{
                        background: "linear-gradient(90deg, rgb(6 182 212), rgb(59 130 246))"
                      }}
                      onClick={(e) => handleAddToCartClick(product, e)}
                      disabled={cartLoading === product._id}
                      aria-label="Add to cart"
                      type="button"
                    >
                      {cartLoading === product._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaShoppingCart className="text-sm" />
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-extrabold text-sm sm:text-base leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg sm:text-xl font-extrabold text-cyan-500">
                            ₹{discountedPrice.toFixed(0)}
                          </span>
                          <span className="text-xs sm:text-sm opacity-60 line-through">
                            ₹{product.price}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] sm:text-xs font-bold text-green-600 dark:text-green-400">
                          Save ₹{(product.price * discountPercentage / 100).toFixed(0)}
                        </div>
                      </div>

                      <span
                        className="shrink-0 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full border"
                        style={getCategoryPillStyle()}
                      >
                        {(product.category || 'Product').toString().slice(0, 14)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile safe bottom space (for bottom nav) */}
        <div className="h-6 sm:hidden" />
      </div>
    </div>
  );
};

export default Wishlist;
