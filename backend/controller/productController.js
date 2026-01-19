import Product from "../model/productModel.js";
import uploadOnCloudinary from "../config/cloudinary.js";

const PRODUCT_FOLDER = "mishramart/products";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      subcategory,
      sizes,
      bestseller,
    } = req.body;

    if (!name || !price || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, description and category are required",
      });
    }

    // ✅ parse sizes
    const parsedSizes =
      typeof sizes === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(sizes);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return sizes
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            }
          })()
        : Array.isArray(sizes)
        ? sizes
        : [];

    if (parsedSizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one size is required",
      });
    }

    // ✅ Upload product images
    const img1Upload = req.files?.image1?.[0]?.path
      ? await uploadOnCloudinary(req.files.image1[0].path, {
          folder: PRODUCT_FOLDER,
        })
      : "";

    const img2Upload = req.files?.image2?.[0]?.path
      ? await uploadOnCloudinary(req.files.image2[0].path, {
          folder: PRODUCT_FOLDER,
        })
      : "";

    const img3Upload = req.files?.image3?.[0]?.path
      ? await uploadOnCloudinary(req.files.image3[0].path, {
          folder: PRODUCT_FOLDER,
        })
      : "";

    const img4Upload = req.files?.image4?.[0]?.path
      ? await uploadOnCloudinary(req.files.image4[0].path, {
          folder: PRODUCT_FOLDER,
        })
      : "";

    if (!img1Upload) {
      return res.status(400).json({
        success: false,
        message: "Image1 is required",
      });
    }

    // ✅ Model requires image2/3/4 also: fallback to image1 if missing
    const image1 = img1Upload;
    const image2 = img2Upload || img1Upload;
    const image3 = img3Upload || img1Upload;
    const image4 = img4Upload || img1Upload;

    const product = await Product.create({
      name,
      price: Number(price),
      description,
      category,
      subcategory: subcategory?.trim() || "General",
      sizes: parsedSizes,
      date: Date.now(),
      bestseller: bestseller === true || bestseller === "true",
      image1,
      image2,
      image3,
      image4,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.log("addProduct error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to add product",
    });
  }
};

export const listProduct = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.log("listProduct error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    console.log("removeProduct error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to remove product",
    });
  }
};
