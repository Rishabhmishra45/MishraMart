import express from "express";
import { 
    addToCart, 
    getCart, 
    addMultipleToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
} from "../controller/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/add", addToCart);
router.post("/add-multiple", addMultipleToCart);
router.get("/", getCart);
router.put("/update", updateCartItem);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

export default router;