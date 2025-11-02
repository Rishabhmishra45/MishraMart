// ProductDetail.jsx - Dynamic Discount from Card
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { shopDataContext } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
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
    FaExpand
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

// Cart Notification Component
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
    const { products, currency, getProducts } = useContext(shopDataContext);
    const { addToCart, showCartNotification, notificationProduct } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [zoomImage, setZoomImage] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState(20); // Default fallback
    const imageRef = useRef(null);

    useEffect(() => {
        if (products.length === 0) {
            getProducts();
        } else {
            const foundProduct = products.find(p => p._id === id);
            setProduct(foundProduct);
            
            // Get discount from navigation state or generate fixed discount
            if (location.state?.discountPercentage) {
                setDiscountPercentage(location.state.discountPercentage);
            } else if (foundProduct) {
                // Generate same fixed discount as in Card component
                const generatedDiscount = generateFixedDiscount(foundProduct._id);
                setDiscountPercentage(generatedDiscount);
            }
            
            setIsLoading(false);
        }
    }, [products, id, getProducts, location.state]);

    // Same discount generation function as in Card component
    const generateFixedDiscount = (productId) => {
        const hash = productId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const discounts = [15, 20, 25, 30, 35, 40, 45, 50];
        const index = Math.abs(hash) % discounts.length;
        return discounts[index];
    };

    const discountedPrice = product ? product.price - (product.price * discountPercentage / 100) : 0;

    const handleQuantityChange = (action) => {
        if (action === 'increment') {
            setQuantity(prev => prev + 1);
        } else if (action === 'decrement' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // Get sizes from product data
    const sizeOptions = product?.sizes || [];

    const handleAddToCart = () => {
        if (!product) return;
        
        if (!selectedSize && sizeOptions.length > 0) {
            alert('Please select a size before adding to cart');
            return;
        }

        const productToAdd = {
            id: product._id,
            name: product.name,
            price: discountedPrice, // Use discounted price
            originalPrice: product.price, // Store original price
            image: product.image1,
            category: product.category,
            size: selectedSize,
            discountPercentage: discountPercentage
        };

        addToCart(productToAdd, quantity);
    };

    const buyNow = () => {
        if (!selectedSize && sizeOptions.length > 0) {
            alert('Please select a size before buying');
            return;
        }
        handleAddToCart();
        navigate('/cart');
    };

    const shareProduct = () => {
        setShowShareOptions(!showShareOptions);
    };

    const shareOnPlatform = (platform) => {
        const productUrl = `${window.location.origin}/product/${id}`;
        const shareText = `Check out this amazing product: ${product?.name} - ${currency}${discountedPrice.toFixed(0)} (${discountPercentage}% OFF)`;

        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(productUrl).then(() => {
                    alert('Product link copied to clipboard!');
                    setShowShareOptions(false);
                });
                return;
            default:
                return;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
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
                console.log('Product shared successfully');
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            shareProduct();
        }
    };

    // Image zoom functionality
    const handleImageZoom = () => {
        setZoomImage(!zoomImage);
    };

    if (isLoading) {
        return (
            <LoadingSpinner
                message="Loading Product..."
                spinnerColor="#aaf5fa"
                textColor="#aaf5fa"
            />
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                    <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/collections')}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition duration-300"
                    >
                        Back to Collections
                    </button>
                </div>
            </div>
        );
    }

    const productImages = [
        product.image1,
        product.image2 || product.image1,
        product.image3 || product.image1,
        product.image4 || product.image1
    ];

    const features = [
        { icon: <FaTruck />, text: "Free Delivery", subtext: "Above ₹999", color: "text-green-400" },
        { icon: <FaUndo />, text: "30 Days Return", subtext: "Easy Returns", color: "text-blue-400" },
        { icon: <FaShieldAlt />, text: "2 Year Warranty", subtext: "Quality Assured", color: "text-purple-400" },
        { icon: <FaClock />, text: "Fast Delivery", subtext: "2-3 Days", color: "text-orange-400" }
    ];

    const shareOptions = [
        { platform: 'whatsapp', icon: <FaWhatsapp />, label: 'WhatsApp', color: 'hover:bg-green-500' },
        { platform: 'facebook', icon: <FaFacebook />, label: 'Facebook', color: 'hover:bg-blue-600' },
        { platform: 'twitter', icon: <FaTwitter />, label: 'Twitter', color: 'hover:bg-blue-400' },
        { platform: 'telegram', icon: <FaTelegram />, label: 'Telegram', color: 'hover:bg-blue-500' },
        { platform: 'copy', icon: <FaLink />, label: 'Copy Link', color: 'hover:bg-purple-500' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-20">
            {/* Cart Notification */}
            <CartNotification
                product={notificationProduct}
                isVisible={showCartNotification}
            />

            {/* Zoom Modal */}
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
                    <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition flex items-center gap-1">
                        <FaArrowLeft className="text-xs" />
                        Home
                    </button>
                    <span>/</span>
                    <button onClick={() => navigate('/collections')} className="hover:text-cyan-400 transition">Collections</button>
                    <span>/</span>
                    <span className="text-cyan-400">{product.category}</span>
                    <span>/</span>
                    <span className="text-white font-medium">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Images - Modern Design */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 relative group">
                            <img
                                ref={imageRef}
                                src={productImages[selectedImage]}
                                alt={product.name}
                                className="w-full h-80 lg:h-96 object-cover rounded-xl shadow-lg cursor-zoom-in"
                                onClick={handleImageZoom}
                            />
                            <button
                                onClick={handleImageZoom}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                <FaExpand className="text-sm" />
                            </button>
                        </div>

                        {/* Thumbnail Images */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {productImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all duration-300 ${selectedImage === index
                                            ? 'border-cyan-400 scale-110 shadow-lg shadow-cyan-400/20'
                                            : 'border-gray-600 hover:border-gray-400'
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

                    {/* Product Info - Modern Design */}
                    <div className="space-y-6">
                        {/* Product Header */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            <div className="flex justify-between items-start mb-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                    {product.name}
                                </h1>
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className={`p-2 rounded-full transition-all duration-300 ${isWishlisted
                                            ? 'text-red-500 bg-red-500/10 border border-red-500/30'
                                            : 'text-gray-400 bg-gray-700/50 border border-gray-600 hover:text-red-400'
                                        }`}
                                >
                                    <FaHeart className={isWishlisted ? 'fill-current' : ''} />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar key={star} className="text-yellow-400 text-sm" />
                                    ))}
                                    <span className="text-gray-400 text-sm ml-2">4.8 • 124 Reviews</span>
                                </div>
                                <span className="text-green-400 text-sm font-semibold bg-green-400/10 py-1 px-2 rounded-full">In Stock</span>
                            </div>

                            {/* Price Section with Dynamic Discount */}
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl font-bold text-cyan-400">
                                    {currency} {discountedPrice.toFixed(0)}
                                </span>
                                <span className="text-lg text-gray-400 line-through">
                                    {currency} {product.price}
                                </span>
                                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold py-1 px-3 rounded-full">
                                    {discountPercentage}% OFF
                                </span>
                            </div>
                            <div className="text-green-400 text-sm font-medium">
                                You save {currency} {(product.price * discountPercentage / 100).toFixed(0)}
                            </div>
                        </div>

                        {/* Product Description */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            <h3 className="text-lg font-semibold mb-3 text-cyan-400">Product Description</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {product.description || `Discover the exceptional quality and style of our ${product.name}. Crafted with precision and attention to detail, this product offers unparalleled comfort and durability. Perfect for everyday use while maintaining a sophisticated appearance that complements any style.`}
                            </p>
                        </div>

                        {/* Size Selector */}
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
                                            className={`px-5 py-2.5 border-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${selectedSize === size
                                                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 scale-105 shadow-lg shadow-cyan-400/20'
                                                    : 'border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                {!selectedSize && (
                                    <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                        Please select a size to continue
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-400">
                                <FaTag />
                                Quantity
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center border border-gray-600 rounded-xl bg-gray-800/50">
                                    <button
                                        onClick={() => handleQuantityChange('decrement')}
                                        className="px-4 py-3 text-gray-400 hover:text-white transition hover:bg-gray-700/50 rounded-l-xl"
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className="px-6 py-3 border-l border-r border-gray-600 min-w-[80px] text-center text-lg font-semibold">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange('increment')}
                                        className="px-4 py-3 text-gray-400 hover:text-white transition hover:bg-gray-700/50 rounded-r-xl"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                                <span className="text-green-400 text-sm font-medium bg-green-400/10 py-1 px-3 rounded-full">
                                    Only 12 items left!
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={sizeOptions.length > 0 && !selectedSize}
                                className={`flex-1 px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                                    (sizeOptions.length === 0 || selectedSize)
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white hover:-translate-y-1 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FaShoppingCart />
                                {sizeOptions.length > 0 && !selectedSize ? 'Select Size First' : 'Add to Cart'}
                            </button>
                            <button
                                onClick={buyNow}
                                disabled={sizeOptions.length > 0 && !selectedSize}
                                className={`flex-1 px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                                    (sizeOptions.length === 0 || selectedSize)
                                        ? 'bg-white hover:bg-gray-100 text-gray-900 hover:-translate-y-1 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {sizeOptions.length > 0 && !selectedSize ? 'Select Size First' : 'Buy Now'}
                            </button>
                        </div>

                        {/* Share Button */}
                        <div className="flex gap-4">
                            <button
                                onClick={nativeShare}
                                className="px-6 py-3 border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 rounded-2xl transition-all duration-300 flex items-center gap-2 flex-1 justify-center"
                            >
                                <FaShare />
                                Share this Product
                            </button>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-xl p-4 text-center hover:border-cyan-400/30 transition-all duration-300 group hover:transform hover:-translate-y-1">
                                    <div className={`text-xl mb-2 flex justify-center ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                        {feature.icon}
                                    </div>
                                    <div className="text-white font-semibold text-sm">{feature.text}</div>
                                    <div className="text-gray-400 text-xs">{feature.subtext}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Sections */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Specifications */}
                    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                        <h3 className="text-xl font-semibold mb-6 text-cyan-400">Product Specifications</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Category", value: product.category },
                                { label: "Material", value: "Premium Quality" },
                                { label: "Care Instructions", value: "Machine Wash Cold" },
                                { label: "Available Sizes", value: sizeOptions.length > 0 ? sizeOptions.join(', ') : 'One Size' },
                                { label: "SKU", value: product._id?.slice(-8).toUpperCase() || 'N/A' },
                                { label: "Discount", value: `${discountPercentage}% OFF` },
                                { label: "You Save", value: `${currency} ${(product.price * discountPercentage / 100).toFixed(0)}` }
                            ].map((spec, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                                    <span className="text-gray-400 font-medium">{spec.label}</span>
                                    <span className="text-white font-semibold">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping & Returns */}
                    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                        <h3 className="text-xl font-semibold mb-6 text-cyan-400">Shipping & Returns</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FaTruck className="text-green-400 mt-1 flex-shrink-0" />
                                <div>
                                    <div className="text-white font-semibold">Free Shipping</div>
                                    <div className="text-gray-400 text-sm">Free delivery on orders above ₹999</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FaUndo className="text-blue-400 mt-1 flex-shrink-0" />
                                <div>
                                    <div className="text-white font-semibold">Easy Returns</div>
                                    <div className="text-gray-400 text-sm">30-day return policy</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FaShieldAlt className="text-purple-400 mt-1 flex-shrink-0" />
                                <div>
                                    <div className="text-white font-semibold">Secure Payment</div>
                                    <div className="text-gray-400 text-sm">Your payment information is safe with us</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;