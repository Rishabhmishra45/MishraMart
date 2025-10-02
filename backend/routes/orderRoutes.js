import express from 'express';
import isAuth from '../middleware/isAuth.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  downloadInvoice,
  updateOrderStatus
} from '../controller/orderController.js';

const orderRoutes = express.Router();

orderRoutes.post("/create", isAuth, createOrder);
orderRoutes.get("/my-orders", isAuth, getUserOrders);
orderRoutes.get("/:orderId", isAuth, getOrderById);
orderRoutes.put("/cancel/:orderId", isAuth, cancelOrder);
orderRoutes.get("/invoice/:orderId", isAuth, downloadInvoice);
orderRoutes.put("/status/:orderId", updateOrderStatus); // Admin route

export default orderRoutes;