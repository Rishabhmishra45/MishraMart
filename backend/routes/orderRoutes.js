import express from 'express';
import isAuth from '../middleware/isAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  downloadInvoice,
  updateOrderStatus,
  getAllOrders
} from '../controller/orderController.js';

const orderRoutes = express.Router();

// User routes
orderRoutes.post("/create", isAuth, createOrder);
orderRoutes.get("/my-orders", isAuth, getUserOrders);
orderRoutes.get("/:orderId", isAuth, getOrderById);
orderRoutes.put("/cancel/:orderId", isAuth, cancelOrder);
orderRoutes.get("/invoice/:orderId", isAuth, downloadInvoice);

// Admin routes
orderRoutes.get("/admin/all-orders", adminAuth, getAllOrders);
orderRoutes.put("/status/:orderId", adminAuth, updateOrderStatus);

export default orderRoutes;