import express from "express";
import { 
    createOrder, 
    getMyOrders, 
    getOrderById, 
    cancelOrder, 
    downloadInvoice,
    updateOrderStatus 
} from "../controller/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/create", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);
router.put("/cancel/:id", cancelOrder);
router.get("/invoice/:id", downloadInvoice);

// Admin only routes
router.put("/status/:id", admin, updateOrderStatus);

export default router;