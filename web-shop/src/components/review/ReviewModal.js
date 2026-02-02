import React, { useState } from 'react'
import axios from '../../api/axiosConfig'
import './ReviewModal.css'

const ReviewModal = ({ isOpen, onClose, order, product, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá')
      return
    }

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề đánh giá')
      return
    }

    if (!comment.trim()) {
      setError('Vui lòng viết nhận xét của bạn')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Extract productId - item can have product as ID or as populated object
      let productId = product.product || product._id

      // If product.product is an object (populated), get its _id
      if (typeof product.product === 'object' && product.product?._id) {
        productId = product.product._id
      }

      const orderId = order._id

      // Check token
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token)
      console.log('Product data:', product)
      console.log('Extracted productId:', productId)
      console.log('Submitting review:', {
        productId,
        orderId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      })

      const reviewData = {
        productId,
        orderId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      }

      // Validate productId before sending
      if (!productId) {
        setError('Không tìm thấy thông tin sản phẩm. Vui lòng thử lại.')
        setLoading(false)
        return
      }

      console.log('Making POST request to /reviews with data:', reviewData)
      const response = await axios.post('/reviews', reviewData)
      console.log('Review response:', response)

      alert('✅ Cảm ơn bạn đã đánh giá! Review của bạn đã được gửi thành công.')

      // Reset form
      setRating(5)
      setTitle('')
      setComment('')

      if (onReviewSubmitted) {
        onReviewSubmitted()
      }

      onClose()
    } catch (err) {
      console.error('Review error:', err)
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const productName = product.name || product.product?.name || 'Sản phẩm'
  const productImage = product.imageUrl || product.product?.imageUrl || product.image

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>Đánh giá sản phẩm</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="review-modal-body">
          {/* Product Info */}
          <div className="review-product-info">
            <img
              src={productImage}
              alt={productName}
              className="review-product-image"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'https://via.placeholder.com/80?text=Product'
              }}
            />
            <div className="review-product-details">
              <h3>{productName}</h3>
              <p className="review-order-id">
                Đơn hàng: #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="review-form">
            {error && <div className="review-error">⚠️ {error}</div>}

            {/* Star Rating */}
            <div className="review-rating-section">
              <label>Đánh giá của bạn:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {rating === 1 && 'Rất tệ'}
                {rating === 2 && 'Tệ'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Tốt'}
                {rating === 5 && 'Tuyệt vời'}
              </p>
            </div>

            {/* Title */}
            <div className="review-title-section">
              <label htmlFor="title">Tiêu đề đánh giá:</label>
              <input
                id="title"
                type="text"
                placeholder="Nhập tiêu đề ngắn gọn cho đánh giá của bạn..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
              <p className="title-hint">Tối đa 200 ký tự ({title.length}/200)</p>
            </div>

            {/* Comment */}
            <div className="review-comment-section">
              <label htmlFor="comment">Nhận xét của bạn:</label>
              <textarea
                id="comment"
                rows="5"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={10}
              />
              <p className="comment-hint">Tối thiểu 10 ký tự ({comment.length}/10)</p>
            </div>

            {/* Submit Button */}
            <div className="review-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Hủy
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || !title.trim() || !comment.trim() || comment.length < 10}
              >
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
