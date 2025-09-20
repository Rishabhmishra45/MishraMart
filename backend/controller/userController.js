// controller/userController.js
import User from "../model/UserModel.js";

export const getCurrentUser = async (req, res) => {
  try {
    // isAuth middleware sets req.userId
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "User id missing from request" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error.message);
    return res.status(500).json({ message: `getCurrentUser error: ${error.message}` });
  }
};
