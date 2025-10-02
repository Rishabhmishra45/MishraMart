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

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, city, state, pincode } = req.body;

    console.log("Updating profile for user:", userId);
    console.log("Update data:", { name, phone, address, city, state, pincode });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in request"
      });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    // Find user and update
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name?.trim(),
          phone,
          address,
          city,
          state,
          pincode
        }
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("Profile updated successfully:", user._id);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: `Update profile error: ${error.message}`
    });
  }
};