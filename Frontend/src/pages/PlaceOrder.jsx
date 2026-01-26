import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { shopDataContext } from "../context/ShopContext";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import {
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaCreditCard,
    FaMoneyBillWave,
    FaShieldAlt,
    FaArrowLeft,
    FaCheck,
    FaRegCopy,
    FaTimes,
} from "react-icons/fa";

// ✅ Video import from public (Vite supports this path)
import placeOrderVid from "/placeOrderVid.mp4";

const PlaceOrder = () => {
    const navigate = useNavigate();

    const { cartItems, clearCart } = useCart();
    const { products, currency } = useContext(shopDataContext);
    const { userData } = useContext(userDataContext);
    const { serverUrl } = useContext(authDataContext);

    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("");
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState("");

    // Coupon
    const [coupon, setCoupon] = useState("");
    const [couponInfo, setCouponInfo] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Animated button
    const [btnProgress, setBtnProgress] = useState(0);
    const [btnLabel, setBtnLabel] = useState("");
    const [playBtnVideo, setPlayBtnVideo] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const videoRef = useRef(null);

    // Toast
    const [toast, setToast] = useState({ show: false, type: "success", msg: "" });

    const showToast = (type, msg) => {
        setToast({ show: true, type, msg });
        setTimeout(() => setToast({ show: false, type: "success", msg: "" }), 2600);
    };

    // Form
    const [formData, setFormData] = useState({
        firstName: userData?.name?.split(" ")[0] || "",
        lastName: userData?.name?.split(" ")[1] || "",
        email: userData?.email || "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
    });

    const delivery_fee = 50;
    const safeCartItems = useMemo(() => (Array.isArray(cartItems) ? cartItems : []), [cartItems]);

    const getCartTotal = () => {
        return safeCartItems.reduce((total, item) => {
            const product = products?.find((p) => p._id === item.id || p._id === item._id);
            const price = Number(item.price ?? product?.price ?? 0);
            const qty = Number(item.quantity ?? 0);
            return total + price * qty;
        }, 0);
    };

    const subtotal = getCartTotal();
    const total = subtotal + delivery_fee;
    const tax = subtotal * 0.18;
    const finalTotal = total + tax;
    const payableTotal = Math.max(0, Number(finalTotal) - Number(discountAmount || 0));

    useEffect(() => {
        if (safeCartItems.length === 0 && !orderPlaced) navigate("/cart");
    }, [safeCartItems.length, orderPlaced, navigate]);

    useEffect(() => {
        if (userData) {
            setFormData((prev) => ({
                ...prev,
                firstName: userData?.name?.split(" ")[0] || "",
                lastName: userData?.name?.split(" ")[1] || "",
                email: userData?.email || "",
            }));
        }
    }, [userData]);

    useEffect(() => {
        if (couponInfo) {
            setCouponInfo(null);
            setDiscountAmount(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subtotal]);

    // ✅ Preload video so no hang on click
    useEffect(() => {
        const v = document.createElement("video");
        v.src = placeOrderVid;
        v.preload = "auto";
        v.muted = true;
        v.playsInline = true;

        const onReady = () => setVideoReady(true);

        v.addEventListener("canplaythrough", onReady, { once: true });
        v.load();

        return () => {
            v.removeEventListener("canplaythrough", onReady);
        };
    }, []);

    // ✅ Handle video end
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const handleVideoEnd = () => {
            if (playBtnVideo) {
                // Video ended, start the progress animation
                setPlayBtnVideo(false);
                handleAfterVideo();
            }
        };

        videoElement.addEventListener("ended", handleVideoEnd);
        return () => {
            videoElement.removeEventListener("ended", handleVideoEnd);
        };
    }, [playBtnVideo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getCartItemImage = (item) => {
        return (
            item.image ||
            item.images?.[0] ||
            "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=150"
        );
    };

    const validateForm = () => {
        const requiredFields = ["firstName", "phone", "address", "city", "pincode"];
        const missingFields = requiredFields.filter((f) => !String(formData[f] || "").trim());

        if (missingFields.length > 0) {
            showToast("error", `Please fill required fields: ${missingFields.join(", ")}`);
            return false;
        }

        if (!selectedPayment) {
            showToast("error", "Please select payment method");
            return false;
        }

        if (safeCartItems.length === 0) {
            showToast("error", "Cart is empty");
            return false;
        }

        return true;
    };

    const createOrderInDatabase = async () => {
        const orderData = {
            items: safeCartItems.map((item) => ({
                productId: item.id || item._id,
                quantity: item.quantity,
                price: item.price,
                size: item.size || "M",
            })),
            totalAmount: payableTotal,
            discountAmount,
            couponCode: couponInfo?.code || "",
            shippingAddress: {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state || "",
                pincode: formData.pincode,
                landmark: formData.landmark || "",
            },
            paymentMethod: selectedPayment,
        };

        const response = await axios.post(`${serverUrl}/api/orders/create`, orderData, {
            withCredentials: true,
        });

        if (response?.data?.success) return response.data.order;
        throw new Error(response?.data?.message || "Failed to create order");
    };

    const applyCoupon = async () => {
        if (!coupon.trim()) return;

        try {
            setCouponLoading(true);
            const { data } = await axios.post(
                `${serverUrl}/api/coupons/validate`,
                { code: coupon, subtotal: finalTotal },
                { withCredentials: true }
            );

            if (data?.success) {
                setCouponInfo(data.coupon);
                setDiscountAmount(Number(data.discountAmount || 0));
                setCopied(false);
                showToast("success", `Coupon applied: ${data?.coupon?.code}`);
            }
        } catch (error) {
            console.error("Coupon apply error:", error);
            setCouponInfo(null);
            setDiscountAmount(0);
            showToast("error", error?.response?.data?.message || "Invalid coupon code");
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setCoupon("");
        setCouponInfo(null);
        setDiscountAmount(0);
        setCopied(false);
        showToast("success", "Coupon removed");
    };

    const copyCoupon = async () => {
        const code = couponInfo?.code || "";
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            showToast("success", "Coupon copied!");
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            showToast("error", "Copy failed");
        }
    };

    const runButtonProgress = async (duration = 900) => {
        setBtnProgress(0);
        const start = performance.now();

        return new Promise((resolve) => {
            const tick = (now) => {
                const t = Math.min(1, (now - start) / duration);
                setBtnProgress(Math.floor(t * 100));
                if (t < 1) requestAnimationFrame(tick);
                else resolve(true);
            };
            requestAnimationFrame(tick);
        });
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            const order = await createOrderInDatabase();
            setOrderId(order.orderId);
            clearCart();

            // Show confirmation immediately after order is placed
            setOrderPlaced(true);
            showToast("success", "Order placed successfully!");

        } catch (error) {
            console.error("Order failed:", error);
            showToast("error", `Order failed: ${error?.response?.data?.message || error.message}`);
            setIsProcessing(false);
            setPlayBtnVideo(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setIsProcessing(true);
        try {
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                showToast("error", "Razorpay SDK failed to load. Check internet.");
                return;
            }

            const order = await createOrderInDatabase();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: Math.round(payableTotal * 100),
                currency: "INR",
                name: "MishraMart",
                description: "Fashion Store Purchase",
                image: "/logo.png",
                order_id: order.razorpayOrderId || "",
                handler: async function () {
                    setOrderId(order.orderId);
                    clearCart();

                    // Show confirmation immediately after payment success
                    setOrderPlaced(true);
                    showToast("success", "Payment successful!");
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    contact: formData.phone,
                },
                notes: { address: formData.address },
                theme: { color: "#06b6d4" },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on("payment.failed", function (response) {
                console.error("Payment failed:", response.error);
                showToast("error", "Payment failed. Try again.");
                setIsProcessing(false);
                setPlayBtnVideo(false);
            });
        } catch (error) {
            console.error("Razorpay error:", error);
            showToast("error", `Payment failed: ${error?.response?.data?.message || error.message}`);
            setIsProcessing(false);
            setPlayBtnVideo(false);
        }
    };

    // ✅ Process after video ends
    const handleAfterVideo = async () => {
        setBtnLabel(selectedPayment === "razorpay" ? "Opening payment gateway..." : "Placing your order...");
        await runButtonProgress(selectedPayment === "razorpay" ? 600 : 900);

        if (selectedPayment === "razorpay") {
            await handleRazorpayPayment();
        } else {
            await handlePlaceOrder();
        }
    };

    // ✅ Main click: video -> then order/razorpay
    const handleAnimatedCheckout = async () => {
        if (isProcessing || !selectedPayment) return;
        if (!validateForm()) return;

        try {
            setIsProcessing(true);
            setPlayBtnVideo(true);

            // Let video mount before play
            await new Promise((r) => requestAnimationFrame(r));

            // Start playing video
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                await videoRef.current.play().catch(() => {
                    // If video fails to play, continue with order process
                    setPlayBtnVideo(false);
                    handleAfterVideo();
                });
            } else {
                // Fallback if video ref is not available
                setPlayBtnVideo(false);
                handleAfterVideo();
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setIsProcessing(false);
            setPlayBtnVideo(false);
        }
    };

    const handlePaymentSelection = (method) => setSelectedPayment(method);

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-[color:var(--background)] pt-16 animate-fadeIn">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                    <div className="text-center">
                        <div className="bg-[color:var(--surface)] rounded-2xl p-6 sm:p-10 shadow-xl border border-[color:var(--border)] animate-scaleIn">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-5 animate-pop">
                                <FaCheck className="text-white text-2xl sm:text-3xl" />
                            </div>
                            <h2 className="text-xl sm:text-3xl font-extrabold mb-2 animate-fadeInUp">Order Placed Successfully!</h2>
                            <p className="text-cyan-500 text-base sm:text-lg font-semibold mb-1 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>Order ID: {orderId}</p>
                            <p className="text-[color:var(--muted)] text-sm sm:text-base mb-7 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                Confirmation has been sent to {formData.email}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <button
                                    onClick={() => navigate("/collections")}
                                    className="px-7 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-all"
                                >
                                    Continue Shopping
                                </button>
                                <button
                                    onClick={() => navigate("/orders")}
                                    className="px-7 py-3 rounded-xl font-bold border border-[color:var(--border)] hover:bg-[color:var(--hover)] transition-all"
                                    style={{ color: "var(--text)" }}
                                >
                                    View Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
          @keyframes pop {
            0% { transform: scale(.85); opacity:.5 }
            100% { transform: scale(1); opacity:1 }
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes scaleIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-pop { 
            animation: pop 0.45s ease-out forwards;
            opacity: 0;
          }
          .animate-fadeInUp { 
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
          }
          .animate-fadeIn { 
            animation: fadeIn 0.4s ease-out forwards;
            opacity: 0;
          }
          .animate-scaleIn { 
            animation: scaleIn 0.4s ease-out forwards;
            opacity: 0;
          }
        `}</style>
            </div>
        );
    }

    const AnimatedCheckoutButton = () => (
        <button
            onClick={handleAnimatedCheckout}
            disabled={isProcessing || !selectedPayment}
            className="mt-5 w-full relative overflow-hidden px-6 py-4 rounded-2xl font-extrabold text-white
      bg-gradient-to-r from-blue-500 to-cyan-500 shadow-xl shadow-blue-500/20
      hover:opacity-95 transition-all active:scale-[0.99]
      disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {/* ✅ VIDEO ONLY ON CLICK - Reduced scale to fit better */}
            {playBtnVideo && (
                <>
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover scale-105"
                        src={placeOrderVid}
                        muted
                        playsInline
                        preload="auto"
                    />
                    <span className="absolute inset-0 bg-black/10" />
                </>
            )}

            {/* If video not preloaded yet, show minimal shimmer overlay on click */}
            {playBtnVideo && !videoReady && (
                <span className="absolute inset-0 bg-white/10 animate-pulse" />
            )}

            {/* Progress overlay after video ends */}
            {(isProcessing || btnProgress > 0) && !playBtnVideo && (
                <span
                    className="absolute inset-y-0 left-0 bg-white/20"
                    style={{ width: `${btnProgress}%`, transition: "width 120ms linear" }}
                />
            )}

            {/* Shine */}
            {(isProcessing || btnProgress > 0) && !playBtnVideo && (
                <span className="absolute inset-0 opacity-70 animate-[shine_1.2s_linear_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            )}

            <span className="relative z-10 flex items-center justify-center gap-3">
                {playBtnVideo ? (
                    <span className="text-sm sm:text-base font-extrabold tracking-wide bg-black/30 px-3 py-1 rounded-lg">
                        {selectedPayment === "razorpay" ? "Preparing secure payment..." : "Preparing your order..."}
                    </span>
                ) : isProcessing || btnProgress > 0 ? (
                    <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm sm:text-base">
                            {btnLabel ||
                                (selectedPayment === "razorpay" ? "Opening payment gateway..." : "Placing your order...")}
                        </span>
                    </>
                ) : (
                    <span className="text-sm sm:text-base">
                        {selectedPayment === "razorpay" ? "Proceed to Pay" : "Place Order"} • {currency}{" "}
                        {payableTotal.toFixed(2)}
                    </span>
                )}
            </span>

            <style>{`
        @keyframes shine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
        </button>
    );

    return (
        <div className="min-h-screen bg-[color:var(--background)] pt-16 pb-16">
            {toast.show && (
                <div className="fixed top-20 right-4 z-[9999] animate-[slideIn_.35s_ease-out]">
                    <div
                        className={`rounded-2xl px-4 py-3 shadow-2xl border text-sm font-semibold flex items-center gap-3 ${toast.type === "success"
                                ? "bg-green-500/15 border-green-500/30 text-green-400"
                                : "bg-red-500/15 border-red-500/30 text-red-400"
                            }`}
                    >
                        <span className="text-base">{toast.type === "success" ? "✅" : "⚠️"}</span>
                        <span>{toast.msg}</span>
                    </div>

                    <style>{`
            @keyframes slideIn {
              0% { transform: translateX(14px); opacity:0 }
              100% { transform: translateX(0); opacity:1 }
            }
          `}</style>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="mb-6 sm:mb-10">
                    <button
                        onClick={() => navigate("/cart")}
                        className="inline-flex items-center gap-2 text-[color:var(--muted)] hover:text-cyan-500 transition-colors mb-4"
                    >
                        <FaArrowLeft className="text-sm" />
                        <span className="text-sm sm:text-base">Back to Cart</span>
                    </button>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">Checkout</h1>
                    <p className="text-[color:var(--muted)] text-sm sm:text-base mt-2">
                        Complete your order by providing delivery details.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                    <div className="lg:hidden">
                        <OrderSummaryCard
                            currency={currency}
                            items={safeCartItems}
                            getCartItemImage={getCartItemImage}
                            delivery_fee={delivery_fee}
                            subtotal={subtotal}
                            tax={tax}
                            finalTotal={finalTotal}
                            discountAmount={discountAmount}
                            payableTotal={payableTotal}
                            coupon={coupon}
                            setCoupon={setCoupon}
                            couponInfo={couponInfo}
                            couponLoading={couponLoading}
                            applyCoupon={applyCoupon}
                            removeCoupon={removeCoupon}
                            copyCoupon={copyCoupon}
                            copied={copied}
                        />
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[color:var(--surface)] rounded-2xl p-4 sm:p-6 shadow-lg border border-[color:var(--border)]">
                            <h2 className="text-lg sm:text-xl font-extrabold mb-4 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-cyan-500" />
                                Delivery Information
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputWithIcon
                                    label="First Name *"
                                    icon={<FaUser />}
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Enter first name"
                                    required
                                />

                                <InputWithIcon
                                    label="Last Name"
                                    icon={<FaUser />}
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Enter last name"
                                />

                                <div className="sm:col-span-2">
                                    <InputWithIcon
                                        label="Email Address"
                                        icon={<FaEnvelope />}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                        type="email"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputWithIcon
                                        label="Phone Number *"
                                        icon={<FaPhone />}
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        required
                                        type="tel"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold mb-2">Address *</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-[color:var(--border)] rounded-2xl bg-transparent outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none"
                                        placeholder="Enter full address"
                                        required
                                        style={{ color: "var(--text)" }}
                                    />
                                </div>

                                <InputPlain label="City *" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" required />
                                <InputPlain label="State" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" />
                                <InputPlain label="Pincode *" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Enter pincode" required />
                                <InputPlain label="Landmark" name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="Enter landmark" />
                            </div>
                        </div>

                        <div className="bg-[color:var(--surface)] rounded-2xl p-4 sm:p-6 shadow-lg border border-[color:var(--border)]">
                            <h2 className="text-lg sm:text-xl font-extrabold mb-4 flex items-center gap-2">
                                <FaCreditCard className="text-cyan-500" />
                                Payment Method
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <PaymentCard
                                    active={selectedPayment === "cod"}
                                    onClick={() => handlePaymentSelection("cod")}
                                    icon={<FaMoneyBillWave className="text-green-500 text-xl" />}
                                    title="Cash on Delivery"
                                    desc="Pay when you receive your order"
                                />
                                <PaymentCard
                                    active={selectedPayment === "razorpay"}
                                    onClick={() => handlePaymentSelection("razorpay")}
                                    icon={<FaCreditCard className="text-blue-500 text-xl" />}
                                    title="Razorpay"
                                    desc="Secure online payment"
                                />
                            </div>
                        </div>

                        <div className="lg:hidden">
                            <AnimatedCheckoutButton />
                            <p className="text-[color:var(--muted)] text-xs text-center mt-3">
                                By placing your order, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24">
                            <OrderSummaryCard
                                currency={currency}
                                items={safeCartItems}
                                getCartItemImage={getCartItemImage}
                                delivery_fee={delivery_fee}
                                subtotal={subtotal}
                                tax={tax}
                                finalTotal={finalTotal}
                                discountAmount={discountAmount}
                                payableTotal={payableTotal}
                                coupon={coupon}
                                setCoupon={setCoupon}
                                couponInfo={couponInfo}
                                couponLoading={couponLoading}
                                applyCoupon={applyCoupon}
                                removeCoupon={removeCoupon}
                                copyCoupon={copyCoupon}
                                copied={copied}
                            />

                            <AnimatedCheckoutButton />

                            <p className="text-[color:var(--muted)] text-xs text-center mt-3">
                                By placing your order, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .smooth-enter{ animation: fadeUp .45s ease both; }
        @keyframes fadeUp{ 0%{ opacity:0; transform: translateY(8px)} 100%{ opacity:1; transform: translateY(0)} }
      `}</style>
        </div>
    );
};

export default PlaceOrder;

/* -------------------- UI Components -------------------- */

const InputWithIcon = ({ label, icon, ...props }) => {
    return (
        <div className="smooth-enter">
            <label className="block text-sm font-semibold mb-2">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">{icon}</span>
                <input
                    {...props}
                    className="w-full pl-10 pr-4 py-3 border border-[color:var(--border)] rounded-2xl bg-transparent outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                    style={{ color: "var(--text)" }}
                />
            </div>
        </div>
    );
};

const InputPlain = ({ label, ...props }) => {
    return (
        <div className="smooth-enter">
            <label className="block text-sm font-semibold mb-2">{label}</label>
            <input
                {...props}
                className="w-full px-4 py-3 border border-[color:var(--border)] rounded-2xl bg-transparent outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                style={{ color: "var(--text)" }}
            />
        </div>
    );
};

const PaymentCard = ({ active, onClick, icon, title, desc }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`smooth-enter w-full p-4 rounded-2xl border text-left transition-all ${active
                    ? "border-cyan-500 bg-cyan-500/10 shadow-lg"
                    : "border-[color:var(--border)] hover:border-cyan-500/50 hover:bg-[color:var(--hover)]"
                }`}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[color:var(--surface2)] flex items-center justify-center border border-[color:var(--border)]">
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="font-extrabold">{title}</p>
                    <p className="text-sm text-[color:var(--muted)]">{desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${active ? "border-cyan-500 bg-cyan-500" : "border-[color:var(--border)]"}`}>
                    {active && <div className="w-full h-full rounded-full bg-white scale-50" />}
                </div>
            </div>
        </button>
    );
};

const OrderSummaryCard = ({
    currency,
    items,
    getCartItemImage,
    delivery_fee,
    subtotal,
    tax,
    finalTotal,
    discountAmount,
    payableTotal,
    coupon,
    setCoupon,
    couponInfo,
    couponLoading,
    applyCoupon,
    removeCoupon,
    copyCoupon,
    copied,
}) => {
    return (
        <div className="bg-[color:var(--surface)] rounded-2xl p-4 sm:p-6 shadow-lg border border-[color:var(--border)] smooth-enter">
            <h3 className="text-lg sm:text-xl font-extrabold mb-4">Order Summary</h3>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                    <div
                        key={item.id || item._id}
                        className="flex gap-3 pb-3 border-b border-[color:var(--border)] last:border-b-0"
                    >
                        <img
                            src={getCartItemImage(item)}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-2xl border border-[color:var(--border)]"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm sm:text-base truncate">{item.name}</p>
                            <p className="text-[color:var(--muted)] text-xs sm:text-sm mt-1">
                                Size: {item.size || "M"} • Qty: {item.quantity}
                            </p>
                            <p className="text-cyan-500 font-extrabold text-sm sm:text-base mt-1">
                                {currency} {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-[color:var(--muted)]">
                    <span>Subtotal</span>
                    <span>
                        {currency} {subtotal.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between text-[color:var(--muted)]">
                    <span>Delivery Fee</span>
                    <span>
                        {currency} {delivery_fee}
                    </span>
                </div>
                <div className="flex justify-between text-[color:var(--muted)]">
                    <span>Tax (18% GST)</span>
                    <span>
                        {currency} {tax.toFixed(2)}
                    </span>
                </div>

                {discountAmount > 0 && (
                    <div className="flex justify-between text-green-400 font-extrabold">
                        <span>Discount</span>
                        <span>
                            - {currency} {discountAmount.toFixed(2)}
                        </span>
                    </div>
                )}

                <div className="border-t border-[color:var(--border)] pt-3 mt-3">
                    <div className="flex justify-between items-end">
                        <span className="font-extrabold text-base sm:text-lg">Total Amount</span>

                        {discountAmount > 0 ? (
                            <div className="text-right">
                                <p className="text-xs line-through text-[color:var(--muted)]">
                                    {currency} {finalTotal.toFixed(2)}
                                </p>
                                <p className="font-extrabold text-base sm:text-lg">
                                    {currency} {payableTotal.toFixed(2)}
                                </p>
                            </div>
                        ) : (
                            <span className="font-extrabold text-base sm:text-lg">
                                {currency} {finalTotal.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[color:var(--border)] p-4">
                <p className="font-extrabold mb-3">Apply Coupon</p>

                {!couponInfo ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <input
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                placeholder="Enter coupon code"
                                className="w-full min-w-0 px-4 py-3 rounded-2xl border border-[color:var(--border)] bg-transparent outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                                style={{ color: "var(--text)" }}
                                disabled={couponLoading}
                            />

                            <button
                                type="button"
                                onClick={applyCoupon}
                                disabled={couponLoading || !coupon.trim()}
                                className="shrink-0 px-6 py-3 rounded-2xl font-extrabold text-white
                bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-95 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {couponLoading ? "Applying..." : "Apply"}
                            </button>
                        </div>

                        <p className="text-xs text-[color:var(--muted)]">Tip: Newsletter subscribers get a 20% OFF coupon.</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-green-500/30 bg-green-700/15 dark:bg-green-500/10 p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-green-400 font-extrabold tracking-wide truncate">{couponInfo.code}</p>
                                <p className="text-xs text-green-300/80">Coupon applied successfully</p>
                            </div>

                            <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                                <button
                                    type="button"
                                    onClick={copyCoupon}
                                    className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-extrabold
                  border border-green-500/40 bg-green-700/20 hover:bg-green-700/30
                  dark:bg-green-500/15 dark:hover:bg-green-500/25 transition-all active:scale-[0.98]"
                                    title="Copy coupon"
                                >
                                    <FaRegCopy className="text-green-300 text-sm" />
                                    <span className="text-xs sm:text-sm text-green-100 font-extrabold">{copied ? "Copied" : "Copy"}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={removeCoupon}
                                    className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-extrabold
                  border border-[color:var(--border)] hover:bg-[color:var(--hover)] transition-all active:scale-[0.98]"
                                    title="Remove coupon"
                                    style={{ color: "var(--text)" }}
                                >
                                    <FaTimes className="text-sm" />
                                    <span className="text-xs sm:text-sm">Remove</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-5 flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center">
                    <FaShieldAlt className="text-white" />
                </div>
                <div>
                    <p className="text-green-400 font-extrabold">Secure Payment</p>
                    <p className="text-xs text-green-300/80">Your payment information is protected</p>
                </div>
            </div>
        </div>
    );
};