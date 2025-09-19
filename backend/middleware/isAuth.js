import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "No token provided, user not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid token, user not authenticated" });
        }

        // attach userId to req
        req.userId = decoded.id;

        next();
    } catch (error) {
        console.log("isAuth error:", error.message);
        return res.status(500).json({ message: `isAuth error: ${error.message}` });
    }
};

export default isAuth;
