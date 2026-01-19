import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/**
 * ✅ Supports multiple env formats:
 * - CLOUDINARY_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 * - CLOUDINARY_CLOUD_NAME / CLOUDINARY_KEY / CLOUDINARY_SECRET
 */
const CLOUD_NAME =
  process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;

const API_KEY =
  process.env.CLOUDINARY_API_KEY ||
  process.env.CLOUDINARY_KEY ||
  process.env.CLOUDINARY_APIKEY;

const API_SECRET =
  process.env.CLOUDINARY_API_SECRET ||
  process.env.CLOUDINARY_SECRET ||
  process.env.CLOUDINARY_APISECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.log("❌ Cloudinary ENV missing:", {
    CLOUDINARY_NAME: !!CLOUD_NAME,
    CLOUDINARY_API_KEY: !!API_KEY,
    CLOUDINARY_API_SECRET: !!API_SECRET,
  });
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

/**
 * uploadOnCloudinary(filePath, options)
 * options:
 *  - folder: string
 *  - returnPublicId: boolean
 */
const uploadOnCloudinary = async (filePath, options = {}) => {
  try {
    if (!filePath) return null;

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.log("Cloudinary config missing env variables");
      try {
        fs.unlinkSync(filePath);
      } catch {}
      return null;
    }

    const { folder = "", returnPublicId = false } = options;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: folder || undefined,
    });

    // ✅ remove local file
    try {
      fs.unlinkSync(filePath);
    } catch {}

    if (returnPublicId) {
      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    return uploadResult.secure_url;
  } catch (error) {
    try {
      fs.unlinkSync(filePath);
    } catch {}

    console.log("Cloudinary upload error:", error.message);
    return null;
  }
};

// ✅ delete helper
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) return null;

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Cloudinary delete error:", error.message);
    return null;
  }
};

export default uploadOnCloudinary;
