import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    FaCheck
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

// Cart Notification Component
const CartNotification = ({ product, isVisible }) => {
    if (!isVisible || !product) return null;

    return (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-2xl shadow-green-500/30 border border-green-400 max-w-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <FaCheck className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Added to Cart!</p>
                        <p className="text-white/90 text-xs">{product.name}</p>
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
    const { products, currency, getProducts } = useContext(shopDataContext);
    const { addToCart, showCartNotification, notificationProduct } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);

    useEffect(() => {
        if (products.length === 0) {
            getProducts();
        } else {
            const foundProduct = products.find(p => p._id === id);
            setProduct(foundProduct);
            setIsLoading(false);
        }
    }, [products, id, getProducts]);

    const handleQuantityChange = (action) => {
        if (action === 'increment') {
            setQuantity(prev => prev + 1);
        } else if (action === 'decrement' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // Updated addToCart function using CartContext
    const handleAddToCart = () => {
        if (!product) return;

        const productToAdd = {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.image1,
            category: product.category
        };

        addToCart(productToAdd, quantity);
    };

    const buyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    // Share functionality
    const shareProduct = () => {
        setShowShareOptions(!showShareOptions);
    };

    const shareOnPlatform = (platform) => {
        const productUrl = `${window.location.origin}/product/${id}`;
        const shareText = `Check out this amazing product: ${product?.name} - ${currency}${product?.price}`;

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

    // Native share API for mobile devices
    const nativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.name,
                    text: `Check out ${product?.name} on MishraMart`,
                    url: window.location.href,
                });
                console.log('Product shared successfully');
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback to custom share options
            shareProduct();
        }
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
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                    <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/collections')}
                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-300"
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
        { icon: <FaTruck />, text: "Free Delivery", subtext: "Above ₹999" },
        { icon: <FaUndo />, text: "30 Days Return", subtext: "Easy Returns" },
        { icon: <FaShieldAlt />, text: "2 Year Warranty", subtext: "Quality Assured" }
    ];

    const shareOptions = [
        { platform: 'whatsapp', icon: <FaWhatsapp />, label: 'WhatsApp', color: 'hover:bg-green-500' },
        { platform: 'facebook', icon: <FaFacebook />, label: 'Facebook', color: 'hover:bg-blue-600' },
        { platform: 'twitter', icon: <FaTwitter />, label: 'Twitter', color: 'hover:bg-blue-400' },
        { platform: 'telegram', icon: <FaTelegram />, label: 'Telegram', color: 'hover:bg-blue-500' },
        { platform: 'copy', icon: <FaLink />, label: 'Copy Link', color: 'hover:bg-purple-500' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px]">

            {/* Cart Notification */}
            <CartNotification
                product={notificationProduct}
                isVisible={showCartNotification}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
                    <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition">Home</button>
                    <span>/</span>
                    <button onClick={() => navigate('/collections')} className="hover:text-cyan-400 transition">Collections</button>
                    <span>/</span>
                    <span className="text-cyan-400">{product.category}</span>
                    <span>/</span>
                    <span className="text-white">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-4 shadow-2xl shadow-blue-900/20">
                            <img
                                src={productImages[selectedImage]}
                                alt={product.name}
                                className="w-full h-96 object-cover rounded-lg"
                            />
                        </div>

                        {/* Thumbnail Images */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {productImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all duration-300 ${selectedImage === index
                                            ? 'border-cyan-400 scale-105'
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

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Product Header */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar key={star} className="text-yellow-400 text-sm" />
                                    ))}
                                    <span className="text-gray-400 text-sm ml-2">(4.8 • 124 Reviews)</span>
                                </div>
                                <span className="text-green-400 text-sm font-semibold">In Stock</span>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">
                                {currency} {product.price}
                                <span className="text-lg text-gray-400 line-through ml-2">{currency} {product.price * 1.2}</span>
                                <span className="text-green-400 text-sm ml-2">(20% OFF)</span>
                            </div>
                        </div>

                        {/* Product Description */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            <h3 className="text-lg font-semibold mb-3">Description</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {product.description || `Premium quality ${product.name} from our ${product.category} collection. Designed for comfort and style, this product combines the latest fashion trends with exceptional craftsmanship. Perfect for everyday wear and special occasions.`}
                            </p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            <h3 className="text-lg font-semibold mb-4">Quantity</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-600 rounded-lg">
                                    <button
                                        onClick={() => handleQuantityChange('decrement')}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition"
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className="px-4 py-2 border-l border-r border-gray-600 min-w-[60px] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange('increment')}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                                <span className="text-gray-400 text-sm">
                                    Only 12 items left!
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons - Updated to use CartContext */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3"
                            >
                                <FaShoppingCart />
                                Add to Cart
                            </button>
                            <button
                                onClick={buyNow}
                                className="flex-1 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3"
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex gap-4 relative">
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`px-6 py-3 border rounded-2xl transition-all duration-300 flex items-center gap-2 ${isWishlisted
                                        ? 'border-red-500 text-red-500 bg-red-500/10'
                                        : 'border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'
                                    }`}
                            >
                                <FaHeart className={isWishlisted ? 'fill-current' : ''} />
                                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                            </button>

                            {/* Share Button with Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={nativeShare}
                                    className="px-6 py-3 border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 rounded-2xl transition-all duration-300 flex items-center gap-2"
                                >
                                    <FaShare />
                                    Share
                                </button>

                                {/* Share Options Dropdown */}
                                {showShareOptions && (
                                    <div className="absolute top-full left-0 mt-2 bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-4 shadow-2xl shadow-blue-900/20 z-50 min-w-[200px]">
                                        <div className="grid grid-cols-2 gap-2">
                                            {shareOptions.map((option) => (
                                                <button
                                                    key={option.platform}
                                                    onClick={() => shareOnPlatform(option.platform)}
                                                    className={`p-3 rounded-lg bg-gray-800 ${option.color} text-white transition-all duration-300 flex flex-col items-center gap-2 hover:scale-105`}
                                                >
                                                    <span className="text-xl">{option.icon}</span>
                                                    <span className="text-xs">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-4 text-center">
                                    <div className="text-cyan-400 text-xl mb-2 flex justify-center">
                                        {feature.icon}
                                    </div>
                                    <div className="text-white font-semibold text-sm">{feature.text}</div>
                                    <div className="text-gray-400 text-xs">{feature.subtext}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Product Details */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Specifications */}
                    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                        <h3 className="text-xl font-semibold mb-6">Product Specifications</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Category</span>
                                <span className="text-white">{product.category}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Material</span>
                                <span className="text-white">Premium Cotton</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Care Instructions</span>
                                <span className="text-white">Machine Wash</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Color</span>
                                <span className="text-white">As shown in images</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">SKU</span>
                                <span className="text-white">{product._id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Returns */}
                    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                        <h3 className="text-xl font-semibold mb-6">Shipping & Returns</h3>
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