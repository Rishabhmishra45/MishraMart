import express from "express";
import Wishlist from "../model/wishlistModel.js";
import Product from "../model/productModel.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's wishlist
router.get("/", authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items.product', 'name price image1 category discountPercentage')
      .sort({ 'items.addedAt': -1 });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is empty",
        wishlist: { items: [] }
      });
    }

    res.status(200).json({
      success: true,
      wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist"
    });
  }
});

// Add item to wishlist
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        user: req.user._id,
        items: [{ product: productId }]
      });
    } else {
      // Check if product already in wishlist
      const existingItem = wishlist.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist"
        });
      }

      // Add new item
      wishlist.items.push({ product: productId });
    }

    await wishlist.save();

    // Populate the product details for response
    await wishlist.populate('items.product', 'name price image1 category discountPercentage');

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist"
    });
  }
});

// Remove item from wishlist
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }

    // Remove the item
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    // Populate remaining items
    await wishlist.populate('items.product', 'name price image1 category discountPercentage');

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist"
    });
  }
});

// Clear entire wishlist
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      wishlist
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while clearing wishlist"
    });
  }
});

// Check if product is in wishlist
router.get("/check/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const isInWishlist = wishlist ? 
      wishlist.items.some(item => item.product.toString() === productId) : 
      false;

    res.status(200).json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while checking wishlist"
    });
  }
});

export default router;