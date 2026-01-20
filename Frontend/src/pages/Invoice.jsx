import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
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
  FaRupeeSign,
  FaFileInvoice,
  FaStore,
  FaReceipt,
} from "react-icons/fa";
import axios from "axios";

const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${serverUrl}/api/orders/${orderId}`, {
          withCredentials: true,
          timeout: 10000,
        });

        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) fetchOrderDetails();
  }, [orderId, serverUrl]);

  const handleDownload = async () => {
    if (!order) return;

    try {
      setIsGeneratingPDF(true);

      const response = await axios.get(
        `${serverUrl}/api/orders/invoice/${orderId}`,
        {
          withCredentials: true,
          responseType: "blob",
          timeout: 30000,
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.orderId || orderId}.pdf`;

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

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (!order) return;

    try {
      setIsGeneratingPDF(true);

      const response = await axios.get(
        `${serverUrl}/api/orders/invoice/${orderId}`,
        {
          withCredentials: true,
          responseType: "blob",
          timeout: 30000,
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const file = new File([blob], `invoice-${order.orderId}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Invoice - ${order.orderId}`,
          text: `Invoice for your order ${order.orderId} from MishraMart`,
          files: [file],
        });
      } else {
        // fallback download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${order.orderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        alert("PDF downloaded. You can share the downloaded file.");
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      if (!error.toString().includes("AbortError")) handleDownload();
    } finally {
      setIsGeneratingPDF(false);
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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "razorpay":
        return <FaCreditCard className="text-cyan-500" />;
      case "cod":
        return <FaMoneyBillWave className="text-green-500" />;
      default:
        return <FaCreditCard className="text-gray-500" />;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "razorpay":
        return "Online Payment";
      case "cod":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-500";
      case "shipped":
        return "text-blue-500";
      case "processing":
        return "text-yellow-500";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "shipped":
        return <FaTruck className="text-blue-500" />;
      case "processing":
        return <FaReceipt className="text-yellow-500" />;
      case "cancelled":
        return <FaCheckCircle className="text-red-500" />;
      default:
        return <FaReceipt className="text-gray-500" />;
    }
  };

  const getProductImage = (item) => {
    const productImages = item.productId?.images || [];
    const productImage1 = item.productId?.image1;
    const productImage2 = item.productId?.image2;
    const productImage3 = item.productId?.image3;
    const productImage4 = item.productId?.image4;
    const directImage = item.image || item.productId?.image;

    return (
      directImage ||
      productImages[0] ||
      productImage1 ||
      productImage2 ||
      productImage3 ||
      productImage4 ||
      "https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-500 text-base sm:text-lg">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFileInvoice className="text-2xl sm:text-3xl text-red-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              Invoice Not Found
            </h2>
            <p className="text-[color:var(--muted)] mb-6 text-sm sm:text-base">
              {error || "Order not found"}
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.18;
  const shipping = 50;
  const total = order.totalAmount || subtotal + tax + shipping;

  return (
    <div className="min-h-screen pt-[70px] sm:pt-[88px] pb-[50px] bg-[color:var(--background)]">


      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                    <FaStore className="text-xl sm:text-2xl text-white" />
                    <div>
                      <h1 className="text-lg sm:text-xl font-bold tracking-wider">
                        MISHRA MART
                      </h1>
                      <p className="text-[11px] sm:text-xs text-cyan-100">
                        Official Invoice
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right w-full lg:w-auto">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  INVOICE
                </h2>
                <p className="text-cyan-100 text-sm sm:text-lg mt-2 font-mono break-all">
                  {order.orderId}
                </p>
                <p className="text-cyan-100 text-xs sm:text-sm mt-1">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="bg-[color:var(--surface-2)] px-4 sm:px-6 lg:px-8 py-4 hidden lg:flex justify-between items-center border-b border-[color:var(--border)]">
            <div className="flex items-center text-green-500 font-semibold text-base">
              <FaCheckCircle className="mr-3 text-lg" />
              <span className="capitalize">Payment Successful • {order.status}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isGeneratingPDF}
                className="flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload className="mr-2" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition text-sm font-semibold"
              >
                <FaPrint className="mr-2" />
                Print
              </button>

              <button
                onClick={handleShare}
                disabled={isGeneratingPDF}
                className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaShare className="mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Company & Customer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <FaStore className="text-cyan-500" />
                  From:
                </h3>

                <div className="bg-[color:var(--surface-2)] p-3 sm:p-4 rounded-xl border border-[color:var(--border)] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <FaStore className="text-xl sm:text-2xl text-cyan-500" />
                    </div>
                    <div>
                      <p className="font-bold text-lg sm:text-xl tracking-wider">
                        MISHRA MART
                      </p>
                      <p className="text-[color:var(--muted)] text-xs sm:text-sm">
                        Mumbai, Maharashtra
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-[color:var(--muted)]">
                      123 Business Avenue, Tech Park
                    </p>
                    <p className="text-[color:var(--muted)]">Mumbai - 400001</p>
                    <div className="flex items-center gap-2 text-[color:var(--muted)]">
                      <FaPhone className="text-xs" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-2 text-[color:var(--muted)]">
                      <FaEnvelope className="text-xs" />
                      <span>support@mishramart.com</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[color:var(--border)]">
                    <p className="text-[color:var(--muted)] text-xs sm:text-sm font-medium">
                      GSTIN: 27AABCU9603R1ZM
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <FaMapMarkerAlt className="text-cyan-500" />
                  Bill To:
                </h3>

                <div className="bg-[color:var(--surface-2)] p-3 sm:p-4 rounded-xl border border-[color:var(--border)] space-y-3">
                  <p className="font-bold text-base sm:text-xl break-words">
                    {order.shippingAddress?.name || "Customer"}
                  </p>

                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-[color:var(--muted)] break-words">
                      {order.shippingAddress?.address}
                    </p>
                    <p className="text-[color:var(--muted)] break-words">
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.pincode}
                    </p>

                    <div className="flex items-center gap-2 text-[color:var(--muted)]">
                      <FaPhone className="text-xs" />
                      <span>{order.shippingAddress?.phone}</span>
                    </div>

                    <p className="text-[color:var(--muted)] break-all">
                      {order.shippingAddress?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                ["INVOICE NO", order.orderId],
                ["INVOICE DATE", formatDate(order.createdAt)],
                ["ORDER DATE", formatDate(order.createdAt)],
                ["PAYMENT", getPaymentMethodText(order.paymentMethod)],
              ].map(([label, value], idx) => (
                <div
                  key={idx}
                  className="bg-cyan-500/10 p-2 sm:p-3 rounded-xl border border-cyan-500/20"
                >
                  <p className="text-[10px] sm:text-xs text-cyan-500 font-semibold mb-1">
                    {label}
                  </p>
                  <p className="font-bold text-xs sm:text-sm break-words">
                    {idx === 3 ? (
                      <span className="flex items-center gap-2">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        {value}
                      </span>
                    ) : (
                      value
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-green-500/10 p-3 sm:p-4 rounded-xl border border-green-500/20">
                <h4 className="font-semibold mb-2 text-base sm:text-lg flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  Order Status
                </h4>
                <span className={`font-bold text-base sm:text-xl ${getStatusColor(order.status)} block capitalize`}>
                  {order.status}
                </span>
                {order.deliveredAt && (
                  <p className="text-[color:var(--muted)] text-xs sm:text-sm mt-1">
                    Delivered on {formatDate(order.deliveredAt)}
                  </p>
                )}
              </div>

              <div className="bg-blue-500/10 p-3 sm:p-4 rounded-xl border border-blue-500/20">
                <h4 className="font-semibold mb-2 text-base sm:text-lg flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Payment Status
                </h4>
                <span className="font-bold text-green-500 text-base sm:text-xl block capitalize">
                  {order.paymentStatus || "paid"}
                </span>
                <p className="text-[color:var(--muted)] text-xs sm:text-sm mt-1">
                  Paid via {getPaymentMethodText(order.paymentMethod)}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold border-b border-[color:var(--border)] pb-3">
                Order Items
              </h3>

              {/* Desktop Table */}
              <div className="hidden lg:block bg-[color:var(--surface-2)] border border-[color:var(--border)] rounded-xl overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-[color:var(--surface)] border-b border-[color:var(--border)]">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-[color:var(--muted)] uppercase tracking-wider w-2/5">
                        Product
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-[color:var(--muted)] uppercase tracking-wider w-1/5">
                        Price
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-[color:var(--muted)] uppercase tracking-wider w-1/5">
                        Qty
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-[color:var(--muted)] uppercase tracking-wider w-1/5">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[color:var(--border)]">
                    {order.items?.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className="hover:bg-[color:var(--surface)] transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={getProductImage(item)}
                              alt={item.productId?.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-[color:var(--border)] flex-shrink-0"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150";
                                e.target.className =
                                  "w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-[color:var(--border)] flex-shrink-0 bg-[color:var(--surface-2)]";
                              }}
                            />
                            <div className="min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold break-words">
                                {item.productId?.name}
                              </h4>
                              {item.size && (
                                <p className="text-xs sm:text-sm text-[color:var(--muted)] mt-1">
                                  Size: {item.size}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-right">
                          <span className="text-sm sm:text-base flex items-center justify-end gap-1 whitespace-nowrap">
                            <FaRupeeSign className="text-xs sm:text-sm" />
                            {item.price?.toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-right">
                          <span className="text-sm sm:text-base whitespace-nowrap">
                            {item.quantity}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-right">
                          <span className="text-sm sm:text-base font-bold text-cyan-500 flex items-center justify-end gap-1 whitespace-nowrap">
                            <FaRupeeSign className="text-xs sm:text-sm" />
                            {(item.price * item.quantity)?.toLocaleString("en-IN")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {order.items?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="bg-[color:var(--surface-2)] border border-[color:var(--border)] rounded-xl p-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={getProductImage(item)}
                        alt={item.productId?.name}
                        className="w-12 h-12 object-cover rounded-lg border border-[color:var(--border)] flex-shrink-0"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150";
                          e.target.className =
                            "w-12 h-12 object-cover rounded-lg border border-[color:var(--border)] flex-shrink-0 bg-[color:var(--surface-2)]";
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold break-words">
                          {item.productId?.name}
                        </h4>

                        {item.size && (
                          <p className="text-xs text-[color:var(--muted)] mt-1">
                            Size: {item.size}
                          </p>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-[color:var(--muted)]">Price</p>
                            <p className="font-semibold flex items-center gap-1">
                              <FaRupeeSign />
                              {item.price?.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <p className="text-[color:var(--muted)]">Qty</p>
                            <p className="font-semibold">
                              {item.quantity}
                            </p>
                          </div>

                          <div className="col-span-2 pt-3 border-t border-[color:var(--border)]">
                            <p className="text-[color:var(--muted)] text-xs">Total</p>
                            <p className="font-bold text-cyan-500 text-base flex items-center gap-1">
                              <FaRupeeSign />
                              {(item.price * item.quantity)?.toLocaleString("en-IN")}
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
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-3 sm:p-4 border border-cyan-500/20">
              <div className="max-w-md ml-auto space-y-2 text-sm sm:text-base">
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <FaRupeeSign className="text-xs sm:text-sm" />
                    {subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="font-medium">Shipping Fee:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <FaRupeeSign className="text-xs sm:text-sm" />
                    {shipping.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="font-medium">Tax (18% GST):</span>
                  <span className="font-semibold flex items-center gap-1">
                    <FaRupeeSign className="text-xs sm:text-sm" />
                    {tax.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-cyan-500/30 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base sm:text-lg">
                      Total Amount:
                    </span>
                    <span className="font-bold text-cyan-500 flex items-center gap-1 text-lg sm:text-2xl">
                      <FaRupeeSign className="text-sm sm:text-lg" />
                      {total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden space-y-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div className="flex items-center justify-center text-green-500 font-semibold text-sm">
                  <FaCheckCircle className="mr-2 text-base" />
                  <span className="capitalize">
                    Payment Successful • {order.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  disabled={isGeneratingPDF}
                  className="flex items-center justify-center px-3 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaDownload className="mr-2" />
                  {isGeneratingPDF ? "..." : "Download"}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center px-3 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition text-sm"
                >
                  <FaPrint className="mr-2" />
                  Print
                </button>
              </div>

              <button
                onClick={handleShare}
                disabled={isGeneratingPDF}
                className="w-full flex items-center justify-center px-3 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaShare className="mr-2" />
                Share PDF
              </button>
            </div>

            {/* Thank You */}
            <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">
                  Thank You for Your Order!
                </h3>

                <p className="text-cyan-100 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto leading-relaxed">
                  We appreciate your business and trust in MishraMart. If you have
                  any questions about your order, please contact customer support.
                </p>

                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-cyan-100">
                    <FaEnvelope className="text-sm sm:text-base" />
                    <span>support@mishramart.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <FaPhone className="text-sm sm:text-base" />
                    <span>+91 98765 43210</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 border-t border-[color:var(--border)]">
              <p className="text-[color:var(--muted)] text-xs">
                MISHRA MART • 123 Business Avenue, Tech Park, Mumbai - 400001
              </p>
              <p className="text-[color:var(--muted)] text-xs mt-1">
                GSTIN: 27AABCU9603R1ZM • support@mishramart.com • +91 98765 43210
              </p>
            </div>
          </div>
        </div>

        {/* Back Button Desktop */}
        <div className="hidden lg:flex justify-between items-center mt-6">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-3 px-6 py-3 bg-[color:var(--surface)] border border-[color:var(--border)] hover:border-cyan-500 font-semibold rounded-xl transition"
          >
            <FaArrowLeft />
            Back to Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white font-semibold rounded-xl transition"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable, .printable * { visibility: visible; }
          .printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
            background: #fff !important;
          }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Invoice;