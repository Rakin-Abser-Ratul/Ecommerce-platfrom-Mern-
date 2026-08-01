import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import './Register.css'

const Register = () => {
  const navigate = useNavigate() 
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
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

    if (formData.password.length < 4) {
      setErrors({ password: ['Password must be at least 4 characters long.'] })
      return
    }

    setLoading(true)

    try {
      await API.post('api/auth/register', formData)
      
      setMessage('Registration successful! Redirecting to login page...')
      setFormData({ username: '', email: '', password: '' })

      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      if (err.response && err.response.data) {
        const detail = err.response.data.detail
        
        if (typeof detail === 'string') {
          setErrors({ general: detail })
        } else if (Array.isArray(detail)) {
          const parsedErrors = {}
          detail.forEach((error) => {
            const field = error.loc[error.loc.length - 1]
            parsedErrors[field] = error.msg
          })
          setErrors(parsedErrors)
        } else {
          setErrors(err.response.data)
        }
      } else {
        setErrors({ general: err.message || "Could not connect to the server." })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page-container">
      <div className="register-card">
        <h2 className="register-title">Create an Account</h2>
        <div className="register-title-underline"></div>
        <p className="register-subtitle">Join us to explore or post available products</p>
        
        {message && <div className="register-alert register-alert-success">{message}</div>}
        {errors.general && <div className="register-alert register-alert-danger">{errors.general}</div>}

        <form onSubmit={handleSubmit} noValidate>
          
          {/* Username Field */}
          <div className="register-form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="e.g. john_doe"
              className={`register-control ${errors.username ? 'is-invalid' : ''}`} 
              value={formData.username} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
            {errors.username && (
              <span className="register-field-error">
                {Array.isArray(errors.username) ? errors.username.join(', ') : errors.username}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="register-form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="name@example.com"
              className={`register-control ${errors.email ? 'is-invalid' : ''}`} 
              value={formData.email} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
            {errors.email && (
              <span className="register-field-error">
                {Array.isArray(errors.email) ? errors.email.join(', ') : errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="register-form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••"
              minLength={4} 
              className={`register-control ${errors.password ? 'is-invalid' : ''}`} 
              value={formData.password} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
            {errors.password && (
              <span className="register-field-error">
                {Array.isArray(errors.password) ? errors.password.join(', ') : errors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="register-btn-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="register-spinner-container">
                <span className="register-spinner"></span>
                Creating Account...
              </span>
            ) : (
              'Register'
            )}
          </button>

          {/* Redirect Link */}
          <p className="register-auth-redirect">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register