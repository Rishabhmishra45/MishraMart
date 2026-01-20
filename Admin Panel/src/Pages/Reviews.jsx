import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import { MdRateReview } from "react-icons/md";
import { FaStar, FaTrash, FaSearch, FaImages, FaEyeSlash, FaEye } from "react-icons/fa";

const normalizeProducts = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.products && Array.isArray(data.products)) return data.products;
  if (data?.data?.products && Array.isArray(data.data.products)) return data.data.products;
  return [];
};

const normalizeReviews = (data) => {
  // Handles { reviews: [...] } OR { success, reviews: [...] }
  if (Array.isArray(data)) return data;
  if (data?.reviews && Array.isArray(data.reviews)) return data.reviews;
  if (data?.data?.reviews && Array.isArray(data.data.reviews)) return data.data.reviews;
  return [];
};

const Reviews = () => {
  const { serverUrl } = useContext(authDataContext);

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");

  const [reviews, setReviews] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [expanded, setExpanded] = useState(false);

  const [busyId, setBusyId] = useState(null);

  // Image preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await axios.get(`${serverUrl}/api/product/list`, { withCredentials: true });
      setProducts(normalizeProducts(res.data));
    } catch (e) {
      console.error("Fetch products error", e?.response?.data || e.message);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchReviews = async (pid) => {
    if (!pid) return;
    try {
      setLoadingReviews(true);
      const res = await axios.get(`${serverUrl}/api/review/${pid}`, { withCredentials: true });
      setReviews(normalizeReviews(res.data));
    } catch (e) {
      console.error("Fetch reviews error", e?.response?.data || e.message);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (productId) fetchReviews(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = [...reviews];

    if (q) {
      arr = arr.filter((r) => {
        const name = (r?.userId?.name || r?.userName || "").toLowerCase();
        const text = (r?.reviewText || r?.comment || "").toLowerCase();
        return name.includes(q) || text.includes(q) || String(r?.rating || "").includes(q);
      });
    }

    arr.sort((a, b) => {
      const da = new Date(a?.createdAt || 0).getTime();
      const db = new Date(b?.createdAt || 0).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return arr;
  }, [reviews, search, sort]);

  const visibleReviews = expanded ? filtered : filtered.slice(0, 3);

  const productName = useMemo(() => {
    const p = products.find((x) => x._id === productId);
    return p?.name || "";
  }, [products, productId]);

  const openPreview = (images, index = 0) => {
    setPreviewImages(images || []);
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewImages([]);
    setPreviewIndex(0);
  };

  const deleteReview = async (reviewId) => {
    if (!reviewId) return;
    const ok = confirm("Delete this review? It will also delete images from Cloudinary.");
    if (!ok) return;

    try {
      setBusyId(reviewId);
      await axios.delete(`${serverUrl}/api/review/delete/${reviewId}`, { withCredentials: true });

      // optimistic
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (e) {
      console.error("Delete review error:", e?.response?.data || e.message);
      alert("Failed to delete review");
    } finally {
      setBusyId(null);
    }
  };

  const toggleHide = async (reviewId) => {
    try {
      setBusyId(reviewId);

      // ✅ backend route required (I am giving backend code below)
      const res = await axios.patch(
        `${serverUrl}/api/review/admin/toggle-hide/${reviewId}`,
        {},
        { withCredentials: true }
      );

      const updated = res?.data?.review;
      if (updated?._id) {
        setReviews((prev) => prev.map((r) => (r._id === reviewId ? updated : r)));
      }
    } catch (e) {
      console.error("toggleHide error:", e?.response?.data || e.message);
      alert("Hide/Unhide failed (backend update required)");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-3 xs:px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-10 mt-4 sm:mt-[30px]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
              <MdRateReview /> Manage Reviews
            </h1>
            <p className="text-gray-300 mt-2 text-xs sm:text-base">
              Select a product and moderate customer reviews
            </p>
          </div>

          <div className="w-full sm:w-[380px]">
            <label className="text-[11px] sm:text-sm text-gray-400 font-medium">
              Select Product
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setExpanded(false);
                setProductId(e.target.value);
              }}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-950/50 border border-gray-800 text-white text-sm outline-none focus:border-cyan-500"
              disabled={loadingProducts}
            >
              <option value="">
                {loadingProducts ? "Loading products..." : "Choose a product..."}
              </option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name / rating / review text..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 text-white text-sm outline-none focus:border-cyan-500"
              disabled={!productId}
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 text-white text-sm outline-none focus:border-cyan-500"
            disabled={!productId}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div className="mt-6">
          {!productId ? (
            <div className="text-center py-16 bg-gray-900/30 rounded-3xl border border-gray-800">
              <div className="text-4xl mb-3">📝</div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                Select a product
              </h2>
              <p className="text-gray-400 text-xs sm:text-base mt-2">
                Choose a product to load and moderate reviews.
              </p>
            </div>
          ) : loadingReviews ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">Loading reviews...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-300 text-xs sm:text-sm">
                  Product: <span className="text-white font-semibold">{productName || "Selected"}</span>{" "}
                  • Reviews: <span className="text-cyan-400 font-bold">{filtered.length}</span>
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-900/30 rounded-3xl border border-gray-800">
                  <div className="text-4xl mb-3">⭐</div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    No reviews yet
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-base mt-2">
                    This product has no reviews currently.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {visibleReviews.map((r) => {
                      const name = r?.userId?.name || r?.userName || "Customer";
                      const text = r?.reviewText || r?.comment || "";
                      const rating = Number(r?.rating || 0);
                      const imgs = Array.isArray(r?.images) ? r.images : [];

                      return (
                        <div
                          key={r._id}
                          className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-white text-sm sm:text-lg truncate max-w-[260px] sm:max-w-[420px]">
                                  {name}
                                </h3>
                                <div className="flex items-center gap-1 text-yellow-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={i < rating ? "opacity-100" : "opacity-20"}
                                    />
                                  ))}
                                </div>

                                {r?.isHidden ? (
                                  <span className="px-3 py-1 rounded-full text-xs bg-red-500/15 text-red-200 border border-red-500/20">
                                    Hidden
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-xs bg-green-500/15 text-green-200 border border-green-500/20">
                                    Visible
                                  </span>
                                )}

                                <span className="text-xs text-gray-400">
                                  {r?.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                                </span>
                              </div>

                              <p className="text-gray-300 text-xs sm:text-base mt-2 leading-relaxed">
                                {text || "—"}
                              </p>

                              {imgs.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 text-gray-300 text-xs mb-2">
                                    <FaImages className="text-cyan-400" />
                                    <span>{imgs.length} image(s)</span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-[360px]">
                                    {imgs.slice(0, 3).map((img, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        className="rounded-xl overflow-hidden border border-gray-800 hover:border-cyan-500 transition"
                                        onClick={() => openPreview(imgs, idx)}
                                      >
                                        <img
                                          src={img}
                                          alt="Review"
                                          className="w-full h-20 sm:h-24 object-cover"
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {/* Hide/Unhide */}
                              <button
                                onClick={() => toggleHide(r._id)}
                                disabled={busyId === r._id}
                                className="px-4 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                              >
                                {r?.isHidden ? <FaEye /> : <FaEyeSlash />}
                                {busyId === r._id ? "Updating..." : r?.isHidden ? "Unhide" : "Hide"}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => deleteReview(r._id)}
                                disabled={busyId === r._id}
                                className="px-4 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                              >
                                <FaTrash />
                                {busyId === r._id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filtered.length > 3 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setExpanded((p) => !p)}
                        className="px-6 py-3 rounded-xl border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 transition font-semibold text-sm"
                      >
                        {expanded ? "Show Less" : "See More Reviews"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-3">
          <div className="w-full max-w-4xl bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-white font-bold text-sm sm:text-lg">Review Image Preview</h3>
              <button onClick={closePreview} className="px-3 py-2 rounded-xl text-white hover:bg-white/10 transition">
                ✕
              </button>
            </div>

            <div className="p-4">
              <div className="w-full rounded-2xl overflow-hidden border border-gray-800">
                <img
                  src={previewImages[previewIndex]}
                  alt="Preview"
                  className="w-full max-h-[70vh] object-contain bg-black"
                />
              </div>

              {previewImages.length > 1 && (
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {previewImages.map((im, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewIndex(i)}
                      className={`rounded-xl overflow-hidden border transition ${
                        i === previewIndex ? "border-cyan-500" : "border-gray-800 hover:border-gray-600"
                      }`}
                    >
                      <img src={im} alt="thumb" className="w-full h-14 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
