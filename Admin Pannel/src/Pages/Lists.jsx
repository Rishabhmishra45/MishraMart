import React, { useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

const Lists = () => {
  const [list, setList] = useState([]);
  const { serverUrl } = useContext(authDataContext);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const result = await axios.get(serverUrl + "/api/product/list", {
        withCredentials: true,
      });
      setList(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const removeList = async (id) => {
    try {
      setDeletingId(id);
      let result = await axios.post(`${serverUrl}/api/product/remove/${id}`, {}, { withCredentials: true });
      if (result.data) {
        await fetchList();
      } else {
        console.log("Failed to remove Product");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="bg-gradient-to-l from-[#141414] to-[#0c2025] text-white min-h-screen">
      <Nav />
      <Sidebar />
      <div className="ml-64 lg:ml-72 xl:ml-80 pt-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="max-w-5xl mx-auto pb-10 mt-[30px]">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Product Inventory
          </h1>
          <p className="text-gray-300 mt-2 mb-8">Manage your listed products</p>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading products...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {list?.length > 0 ? (
                list.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <img
                            src={item.image1}
                            alt={item.name || "Product"}
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-lg"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold truncate text-white mb-1">{item.name}</h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">{item.category}</span>
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">₹{item.price}</span>
                            {item.bestseller && (
                              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">⭐ Best Seller</span>
                            )}
                          </div>
                          {item.sizes && item.sizes.length > 0 && (
                            <div className="text-sm text-gray-300">
                              <span className="text-gray-400">Sizes: </span>{item.sizes.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeList(item._id)}
                        disabled={deletingId === item._id}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-red-400 disabled:to-red-300 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                      >
                        {deletingId === item._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Deleting</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-semibold text-gray-300 mb-2">No Products Found</h3>
                  <p className="text-gray-400">Get started by adding your first product.</p>
                </div>
              )}
            </div>
          )}

          {!loading && list.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm">
                Showing <span className="text-white font-semibold">{list.length}</span> product{list.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lists;
