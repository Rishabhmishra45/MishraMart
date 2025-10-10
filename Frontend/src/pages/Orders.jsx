import React, { useState, useContext, useEffect } from 'react';
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
    FaRupeeSign
} from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

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

    // Socket.IO setup with error handling
    useEffect(() => {
        if (user && serverUrl) {
            try {
                // Check if Socket.IO is available
                if (typeof io !== 'undefined') {
                    const newSocket = io(serverUrl, {
                        withCredentials: true,
                        transports: ['websocket', 'polling'] // Fallback to polling if websocket fails
                    });
                    
                    newSocket.on('connect', () => {
                        console.log('Socket connected');
                        newSocket.emit('joinUserRoom', user._id);
                    });
                    
                    newSocket.on('connect_error', (error) => {
                        console.log('Socket connection error:', error);
                        // Silently handle connection errors - don't show to user
                    });
                    
                    newSocket.on('orderCreated', (newOrder) => {
                        setOrders(prev => [newOrder, ...prev]);
                        setFilteredOrders(prev => [newOrder, ...prev]);
                    });
                    
                    newSocket.on('orderUpdated', (updatedOrder) => {
                        setOrders(prev => 
                            prev.map(order => 
                                order._id === updatedOrder._id ? updatedOrder : order
                            )
                        );
                        setFilteredOrders(prev => 
                            prev.map(order => 
                                order._id === updatedOrder._id ? updatedOrder : order
                            )
                        );
                    });
                    
                    setSocket(newSocket);
                } else {
                    console.log('Socket.IO not available, real-time updates disabled');
                }
            } catch (error) {
                console.log('Socket initialization error:', error);
                // Silently handle initialization errors
            }
            
            return () => {
                if (socket) {
                    socket.close();
                }
            };
        }
    }, [user, serverUrl]);

    // Fetch orders
    useEffect(() => {
        fetchOrders();
    }, [retryCount]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const response = await axios.get(`${serverUrl}/api/orders/my-orders`, {
                withCredentials: true,
                timeout: 10000
            });
            
            if (response.data.success) {
                const ordersData = response.data.orders || [];
                setOrders(ordersData);
                setFilteredOrders(ordersData);
                
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
        }
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError('');
    };

    const handleStartShopping = () => {
        navigate('/collections');
    };

    useEffect(() => {
        let filtered = orders;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.items?.some(item => 
                    item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        setFilteredOrders(filtered);
    }, [searchTerm, statusFilter, orders]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckCircle className="text-green-500" />;
            case 'shipped':
                return <FaTruck className="text-blue-500" />;
            case 'processing':
                return <FaClock className="text-yellow-500" />;
            case 'cancelled':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaClock className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
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
                timeout: 30000 // Increased timeout for PDF generation
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
            
            // Check if Web Share API is available and can share files
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Invoice - ${orderId}`,
                    text: `Invoice for your order from Mishra Mart`,
                    files: [file]
                });
            } else {
                // Fallback to download if sharing is not supported
                downloadInvoice(orderId);
            }
            
        } catch (error) {
            console.error('Error sharing PDF:', error);
            
            // If sharing fails or user cancels, fallback to download
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
                // Refresh orders to update status
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
            year: 'numeric'
        });
    };

    // Function to get product image
    const getProductImage = (item) => {
        const productImages = item.productId?.images || [];
        const productImage1 = item.productId?.image1;
        const productImage2 = item.productId?.image2;
        const productImage3 = item.productId?.image3;
        const productImage4 = item.productId?.image4;
        
        return productImages[0] || productImage1 || productImage2 || productImage3 || productImage4 || 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
                <LoadingSpinner 
                    message="Loading your orders..." 
                    spinnerColor="#06b6d4" 
                    textColor="#06b6d4" 
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="bg-white shadow-sm border-b lg:hidden fixed top-0 left-0 right-0 z-40">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
                        <div className="w-6"></div>
                    </div>
                </div>
            </div>

            <div className="pt-16 lg:pt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                    
                    {/* Header - Desktop */}
                    <div className="hidden lg:block mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                        <p className="text-gray-600">Track and manage your orders</p>
                    </div>

                    {error && (
                        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm mb-6">
                            <div className="flex items-center gap-3 text-red-600 mb-3">
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
                        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 mb-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by order ID or product name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition duration-300 text-sm"
                                    />
                                </div>
                                
                                {/* Status Filter */}
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full lg:w-auto px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition duration-300 text-sm"
                                    >
                                        <option value="all">All Orders</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders List */}
                    <div className="space-y-4 lg:space-y-6">
                        {filteredOrders.length === 0 && !error ? (
                            <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-200">
                                <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'Try adjusting your search or filters' 
                                        : 'Start shopping to see your orders here'
                                    }
                                </p>
                                <button
                                    onClick={handleStartShopping}
                                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition duration-300"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div key={order._id} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                                    {/* Order Header */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6">
                                        <div className="flex-1">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Order #{order.orderId || order._id}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-4 text-sm text-gray-600">
                                                <span>Placed on {formatDate(order.createdAt)}</span>
                                                {order.deliveredAt && order.status === 'delivered' && (
                                                    <span className="text-green-600">• Delivered on {formatDate(order.deliveredAt)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 lg:mt-0">
                                            <span className="text-xl font-bold text-cyan-600 flex items-center gap-1">
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
                                                <div key={item._id || index} className="flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
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
                                        <p className="text-gray-600 text-sm mt-2">
                                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} • 
                                            Total: ₹{order.totalAmount?.toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => viewOrderDetails(order)}
                                            className="px-3 lg:px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center"
                                        >
                                            <FaEye className="text-xs lg:text-sm" />
                                            <span className="hidden lg:inline">View Details</span>
                                            <span className="lg:hidden">Details</span>
                                        </button>
                                        
                                        {order.status === 'shipped' && order.trackingNumber && (
                                            <button
                                                onClick={() => trackOrder(order)}
                                                className="px-3 lg:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center"
                                            >
                                                <FaTruck className="text-xs lg:text-sm" />
                                                <span className="hidden lg:inline">Track Order</span>
                                                <span className="lg:hidden">Track</span>
                                            </button>
                                        )}
                                        
                                        {order.status === 'delivered' && (
                                            <>
                                                <button
                                                    onClick={() => viewInvoice(order._id)}
                                                    className="px-3 lg:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center"
                                                >
                                                    <FaFileInvoice className="text-xs lg:text-sm" />
                                                    <span className="hidden lg:inline">View Invoice</span>
                                                    <span className="lg:hidden">Invoice</span>
                                                </button>
                                                <button
                                                    onClick={() => downloadInvoice(order._id)}
                                                    disabled={isGeneratingPDF}
                                                    className="px-3 lg:px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FaDownload className="text-xs lg:text-sm" />
                                                    <span className="hidden lg:inline">
                                                        {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                                                    </span>
                                                    <span className="lg:hidden">
                                                        {isGeneratingPDF ? 'Generating...' : 'PDF'}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => shareInvoice(order._id)}
                                                    disabled={isGeneratingPDF}
                                                    className="px-3 lg:px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FaStar className="text-xs lg:text-sm" />
                                                    <span className="hidden lg:inline">Share PDF</span>
                                                    <span className="lg:hidden">Share</span>
                                                </button>
                                                <button
                                                    onClick={() => reorder(order)}
                                                    className="px-3 lg:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center"
                                                >
                                                    <FaStar className="text-xs lg:text-sm" />
                                                    <span className="hidden lg:inline">Reorder</span>
                                                    <span className="lg:hidden">Reorder</span>
                                                </button>
                                            </>
                                        )}
                                        
                                        {(order.status === 'processing' || order.status === 'shipped') && (
                                            <button
                                                onClick={() => cancelOrder(order._id)}
                                                className="px-3 lg:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm flex-1 lg:flex-none justify-center"
                                            >
                                                <span className="hidden lg:inline">Cancel Order</span>
                                                <span className="lg:hidden">Cancel</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Details Modal */}
                    {showOrderDetails && selectedOrder && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Order Details</h2>
                                        <p className="text-cyan-600 font-semibold">
                                            #{selectedOrder.orderId || selectedOrder._id}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowOrderDetails(false)}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                    {/* Order Items */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Items</h3>
                                        <div className="space-y-3">
                                            {selectedOrder.items?.map((item, index) => (
                                                <div key={item._id || index} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <img
                                                        src={getProductImage(item)}
                                                        alt={item.productId?.name}
                                                        className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded flex-shrink-0"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm lg:text-base">{item.productId?.name}</h4>
                                                        <p className="text-gray-600 text-xs lg:text-sm">Quantity: {item.quantity}</p>
                                                        {item.size && (
                                                            <p className="text-gray-600 text-xs lg:text-sm">Size: {item.size}</p>
                                                        )}
                                                        <p className="text-cyan-600 font-semibold text-sm lg:text-base">
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
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-cyan-600" />
                                                Shipping Address
                                            </h3>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress?.name}</p>
                                                <p className="text-gray-600 text-sm">{selectedOrder.shippingAddress?.address}</p>
                                                <p className="text-gray-600 text-sm">
                                                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                                                    <FaPhone className="text-xs" />
                                                    <span>{selectedOrder.shippingAddress?.phone}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm">{selectedOrder.shippingAddress?.email}</p>
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900">Order Summary</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Order Status:</span>
                                                    <span className={`font-semibold ${getStatusColor(selectedOrder.status)} px-2 py-1 rounded text-xs`}>
                                                        {selectedOrder.status?.charAt(0)?.toUpperCase() + selectedOrder.status?.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Payment Method:</span>
                                                    <span className="text-gray-900 flex items-center gap-1">
                                                        {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                                                        {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Payment Status:</span>
                                                    <span className={`font-semibold ${
                                                        selectedOrder.paymentStatus === 'completed' ? 'text-green-600' : 
                                                        selectedOrder.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                        {selectedOrder.paymentStatus?.charAt(0)?.toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="border-t border-gray-300 pt-2 mt-2">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span className="text-gray-900">Total Amount:</span>
                                                        <span className="text-cyan-600">
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
                                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                                    >
                                                        <FaFileInvoice />
                                                        View Invoice
                                                    </button>
                                                    <button
                                                        onClick={() => downloadInvoice(selectedOrder._id)}
                                                        disabled={isGeneratingPDF}
                                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaDownload />
                                                        {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                                                    </button>
                                                    <button
                                                        onClick={() => shareInvoice(selectedOrder._id)}
                                                        disabled={isGeneratingPDF}
                                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaStar />
                                                        Share PDF
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => reorder(selectedOrder)}
                                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                            >
                                                <FaStar />
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