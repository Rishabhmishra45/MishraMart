import Order from "../model/OrderModel.js";
import Coupon from "../model/CouponModel.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";

const validateCouponForOrder = async ({ code, subtotal }) => {
  if (!code) return { discountAmount: 0, couponCode: "" };

  const cleanCode = code.toUpperCase().trim();

  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon) return { discountAmount: 0, couponCode: "" };

  if (!coupon.isActive) return { discountAmount: 0, couponCode: "" };

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { discountAmount: 0, couponCode: "" };
  }

  if (coupon.usedCount >= coupon.maxUses) return { discountAmount: 0, couponCode: "" };

  const sub = Number(subtotal || 0);
  if (Number.isNaN(sub) || sub <= 0) return { discountAmount: 0, couponCode: "" };

  let discountAmount = 0;

  if (coupon.type === "percentage") {
    discountAmount = Math.round((sub * coupon.value) / 100);
  } else {
    discountAmount = Math.round(coupon.value);
  }

  if (discountAmount > sub) discountAmount = sub;

  return { discountAmount, couponCode: cleanCode, couponDoc: coupon };
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const { items, totalAmount, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: items, totalAmount, shippingAddress",
      });
    }

    if (
      !shippingAddress.name ||
      !shippingAddress.email ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required shipping address fields",
      });
    }

    // subtotal from items
    const subtotal = items.reduce((sum, it) => {
      const qty = Number(it.quantity || 0);
      const price = Number(it.price || 0);
      return sum + qty * price;
    }, 0);

    const { discountAmount, couponCode: appliedCode, couponDoc } =
      await validateCouponForOrder({ code: couponCode, subtotal });

    const finalTotal = Math.max(0, Math.round(Number(totalAmount) - discountAmount));

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const orderId = `MM${timestamp}${random}`;

    const order = await Order.create({
      orderId,
      userId,
      items,
      totalAmount: finalTotal,
      discountAmount,
      couponCode: appliedCode,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
    });

    // mark coupon used (one-time)
    if (couponDoc && discountAmount > 0) {
      couponDoc.usedCount = (couponDoc.usedCount || 0) + 1;
      couponDoc.isActive = couponDoc.usedCount < couponDoc.maxUses;
      await couponDoc.save();
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("items.productId", "name images price image1 image2 image3 image4")
      .exec();

    if (req.io) {
      req.io.to(userId.toString()).emit("orderCreated", populatedOrder);
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: `Create order error: ${error.message}`,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId })
      .populate("items.productId", "name images price image1 image2 image3 image4")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({
      success: false,
      message: `Get user orders error: ${error.message}`,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId", "name images price image1 image2 image3 image4")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      success: false,
      message: `Get all orders error: ${error.message}`,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: orderId, userId }).populate(
      "items.productId",
      "name images price image1 image2 image3 image4"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({
      success: false,
      message: `Get order by ID error: ${error.message}`,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;
    const { cancellationReason } = req.body;

    const order = await Order.findOne({ _id: orderId, userId }).populate(
      "items.productId",
      "name images price image1 image2 image3 image4"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    order.status = "cancelled";
    order.cancellationReason = cancellationReason || "Customer requested cancellation";
    await order.save();

    if (req.io) {
      req.io.to(userId.toString()).emit("orderUpdated", order);
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: `Cancel order error: ${error.message}`,
    });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: orderId, userId }).populate(
      "items.productId",
      "name images price image1 image2 image3 image4"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Invoice is not available for cancelled orders",
      });
    }

    const pdfBuffer = await generateInvoice(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order?.orderId || orderId}.pdf`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Download invoice error:", error);
    return res.status(500).json({
      success: false,
      message: `Download invoice error: ${error.message}`,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId)
      .populate("items.productId", "name images price image1 image2 image3 image4")
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;

    if (status === "shipped" && trackingNumber) {
      order.trackingNumber = trackingNumber;
      order.shippedAt = new Date();
    }

    if (status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "completed";
    }

    await order.save();

    if (req.io) {
      req.io.to(order.userId._id.toString()).emit("orderUpdated", order);
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: `Update order status error: ${error.message}`,
    });
  }
};
