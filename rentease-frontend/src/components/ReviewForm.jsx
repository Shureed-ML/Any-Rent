import React, { useState } from 'react';
import { createReview } from '../services/api';
import './ReviewForm.css';

const ReviewForm = ({ itemId, onReviewAdded, user, itemOwnerId }) => {
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Don't show the form if the current user is the item owner
    if (user?._id === itemOwnerId) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const newReview = await createReview(itemId, formData);
            setFormData({ rating: 5, comment: '' });
            onReviewAdded(newReview);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!user) {
        return <p className="login-prompt">Please log in to leave a review.</p>;
    }

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3>Write a Review</h3>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <div className="rating-input">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <label key={star}>
                            <input
                                type="radio"
                                name="rating"
                                value={star}
                                checked={parseInt(formData.rating) === star}
                                onChange={handleChange}
                            />
                            <span className="star">★</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="comment">Your Review</label>
                <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={500}
                    placeholder="Share your experience..."
                />
            </div>

            <button 
                type="submit" 
                className="submit-button" 
                disabled={loading}
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
