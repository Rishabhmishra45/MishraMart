import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // ✅ NEW: support up to 3 images
    images: {
      type: [String], // Cloudinary URLs
      default: [],
    },

    // ✅ keep old field for backward compatibility (optional)
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// ✅ same user cannot review same product twice
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("review", reviewSchema);

export default Review;
