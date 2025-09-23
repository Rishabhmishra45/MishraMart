import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import upload_image2 from "../assets/upload_image2.png";
import axios from "axios";

/* ---- UploadBox inside Add.jsx (but memoised) ---- */
const UploadBox = ({ image, setImage, required = false }) => {
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
    <label className="cursor-pointer">
      <input
        type="file"
        hidden
        required={required}
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
  const [price, setPrice] = useState("");
  const [subcategory, setsubCategory] = useState("TopWear");
  const [sizes, setSizes] = useState([]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image1", image1);
    if (image2) formData.append("image2", image2);
    if (image3) formData.append("image3", image3);
    if (image4) formData.append("image4", image4);

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("subcategory", subcategory);
    formData.append("sizes", JSON.stringify(sizes));

    try {
      const res = await axios.post(
        "http://localhost:6000/api/product/addproduct",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      alert("Product added successfully!");
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Upload error");
    }
  };

  return (
    <div className="w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-x-hidden relative">
      <Nav />
      <Sidebar />

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
            <UploadBox image={image1} setImage={setImage1} required />
            <UploadBox image={image2} setImage={setImage2} required />
            <UploadBox image={image3} setImage={setImage3} required />
            <UploadBox image={image4} setImage={setImage4} required />
          </div>

          {/* Product name */}
          <div className="mt-4">
            <label
              htmlFor="productName"
              className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none"
            >
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              placeholder="Type here"
              required
              className="w-full md:w-[60%] px-3 py-2 rounded-md bg-transparent border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          {/* Product description */}
          <div className="mt-4">
            <label
              htmlFor="productdes"
              className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none"
            >
              Product Description
            </label>
            <textarea
              id="productdes"
              placeholder="Type here"
              required
              className="w-full h-[100px] md:w-[60%] px-3 py-2 rounded-md bg-transparent border border-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
          </div>

          {/* Category & Subcategory */}
          <div className="w-[80%] flex items-center gap-[10px] flex-wrap">
            <div className="md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]">
              <p className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none">
                Product Category
              </p>
              <select
                className="bg-[#101B1E] w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border"
                required
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
          <div className="mt-4">
            <label
              htmlFor="productPrice"
              className="block text-[16px] md:text-[18px] font-semibold mb-1 select-none"
            >
              Product Price
            </label>
            <input
              id="productPrice"
              type="number"
              placeholder="₹ 2000"
              required
              className="w-full md:w-[60%] px-3 py-2 rounded-md bg-transparent border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-white font-medium mt-4 w-fit"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
