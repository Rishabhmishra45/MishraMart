import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authDataContext } from '../context/AuthContext';
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
    FaRupeeSign,
    FaFileInvoice,
    FaStore,
    FaReceipt
} from 'react-icons/fa';
import axios from 'axios';

const Invoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { serverUrl } = useContext(authDataContext);

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
        if (!order) return;

        try {
            setIsGeneratingPDF(true);

            const response = await axios.get(`${serverUrl}/api/orders/invoice/${orderId}`, {
                withCredentials: true,
                responseType: 'blob',
                timeout: 30000
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${order.orderId || orderId}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error downloading invoice:', error);
            if (error.response?.status === 400) {
                alert(error.response.data.message || 'Invoice not available for this order.');
            } else if (error.response?.status === 404) {
                alert('Invoice not found for this order.');
            } else {
                alert('Failed to download invoice. Please try again.');
            }
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (!order) return;

        try {
            setIsGeneratingPDF(true);

            const response = await axios.get(`${serverUrl}/api/orders/invoice/${orderId}`, {
                withCredentials: true,
                responseType: 'blob',
                timeout: 30000
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const file = new File([blob], `invoice-${order.orderId}.pdf`, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Invoice - ${order.orderId}`,
                    text: `Invoice for your order ${order.orderId} from MishraMart`,
                    files: [file]
                });
            } else {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `invoice-${order.orderId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                alert('PDF downloaded. You can share the downloaded file.');
            }

        } catch (error) {
            console.error('Error sharing PDF:', error);
            if (!error.toString().includes('AbortError')) {
                handleDownload();
            }
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'razorpay':
                return <FaCreditCard className="text-cyan-400" />;
            case 'cod':
                return <FaMoneyBillWave className="text-green-400" />;
            default:
                return <FaCreditCard className="text-gray-400" />;
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'text-green-400';
            case 'shipped':
                return 'text-blue-400';
            case 'processing':
                return 'text-yellow-400';
            case 'cancelled':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckCircle className="text-green-400" />;
            case 'shipped':
                return <FaTruck className="text-blue-400" />;
            case 'processing':
                return <FaReceipt className="text-yellow-400" />;
            case 'cancelled':
                return <FaCheckCircle className="text-red-400" />;
            default:
                return <FaReceipt className="text-gray-400" />;
        }
    };

    const getProductImage = (item) => {
        const productImages = item.productId?.images || [];
        const productImage1 = item.productId?.image1;
        const productImage2 = item.productId?.image2;
        const productImage3 = item.productId?.image3;
        const productImage4 = item.productId?.image4;
        const directImage = item.image || item.productId?.image;

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
            <div className="min-h-screen bg-[#0F1C20] pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-cyan-400 text-lg">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#0F1C20] pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <div className="bg-gradient-to-br from-[#1A2A30] to-[#0F1C20] rounded-2xl p-8 shadow-lg border border-red-800">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaFileInvoice className="text-3xl text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Invoice Not Found</h2>
                        <p className="text-gray-400 mb-6">{error || 'Order not found'}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
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
        <div className="min-h-screen bg-[#0F1C20] pt-16">
            {/* Mobile Header */}
            <div className="bg-[#1A2A30] shadow-lg border-b border-gray-700 lg:hidden">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/orders')}
                            className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
                        >
                            <FaArrowLeft />
                            <span className="font-medium">Back</span>
                        </button>
                        <h1 className="text-lg font-bold text-white">Invoice</h1>
                        <div className="w-6"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                <div className="bg-gradient-to-br from-[#1A2A30] to-[#0F1C20] rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                    {/* Invoice Header */}
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 lg:p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="flex items-center gap-4">
                                {/* Company Logo Replacement - Text Only */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <div className="text-center">
                                        <FaStore className="text-3xl text-white mb-2 mx-auto" />
                                        <h1 className="text-xl font-bold text-white tracking-wider">MISHRA MART</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center lg:text-right w-full lg:w-auto">
                                <h2 className="text-2xl lg:text-3xl font-bold">INVOICE</h2>
                                <p className="text-cyan-100 text-lg lg:text-xl mt-2 font-mono">{order.orderId}</p>
                                <p className="text-cyan-100 text-sm mt-1">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Actions - Desktop */}
                    <div className="bg-[#1A2A30] px-6 lg:px-8 py-4 hidden lg:flex justify-between items-center border-b border-gray-700">
                        <div className="flex items-center text-green-400 font-semibold text-lg">
                            <FaCheckCircle className="mr-3 text-xl" />
                            <span>Payment Successful • Order {order.status}</span>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDownload}
                                disabled={isGeneratingPDF}
                                className="flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <FaDownload className="mr-2" />
                                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 text-sm font-semibold"
                            >
                                <FaPrint className="mr-2" />
                                Print
                            </button>
                            <button
                                onClick={handleShare}
                                disabled={isGeneratingPDF}
                                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <FaShare className="mr-2" />
                                Share PDF
                            </button>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="p-6 lg:p-8 space-y-8">
                        {/* Company & Customer Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                                    <FaStore className="text-cyan-400 text-xl" />
                                    From:
                                </h3>
                                <div className="bg-black/20 p-6 rounded-xl border border-gray-600 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                                            <FaStore className="text-2xl text-cyan-400" />
                                        </div>
                                        <p className="font-bold text-white text-xl tracking-wider">MISHRA MART</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-gray-400">123 Business Avenue, Tech Park</p>
                                        <p className="text-gray-400">Mumbai, Maharashtra - 400001</p>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <FaPhone className="text-sm" />
                                            <span>+91 98765 43210</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <FaEnvelope className="text-sm" />
                                            <span>support@mishramart.com</span>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-600">
                                        <p className="text-gray-400 font-medium">GSTIN: 27AABCU9603R1ZM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-cyan-400 text-xl" />
                                    Bill To:
                                </h3>
                                <div className="bg-black/20 p-6 rounded-xl border border-gray-600 space-y-4">
                                    <p className="font-bold text-white text-xl">{order.shippingAddress?.name}</p>
                                    <div className="space-y-2">
                                        <p className="text-gray-400">{order.shippingAddress?.address}</p>
                                        <p className="text-gray-400">
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                        </p>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <FaPhone className="text-sm" />
                                            <span>{order.shippingAddress?.phone}</span>
                                        </div>
                                        <p className="text-gray-400">{order.shippingAddress?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                <p className="text-xs text-cyan-400 font-medium mb-2">INVOICE NUMBER</p>
                                <p className="font-bold text-white text-sm break-all font-mono">{order.orderId}</p>
                            </div>
                            <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                <p className="text-xs text-cyan-400 font-medium mb-2">INVOICE DATE</p>
                                <p className="font-bold text-white text-sm">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                <p className="text-xs text-cyan-400 font-medium mb-2">ORDER DATE</p>
                                <p className="font-bold text-white text-sm">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                <p className="text-xs text-cyan-400 font-medium mb-2">PAYMENT METHOD</p>
                                <p className="font-bold text-white text-sm flex items-center gap-2">
                                    {getPaymentMethodIcon(order.paymentMethod)}
                                    {getPaymentMethodText(order.paymentMethod)}
                                </p>
                            </div>
                        </div>

                        {/* Order Status & Payment */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
                                <h4 className="font-semibold text-white mb-4 text-lg flex items-center gap-3">
                                    {getStatusIcon(order.status)}
                                    Order Status
                                </h4>
                                <div className="flex items-start gap-4">
                                    <div className="min-w-0 flex-1">
                                        <span className={`font-bold text-xl block ${getStatusColor(order.status)}`}>
                                            {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                        </span>
                                        {order.deliveredAt && (
                                            <p className="text-gray-400 text-sm mt-2">
                                                Delivered on {formatDate(order.deliveredAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                                <h4 className="font-semibold text-white mb-4 text-lg flex items-center gap-3">
                                    <FaCheckCircle className="text-green-400 text-xl" />
                                    Payment Status
                                </h4>
                                <div className="flex items-start gap-4">
                                    <div className="min-w-0 flex-1">
                                        <span className="font-bold text-green-400 text-xl block">
                                            {order.paymentStatus?.charAt(0)?.toUpperCase() + order.paymentStatus?.slice(1)}
                                        </span>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Paid via {getPaymentMethodText(order.paymentMethod)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-white border-b border-gray-600 pb-4">Order Items</h3>

                            {/* Desktop Table */}
                            <div className="hidden lg:block bg-black/20 border border-gray-600 rounded-xl overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-black/30 border-b border-gray-600">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider w-2/5">Product</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider w-1/5">Price</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider w-1/5">Qty</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider w-1/5">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-600">
                                        {order.items?.map((item, index) => (
                                            <tr key={item._id || index} className="hover:bg-black/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-4 min-w-0">
                                                        <img
                                                            src={getProductImage(item)}
                                                            alt={item.productId?.name}
                                                            className="w-16 h-16 object-cover rounded-lg border border-gray-600 flex-shrink-0"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                                e.target.className = 'w-16 h-16 object-cover rounded-lg border border-gray-600 flex-shrink-0 bg-gray-700';
                                                            }}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="text-base font-semibold text-white break-words">{item.productId?.name}</h4>
                                                            {item.size && (
                                                                <p className="text-sm text-gray-400 mt-1">Size: {item.size}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-base text-gray-300 flex items-center justify-end gap-1 whitespace-nowrap">
                                                        <FaRupeeSign className="text-sm flex-shrink-0" />
                                                        {item.price?.toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-base text-gray-300 whitespace-nowrap">{item.quantity}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-base font-bold text-cyan-400 flex items-center justify-end gap-1 whitespace-nowrap">
                                                        <FaRupeeSign className="text-sm flex-shrink-0" />
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
                                    <div key={item._id || index} className="bg-black/20 border border-gray-600 rounded-xl p-4">
                                        <div className="flex items-start space-x-4">
                                            <img
                                                src={getProductImage(item)}
                                                alt={item.productId?.name}
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-600 flex-shrink-0"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                    e.target.className = 'w-20 h-20 object-cover rounded-lg border border-gray-600 flex-shrink-0 bg-gray-700';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-semibold text-white mb-2 break-words">{item.productId?.name}</h4>
                                                {item.size && (
                                                    <p className="text-sm text-gray-400 mb-3">Size: {item.size}</p>
                                                )}
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-400 text-xs">Price</p>
                                                        <p className="font-semibold text-gray-300 flex items-center gap-1">
                                                            <FaRupeeSign className="text-xs" />
                                                            {item.price?.toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 text-xs">Quantity</p>
                                                        <p className="font-semibold text-gray-300">{item.quantity}</p>
                                                    </div>
                                                    <div className="col-span-2 pt-3 border-t border-gray-600">
                                                        <p className="text-gray-400 text-xs">Total</p>
                                                        <p className="font-bold text-cyan-400 text-lg flex items-center gap-1">
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

                        {/* Totals */}
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/20">
                            <div className="max-w-md ml-auto space-y-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-300 font-medium text-base">Subtotal:</span>
                                    <span className="font-semibold text-white flex items-center gap-1 text-base">
                                        <FaRupeeSign className="text-sm flex-shrink-0" />
                                        {subtotal.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-300 font-medium text-base">Shipping Fee:</span>
                                    <span className="font-semibold text-white flex items-center gap-1 text-base">
                                        <FaRupeeSign className="text-sm flex-shrink-0" />
                                        {shipping.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-300 font-medium text-base">Tax (18% GST):</span>
                                    <span className="font-semibold text-white flex items-center gap-1 text-base">
                                        <FaRupeeSign className="text-sm flex-shrink-0" />
                                        {tax.toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t border-cyan-500/30 pt-4 mt-2">
                                    <div className="flex justify-between items-center text-xl">
                                        <span className="font-bold text-white">Total Amount:</span>
                                        <span className="font-bold text-cyan-400 flex items-center gap-1 text-2xl">
                                            <FaRupeeSign className="text-lg flex-shrink-0" />
                                            {total.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="lg:hidden space-y-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                <div className="flex items-center justify-center text-green-400 font-semibold text-lg">
                                    <FaCheckCircle className="mr-3 text-xl" />
                                    Payment Successful • Order {order.status}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={isGeneratingPDF}
                                    className="flex items-center justify-center px-4 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <FaDownload className="mr-2" />
                                    {isGeneratingPDF ? 'Generating...' : 'Download'}
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center justify-center px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-base"
                                >
                                    <FaPrint className="mr-2" />
                                    Print
                                </button>
                            </div>
                            <button
                                onClick={handleShare}
                                disabled={isGeneratingPDF}
                                className="w-full flex items-center justify-center px-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <FaShare className="mr-2" />
                                Share PDF
                            </button>
                        </div>

                        {/* Thank You Message */}
                        <div className="text-center p-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative">
                                <h3 className="text-3xl font-bold text-white mb-4">Thank You for Your Order!</h3>
                                <p className="text-cyan-100 text-lg max-w-2xl mx-auto leading-relaxed">
                                    We appreciate your business and trust in MishraMart. If you have any questions about your order,
                                    please don't hesitate to contact our customer support team.
                                </p>
                                <div className="mt-6 flex flex-col sm:flex-row gap-6 justify-center items-center">
                                    <div className="flex items-center gap-3 text-cyan-100 text-lg">
                                        <FaEnvelope className="text-xl" />
                                        <span>support@mishramart.com</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-cyan-100 text-lg">
                                        <FaPhone className="text-xl" />
                                        <span>+91 98765 43210</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center pt-6 border-t border-gray-600">
                            <p className="text-gray-400 text-sm">MISHRA MART • 123 Business Avenue, Tech Park, Mumbai, Maharashtra - 400001</p>
                            <p className="text-gray-400 text-sm mt-2">GSTIN: 27AABCU9603R1ZM • support@mishramart.com • +91 98765 43210</p>
                        </div>
                    </div>
                </div>

                {/* Back Button - Desktop */}
                <div className="hidden lg:block mt-8">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-lg shadow-lg"
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
                    .bg-gradient-to-br, .bg-gradient-to-br * {
                        visibility: visible;
                    }
                    .bg-gradient-to-br {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none;
                        margin: 0;
                        padding: 0;
                        background: white !important;
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
                    .text-white {
                        color: black !important;
                    }
                    .text-gray-400 {
                        color: #666 !important;
                    }
                    .bg-black\\\\/20 {
                        background: #f8f8f8 !important;
                    }
                    .border-gray-600 {
                        border-color: #ddd !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Invoice;