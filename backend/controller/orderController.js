import Order from "../model/OrderModel.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      items,
      totalAmount,
      shippingAddress,
      paymentMethod
    } = req.body;

    console.log("Creating order for user:", userId);
    console.log("Order data:", { items, totalAmount, shippingAddress, paymentMethod });

    if (!items || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: items, totalAmount, shippingAddress"
      });
    }

    // Validate required shipping address fields
    if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.phone || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: "Missing required shipping address fields"
      });
    }

    // MANUALLY GENERATE ORDER ID (FIX FOR THE ISSUE)
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const orderId = `MM${timestamp}${random}`;

    console.log("Generated Order ID:", orderId);

    const order = await Order.create({
      orderId, // MANUALLY ADDED ORDER ID
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
    });

    // Populate the order with product details INCLUDING IMAGES
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name images price image1 image2 image3 image4')
      .exec();

    console.log("Order created successfully:", populatedOrder);

    // Emit real-time update via Socket.IO
    if (req.io) {
      req.io.to(userId.toString()).emit('orderCreated', populatedOrder);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: `Create order error: ${error.message}`
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId })
      .populate('items.productId', 'name images price image1 image2 image3 image4')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: `Get user orders error: ${error.message}`
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('items.productId', 'name images price image1 image2 image3 image4');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: `Get order by ID error: ${error.message}`
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;
    const { cancellationReason } = req.body;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('items.productId', 'name images price image1 image2 image3 image4');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = cancellationReason || 'Customer requested cancellation';
    await order.save();

    // Emit real-time update
    if (req.io) {
      req.io.to(userId.toString()).emit('orderUpdated', order);
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order
    });

  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: `Cancel order error: ${error.message}`
    });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('items.productId', 'name images price image1 image2 image3 image4');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: "Invoice is only available for delivered orders"
      });
    }

    const pdfBuffer = await generateInvoice(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Download invoice error:", error);
    res.status(500).json({
      success: false,
        message: `Download invoice error: ${error.message}`
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId)
      .populate('items.productId', 'name images price image1 image2 image3 image4');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.status = status;
    
    if (status === 'shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
      order.shippedAt = new Date();
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Emit real-time update
    if (req.io) {
      req.io.to(order.userId.toString()).emit('orderUpdated', order);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: `Update order status error: ${error.message}`
    });
  }
};