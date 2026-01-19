import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { shopDataContext } from "../context/ShopContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { userDataContext } from "../context/UserContext";
import {
  FaStar,
  FaHeart,
  FaShare,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaShoppingCart,
  FaMinus,
  FaPlus,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaTelegram,
  FaCheck,
  FaRuler,
  FaClock,
  FaTag,
  FaArrowLeft,
  FaExpand,
  FaFire,
  FaExclamationTriangle,
} from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductReviews from "../components/ProductReviews";

const CartNotification = ({ product, isVisible }) => {
  if (!isVisible || !product) return null;

  return (
    <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-2xl shadow-green-500/30 border border-green-400 max-w-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <FaCheck className="text-white text-lg" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Added to Cart!</p>
            <p className="text-white/90 text-xs">{product.name}</p>
            <p className="text-white/80 text-xs">Size: {product.size}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
          <FaShoppingCart className="text-xs" />
          <span>Item successfully added to your shopping cart</span>
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { products, currency, getProducts, loadingProducts } =
    useContext(shopDataContext);

  const { addToCart, showCartNotification, notificationProduct } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { userData } = useContext(userDataContext);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [zoomImage, setZoomImage] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(20);

  const imageRef = useRef(null);

  const productsArray = Array.isArray(products) ? products : [];

  // ✅ Ensure products fetch once
  useEffect(() => {
    if (productsArray.length === 0) getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Find product when products updated
  useEffect(() => {
    if (!id) return;
    if (productsArray.length === 0) return;

    const foundProduct = productsArray.find((p) => p?._id === id) || null;
    setProduct(foundProduct);

    if (foundProduct) {
      const storedDiscount = localStorage.getItem(
        `product_discount_${foundProduct._id}`
      );

      if (storedDiscount) {
        setDiscountPercentage(parseInt(storedDiscount));
      } else {
        const randomDiscount = Math.floor(Math.random() * 21) + 15; // 15-35
        setDiscountPercentage(randomDiscount);
        localStorage.setItem(
          `product_discount_${foundProduct._id}`,
          randomDiscount.toString()
        );
      }

      setIsWishlisted(isInWishlist(foundProduct._id));
    }
  }, [products, id, isInWishlist]); // ✅ stable

  // ✅ Loading spinner based on ShopContext
  if (loadingProducts) {
    return (
      <LoadingSpinner
        message="Loading Product..."
        spinnerColor="#aaf5fa"
        textColor="#aaf5fa"
      />
    );
  }

  // ✅ Not Found
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-400 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/collections")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition duration-300"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice =
    product.price - (product.price * discountPercentage) / 100;

  const handleQuantityChange = (action) => {
    if (action === "increment") setQuantity((prev) => prev + 1);
    if (action === "decrement" && quantity > 1)
      setQuantity((prev) => prev - 1);
  };

  const sizeOptions = Array.isArray(product?.sizes) ? product.sizes : [];

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize && sizeOptions.length > 0) {
      alert("Please select a size before adding to cart");
      return;
    }

    const productToAdd = {
      id: product._id,
      name: product.name,
      price: discountedPrice,
      originalPrice: product.price,
      image: product.image1,
      category: product.category,
      size: selectedSize,
      discountPercentage,
    };

    addToCart(productToAdd, quantity);
  };

  const buyNow = () => {
    if (!selectedSize && sizeOptions.length > 0) {
      alert("Please select a size before buying");
      return;
    }
    handleAddToCart();
    navigate("/cart");
  };

  const handleWishlistToggle = async () => {
    if (!userData) {
      if (
        window.confirm(
          "Please login to add items to your wishlist. Would you like to login now?"
        )
      ) {
        navigate("/login", { state: { from: location.pathname } });
      }
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        setIsWishlisted(false);
      } else {
        await addToWishlist({
          id: product._id,
          name: product.name,
          price: discountedPrice,
          originalPrice: product.price,
          image: product.image1,
          category: product.category,
          discountPercentage,
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const shareProduct = () => setShowShareOptions(!showShareOptions);

  const shareOnPlatform = (platform) => {
    const productUrl = `${window.location.origin}/product/${id}`;
    const shareText = `Check out this amazing product: ${product?.name} - ${currency}${discountedPrice.toFixed(
      0
    )} (${discountPercentage}% OFF)`;

    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(
          shareText + " " + productUrl
        )}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          productUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(productUrl)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
          productUrl
        )}&text=${encodeURIComponent(shareText)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(productUrl).then(() => {
          alert("Product link copied to clipboard!");
          setShowShareOptions(false);
        });
        return;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareOptions(false);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out ${product?.name} on MishraMart - ${discountPercentage}% OFF!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      shareProduct();
    }
  };

  const handleImageZoom = () => setZoomImage(!zoomImage);

  const productImages = [
    product.image1,
    product.image2 || product.image1,
    product.image3 || product.image1,
    product.image4 || product.image1,
  ];

  const features = [
    {
      icon: <FaTruck />,
      text: "Free Delivery",
      subtext: "Above ₹999",
      color: "text-green-400",
    },
    {
      icon: <FaUndo />,
      text: "30 Days Return",
      subtext: "Easy Returns",
      color: "text-blue-400",
    },
    {
      icon: <FaShieldAlt />,
      text: "2 Year Warranty",
      subtext: "Quality Assured",
      color: "text-purple-400",
    },
    {
      icon: <FaClock />,
      text: "Fast Delivery",
      subtext: "2-3 Days",
      color: "text-orange-400",
    },
  ];

  const shareOptions = [
    {
      platform: "whatsapp",
      icon: <FaWhatsapp />,
      label: "WhatsApp",
      color: "hover:bg-green-500",
    },
    {
      platform: "facebook",
      icon: <FaFacebook />,
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      platform: "twitter",
      icon: <FaTwitter />,
      label: "Twitter",
      color: "hover:bg-blue-400",
    },
    {
      platform: "telegram",
      icon: <FaTelegram />,
      label: "Telegram",
      color: "hover:bg-blue-500",
    },
    {
      platform: "copy",
      icon: <FaLink />,
      label: "Copy Link",
      color: "hover:bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-20">
      <CartNotification
        product={notificationProduct}
        isVisible={showCartNotification}
      />

      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomImage(false)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={productImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full p-2"
            onClick={() => setZoomImage(false)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
          <button
            onClick={() => navigate("/")}
            className="hover:text-cyan-400 transition flex items-center gap-1"
          >
            <FaArrowLeft className="text-xs" />
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/collections")}
            className="hover:text-cyan-400 transition"
          >
            Collections
          </button>
          <span>/</span>
          <span className="text-cyan-400">{product.category}</span>
          <span>/</span>
          <span className="text-white font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 relative group">
              <img
                ref={imageRef}
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-80 lg:h-96 object-cover rounded-xl shadow-lg cursor-zoom-in transition-transform duration-300 hover:scale-105"
                onClick={handleImageZoom}
              />
              <button
                onClick={handleImageZoom}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
              >
                <FaExpand className="text-sm" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-110 ${
                    selectedImage === index
                      ? "border-cyan-400 scale-110 shadow-lg shadow-cyan-400/20"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 animate-fade-in-up">
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {product.name}
                </h1>
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                    isWishlisted
                      ? "text-red-500 bg-red-500/10 border border-red-500/30 animate-heart-beat"
                      : "text-gray-400 bg-gray-700/50 border border-gray-600 hover:text-red-400"
                  } ${wishlistLoading ? "opacity-50" : ""}`}
                >
                  {wishlistLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaHeart className={isWishlisted ? "fill-current" : ""} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-sm ${
                        star <= 4 ? "text-yellow-400" : "text-gray-600"
                      }`}
                    />
                  ))}
                  <span className="text-gray-400 text-sm ml-2">
                    Ratings shown in reviews
                  </span>
                </div>
                <span className="text-green-400 text-sm font-semibold bg-green-400/10 py-1 px-2 rounded-full animate-pulse">
                  In Stock
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-cyan-400">
                  {currency} {discountedPrice.toFixed(0)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {currency} {product.price}
                </span>
                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold py-1 px-3 rounded-full flex items-center gap-1 animate-pulse-slow">
                  <FaFire className="text-xs" />
                  {discountPercentage}% OFF
                </span>
              </div>
              <div className="text-green-400 text-sm font-medium">
                You save {currency}{" "}
                {(product.price * (discountPercentage / 100)).toFixed(0)}
              </div>
            </div>

            {/* Size */}
            {sizeOptions.length > 0 && (
              <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-400">
                  <FaRuler />
                  Select Size
                </h3>
                <div className="flex flex-wrap gap-3">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 border-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        selectedSize === size
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 scale-105 shadow-lg shadow-cyan-400/20"
                          : "border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-400">
                <FaTag />
                Quantity
              </h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-gray-600 rounded-xl bg-gray-800/50">
                  <button
                    onClick={() => handleQuantityChange("decrement")}
                    className="px-4 py-3 text-gray-400 hover:text-white transition hover:bg-gray-700/50 rounded-l-xl"
                  >
                    <FaMinus />
                  </button>
                  <span className="px-6 py-3 border-l border-r border-gray-600 min-w-[80px] text-center text-lg font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increment")}
                    className="px-4 py-3 text-gray-400 hover:text-white transition hover:bg-gray-700/50 rounded-r-xl"
                  >
                    <FaPlus />
                  </button>
                </div>
                <span className="text-green-400 text-sm font-medium bg-green-400/10 py-1 px-3 rounded-full">
                  Limited stock!
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={sizeOptions.length > 0 && !selectedSize}
                className={`flex-1 px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                  sizeOptions.length === 0 || selectedSize
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white hover:-translate-y-1 shadow-lg shadow-cyan-500/30"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                <FaShoppingCart />
                {sizeOptions.length > 0 && !selectedSize
                  ? "Select Size First"
                  : "Add to Cart"}
              </button>

              <button
                onClick={buyNow}
                disabled={sizeOptions.length > 0 && !selectedSize}
                className={`flex-1 px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                  sizeOptions.length === 0 || selectedSize
                    ? "bg-white hover:bg-gray-100 text-gray-900 hover:-translate-y-1 shadow-lg"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {sizeOptions.length > 0 && !selectedSize
                  ? "Select Size First"
                  : "Buy Now"}
              </button>
            </div>

            {/* Share */}
            <button
              onClick={nativeShare}
              className="px-6 py-3 border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 rounded-2xl transition-all duration-300 flex items-center gap-2 justify-center"
            >
              <FaShare />
              Share this Product
            </button>

            {!userData && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="text-yellow-400 text-lg" />
                  <div className="flex-1">
                    <p className="text-yellow-400 font-semibold">
                      Want to save items for later?
                    </p>
                    <p className="text-yellow-300 text-sm">
                      Login to access your wishlist and save your cart
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition duration-300 text-sm"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-xl p-4 text-center hover:border-cyan-400/30 transition-all duration-300"
                >
                  <div
                    className={`text-xl mb-2 flex justify-center ${feature.color}`}
                  >
                    {feature.icon}
                  </div>
                  <div className="text-white font-semibold text-sm">
                    {feature.text}
                  </div>
                  <div className="text-gray-400 text-xs">{feature.subtext}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400">
              Product Specifications
            </h3>

            <div className="space-y-4">
              {[
                { label: "Category", value: product.category },
                { label: "Material", value: "Premium Quality" },
                { label: "Care Instructions", value: "Machine Wash Cold" },
                {
                  label: "Available Sizes",
                  value:
                    sizeOptions.length > 0 ? sizeOptions.join(", ") : "One Size",
                },
                { label: "SKU", value: product._id.slice(-8).toUpperCase() },
              ].map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between py-2 border-b border-gray-700 last:border-b-0"
                >
                  <span className="text-gray-400 font-medium">{spec.label}</span>
                  <span className="text-white font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <ProductReviews productId={id} />
        </div>
      </div>

      {/* Share Popup */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Share this product
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.platform}
                  onClick={() => shareOnPlatform(option.platform)}
                  className={`p-3 rounded-xl text-white transition-all duration-300 transform hover:scale-105 ${option.color} bg-gray-700/50 border border-gray-600`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-xs">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowShareOptions(false)}
              className="w-full mt-4 py-2 border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400 rounded-xl transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
