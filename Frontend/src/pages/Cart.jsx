import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { shopDataContext } from '../context/ShopContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaCreditCard } from 'react-icons/fa';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const { currency, delivery_fee } = useContext(shopDataContext);

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

    const proceedToCheckout = () => {
        console.log('Proceeding to checkout with items:', cartItems);
        alert('Proceeding to checkout!');
    };

    // If cart context is not available
    if (!useCart) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Cart Error</h2>
                    <p className="text-gray-400 mb-6">Cart functionality is currently unavailable.</p>
                    <button
                        onClick={() => navigate('/collections')}
                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-300"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    if (isCartEmpty) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-12 shadow-2xl shadow-blue-900/20">
                            <FaShoppingBag className="text-6xl text-gray-500 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
                            <p className="text-gray-400 text-lg mb-8">
                                Looks like you haven't added any items to your cart yet.
                            </p>
                            <button
                                onClick={() => navigate('/collections')}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3 mx-auto"
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
        <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold">Shopping Cart</h1>
                    <button
                        onClick={() => navigate('/collections')}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
                    >
                        <FaArrowLeft />
                        Continue Shopping
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-cyan-400 text-lg font-bold mb-4">
                                                    {currency} {item.price}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart && removeFromCart(item.id)}
                                                className="text-red-400 hover:text-red-300 transition p-2"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border border-gray-600 rounded-lg">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, 'decrement')}
                                                    className="px-4 py-2 text-gray-400 hover:text-white transition"
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span className="px-4 py-2 border-l border-r border-gray-600 min-w-[60px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, 'increment')}
                                                    className="px-4 py-2 text-gray-400 hover:text-white transition"
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-semibold">
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
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 sticky top-24">
                            <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                    <span>{currency} {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Delivery Fee</span>
                                    <span>{currency} {delivery_fee || 50}</span>
                                </div>
                                <div className="border-t border-gray-600 pt-4">
                                    <div className="flex justify-between text-lg font-semibold text-white">
                                        <span>Total</span>
                                        <span>{currency} {total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/place-order')}
                                className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3"
                            >
                                <FaCreditCard />
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={() => clearCart && clearCart()}
                                className="w-full px-8 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white mt-4 rounded-2xl transition-all duration-300"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;