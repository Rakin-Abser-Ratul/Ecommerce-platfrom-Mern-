import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./UnavailablePurchase.css";

const UnavailablePurchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const handleAddToCart = () => {
    // Add logic here to push product to your global cart state/API
    if (product) {
      console.log("Added to cart:", product);
    }
    navigate("/cart");
  };

  return (
    <div className="up-page">
      <div className="up-card">
        {/* Warning Badge Icon */}
        <div className="up-icon-wrapper">
          <svg className="up-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        </div>

        <h1 className="up-title">Direct Purchase Unavailable</h1>
        
        <p className="up-description">
          The <strong>Buy Now</strong> option is currently not available for this item. 
          Please add the product to your cart to proceed with your order.
        </p>

        {/* Product Preview Box if passed in route state */}
        {product && (
          <div className="up-product-summary">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.title}
                className="up-product-img"
              />
            )}
            <div className="up-product-info">
              <span className="up-product-name">{product.title}</span>
              <span className="up-product-price">
                ৳{Number(product.price || 0).toFixed(0)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="up-actions">
          <button onClick={handleAddToCart} className="up-btn-primary">
            <svg className="up-cart-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
              />
            </svg>
            Add Product to Cart Instead
          </button>

          <Link to="/products" className="up-btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnavailablePurchase;