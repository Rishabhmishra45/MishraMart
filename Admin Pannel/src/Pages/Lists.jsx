import React, { useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

const Lists = () => {
  const [list, setList] = useState([]);
  const { serverUrl } = useContext(authDataContext);

  const fetchList = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/product/list", {
        withCredentials: true,
      });
      setList(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const removeList = async (id) => {
    try {
      let result = await axios.post(`${serverUrl}/api/product/remove/${id}`, {}, { withCredentials: true })
      if (result.data) {
        fetchList()
      }
      else {
        console.log("Failed to remove Product")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white select-none">
      <Nav />
      <div className="w-full h-full flex items-start">
        <Sidebar />

        <div className="w-full md:w-[82%] lg:ml-[320px] md:ml-[230px] mt-[70px] flex flex-col gap-6 py-10 px-4 md:px-10">
          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            All Listed Products
          </h1>

          {/* Product List */}
          {list?.length > 0 ? (
            <div className="flex flex-col gap-4">
              {list.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-slate-700 rounded-xl p-4 shadow-md hover:scale-[1.01] transition"
                >
                  {/* Left side: image + details */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image1}
                      alt={item.name || "Product"}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex flex-col">
                      <h2 className="text-lg font-semibold">{item.name}</h2>
                      <p className="text-gray-300 text-sm">{item.category}</p>
                      <p className="text-gray-200 font-medium">₹{item.price}</p>
                    </div>
                  </div>

                  {/* Right side: delete button */}
                  <button
                    onClick={() => removeList(item._id)}
                    className="cursor-pointer hover:bg-red-600 text-white font-bold px-3 py-1 rounded-md transition"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white text-lg">No Products available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lists;
