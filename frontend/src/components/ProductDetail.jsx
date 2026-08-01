import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction State
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartMsg, setCartMsg] = useState("");

  // Auth Prompt Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalAction, setAuthModalAction] = useState("");

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Map to store fetched usernames: { [userId]: username }
  const [usersMap, setUsersMap] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://ecommerce-platfrom-mern-git-main-rakin-abser-ratul1.vercel.app/api/products/${productId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Product not found");
        throw new Error("Failed to load product details");
      }
      const data = await res.json();
      setProduct(data);
      if (data.image_url) setSelectedImage(data.image_url);

      if (data.reviews && data.reviews.length > 0) {
        fetchReviewers(data.reviews);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewers = async (reviews) => {
    const missingUserIds = [
      ...new Set(
        reviews
          .filter((rev) => !rev.user?.username && rev.user_id)
          .map((rev) => rev.user_id)
      ),
    ];

    if (missingUserIds.length === 0) return;

    const fetchedNames = {};
    await Promise.all(
      missingUserIds.map(async (userId) => {
        try {
          const res = await fetch(`https://ecommerce-platfrom-mern-git-main-rakin-abser-ratul1.vercel.app/api/users/${userId}`);
          if (res.ok) {
            const userData = await res.json();
            fetchedNames[userId] = userData.username || userData.name;
          }
        } catch {
          // Fall back gracefully
        }
      })
    );

    setUsersMap((prev) => ({ ...prev, ...fetchedNames }));
  };

  const handleAddToCart = async () => {
  if (!token) {
    setAuthModalAction("add items to your cart");
    setShowAuthModal(true);
    return;
  }

  setCartMsg("");
  
  // Pass productId directly as a String (MongoDB ObjectId)
  const res = await addToCart(String(productId), quantity); 
  
  if (res?.success) {
    setCartMsg("Added to cart!");
  } else {
    setCartMsg(res?.error || "Failed to add to cart");
  }

  // Automatically hide notification after 3 seconds
  setTimeout(() => setCartMsg(""), 3000);
};
  const handleBuyNow = () => {
    if (!token) {
      setAuthModalAction("proceed with purchase");
      setShowAuthModal(true);
      return;
    }

    navigate("/buy-now-unavailable", { state: { product, quantity } });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewError("Please log in to leave a review.");
      setShowAuthModal(true);
      setAuthModalAction("leave a review");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch(
        `https://ecommerce-platfrom-mern-git-main-rakin-abser-ratul1.vercel.app/api/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: Number(rating), comment }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to submit review");
      }

      setComment("");
      setRating(5);
      await fetchProduct();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-center-box">
        <div className="pd-spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-error-card">
        <h2>Product Not Found</h2>
        <p>{error || "The requested item is unavailable."}</p>
        <button onClick={() => navigate(-1)} className="pd-btn pd-btn-cart">
          Go Back
        </button>
      </div>
    );
  }

  const imagesList = product.image_url ? [product.image_url] : [];

  return (
    <div className="pd-container">
      <div className="pd-wrapper">
        
        {/* BACK BUTTON */}
        <div className="pd-nav-bar">
          <button onClick={() => navigate(-1)} className="pd-back-btn">
            <span className="pd-back-arrow">←</span> Back
          </button>
        </div>

        {/* TOP SECTION: MAIN CARD */}
        <div className="pd-main-card">
          
          {/* COLUMN 1: GALLERY */}
          <div className="pd-gallery">
            <div className="pd-main-image-box">
              {selectedImage ? (
                <img src={selectedImage} alt={product.title} className="pd-main-image" />
              ) : (
                <div className="pd-no-image">No Image Available</div>
              )}
            </div>

            {imagesList.length > 0 && (
              <div className="pd-thumbnails">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`pd-thumb-btn ${selectedImage === img ? "active" : ""}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 2: SPECS & BUYING */}
          <div className="pd-details">
            <div>
              <h1 className="pd-title">{product.title}</h1>

              <div className="pd-rating-bar">
                <div>
                  <span className="pd-stars">
                    {"★".repeat(Math.round(product.average_rating || 0))}
                    {"☆".repeat(5 - Math.round(product.average_rating || 0))}
                  </span>
                  <span className="pd-link" style={{ marginLeft: "8px" }}>
                    {product.reviews ? product.reviews.length : 0} Ratings
                  </span>
                </div>
              </div>

              <div className="pd-price-box">
                <div className="pd-price-main">
                  ৳ {Number(product.price || 0).toFixed(0)}
                </div>
                <div className="pd-price-old">
                  ৳ {((product.price || 0) * 1.3).toFixed(0)}
                  <span className="pd-discount">-30%</span>
                </div>
              </div>

              {product.custom_fields && product.custom_fields.length > 0 && (
                <div className="pd-specs-list">
                  {product.custom_fields.map((field, idx) => (
                    <div key={idx} className="pd-spec-item">
                      <span className="pd-spec-key">{field.name}:</span>
                      <button className="pd-spec-badge">{field.value}</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pd-quantity-row">
                <span className="pd-spec-key">Quantity</span>
                <div className="pd-qty-picker">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="pd-qty-btn"
                  >
                    -
                  </button>
                  <span className="pd-qty-val">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="pd-qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* CART NOTIFICATION TEXT */}
              {cartMsg && (
                <p
                  style={{
                    color: cartMsg.includes("Added") ? "#16a34a" : "#dc2626",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {cartMsg.includes("Added") ? "✓" : "✕"} {cartMsg}
                </p>
              )}
            </div>

            <div className="pd-actions">
              <button onClick={handleBuyNow} className="pd-btn pd-btn-buy">
                Buy Now
              </button>
              <button onClick={handleAddToCart} className="pd-btn pd-btn-cart">
                Add to Cart
              </button>
            </div>
          </div>

          {/* COLUMN 3: SIDEBAR */}
          <div className="pd-sidebar">
            <div>
              <div className="pd-section-label">Delivery Options</div>
              <div className="pd-delivery-flex">
                <div>
                  <strong>Dhaka, Banani Road</strong>
                  <div style={{ color: "#757575" }}>Standard Delivery</div>
                </div>
                <span className="pd-link" style={{ fontWeight: "bold" }}>CHANGE</span>
              </div>
              <div style={{ marginTop: "8px", fontWeight: "bold" }}>৳ 110</div>
              <div style={{ color: "#757575", marginTop: "4px" }}>Cash on Delivery Available</div>
            </div>

            <hr className="pd-sidebar-hr" />

            <div>
              <div className="pd-section-label">Return & Warranty</div>
              <div>✓ 14 days easy return</div>
              <div style={{ marginTop: "4px" }}>✓ Warranty not available</div>
            </div>

            <hr className="pd-sidebar-hr" />

            <div>
              <div className="pd-section-label">Sold By</div>
              <strong style={{ fontSize: "14px" }}>Official Store</strong>
              <div className="pd-seller-grid">
                <div>
                  <div style={{ color: "#9e9e9e", fontSize: "10px" }}>Ratings</div>
                  <div className="pd-metric-val">92%</div>
                </div>
                <div>
                  <div style={{ color: "#9e9e9e", fontSize: "10px" }}>Ship Time</div>
                  <div className="pd-metric-val">100%</div>
                </div>
                <div>
                  <div style={{ color: "#9e9e9e", fontSize: "10px" }}>Response</div>
                  <div className="pd-metric-val">98%</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: DESCRIPTION & REVIEWS */}
        <div className="pd-bottom-card">
          <div>
            <h3 className="pd-section-title">Product Details</h3>
            <p style={{ lineHeight: "1.6", color: "#606060" }}>
              {product.description || "No description provided."}
            </p>
          </div>

          <div>
            <h3 className="pd-section-title">
              Ratings & Reviews ({product.reviews ? product.reviews.length : 0})
            </h3>

            <form onSubmit={handleReviewSubmit} className="pd-review-form">
              <strong>Write a Review</strong>
              {reviewError && <p style={{ color: "#dc2626", fontSize: "13px" }}>{reviewError}</p>}
              <div>
                <label style={{ marginRight: "8px" }}>Rating:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value={5}>5 ★ - Excellent</option>
                  <option value={4}>4 ★ - Very Good</option>
                  <option value={3}>3 ★ - Average</option>
                  <option value={2}>2 ★ - Poor</option>
                  <option value={1}>1 ★ - Terrible</option>
                </select>
              </div>
              <textarea
                required
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                className="pd-textarea"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="pd-btn pd-btn-cart"
                style={{ width: "fit-content", padding: "8px 20px" }}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>

            <div>
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => {
                  const reviewerName =
                    rev.user?.username ||
                    usersMap[rev.user_id] ||
                    (rev.user_id ? `Verified Buyer #${rev.user_id}` : "Anonymous");

                  return (
                    <div key={rev.id || rev.created_at} className="pd-review-item">
                      <div className="pd-review-header">
                        <strong>{reviewerName}</strong>
                        <span className="pd-stars">
                          {"★".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <p style={{ marginTop: "4px", color: "#606060" }}>{rev.comment}</p>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "#9e9e9e" }}>No reviews available for this product yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* AUTHENTICATION REQUIRED MODAL */}
      {showAuthModal && (
        <div className="pd-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-icon">🔐</div>
            <h3 className="pd-modal-title">Authentication Required</h3>
            <p className="pd-modal-body">
              Please log in to {authModalAction || "continue"}.
            </p>
            <div className="pd-modal-actions">
              <button 
                className="pd-modal-btn pd-modal-btn-login"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
              <button 
                className="pd-modal-btn pd-modal-btn-register"
                onClick={() => navigate("/register")}
              >
                Create Account
              </button>
            </div>
            <button 
              className="pd-modal-close-btn"
              onClick={() => setShowAuthModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;