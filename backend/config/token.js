import jwt from "jsonwebtoken";

export const genToken = (userId) => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
    );
};

export const genToken1 = (email) => {
    return jwt.sign(
        { email }, 
        process.env.JWT_SECRET, 
        { expiresIn: "24h" }
    );
};