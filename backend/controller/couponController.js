import Coupon from "../model/CouponModel.js";

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const cleanCode = code.toUpperCase().trim();

    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Coupon is inactive" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: "Coupon already used" });
    }

    const sub = Number(subtotal || 0);
    if (Number.isNaN(sub) || sub <= 0) {
      return res.status(400).json({ success: false, message: "Invalid subtotal" });
    }

    let discountAmount = 0;

    if (coupon.type === "percentage") {
      discountAmount = Math.round((sub * coupon.value) / 100);
    } else {
      discountAmount = Math.round(coupon.value);
    }

    if (discountAmount > sub) discountAmount = sub;

    return res.status(200).json({
      success: true,
      message: "Coupon applied",
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        expiresAt: coupon.expiresAt,
      },
      discountAmount,
      finalSubtotal: sub - discountAmount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({
      success: false,
      message: `Validate coupon error: ${error.message}`,
    });
  }
};
