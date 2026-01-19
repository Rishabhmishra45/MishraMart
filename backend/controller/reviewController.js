import Review from "../model/reviewModel.js";
import User from "../model/UserModel.js";
import uploadOnCloudinary from "../config/cloudinary.js";

// ✅ Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ normalize images so frontend always gets `images: []`
    const normalized = reviews.map((r) => {
      const imgs = Array.isArray(r.images) ? r.images : [];
      // backward compatibility: if old review had `image` string
      if (r.image && imgs.length === 0) imgs.push(r.image);
      return { ...r, images: imgs };
    });

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
    console.log("getProductReviews error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// ✅ Add review (max 3 images)
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 5 characters",
      });
    }

    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Upload max 3 images
    const uploadedImages = [];

    // req.files will exist because we are using upload.array("images", 3)
    if (Array.isArray(req.files) && req.files.length > 0) {
      const limitedFiles = req.files.slice(0, 3);

      for (const f of limitedFiles) {
        if (f?.path) {
          const url = await uploadOnCloudinary(f.path);
          if (url) uploadedImages.push(url);
        }
      }
    }

    const userName =
      user.name ||
      user.fullName ||
      user.username ||
      user.email?.split("@")[0] ||
      "User";

    const created = await Review.create({
      productId,
      userId: req.userId,
      userName,
      rating: numericRating,
      comment: comment.trim(),
      images: uploadedImages, // ✅ array of urls
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: created,
    });
  } catch (err) {
    console.log("addReview error:", err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this product. Please delete and add again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

// ✅ Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (String(review.userId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.log("deleteReview error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};
