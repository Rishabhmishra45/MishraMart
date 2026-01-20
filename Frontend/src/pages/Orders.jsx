import React, { useState, useContext, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { shopDataContext } from "../context/ShopContext";
import { authDataContext } from "../context/AuthContext";
import {
    FaSearch,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaEye,
    FaDownload,
    FaMapMarkerAlt,
    FaPhone,
    FaCreditCard,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaRedo,
    FaFileInvoice,
    FaArrowLeft,
    FaRupeeSign,
    FaBox,
    FaShippingFast,
    FaUndo,
    FaShare,
} from "react-icons/fa";
import axios from "axios";

const Orders = () => {
    const navigate = useNavigate();
    const { currency } = useContext(shopDataContext);
    const { serverUrl, user } = useContext(authDataContext);

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Fetch orders with useCallback
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");
            setDataLoaded(false);

            const response = await axios.get(`${serverUrl}/api/orders/my-orders`, {
                withCredentials: true,
                timeout: 10000,
            });

            if (response.data.success) {
                const ordersData = response.data.orders || [];
                setOrders(ordersData);

                if (ordersData.length === 0) {
                    setError("No orders found. Start shopping to see your orders here.");
                }
            } else {
                setError(response.data.message || "Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);

            if (error.response?.status === 401) {
                setError("Please login to view your orders");
            } else if (error.code === "ECONNABORTED") {
                setError("Request timeout. Please check your internet connection.");
            } else if (error.response?.status === 500) {
                setError("Server error. Please try again later.");
            } else if (!error.response) {
                setError("Network error. Please check if server is running.");
            } else {
                setError(
                    error.response?.data?.message || "Failed to load orders. Please try again."
                );
            }
        } finally {
            setIsLoading(false);
            setDataLoaded(true);
        }
    }, [serverUrl]);

    // Socket.IO setup - remove useCallback to simplify
    useEffect(() => {
        if (user && serverUrl && typeof io !== "undefined") {
            try {
                const newSocket = io(serverUrl, {
                    withCredentials: true,
                    transports: ["websocket", "polling"],
                });

                newSocket.on("connect", () => {
                    console.log("Socket connected for orders");
                    newSocket.emit("joinUserRoom", user._id);
                });

                newSocket.on("orderCreated", (newOrder) => {
                    setOrders((prev) => [newOrder, ...prev]);
                });

                newSocket.on("orderUpdated", (updatedOrder) => {
                    setOrders((prev) =>
                        prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
                    );
                });

                setSocket(newSocket);

                return () => {
                    newSocket.close();
                };
            } catch (error) {
                console.log("Socket initialization error:", error);
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
            filtered = filtered.filter(
                (order) =>
                    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.items?.some((item) =>
                        item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    }, [searchTerm, statusFilter, orders]);

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
        setError("");
    };

    const handleStartShopping = () => {
        navigate("/collections");
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "delivered":
                return <FaCheckCircle className="text-green-500" />;
            case "shipped":
                return <FaTruck className="text-blue-500" />;
            case "processing":
                return <FaClock className="text-yellow-500" />;
            case "cancelled":
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaClock className="text-[color:var(--muted)]" />;
        }
    };

    const getStatusPill = (status) => {
        switch (status) {
            case "delivered":
                return "bg-green-500/10 text-green-600 border-green-500/20";
            case "shipped":
                return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "processing":
                return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "cancelled":
                return "bg-red-500/10 text-red-600 border-red-500/20";
            default:
                return "bg-[color:var(--surface-2)] text-[color:var(--muted)] border-[color:var(--border)]";
        }
    };

    const getStatusGradient = (status) => {
        // subtle card tint, works in both themes
        switch (status) {
            case "delivered":
                return "from-green-500/10 to-transparent";
            case "shipped":
                return "from-blue-500/10 to-transparent";
            case "processing":
                return "from-yellow-500/10 to-transparent";
            case "cancelled":
                return "from-red-500/10 to-transparent";
            default:
                return "from-[color:var(--surface)] to-[color:var(--surface)]";
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "razorpay":
                return <FaCreditCard className="text-cyan-500" />;
            case "cod":
                return <FaMoneyBillWave className="text-green-500" />;
            default:
                return <FaCreditCard className="text-[color:var(--muted)]" />;
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
                responseType: "blob",
                timeout: 30000,
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            const order = orders.find((o) => o._id === orderId);
            link.download = `invoice-${order?.orderId || orderId}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading invoice:", error);
            if (error.response?.status === 400) {
                alert(error.response.data.message || "Invoice not available for this order.");
            } else if (error.response?.status === 404) {
                alert("Invoice not found for this order.");
            } else {
                alert("Failed to download invoice. Please try again.");
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
                responseType: "blob",
                timeout: 30000,
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const file = new File([blob], `invoice-${orderId}.pdf`, { type: "application/pdf" });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Invoice - ${orderId}`,
                    text: `Invoice for your order from Mishra Mart`,
                    files: [file],
                });
            } else {
                downloadInvoice(orderId);
            }
        } catch (error) {
            console.error("Error sharing PDF:", error);
            if (!error.toString().includes("AbortError")) {
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
            const cartItems = order.items.map((item) => ({
                productId: item.productId?._id || item.productId,
                quantity: item.quantity,
                size: item.size,
            }));

            await axios.post(
                `${serverUrl}/api/cart/add-multiple`,
                { items: cartItems },
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );

            navigate("/cart");
        } catch (error) {
            console.error("Error reordering:", error);
            alert("Failed to reorder items. Please try again.");
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) {
            return;
        }

        try {
            const response = await axios.put(
                `${serverUrl}/api/orders/cancel/${orderId}`,
                {
                    cancellationReason: "Customer requested cancellation",
                },
                {
                    withCredentials: true,
                    timeout: 10000,
                }
            );

            if (response.data.success) {
                alert("Order cancelled successfully");
                fetchOrders();
            } else {
                alert(response.data.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            if (error.response?.status === 400) {
                alert(error.response.data.message || "Cannot cancel this order.");
            } else if (error.response?.status === 404) {
                alert("Order not found.");
            } else {
                alert("Failed to cancel order. Please try again.");
            }
        }
    };

    const trackOrder = (order) => {
        if (order.trackingNumber) {
            window.open(`https://tracking.mishramart.com/${order.trackingNumber}`, "_blank");
        } else {
            alert("Tracking number not available yet.");
        }
    };

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

    const getProductImage = (item) => {
        const productImages = item.productId?.images || [];
        const productImage1 = item.productId?.image1;
        const productImage2 = item.productId?.image2;
        const productImage3 = item.productId?.image3;
        const productImage4 = item.productId?.image4;

        return (
            productImages[0] ||
            productImage1 ||
            productImage2 ||
            productImage3 ||
            productImage4 ||
            "https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150"
        );
    };

    const orderStats = useMemo(() => {
        const total = orders?.length || 0;
        const delivered = orders?.filter((o) => o.status === "delivered")?.length || 0;
        const shipped = orders?.filter((o) => o.status === "shipped")?.length || 0;
        const processing = orders?.filter((o) => o.status === "processing")?.length || 0;
        return { total, delivered, shipped, processing };
    }, [orders]);

    // Loading State - Only show when actually loading orders
    if (isLoading) {
        return (
            <div
                className="min-h-[100svh] pt-[72px] flex items-center justify-center px-4"
                style={{ background: "var(--background)", color: "var(--text)" }}
            >
                <div
                    className="w-full max-w-sm rounded-3xl border shadow-xl p-6 sm:p-8 text-center"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl border flex items-center justify-center"
                        style={{ background: "color-mix(in oklab, var(--surface) 85%, transparent)", borderColor: "var(--border)" }}>
                        <div className="w-8 h-8 border-2 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="mt-4 text-sm sm:text-base font-semibold" style={{ color: "var(--muted)" }}>
                        Loading your orders...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100svh] pt-[70px] sm:pb-[0px] pb-[90px]" style={{ background: "var(--background)", color: "var(--text)" }}>
            {/* Mobile Header */}
            <div
                className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md"
                style={{ background: "color-mix(in oklab, var(--nav-bg) 92%, transparent)", borderColor: "var(--border)" }}
            >
                <div className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl border transition
                         hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                            style={{ borderColor: "var(--border)" }}
                            type="button"
                            aria-label="Go back"
                        >
                            <FaArrowLeft />
                        </button>

                        <div className="text-center">
                            <h1 className="text-base sm:text-lg font-extrabold">My Orders</h1>
                            <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                                Track and manage
                            </p>
                        </div>

                        <div className="w-[44px]" />
                    </div>
                </div>
            </div>

            <div className="pt-14 lg:pt-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
                    {/* Header - Desktop */}
                    <div className="hidden lg:flex items-end justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold">My Orders</h1>
                            <p className="text-sm md:text-base" style={{ color: "var(--muted)" }}>
                                Track, manage & download invoices
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-3">
                            <div
                                className="rounded-2xl border px-4 py-3"
                                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                            >
                                <p className="text-xs" style={{ color: "var(--muted)" }}>
                                    Total
                                </p>
                                <p className="text-lg font-extrabold">{orderStats.total}</p>
                            </div>
                            <div
                                className="rounded-2xl border px-4 py-3"
                                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                            >
                                <p className="text-xs" style={{ color: "var(--muted)" }}>
                                    Delivered
                                </p>
                                <p className="text-lg font-extrabold text-green-600">{orderStats.delivered}</p>
                            </div>
                            <div
                                className="rounded-2xl border px-4 py-3"
                                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                            >
                                <p className="text-xs" style={{ color: "var(--muted)" }}>
                                    Shipped
                                </p>
                                <p className="text-lg font-extrabold text-blue-600">{orderStats.shipped}</p>
                            </div>
                            <div
                                className="rounded-2xl border px-4 py-3"
                                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                            >
                                <p className="text-xs" style={{ color: "var(--muted)" }}>
                                    Processing
                                </p>
                                <p className="text-lg font-extrabold text-yellow-600">{orderStats.processing}</p>
                            </div>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div
                            className="rounded-3xl p-4 sm:p-6 shadow-lg border mb-6"
                            style={{ background: "var(--surface)", borderColor: "color-mix(in oklab, rgb(239 68 68) 30%, var(--border))" }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0"
                                    style={{
                                        background: "rgba(239,68,68,0.10)",
                                        borderColor: "rgba(239,68,68,0.20)",
                                    }}
                                >
                                    <FaExclamationTriangle className="text-red-500 text-lg" />
                                </div>

                                <div className="flex-1">
                                    <p className="font-semibold text-sm sm:text-base">{error}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={handleRetry}
                                            className="min-h-[44px] px-4 sm:px-5 rounded-xl font-semibold text-sm transition
                                 text-white bg-red-600 hover:bg-red-700
                                 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                            type="button"
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <FaRedo /> Retry
                                            </span>
                                        </button>

                                        {error.includes("login") && (
                                            <button
                                                onClick={() => navigate("/login")}
                                                className="min-h-[44px] px-4 sm:px-5 rounded-xl font-semibold text-sm transition
                                   text-white bg-[color:var(--accent)] hover:opacity-95
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                                type="button"
                                            >
                                                Go to Login
                                            </button>
                                        )}

                                        <button
                                            onClick={handleStartShopping}
                                            className="min-h-[44px] px-4 sm:px-5 rounded-xl font-semibold text-sm transition
                                 border hover:bg-[color:var(--surface-2)]
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                            style={{ borderColor: "var(--border)" }}
                                            type="button"
                                        >
                                            Start Shopping
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    {orders.length > 0 && (
                        <div
                            className="rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm border mb-6"
                            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                        >
                            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                                    <input
                                        type="text"
                                        placeholder="Search by order ID or product name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border bg-transparent outline-none
                               text-sm sm:text-base
                               focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="w-full lg:w-[220px]">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border bg-transparent outline-none
                               text-sm sm:text-base
                               focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
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
                        {filteredOrders.length === 0 && !isLoading ? (
                            <div
                                className="rounded-3xl p-7 sm:p-10 text-center shadow-sm border"
                                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                            >
                                <div
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 border"
                                    style={{ background: "color-mix(in oklab, var(--surface-2) 75%, transparent)", borderColor: "var(--border)" }}
                                >
                                    <FaBox className="text-3xl sm:text-4xl text-cyan-500" />
                                </div>

                                <h3 className="text-lg sm:text-xl font-extrabold">
                                    {searchTerm || statusFilter !== "all" ? "No orders found" : "No orders yet"}
                                </h3>

                                <p className="mt-2 text-sm sm:text-base max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
                                    {searchTerm || statusFilter !== "all"
                                        ? "Try adjusting your search or filters to find what you are looking for."
                                        : "Your order history will appear here once you start shopping. Explore our collections and find something you love!"}
                                </p>

                                <button
                                    onClick={handleStartShopping}
                                    className="mt-6 min-h-[44px] px-7 sm:px-9 py-3 rounded-2xl font-semibold text-white
                             bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95
                             transition transform hover:-translate-y-0.5 active:translate-y-0
                             focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                    type="button"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className={`rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm border transition
                              hover:shadow-lg`}
                                    style={{
                                        background: `linear-gradient(135deg, color-mix(in oklab, var(--surface) 92%, transparent), transparent)`,
                                        borderColor: "var(--border)",
                                    }}
                                >
                                    {/* subtle tint header */}
                                    <div
                                        className={`-mx-4 sm:-mx-5 lg:-mx-6 -mt-4 sm:-mt-5 lg:-mt-6 px-4 sm:px-5 lg:px-6 py-3 sm:py-4
                                rounded-t-3xl bg-gradient-to-r ${getStatusGradient(order.status)} border-b`}
                                        style={{ borderColor: "var(--border)" }}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base sm:text-lg font-extrabold truncate">
                                                        Order #{order.orderId || order._id}
                                                    </h3>

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border inline-flex items-center gap-1 ${getStatusPill(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(order.status)}
                                                        {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                                    </span>
                                                </div>

                                                <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm">
                                                    <span style={{ color: "var(--muted)" }}>Placed on {formatDate(order.createdAt)}</span>
                                                    {order.deliveredAt && order.status === "delivered" && (
                                                        <span className="text-green-600 font-semibold">
                                                            • Delivered on {formatDate(order.deliveredAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between lg:justify-end gap-3">
                                                <span className="text-lg sm:text-xl font-extrabold text-cyan-600 flex items-center gap-1">
                                                    <FaRupeeSign className="text-base sm:text-lg" />
                                                    {order.totalAmount?.toLocaleString("en-IN")}
                                                </span>
                                                <div
                                                    className="w-10 h-10 rounded-2xl border flex items-center justify-center"
                                                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                                                    title={order.paymentMethod}
                                                >
                                                    {getPaymentMethodIcon(order.paymentMethod)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="mt-4">
                                        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                                            {order.items?.map((item, index) => (
                                                <div
                                                    key={item._id || index}
                                                    className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl overflow-hidden border"
                                                    style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
                                                >
                                                    <img
                                                        src={getProductImage(item)}
                                                        alt={item.productId?.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src =
                                                                "https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150";
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <p className="mt-2 text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
                                            {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""} • Total:{" "}
                                            <span className="font-semibold" style={{ color: "var(--text)" }}>
                                                ₹{order.totalAmount?.toLocaleString("en-IN")}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => viewOrderDetails(order)}
                                            className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                 bg-[color:var(--accent)] text-white hover:opacity-95 transition
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                 flex-1 sm:flex-none"
                                            type="button"
                                        >
                                            <span className="inline-flex items-center justify-center gap-2">
                                                <FaEye className="text-sm" />
                                                View Details
                                            </span>
                                        </button>

                                        {order.status === "shipped" && order.trackingNumber && (
                                            <button
                                                onClick={() => trackOrder(order)}
                                                className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                   border hover:bg-[color:var(--surface-2)] transition
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                   flex-1 sm:flex-none"
                                                style={{ borderColor: "var(--border)" }}
                                                type="button"
                                            >
                                                <span className="inline-flex items-center justify-center gap-2">
                                                    <FaShippingFast className="text-sm text-blue-600" />
                                                    Track
                                                </span>
                                            </button>
                                        )}

                                        {order.status === "delivered" && (
                                            <>
                                                <button
                                                    onClick={() => viewInvoice(order._id)}
                                                    className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                     border hover:bg-[color:var(--surface-2)] transition
                                     focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                     flex-1 sm:flex-none"
                                                    style={{ borderColor: "var(--border)" }}
                                                    type="button"
                                                >
                                                    <span className="inline-flex items-center justify-center gap-2">
                                                        <FaFileInvoice className="text-sm text-green-600" />
                                                        Invoice
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={() => downloadInvoice(order._id)}
                                                    disabled={isGeneratingPDF}
                                                    className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                     border hover:bg-[color:var(--surface-2)] transition
                                     focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                     flex-1 sm:flex-none
                                     disabled:opacity-60 disabled:cursor-not-allowed"
                                                    style={{ borderColor: "var(--border)" }}
                                                    type="button"
                                                >
                                                    <span className="inline-flex items-center justify-center gap-2">
                                                        <FaDownload className="text-sm" />
                                                        {isGeneratingPDF ? "Generating..." : "PDF"}
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={() => shareInvoice(order._id)}
                                                    disabled={isGeneratingPDF}
                                                    className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                     border hover:bg-[color:var(--surface-2)] transition
                                     focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                     flex-1 sm:flex-none
                                     disabled:opacity-60 disabled:cursor-not-allowed"
                                                    style={{ borderColor: "var(--border)" }}
                                                    type="button"
                                                >
                                                    <span className="inline-flex items-center justify-center gap-2">
                                                        <FaShare className="text-sm text-purple-600" />
                                                        Share
                                                    </span>
                                                </button>
                                            </>
                                        )}

                                        {(order.status === "processing" || order.status === "shipped") && (
                                            <button
                                                onClick={() => cancelOrder(order._id)}
                                                className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                   border text-red-600 hover:bg-red-500/10 transition
                                   focus:outline-none focus:ring-2 focus:ring-red-500/30
                                   flex-1 sm:flex-none"
                                                style={{ borderColor: "color-mix(in oklab, rgb(239 68 68) 35%, var(--border))" }}
                                                type="button"
                                            >
                                                Cancel
                                            </button>
                                        )}

                                        {order.status === "delivered" && (
                                            <button
                                                onClick={() => reorder(order)}
                                                className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                   border hover:bg-[color:var(--surface-2)] transition
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                   flex-1 sm:flex-none"
                                                style={{ borderColor: "var(--border)" }}
                                                type="button"
                                            >
                                                <span className="inline-flex items-center justify-center gap-2">
                                                    <FaUndo className="text-sm text-yellow-600" />
                                                    Reorder
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Details Modal */}
                    {showOrderDetails && selectedOrder && (
                        <div className="fixed inset-0 z-50 p-3 sm:p-4 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                            <div
                                className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl"
                                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                            >
                                {/* Modal Header */}
                                <div
                                    className="sticky top-0 z-10 px-4 sm:px-6 py-4 border-b backdrop-blur-md"
                                    style={{ background: "color-mix(in oklab, var(--surface) 92%, transparent)", borderColor: "var(--border)" }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="text-lg sm:text-2xl font-extrabold">Order Details</h2>
                                            <p className="text-sm font-semibold text-cyan-600 truncate">
                                                #{selectedOrder.orderId || selectedOrder._id}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setShowOrderDetails(false)}
                                            className="min-h-[44px] min-w-[44px] grid place-items-center rounded-2xl border
                                 hover:bg-[color:var(--surface-2)] transition
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                            style={{ borderColor: "var(--border)" }}
                                            type="button"
                                            aria-label="Close modal"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-4 sm:p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
                                        {/* Order Items */}
                                        <div>
                                            <h3 className="text-base sm:text-lg font-extrabold mb-4">Order Items</h3>

                                            <div className="space-y-3">
                                                {selectedOrder.items?.map((item, index) => (
                                                    <div
                                                        key={item._id || index}
                                                        className="flex gap-3 p-3 sm:p-4 rounded-2xl border"
                                                        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                                                    >
                                                        <img
                                                            src={getProductImage(item)}
                                                            alt={item.productId?.name}
                                                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl flex-shrink-0"
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    "https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150";
                                                            }}
                                                        />

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-extrabold text-sm sm:text-base truncate">
                                                                {item.productId?.name}
                                                            </h4>

                                                            <div className="mt-1 flex flex-wrap gap-2 text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
                                                                <span className="px-2 py-1 rounded-full border"
                                                                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                                                                    Qty: <span style={{ color: "var(--text)" }}>{item.quantity}</span>
                                                                </span>

                                                                {item.size && (
                                                                    <span className="px-2 py-1 rounded-full border"
                                                                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                                                                        Size: <span style={{ color: "var(--text)" }}>{item.size}</span>
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-2 font-extrabold text-cyan-600 text-sm sm:text-base">
                                                                ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Information */}
                                        <div className="space-y-5">
                                            {/* Shipping Address */}
                                            <div>
                                                <h3 className="text-base sm:text-lg font-extrabold mb-3 flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-cyan-500" />
                                                    Shipping Address
                                                </h3>

                                                <div
                                                    className="p-4 rounded-2xl border"
                                                    style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                                                >
                                                    <p className="font-extrabold">{selectedOrder.shippingAddress?.name}</p>
                                                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                                                        {selectedOrder.shippingAddress?.address}
                                                    </p>
                                                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                                                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                                                        {selectedOrder.shippingAddress?.pincode}
                                                    </p>

                                                    <div className="mt-3 grid gap-2">
                                                        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
                                                            <FaPhone className="text-xs" />
                                                            <span className="truncate">{selectedOrder.shippingAddress?.phone}</span>
                                                        </div>
                                                        <p className="text-sm truncate" style={{ color: "var(--muted)" }}>
                                                            {selectedOrder.shippingAddress?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Summary */}
                                            <div>
                                                <h3 className="text-base sm:text-lg font-extrabold mb-3">Order Summary</h3>

                                                <div
                                                    className="p-4 rounded-2xl border space-y-2"
                                                    style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm" style={{ color: "var(--muted)" }}>
                                                            Order Status
                                                        </span>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${getStatusPill(
                                                                selectedOrder.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(selectedOrder.status)}
                                                            {selectedOrder.status?.charAt(0)?.toUpperCase() + selectedOrder.status?.slice(1)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm" style={{ color: "var(--muted)" }}>
                                                            Payment Method
                                                        </span>
                                                        <span className="text-sm font-semibold inline-flex items-center gap-2">
                                                            {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                                                            {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm" style={{ color: "var(--muted)" }}>
                                                            Payment Status
                                                        </span>
                                                        <span
                                                            className={`text-sm font-extrabold ${selectedOrder.paymentStatus === "completed"
                                                                    ? "text-green-600"
                                                                    : selectedOrder.paymentStatus === "pending"
                                                                        ? "text-yellow-600"
                                                                        : "text-red-600"
                                                                }`}
                                                        >
                                                            {selectedOrder.paymentStatus?.charAt(0)?.toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                                                        </span>
                                                    </div>

                                                    <div className="pt-3 mt-2 border-t" style={{ borderColor: "var(--border)" }}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-base sm:text-lg font-extrabold">Total Amount</span>
                                                            <span className="text-base sm:text-lg font-extrabold text-cyan-600">
                                                                ₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                {selectedOrder.status === "delivered" && (
                                                    <>
                                                        <button
                                                            onClick={() => viewInvoice(selectedOrder._id)}
                                                            className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                         border hover:bg-[color:var(--surface-2)] transition
                                         focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                                            style={{ borderColor: "var(--border)" }}
                                                            type="button"
                                                        >
                                                            <span className="inline-flex items-center gap-2">
                                                                <FaFileInvoice className="text-green-600" />
                                                                View Invoice
                                                            </span>
                                                        </button>

                                                        <button
                                                            onClick={() => downloadInvoice(selectedOrder._id)}
                                                            disabled={isGeneratingPDF}
                                                            className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                         border hover:bg-[color:var(--surface-2)] transition
                                         focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                         disabled:opacity-60 disabled:cursor-not-allowed"
                                                            style={{ borderColor: "var(--border)" }}
                                                            type="button"
                                                        >
                                                            <span className="inline-flex items-center gap-2">
                                                                <FaDownload />
                                                                {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                                                            </span>
                                                        </button>

                                                        <button
                                                            onClick={() => shareInvoice(selectedOrder._id)}
                                                            disabled={isGeneratingPDF}
                                                            className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                         border hover:bg-[color:var(--surface-2)] transition
                                         focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                         disabled:opacity-60 disabled:cursor-not-allowed"
                                                            style={{ borderColor: "var(--border)" }}
                                                            type="button"
                                                        >
                                                            <span className="inline-flex items-center gap-2">
                                                                <FaShare className="text-purple-600" />
                                                                Share PDF
                                                            </span>
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => reorder(selectedOrder)}
                                                    className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold text-sm
                                     bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:opacity-95 transition
                                     focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                                                    type="button"
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        <FaUndo />
                                                        Reorder All Items
                                                    </span>
                                                </button>
                                            </div>
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
