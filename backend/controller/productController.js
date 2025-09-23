import uploadOnCloudinary from "../config/cloudinary.js";
import Product from "../model/productModel.js";

export const addProduct = async (req, res) => {
  try {
    let { name, description, price, category, subcategory, sizes, bestseller } = req.body;

    // Parallel Cloudinary upload for faster response
    const images = await Promise.all([
      req.files?.image1 ? uploadOnCloudinary(req.files.image1[0].path) : null,
      req.files?.image2 ? uploadOnCloudinary(req.files.image2[0].path) : null,
      req.files?.image3 ? uploadOnCloudinary(req.files.image3[0].path) : null,
      req.files?.image4 ? uploadOnCloudinary(req.files.image4[0].path) : null,
    ]);

    const [image1, image2, image3, image4] = images;

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      subcategory,
      sizes: JSON.parse(sizes || "[]"),
      bestseller: bestseller === "true",
      date: Date.now(),
      image1,
      image2,
      image3,
      image4,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("AddProduct error:", error);
    res.status(500).json({ message: `AddProduct error: ${error.message}` });
  }
};
