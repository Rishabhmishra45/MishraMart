import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { shopDataContext } from '../context/ShopContext';
import { userDataContext } from '../context/UserContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaCreditCard, FaExclamationTriangle, FaUser } from 'react-icons/fa';
import CartNotification from '../components/CartNotification';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, showCartNotification, notificationProduct, setShowCartNotification } = useCart();
    const { currency, delivery_fee } = useContext(shopDataContext);
    const { userData } = useContext(userDataContext);

    // Safe calculations
    const subtotal = getCartTotal ? getCartTotal() : 0;
    const total = subtotal + (delivery_fee || 50);
    const isCartEmpty = !cartItems || cartItems.length === 0;

    const handleQuantityChange = (productId, action) => {
        const item = cartItems.find(item => item.id === productId);
        if (item && updateQuantity) {
            if (action === 'increment') {
                updateQuantity(productId, item.quantity + 1);
            } else if (action === 'decrement' && item.quantity > 1) {
                updateQuantity(productId, item.quantity - 1);
            }
        }
    };

    const handleRemoveFromCart = (productId) => {
        if (removeFromCart) {
            removeFromCart(productId);
        }
    };

    const handleCloseNotification = () => {
        setShowCartNotification(false);
    };

    const proceedToCheckout = () => {
        if (!userData) {
            // Show login modal instead of redirect
            if (window.confirm('Please login to proceed with checkout. Would you like to login now?')) {
                navigate('/login', { 
                    state: { from: '/place-order' } 
                });
            }
            return;
        }
        console.log('Proceeding to checkout with items:', cartItems);
        navigate('/place-order');
    };

    // If cart context is not available
    if (!useCart) {
        return (
            <div className="min-h-screen pt-[70px] flex items-center justify-center bg-[color:var(--background)] text-[color:var(--text)]">
                <div className="text-center max-w-md mx-4">
                    <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-8 shadow-xl">
                        <FaExclamationTriangle className="text-4xl text-amber-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-3">Cart Error</h2>
                        <p className="text-[color:var(--muted)] mb-6">Cart functionality is currently unavailable.</p>
                        <button
                            onClick={() => navigate('/collections')}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white font-semibold rounded-xl transition-all duration-300 w-full"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isCartEmpty) {
        return (
            <div className="min-h-screen pt-[70px] bg-[color:var(--background)] text-[color:var(--text)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
                    <div className="text-center">
                        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-6 sm:p-12 shadow-xl">
                            <FaShoppingBag className="text-5xl sm:text-6xl text-gray-400 mx-auto mb-4 sm:mb-6" />
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Your Cart is Empty</h2>
                            <p className="text-[color:var(--muted)] text-sm sm:text-lg mb-6 sm:mb-8">
                                Looks like you haven't added any items to your cart yet.
                            </p>
                            <button
                                onClick={() => navigate('/collections')}
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3 mx-auto w-full max-w-xs"
                            >
                                <FaArrowLeft />
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-[70px] bg-[color:var(--background)] text-[color:var(--text)]">
            {/* Cart Notification */}
            <CartNotification
                product={notificationProduct}
                isVisible={showCartNotification}
                onClose={handleCloseNotification}
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Shopping Cart</h1>
                    <button
                        onClick={() => navigate('/collections')}
                        className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition text-sm sm:text-base"
                    >
                        <FaArrowLeft />
                        Continue Shopping
                    </button>
                </div>

                {/* Guest User Notice */}
                {!userData && (
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-4 sm:p-6 mb-6">
                        <div className="flex items-start sm:items-center gap-3">
                            <FaUser className="text-yellow-500 text-lg sm:text-xl mt-1 sm:mt-0" />
                            <div className="flex-1">
                                <h3 className="text-yellow-500 font-semibold text-base sm:text-lg">Shopping as Guest</h3>
                                <p className="text-yellow-400 text-xs sm:text-sm mt-1">
                                    You can add items to cart and browse. Login for checkout and wishlist features.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-3 sm:mt-4">
                            <button
                                onClick={() => navigate('/login', { state: { from: '/cart' } })}
                                className="px-3 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition duration-300 text-xs sm:text-sm flex-1"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-3 sm:px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-lg transition duration-300 text-xs sm:text-sm flex-1"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {cartItems.map((item, index) => (
                            <div 
                                key={`${item.id}-${item.size || 'no-size'}`} 
                                className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-4 sm:p-6 shadow-xl"
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                {item.size && (
                                                    <p className="text-cyan-500 text-xs sm:text-sm mb-2">
                                                        Size: {item.size}
                                                    </p>
                                                )}
                                                <p className="text-cyan-500 text-lg sm:text-xl font-bold mb-3">
                                                    {currency} {item.price}
                                                </p>
                                                {item.discountPercentage > 0 && (
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                                                            {currency} {item.originalPrice}
                                                        </span>
                                                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                                            {item.discountPercentage}% OFF
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromCart(item.id)}
                                                className="text-red-400 hover:text-red-300 transition p-1 sm:p-2 hover:scale-110 ml-2"
                                                aria-label="Remove item"
                                            >
                                                <FaTrash className="text-base sm:text-lg" />
                                            </button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                                            <div className="flex items-center border border-[color:var(--border)] rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, 'decrement')}
                                                    className="px-3 sm:px-4 py-2 text-[color:var(--muted)] hover:text-[color:var(--text)] transition hover:bg-[color:var(--surface-2)]"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <FaMinus className="text-xs sm:text-sm" />
                                                </button>
                                                <span className="px-3 sm:px-4 py-2 border-l border-r border-[color:var(--border)] min-w-[40px] sm:min-w-[60px] text-center text-sm sm:text-base">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, 'increment')}
                                                    className="px-3 sm:px-4 py-2 text-[color:var(--muted)] hover:text-[color:var(--text)] transition hover:bg-[color:var(--surface-2)]"
                                                    aria-label="Increase quantity"
                                                >
                                                    <FaPlus className="text-xs sm:text-sm" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base sm:text-lg font-semibold">
                                                    Total: {currency} {(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-4 sm:p-6 shadow-xl sticky top-24">
                            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Order Summary</h3>

                            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                <div className="flex justify-between text-[color:var(--muted)] text-sm sm:text-base">
                                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                    <span>{currency} {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[color:var(--muted)] text-sm sm:text-base">
                                    <span>Delivery Fee</span>
                                    <span>{currency} {delivery_fee || 50}</span>
                                </div>
                                <div className="border-t border-[color:var(--border)] pt-3 sm:pt-4">
                                    <div className="flex justify-between text-base sm:text-lg font-semibold">
                                        <span>Total</span>
                                        <span>{currency} {total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={proceedToCheckout}
                                className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-white font-semibold rounded-xl transition-all duration-300 hover:opacity-95 shadow-lg flex items-center justify-center gap-2 sm:gap-3 ${
                                    userData 
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                        : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                }`}
                            >
                                <FaCreditCard />
                                <span className="text-sm sm:text-base">
                                    {userData ? 'Proceed to Checkout' : 'Login to Checkout'}
                                </span>
                            </button>

                            <button
                                onClick={() => clearCart && clearCart()}
                                className="w-full px-4 sm:px-6 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white mt-3 sm:mt-4 rounded-xl transition-all duration-300 text-sm sm:text-base"
                            >
                                Clear Cart
                            </button>

                            {/* Guest User Benefits */}
                            {!userData && (
                                <div className="mt-3 sm:mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                    <p className="text-cyan-500 text-xs text-center">
                                        Create an account to save your cart and get faster checkout
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;