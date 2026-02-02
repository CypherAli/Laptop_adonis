/**
 * ==================== REVIEW MANAGEMENT COMPONENT ====================
 *
 * PHÂN QUYỀN HỆ THỐNG:
 * - Customer: Can create/update/delete own reviews (only for delivered orders)
 * - Admin: Can view all reviews, delete any review, moderate approval status
 * - IMPORTANT: Users can only review products they've purchased and received
 *
 * CORE FUNCTIONS:
 * 1. Review Display (Public)
 *    - getByProduct() - GET /api/reviews/product/:productId (with filters: rating, sortBy)
 *    - Filters: rating (1-5), sortBy (recent, helpful, rating_high, rating_low)
 *
 * 2. Review Management (User)
 *    - create() - POST /api/reviews (requires delivered order)
 *    - update() - PUT /api/reviews/:id (ownership check)
 *    - destroy() - DELETE /api/reviews/:id (owner or admin)
 *    - markHelpful() - POST /api/reviews/:id/helpful (toggle helpful mark)
 *
 * 3. Admin Functions
 *    - index() - GET /api/reviews (all reviews with pagination)
 *    - Filter by isApproved status for moderation
 *
 * BACKEND LOGIC NOTES:
 * - isVerifiedPurchase: Always true (checked via delivered orders)
 * - isApproved: Auto-approved for now (can add moderation)
 * - Rating validation: 1-5 stars
 * - One review per product per user
 * - Auto-update product rating average after create/update/delete
 * - Helpful marks: Toggle system (click again to remove)
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './ReviewManagement.css'

export default function ReviewManagement() {
  const navigate = useNavigate()
  const { productId } = useParams() // If viewing reviews for specific product
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [filterRating, setFilterRating] = useState('')
  const [sortBy, setSortBy] = useState('recent') // recent | helpful | rating_high | rating_low

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [reviewForm, setReviewForm] = useState({
    productId: productId || '',
    rating: 5,
    title: '',
    comment: '',
    images: [],
    pros: [],
    cons: [],
  })

  // Temp inputs for pros/cons
  const [proInput, setProInput] = useState('')
  const [conInput, setConInput] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!token) {
      navigate('/login')
      return
    }
    setCurrentUser(user)
    fetchReviews()
  }, [currentPage, filterRating, sortBy, navigate, productId])

  const fetchReviews = async () => {
    setLoading(true)
    setError('')
    try {
      let url = ''
      let params = {
        page: currentPage,
        limit: 10,
        sortBy,
      }

      if (productId) {
        // Get reviews for specific product
        url = `/api/reviews/product/${productId}`
        if (filterRating) {
          params.rating = filterRating
        }
      } else {
        // Admin view: all reviews
        url = '/api/reviews'
      }

      const response = await axios.get(url, { params })
      setReviews(response.data.reviews)
      setTotalReviews(response.data.totalReviews)
      setCurrentPage(response.data.currentPage)
      setTotalPages(response.data.totalPages)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải đánh giá')
    } finally {
      setLoading(false)
    }
  }

  // ==================== CREATE REVIEW ====================

  const handleCreateReview = () => {
    setEditingReview(null)
    setReviewForm({
      productId: productId || '',
      rating: 5,
      title: '',
      comment: '',
      images: [],
      pros: [],
      cons: [],
    })
    setShowReviewForm(true)
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setReviewForm({
      productId: review.product._id || review.product,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images || [],
      pros: review.pros || [],
      cons: review.cons || [],
    })
    setShowReviewForm(true)
  }

  const handleSaveReview = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingReview) {
        await axios.put(`/api/reviews/${editingReview._id}`, reviewForm)
        setSuccess('Cập nhật đánh giá thành công')
      } else {
        await axios.post('/api/reviews', reviewForm)
        setSuccess('Thêm đánh giá thành công')
      }
      setShowReviewForm(false)
      await fetchReviews()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu đánh giá')
    }
  }

  // ==================== DELETE REVIEW ====================

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return

    try {
      await axios.delete(`/api/reviews/${reviewId}`)
      setSuccess('Xóa đánh giá thành công')
      await fetchReviews()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa đánh giá')
    }
  }

  // ==================== HELPFUL MARK ====================

  const handleMarkHelpful = async (reviewId) => {
    try {
      await axios.post(`/api/reviews/${reviewId}/helpful`)
      await fetchReviews()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đánh dấu hữu ích')
    }
  }

  // ==================== PROS/CONS HELPERS ====================

  const handleAddPro = () => {
    if (proInput.trim()) {
      setReviewForm({
        ...reviewForm,
        pros: [...reviewForm.pros, proInput.trim()],
      })
      setProInput('')
    }
  }

  const handleRemovePro = (index) => {
    setReviewForm({
      ...reviewForm,
      pros: reviewForm.pros.filter((_, i) => i !== index),
    })
  }

  const handleAddCon = () => {
    if (conInput.trim()) {
      setReviewForm({
        ...reviewForm,
        cons: [...reviewForm.cons, conInput.trim()],
      })
      setConInput('')
    }
  }

  const handleRemoveCon = (index) => {
    setReviewForm({
      ...reviewForm,
      cons: reviewForm.cons.filter((_, i) => i !== index),
    })
  }

  // ==================== PERMISSIONS ====================

  const canEditReview = (review) => {
    return currentUser && review.user._id === currentUser.id
  }

  const canDeleteReview = (review) => {
    return currentUser && (review.user._id === currentUser.id || currentUser.role === 'admin')
  }

  if (loading && reviews.length === 0) {
    return <div className="review-loading">Đang tải...</div>
  }

  return (
    <div className="review-container">
      <div className="review-header">
        <h1>Đánh Giá Sản Phẩm</h1>
        {productId && (
          <button className="btn btn-primary" onClick={handleCreateReview}>
            Viết Đánh Giá
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ==================== FILTERS ==================== */}
      <div className="review-filters">
        <div className="filter-group">
          <label>Lọc theo sao:</label>
          <select
            value={filterRating}
            onChange={(e) => {
              setFilterRating(e.target.value)
              setCurrentPage(1)
            }}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sắp xếp:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setCurrentPage(1)
            }}
            className="filter-select"
          >
            <option value="recent">Mới nhất</option>
            <option value="helpful">Hữu ích nhất</option>
            <option value="rating_high">Điểm cao nhất</option>
            <option value="rating_low">Điểm thấp nhất</option>
          </select>
        </div>
      </div>

      {/* ==================== REVIEWS LIST ==================== */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có đánh giá nào.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-user">
                <div className="user-avatar">
                  {review.user?.avatar ? (
                    <img src={review.user.avatar} alt={review.user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {review.user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{review.user?.username || 'Người dùng'}</div>
                  {review.isVerifiedPurchase && <span className="verified-badge">Đã mua hàng</span>}
                </div>
              </div>

              <div className="review-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>

              <h3 className="review-title">{review.title}</h3>
              <p className="review-comment">{review.comment}</p>

              {review.pros && review.pros.length > 0 && (
                <div className="review-pros">
                  <strong>Ưu điểm:</strong>
                  <ul>
                    {review.pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.cons && review.cons.length > 0 && (
                <div className="review-cons">
                  <strong>Nhược điểm:</strong>
                  <ul>
                    {review.cons.map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((img, index) => (
                    <img key={index} src={img} alt={`Review ${index + 1}`} />
                  ))}
                </div>
              )}

              <div className="review-footer">
                <button
                  className={`btn-helpful ${review.helpfulBy?.includes(currentUser?.id) ? 'marked' : ''}`}
                  onClick={() => handleMarkHelpful(review._id)}
                >
                  Hữu ích ({review.helpfulCount || 0})
                </button>

                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </span>

                <div className="review-actions">
                  {canEditReview(review) && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditReview(review)}
                    >
                      Sửa
                    </button>
                  )}
                  {canDeleteReview(review) && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ==================== PAGINATION ==================== */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trang Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Trang Sau
          </button>
        </div>
      )}

      {/* ==================== REVIEW FORM MODAL ==================== */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal-content review-form-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingReview ? 'Chỉnh Sửa Đánh Giá' : 'Viết Đánh Giá'}</h2>
            <form onSubmit={handleSaveReview}>
              <div className="form-group">
                <label>Đánh giá sao *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= reviewForm.rating ? 'filled' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nhận xét *</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="form-control"
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ưu điểm</label>
                <div className="list-input">
                  <input
                    type="text"
                    value={proInput}
                    onChange={(e) => setProInput(e.target.value)}
                    placeholder="Nhập ưu điểm..."
                    className="form-control"
                  />
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAddPro}>
                    Thêm
                  </button>
                </div>
                <ul className="items-list">
                  {reviewForm.pros.map((pro, index) => (
                    <li key={index}>
                      {pro}
                      <button type="button" onClick={() => handleRemovePro(index)}>
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="form-group">
                <label>Nhược điểm</label>
                <div className="list-input">
                  <input
                    type="text"
                    value={conInput}
                    onChange={(e) => setConInput(e.target.value)}
                    placeholder="Nhập nhược điểm..."
                    className="form-control"
                  />
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCon}>
                    Thêm
                  </button>
                </div>
                <ul className="items-list">
                  {reviewForm.cons.map((con, index) => (
                    <li key={index}>
                      {con}
                      <button type="button" onClick={() => handleRemoveCon(index)}>
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReviewForm(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingReview ? 'Cập Nhật' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
