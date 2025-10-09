import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authDataContext } from '../context/AuthContext';
import Logo from '../assets/logo.png';
import { 
    FaDownload, 
    FaPrint, 
    FaShare, 
    FaArrowLeft, 
    FaCheckCircle,
    FaTruck,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaCreditCard,
    FaMoneyBillWave,
    FaShoppingBag,
    FaRupeeSign
} from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Invoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { serverUrl } = useContext(authDataContext);
    
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${serverUrl}/api/orders/${orderId}`, {
                    withCredentials: true,
                    timeout: 10000
                });

                if (response.data.success) {
                    setOrder(response.data.order);
                } else {
                    setError('Order not found');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                setError('Failed to load order details');
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId, serverUrl]);

    const handleDownload = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/orders/invoice/${orderId}`, {
                withCredentials: true,
                responseType: 'blob',
                timeout: 15000
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${order?.orderId || orderId}.pdf`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Failed to download invoice. Please try again.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Invoice - ${order?.orderId}`,
                text: `Invoice for your order ${order?.orderId} from Mishra Mart`,
                url: window.location.href,
            });
        } else {
            alert('Web Share API not supported in your browser');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'razorpay':
                return <FaCreditCard className="text-cyan-600" />;
            case 'cod':
                return <FaMoneyBillWave className="text-green-600" />;
            default:
                return <FaCreditCard className="text-gray-600" />;
        }
    };

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'razorpay':
                return 'Online Payment';
            case 'cod':
                return 'Cash on Delivery';
            default:
                return method;
        }
    };

    // Function to get product image - IMPROVED VERSION
    const getProductImage = (item) => {
        // Check all possible image sources with priority
        const productImages = item.productId?.images || [];
        const productImage1 = item.productId?.image1;
        const productImage2 = item.productId?.image2;
        const productImage3 = item.productId?.image3;
        const productImage4 = item.productId?.image4;
        
        // Check if item has direct image property
        const directImage = item.image || item.productId?.image;
        
        // Return first available image with priority
        return directImage || 
               productImages[0] || 
               productImage1 || 
               productImage2 || 
               productImage3 || 
               productImage4 || 
               'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
                <LoadingSpinner 
                    message="Loading invoice..." 
                    spinnerColor="#06b6d4" 
                    textColor="#06b6d4" 
                />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition duration-300"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate tax and other amounts
    const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const tax = subtotal * 0.18;
    const shipping = 50;
    const total = order.totalAmount || (subtotal + tax + shipping);

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Mobile Header */}
            <div className="bg-white shadow-sm border-b lg:hidden">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/orders')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <FaArrowLeft />
                            <span className="font-medium">Back</span>
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">Invoice</h1>
                        <div className="w-6"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Invoice Header */}
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="flex items-center gap-4">
                                {/* Company Logo */}
                                <div className="bg-white rounded-xl p-3 shadow-lg">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">Logo</span>
                                    </div>
                                </div>
                                <div className="text-center lg:text-left">
                                    <h1 className="text-2xl lg:text-3xl font-bold">MISHRA MART</h1>
                                    <p className="text-cyan-100 text-sm lg:text-base mt-1">Your Trusted Shopping Partner</p>
                                </div>
                            </div>
                            <div className="text-center lg:text-right w-full lg:w-auto">
                                <h2 className="text-xl lg:text-2xl font-semibold">INVOICE</h2>
                                <p className="text-cyan-100 text-sm lg:text-base mt-1">{order.orderId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Actions - Desktop */}
                    <div className="bg-gray-50 px-6 lg:px-8 py-4 hidden lg:flex justify-between items-center border-b border-gray-200">
                        <div className="flex items-center text-green-600 font-medium">
                            <FaCheckCircle className="mr-2" />
                            <span>Payment Successful • Order {order.status}</span>
                        </div>
                        <div className="flex space-x-3">
                            <button 
                                onClick={handleDownload}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                            >
                                <FaDownload className="mr-2" />
                                Download PDF
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                            >
                                <FaPrint className="mr-2" />
                                Print
                            </button>
                            <button 
                                onClick={handleShare}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                            >
                                <FaShare className="mr-2" />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="p-6 lg:p-8 space-y-8">
                        {/* Company & Customer Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                                    <FaShoppingBag className="text-cyan-600 text-xl" />
                                    From:
                                </h3>
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                                    <p className="font-semibold text-gray-900 text-lg">MISHRA MART</p>
                                    <div className="space-y-1">
                                        <p className="text-gray-600">123 Business Avenue, Tech Park</p>
                                        <p className="text-gray-600">Mumbai, Maharashtra - 400001</p>
                                        <p className="text-gray-600">+91 98765 43210</p>
                                        <p className="text-gray-600">support@mishramart.com</p>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200">
                                        <p className="text-gray-600 font-medium">GSTIN: 27AABCU9603R1ZM</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-cyan-600 text-xl" />
                                    Bill To:
                                </h3>
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                                    <p className="font-semibold text-gray-900 text-lg">{order.shippingAddress?.name}</p>
                                    <div className="space-y-1">
                                        <p className="text-gray-600">{order.shippingAddress?.address}</p>
                                        <p className="text-gray-600">
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                        </p>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaPhone className="text-sm" />
                                            <span>{order.shippingAddress?.phone}</span>
                                        </div>
                                        <p className="text-gray-600">{order.shippingAddress?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                                <p className="text-xs text-cyan-600 font-medium mb-2">INVOICE NUMBER</p>
                                <p className="font-semibold text-gray-900 text-sm break-all">{order.orderId}</p>
                            </div>
                            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                                <p className="text-xs text-cyan-600 font-medium mb-2">INVOICE DATE</p>
                                <p className="font-semibold text-gray-900 text-sm">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                                <p className="text-xs text-cyan-600 font-medium mb-2">ORDER DATE</p>
                                <p className="font-semibold text-gray-900 text-sm">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                                <p className="text-xs text-cyan-600 font-medium mb-2">PAYMENT METHOD</p>
                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                    {getPaymentMethodIcon(order.paymentMethod)}
                                    {getPaymentMethodText(order.paymentMethod)}
                                </p>
                            </div>
                        </div>

                        {/* Order Status & Payment - FIXED OVERLAPPING */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                                <h4 className="font-semibold text-gray-800 mb-4 text-lg">Order Status</h4>
                                <div className="flex items-start gap-4">
                                    {order.status === 'delivered' && <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />}
                                    {order.status === 'shipped' && <FaTruck className="text-blue-500 text-xl mt-1 flex-shrink-0" />}
                                    <div className="min-w-0 flex-1">
                                        <span className={`font-bold text-lg block ${
                                            order.status === 'delivered' ? 'text-green-600' :
                                            order.status === 'shipped' ? 'text-blue-600' :
                                            order.status === 'processing' ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                        </span>
                                        {order.deliveredAt && (
                                            <p className="text-gray-600 text-sm mt-2">
                                                Delivered on {formatDate(order.deliveredAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                                <h4 className="font-semibold text-gray-800 mb-4 text-lg">Payment Status</h4>
                                <div className="flex items-start gap-4">
                                    <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <span className="font-bold text-green-600 text-lg block">
                                            {order.paymentStatus?.charAt(0)?.toUpperCase() + order.paymentStatus?.slice(1)}
                                        </span>
                                        <p className="text-gray-600 text-sm mt-2">
                                            Paid via {getPaymentMethodText(order.paymentMethod)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table - FIXED IMAGES & OVERLAPPING */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Order Items</h3>
                            
                            {/* Desktop Table */}
                            <div className="hidden lg:block bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-2/5">Product</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider w-1/5">Price</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider w-1/5">Qty</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider w-1/5">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {order.items?.map((item, index) => (
                                            <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-4 min-w-0">
                                                        <img 
                                                            src={getProductImage(item)} 
                                                            alt={item.productId?.name}
                                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                                e.target.className = 'w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0 bg-gray-100';
                                                            }}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="text-sm font-semibold text-gray-900 break-words">{item.productId?.name}</h4>
                                                            {item.size && (
                                                                <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm text-gray-700 flex items-center justify-end gap-1 whitespace-nowrap">
                                                        <FaRupeeSign className="text-xs flex-shrink-0" />
                                                        {item.price?.toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm text-gray-700 whitespace-nowrap">{item.quantity}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-semibold text-gray-900 flex items-center justify-end gap-1 whitespace-nowrap">
                                                        <FaRupeeSign className="text-xs flex-shrink-0" />
                                                        {(item.price * item.quantity)?.toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-4">
                                {order.items?.map((item, index) => (
                                    <div key={item._id || index} className="bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-start space-x-4">
                                            <img 
                                                src={getProductImage(item)} 
                                                alt={item.productId?.name}
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                    e.target.className = 'w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0 bg-gray-100';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-semibold text-gray-900 mb-2 break-words">{item.productId?.name}</h4>
                                                {item.size && (
                                                    <p className="text-sm text-gray-500 mb-3">Size: {item.size}</p>
                                                )}
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600 text-xs">Price</p>
                                                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                            <FaRupeeSign className="text-xs" />
                                                            {item.price?.toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 text-xs">Quantity</p>
                                                        <p className="font-semibold text-gray-900">{item.quantity}</p>
                                                    </div>
                                                    <div className="col-span-2 pt-2 border-t border-gray-200">
                                                        <p className="text-gray-600 text-xs">Total</p>
                                                        <p className="font-semibold text-cyan-600 text-lg flex items-center gap-1">
                                                            <FaRupeeSign className="text-sm" />
                                                            {(item.price * item.quantity)?.toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals - FIXED OVERLAPPING */}
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                            <div className="max-w-md ml-auto space-y-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-700 font-medium text-sm lg:text-base">Subtotal:</span>
                                    <span className="font-semibold text-gray-900 flex items-center gap-1 text-sm lg:text-base">
                                        <FaRupeeSign className="text-xs lg:text-sm flex-shrink-0" />
                                        {subtotal.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-700 font-medium text-sm lg:text-base">Shipping Fee:</span>
                                    <span className="font-semibold text-gray-900 flex items-center gap-1 text-sm lg:text-base">
                                        <FaRupeeSign className="text-xs lg:text-sm flex-shrink-0" />
                                        {shipping.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-700 font-medium text-sm lg:text-base">Tax (18% GST):</span>
                                    <span className="font-semibold text-gray-900 flex items-center gap-1 text-sm lg:text-base">
                                        <FaRupeeSign className="text-xs lg:text-sm flex-shrink-0" />
                                        {tax.toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t border-cyan-300 pt-4 mt-2">
                                    <div className="flex justify-between items-center text-lg lg:text-xl">
                                        <span className="font-bold text-gray-900">Total Amount:</span>
                                        <span className="font-bold text-cyan-600 flex items-center gap-1">
                                            <FaRupeeSign className="text-sm lg:text-base flex-shrink-0" />
                                            {total.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="lg:hidden space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center justify-center text-green-700 font-semibold">
                                    <FaCheckCircle className="mr-2" />
                                    Payment Successful • Order {order.status}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={handleDownload}
                                    className="flex items-center justify-center px-4 py-4 bg-cyan-500 text-white rounded-xl font-semibold transition hover:bg-cyan-600 text-base"
                                >
                                    <FaDownload className="mr-2" />
                                    Download
                                </button>
                                <button 
                                    onClick={handlePrint}
                                    className="flex items-center justify-center px-4 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold transition hover:bg-gray-50 text-base"
                                >
                                    <FaPrint className="mr-2" />
                                    Print
                                </button>
                            </div>
                        </div>

                        {/* Thank You Message */}
                        <div className="text-center p-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                            <h3 className="text-2xl font-bold text-white mb-3">Thank You for Your Order!</h3>
                            <p className="text-cyan-100 text-lg max-w-2xl mx-auto leading-relaxed">
                                We appreciate your business and trust in Mishra Mart. If you have any questions about your order, 
                                please don't hesitate to contact our customer support team.
                            </p>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <div className="flex items-center gap-2 text-cyan-100">
                                    <FaEnvelope />
                                    <span>support@mishramart.com</span>
                                </div>
                                <div className="flex items-center gap-2 text-cyan-100">
                                    <FaPhone />
                                    <span>+91 98765 43210</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center pt-6 border-t border-gray-200">
                            <p className="text-gray-500 text-sm">MISHRA MART • 123 Business Avenue, Tech Park, Mumbai, Maharashtra - 400001</p>
                            <p className="text-gray-500 text-sm mt-2">GSTIN: 27AABCU9603R1ZM • support@mishramart.com • +91 98765 43210</p>
                        </div>
                    </div>
                </div>

                {/* Back Button - Desktop */}
                <div className="hidden lg:block mt-8">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition duration-300 text-lg"
                    >
                        <FaArrowLeft />
                        Back to Orders
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .bg-white, .bg-white * {
                        visibility: visible;
                    }
                    .bg-white {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none;
                        margin: 0;
                        padding: 0;
                    }
                    .bg-gradient-to-r {
                        background: #0891b2 !important;
                        -webkit-print-color-adjust: exact;
                    }
                    button, .bg-gray-100, .lg\\\\:hidden {
                        display: none !important;
                    }
                    .mt-8, .mt-6 {
                        display: none !important;
                    }
                    .space-y-8 > * + * {
                        margin-top: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Invoice;