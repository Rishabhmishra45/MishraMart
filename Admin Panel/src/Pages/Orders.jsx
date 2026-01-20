import React, { useState, useContext, useEffect, useMemo } from "react";
import { authDataContext } from "../context/AuthContext";
import {
    FaSearch,
    FaBox,
    FaShippingFast,
    FaCheckDouble,
    FaTimesCircle,
    FaClock,
    FaEye,
    FaEdit,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaCreditCard,
    FaMoneyBillWave,
} from "react-icons/fa";
import axios from "axios";
import OrderNotification from "../components/OrderNotification";

const Orders = () => {
    const { serverUrl } = useContext(authDataContext);

    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState("");

    const [notification, setNotification] = useState({
        isVisible: false,
        type: "",
        message: "",
    });

    useEffect(() => {
        fetchAllOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!notification.isVisible) return;
        const timer = setTimeout(() => {
            setNotification({ isVisible: false, type: "", message: "" });
        }, 4000);
        return () => clearTimeout(timer);
    }, [notification]);

    const showNotification = (type, message) => {
        setNotification({ isVisible: true, type, message });
    };

    const fetchAllOrders = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${serverUrl}/api/orders/admin/all-orders`, {
                withCredentials: true,
            });

            if (response.data.success) {
                setOrders(response.data.orders || []);
                showNotification("success", "Orders loaded successfully");
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            showNotification("error", "Failed to load orders");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter((order) =>
                order.orderId?.toLowerCase().includes(q) ||
                order._id?.toLowerCase().includes(q) ||
                order.shippingAddress?.name?.toLowerCase().includes(q) ||
                order.shippingAddress?.phone?.includes(searchTerm)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        return filtered;
    }, [orders, searchTerm, statusFilter]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "delivered":
                return <FaCheckDouble className="text-green-400" />;
            case "shipped":
                return <FaShippingFast className="text-blue-400" />;
            case "processing":
                return <FaBox className="text-yellow-400" />;
            case "cancelled":
                return <FaTimesCircle className="text-red-400" />;
            default:
                return <FaClock className="text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "delivered":
                return "bg-green-500/15 text-green-200 border-green-500/20";
            case "shipped":
                return "bg-blue-500/15 text-blue-200 border-blue-500/20";
            case "processing":
                return "bg-yellow-500/15 text-yellow-200 border-yellow-500/20";
            case "cancelled":
                return "bg-red-500/15 text-red-200 border-red-500/20";
            default:
                return "bg-gray-500/15 text-gray-200 border-gray-500/20";
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "razorpay":
                return <FaCreditCard className="text-cyan-400" />;
            case "cod":
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
            if (newStatus === "shipped" && trackingNumber) {
                updateData.trackingNumber = trackingNumber;
            }

            const response = await axios.put(`${serverUrl}/api/orders/status/${orderId}`, updateData, {
                withCredentials: true,
            });

            if (response.data.success) {
                setOrders((prev) => prev.map((o) => (o._id === orderId ? response.data.order : o)));
                setUpdatingOrder(null);
                setTrackingNumber("");

                const orderNumber = response.data.order.orderId;
                showNotification("success", `Order #${orderNumber} updated to ${newStatus}`);
            }
        } catch (error) {
            console.error("Error updating order:", error);
            showNotification("error", "Failed to update order status");
        }
    };

    const startStatusUpdate = (order, newStatus) => {
        setUpdatingOrder({ id: order._id, status: newStatus });
        if (newStatus === "shipped") {
            setTrackingNumber(order.trackingNumber || "");
        }
    };

    const cancelStatusUpdate = () => {
        setUpdatingOrder(null);
        setTrackingNumber("");
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case "processing":
                return "shipped";
            case "shipped":
                return "delivered";
            default:
                return null;
        }
    };

    const getStatusActions = (order) => {
        const actions = [];
        const nextStatus = getNextStatus(order.status);

        if (nextStatus) {
            actions.push({
                label: nextStatus === "shipped" ? "Mark Shipped" : "Mark Delivered",
                status: nextStatus,
                color:
                    nextStatus === "shipped"
                        ? "from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                        : "from-green-600 to-green-500 hover:from-green-700 hover:to-green-600",
            });
        }

        if (order.status !== "cancelled") {
            actions.push({
                label: "Cancel",
                status: "cancelled",
                color: "from-red-600 to-red-500 hover:from-red-700 hover:to-red-600",
            });
        }

        return actions;
    };

    const getProductImage = (item) => {
        const productImages = item.productId?.images || [];
        const productImage1 = item.productId?.image1;
        return (
            item?.image ||
            productImages[0] ||
            productImage1 ||
            "https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150"
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-cyan-400 text-sm sm:text-base">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 xs:px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
            <div className="max-w-6xl mx-auto pb-10 mt-4 sm:mt-[30px]">
                <OrderNotification
                    isVisible={notification.isVisible}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ isVisible: false, type: "", message: "" })}
                />

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                            Order Management
                        </h1>
                        <p className="text-gray-300 mt-2 text-xs sm:text-base">Manage and track customer orders</p>
                    </div>

                    <button
                        onClick={fetchAllOrders}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-700 text-gray-200 hover:bg-white/5 transition font-semibold text-sm"
                    >
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="mt-6 bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="relative lg:col-span-2">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search order id / name / phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-950/40 border border-gray-800 text-white text-sm outline-none focus:border-cyan-500"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-950/40 border border-gray-800 text-white text-sm outline-none focus:border-cyan-500"
                        >
                            <option value="all">All</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <p className="text-gray-400 text-xs sm:text-sm mt-4">
                        Showing <span className="text-white font-semibold">{filteredOrders.length}</span> of{" "}
                        <span className="text-white font-semibold">{orders.length}</span> orders
                    </p>
                </div>

                {/* Orders */}
                <div className="mt-6 grid gap-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-16 bg-gray-900/30 rounded-3xl border border-gray-800">
                            <div className="text-5xl mb-3">📦</div>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-white">No Orders Found</h2>
                            <p className="text-gray-400 text-xs sm:text-base mt-2">Try changing filters.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order._id} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        {/* Preview images */}
                                        <div className="flex gap-2 flex-shrink-0">
                                            {order.items?.slice(0, 3).map((item, idx) => (
                                                <img
                                                    key={idx}
                                                    src={getProductImage(item)}
                                                    alt="product"
                                                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-gray-800"
                                                    onError={(e) => (e.target.src = "https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150")}
                                                />
                                            ))}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base sm:text-lg font-extrabold text-white truncate">
                                                    Order #{order.orderId}
                                                </h3>

                                                <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${getStatusBadge(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-cyan-400" />
                                                    <span className="truncate">{order.shippingAddress?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaPhone className="text-cyan-400" />
                                                    <span>{order.shippingAddress?.phone}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-400 text-xs sm:text-sm mt-2">
                                                Placed on {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between lg:justify-end lg:min-w-[320px]">
                                        <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-lg sm:text-xl">
                                            ₹ {order.totalAmount?.toFixed(2)}
                                            {getPaymentMethodIcon(order.paymentMethod)}
                                        </div>

                                        <button
                                            onClick={() => viewOrderDetails(order)}
                                            className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FaEye />
                                            View
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {getStatusActions(order).map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => startStatusUpdate(order, action.status)}
                                            className={`px-4 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r ${action.color} transition flex items-center justify-center gap-2`}
                                        >
                                            <FaEdit />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Update form */}
                                {updatingOrder?.id === order._id && (
                                    <div className="mt-4 bg-gray-950/40 border border-gray-800 rounded-2xl p-4">
                                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                            {updatingOrder.status === "shipped" && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter tracking number"
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 text-white text-sm outline-none focus:border-cyan-500"
                                                />
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateOrderStatus(order._id, updatingOrder.status)}
                                                    className="px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={cancelStatusUpdate}
                                                    className="px-4 py-3 rounded-xl border border-gray-700 text-gray-200 hover:bg-white/5 transition font-bold text-sm"
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

                {/* Modal */}
                {showOrderDetails && selectedOrder && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-6">
                        <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl">
                            <div className="p-4 sm:p-6 border-b border-gray-800 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-white font-extrabold text-lg sm:text-2xl">Order Details</h2>
                                    <p className="text-cyan-400 font-bold text-sm sm:text-base">#{selectedOrder.orderId}</p>
                                </div>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="px-3 py-2 rounded-xl text-white hover:bg-white/10 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-white font-extrabold text-base sm:text-xl mb-3">Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 rounded-2xl bg-gray-900/40 border border-gray-800">
                                                <img
                                                    src={getProductImage(item)}
                                                    alt="item"
                                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-800"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-white font-bold text-sm sm:text-base truncate">{item.productId?.name}</p>
                                                    <p className="text-gray-400 text-xs sm:text-sm">Qty: {item.quantity}</p>
                                                    {item.size && <p className="text-gray-400 text-xs sm:text-sm">Size: {item.size}</p>}
                                                    <p className="text-cyan-300 font-bold text-xs sm:text-sm mt-1">
                                                        ₹ {item.price} × {item.quantity} = ₹ {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
                                        <h3 className="text-white font-extrabold flex items-center gap-2 mb-3">
                                            <FaUser className="text-cyan-400" /> Customer
                                        </h3>
                                        <p className="text-white font-bold">{selectedOrder.shippingAddress?.name}</p>
                                        <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress?.email}</p>
                                        <div className="flex items-center gap-2 text-gray-300 text-sm mt-2">
                                            <FaPhone className="text-cyan-400" />
                                            {selectedOrder.shippingAddress?.phone}
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
                                        <h3 className="text-white font-extrabold flex items-center gap-2 mb-3">
                                            <FaMapMarkerAlt className="text-cyan-400" /> Shipping
                                        </h3>
                                        <p className="text-gray-300 text-sm">{selectedOrder.shippingAddress?.address}</p>
                                        <p className="text-gray-300 text-sm">
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                                            {selectedOrder.shippingAddress?.pincode}
                                        </p>
                                    </div>

                                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
                                        <h3 className="text-white font-extrabold mb-3">Summary</h3>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Status</span>
                                            <span className="text-white font-bold">
                                                {selectedOrder.status?.charAt(0)?.toUpperCase() + selectedOrder.status?.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-2">
                                            <span className="text-gray-400">Payment</span>
                                            <span className="text-white font-bold flex items-center gap-2">
                                                {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                                                {selectedOrder.paymentMethod === "cod" ? "COD" : "Online"}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between items-center">
                                            <span className="text-gray-300 font-bold">Total</span>
                                            <span className="text-cyan-300 font-extrabold text-lg">
                                                ₹ {selectedOrder.totalAmount?.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 border-t border-gray-800 text-center">
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="px-6 py-3 rounded-xl border border-gray-700 text-gray-200 hover:bg-white/5 transition font-bold text-sm"
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
