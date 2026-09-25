import React, { useEffect, useState } from 'react';
import { getUserItems } from '../services/api';
import { getWishlist, removeFromWishlist } from '../services/wishlistApi';
import { getRentedItems, returnItem } from '../services/rentalApi';
import './BrowseItems.css';
import './UserProfile.css';
import { Link } from 'react-router-dom';

const UserProfile = ({ user }) => {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [rentedItems, setRentedItems] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [rentedLoading, setRentedLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('posted'); // 'posted', 'wishlist', 'rented'

  useEffect(() => {
    if (user) {
      fetchUserItems();
      fetchWishlist();
      fetchRentedItems();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      const data = await getUserItems();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch your items');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      setWishlistLoading(true);
      const data = await getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchRentedItems = async () => {
    try {
      setRentedLoading(true);
      const data = await getRentedItems();
      setRentedItems(data);
    } catch (err) {
      console.error('Failed to fetch rented items:', err);
    } finally {
      setRentedLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId, e) => {
    e.preventDefault();
    try {
      await removeFromWishlist(itemId);
      setWishlist(wishlist.filter(item => item.itemId._id !== itemId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handleReturnItem = async (rentalId, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to return this item?')) return;
    try {
      await returnItem(rentalId);
      setRentedItems(rentedItems.filter(rental => rental._id !== rentalId));
      alert('Item returned successfully!');
    } catch (err) {
      console.error('Failed to return item:', err);
      alert('Failed to return item');
    }
  };

  if (!user) {
    return <div className="section-empty">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`profile-tab-btn ${activeTab === 'posted' ? 'active' : ''}`}
          onClick={() => setActiveTab('posted')}
        >
          Posted Items
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Wishlist
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'rented' ? 'active' : ''}`}
          onClick={() => setActiveTab('rented')}
        >
          Rented Items
        </button>
      </div>

      <div className="profile-section">
        
        {/* POSTED ITEMS TAB */}
        {activeTab === 'posted' && (
          <div>
            {loading ? (
              <div className="section-empty">Loading your items...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : items.length === 0 ? (
              <div className="section-empty">You haven't posted any items yet.</div>
            ) : (
              <div className="item-grid">
                {items.map((item) => (
                  <Link to={`/product/${item._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="item-card">
                      {item.imageUrl && (
                        <div className="item-image">
                          <img 
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                            alt={item.title} 
                          />
                        </div>
                      )}
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-description">{item.description}</p>
                      <div className="item-meta">
                        <span className="item-price">${parseFloat(item.price).toFixed(2)} / day</span>
                        <span className="item-category">{item.category}</span>
                      </div>
                      <p className="item-location">{item.location}</p>
                      <p className="item-date">Listed on: {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistLoading ? (
              <div className="section-empty">Loading wishlist...</div>
            ) : wishlist.length === 0 ? (
              <div className="section-empty">Your wishlist is empty.</div>
            ) : (
              <div className="item-grid">
                {wishlist.map((wishlistItem) => {
                  const item = wishlistItem.itemId;
                  if (!item) return null;
                  return (
                    <Link to={`/product/${item._id}`} key={wishlistItem._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="item-card">
                        <button 
                          className="return-btn" 
                          style={{ backgroundColor: '#6b7280' }} 
                          onClick={(e) => handleRemoveFromWishlist(item._id, e)}
                        >
                          Remove
                        </button>
                        {item.imageUrl && (
                          <div className="item-image">
                            <img 
                              src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                              alt={item.title}
                            />
                          </div>
                        )}
                        <h3 className="item-title">{item.title}</h3>
                        <p className="item-description">{item.description}</p>
                        <div className="item-meta">
                          <span className="item-price">${parseFloat(item.price).toFixed(2)} / day</span>
                          <span className="item-category">{item.category}</span>
                        </div>
                        <p className="item-location">{item.location}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RENTED ITEMS TAB */}
        {activeTab === 'rented' && (
          <div>
            {rentedLoading ? (
              <div className="section-empty">Loading rented items...</div>
            ) : rentedItems.length === 0 ? (
              <div className="section-empty">You haven't rented any items yet.</div>
            ) : (
              <div className="item-grid">
                {rentedItems.map((rental) => {
                  const item = rental.itemId;
                  if (!item) return null;
                  return (
                    <Link to={`/product/${item._id}`} key={rental._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="item-card">
                        <button
                          className="return-btn"
                          onClick={(e) => handleReturnItem(rental._id, e)}
                          title="Return item"
                        >
                          Return
                        </button>
                        {item.imageUrl && (
                          <div className="item-image">
                            <img 
                              src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                              alt={item.title}
                            />
                          </div>
                        )}
                        <h3 className="item-title">{item.title}</h3>
                        <p className="item-description">{item.description}</p>
                        <div className="item-meta">
                          <span className="item-price">${parseFloat(item.price).toFixed(2)} / day</span>
                          <span className="item-category">{item.category}</span>
                        </div>
                        <p className="item-location">{item.location}</p>
                        <p className="item-date">
                          Rented on: {new Date(rental.rentalDate).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;
