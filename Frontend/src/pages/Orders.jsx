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
    FaUser
} from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
    const navigate = useNavigate();
    const { currency } = useContext(shopDataContext);
    const { serverUrl, isAuthenticated, user, checkAuthStatus, isLoading: authLoading } = useContext(authDataContext);
    
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    // Debug info
    useEffect(() => {
        console.log('🔍 Orders Debug - Auth:', isAuthenticated, 'User:', user, 'AuthLoading:', authLoading);
    }, [isAuthenticated, user, authLoading]);

    // Real API call to fetch orders
    useEffect(() => {
        if (authLoading) {
            // Still checking authentication
            return;
        }

        if (isAuthenticated) {
            fetchOrders();
        } else {
            setError('Please login to view your orders');
            setIsLoading(false);
        }
    }, [isAuthenticated, authLoading, retryCount]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            console.log('🔄 Fetching orders from:', `${serverUrl}/api/orders/my-orders`);
            
            const response = await axios.get(`${serverUrl}/api/orders/my-orders`, {
                withCredentials: true,
                timeout: 10000
            });
            
            console.log('✅ Orders API Response:', response.data);
            
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
            console.error('❌ Error fetching orders:', error);
            
            // Enhanced error handling
            if (error.response?.status === 401) {
                setError('Your session has expired. Please login again.');
                // Re-check auth status
                setTimeout(() => {
                    checkAuthStatus();
                }, 2000);
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

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const handleRecheckAuth = () => {
        checkAuthStatus();
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
                return 'bg-green-500/20 text-green-400 border-green-400/30';
            case 'shipped':
                return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
            case 'processing':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-400/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
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
            // Check if order is delivered
            const order = orders.find(o => o._id === orderId || o.orderId === orderId);
            if (order?.status !== 'delivered') {
                alert('Invoice is available only for delivered orders.');
                return;
            }

            const response = await axios.get(`${serverUrl}/api/orders/invoice/${orderId}`, {
                withCredentials: true,
                responseType: 'blob',
                timeout: 15000
            });

            // Create blob and download
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
        }
    };

    const reorder = async (order) => {
        try {
            // Add all items from order to cart
            const cartItems = order.items.map(item => ({
                productId: item.productId?._id || item.productId,
                quantity: item.quantity,
                size: item.size
            }));

            // API call to add to cart
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
                // Update local state
                setOrders(prev => prev.map(order => 
                    order._id === orderId ? { ...order, status: 'cancelled' } : order
                ));
                alert('Order cancelled successfully');
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
            month: 'long',
            year: 'numeric'
        });
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px] flex items-center justify-center">
                <LoadingSpinner 
                    message="Checking authentication..." 
                    spinnerColor="#aaf5fa" 
                    textColor="#aaf5fa" 
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px] flex items-center justify-center">
                <LoadingSpinner 
                    message="Loading your orders..." 
                    spinnerColor="#aaf5fa" 
                    textColor="#aaf5fa" 
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Orders</h1>
                    <p className="text-gray-400">Track and manage your orders</p>
                </div>

                {!isAuthenticated ? (
                    // Not Authenticated State
                    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-yellow-700 rounded-2xl p-12 text-center shadow-2xl shadow-yellow-900/20">
                        <FaUser className="text-6xl text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Authentication Required
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Please login to view your orders
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <button
                                onClick={handleLoginRedirect}
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition duration-300"
                            >
                                Go to Login
                            </button>
                            <button
                                onClick={handleRecheckAuth}
                                className="px-6 py-3 border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 rounded-lg transition duration-300"
                            >
                                Re-check Status
                            </button>
                        </div>
                        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                            <p className="text-sm text-gray-400">
                                Debug: Server - {serverUrl} | Auth - {isAuthenticated ? 'Yes' : 'No'} | User - {user ? user.name : 'None'}
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    // Error State
                    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-red-700 rounded-2xl p-6 shadow-2xl shadow-red-900/20 mb-8">
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
                                    onClick={handleLoginRedirect}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-300 text-sm"
                                >
                                    Go to Login
                                </button>
                            )}
                            <button
                                onClick={handleRecheckAuth}
                                className="px-4 py-2 border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 rounded-lg transition duration-300 text-sm"
                            >
                                Check Auth
                            </button>
                        </div>
                    </div>
                ) : (
                    // Authenticated and No Errors - Show Orders Content
                    <>
                        {/* User Welcome */}
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-cyan-700 rounded-2xl p-6 shadow-2xl shadow-cyan-900/20 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                                    <FaUser className="text-white text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Welcome back, {user?.name}!</h3>
                                    <p className="text-cyan-400">Here are your orders</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        {orders.length > 0 && (
                            <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 mb-8">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Search */}
                                    <div className="flex-1 relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by order ID or product name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                        />
                                    </div>
                                    
                                    {/* Status Filter */}
                                    <div className="flex gap-2">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white outline-none focus:border-cyan-400 transition duration-300"
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
                        <div className="space-y-6">
                            {filteredOrders.length === 0 ? (
                                <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-12 text-center shadow-2xl shadow-blue-900/20">
                                    <FaShoppingCart className="text-6xl text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        {searchTerm || statusFilter !== 'all' 
                                            ? 'Try adjusting your search or filters' 
                                            : 'Start shopping to see your orders here'
                                        }
                                    </p>
                                    <button
                                        onClick={() => navigate('/collections')}
                                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition duration-300"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                filteredOrders.map((order) => (
                                    <div key={order._id} className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                                        {/* Order Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-white">
                                                        Order #{order.orderId || order._id}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm">
                                                    Placed on {formatDate(order.createdAt)}
                                                </p>
                                                {order.deliveredAt && order.status === 'delivered' && (
                                                    <p className="text-green-400 text-sm">
                                                        Delivered on {formatDate(order.deliveredAt)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                <span className="text-xl font-bold text-cyan-400">
                                                    {currency} {order.totalAmount?.toFixed(2)}
                                                </span>
                                                {getPaymentMethodIcon(order.paymentMethod)}
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="mb-6">
                                            <div className="flex gap-4 overflow-x-auto pb-2">
                                                {order.items?.map((item, index) => (
                                                    <div key={item._id || index} className="flex-shrink-0 w-16 h-16 bg-gray-800 rounded-lg overflow-hidden">
                                                        <img
                                                            src={item.productId?.images?.[0] || item.productId?.image || 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150'}
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
                                                Total: {currency} {order.totalAmount?.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => viewOrderDetails(order)}
                                                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                            >
                                                <FaEye />
                                                View Details
                                            </button>
                                            
                                            {order.status === 'shipped' && order.trackingNumber && (
                                                <button
                                                    onClick={() => trackOrder(order)}
                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                                >
                                                    <FaTruck />
                                                    Track Order
                                                </button>
                                            )}
                                            
                                            {order.status === 'delivered' && (
                                                <>
                                                    <button
                                                        onClick={() => downloadInvoice(order._id)}
                                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                                    >
                                                        <FaDownload />
                                                        Download Invoice
                                                    </button>
                                                    <button
                                                        onClick={() => reorder(order)}
                                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                                    >
                                                        <FaStar />
                                                        Reorder
                                                    </button>
                                                </>
                                            )}
                                            
                                            {(order.status === 'processing' || order.status === 'shipped') && (
                                                <button
                                                    onClick={() => cancelOrder(order._id)}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Order Details Modal - Same as before */}
                        {showOrderDetails && selectedOrder && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                    {/* Modal content remains the same */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Order Details</h2>
                                            <p className="text-cyan-400 font-semibold">
                                                #{selectedOrder.orderId || selectedOrder._id}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowOrderDetails(false)}
                                            className="text-gray-400 hover:text-white text-2xl transition duration-300"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {/* ... rest of modal content ... */}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;