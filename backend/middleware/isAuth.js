import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token not found"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's user token (has userId) or admin token
        if (decoded.userId) {
            req.userId = decoded.userId;
        } else if (decoded.email) {
            // This is an admin token
            req.adminEmail = decoded.email;
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload"
            });
        }
        
        next();
        
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default isAuth;