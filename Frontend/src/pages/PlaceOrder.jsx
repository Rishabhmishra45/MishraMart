import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { shopDataContext } from '../context/ShopContext';
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/AuthContext';
import {
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaCreditCard,
    FaMoneyBillWave,
    FaShieldAlt,
    FaLock,
    FaArrowLeft,
    FaCheck
} from 'react-icons/fa';
import axios from 'axios';

const PlaceOrder = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { currency, delivery_fee } = useContext(shopDataContext);
    const { userData } = useContext(userDataContext);
    const { serverUrl } = useContext(authDataContext);

    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        firstName: userData?.name?.split(' ')[0] || '',
        lastName: userData?.name?.split(' ')[1] || '',
        email: userData?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
    });

    const subtotal = getCartTotal();
    const total = subtotal + delivery_fee;
    const tax = subtotal * 0.18; // 18% GST
    const finalTotal = total + tax;

    useEffect(() => {
        if (cartItems.length === 0 && !orderPlaced) {
            navigate('/cart');
        }
    }, [cartItems, navigate, orderPlaced]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const createOrderInDatabase = async () => {
        try {
            // Prepare order data for API
            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.id || item._id, // Use the correct product ID
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size || 'M'
                })),
                totalAmount: finalTotal,
                shippingAddress: {
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    landmark: formData.landmark
                },
                paymentMethod: selectedPayment,
                paymentStatus: selectedPayment === 'cod' ? 'pending' : 'completed'
            };

            console.log('Sending order data:', orderData);

            const response = await axios.post(`${serverUrl}/api/orders/create`, orderData, {
                withCredentials: true,
                timeout: 15000
            });

            console.log('Order creation response:', response.data);

            if (response.data.success) {
                return response.data.order;
            } else {
                throw new Error(response.data.message || 'Failed to create order');
            }

        } catch (error) {
            console.error('Order creation error:', error);
            throw error;
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedPayment) {
            alert('Please select a payment method');
            return;
        }

        // Validate required fields
        const requiredFields = ['firstName', 'phone', 'address', 'city', 'pincode'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            alert(`Please fill all required fields: ${missingFields.join(', ')}`);
            return;
        }

        setIsProcessing(true);

        try {
            // For both COD and Razorpay, create order in database
            const order = await createOrderInDatabase();
            setOrderId(order.orderId);
            setOrderPlaced(true);
            clearCart();

        } catch (error) {
            console.error('Order failed:', error);
            alert(`Order failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async () => {
        const razorpayLoaded = await loadRazorpay();
        if (!razorpayLoaded) {
            alert('Razorpay SDK failed to load. Please check your connection.');
            return;
        }

        // For testing, we'll use the same flow as COD
        await handlePlaceOrder();
    };

    const handlePaymentSelection = (method) => {
        setSelectedPayment(method);
    };

    // Function to get product image from cart item
    const getCartItemImage = (item) => {
        return item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-12 shadow-2xl shadow-blue-900/20">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheck className="text-white text-3xl" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h2>
                            <p className="text-cyan-400 text-xl font-semibold mb-2">Order ID: {orderId}</p>
                            <p className="text-gray-400 text-lg mb-6">
                                Thank you for your order. We've sent a confirmation email to {formData.email}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/collections')}
                                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-300"
                                >
                                    Continue Shopping
                                </button>
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="px-8 py-4 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-semibold rounded-2xl transition-all duration-300"
                                >
                                    View Orders
                                </button>
                            </div>
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
                    <h1 className="text-3xl sm:text-4xl font-bold">Place Order</h1>
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
                    >
                        <FaArrowLeft />
                        Back to Cart
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - User Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Personal Information */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                                <FaUser className="text-cyan-400" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 "
                                        className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                                <FaMapMarkerAlt className="text-cyan-400" />
                                Shipping Address
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Complete Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="House No., Street, Area"
                                        className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300 resize-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            PIN Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Landmark (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleInputChange}
                                        placeholder="Nearby famous place"
                                        className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                                <FaCreditCard className="text-cyan-400" />
                                Payment Method
                            </h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => handlePaymentSelection('razorpay')}
                                    className={`w-full p-4 border-2 rounded-2xl text-left transition-all duration-300 ${selectedPayment === 'razorpay'
                                            ? 'border-cyan-400 bg-cyan-400/10'
                                            : 'border-gray-600 hover:border-cyan-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'razorpay'
                                                ? 'border-cyan-400 bg-cyan-400'
                                                : 'border-gray-400'
                                            }`}>
                                            {selectedPayment === 'razorpay' && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <FaCreditCard className="text-cyan-400 text-lg" />
                                                <span className="font-semibold">Pay with Razorpay</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-1">
                                                Credit/Debit Card, UPI, Net Banking
                                            </p>
                                        </div>
                                        <FaLock className="text-green-400" />
                                    </div>
                                </button>

                                <button
                                    onClick={() => handlePaymentSelection('cod')}
                                    className={`w-full p-4 border-2 rounded-2xl text-left transition-all duration-300 ${selectedPayment === 'cod'
                                            ? 'border-cyan-400 bg-cyan-400/10'
                                            : 'border-gray-600 hover:border-cyan-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'cod'
                                                ? 'border-cyan-400 bg-cyan-400'
                                                : 'border-gray-400'
                                            }`}>
                                            {selectedPayment === 'cod' && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <FaMoneyBillWave className="text-green-400 text-lg" />
                                                <span className="font-semibold">Cash on Delivery</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-1">
                                                Pay when you receive your order
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 sticky top-24">
                            <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

                            {/* Order Items - UPDATED IMAGE LOGIC */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 pb-4 border-b border-gray-700 last:border-b-0">
                                        <img
                                            src={getCartItemImage(item)}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                            <p className="text-cyan-400 text-xs">
                                                {currency} {item.price} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-white font-semibold text-sm">
                                            {currency} {(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>{currency} {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Delivery Fee</span>
                                    <span>{currency} {delivery_fee}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Tax (18% GST)</span>
                                    <span>{currency} {tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-600 pt-3">
                                    <div className="flex justify-between text-lg font-semibold text-white">
                                        <span>Total Amount</span>
                                        <span>{currency} {finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg mb-4">
                                <FaShieldAlt className="text-green-400 text-lg" />
                                <div>
                                    <p className="text-green-400 text-sm font-semibold">Secure Payment</p>
                                    <p className="text-green-300 text-xs">Your payment information is protected</p>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={selectedPayment === 'razorpay' ? handleRazorpayPayment : handlePlaceOrder}
                                disabled={isProcessing || !selectedPayment}
                                className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaCreditCard />
                                        {selectedPayment === 'cod' ? 'Place Order' : 'Proceed to Pay'}
                                    </>
                                )}
                            </button>

                            <p className="text-gray-400 text-xs text-center mt-4">
                                By placing your order, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;