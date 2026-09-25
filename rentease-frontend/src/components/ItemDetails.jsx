import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, getItemReviews, updateItem, deleteItem } from '../services/api';
import { addToWishlist, removeFromWishlist, checkWishlistStatus } from '../services/wishlistApi';
import { rentItem, checkRentalStatus } from '../services/rentalApi';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import './ItemDetails.css';

const ItemDetails = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [reviewStats, setReviewStats] = useState({
        averageRating: 0,
        totalReviews: 0
    });
    const [inWishlist, setInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [isRented, setIsRented] = useState(false);
    const [rentalDetails, setRentalDetails] = useState(null);
    const [rentalLoading, setRentalLoading] = useState(false);

    const handleEdit = () => {
        setEditForm({
            title: item.title,
            description: item.description,
            price: item.price,
            location: item.location,
            category: item.category
        });
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setEditForm({});
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateItem(id, editForm);
            const updatedItem = await getItem(id);
            setItem(updatedItem);
            setEditing(false);
            alert('Item updated successfully!');
        } catch (err) {
            alert('Failed to update item: ' + err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        
        try {
            await deleteItem(id);
            navigate('/browse');
        } catch (err) {
            alert('Failed to delete item: ' + err.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // First fetch the item details
                const itemData = await getItem(id);
                setItem(itemData);
                
                // Check wishlist status if user is logged in
                if (user) {
                    try {
                        const wishlistStatus = await checkWishlistStatus(id);
                        setInWishlist(wishlistStatus);
                    } catch (wishlistErr) {
                        console.error('Failed to check wishlist status:', wishlistErr);
                    }
                }

                // Check rental status
                try {
                    const rentalStatus = await checkRentalStatus(id);
                    setIsRented(rentalStatus.isRented);
                    if (rentalStatus.isRented && rentalStatus.rental) {
                        setRentalDetails(rentalStatus.rental);
                    }
                } catch (rentalErr) {
                    console.error('Failed to check rental status:', rentalErr);
                }
                
                try {
                    // Then try to fetch reviews
                    const reviewsData = await getItemReviews(id);
                    setReviews(reviewsData.reviews || []);
                    
                    // Calculate review statistics
                    if (reviewsData.reviews && reviewsData.reviews.length > 0) {
                        const total = reviewsData.reviews.reduce((sum, review) => sum + review.rating, 0);
                        setReviewStats({
                            averageRating: total / reviewsData.reviews.length,
                            totalReviews: reviewsData.reviews.length
                        });
                    }
                } catch (reviewErr) {
                    console.error('Failed to fetch reviews:', reviewErr);
                    // Don't set error state for review failures
                }
            } catch (err) {
                console.error('Failed to fetch item:', err);
                setError(err.message || 'Failed to fetch item details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    const handleReviewAdded = (newReview) => {
        setReviews(prevReviews => {
            const updatedReviews = [...prevReviews, newReview];
            const total = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
            setReviewStats({
                averageRating: total / updatedReviews.length,
                totalReviews: updatedReviews.length
            });
            return updatedReviews;
        });
    };

    const handleWishlistToggle = async () => {
        if (!user) {
            alert('Please log in to add items to your wishlist');
            return;
        }

        setWishlistLoading(true);
        try {
            if (inWishlist) {
                await removeFromWishlist(id);
                setInWishlist(false);
            } else {
                await addToWishlist(id);
                setInWishlist(true);
            }
        } catch (err) {
            console.error('Failed to toggle wishlist:', err);
            alert('Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleRentItem = async () => {
        if (!user) {
            alert('Please log in to rent items');
            return;
        }

        if (isRented) {
            alert('This item is already rented');
            return;
        }

        if (!window.confirm(`Are you sure you want to rent "${item.title}" for $${parseFloat(item.price).toFixed(2)} per day?`)) {
            return;
        }

        setRentalLoading(true);
        try {
            await rentItem(id);
            setIsRented(true);
            alert('Item rented successfully! You can find it in your "Rented Items" section in your profile.');
        } catch (err) {
            console.error('Failed to rent item:', err);
            alert(err.message || 'Failed to rent item');
        } finally {
            setRentalLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!item) return <div>Item not found</div>;

    const isOwner = user && item.owner && (
        (typeof item.owner === 'object' && item.owner._id === user._id) ||
        (typeof item.owner === 'string' && item.owner === user._id)
    );

    return (
        <div className="item-details-container">
            <div className="item-details">
                <div className="image-container">
                    {item.imageUrl ? (
                        <img 
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
                            alt={item.title} 
                            className="item-image" 
                        />
                    ) : (
                        <div className="no-image">No Image Available</div>
                    )}
                </div>
                <div className="item-info">
                    {editing ? (
                        <div>
                            <h2>Edit Item</h2>
                            <form onSubmit={handleUpdate}>
                                <div className="form-group">
                                    <label>Title:</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description:</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price per day:</label>
                                    <input
                                        type="number"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location:</label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category:</label>
                                    <select
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                        required
                                    >
                                        <option value="electronics">Electronics</option>
                                        <option value="tools">Tools</option>
                                        <option value="sports">Sports Equipment</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="button-group">
                                    <button type="submit" className="save-button">Save Changes</button>
                                    <button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <>
                            <h2>{item.title}</h2>
                            <p className="price">${parseFloat(item.price).toFixed(2)} / day</p>
                            <p className="category">Category: {item.category}</p>
                            <p className="location">Location: {item.location}</p>
                            <p className="description">{item.description}</p>
                            
                            {/* Rental Status */}
                            {isRented && (
                                <div style={{ 
                                    marginTop: '1rem', 
                                    padding: '0.75rem', 
                                    background: '#fff3cd', 
                                    border: '1px solid #ffeaa7', 
                                    borderRadius: '0.375rem',
                                    color: '#856404'
                                }}>
                                    <strong>⚠️ This item is currently rented</strong>
                                </div>
                            )}
                            
                            {/* Rent Now Button */}
                            {user && !isOwner && !isRented && (
                                <div className="rent-section" style={{ marginTop: '1rem' }}>
                                    <button 
                                        onClick={handleRentItem}
                                        disabled={rentalLoading}
                                        style={{
                                            padding: '0.75rem 2rem',
                                            background: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.375rem',
                                            fontWeight: '500',
                                            cursor: rentalLoading ? 'not-allowed' : 'pointer',
                                            opacity: rentalLoading ? 0.7 : 1,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {rentalLoading ? 'Renting...' : 'Rent Now'}
                                    </button>
                                </div>
                            )}
                            
                            {/* Wishlist Button */}
                            {user && !isOwner && (
                                <div className="wishlist-section" style={{ marginTop: '1rem' }}>
                                    <button 
                                        onClick={handleWishlistToggle}
                                        disabled={wishlistLoading}
                                        className={`wishlist-button ${inWishlist ? 'in-wishlist' : ''}`}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: inWishlist ? '#dc3545' : (isRented ? '#6c757d' : '#4A2D4E'),
                                            color: '#FDFDF8',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '500',
                                            cursor: wishlistLoading ? 'not-allowed' : 'pointer',
                                            opacity: wishlistLoading ? 0.7 : 1
                                        }}
                                    >
                                        {wishlistLoading ? 'Updating...' : (inWishlist ? 'Remove from Wishlist' : (isRented && rentalDetails ? `Add to Wishlist (Available ~${new Date(new Date(rentalDetails.rentalDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()})` : 'Add to Wishlist'))}
                                    </button>
                                </div>
                            )}
                            
                            {isOwner && (
                                <div className="owner-actions">
                                    <button onClick={handleEdit} className="edit-button">Edit Item</button>
                                    <button onClick={handleDelete} className="delete-button">Delete Item</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
                <ReviewList reviews={reviews} stats={reviewStats} />
                {user && !isOwner ? (
                    <ReviewForm 
                        itemId={id} 
                        onReviewAdded={handleReviewAdded}
                        user={user}
                        itemOwnerId={typeof item.owner === 'object' ? item.owner._id : item.owner}
                    />
                ) : isOwner ? (
                    <p className="owner-message">As the owner, you cannot review your own item.</p>
                ) : (
                    <p className="login-message">Please log in to leave a review.</p>
                )}
            </div>

            {/* Message Button Section */}
            {user && !isOwner && (
                <div className="message-section">
                    <button 
                        className="message-button"
                        onClick={() => {
                            const ownerId = item.owner && (item.owner._id || item.owner);
                            if (ownerId) {
                                navigate(`/chat/${ownerId}/${id}`);
                            } else {
                                alert('Could not find owner information');
                            }
                        }}
                    >
                        Send Message to Owner
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemDetails;
