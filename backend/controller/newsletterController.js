import Newsletter from "../model/NewsletterModel.js";
import Coupon from "../model/CouponModel.js";

const MAX_SUBSCRIBERS = 100;
const COUPON_VALUE = 20; // 20% OFF
const COUPON_EXPIRY_DAYS = 30;

const makeCouponCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `MM20-${s}`;
};

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // if already subscribed -> return existing coupon
    const existing = await Newsletter.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already subscribed",
        couponCode: existing.couponCode,
        alreadySubscribed: true,
      });
    }

    const totalSubscribers = await Newsletter.countDocuments();
    if (totalSubscribers >= MAX_SUBSCRIBERS) {
      return res.status(400).json({
        success: false,
        message: "Offer ended. Maximum subscribers reached.",
      });
    }

    // create unique coupon code
    let code = makeCouponCode();
    let tries = 0;
    while (tries < 5) {
      const isTaken = await Coupon.findOne({ code });
      if (!isTaken) break;
      code = makeCouponCode();
      tries++;
    }

    const expiresAt = new Date(Date.now() + COUPON_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await Coupon.create({
      code,
      type: "percentage",
      value: COUPON_VALUE,
      maxUses: 1,
      usedCount: 0,
      isActive: true,
      expiresAt,
      assignedTo: null,
    });

    await Newsletter.create({
      email: cleanEmail,
      couponCode: code,
    });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      couponCode: code,
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return res.status(500).json({
      success: false,
      message: `Newsletter subscribe error: ${error.message}`,
    });
  }
};
