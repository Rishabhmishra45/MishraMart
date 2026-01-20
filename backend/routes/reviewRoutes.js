import express from "express";
import isAuth from "../middleware/isAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import {
  addReview,
  deleteReview,
  editReview,
  getProductReviews,
  toggleHideReview,
  getProductReviewsAdmin,
} from "../controller/reviewController.js";

const reviewRoutes = express.Router();

// public (frontend): only visible reviews
reviewRoutes.get("/:productId", getProductReviews);

// admin: include hidden reviews too
reviewRoutes.get("/admin/:productId", adminAuth, getProductReviewsAdmin);

// create / edit / delete
reviewRoutes.post("/:productId", isAuth, upload.array("images", 3), addReview);
reviewRoutes.put("/edit/:reviewId", isAuth, upload.array("images", 3), editReview);
reviewRoutes.delete("/delete/:reviewId", isAuth, deleteReview);

// admin: hide/unhide
reviewRoutes.patch("/admin/toggle-hide/:reviewId", adminAuth, toggleHideReview);

export default reviewRoutes;
