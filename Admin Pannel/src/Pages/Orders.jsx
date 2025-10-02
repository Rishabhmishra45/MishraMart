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

    // Fetch all orders
    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${serverUrl}/api/orders/admin/all-orders`, {
                withCredentials: true,
            });
            
            if (response.data.success) {
                setOrders(response.data.orders);
                setFilteredOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Failed to load orders');
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
                alert('Order status updated successfully');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-cyan-400">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-20 pl-72">
            <div className="p-8">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Order Management</h1>
                    <p className="text-gray-400">Manage and track all customer orders</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-gray-800 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order ID, customer name, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                            />
                        </div>
                        
                        {/* Status Filter */}
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white outline-none focus:border-cyan-400 transition duration-300"
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

                {/* Orders List */}
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-gray-800 rounded-2xl p-12 text-center">
                            <FaBox className="text-6xl text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                            </h3>
                            <p className="text-gray-400">
                                {searchTerm || statusFilter !== 'all' 
                                    ? 'Try adjusting your search or filters' 
                                    : 'Orders will appear here when customers place them'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order._id} className="bg-gray-800 rounded-2xl p-6">
                                {/* Order Header */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white">
                                                Order #{order.orderId}
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
                                    <div className="flex items-center gap-2 mt-2 lg:mt-0">
                                        <span className="text-xl font-bold text-cyan-400">
                                            ₹ {order.totalAmount?.toFixed(2)}
                                        </span>
                                        {getPaymentMethodIcon(order.paymentMethod)}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <FaUser className="text-cyan-400" />
                                        <span>{order.shippingAddress?.name}</span>
                                        <FaPhone className="text-cyan-400 ml-2" />
                                        <span>{order.shippingAddress?.phone}</span>
                                        <FaMapMarkerAlt className="text-cyan-400 ml-2" />
                                        <span>{order.shippingAddress?.city}</span>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="mb-6">
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {order.items?.map((item, index) => (
                                            <div key={item._id || index} className="flex-shrink-0 w-16 h-16 bg-gray-700 rounded-lg overflow-hidden">
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
                                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
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

                                    {getStatusActions(order).map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => startStatusUpdate(order, action.status)}
                                            className={`px-4 py-2 bg-${action.color}-500 hover:bg-${action.color}-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm`}
                                        >
                                            <FaEdit />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Status Update Form */}
                                {updatingOrder?.id === order._id && (
                                    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                            {updatingOrder.status === 'shipped' && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter tracking number"
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                    className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300 flex-1"
                                                />
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateOrderStatus(order._id, updatingOrder.status)}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition duration-300 text-sm"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={cancelStatusUpdate}
                                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition duration-300 text-sm"
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

                {/* Order Details Modal */}
                {showOrderDetails && selectedOrder && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Order Details</h2>
                                    <p className="text-cyan-400 font-semibold">
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

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Order Items */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-white">Order Items</h3>
                                    <div className="space-y-4">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div key={item._id || index} className="flex gap-4 p-4 bg-gray-700 rounded-lg">
                                                <img
                                                    src={getProductImage(item)}
                                                    alt={item.productId?.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white">{item.productId?.name}</h4>
                                                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                                                    {item.size && (
                                                        <p className="text-gray-400 text-sm">Size: {item.size}</p>
                                                    )}
                                                    <p className="text-cyan-400 font-semibold">
                                                        ₹ {item.price} × {item.quantity} = ₹ {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Information */}
                                <div className="space-y-6">
                                    {/* Customer Details */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                                            <FaUser className="text-cyan-400" />
                                            Customer Details
                                        </h3>
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <p className="text-white font-semibold">{selectedOrder.shippingAddress?.name}</p>
                                            <p className="text-gray-400">{selectedOrder.shippingAddress?.email}</p>
                                            <div className="flex items-center gap-2 mt-2 text-gray-400">
                                                <FaPhone className="text-sm" />
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
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <p className="text-gray-300">{selectedOrder.shippingAddress?.address}</p>
                                            <p className="text-gray-300">
                                                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                            </p>
                                            {selectedOrder.shippingAddress?.landmark && (
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Landmark: {selectedOrder.shippingAddress?.landmark}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-white">Order Summary</h3>
                                        <div className="bg-gray-700 p-4 rounded-lg space-y-2">
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
                                            {selectedOrder.trackingNumber && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Tracking Number:</span>
                                                    <span className="text-cyan-400 font-semibold">
                                                        {selectedOrder.trackingNumber}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-600 pt-2 mt-2">
                                                <div className="flex justify-between text-lg font-bold">
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