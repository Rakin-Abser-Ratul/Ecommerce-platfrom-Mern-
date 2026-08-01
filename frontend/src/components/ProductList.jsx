import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3 rows x 5 items per row on desktop = 15 items per page
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset to page 1 whenever the search term or sort order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("https://ecommerce-platfrom-mern-git-main-rakin-abser-ratul1.vercel.app/api/products/");
      if (!res.ok) {
        throw new Error("Failed to load products");
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "rating") return (b.average_rating || 0) - (a.average_rating || 0);
    return 0;
  });

  // Calculate Pagination Slices
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="pl-center-box">
        <div className="pl-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-container" style={{ marginTop: "40px" }}>
        <div className="pl-main-wrapper" style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "#d32f2f" }}>Error Loading Products</h3>
          <p>{error}</p>
          <button onClick={fetchProducts} className="pl-add-btn" style={{ cursor: "pointer", border: "none" }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-page">
      <div className="pl-container">

        {/* Top Header Section */}
        <div className="pl-header">
          <div className="pl-title-group">
            <h1 className="pl-title">Just For You</h1>
            <div className="pl-title-underline"></div>
            <p className="pl-count-text">
              {sortedProducts.length} {sortedProducts.length === 1 ? "Item Found" : "Items Found"}
            </p>
          </div>

          <div className="pl-controls-group">
            <div className="pl-search-box">
              <svg className="pl-search-icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-search-input"
              />
            </div>

            <div className="pl-sort-wrapper">
              <span className="pl-sort-label">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-sort-select"
              >
                <option value="default">Default Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <Link to="/create-post" className="pl-add-btn">
              + Add Product
            </Link>
          </div>
        </div>

        {/* Main Outer Box Container for Grid */}
        <div className="pl-main-wrapper">
          {sortedProducts.length === 0 ? (
            <div className="pl-empty-box">
              <svg className="pl-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <path d="M16 16s-1.5-2-4-2-4 2-4 2" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <h3>{searchTerm ? `No results for "${searchTerm}"` : "No products found"}</h3>
              <p>Try searching for something else or add a new item.</p>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="pl-grid">
                {currentProducts.map((product) => {
                  const avgRating = product.average_rating || 0;
                  const reviewCount = product.review_count || 0;
                  const originalPrice = (product.price || 0) * 1.35;

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="pl-card"
                    >
                      <div>
                        {/* Square Image Box */}
                        <div className="pl-image-box">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} loading="lazy" />
                          ) : (
                            <div className="pl-no-img">
                              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                              <span>No Image</span>
                            </div>
                          )}
                          <span className="pl-badge">-35%</span>
                        </div>

                        {/* Card Content */}
                        <div className="pl-card-body">
                          <h2 className="pl-card-title">{product.title}</h2>

                          <div className="pl-price-row">
                            <span className="pl-main-price">
                              ৳{Number(product.price || 0).toLocaleString()}
                            </span>
                            <span className="pl-discount-tag">
                              ৳{originalPrice.toFixed(0)}
                            </span>
                          </div>

                          <div className="pl-rating-row">
                            <span className="pl-stars">
                              {"★".repeat(Math.round(avgRating))}
                              <span className="pl-stars-empty">
                                {"★".repeat(5 - Math.round(avgRating))}
                              </span>
                            </span>
                            <span className="pl-review-count">({reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Persistent Pagination Bar */}
              <div className="pl-pagination">
                <button
                  className="pl-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  &laquo; Prev
                </button>

                <div className="pl-page-numbers">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`pl-page-num ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="pl-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next &raquo;
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductList;