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
    <label className={`block ${disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
      <input
        type="file"
        hidden
        required={required}
        disabled={disabled}
        onChange={(e) => setImage(e.target.files[0])}
      />
      <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-400/60 overflow-hidden flex items-center justify-center transition-all duration-300 hover:border-blue-400 bg-gray-800/30">
        <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
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

      const result = await axios.post(serverUrl + "/api/product/addproduct", formData, {
        withCredentials: true,
      });

      if (result.data) {
        setMessage({ text: "Product added successfully ✅", type: "success" });
        setName(""); setDescription(""); setPrice("");
        setCategory("Men"); setsubCategory("TopWear");
        setBestSeller(false); setSizes([]);
        setImage1(null); setImage2(null); setImage3(null); setImage4(null);
      }
    } catch (error) {
      setMessage({ text: "Failed to add product ❌", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-l from-[#141414] to-[#0c2025] text-white min-h-screen">
      <Nav />
      <Sidebar />
      {/* content area with responsive margin and padding */}
      <div className="lg:ml-72 xl:ml-80 pt-16 lg:pt-20 px-3 xs:px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto pb-6 sm:pb-10">
          <h1 className="text-2xl pt-[30px] sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Add New Product</h1>
          <p className="text-gray-300 mt-2 mb-4 sm:mb-8 text-sm sm:text-base">Fill in the product details below</p>

          {message.text && (
            <div className="fixed top-16 lg:top-20 right-3 sm:right-4 z-50 max-w-xs sm:max-w-sm animate-slide-in">
              <div className={`relative px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl shadow-2xl ${message.type === "success"
                ? "bg-green-600"
                : message.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
                } text-white`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base">{message.text}</span>
                  <button onClick={() => setMessage({ text: "", type: "" })} className="ml-2 sm:ml-4 text-lg font-bold">×</button>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-progress"></div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleAddProduct}
            className="bg-gray-900/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700/50"
          >
            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Product Images</h2>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 justify-items-center">
                <UploadBox image={image1} setImage={setImage1} required disabled={isUploading} />
                <UploadBox image={image2} setImage={setImage2} required disabled={isUploading} />
                <UploadBox image={image3} setImage={setImage3} required disabled={isUploading} />
                <UploadBox image={image4} setImage={setImage4} required disabled={isUploading} />
              </div>
            </section>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Product Name</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  required disabled={isUploading}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm sm:text-base"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Product Description</label>
                <textarea
                  placeholder="Enter product description"
                  required disabled={isUploading}
                  className="w-full h-24 sm:h-32 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-vertical text-sm sm:text-base"
                  value={description} onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Category</label>
                  <select
                    required disabled={isUploading}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm sm:text-base"
                    value={category} onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Subcategory</label>
                  <select
                    required disabled={isUploading}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm sm:text-base"
                    value={subcategory} onChange={(e) => setsubCategory(e.target.value)}
                  >
                    <option value="TopWear">Top Wear</option><option value="BottemWear">Bottom Wear</option><option value="WinterWear">Winter Wear</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Price (₹)</label>
                <input
                  type="number" placeholder="2000" required disabled={isUploading}
                  className="w-full max-w-xs px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm sm:text-base"
                  value={price} onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Available Sizes</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      type="button" key={size} disabled={isUploading}
                      className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium border-2 text-sm sm:text-base ${sizes.includes(size)
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-gray-800/50 text-gray-300 border-gray-600 hover:border-blue-400"
                        } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() =>
                        setSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size])
                      }
                    >{size}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl">
                <input
                  type="checkbox" id="bestseller" disabled={isUploading}
                  className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer accent-blue-500"
                  checked={bestseller} onChange={(e) => setBestSeller(e.target.checked)}
                />
                <label htmlFor="bestseller" className="text-base sm:text-lg font-semibold cursor-pointer text-white">
                  Mark as Best Seller
                </label>
              </div>

              <button
                type="submit" disabled={isUploading}
                className={`w-full sm:w-[200px] py-3 sm:py-4 cursor-pointer rounded-lg sm:rounded-xl font-bold text-base sm:text-lg ${isUploading
                  ? "bg-gray-600 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  } text-white transition-all duration-300`}
              >
                {isUploading ? "Uploading Product..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;