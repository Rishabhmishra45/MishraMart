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
        className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <FaRuler className="text-cyan-500" />
          <span className="truncate">Select Size for {productName}</span>
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeSelect(size)}
              className="p-2 sm:p-3 border-2 border-[color:var(--border)] text-[color:var(--text)] rounded-lg hover:border-cyan-500 hover:text-cyan-500 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              {size}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 sm:py-3 border border-[color:var(--border)] text-[color:var(--muted)] rounded-lg hover:border-red-500 hover:text-red-400 transition-all duration-300 text-sm sm:text-base"
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

      // Auto hide after 2 seconds
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
      electronics: 'bg-gradient-to-r from-blue-500/10 to-cyan-600/10',
      clothing: 'bg-gradient-to-r from-purple-500/10 to-pink-600/10',
      home: 'bg-gradient-to-r from-orange-500/10 to-amber-600/10',
      beauty: 'bg-gradient-to-r from-rose-500/10 to-pink-600/10',
      sports: 'bg-gradient-to-r from-green-500/10 to-emerald-600/10',
      books: 'bg-gradient-to-r from-indigo-500/10 to-blue-600/10',
      default: 'bg-gradient-to-r from-gray-500/10 to-slate-600/10'
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
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 animate-slide-in-right">
          <div className={`rounded-xl p-3 shadow-xl border max-w-sm backdrop-blur-sm ${wishlistNotification.type === 'info'
            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-400'
            : wishlistNotification.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400'
              : 'bg-gradient-to-r from-red-500 to-pink-600 border-red-400'
            }`}>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                {wishlistNotification.type === 'info' && '🔒'}
                {wishlistNotification.type === 'success' && '✅'}
                {wishlistNotification.type === 'error' && '❌'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-xs sm:text-sm text-white">
                  {wishlistNotification.message}
                </p>
                {wishlistNotification.type === 'info' && (
                  <p className="text-white/80 text-xs mt-0.5">
                    Click here to login
                  </p>
                )}
              </div>
              <button
                onClick={() => setWishlistNotification({ show: false, message: "", type: "" })}
                className="text-white/80 hover:text-white text-lg transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Component */}
      <div
        ref={cardRef}
        onClick={handleClick}
        className={`group w-full max-w-xs sm:w-64 bg-[color:var(--surface)] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col border border-[color:var(--border)] relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        style={{
          transitionDelay: isVisible ? `${index * 0.1}s` : '0s'
        }}
      >
        {/* Discount Badge */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold py-1 px-2 rounded-full shadow-md border border-red-300/30 flex items-center gap-1">
            <FaFire className="text-xs" />
            {discountPercentage}% OFF
          </div>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={wishlistLoading || !authChecked}
          className={`absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${isInWishlist(id)
            ? 'text-red-500 bg-red-500/20'
            : 'text-[color:var(--text)]/80 hover:text-red-400 bg-black/40 hover:bg-black/60'
            } ${wishlistLoading ? 'opacity-50' : ''}`}
          aria-label={isInWishlist(id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlistLoading ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FaHeart className={`text-sm ${isInWishlist(id) ? 'fill-current' : ''}`} />
          )}
        </button>

        {/* Product Image */}
        <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-[color:var(--surface-2)]">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

          {/* Quick Add to Cart Button */}
          <button
            className="absolute bottom-2 right-2 w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 shadow-lg"
            onClick={handleAddToCart}
            disabled={cartLoading}
            aria-label="Add to cart"
          >
            {cartLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaShoppingCart className="text-xs sm:text-sm" />
            )}
          </button>

          {/* Rating Badge */}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-white text-xs font-medium">4.8</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm sm:text-base font-semibold mb-1 line-clamp-2 leading-tight group-hover:text-cyan-500 transition-colors duration-300 min-h-[2.5rem]">
              {name}
            </h3>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg sm:text-xl font-bold text-cyan-500">
                {currency} {discountedPrice.toFixed(0)}
              </span>
              <span className="text-xs sm:text-sm text-[color:var(--muted)] line-through">
                {currency} {price}
              </span>
            </div>

            {/* Save Amount */}
            <div className="text-xs text-green-500 font-medium bg-green-500/10 py-1 px-2 rounded-full inline-block">
              Save {currency} {(price * discountPercentage / 100).toFixed(0)}
            </div>
          </div>

          {/* Category Tag */}
          <div className={`mt-2 text-xs py-1 px-3 rounded-full ${cardColor} text-[color:var(--text)] border border-[color:var(--border)] inline-block self-start transition-all duration-300 group-hover:scale-105 truncate max-w-full`}>
            {category || 'Product'}
          </div>
        </div>

        {/* Border Glow Effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/30 rounded-xl transition-all duration-300 pointer-events-none"></div>
      </div>
    </>
  );
};

export default Card;