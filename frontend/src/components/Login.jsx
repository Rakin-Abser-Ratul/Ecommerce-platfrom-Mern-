import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setErrors({})
    setLoading(true)

    try {
      await login(formData.email, formData.password)

      setMessage('Login successful! Redirecting...')
      setFormData({ email: '', password: '' })

      setTimeout(() => {
        navigate('/')
      }, 1000)

    } catch (err) {
      if (err.response && err.response.data) {
        const detail = err.response.data.detail

        if (typeof detail === 'string') {
          setErrors({ general: detail })
        } else if (Array.isArray(detail)) {
          setErrors({ general: 'Please check your login inputs.' })
        } else {
          setErrors({ general: 'Invalid credentials. Please try again.' })
        }
      } else {
        setErrors({ general: err.message || 'Could not connect to the server.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <div className="login-title-underline"></div>
        <p className="login-subtitle">Sign in to manage your account and explore products</p>

        {message && <div className="login-alert login-alert-success">{message}</div>}
        {errors.general && <div className="login-alert login-alert-danger">{errors.general}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Email Field */}
          <div className="login-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              className={`login-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {errors.email && (
              <span className="login-field-error">
                {Array.isArray(errors.email) ? errors.email.join(', ') : errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className={`login-control ${errors.password ? 'is-invalid' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {errors.password && (
              <span className="login-field-error">
                {Array.isArray(errors.password) ? errors.password.join(', ') : errors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-btn-submit" 
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner-container">
                <span className="login-spinner"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="login-auth-redirect">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login