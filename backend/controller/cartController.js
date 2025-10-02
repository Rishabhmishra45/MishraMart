import Cart from "../model/Cart.js";
import Product from "../model/Product.js";

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity, size } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            // Create new cart if doesn't exist
            cart = new Cart({
                userId: req.user._id,
                items: [{
                    productId,
                    quantity,
                    size
                }]
            });
        } else {
            // Check if item already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId && item.size === size
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item to cart
                cart.items.push({
                    productId,
                    quantity,
                    size
                });
            }
        }

        await cart.save();
        await cart.populate('items.productId', 'name price images');

        res.json({
            success: true,
            message: "Item added to cart successfully",
            cart
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add item to cart",
            error: error.message
        });
    }
};

// @desc    Add multiple items to cart
// @route   POST /api/cart/add-multiple
// @access  Private
export const addMultipleToCart = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items array is required"
            });
        }

        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        for (let newItem of items) {
            const existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === newItem.productId && item.size === newItem.size
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += newItem.quantity;
            } else {
                cart.items.push({
                    productId: newItem.productId,
                    quantity: newItem.quantity,
                    size: newItem.size
                });
            }
        }

        await cart.save();
        await cart.populate('items.productId', 'name price images sizes');

        res.json({
            success: true,
            message: "Items added to cart successfully",
            cart
        });

    } catch (error) {
        console.error("Add multiple to cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add items to cart",
            error: error.message
        });
    }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.productId', 'name price images sizes countInStock');

        if (!cart) {
            return res.json({
                success: true,
                cart: { items: [], userId: req.user._id }
            });
        }

        res.json({
            success: true,
            cart
        });

    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
            error: error.message
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        const cart = await Cart.findOne({ userId: req.user._id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        await cart.populate('items.productId', 'name price images sizes');

        res.json({
            success: true,
            message: "Cart updated successfully",
            cart
        });

    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart",
            error: error.message
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        
        await cart.save();
        await cart.populate('items.productId', 'name price images sizes');

        res.json({
            success: true,
            message: "Item removed from cart successfully",
            cart
        });

    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart",
            error: error.message
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            message: "Cart cleared successfully",
            cart
        });

    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to clear cart",
            error: error.message
        });
    }
};