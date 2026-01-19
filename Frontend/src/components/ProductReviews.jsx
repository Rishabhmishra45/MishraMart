import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaTrash, FaImages } from "react-icons/fa";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/UserContext";

const ProductReviews = ({ productId }) => {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  // form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]); // ✅ multiple images
  const [imagePreviews, setImagePreviews] = useState([]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/review/${productId}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
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
  }, [productId]);

  // ✅ handle image select (max 3)
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    // allow max 3
    const limited = files.slice(0, 3);
    setImages(limited);

    // previews
    const previewUrls = limited.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
  };

  // cleanup preview URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

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

    if (images.length > 3) {
      setErr("You can upload maximum 3 images.");
      return;
    }

    try {
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", trimmed);

      // ✅ IMPORTANT: backend expects field name "images"
      images.forEach((img) => formData.append("images", img));

      const res = await axios.post(
        `${serverUrl}/api/review/${productId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
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

  const deleteReview = async (reviewId) => {
    if (!userData) return;

    try {
      const res = await axios.delete(
        `${serverUrl}/api/review/delete/${reviewId}`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        await fetchReviews();
      }
    } catch (e) {
      console.log("deleteReview error:", e.message);
    }
  };

  const canDelete = (review) => {
    const uid = userData?._id || userData?.id || userData?.uid;
    return uid && review.userId && String(uid) === String(review.userId);
  };

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

        {/* ✅ Multi Image Upload (max 3) */}
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

        {/* ✅ selected images preview */}
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

      {/* Review List */}
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
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
          {reviews.map((review) => {
            const imgs = Array.isArray(review.images) ? review.images : [];
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

                  <div className="flex items-center gap-2">
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

                    {canDelete(review) && (
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="text-xs px-2 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition flex items-center gap-1"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>

                {/* ✅ show up to 3 images */}
                {imgs.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {imgs.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
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
      )}
    </div>
  );
};

export default ProductReviews;
