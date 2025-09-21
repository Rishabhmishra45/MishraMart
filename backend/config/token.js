import jwt from "jsonwebtoken";

export const genToken = (userId) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in env");
    }
    // synchronous sign is fine
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.error("Error in token generation:", error.message);
    throw error;
  }
};



//Token generation for admin panel

export const genToken1 = (email) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in env");
    }
    const token = jwt.sign({email}, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.error("Error in token generation:", error.message);
    throw error;
  }
};