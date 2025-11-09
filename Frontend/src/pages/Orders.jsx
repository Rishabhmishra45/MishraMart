import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopDataContext } from '../context/ShopContext';
import { authDataContext } from '../context/AuthContext';
import { 
    FaSearch, 
    FaFilter,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaEye,
    FaDownload,
    FaStar,
    FaMapMarkerAlt,
    FaPhone,
    FaCreditCard,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaRedo,
    FaShoppingCart,
    FaFileInvoice,
    FaArrowLeft,
    FaRupeeSign,
    FaBox,
    FaShippingFast,
    FaUndo,
    FaShare
} from 'react-icons/fa';
import axios from 'axios';

const Orders = () => {
    const navigate = useNavigate();
    const { currency } = useContext(shopDataContext);
    const { serverUrl, user } = useContext(authDataContext);
    
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Fetch orders with useCallback
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            setDataLoaded(false);
            
            const response = await axios.get(`${serverUrl}/api/orders/my-orders`, {
                withCredentials: true,
                timeout: 10000
            });
            
            if (response.data.success) {
                const ordersData = response.data.orders || [];
                setOrders(ordersData);
                
                if (ordersData.length === 0) {
                    setError('No orders found. Start shopping to see your orders here.');
                }
            } else {
                setError(response.data.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            
            if (error.response?.status === 401) {
                setError('Please login to view your orders');
            } else if (error.code === 'ECONNABORTED') {
                setError('Request timeout. Please check your internet connection.');
            } else if (error.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else if (!error.response) {
                setError('Network error. Please check if server is running.');
            } else {
                setError(error.response?.data?.message || 'Failed to load orders. Please try again.');
            }
        } finally {
            setIsLoading(false);
            setDataLoaded(true);
        }
    }, [serverUrl]);

    // Socket.IO setup - remove useCallback to simplify
    useEffect(() => {
        if (user && serverUrl && typeof io !== 'undefined') {
            try {
                const newSocket = io(serverUrl, {
                    withCredentials: true,
                    transports: ['websocket', 'polling']
                });
                
                newSocket.on('connect', () => {
                    console.log('Socket connected for orders');
                    newSocket.emit('joinUserRoom', user._id);
                });
                
                newSocket.on('orderCreated', (newOrder) => {
                    setOrders(prev => [newOrder, ...prev]);
                });
                
                newSocket.on('orderUpdated', (updatedOrder) => {
                    setOrders(prev => 
                        prev.map(order => 
                            order._id === updatedOrder._id ? updatedOrder : order
                        )
                    );
                });
                
                setSocket(newSocket);
                
                return () => {
                    newSocket.close();
                };
            } catch (error) {
                console.log('Socket initialization error:', error);
            }
        }
    }, [user, serverUrl]);

    // Initialize component - simplified
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders, retryCount]);

    // Filter orders effect
    useEffect(() => {
        let filtered = orders;
        
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.items?.some(item => 
                    item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        setFilteredOrders(filtered);
    }, [searchTerm, statusFilter, orders]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError('');
    };

    const handleStartShopping = () => {
        navigate('/collections');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckCircle className="text-green-400" />;
            case 'shipped':
                return <FaTruck className="text-blue-400" />;
            case 'processing':
                return <FaClock className="text-yellow-400" />;
            case 'cancelled':
                return <FaTimesCircle className="text-red-400" />;
            default:
                return <FaClock className="text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-900/30 text-green-400 border-green-800';
            case 'shipped':
                return 'bg-blue-900/30 text-blue-400 border-blue-800';
            case 'processing':
                return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
            case 'cancelled':
                return 'bg-red-900/30 text-red-400 border-red-800';
            default:
                return 'bg-gray-800 text-gray-400 border-gray-700';
        }
    };

    const getStatusGradient = (status) => {
        switch (status) {
            case 'delivered':
                return 'from-green-900/20 to-green-800/10';
            case 'shipped':
                return 'from-blue-900/20 to-blue-800/10';
            case 'processing':
                return 'from-yellow-900/20 to-yellow-800/10';
            case 'cancelled':
                return 'from-red-900/20 to-red-800/10';
            default:
                return 'from-gray-800 to-gray-700';
        }
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

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
    };

    const downloadInvoice = async (orderId) => {
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
            
            const order = orders.find(o => o._id === orderId);
            link.download = `invoice-${order?.orderId || orderId}.pdf`;
            
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

    const shareInvoice = async (orderId) => {
        try {
            setIsGeneratingPDF(true);
            
            const response = await axios.get(`${serverUrl}/api/orders/invoice/${orderId}`, {
                withCredentials: true,
                responseType: 'blob',
                timeout: 30000
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const file = new File([blob], `invoice-${orderId}.pdf`, { type: 'application/pdf' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Invoice - ${orderId}`,
                    text: `Invoice for your order from Mishra Mart`,
                    files: [file]
                });
            } else {
                downloadInvoice(orderId);
            }
            
        } catch (error) {
            console.error('Error sharing PDF:', error);
            if (!error.toString().includes('AbortError')) {
                downloadInvoice(orderId);
            }
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const viewInvoice = (orderId) => {
        navigate(`/invoice/${orderId}`);
    };

    const reorder = async (order) => {
        try {
            const cartItems = order.items.map(item => ({
                productId: item.productId?._id || item.productId,
                quantity: item.quantity,
                size: item.size
            }));

            await axios.post(`${serverUrl}/api/cart/add-multiple`, 
                { items: cartItems },
                { 
                    withCredentials: true,
                    timeout: 10000
                }
            );

            navigate('/cart');
        } catch (error) {
            console.error('Error reordering:', error);
            alert('Failed to reorder items. Please try again.');
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const response = await axios.put(
                `${serverUrl}/api/orders/cancel/${orderId}`,
                {
                    cancellationReason: 'Customer requested cancellation'
                },
                { 
                    withCredentials: true,
                    timeout: 10000
                }
            );

            if (response.data.success) {
                alert('Order cancelled successfully');
                fetchOrders();
            } else {
                alert(response.data.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            if (error.response?.status === 400) {
                alert(error.response.data.message || 'Cannot cancel this order.');
            } else if (error.response?.status === 404) {
                alert('Order not found.');
            } else {
                alert('Failed to cancel order. Please try again.');
            }
        }
    };

    const trackOrder = (order) => {
        if (order.trackingNumber) {
            window.open(`https://tracking.mishramart.com/${order.trackingNumber}`, '_blank');
        } else {
            alert('Tracking number not available yet.');
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

    const getProductImage = (item) => {
        const productImages = item.productId?.images || [];
        const productImage1 = item.productId?.image1;
        const productImage2 = item.productId?.image2;
        const productImage3 = item.productId?.image3;
        const productImage4 = item.productId?.image4;
        
        return productImages[0] || productImage1 || productImage2 || productImage3 || productImage4 || 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
    };

    // Loading State - Only show when actually loading orders
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0F1C20] pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-cyan-400 text-lg">Loading your orders...</p>
                </div>
            </div>
        );
    }

    // Rest of the JSX remains the same as previous version...
    return (
        <div className="min-h-screen bg-[#0F1C20] pt-[70px]">
            {/* Mobile Header */}
            <div className="bg-[#1A2A30] shadow-lg border-b border-gray-700 lg:hidden fixed top-0 left-0 right-0 z-40">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="text-lg font-bold text-white">My Orders</h1>
                        <div className="w-6"></div>
                    </div>
                </div>
            </div>

            <div className="pt-16 lg:pt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                    
                    {/* Header - Desktop */}
                    <div className="hidden lg:block mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
                        <p className="text-gray-400">Track and manage your orders</p>
                    </div>

                    {error && (
                        <div className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-800 rounded-2xl p-6 shadow-lg mb-6">
                            <div className="flex items-center gap-3 text-red-400 mb-3">
                                <FaExclamationTriangle className="text-xl" />
                                <p className="flex-1">{error}</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={handleRetry}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300 text-sm flex items-center gap-2"
                                >
                                    <FaRedo />
                                    Retry
                                </button>
                                {error.includes('login') && (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-300 text-sm"
                                    >
                                        Go to Login
                                    </button>
                                )}
                                <button
                                    onClick={handleStartShopping}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300 text-sm"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filters and Search */}
                    {orders.length > 0 && (
                        <div className="bg-[#1A2A30] rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-700 mb-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by order ID or product name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-[#0F1C20] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition duration-300 text-sm"
                                    />
                                </div>
                                
                                {/* Status Filter */}
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full lg:w-auto px-4 py-3 bg-[#0F1C20] border border-gray-600 rounded-lg text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition duration-300 text-sm"
                                    >
                                        <option value="all" className="bg-[#1A2A30]">All Orders</option>
                                        <option value="processing" className="bg-[#1A2A30]">Processing</option>
                                        <option value="shipped" className="bg-[#1A2A30]">Shipped</option>
                                        <option value="delivered" className="bg-[#1A2A30]">Delivered</option>
                                        <option value="cancelled" className="bg-[#1A2A30]">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders List */}
                    <div className="space-y-4 lg:space-y-6">
                        {filteredOrders.length === 0 && !isLoading ? (
                            <div className="bg-gradient-to-br from-[#1A2A30] to-[#0F1C20] rounded-2xl p-8 lg:p-12 text-center shadow-lg border border-gray-700">
                                <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaBox className="text-4xl text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                                </h3>
                                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'Try adjusting your search or filters to find what you are looking for.' 
                                        : 'Your order history will appear here once you start shopping. Explore our collections and find something you love!'
                                    }
                                </p>
                                <button
                                    onClick={handleStartShopping}
                                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div 
                                    key={order._id} 
                                    className={`bg-gradient-to-r ${getStatusGradient(order.status)} rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 hover:border-cyan-500/30`}
                                >
                                    {/* Order Header */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6">
                                        <div className="flex-1">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-white">
                                                    Order #{order.orderId || order._id}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1 w-fit backdrop-blur-sm`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-4 text-sm text-gray-400">
                                                <span>Placed on {formatDate(order.createdAt)}</span>
                                                {order.deliveredAt && order.status === 'delivered' && (
                                                    <span className="text-green-400">• Delivered on {formatDate(order.deliveredAt)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 lg:mt-0">
                                            <span className="text-xl font-bold text-cyan-400 flex items-center gap-1">
                                                <FaRupeeSign className="text-lg" />
                                                {order.totalAmount?.toLocaleString('en-IN')}
                                            </span>
                                            {getPaymentMethodIcon(order.paymentMethod)}
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="mb-4 lg:mb-6">
                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                            {order.items?.map((item, index) => (
                                                <div key={item._id || index} className="flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 bg-black/20 rounded-lg overflow-hidden border border-gray-600">
                                                    <img
                                                        src={getProductImage(item)}
                                                        alt={item.productId?.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} • 
                                            Total: ₹{order.totalAmount?.toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => viewOrderDetails(order)}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center transform hover:scale-105"
                                        >
                                            <FaEye className="text-sm" />
                                            <span>View Details</span>
                                        </button>
                                        
                                        {order.status === 'shipped' && order.trackingNumber && (
                                            <button
                                                onClick={() => trackOrder(order)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center transform hover:scale-105"
                                            >
                                                <FaShippingFast className="text-sm" />
                                                <span>Track Order</span>
                                            </button>
                                        )}
                                        
                                        {order.status === 'delivered' && (
                                            <>
                                                <button
                                                    onClick={() => viewInvoice(order._id)}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center transform hover:scale-105"
                                                >
                                                    <FaFileInvoice className="text-sm" />
                                                    <span>Invoice</span>
                                                </button>
                                                <button
                                                    onClick={() => downloadInvoice(order._id)}
                                                    disabled={isGeneratingPDF}
                                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                >
                                                    <FaDownload className="text-sm" />
                                                    <span>{isGeneratingPDF ? 'Generating...' : 'PDF'}</span>
                                                </button>
                                                <button
                                                    onClick={() => shareInvoice(order._id)}
                                                    disabled={isGeneratingPDF}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                >
                                                    <FaShare className="text-sm" />
                                                    <span>Share</span>
                                                </button>
                                            </>
                                        )}
                                        
                                        {(order.status === 'processing' || order.status === 'shipped') && (
                                            <button
                                                onClick={() => cancelOrder(order._id)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center transform hover:scale-105"
                                            >
                                                <span>Cancel</span>
                                            </button>
                                        )}

                                        {order.status === 'delivered' && (
                                            <button
                                                onClick={() => reorder(order)}
                                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center transform hover:scale-105"
                                            >
                                                <FaUndo className="text-sm" />
                                                <span>Reorder</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Details Modal */}
                    {showOrderDetails && selectedOrder && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-[#1A2A30] to-[#0F1C20] rounded-2xl p-4 lg:p-6 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl lg:text-2xl font-bold text-white">Order Details</h2>
                                        <p className="text-cyan-400 font-semibold">
                                            #{selectedOrder.orderId || selectedOrder._id}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowOrderDetails(false)}
                                        className="text-gray-400 hover:text-white text-xl transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                    {/* Order Items */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-white">Order Items</h3>
                                        <div className="space-y-3">
                                            {selectedOrder.items?.map((item, index) => (
                                                <div key={item._id || index} className="flex gap-3 p-3 bg-black/20 rounded-lg border border-gray-600">
                                                    <img
                                                        src={getProductImage(item)}
                                                        alt={item.productId?.name}
                                                        className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded flex-shrink-0"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-white text-sm lg:text-base">{item.productId?.name}</h4>
                                                        <p className="text-gray-400 text-xs lg:text-sm">Quantity: {item.quantity}</p>
                                                        {item.size && (
                                                            <p className="text-gray-400 text-xs lg:text-sm">Size: {item.size}</p>
                                                        )}
                                                        <p className="text-cyan-400 font-semibold text-sm lg:text-base">
                                                            ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Information */}
                                    <div className="space-y-6">
                                        {/* Shipping Address */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-cyan-400" />
                                                Shipping Address
                                            </h3>
                                            <div className="bg-black/20 p-4 rounded-lg border border-gray-600">
                                                <p className="font-semibold text-white">{selectedOrder.shippingAddress?.name}</p>
                                                <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress?.address}</p>
                                                <p className="text-gray-400 text-sm">
                                                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                                                    <FaPhone className="text-xs" />
                                                    <span>{selectedOrder.shippingAddress?.phone}</span>
                                                </div>
                                                <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress?.email}</p>
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-white">Order Summary</h3>
                                            <div className="bg-black/20 p-4 rounded-lg border border-gray-600 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Order Status:</span>
                                                    <span className={`font-semibold ${getStatusColor(selectedOrder.status)} px-2 py-1 rounded text-xs`}>
                                                        {selectedOrder.status?.charAt(0)?.toUpperCase() + selectedOrder.status?.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Payment Method:</span>
                                                    <span className="text-white flex items-center gap-1">
                                                        {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                                                        {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Payment Status:</span>
                                                    <span className={`font-semibold ${
                                                        selectedOrder.paymentStatus === 'completed' ? 'text-green-400' : 
                                                        selectedOrder.paymentStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                        {selectedOrder.paymentStatus?.charAt(0)?.toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="border-t border-gray-600 pt-2 mt-2">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span className="text-white">Total Amount:</span>
                                                        <span className="text-cyan-400">
                                                            ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3">
                                            {selectedOrder.status === 'delivered' && (
                                                <>
                                                    <button
                                                        onClick={() => viewInvoice(selectedOrder._id)}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm transform hover:scale-105"
                                                    >
                                                        <FaFileInvoice />
                                                        View Invoice
                                                    </button>
                                                    <button
                                                        onClick={() => downloadInvoice(selectedOrder._id)}
                                                        disabled={isGeneratingPDF}
                                                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                    >
                                                        <FaDownload />
                                                        {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                                                    </button>
                                                    <button
                                                        onClick={() => shareInvoice(selectedOrder._id)}
                                                        disabled={isGeneratingPDF}
                                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                    >
                                                        <FaShare />
                                                        Share PDF
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => reorder(selectedOrder)}
                                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm transform hover:scale-105"
                                            >
                                                <FaUndo />
                                                Reorder All Items
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;