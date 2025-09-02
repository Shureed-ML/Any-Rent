import React from 'react';
import './ReviewList.css';

const ReviewList = ({ reviews, stats }) => {
    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="reviews-section">
            <div className="reviews-summary">
                <div className="average-rating">
                    <h3>Rating</h3>
                    <div className="rating-number">{stats.averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="rating-stars">{renderStars(Math.round(stats.averageRating || 0))}</div>
                    <div className="total-reviews">Based on {stats.totalReviews} reviews</div>
                </div>
            </div>

            <div className="reviews-list">
                <h3>Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                    <p className="no-reviews">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="review-item">
                            <div className="review-header">
                                <span className="review-stars">{renderStars(review.rating)}</span>
                                <span className="review-author">by {review.userId.username}</span>
                                <span className="review-date">{formatDate(review.createdAt)}</span>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewList;
