import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaStar,
  FaTrash,
  FaImages,
  FaEdit,
  FaTimes,
  FaPlus,
  FaChevronDown,
} from "react-icons/fa";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/UserContext";

const MAX_IMAGES = 3;
const DEFAULT_VISIBLE_REVIEWS = 3;
const LOAD_MORE_STEP = 5;

/**
 * ✅ Client-side image compression
 * - reduces upload time drastically
 */
const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    try {
      if (!file.type.startsWith("image/")) return resolve(file);

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return resolve(file);

            const compressed = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressed);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };

      img.src = url;
    } catch (err) {
      resolve(file);
    }
  });
};

const ProductReviews = ({ productId }) => {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  // show limited reviews
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_REVIEWS);

  // create form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [err, setErr] = useState("");

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editKeepPublicIds, setEditKeepPublicIds] = useState([]);
  const [editNewImages, setEditNewImages] = useState([]);
  const [editNewPreviews, setEditNewPreviews] = useState([]);

  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState("");

  const uid = useMemo(
    () => userData?._id || userData?.id || userData?.uid,
    [userData]
  );

  const normalizeReviewImages = (imgs) => {
    if (!Array.isArray(imgs)) return [];
    return imgs
      .map((img) => {
        if (!img) return null;
        if (typeof img === "string") return { url: img, publicId: "" };
        return { url: img.url, publicId: img.publicId || "" };
      })
      .filter(Boolean);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/review/${productId}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
        setVisibleCount(DEFAULT_VISIBLE_REVIEWS); // reset view when new fetch
      }
    } catch (e) {
      console.log("fetchReviews error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // ✅ create review images (max 3) + compress
  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const limited = files.slice(0, MAX_IMAGES);

    // compress in parallel
    const compressed = await Promise.all(
      limited.map((f) => compressImage(f, 1200, 0.7))
    );

    setImages(compressed);
    setImagePreviews(compressed.map((file) => URL.createObjectURL(file)));
  };

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  // ✅ submit review (do not set content-type manually)
  const submitReview = async () => {
    setErr("");

    if (!userData) {
      setErr("Please login to submit a review.");
      return;
    }

    const trimmed = comment.trim();
    if (trimmed.length < 5) {
      setErr("Comment must be at least 5 characters.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setErr("Rating must be between 1 and 5.");
      return;
    }

    try {
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", trimmed);

      images.forEach((img) => formData.append("images", img));

      const res = await axios.post(
        `${serverUrl}/api/review/${productId}`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        setComment("");
        setRating(5);
        setImages([]);
        setImagePreviews([]);
        await fetchReviews();
      } else {
        setErr(res.data.message || "Failed to submit review");
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitLoading(false);
    }
  };

  const canManage = (review) => {
    return uid && review?.userId && String(uid) === String(review.userId);
  };

  const deleteReview = async (reviewId) => {
    if (!userData) return;
    try {
      const res = await axios.delete(
        `${serverUrl}/api/review/delete/${reviewId}`,
        { withCredentials: true }
      );
      if (res.data.success) await fetchReviews();
    } catch (e) {
      console.log("deleteReview error:", e.message);
    }
  };

  // ✅ open edit modal
  const openEdit = (review) => {
    setEditErr("");
    setEditingReview(review);

    const existing = normalizeReviewImages(review?.images);

    setEditRating(review?.rating || 5);
    setEditComment(review?.comment || "");
    setEditExistingImages(existing);
    setEditKeepPublicIds(existing.map((x) => x.publicId || x.url));

    setEditNewImages([]);
    setEditNewPreviews([]);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingReview(null);
    editNewPreviews.forEach((u) => URL.revokeObjectURL(u));

    setEditNewPreviews([]);
    setEditNewImages([]);
    setEditExistingImages([]);
    setEditKeepPublicIds([]);
    setEditRating(5);
    setEditComment("");
    setEditErr("");
  };

  const removeExistingImage = (img) => {
    const key = img.publicId || img.url;
    setEditKeepPublicIds((prev) => prev.filter((x) => x !== key));
  };

  const handleEditNewImages = async (e) => {
    const files = Array.from(e.target.files || []);

    const keptCount = editExistingImages.filter((img) =>
      editKeepPublicIds.includes(img.publicId || img.url)
    ).length;

    const remainingSlots = Math.max(0, MAX_IMAGES - keptCount);
    const limited = files.slice(0, remainingSlots);

    const compressed = await Promise.all(
      limited.map((f) => compressImage(f, 1200, 0.7))
    );

    editNewPreviews.forEach((u) => URL.revokeObjectURL(u));

    setEditNewImages(compressed);
    setEditNewPreviews(compressed.map((f) => URL.createObjectURL(f)));
  };

  const submitEdit = async () => {
    setEditErr("");
    if (!editingReview?._id) return;

    const trimmed = (editComment || "").trim();
    if (trimmed.length < 5) {
      setEditErr("Comment must be at least 5 characters.");
      return;
    }

    if (editRating < 1 || editRating > 5) {
      setEditErr("Rating must be between 1 and 5.");
      return;
    }

    const keptCount = editExistingImages.filter((img) =>
      editKeepPublicIds.includes(img.publicId || img.url)
    ).length;

    if (keptCount + editNewImages.length > MAX_IMAGES) {
      setEditErr("Maximum 3 images allowed.");
      return;
    }

    try {
      setEditLoading(true);

      const fd = new FormData();
      fd.append("rating", editRating);
      fd.append("comment", trimmed);
      fd.append("keepPublicIds", JSON.stringify(editKeepPublicIds));

      editNewImages.forEach((img) => fd.append("images", img));

      const res = await axios.put(
        `${serverUrl}/api/review/edit/${editingReview._id}`,
        fd,
        { withCredentials: true }
      );

      if (res.data.success) {
        await fetchReviews();
        closeEdit();
      } else {
        setEditErr(res.data.message || "Failed to edit review");
      }
    } catch (e) {
      setEditErr(e.response?.data?.message || "Failed to edit review");
    } finally {
      setEditLoading(false);
    }
  };

  const displayedReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-cyan-400">
            Customer Reviews
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} • Avg{" "}
            {avgRating ? avgRating.toFixed(1) : "0.0"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`text-sm ${
                star <= Math.round(avgRating || 0)
                  ? "text-yellow-400"
                  : "text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Review Form */}
      <div className="border border-gray-700 rounded-2xl p-4 bg-black/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold text-sm">Write a review</p>
          {!userData && (
            <p className="text-yellow-400 text-xs">Login required to review</p>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-400 text-sm">Rating:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                disabled={!userData}
                className="hover:scale-110 transition"
              >
                <FaStar
                  className={`text-lg ${
                    star <= rating ? "text-yellow-400" : "text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            userData ? "Share your experience..." : "Login to write review..."
          }
          disabled={!userData}
          rows={3}
          className="w-full rounded-xl bg-gray-800/50 border border-gray-700 p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <label
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border cursor-pointer transition ${
              !userData
                ? "border-gray-700 text-gray-500 cursor-not-allowed"
                : "border-gray-600 text-gray-300 hover:border-cyan-400"
            }`}
          >
            <FaImages />
            <span>
              {images.length > 0
                ? `${images.length} image(s) selected`
                : "Add images (max 3)"}
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              disabled={!userData}
              className="hidden"
              onChange={handleImagesChange}
            />
          </label>

          <button
            type="button"
            onClick={submitReview}
            disabled={!userData || submitLoading}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              !userData || submitLoading
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            }`}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </button>
        </div>

        {imagePreviews.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {imagePreviews.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="preview"
                className="w-20 h-20 object-cover rounded-xl border border-gray-700"
              />
            ))}
          </div>
        )}

        {err && <p className="text-red-400 text-xs mt-2">{err}</p>}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No reviews yet.</p>
          <p className="text-gray-500 text-sm mt-1">
            Be the first to review this product.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayedReviews.map((review) => {
              const normalized = normalizeReviewImages(review.images);

              return (
                <div
                  key={review._id}
                  className="border-b border-gray-700 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-white">
                        {review.userName}
                      </span>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-sm ${
                              i < (review.rating || 0)
                                ? "text-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>

                      {canManage(review) && (
                        <>
                          <button
                            onClick={() => openEdit(review)}
                            className="text-xs px-2 py-1 rounded-lg border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition flex items-center gap-1"
                          >
                            <FaEdit />
                            Edit
                          </button>

                          <button
                            onClick={() => deleteReview(review._id)}
                            className="text-xs px-2 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition flex items-center gap-1"
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>

                  {normalized.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {normalized.slice(0, MAX_IMAGES).map((img, i) => (
                        <img
                          key={i}
                          src={img.url}
                          alt="review"
                          className="w-24 h-24 object-cover rounded-xl border border-gray-700"
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* See more */}
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() =>
                  setVisibleCount((prev) => prev + LOAD_MORE_STEP)
                }
                className="text-sm px-4 py-2 rounded-xl border border-gray-600 text-gray-200 hover:border-cyan-400 hover:text-cyan-300 transition flex items-center gap-2"
              >
                See more reviews <FaChevronDown />
              </button>
            </div>
          )}
        </>
      )}

      {/* ✅ EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Edit Review</h3>
              <button
                onClick={closeEdit}
                className="text-gray-400 hover:text-white transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-400 text-sm">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="hover:scale-110 transition"
                  >
                    <FaStar
                      className={`text-lg ${
                        star <= editRating ? "text-yellow-400" : "text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-gray-800/50 border border-gray-700 p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            {editExistingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-300 text-sm font-semibold mb-2">
                  Existing images
                </p>

                <div className="flex gap-2 flex-wrap">
                  {editExistingImages.map((img, idx) => {
                    const keep = editKeepPublicIds.includes(
                      img.publicId || img.url
                    );

                    return (
                      <div
                        key={idx}
                        className={`relative w-24 h-24 rounded-xl border overflow-hidden ${
                          keep ? "border-cyan-500" : "border-gray-700 opacity-40"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="existing"
                          className="w-full h-full object-cover"
                        />

                        {keep && (
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img)}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-lg hover:bg-black/80 transition"
                            title="Remove"
                          >
                            <FaTimes size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-gray-500 text-xs mt-2">
                  (Click ❌ to remove image from review)
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-gray-600 text-gray-300 hover:border-cyan-400 cursor-pointer transition">
                <FaPlus />
                <span>Add new images</span>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleEditNewImages}
                />
              </label>

              <button
                type="button"
                onClick={submitEdit}
                disabled={editLoading}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  editLoading
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                }`}
              >
                {editLoading ? "Updating..." : "Update"}
              </button>
            </div>

            {editNewPreviews.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {editNewPreviews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="new"
                    className="w-20 h-20 object-cover rounded-xl border border-gray-700"
                  />
                ))}
              </div>
            )}

            {editErr && <p className="text-red-400 text-xs mt-3">{editErr}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
