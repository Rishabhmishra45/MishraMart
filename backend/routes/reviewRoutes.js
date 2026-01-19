import express from "express";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import {
  addReview,
  deleteReview,
  editReview,
  getProductReviews,
} from "../controller/reviewController.js";

const reviewRoutes = express.Router();

reviewRoutes.get("/:productId", getProductReviews);

reviewRoutes.post("/:productId", isAuth, upload.array("images", 3), addReview);

reviewRoutes.put("/edit/:reviewId", isAuth, upload.array("images", 3), editReview);

reviewRoutes.delete("/delete/:reviewId", isAuth, deleteReview);

export default reviewRoutes;
