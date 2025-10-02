import User from "../model/UserModel.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID not found in request" 
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error("getCurrentUser error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: `Server error: ${error.message}` 
    });
  }
};

export const getAdmin = async (req, res) => {
  try {
    let adminEmail = req.adminEmail;
    
    if (!adminEmail) {
      return res.status(401).json({ 
        success: false,
        message: "Admin authentication required" 
      });
    }
    
    return res.status(200).json({
      success: true,
      email: adminEmail,
      role: "admin"
    });
    
  } catch (error) {
    console.error("getAdmin error:", error);
    return res.status(500).json({ 
      success: false,
      message: `Server error: ${error.message}` 
    });
  }
};