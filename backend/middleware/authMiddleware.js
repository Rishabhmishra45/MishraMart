import jwt from "jsonwebtoken";
import User from "../model/User.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in cookies first
        if (req.cookies.token) {
            token = req.cookies.token;
        }
        // Check for token in Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token - handle both userId and email (for admin)
            let user;
            if (decoded.userId) {
                user = await User.findById(decoded.userId).select('-password');
            } else if (decoded.email) {
                // For admin tokens with email
                user = {
                    _id: 'admin_user_id',
                    name: 'Admin',
                    email: decoded.email,
                    role: 'admin',
                    isAdmin: true
                };
            }
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, user not found"
                });
            }

            // Add user to request object
            req.user = user;
            next();

        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({
                success: false,
                message: "Not authorized, invalid token"
            });
        }

    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Server error in authentication",
            error: error.message
        });
    }
};

// Admin middleware - check if user is admin
export const admin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, please login first"
            });
        }

        if (!req.user.isAdmin && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied, admin privileges required"
            });
        }

        next();

    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Server error in admin verification",
            error: error.message
        });
    }
};

// Optional auth - doesn't throw error if no token, but adds user if available
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in cookies first
        if (req.cookies.token) {
            token = req.cookies.token;
        }
        // Check for token in Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Get user from token
                let user;
                if (decoded.userId) {
                    user = await User.findById(decoded.userId).select('-password');
                }
                
                if (user) {
                    // Add user to request object
                    req.user = user;
                }
            } catch (error) {
                // If token is invalid, just continue without user
                console.log("Optional auth - invalid token, continuing without user");
            }
        }

        next();

    } catch (error) {
        console.error("Optional auth middleware error:", error);
        // Continue even if there's an error in optional auth
        next();
    }
};

// Other middleware functions remain the same...
export const vendor = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, please login first"
            });
        }

        if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied, vendor or admin privileges required"
            });
        }

        next();

    } catch (error) {
        console.error("Vendor middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Server error in vendor verification",
            error: error.message
        });
    }
};

// Check if user is the owner of the resource or admin
export const ownerOrAdmin = (resourceUserIdField = 'userId') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, please login first"
                });
            }

            // If user is admin, allow access
            if (req.user.isAdmin || req.user.role === 'admin') {
                return next();
            }

            // Get the resource owner ID from the request
            let resourceOwnerId;
            
            // Check in params
            if (req.params[resourceUserIdField]) {
                resourceOwnerId = req.params[resourceUserIdField];
            }
            // Check in body
            else if (req.body[resourceUserIdField]) {
                resourceOwnerId = req.body[resourceUserIdField];
            }
            // Check in query
            else if (req.query[resourceUserIdField]) {
                resourceOwnerId = req.query[resourceUserIdField];
            }

            // If no resource owner ID found, deny access
            if (!resourceOwnerId) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied, resource owner not specified"
                });
            }

            // Check if current user is the resource owner
            if (resourceOwnerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied, you can only access your own resources"
                });
            }

            next();

        } catch (error) {
            console.error("Owner or admin middleware error:", error);
            res.status(500).json({
                success: false,
                message: "Server error in ownership verification",
                error: error.message
            });
        }
    };
};

// Export all middleware
export default {
    protect,
    admin,
    optionalAuth,
    vendor,
    ownerOrAdmin
};

