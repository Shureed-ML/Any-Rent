import React, { useState, useEffect } from 'react';
import { getAdminReviews, deleteAdminReview } from '../../services/adminApi';
import './ReviewManagement.css';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        fetchReviews();
    }, [currentPage]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getAdminReviews(currentPage, 10);
            setReviews(data.reviews);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [reviewId]: true }));
            await deleteAdminReview(reviewId);
            fetchReviews(); // Refresh the list
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    const renderStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (loading) return <div className="admin-loading">Loading reviews...</div>;

    return (
        <div className="review-management">
            <div className="management-header">
                <h1>Review Management</h1>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="reviews-list">
                {reviews.map(review => (
                    <div key={review._id} className="review-card">
                        <div className="review-header">
                            <div className="review-rating">
                                {renderStars(review.rating)}
                                <span className="rating-number">({review.rating}/5)</span>
                            </div>
                            <div className="review-date">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        
                        <div className="review-content">
                            <p className="review-comment">{review.comment}</p>
                        </div>
                        
                        <div className="review-meta">
                            <div className="review-user">
                                By: {review.userId?.username} ({review.userId?.email})
                            </div>
                            <div className="review-item">
                                Item: {review.itemId?.title || 'Item not found'}
                            </div>
                        </div>
                        
                        <div className="review-actions">
                            <button
                                onClick={() => handleDeleteReview(review._id)}
                                disabled={actionLoading[review._id]}
                                className="action-btn delete"
                            >
                                {actionLoading[review._id] ? 'Deleting...' : 'Delete Review'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {reviews.length === 0 && !loading && (
                <div className="no-reviews">No reviews found.</div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewManagement;
