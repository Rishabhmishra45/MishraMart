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
  FaShoppingBag,
  FaCheckCircle,
  FaPen,
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

  // New state for purchase verification
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [userAlreadyReviewed, setUserAlreadyReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // show limited reviews
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_REVIEWS);

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

  // Function to check if user has purchased this product
  const checkUserPurchase = async () => {
    if (!userData || !productId) {
      setHasPurchased(false);
      setIsDelivered(false);
      return;
    }

    try {
      setCheckingPurchase(true);
      const res = await axios.get(`${serverUrl}/api/orders/my-orders`, {
        withCredentials: true,
      });

      if (res.data.success && res.data.orders) {
        let purchased = false;
        let delivered = false;

        // Check all orders for this product
        res.data.orders.forEach((order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              // Check if productId matches
              if (
                item.productId?._id === productId ||
                item.productId === productId
              ) {
                purchased = true;

                // Check if order is delivered
                if (order.status === "delivered") {
                  delivered = true;
                }
              }
            });
          }
        });

        setHasPurchased(purchased);
        setIsDelivered(delivered);
      }
    } catch (error) {
      console.log("Error checking purchase:", error.message);
      setHasPurchased(false);
      setIsDelivered(false);
    } finally {
      setCheckingPurchase(false);
    }
  };

  // Check if user already reviewed this product
  const checkUserReview = () => {
    if (!uid) {
      setUserAlreadyReviewed(false);
      setUserReview(null);
      return;
    }

    const foundReview = reviews.find(review =>
      review.userId && String(review.userId) === String(uid)
    );

    setUserAlreadyReviewed(!!foundReview);
    setUserReview(foundReview || null);
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

  useEffect(() => {
    if (productId && userData) {
      checkUserPurchase();
    } else {
      setHasPurchased(false);
      setIsDelivered(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, userData]);

  useEffect(() => {
    checkUserReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews, uid]);

  // Cleanup image previews
  useEffect(() => {
    return () => editNewPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [editNewPreviews]);

  const canManage = (review) => {
    return uid && review?.userId && String(uid) === String(review.userId);
  };

  const deleteReview = async (reviewId) => {
    if (!userData) return;

    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await axios.delete(
        `${serverUrl}/api/review/delete/${reviewId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        await fetchReviews();
      }
    } catch (e) {
      console.log("deleteReview error:", e.message);
      alert("Failed to delete review. Please try again.");
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
    <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-cyan-500">
            Customer Reviews
          </h3>
          <p className="text-[color:var(--muted)] text-xs sm:text-sm mt-1">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} • Avg{" "}
            {avgRating ? avgRating.toFixed(1) : "0.0"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`text-xs sm:text-sm ${star <= Math.round(avgRating || 0)
                ? "text-yellow-400"
                : "text-gray-500"
                }`}
            />
          ))}
        </div>
      </div>

      {/* User's Review Status */}
      {userData && checkingPurchase ? (
        <div className="flex items-center justify-center py-3 mb-4">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-xs text-[color:var(--muted)]">Checking your purchase...</span>
        </div>
      ) : userData && userAlreadyReviewed ? (
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-cyan-500" />
              <div>
                <p className="font-semibold text-sm text-cyan-500">You've reviewed this product</p>
                <p className="text-xs text-[color:var(--muted)] mt-0.5">
                  You can edit or delete your review below
                </p>
              </div>
            </div>
            {userReview && (
              <button
                onClick={() => openEdit(userReview)}
                className="px-3 py-1.5 text-xs rounded-lg border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition flex items-center gap-1"
              >
                <FaEdit className="text-xs" />
                Edit Review
              </button>
            )}
          </div>
        </div>
      ) : userData && hasPurchased && isDelivered ? (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaShoppingBag className="text-yellow-500" />
              <div>
                <p className="font-semibold text-sm text-yellow-500">You can review this product</p>
                <p className="text-xs text-[color:var(--muted)] mt-0.5">
                  Go to your Orders page to submit a review
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = "/orders"}
              className="px-3 py-1.5 text-xs rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition flex items-center gap-1"
            >
              <FaPen className="text-xs" />
              Review in Orders
            </button>
          </div>
        </div>
      ) : userData && hasPurchased && !isDelivered ? (
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <FaShoppingBag className="text-blue-500" />
            <div>
              <p className="font-semibold text-sm text-blue-500">Order not yet delivered</p>
              <p className="text-xs text-[color:var(--muted)] mt-0.5">
                You can review this product once your order is delivered
              </p>
            </div>
          </div>
        </div>
      ) : userData && !hasPurchased ? (
        <div className="bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-500/30 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <FaShoppingBag className="text-[color:var(--muted)]" />
            <div>
              <p className="font-semibold text-sm text-[color:var(--muted)]">Purchase to review</p>
              <p className="text-xs text-[color:var(--muted)] mt-0.5">
                Buy this product to share your experience
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reviews List */}
      {loading ? (
        <p className="text-[color:var(--muted)] text-sm">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-[color:var(--muted)]">No reviews yet.</p>
          <p className="text-[color:var(--muted)] text-xs sm:text-sm mt-1">
            Be the first to review this product.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {displayedReviews.map((review) => {
              const normalized = normalizeReviewImages(review.images);
              const isUserReview = canManage(review);

              return (
                <div
                  key={review._id}
                  className="border-b border-[color:var(--border)] pb-3 sm:pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-base">
                          {review.userName}
                        </span>
                        {isUserReview && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="text-[color:var(--muted)] text-xs mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-xs sm:text-sm ${i < (review.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-500"
                              }`}
                          />
                        ))}
                      </div>

                      {isUserReview && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(review)}
                            className="text-xs px-2 py-1 rounded-lg border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 transition flex items-center gap-1"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>

                          <button
                            onClick={() => deleteReview(review._id)}
                            className="text-xs px-2 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition flex items-center gap-1"
                          >
                            <FaTrash className="text-xs" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[color:var(--text)] text-sm leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>

                  {normalized.length > 0 && (
                    <div className="mt-2 sm:mt-3 flex gap-2 flex-wrap">
                      {normalized.slice(0, MAX_IMAGES).map((img, i) => (
                        <img
                          key={i}
                          src={img.url}
                          alt="review"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl border border-[color:var(--border)]"
                          onClick={() => window.open(img.url, '_blank')}
                          style={{ cursor: 'pointer' }}
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
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-[color:var(--border)] text-[color:var(--text)] hover:border-cyan-500 hover:text-cyan-500 transition flex items-center gap-1 sm:gap-2"
              >
                See more reviews <FaChevronDown className="text-xs" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ✅ EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-base sm:text-lg">Edit Your Review</h3>
              <button
                onClick={closeEdit}
                className="text-[color:var(--muted)] hover:text-[color:var(--text)] transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[color:var(--muted)] text-xs sm:text-sm">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="hover:scale-110 transition"
                  >
                    <FaStar
                      className={`text-base sm:text-lg ${star <= editRating ? "text-yellow-400" : "text-gray-500"
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Share your updated experience with this product..."
              rows={4}
              className="w-full rounded-lg sm:rounded-xl bg-transparent border border-[color:var(--border)] p-3 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
            />

            {editExistingImages.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <p className="text-[color:var(--text)] text-xs sm:text-sm font-semibold mb-2">
                  Your existing images
                </p>

                <div className="flex gap-2 flex-wrap">
                  {editExistingImages.map((img, idx) => {
                    const keep = editKeepPublicIds.includes(
                      img.publicId || img.url
                    );

                    return (
                      <div
                        key={idx}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all ${keep ? "border-cyan-500" : "border-gray-400 opacity-40"
                          }`}
                      >
                        <img
                          src={img.url}
                          alt="existing"
                          className="w-full h-full object-cover"
                        />

                        {keep ? (
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img)}
                            className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-black/90 transition"
                            title="Remove this image"
                          >
                            <FaTimes size={10} />
                          </button>
                        ) : (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Removed</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-[color:var(--muted)] text-xs mt-2">
                  Click ❌ to remove images from your review
                </p>
              </div>
            )}

            <div className="mt-3 sm:mt-4">
              <label className="items-center gap-2 text-xs px-3 py-2 rounded-lg sm:rounded-xl border border-[color:var(--border)] text-[color:var(--muted)] hover:border-cyan-500 hover:text-cyan-500 cursor-pointer transition inline-block">
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

              <p className="text-[color:var(--muted)] text-xs mt-1">
                You can add up to {MAX_IMAGES - editExistingImages.filter(img =>
                  editKeepPublicIds.includes(img.publicId || img.url)
                ).length} new images
              </p>
            </div>

            {editNewPreviews.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {editNewPreviews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="new"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl border-2 border-green-500"
                  />
                ))}
              </div>
            )}

            {editErr && <p className="text-red-500 text-xs mt-3">{editErr}</p>}

            <div className="mt-4 pt-4 border-t border-[color:var(--border)] flex justify-end gap-2">
              <button
                onClick={closeEdit}
                className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold border border-[color:var(--border)] text-[color:var(--muted)] hover:border-red-500 hover:text-red-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={editLoading}
                className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-white disabled:opacity-50"
              >
                {editLoading ? "Updating..." : "Update Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;