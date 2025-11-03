import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopDataContext } from '../context/ShopContext';
import { FaHeart, FaShoppingCart, FaStar, FaFire, FaRuler } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { userDataContext } from '../context/UserContext';
import ReactDOM from 'react-dom';

// Size Selector Modal Component
const SizeSelectorModal = ({
  isOpen,
  onClose,
  onSizeSelect,
  sizes,
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
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeSelect(size)}
              className="p-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 hover:scale-105"
            >
              {size}
            </button>
          ))}
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

// Main Card Component
const Card = ({ name, image, id, price, category, index }) => {
  let { currency, products } = useContext(shopDataContext);
  const { userData } = useContext(userDataContext);
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, authChecked } = useAuth();
  const { addToCart } = useCart();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(20);
  const [isVisible, setIsVisible] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [wishlistNotification, setWishlistNotification] = useState({
    show: false,
    message: "",
    type: "" // 'info', 'success', 'error'
  });
  const cardRef = useRef(null);

  // Generate or retrieve persistent discount for this product
  useEffect(() => {
    const storedDiscount = localStorage.getItem(`product_discount_${id}`);
    if (storedDiscount) {
      setDiscountPercentage(parseInt(storedDiscount));
    } else {
      const randomDiscount = Math.floor(Math.random() * 21) + 15;
      setDiscountPercentage(randomDiscount);
      localStorage.setItem(`product_discount_${id}`, randomDiscount.toString());
    }
  }, [id]);

  // Get product sizes from products data
  const getProductSizes = () => {
    const product = products.find(p => p._id === id);
    return product?.sizes || [];
  };

  const sizes = getProductSizes();
  const hasSizes = sizes.length > 0;

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const discountedPrice = price - (price * discountPercentage / 100);

  const handleClick = () => {
    if (!showSizeSelector) {
      navigate(`/product/${id}`, { state: { discountPercentage } });
    }
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();

    if (!authChecked) return;

    if (!isAuthenticated || !userData) {
      // Guest user - show notification instead of confirm
      setWishlistNotification({
        show: true,
        message: "Login to add items to your wishlist",
        type: "info"
      });

      // Auto hide after 3 seconds
      setTimeout(() => {
        setWishlistNotification({ show: false, message: "", type: "" });
      }, 2000);

      return;
    }

    setWishlistLoading(true);

    try {
      if (isInWishlist(id)) {
        await removeFromWishlist(id);
        // Show success notification for removal
        setWishlistNotification({
          show: true,
          message: "Removed from wishlist",
          type: "success"
        });
      } else {
        await addToWishlist({
          id,
          name,
          price: discountedPrice,
          originalPrice: price,
          image,
          category,
          discountPercentage
        });
        // Show success notification for addition
        setWishlistNotification({
          show: true,
          message: "Added to wishlist!",
          type: "success"
        });
      }

      // Auto hide success notifications after 2 seconds
      setTimeout(() => {
        setWishlistNotification({ show: false, message: "", type: "" });
      }, 2000);

    } catch (error) {
      console.error('Wishlist operation failed:', error);
      // Show error notification
      setWishlistNotification({
        show: true,
        message: "Failed to update wishlist",
        type: "error"
      });

      setTimeout(() => {
        setWishlistNotification({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!authChecked) return;

    // If product has sizes, show size selector for both guest and logged-in users
    if (hasSizes && !selectedSize) {
      setShowSizeSelector(true);
      return;
    }

    setCartLoading(true);

    try {
      const productToAdd = {
        id,
        name,
        price: discountedPrice,
        originalPrice: price,
        image,
        category,
        discountPercentage,
        size: selectedSize || 'M' // Default size if no sizes available
      };

      addToCart(productToAdd, 1);

      setSelectedSize('');
      setShowSizeSelector(false);
    } catch (error) {
      console.error('Add to cart failed:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setShowSizeSelector(false);

    setTimeout(() => {
      const productToAdd = {
        id,
        name,
        price: discountedPrice,
        originalPrice: price,
        image,
        category,
        discountPercentage,
        size: size
      };
      addToCart(productToAdd, 1);
    }, 300);
  };

  const handleCloseSizeSelector = () => {
    setShowSizeSelector(false);
    setSelectedSize('');
  };

  const getCategoryColor = () => {
    const colorMap = {
      electronics: 'from-blue-500/20 to-cyan-600/20 border-blue-500/30',
      clothing: 'from-purple-500/20 to-pink-600/20 border-purple-500/30',
      home: 'from-orange-500/20 to-amber-600/20 border-orange-500/30',
      beauty: 'from-rose-500/20 to-pink-600/20 border-rose-500/30',
      sports: 'from-green-500/20 to-emerald-600/20 border-green-500/30',
      books: 'from-indigo-500/20 to-blue-600/20 border-indigo-500/30',
      default: 'from-gray-500/20 to-slate-600/20 border-gray-500/30'
    };
    return colorMap[category] || colorMap.default;
  };

  const cardColor = getCategoryColor();

  return (
    <>
      {/* Size Selector Modal */}
      <SizeSelectorModal
        isOpen={showSizeSelector}
        onClose={handleCloseSizeSelector}
        onSizeSelect={handleSizeSelect}
        sizes={sizes}
        productName={name}
      />

      {/* Wishlist Notification */}
      {wishlistNotification.show && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div className={`rounded-2xl p-4 shadow-2xl border max-w-sm backdrop-blur-sm ${wishlistNotification.type === 'info'
            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-400 shadow-blue-500/30'
            : wishlistNotification.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 shadow-green-500/30'
              : 'bg-gradient-to-r from-red-500 to-pink-600 border-red-400 shadow-red-500/30'
            }`}>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                {wishlistNotification.type === 'info' && '🔒'}
                {wishlistNotification.type === 'success' && '✅'}
                {wishlistNotification.type === 'error' && '❌'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">
                  {wishlistNotification.message}
                </p>
                {wishlistNotification.type === 'info' && (
                  <p className="text-white/80 text-xs mt-1">
                    Click here to login
                  </p>
                )}
              </div>
              <button
                onClick={() => setWishlistNotification({ show: false, message: "", type: "" })}
                className="text-white/80 hover:text-white text-lg transition-colors duration-200 hover:scale-110"
              >
                ×
              </button>
            </div>

            {/* Progress Bar for auto-close - Duration based on notification type */}
            <div className="mt-2 w-full bg-white/20 rounded-full h-1">
              <div
                className="bg-white h-1 rounded-full transition-all ease-linear"
                style={{
                  width: '100%',
                  animation: wishlistNotification.type === 'info'
                    ? 'progress 2000ms linear forwards'
                    : wishlistNotification.type === 'success'
                      ? 'progress 2000ms linear forwards'
                      : 'progress 3000ms linear forwards'
                }}
              ></div>
            </div>
          </div>

          <style>{`
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `}</style>
        </div>
      )}

      {/* Card Component */}
      <div
        ref={cardRef}
        onClick={handleClick}
        className={`group w-72 h-80 bg-gradient-to-br from-[#1a1a1a] to-[#0f1a1d] rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 flex flex-col border border-gray-700 relative scroll-card ${isVisible ? 'visible' : ''
          }`}
        style={{
          transitionDelay: isVisible ? `${index * 0.1}s` : '0s'
        }}
      >
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg border border-red-300/30 flex items-center gap-1 animate-pulse-glow">
            <FaFire className="text-xs" />
            {discountPercentage}% OFF
          </div>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={wishlistLoading || !authChecked}
          className={`absolute top-3 right-3 z-10 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${isInWishlist(id)
            ? 'text-red-500 bg-red-500/20 animate-heart-beat'
            : 'text-white/80 hover:text-red-400 bg-black/60 hover:bg-black/80'
            } ${wishlistLoading ? 'opacity-50' : ''}`}
        >
          {wishlistLoading ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FaHeart className={`text-sm ${isInWishlist(id) ? 'fill-current' : ''}`} />
          )}
        </button>

        {/* Product Image */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-800">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

          {/* Quick Add to Cart Button */}
          <button
            className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg hover:shadow-cyan-500/30"
            onClick={handleAddToCart}
            disabled={cartLoading}
          >
            {cartLoading ? (
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

          {/* Hover Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Product Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-2 line-clamp-2 leading-tight group-hover:text-cyan-100 transition-colors duration-300">
              {name}
            </h3>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-cyan-400">
                {currency} {discountedPrice.toFixed(0)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {currency} {price}
              </span>
            </div>

            <div className="text-xs text-green-400 font-medium bg-green-400/10 py-1 px-2 rounded-full inline-block animate-bounce-soft">
              Save {currency} {(price * discountPercentage / 100).toFixed(0)}
            </div>
          </div>

          <div
            className={`mt-2 text-xs py-1.5 px-3 rounded-full bg-gradient-to-r ${cardColor} text-gray-300 border inline-block self-start transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}
          >
            {category || 'Product'}
          </div>
        </div>

        {/* Border Glow Effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/40 rounded-2xl transition-all duration-500 pointer-events-none group-hover:shadow-cyan-500/20 group-hover:shadow-xl"></div>
      </div>
    </>
  );
};

export default Card;