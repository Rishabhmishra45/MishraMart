import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    let token;

    // Authorization header (Bearer ...)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Or cookie named 'token'
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("isAuth error:", error.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export default isAuth;
