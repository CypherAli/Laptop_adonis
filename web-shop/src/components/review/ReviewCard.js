import React, { useState, useContext } from 'react'
import { FiThumbsUp, FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import RatingStars from '../rating/RatingStars'
import AuthContext from '../../context/AuthContext'
import { useToast } from '../common/Toast'
import './ReviewCard.css'

const ReviewCard = ({ review, onUpdate, onDelete, onMarkHelpful }) => {
  const { user } = useContext(AuthContext)

  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedReview, setEditedReview] = useState({
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    pros: review.pros || [],
    cons: review.cons || [],
  })

  const isOwner = user && review.user && user.id === review.user._id
  const hasMarkedHelpful = user && review.helpfulBy && review.helpfulBy.includes(user.id)

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleSaveEdit = () => {
    onUpdate(review._id, editedReview)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedReview({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      pros: review.pros || [],
      cons: review.cons || [],
    })
    setIsEditing(false)
  }

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">{review.user?.username?.charAt(0).toUpperCase()}</div>
          <div>
            <h4 className="reviewer-name">{review.user?.username || 'Anonymous'}</h4>
            <span className="review-date">{formatDate(review.createdAt)}</span>
          </div>
        </div>
        {isOwner && !isEditing && (
          <div className="review-actions">
            <button
              className="action-btn edit"
              onClick={() => setIsEditing(true)}
              title="Edit review"
            >
              <FiEdit2 />
            </button>
            <button
              className="action-btn delete"
              onClick={() => onDelete(review._id)}
              title="Delete review"
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="review-edit-form">
          <div className="form-group">
            <label>Rating</label>
            <RatingStars
              rating={editedReview.rating}
              interactive={true}
              showNumber={false}
              onRatingChange={(rating) => setEditedReview({ ...editedReview, rating })}
            />
          </div>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={editedReview.title}
              onChange={(e) => setEditedReview({ ...editedReview, title: e.target.value })}
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea
              value={editedReview.comment}
              onChange={(e) => setEditedReview({ ...editedReview, comment: e.target.value })}
              rows={4}
              maxLength={2000}
            />
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleSaveEdit}>
              Save
            </button>
            <button className="btn-cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="review-rating">
            <RatingStars rating={review.rating} showNumber={false} size="small" />
            {review.isVerifiedPurchase && (
              <span className="verified-badge">
                <FiCheckCircle /> Verified Purchase
              </span>
            )}
          </div>

          <h3 className="review-title">{review.title}</h3>
          <p className="review-comment">{review.comment}</p>

          {review.pros && review.pros.length > 0 && (
            <div className="review-pros-cons">
              <div className="pros">
                <strong>👍 Pros:</strong>
                <ul>
                  {review.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {review.cons && review.cons.length > 0 && (
            <div className="review-pros-cons">
              <div className="cons">
                <strong>👎 Cons:</strong>
                <ul>
                  {review.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
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
              className={`helpful-btn ${hasMarkedHelpful ? 'active' : ''}`}
              onClick={() => onMarkHelpful(review._id)}
            >
              <FiThumbsUp />
              Helpful ({review.helpfulCount || 0})
            </button>
          </div>

          {review.sellerResponse && (
            <div className="seller-response">
              <div className="response-header">
                <strong>Seller Response</strong>
                <span className="response-date">
                  {formatDate(review.sellerResponse.respondedAt)}
                </span>
              </div>
              <p>{review.sellerResponse.comment}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ReviewCard
