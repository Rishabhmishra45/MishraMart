import React, { useState, useEffect, useContext, useMemo } from "react";
import upload_image2 from "../assets/upload_image2.png";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import UploadNotification from "../components/UploadNotification";

const UploadBox = ({ label, image, setImage, required = false, disabled }) => {
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
    <div className="flex flex-col items-center gap-2">
      <label
        className={`w-full ${
          disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"
        }`}
      >
        <input
          type="file"
          hidden
          required={required}
          disabled={disabled}
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <div className="group w-full aspect-square max-w-[88px] xs:max-w-[96px] sm:max-w-[110px] md:max-w-[130px] rounded-xl border-2 border-dashed border-gray-400/40 overflow-hidden flex items-center justify-center transition-all duration-300 hover:border-cyan-400 bg-gray-800/25">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        </div>
      </label>

      <p className="text-[11px] sm:text-xs text-gray-400 text-center">
        {label}
        {required ? <span className="text-red-400"> *</span> : ""}
      </p>
    </div>
  );
};

const Add = () => {
  const { serverUrl } = useContext(authDataContext);

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

  const [notification, setNotification] = useState({
    isVisible: false,
    type: "",
    productName: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!notification.isVisible || notification.type === "uploading") return;

    const timer = setTimeout(() => {
      setNotification({ isVisible: false, type: "", productName: "" });
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = (type, productName = "") => {
    setNotification({
      isVisible: true,
      type,
      productName,
    });
  };

  const sizeOptions = useMemo(() => ["S", "M", "L", "XL", "XXL"], []);

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (isUploading) return;

    // Basic validation (safe)
    if (!image1 || !image2 || !image3 || !image4) {
      showNotification("error");
      alert("Please upload all 4 product images.");
      return;
    }

    if (sizes.length === 0) {
      showNotification("error");
      alert("Please select at least 1 size.");
      return;
    }

    setIsUploading(true);
    showNotification("uploading");

    try {
      const formData = new FormData();
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
        `${serverUrl}/api/product/addproduct`,
        formData,
        { withCredentials: true }
      );

      if (result?.data) {
        showNotification("success", name);

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
      } else {
        showNotification("error");
      }
    } catch (error) {
      console.log("Add Product error:", error?.response?.data || error.message);
      showNotification("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="px-3 xs:px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
      <div className="max-w-5xl mx-auto pb-6 sm:pb-10">
        <div className="pt-6 sm:pt-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Add New Product
          </h1>
          <p className="text-gray-300 mt-2 text-xs sm:text-base">
            Add product details and upload images. Make sure everything is correct.
          </p>
        </div>

        {/* Notification */}
        <UploadNotification
          isVisible={notification.isVisible}
          type={notification.type}
          productName={notification.productName}
          onClose={() =>
            setNotification({ isVisible: false, type: "", productName: "" })
          }
        />

        <form
          onSubmit={handleAddProduct}
          className="mt-6 bg-gray-900/35 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700/40 shadow-xl"
        >
          {/* Images */}
          <div className="rounded-2xl border border-gray-800 bg-black/20 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-white font-bold text-base sm:text-xl">
                Product Images
              </h2>
              <p className="text-gray-400 text-[11px] sm:text-sm">
                Upload 4 images (required)
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4 place-items-center">
              <UploadBox
                label="Image 1"
                image={image1}
                setImage={setImage1}
                required
                disabled={isUploading}
              />
              <UploadBox
                label="Image 2"
                image={image2}
                setImage={setImage2}
                required
                disabled={isUploading}
              />
              <UploadBox
                label="Image 3"
                image={image3}
                setImage={setImage3}
                required
                disabled={isUploading}
              />
              <UploadBox
                label="Image 4"
                image={image4}
                setImage={setImage4}
                required
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Details */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-gray-800 bg-black/20 p-4 sm:p-6">
              <h2 className="text-white font-bold text-base sm:text-xl mb-4">
                Product Details
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-bold text-white mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    required
                    disabled={isUploading}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-400 text-sm sm:text-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-bold text-white mb-2">
                    Product Description
                  </label>
                  <textarea
                    placeholder="Write product description..."
                    required
                    disabled={isUploading}
                    className="w-full min-h-[110px] sm:min-h-[140px] px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-400 text-sm sm:text-base resize-y"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-white mb-2">
                      Category
                    </label>
                    <select
                      required
                      disabled={isUploading}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm sm:text-base"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-bold text-white mb-2">
                      Subcategory
                    </label>
                    <select
                      required
                      disabled={isUploading}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm sm:text-base"
                      value={subcategory}
                      onChange={(e) => setsubCategory(e.target.value)}
                    >
                      <option value="TopWear">Top Wear</option>
                      <option value="BottemWear">Bottom Wear</option>
                      <option value="WinterWear">Winter Wear</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-white mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="2000"
                      required
                      disabled={isUploading}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-400 text-sm sm:text-base"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <p className="text-[11px] sm:text-xs text-gray-400 mt-2">
                      Enter the selling price in INR.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-gray-900/30 border border-gray-800 px-4 py-3">
                    <input
                      type="checkbox"
                      id="bestseller"
                      disabled={isUploading}
                      className="w-5 h-5 cursor-pointer accent-cyan-500"
                      checked={bestseller}
                      onChange={(e) => setBestSeller(e.target.checked)}
                    />
                    <label
                      htmlFor="bestseller"
                      className="text-sm sm:text-base font-bold cursor-pointer text-white"
                    >
                      Mark as Best Seller
                    </label>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-white mb-2">
                    Available Sizes
                  </label>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {sizeOptions.map((size) => (
                      <button
                        type="button"
                        key={size}
                        disabled={isUploading}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold border text-xs sm:text-sm transition ${
                          sizes.includes(size)
                            ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white border-transparent"
                            : "bg-gray-900/40 text-gray-300 border-gray-700 hover:border-cyan-500"
                        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] sm:text-xs text-gray-400 mt-2">
                    Select sizes that are in stock.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-2xl border border-gray-800 bg-black/20 p-4 sm:p-6">
              <div>
                <p className="text-white font-extrabold text-sm sm:text-base">
                  Ready to upload product?
                </p>
                <p className="text-gray-400 text-[11px] sm:text-sm">
                  Double-check product details before uploading.
                </p>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className={`w-full sm:w-auto px-6 py-3 sm:py-4 rounded-xl font-extrabold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  isUploading
                    ? "bg-gray-700 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                } text-white`}
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
