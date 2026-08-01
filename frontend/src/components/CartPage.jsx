import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CartPage.css";

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="cart-center">
        <div className="cart-spinner"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty-page">
        <div className="cart-empty-card">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="cart-btn cart-btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleBuyNowSingle = (product, quantity) => {
    navigate("/buy-now-unavailable", { state: { product, quantity } });
  };

  const handleCheckout = () => {
    navigate("/buy-now-unavailable", { state: { cart } });
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2 className="cart-heading">Shopping Cart ({cart.items.length})</h2>

        <div className="cart-grid">
          {/* Left Column: Item List */}
          <div className="cart-items-list">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item-card">
                
                {/* Product Thumbnail & Details */}
                <div className="cart-item-main">
                  <div className="cart-item-img-box">
                    <img
                      src={
                        item.product.image_url ||
                        "https://via.placeholder.com/100"
                      }
                      alt={item.product.title}
                      className="cart-item-img"
                    />
                  </div>

                  <div className="cart-item-details">
                    <Link
                      to={`/products/${item.product.id}`}
                      className="cart-item-title"
                    >
                      {item.product.title}
                    </Link>
                    <div className="cart-item-price">
                      ৳ {Number(item.product.price || 0).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Controls & Individual Action Buttons */}
                <div className="cart-item-controls">
                  {/* Quantity Selector */}
                  <div className="cart-qty-picker">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="cart-qty-btn"
                    >
                      -
                    </button>
                    <span className="cart-qty-val">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="cart-qty-btn"
                    >
                      +
                    </button>
                  </div>

                  {/* Buy Now & Delete Buttons */}
                  <div className="cart-card-actions">
                    <button
                      onClick={() =>
                        handleBuyNowSingle(item.product, item.quantity)
                      }
                      className="cart-card-btn cart-btn-buy-now"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="cart-card-btn cart-btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Right Column: Summary Card */}
          <div className="cart-summary-wrapper">
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">Order Summary</h3>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>৳ {Number(cart.total_price || 0).toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping Fee</span>
                <span>৳ 110.00</span>
              </div>

              <hr className="cart-divider" />

              <div className="cart-summary-row total">
                <strong>Total</strong>
                <strong className="cart-total-price">
                  ৳ {(Number(cart.total_price || 0) + 110).toFixed(2)}
                </strong>
              </div>

              <button
                onClick={handleCheckout}
                className="cart-btn cart-btn-checkout"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;