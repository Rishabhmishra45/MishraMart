import React, { useContext, useEffect, useMemo, useState } from "react";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

const normalizeProducts = (data) => {
  // Handles: [ ... ] OR { success, products: [...] } OR { products: [...] }
  if (Array.isArray(data)) return data;
  if (data?.products && Array.isArray(data.products)) return data.products;
  if (data?.data?.products && Array.isArray(data.data.products)) return data.data.products;
  return [];
};

const Lists = () => {
  const { serverUrl } = useContext(authDataContext);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/product/list`, {
        withCredentials: true,
      });

      const products = normalizeProducts(res.data);
      setList(products);
    } catch (error) {
      console.log("fetchList error:", error?.response?.data || error.message);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const removeList = async (id) => {
    try {
      setDeletingId(id);

      const res = await axios.post(
        `${serverUrl}/api/product/remove/${id}`,
        {},
        { withCredentials: true }
      );

      if (res?.data?.success || res?.data) {
        await fetchList();
      } else {
        alert("Failed to remove product");
      }
    } catch (error) {
      console.log("removeList error:", error?.response?.data || error.message);
      alert("Failed to remove product");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const set = new Set(list?.map((p) => p?.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [list]);

  const filtered = useMemo(() => {
    let arr = [...list];

    if (category !== "all") {
      arr = arr.filter((p) => p?.category === category);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      arr = arr.filter((p) => {
        const name = (p?.name || "").toLowerCase();
        const cat = (p?.category || "").toLowerCase();
        return name.includes(q) || cat.includes(q) || String(p?.price || "").includes(q);
      });
    }

    return arr;
  }, [list, search, category]);

  return (
    <div className="px-3 xs:px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-10 mt-4 sm:mt-[30px]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Product Inventory
            </h1>
            <p className="text-gray-300 mt-2 text-xs sm:text-base">
              Manage and delete listed products
            </p>
          </div>

          <button
            onClick={fetchList}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-700 text-gray-200 hover:bg-white/5 transition font-semibold text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, price..."
              className="w-full px-4 py-3 rounded-xl bg-gray-950/40 border border-gray-800 text-white text-sm outline-none focus:border-cyan-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-950/40 border border-gray-800 text-white text-sm outline-none focus:border-cyan-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>

            <div className="w-full px-4 py-3 rounded-xl bg-gray-950/40 border border-gray-800 text-gray-300 text-sm flex items-center justify-between">
              <span>Total</span>
              <span className="text-cyan-400 font-bold">{filtered.length}</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-gray-300 text-sm">Loading products...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/30 rounded-3xl border border-gray-800">
              <div className="text-5xl mb-3">📦</div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">No Products Found</h2>
              <p className="text-gray-400 text-xs sm:text-base mt-2">
                Add products from “Add Items”, then refresh.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 lg:gap-6">
              {filtered.map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <img
                        src={item?.image1 || item?.images?.[0] || "https://via.placeholder.com/150"}
                        alt={item?.name || "Product"}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-800"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-xl font-bold text-white truncate">
                          {item?.name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {item?.category && (
                            <span className="px-3 py-1 rounded-full text-xs bg-blue-500/15 text-blue-200 border border-blue-500/20">
                              {item.category}
                            </span>
                          )}
                          {item?.price != null && (
                            <span className="px-3 py-1 rounded-full text-xs bg-green-500/15 text-green-200 border border-green-500/20 font-bold">
                              ₹{item.price}
                            </span>
                          )}
                          {item?.bestseller && (
                            <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/15 text-yellow-200 border border-yellow-500/20">
                              ⭐ Best Seller
                            </span>
                          )}
                        </div>

                        {Array.isArray(item?.sizes) && item.sizes.length > 0 && (
                          <p className="mt-2 text-xs sm:text-sm text-gray-400">
                            Sizes: <span className="text-gray-200">{item.sizes.join(", ")}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeList(item._id)}
                      disabled={deletingId === item._id}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold transition disabled:opacity-60"
                    >
                      {deletingId === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-400 text-xs sm:text-sm">
              Showing <span className="text-white font-semibold">{filtered.length}</span>{" "}
              product{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lists;
