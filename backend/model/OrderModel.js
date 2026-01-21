import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        size: { type: String, default: "" },
      },
    ],

    totalAmount: { type: Number, required: true },

    discountAmount: { type: Number, default: 0 },

    couponCode: { type: String, default: "" },

    shippingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String, default: "" },
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },

    trackingNumber: { type: String, default: "" },
    deliveredAt: Date,
    shippedAt: Date,
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.orderId = `MM${timestamp}${random}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
