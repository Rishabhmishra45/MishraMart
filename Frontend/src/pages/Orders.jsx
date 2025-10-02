import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopDataContext } from '../context/ShopContext';
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
    FaMoneyBillWave
} from 'react-icons/fa';

const Orders = () => {
    const navigate = useNavigate();
    const { currency } = useContext(shopDataContext);
    
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    // Mock orders data - in real app, this would come from API
    const mockOrders = [
        {
            id: 'MM123456789',
            date: '2024-01-15',
            items: [
                { id: 1, name: 'Premium Cotton T-Shirt', price: 899, quantity: 2, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150' },
                { id: 2, name: 'Designer Jeans', price: 1299, quantity: 1, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150' }
            ],
            total: 3097,
            status: 'delivered',
            trackingNumber: 'TRK789456123',
            shippingAddress: {
                name: 'Amit Sharma',
                address: '123 Fashion Street, Model Town',
                city: 'Jaipur',
                state: 'Rajasthan',
                pincode: '302001',
                phone: '+91 9876543210'
            },
            paymentMethod: 'razorpay',
            deliveryDate: '2024-01-20'
        },
        {
            id: 'MM123456788',
            date: '2024-01-14',
            items: [
                { id: 3, name: 'Winter Jacket', price: 2499, quantity: 1, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150' }
            ],
            total: 2499,
            status: 'shipped',
            trackingNumber: 'TRK789456124',
            shippingAddress: {
                name: 'Priya Singh',
                address: '456 Style Avenue, Civil Lines',
                city: 'Delhi',
                state: 'Delhi',
                pincode: '110001',
                phone: '+91 9876543211'
            },
            paymentMethod: 'cod',
            estimatedDelivery: '2024-01-22'
        },
        {
            id: 'MM123456787',
            date: '2024-01-13',
            items: [
                { id: 4, name: 'Sports Shoes', price: 1799, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150' },
                { id: 5, name: 'Running Socks', price: 299, quantity: 3, image: 'https://images.unsplash.com/photo-1586359743087-8157b8d140be?w=150' }
            ],
            total: 2696,
            status: 'processing',
            shippingAddress: {
                name: 'Rahul Verma',
                address: '789 Trend Road, MG Road',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
                phone: '+91 9876543212'
            },
            paymentMethod: 'razorpay'
        },
        {
            id: 'MM123456786',
            date: '2024-01-12',
            items: [
                { id: 6, name: 'Formal Shirt', price: 1299, quantity: 1, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150' }
            ],
            total: 1299,
            status: 'cancelled',
            shippingAddress: {
                name: 'Neha Gupta',
                address: '321 Fashion Lane, Koramangala',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560034',
                phone: '+91 9876543213'
            },
            paymentMethod: 'razorpay',
            cancellationReason: 'Changed my mind'
        }
    ];

    useEffect(() => {
        // Simulate API call
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
    }, []);

    useEffect(() => {
        let filtered = orders;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

    const downloadInvoice = (orderId) => {
        // Simulate invoice download
        console.log(`Downloading invoice for order: ${orderId}`);
        alert(`Invoice for order ${orderId} downloaded!`);
    };

    const reorder = (order) => {
        // Add logic to reorder items
        console.log('Reordering:', order);
        navigate('/cart');
    };

    const cancelOrder = (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, status: 'cancelled' } : order
            ));
        }
    };

    const trackOrder = (order) => {
        if (order.trackingNumber) {
            window.open(`https://tracking.mishramart.com/${order.trackingNumber}`, '_blank');
        } else {
            alert('Tracking number not available yet.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Orders</h1>
                    <p className="text-gray-400">Track and manage your orders</p>
                </div>

                {/* Filters and Search */}
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

                {/* Orders List */}
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-12 text-center shadow-2xl shadow-blue-900/20">
                            <FaSearch className="text-6xl text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
                            <p className="text-gray-400 mb-6">
                                {searchTerm || statusFilter !== 'all' 
                                    ? 'Try adjusting your search or filters' 
                                    : 'You haven\'t placed any orders yet'
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
                            <div key={order.id} className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                                {/* Order Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1`}>
                                                {getStatusIcon(order.status)}
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            Placed on {new Date(order.date).toLocaleDateString('en-IN', { 
                                                day: 'numeric', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        <span className="text-xl font-bold text-cyan-400">
                                            {currency} {order.total}
                                        </span>
                                        {getPaymentMethodIcon(order.paymentMethod)}
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="mb-6">
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex-shrink-0 w-16 h-16 bg-gray-800 rounded-lg overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-2">
                                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • 
                                        Total: {currency} {order.total}
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
                                                onClick={() => downloadInvoice(order.id)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                            >
                                                <FaDownload />
                                                Invoice
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
                                            onClick={() => cancelOrder(order.id)}
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
                                    <p className="text-cyan-400 font-semibold">#{selectedOrder.id}</p>
                                </div>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Order Items */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 p-4 bg-gray-800/30 rounded-lg">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white">{item.name}</h4>
                                                    <p className="text-cyan-400 text-sm">
                                                        {currency} {item.price} × {item.quantity}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        Total: {currency} {(item.price * item.quantity).toFixed(2)}
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
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-cyan-400" />
                                            Shipping Address
                                        </h3>
                                        <div className="bg-gray-800/30 rounded-lg p-4">
                                            <p className="font-semibold text-white">{selectedOrder.shippingAddress.name}</p>
                                            <p className="text-gray-300">{selectedOrder.shippingAddress.address}</p>
                                            <p className="text-gray-300">
                                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                                            </p>
                                            <p className="text-gray-300 flex items-center gap-2 mt-2">
                                                <FaPhone className="text-sm" />
                                                {selectedOrder.shippingAddress.phone}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                                        <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Items Total</span>
                                                <span className="text-white">{currency} {selectedOrder.total}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Delivery Fee</span>
                                                <span className="text-white">{currency} 50</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Tax (18%)</span>
                                                <span className="text-white">{currency} {(selectedOrder.total * 0.18).toFixed(2)}</span>
                                            </div>
                                            <div className="border-t border-gray-600 pt-2">
                                                <div className="flex justify-between text-lg font-semibold">
                                                    <span className="text-white">Total Amount</span>
                                                    <span className="text-cyan-400">
                                                        {currency} {(selectedOrder.total + 50 + (selectedOrder.total * 0.18)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Status Timeline */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Order Status</h3>
                                        <div className="space-y-3">
                                            {[
                                                { status: 'ordered', label: 'Order Placed', date: selectedOrder.date },
                                                { status: 'processing', label: 'Processing', date: selectedOrder.date },
                                                { status: 'shipped', label: 'Shipped', date: selectedOrder.estimatedDelivery },
                                                { status: 'delivered', label: 'Delivered', date: selectedOrder.deliveryDate }
                                            ].map((step, index) => (
                                                <div key={step.status} className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        ['ordered', 'processing', 'shipped', 'delivered'].indexOf(step.status) <= 
                                                        ['ordered', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status)
                                                            ? 'bg-cyan-500 text-white' 
                                                            : 'bg-gray-600 text-gray-400'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${
                                                            ['ordered', 'processing', 'shipped', 'delivered'].indexOf(step.status) <= 
                                                            ['ordered', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status)
                                                                ? 'text-white' 
                                                                : 'text-gray-400'
                                                        }`}>
                                                            {step.label}
                                                        </p>
                                                        {step.date && (
                                                            <p className="text-gray-400 text-sm">
                                                                {new Date(step.date).toLocaleDateString('en-IN')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
                                <button
                                    onClick={() => downloadInvoice(selectedOrder.id)}
                                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300 flex items-center gap-2"
                                >
                                    <FaDownload />
                                    Download Invoice
                                </button>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="px-6 py-3 border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 rounded-lg transition duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;