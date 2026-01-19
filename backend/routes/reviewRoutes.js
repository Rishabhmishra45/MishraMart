import express from "express";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import {
  addReview,
  deleteReview,
  getProductReviews,
} from "../controller/reviewController.js";

const reviewRoutes = express.Router();

// ✅ GET all reviews of a product
reviewRoutes.get("/:productId", getProductReviews);

// ✅ POST new review (max 3 images)
// IMPORTANT: form field name => "images"
reviewRoutes.post("/:productId", isAuth, upload.array("images", 3), addReview);

// ✅ DELETE review
reviewRoutes.delete("/delete/:reviewId", isAuth, deleteReview);

export default reviewRoutes;
