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
    FaShoppingCart
} from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import io from 'socket.io-client';

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

    // Socket.IO setup
    useEffect(() => {
        if (user) {
            const newSocket = io(serverUrl, {
                withCredentials: true
            });
            
            newSocket.emit('joinUserRoom', user._id);
            
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
            
            return () => newSocket.close();
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
            const response = await axios.get(`${serverUrl}/api/orders/invoice/${orderId}`, {
                withCredentials: true,
                responseType: 'blob',
                timeout: 15000
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
        }
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
                // Socket will handle the real-time update
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

    // Function to get product image
    const getProductImage = (item) => {
        // Try multiple image sources
        const productImages = item.productId?.images || [];
        const productImage1 = item.productId?.image1;
        const productImage2 = item.productId?.image2;
        const productImage3 = item.productId?.image3;
        const productImage4 = item.productId?.image4;
        
        // Return first available image
        return productImages[0] || productImage1 || productImage2 || productImage3 || productImage4 || 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
    };

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

                {error && (
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
                    {filteredOrders.length === 0 && !error ? (
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
                                onClick={handleStartShopping}
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

                                {/* Order Items Preview - UPDATED IMAGE LOGIC */}
                                <div className="mb-6">
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {order.items?.map((item, index) => (
                                            <div key={item._id || index} className="flex-shrink-0 w-16 h-16 bg-gray-800 rounded-lg overflow-hidden">
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

                {/* Order Details Modal */}
                {showOrderDetails && selectedOrder && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Order Details</h2>
                                    <p className="text-cyan-400 font-semibold">
                                        #{selectedOrder.orderId || selectedOrder._id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="text-gray-400 hover:text-white text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Order Items - UPDATED IMAGE LOGIC */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-white">Order Items</h3>
                                    <div className="space-y-4">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div key={item._id || index} className="flex gap-4 p-4 bg-[#141414] rounded-lg border border-gray-700">
                                                <img
                                                    src={getProductImage(item)}
                                                    alt={item.productId?.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white">{item.productId?.name}</h4>
                                                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                                                    {item.size && (
                                                        <p className="text-gray-400 text-sm">Size: {item.size}</p>
                                                    )}
                                                    <p className="text-cyan-400 font-semibold">
                                                        {currency} {item.price} × {item.quantity} = {currency} {(item.price * item.quantity).toFixed(2)}
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
                                        <div className="bg-[#141414] p-4 rounded-lg border border-gray-700">
                                            <p className="text-white font-semibold">{selectedOrder.shippingAddress?.name}</p>
                                            <p className="text-gray-400">{selectedOrder.shippingAddress?.address}</p>
                                            <p className="text-gray-400">
                                                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-gray-400">
                                                <FaPhone className="text-sm" />
                                                <span>{selectedOrder.shippingAddress?.phone}</span>
                                            </div>
                                            <p className="text-gray-400">{selectedOrder.shippingAddress?.email}</p>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-white">Order Summary</h3>
                                        <div className="bg-[#141414] p-4 rounded-lg border border-gray-700 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Order Status:</span>
                                                <span className={`font-semibold ${getStatusColor(selectedOrder.status)}`}>
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
                                                        {currency} {selectedOrder.totalAmount?.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        {selectedOrder.status === 'delivered' && (
                                            <button
                                                onClick={() => downloadInvoice(selectedOrder._id)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                            >
                                                <FaDownload />
                                                Download Invoice
                                            </button>
                                        )}
                                        <button
                                            onClick={() => reorder(selectedOrder)}
                                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
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
    );
};

export default Orders;