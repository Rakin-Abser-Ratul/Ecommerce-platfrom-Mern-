import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import CartPage from "./CartPage";
import "./DashBoard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Data States
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (activeTab === "products") {
      fetchMyProducts();
    }
  }, [activeTab]);

  const fetchMyProducts = async () => {
    try {
      setLoadingData(true);
      const res = await API.get("/products/me");
      setProducts(res.data || []);
    } catch (err) {
      try {
        const res = await API.get("/products/");
        const allProducts = res.data?.items || res.data || [];
        const userProducts = allProducts.filter(
          (p) => p.owner_id === user?.id || p.user_id === user?.id
        );
        setProducts(userProducts);
      } catch (fallbackErr) {
        console.error("Failed to fetch products", fallbackErr);
      }
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-container">
        
        {/* TOP BAR / BACK BUTTON */}
        <div className="dash-header-bar">
          <button 
            className="dash-back-btn" 
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        <div className="dash-layout">
          {/* SIDEBAR NAVIGATION */}
          <aside className="dash-sidebar">
            <div className="dash-user-card">
              <div className="dash-avatar">
                {(user?.username || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="dash-user-info">
                <span className="dash-greeting">Hello,</span>
                <strong className="dash-username">{user?.username || "Valued User"}</strong>
              </div>
            </div>

            <nav className="dash-nav">
              <button
                className={`dash-nav-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                👤 My Profile
              </button>
              <button
                className={`dash-nav-btn ${activeTab === "cart" ? "active" : ""}`}
                onClick={() => setActiveTab("cart")}
              >
                🛒 My Cart
              </button>
              <button
                className={`dash-nav-btn ${activeTab === "products" ? "active" : ""}`}
                onClick={() => setActiveTab("products")}
              >
                🏷️ My Products
              </button>
              <button
                className={`dash-nav-btn ${activeTab === "address" ? "active" : ""}`}
                onClick={() => setActiveTab("address")}
              >
                🏠 Address Book
              </button>
            </nav>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="dash-content">
            
            {/* TAB 1: MY PROFILE */}
            {activeTab === "profile" && (
              <div className="dash-section">
                <h2 className="dash-title">My Profile</h2>
                <div className="dash-card">
                  <div className="dash-profile-grid">
                    <div className="dash-field">
                      <label>Full Name / Username</label>
                      <div className="dash-field-value">{user?.username || "N/A"}</div>
                    </div>
                    <div className="dash-field">
                      <label>Email Address</label>
                      <div className="dash-field-value">{user?.email || "N/A"}</div>
                    </div>
                    <div className="dash-field">
                      <label>Account Role</label>
                      <div className="dash-field-value">{user?.role || "Seller / Customer"}</div>
                    </div>
                    <div className="dash-field">
                      <label>Member Since</label>
                      <div className="dash-field-value">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Recent"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MY CART */}
            {activeTab === "cart" && (
              <div className="dash-section dash-cart-wrapper">
                <CartPage />
              </div>
            )}

            {/* TAB 3: MY PRODUCTS */}
            {activeTab === "products" && (
              <div className="dash-section">
                <div className="dash-section-header">
                  <h2 className="dash-title">My Products</h2>
                  <Link to="/products/new" className="dash-btn-add">
                    + Add New Product
                  </Link>
                </div>

                {loadingData ? (
                  <div className="dash-center-spinner">
                    <div className="dash-spinner"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="dash-empty-state">
                    <p>You haven't listed any products for sale yet.</p>
                  </div>
                ) : (
                  <div className="dash-products-grid">
                    {products.map((prod) => (
                      <div key={prod.id} className="dash-prod-card">
                        <div className="dash-prod-img-box">
                          <img
                            src={prod.image_url || "https://via.placeholder.com/150"}
                            alt={prod.title}
                            className="dash-prod-img"
                          />
                        </div>
                        <div className="dash-prod-details">
                          <Link to={`/products/${prod.id}`} className="dash-prod-title">
                            {prod.title}
                          </Link>
                          <div className="dash-prod-price">
                            ৳ {Number(prod.price || 0).toFixed(0)}
                          </div>
                          <div className="dash-prod-actions">
                            <Link to={`/products/edit/${prod.id}`} className="dash-prod-btn edit">
                              Edit
                            </Link>
                            <Link to={`/products/${prod.id}`} className="dash-prod-btn view">
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ADDRESS BOOK */}
            {activeTab === "address" && (
              <div className="dash-section">
                <h2 className="dash-title">Address Book</h2>
                <div className="dash-card">
                  <div className="dash-address-box">
                    <div className="dash-address-header">
                      <strong>Default Delivery Address</strong>
                      <span className="dash-badge">DEFAULT</span>
                    </div>
                    <div className="dash-address-body">
                      <p className="dash-add-name">{user?.username || "Customer Name"}</p>
                      <p>Dhaka, Banani Road, House #12, Block C</p>
                      <p>Phone: +880 1700-000000</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;