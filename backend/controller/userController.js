import User from "../model/UserModel.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // 👈 fixed

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error.message);
    return res.status(500).json({ message: `getCurrentUser error: ${error.message}` });
  }
};
