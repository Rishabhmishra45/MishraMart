import Order from "../model/Order.js";
import Product from "../model/Product.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";

// @desc    Create new order
// @route   POST /api/orders/create
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            totalAmount,
            shippingAddress,
            paymentMethod
        } = req.body;

        // Validate items and stock
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            // Check stock availability
            if (product.countInStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}`
                });
            }
        }

        const order = new Order({
            userId: req.user._id,
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                price: item.price
            })),
            totalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
        });

        const createdOrder = await order.save();
        await createdOrder.populate('items.productId', 'name price images');

        // Update product stock
        for (let item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { countInStock: -item.quantity }
            });
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: createdOrder
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate('items.productId', 'name images price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id,
            userId: req.user._id 
        }).populate('items.productId', 'name images price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order",
            error: error.message
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/cancel/:id
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if order can be cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled as it is already ${order.status}`
            });
        }

        // Restore product stock
        for (let item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { countInStock: item.quantity }
            });
        }

        order.status = 'cancelled';
        order.cancellationReason = req.body.cancellationReason || 'Customer requested cancellation';
        
        await order.save();

        res.json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.error("Cancel order error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel order",
            error: error.message
        });
    }
};

// @desc    Download invoice
// @route   GET /api/orders/invoice/:id
// @access  Private
export const downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('items.productId', 'name price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: "Invoice is available only for delivered orders"
            });
        }

        // For now, return success message (implement PDF generation later)
        res.json({
            success: true,
            message: "Invoice download feature will be implemented soon",
            orderId: order.orderId
        });

        /* 
        // Uncomment when PDF generation is ready
        const invoiceBuffer = await generateInvoice(order);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);
        res.send(invoiceBuffer);
        */

    } catch (error) {
        console.error("Download invoice error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate invoice",
            error: error.message
        });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/status/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, trackingNumber, estimatedDelivery } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update status and related fields
        order.status = status;
        
        if (status === 'shipped') {
            order.shippedAt = new Date();
            order.trackingNumber = trackingNumber;
            order.estimatedDelivery = estimatedDelivery;
        } else if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();
        await order.populate('items.productId', 'name images price');

        res.json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
};