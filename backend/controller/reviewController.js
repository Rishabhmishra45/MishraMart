import mongoose from "mongoose";
import Review from "../model/reviewModel.js";
import User from "../model/UserModel.js";
import uploadOnCloudinary, { deleteFromCloudinary } from "../config/cloudinary.js";

const REVIEW_FOLDER = "mishramart/reviews";

// ✅ normalize images always
const normalizeImages = (review) => {
  const imgs = Array.isArray(review?.images) ? review.images : [];

  if (review?.image && imgs.length === 0) {
    return [{ url: review.image, publicId: "" }];
  }

  return imgs
    .map((x) => {
      if (!x) return null;
      if (typeof x === "string") return { url: x, publicId: "" };
      if (x?.url) return { url: x.url, publicId: x.publicId || "" };
      return null;
    })
    .filter(Boolean);
};

// ✅ GET Reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();

    const normalized = reviews.map((r) => ({
      ...r,
      images: normalizeImages(r),
    }));

    const total = normalized.length;
    const avgRating =
      total === 0
        ? 0
        : Number(
            (
              normalized.reduce((sum, r) => sum + (r.rating || 0), 0) / total
            ).toFixed(1)
          );

    return res.status(200).json({
      success: true,
      total,
      avgRating,
      reviews: normalized,
    });
  } catch (err) {
    console.log("getProductReviews error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// ✅ ADD Review
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid productId" });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const trimmedComment = (comment || "").trim();
    if (trimmedComment.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 5 characters",
      });
    }

    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Upload images optional
    const uploadedImages = [];
    const files = Array.isArray(req.files) ? req.files : [];
    const limited = files.slice(0, 3);

    for (const f of limited) {
      if (!f?.path) continue;

      const uploaded = await uploadOnCloudinary(f.path, {
        folder: REVIEW_FOLDER,
        returnPublicId: true,
      });

      // ✅ handle BOTH possible returns:
      // 1) object: {url, publicId}
      // 2) string url
      if (uploaded && typeof uploaded === "string") {
        uploadedImages.push({ url: uploaded, publicId: "" });
      } else if (uploaded?.url) {
        uploadedImages.push(uploaded);
      }
    }

    const userName =
      user?.name ||
      user?.fullName ||
      user?.username ||
      user?.email?.split("@")[0] ||
      "User";

    const created = await Review.create({
      productId,
      userId: req.userId,
      userName,
      rating: numericRating,
      comment: trimmedComment,
      images: uploadedImages,
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: created,
    });
  } catch (err) {
    console.log("addReview error:", err);

    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this product. Please edit your review.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

// ✅ EDIT Review
export const editReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, keepPublicIds } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid reviewId" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (String(review.userId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own review",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (!numericRating || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = numericRating;
    }

    if (comment !== undefined) {
      const trimmed = (comment || "").trim();
      if (trimmed.length < 5) {
        return res.status(400).json({
          success: false,
          message: "Comment must be at least 5 characters",
        });
      }
      review.comment = trimmed;
    }

    const currentImages = normalizeImages(review);

    // parse keepPublicIds
    let keepIds = [];
    try {
      keepIds = keepPublicIds ? JSON.parse(keepPublicIds) : [];
      if (!Array.isArray(keepIds)) keepIds = [];
    } catch {
      keepIds = [];
    }

    const kept = currentImages.filter(
      (img) => keepIds.includes(img.publicId) || keepIds.includes(img.url)
    );

    const removed = currentImages.filter(
      (img) => !kept.some((k) => k.url === img.url)
    );

    for (const r of removed) {
      if (r.publicId) await deleteFromCloudinary(r.publicId);
    }

    // upload new images (remaining slots)
    const newUploads = [];
    const files = Array.isArray(req.files) ? req.files : [];
    const slots = Math.max(0, 3 - kept.length);
    const limited = files.slice(0, slots);

    for (const f of limited) {
      if (!f?.path) continue;

      const uploaded = await uploadOnCloudinary(f.path, {
        folder: REVIEW_FOLDER,
        returnPublicId: true,
      });

      if (uploaded && typeof uploaded === "string") {
        newUploads.push({ url: uploaded, publicId: "" });
      } else if (uploaded?.url) {
        newUploads.push(uploaded);
      }
    }

    review.images = [...kept, ...newUploads].slice(0, 3);

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (err) {
    console.log("editReview error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to edit review",
    });
  }
};

// ✅ DELETE Review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (String(review.userId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    const imgs = normalizeImages(review);

    for (const img of imgs) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.log("deleteReview error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};
