import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
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
      minlength: 5,
    },

    // ✅ max 3 images store
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
      },
    ],

    // ✅ old support
    image: { type: String, default: "" },

    // ✅ Admin control: hide/unhide
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ one user can review one product only
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.models.review || mongoose.model("review", reviewSchema);

export default Review;
