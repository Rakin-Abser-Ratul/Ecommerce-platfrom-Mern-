import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import './CreatePost.css'

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  })

  // State for dynamic custom fields: [{"name": "RAM", "value": "16GB"}]
  const [customFields, setCustomFields] = useState([])

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch initial product details on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingData(true)
        const res = await API.get(`api/products/${id}`)
        const prod = res.data

        setFormData({
          title: prod.title || '',
          description: prod.description || '',
          price: prod.price !== undefined ? String(prod.price) : '',
        })

        // Handle specifications mapping (array of {name, value} or object key-values)
        if (Array.isArray(prod.custom_fields)) {
          setCustomFields(prod.custom_fields)
        } else if (prod.specifications && typeof prod.specifications === 'object') {
          const formattedSpecs = Object.entries(prod.specifications).map(
            ([name, value]) => ({ name, value })
          )
          setCustomFields(formattedSpecs)
        }

        // Set existing image URL preview if available
        if (prod.image) {
          setImagePreview(prod.image)
        } else if (prod.image_url) {
          setImagePreview(prod.image_url)
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setErrors({ general: 'Failed to load product details. It may have been removed.' })
      } finally {
        setLoadingData(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  // Handle standard input updates
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // --- Dynamic Custom Fields Handlers ---
  const handleAddCustomField = () => {
    setCustomFields((prev) => [...prev, { name: '', value: '' }])
  }

  const handleCustomFieldChange = (index, keyOrValue, val) => {
    const updated = [...customFields]
    updated[index][keyOrValue] = val
    setCustomFields(updated)
  }

  const handleRemoveCustomField = (index) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index))
  }
  // --------------------------------------

  // Handle image upload selection & local preview
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'File size must be under 5MB.' }))
        return
      }

      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setErrors((prev) => ({ ...prev, image: '' }))
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    if (!formData.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Title is required.' }))
      return
    }

    if (!formData.price) {
      setErrors((prev) => ({ ...prev, price: 'Price is required.' }))
      return
    }

    setLoading(true)

    try {
      // Clean empty custom field rows before payload construction
      const filteredCustomFields = customFields.filter(
        (field) => field.name.trim() !== '' && field.value.trim() !== ''
      )

      const postPayload = new FormData()
      postPayload.append('title', formData.title.trim())
      postPayload.append('description', formData.description.trim())
      postPayload.append('price', parseFloat(formData.price))

      // Serialize custom_fields list to JSON string for multipart payload
      postPayload.append('custom_fields', JSON.stringify(filteredCustomFields))

      // Append new file if selected
      if (imageFile) {
        postPayload.append('image', imageFile)
      }

      await API.put(`api/products/${id}/`, postPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccessMessage('Product updated successfully! Redirecting...')

      setTimeout(() => {
        navigate('/dashboard')
      }, 1200)
    } catch (err) {
      if (err.response && err.response.data) {
        const detail = err.response.data.detail

        if (typeof detail === 'string') {
          setErrors({ general: detail })
        } else if (Array.isArray(detail)) {
          const parsed = {}
          detail.forEach((error) => {
            const field = error.loc[error.loc.length - 1]
            parsed[field] = error.msg
          })
          setErrors(parsed)
        } else {
          setErrors({ general: 'Failed to update product. Please try again.' })
        }
      } else {
        setErrors({ general: err.message || 'Could not connect to the server.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="create-post-page">
        <div className="create-post-container">
          <div className="dash-header-bar">
            <button
              type="button"
              className="dash-back-btn"
              onClick={() => navigate(-1)}
            >
              ← Back to Dashboard
            </button>
          </div>
          <div className="create-post-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <span className="dash-spinner-sm" style={{ width: '28px', height: '28px' }}></span>
            <p style={{ marginTop: '12px', color: '#666' }}>Loading product details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        
        {/* Top Action Bar */}
        <div className="dash-header-bar">
          <button 
            type="button" 
            className="dash-back-btn" 
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Form Main Card */}
        <div className="create-post-card">
          <div className="create-post-header">
            <h2 className="create-post-title">Edit Product</h2>
            <p className="create-post-subtitle">Update your item's details and specifications</p>
          </div>

          {successMessage && <div className="post-alert post-alert-success">{successMessage}</div>}
          {errors.general && <div className="post-alert post-alert-danger">{errors.general}</div>}

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Title & Price Grid */}
            <div className="post-form-row">
              {/* Title Input */}
              <div className="post-form-group">
                <label htmlFor="title">Product Title <span className="req-star">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="e.g. Gaming Laptop or Wireless Mouse"
                  className={`post-control ${errors.title ? 'is-invalid' : ''}`}
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.title && <span className="post-field-error">{errors.title}</span>}
              </div>

              {/* Price Input */}
              <div className="post-form-group">
                <label htmlFor="price">Price ($) <span className="req-star">*</span></label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`post-control ${errors.price ? 'is-invalid' : ''}`}
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {errors.price && <span className="post-field-error">{errors.price}</span>}
              </div>
            </div>

            {/* Description Input */}
            <div className="post-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Provide detailed information regarding condition, warranty, or usage..."
                className={`post-control ${errors.description ? 'is-invalid' : ''}`}
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.description && <span className="post-field-error">{errors.description}</span>}
            </div>

            {/* Dynamic Custom Specifications Section */}
            <div className="post-form-group specs-section">
              <div className="custom-fields-header">
                <label className="section-label">Custom Specifications</label>
                <button
                  type="button"
                  className="add-field-btn"
                  onClick={handleAddCustomField}
                  disabled={loading}
                >
                  + Add Specification
                </button>
              </div>

              {customFields.length > 0 && (
                <div className="custom-fields-list">
                  {customFields.map((field, index) => (
                    <div key={index} className="custom-field-row">
                      <input
                        type="text"
                        placeholder="Property (e.g., RAM)"
                        className="post-control"
                        value={field.name}
                        onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                        disabled={loading}
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g., 16GB)"
                        className="post-control"
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="remove-field-btn"
                        onClick={() => handleRemoveCustomField(index)}
                        disabled={loading}
                        title="Remove Specification"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload Area */}
            <div className="post-form-group">
              <label className="section-label">Product Image</label>
              {!imagePreview ? (
                <div className="image-upload-box">
                  <input
                    type="file"
                    id="image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="image-file-input"
                  />
                  <label htmlFor="image-input" className="image-upload-label">
                    <div className="upload-icon-circle">📷</div>
                    <span className="upload-main-text">Click to upload product image</span>
                    <small className="upload-sub-text">PNG, JPG or WEBP (Max size: 5MB)</small>
                  </label>
                </div>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Upload preview" className="image-preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    ✕ Remove Image
                  </button>
                </div>
              )}
              {errors.image && <span className="post-field-error">{errors.image}</span>}
            </div>

            {/* Submit Button */}
            <div className="post-actions">
              <button
                type="submit"
                className="post-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="dash-btn-spinner">
                    <span className="dash-spinner-sm"></span>
                    Saving Changes...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProduct