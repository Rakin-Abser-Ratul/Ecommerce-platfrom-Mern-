import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext' // 1. Import CartProvider
import Header from './components/Header'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'
import CreatePost from './components/CreatePost'
import ProductDetail from './components/ProductDetail'
import ProductList from './components/ProductList'
import CartPage  from './components/CartPage'
import UnavailablePurchase from './components/UnavailablePurchase'
import Dashboard from './components/DashBoard'
import EditProduct from './components/EditProduct'


function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* 2. Wrap CartProvider around Router */}
        <Router>
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<ProductList />} />
              <Route path="/products" element={<Navigate to="/" replace />} />
              
              {/* Dynamic Product Detail Route */}
              <Route path="/products/:productId" element={<ProductDetail />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes (Requires JWT Token) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/buy-now-unavailable" element={<UnavailablePurchase />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products/edit/:id" element={<EditProduct />} />
              </Route>

              {/* Fallback Catch-All Route */}
              <Route path="*" element={<div className="container"><h2>404 - Page Not Found</h2></div>} />
            </Routes>
          </main>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App