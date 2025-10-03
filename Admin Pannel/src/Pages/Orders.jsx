import React, { useState, useContext, useEffect } from 'react';
import { authDataContext } from '../context/AuthContext';
import {
    FaSearch,
    FaFilter,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaEye,
    FaEdit,
    FaUser,
    FaMapMarkerAlt,
    FaPhone,
    FaCreditCard,
    FaMoneyBillWave,
    FaBox,
    FaShippingFast,
    FaCheckDouble
} from 'react-icons/fa';
import axios from 'axios';
import OrderNotification from '../components/OrderNotification';

const Orders = () => {
    const { serverUrl } = useContext(authDataContext);

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [notification, setNotification] = useState({
        isVisible: false,
        type: '',
        message: ''
    });

    // Fetch all orders
    useEffect(() => {
        fetchAllOrders();
    }, []);

    // Auto-hide notification
    useEffect(() => {
        if (!notification.isVisible) return;

        const timer = setTimeout(() => {
            setNotification({ isVisible: false, type: '', message: '' });
        }, 4000);

        return () => clearTimeout(timer);
    }, [notification]);

    const showNotification = (type, message) => {
        setNotification({
            isVisible: true,
            type,
            message
        });
    };

    const fetchAllOrders = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${serverUrl}/api/orders/admin/all-orders`, {
                withCredentials: true,
            });

            if (response.data.success) {
                setOrders(response.data.orders);
                setFilteredOrders(response.data.orders);
                showNotification('success', 'Orders loaded successfully');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            showNotification('error', 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters
    useEffect(() => {
        let filtered = orders;

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.shippingAddress?.phone?.includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    }, [searchTerm, statusFilter, orders]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckDouble className="text-green-400" />;
            case 'shipped':
                return <FaShippingFast className="text-blue-400" />;
            case 'processing':
                return <FaBox className="text-yellow-400" />;
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

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const updateData = { status: newStatus };

            if (newStatus === 'shipped' && trackingNumber) {
                updateData.trackingNumber = trackingNumber;
            }

            const response = await axios.put(
                `${serverUrl}/api/orders/status/${orderId}`,
                updateData,
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update local state
                setOrders(prev =>
                    prev.map(order =>
                        order._id === orderId ? response.data.order : order
                    )
                );
                setUpdatingOrder(null);
                setTrackingNumber('');

                // Show success notification based on status
                const orderNumber = response.data.order.orderId;
                let message = '';

                switch (newStatus) {
                    case 'processing':
                        message = `Order #${orderNumber} marked as Processing`;
                        break;
                    case 'shipped':
                        message = `Order #${orderNumber} has been shipped! Tracking: ${trackingNumber}`;
                        break;
                    case 'delivered':
                        message = `Order #${orderNumber} has been delivered successfully!`;
                        break;
                    case 'cancelled':
                        message = `Order #${orderNumber} has been cancelled`;
                        break;
                    default:
                        message = `Order #${orderNumber} status updated to ${newStatus}`;
                }

                showNotification(newStatus, message);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            showNotification('error', 'Failed to update order status');
        }
    };

    const startStatusUpdate = (order, newStatus) => {
        setUpdatingOrder({ id: order._id, status: newStatus });
        if (newStatus === 'shipped') {
            setTrackingNumber(order.trackingNumber || '');
        }
    };

    const cancelStatusUpdate = () => {
        setUpdatingOrder(null);
        setTrackingNumber('');
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
        return productImages[0] || productImage1 || 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'processing':
                return 'shipped';
            case 'shipped':
                return 'delivered';
            default:
                return null;
        }
    };

    const getStatusActions = (order) => {
        const actions = [];
        const nextStatus = getNextStatus(order.status);

        if (nextStatus) {
            actions.push({
                label: nextStatus === 'shipped' ? 'Mark as Shipped' : 'Mark as Delivered',
                status: nextStatus,
                color: nextStatus === 'shipped' ? 'blue' : 'green'
            });
        }

        if (order.status !== 'cancelled') {
            actions.push({
                label: 'Cancel Order',
                status: 'cancelled',
                color: 'red'
            });
        }

        return actions;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-cyan-400">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 xs:px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
            <div className="max-w-5xl mx-auto pb-6 sm:pb-10 mt-4 sm:mt-[30px]">

                {/* Order Notification Component */}
                <OrderNotification
                    isVisible={notification.isVisible}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ isVisible: false, type: '', message: '' })}
                />

                {/* Header - Lists section jaisa */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                    Order Management
                </h1>
                <p className="text-gray-300 mt-2 mb-4 sm:mb-8 text-sm sm:text-base">Manage and track all customer orders</p>

                {/* Filters and Search - Lists section jaisa */}
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700/50">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order ID, customer name, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300 text-sm sm:text-base"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white outline-none focus:border-cyan-400 transition duration-300 text-sm sm:text-base flex-1"
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

                {/* Orders Count */}
                <div className="mb-4 sm:mb-6">
                    <p className="text-gray-400 text-sm sm:text-base">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </p>
                </div>

                {/* Orders List - Lists section jaisa styling */}
                <div className="grid gap-3 sm:gap-4 lg:gap-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center border border-gray-700/50">
                            <FaBox className="text-4xl sm:text-6xl text-gray-500 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                                {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                            </h3>
                            <p className="text-gray-400 text-sm sm:text-base">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Orders will appear here when customers place them'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-gray-800/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:shadow-xl"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                            {/* Order Items Preview */}
                                            <div className="flex gap-2">
                                                {order.items?.slice(0, 3).map((item, index) => (
                                                    <div key={item._id || index} className="flex-shrink-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 bg-gray-700 rounded-lg overflow-hidden">
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
                                                {order.items?.length > 3 && (
                                                    <div className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-2">
                                                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white truncate">
                                                    Order #{order.orderId}
                                                </h3>
                                                <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                                </span>
                                            </div>

                                            {/* Customer Info */}
                                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 text-xs sm:text-sm text-gray-300 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <FaUser className="text-cyan-400 text-xs" />
                                                    <span className="truncate">{order.shippingAddress?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaPhone className="text-cyan-400 text-xs" />
                                                    <span>{order.shippingAddress?.phone}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-400 text-xs sm:text-sm">
                                                Placed on {formatDate(order.createdAt)}
                                            </p>
                                            {order.deliveredAt && order.status === 'delivered' && (
                                                <p className="text-green-400 text-xs sm:text-sm">
                                                    Delivered on {formatDate(order.deliveredAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <span className="text-lg sm:text-xl font-bold text-cyan-400">
                                            ₹ {order.totalAmount?.toFixed(2)}
                                        </span>
                                        {getPaymentMethodIcon(order.paymentMethod)}
                                    </div>
                                </div>

                                {/* Action Buttons - Lists section jaisa */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => viewOrderDetails(order)}
                                        className="px-3 sm:px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 text-xs sm:text-base flex-1 sm:flex-none justify-center"
                                    >
                                        <FaEye className="text-xs sm:text-sm" />
                                        View Details
                                    </button>

                                    {getStatusActions(order).map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => startStatusUpdate(order, action.status)}
                                            className={`px-3 sm:px-4 py-2 ${action.color === 'blue'
                                                ? 'bg-blue-500 hover:bg-blue-600'
                                                : action.color === 'green'
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : 'bg-red-500 hover:bg-red-600'
                                                } text-white rounded-lg transition-all duration-300 flex items-center gap-2 text-xs sm:text-base flex-1 sm:flex-none justify-center`}
                                        >
                                            <FaEdit className="text-xs sm:text-sm" />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Status Update Form */}
                                {updatingOrder?.id === order._id && (
                                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-700/50 rounded-lg">
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                                            {updatingOrder.status === 'shipped' && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter tracking number"
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                    className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300 flex-1 text-sm w-full"
                                                />
                                            )}
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => updateOrderStatus(order._id, updatingOrder.status)}
                                                    className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition duration-300 text-xs sm:text-sm flex-1 sm:flex-none"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={cancelStatusUpdate}
                                                    className="px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition duration-300 text-xs sm:text-sm flex-1 sm:flex-none"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Order Count Footer - Lists section jaisa */}
                {!isLoading && filteredOrders.length > 0 && (
                    <div className="text-center mt-6 sm:mt-8">
                        <p className="text-gray-400 text-xs sm:text-sm">
                            Showing <span className="text-white font-semibold">{filteredOrders.length}</span> order{filteredOrders.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                )}

                {/* Order Details Modal */}
                {showOrderDetails && selectedOrder && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
                        <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">Order Details</h2>
                                    <p className="text-cyan-400 font-semibold text-sm sm:text-base">
                                        #{selectedOrder.orderId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="text-gray-400 hover:text-white text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                                {/* Order Items */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-white">Order Items</h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div key={item._id || index} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-700 rounded-lg">
                                                <img
                                                    src={getProductImage(item)}
                                                    alt={item.productId?.name}
                                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white text-sm sm:text-base">{item.productId?.name}</h4>
                                                    <p className="text-gray-400 text-xs sm:text-sm">Quantity: {item.quantity}</p>
                                                    {item.size && (
                                                        <p className="text-gray-400 text-xs sm:text-sm">Size: {item.size}</p>
                                                    )}
                                                    <p className="text-cyan-400 font-semibold text-sm sm:text-base">
                                                        ₹ {item.price} × {item.quantity} = ₹ {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Information */}
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Customer Details */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                                            <FaUser className="text-cyan-400" />
                                            Customer Details
                                        </h3>
                                        <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                                            <p className="text-white font-semibold text-sm sm:text-base">{selectedOrder.shippingAddress?.name}</p>
                                            <p className="text-gray-400 text-xs sm:text-sm">{selectedOrder.shippingAddress?.email}</p>
                                            <div className="flex items-center gap-2 mt-2 text-gray-400 text-xs sm:text-sm">
                                                <FaPhone className="text-xs" />
                                                <span>{selectedOrder.shippingAddress?.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-cyan-400" />
                                            Shipping Address
                                        </h3>
                                        <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                                            <p className="text-gray-300 text-sm sm:text-base">{selectedOrder.shippingAddress?.address}</p>
                                            <p className="text-gray-300 text-sm sm:text-base">
                                                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                            </p>
                                            {selectedOrder.shippingAddress?.landmark && (
                                                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                                    Landmark: {selectedOrder.shippingAddress?.landmark}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-white">Order Summary</h3>
                                        <div className="bg-gray-700 p-3 sm:p-4 rounded-lg space-y-2 text-sm sm:text-base">
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
                                                <span className={`font-semibold ${selectedOrder.paymentStatus === 'completed' ? 'text-green-400' :
                                                    selectedOrder.paymentStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                    {selectedOrder.paymentStatus?.charAt(0)?.toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                                                </span>
                                            </div>
                                            {selectedOrder.trackingNumber && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Tracking Number:</span>
                                                    <span className="text-cyan-400 font-semibold text-xs sm:text-sm">
                                                        {selectedOrder.trackingNumber}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-600 pt-2 mt-2">
                                                <div className="flex justify-between font-bold text-base sm:text-lg">
                                                    <span className="text-white">Total Amount:</span>
                                                    <span className="text-cyan-400">
                                                        ₹ {selectedOrder.totalAmount?.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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