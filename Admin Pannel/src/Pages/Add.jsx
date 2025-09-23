import React, { useState, useEffect, useContext } from "react";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import upload_image2 from "../assets/upload_image2.png";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";

const UploadBox = ({ image, setImage, required = false, disabled }) => {
  const [preview, setPreview] = useState(upload_image2);

  useEffect(() => {
    if (!image) {
      setPreview(upload_image2);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  return (
    <label className={`cursor-pointer ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <input
        type="file"
        hidden
        required={required}
        disabled={disabled}
        onChange={(e) => setImage(e.target.files[0])}
      />
      <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-md border border-gray-400/40 overflow-hidden flex items-center justify-center hover:border-blue-400 transition-colors">
        <img src={preview} alt="" className="w-full h-full object-cover" />
      </div>
    </label>
  );
};

const Add = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [subcategory, setsubCategory] = useState("TopWear");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestSeller] = useState(false);

  const { serverUrl } = useContext(authDataContext);

  const [message, setMessage] = useState({ text: "", type: "" });
  const [isUploading, setIsUploading] = useState(false);

  // Auto hide message after 4 seconds
  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (isUploading) return;

    setIsUploading(true);
    setMessage({ text: "Uploading product...", type: "info" });
    console.log("Uploading product data...");

    try {
      let formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subcategory", subcategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("image1", image1);
      formData.append("image2", image2);
      formData.append("image3", image3);
      formData.append("image4", image4);

      const result = await axios.post(
        serverUrl + "/api/product/addproduct",
        formData,
        { withCredentials: true }
      );

      console.log("Server response:", result.data);

      if (result.data) {
        setMessage({ text: "Product added successfully ✅", type: "success" });

        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setCategory("Men");
        setsubCategory("TopWear");
        setBestSeller(false);
        setSizes([]);
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "Failed to add product ❌", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-x-hidden relative">
      <Nav />
      <Sidebar />

      {/* Floating animated toast message */}
      {message.text && (
        <div className="fixed top-[90px] right-[20px] w-[200px] md:w-[250px] z-50 animate-slide-in">
          <div
            className={`relative px-4 py-2 rounded-md shadow-md overflow-hidden ${message.type === "success"
              ? "bg-green-500 text-white"
              : message.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
              }`}
          >
            {message.text}
            <button
              onClick={() => setMessage({ text: "", type: "" })}
              className="absolute top-1 right-2 font-bold hover:text-black"
            >
              ×
            </button>
            {/* progress bar */}
            <div className="absolute bottom-0 left-0 h-[3px] bg-white animate-progress"></div>
          </div>
        </div>
      )}



      {/* Animations */}
      <style>
        {`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.4s ease-out;
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 4s linear forwards;
        }
      `}
      </style>



      <div className="w-[82%] h-[100%] flex items-start justify-start overflow-x-hidden absolute right-0">
        <form
          onSubmit={handleAddProduct}
          className="w-[100%] md:w-[90%] h-auto mt-[70px] flex flex-col gap-6 py-[40px] px-[30px] md:px-[60px]"
        >
          <div className="text-[25px] md:text-[35px] font-semibold select-none">
            Add Product Page
          </div>

          <p className="text-[18px] md:text-[22px] font-semibold mt-2 select-none">
            Upload Images
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <UploadBox image={image1} setImage={setImage1} required disabled={isUploading} />
            <UploadBox image={image2} setImage={setImage2} required disabled={isUploading} />
            <UploadBox image={image3} setImage={setImage3} required disabled={isUploading} />
            <UploadBox image={image4} setImage={setImage4} required disabled={isUploading} />
          </div>

          {/* Product name */}
          <div className="mt-4">
            <label htmlFor="productName" className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none">
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              placeholder="Type here"
              required
              disabled={isUploading}
              className="w-full md:w-[60%] px-3 py-2 rounded-md bg-transparent border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          {/* Product description */}
          <div className="mt-4">
            <label htmlFor="productdes" className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none">
              Product Description
            </label>
            <textarea
              id="productdes"
              placeholder="Type here"
              required
              disabled={isUploading}
              className="w-full h-[100px] md:w-[60%] px-3 py-2 rounded-md bg-transparent border border-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
          </div>

          {/* Category & Subcategory */}
          <div className="w-[80%] flex items-center gap-[10px] flex-wrap select-none">
            <div className="md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]">
              <p className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none">
                Product Category
              </p>
              <select
                className="bg-[#101B1E] w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border"
                required
                disabled={isUploading}
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className="md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]">
              <p className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none">
                Sub-Category
              </p>
              <select
                className="bg-[#101B1E] w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border"
                required
                disabled={isUploading}
                onChange={(e) => setsubCategory(e.target.value)}
                value={subcategory}
              >
                <option value="TopWear">TopWear</option>
                <option value="BottemWear">BottemWear</option>
                <option value="WinterWear">WinterWear</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="mt-4 select-none">
            <label htmlFor="productPrice" className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none">
              Product Price
            </label>
            <input
              id="productPrice"
              type="number"
              placeholder="₹ 2000"
              required
              disabled={isUploading}
              className="w-full md:w-[60%] px-3 py-2 rounded-md bg-transparent border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>

          {/* Sizes */}
          <div className="w-[80%] h-[220px] md:h-[100px] flex items-start justify-center flex-col gap-[10px] py-[10px] md:py-[0px] select-none">
            <p className="text-[16px] md:text-[18px] font-semibold">Product Sizes</p>
            <div className="flex items-center justify-start gap-[15px] flex-wrap">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <div
                  key={size}
                  className={`px-[20px] py-[7px] rounded-lg text-[18px] hover:border-[#46d1f7] border-[1px] cursor-pointer ${sizes.includes(size) ? "bg-green-200 text-black border-[#46d1f7]" : ""
                    } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
                  onClick={() =>
                    setSizes((prev) =>
                      prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
                    )
                  }
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          {/* Bestseller */}
          <div className="w-[80%] flex items-center justify-start gap-[10px] mt-[20px]">
            <input
              type="checkbox"
              id="checkbox"
              className="w-[25px] h-[25px] cursor-pointer"
              onChange={() => setBestSeller((prev) => !prev)}
              checked={bestseller}
              disabled={isUploading}
            />
            <label htmlFor="checkbox" className="text-[18px] md:text-[18px] font-semibold select-none">
              Add to BestSeller
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isUploading}
            className={`px-5 py-2 rounded-md font-medium mt-4 w-fit cursor-pointer select-none transition-all duration-200 ${isUploading
              ? "bg-gray-400 text-black cursor-not-allowed"
              : "bg-[#65d8f7] hover:bg-[#253236] hover:text-white text-black"
              }`}
          >
            {isUploading ? "Uploading..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
