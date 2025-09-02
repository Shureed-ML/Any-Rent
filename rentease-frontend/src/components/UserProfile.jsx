import React, { useEffect, useState } from 'react';
import { getUserItems } from '../services/api';
import { getWishlist, removeFromWishlist } from '../services/wishlistApi';
import { getRentedItems, returnItem } from '../services/rentalApi';
import './BrowseItems.css';
import { Link } from 'react-router-dom';

const UserProfile = ({ user }) => {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [rentedItems, setRentedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [rentedLoading, setRentedLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collapsible state
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showRented, setShowRented] = useState(false);

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

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      setWishlist(wishlist.filter(item => item.itemId._id !== itemId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handleReturnItem = async (rentalId) => {
    if (!window.confirm('Are you sure you want to return this item?')) {
      return;
    }

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
    return <div style={{ color: '#111' }}>Please log in to view your profile.</div>;
  }

  return (
    <div style={{ color: '#111', margin: '2rem 0' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#111' }}>User Profile</h2>
      {/* Collapsible: Basic Info */}
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid #eee' }}>
        <button onClick={() => setShowInfo(v => !v)} style={{ background: 'none', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', padding: 0, marginBottom: 8, color: '#111' }}>
          {showInfo ? '▼' : '►'} Basic Information
        </button>
        {showInfo && (
          <div style={{ marginLeft: 20, marginBottom: 12, color: '#111' }}>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
      </div>
      {/* Collapsible: Settings */}
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid #eee' }}>
        <button onClick={() => setShowSettings(v => !v)} style={{ background: 'none', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', padding: 0, marginBottom: 8, color: '#111' }}>
          {showSettings ? '▼' : '►'} User Settings
        </button>
        {showSettings && (
          <div style={{ marginLeft: 20, marginBottom: 12, color: '#111' }}>
            <p>Settings functionality coming soon...</p>
          </div>
        )}
      </div>
      {/* Collapsible: Wishlist */}
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid #eee' }}>
        <button onClick={() => setShowWishlist(v => !v)} style={{ background: 'none', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', padding: 0, marginBottom: 8, color: '#111' }}>
          {showWishlist ? '▼' : '►'} Your Wishlist
        </button>
        {showWishlist && (
          <div style={{ marginLeft: 20, marginBottom: 12, color: '#111' }}>
            {wishlistLoading ? (
              <div className="loading-message" style={{ color: '#111' }}>Loading wishlist...</div>
            ) : wishlist.length === 0 ? (
              <div className="empty-message" style={{ color: '#111' }}>Your wishlist is empty.</div>
            ) : (
              <div className="item-grid">
                {wishlist.map((wishlistItem) => {
                  const item = wishlistItem.itemId;
                  return (
                    <div key={wishlistItem._id} className="item-card" style={{ position: 'relative' }}>

                      <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {item.imageUrl && (
                          <div className="item-image" style={{ 
                            width: '120px', 
                            height: '120px', 
                            margin: '0 auto 10px auto',
                            overflow: 'hidden',
                            borderRadius: '8px'
                          }}>
                            <img 
                              src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                              alt={item.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}
                        <h3 className="item-title" style={{ color: '#111' }}>{item.title}</h3>
                        <p className="item-description" style={{ color: '#111' }}>{item.description}</p>
                        <div className="item-meta" style={{ color: '#111' }}>
                          <span className="item-price">${parseFloat(item.price).toFixed(2)} / day</span>
                          <span className="item-category">{item.category}</span>
                        </div>
                        <p className="item-location" style={{ color: '#111' }}>{item.location}</p>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Collapsible: Rented Items */}
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid #eee' }}>
        <button onClick={() => setShowRented(v => !v)} style={{ background: 'none', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', padding: 0, marginBottom: 8, color: '#111' }}>
          {showRented ? '▼' : '►'} Your Rented Items
        </button>
        {showRented && (
          <div style={{ marginLeft: 20, marginBottom: 12, color: '#111' }}>
            {rentedLoading ? (
              <div className="loading-message" style={{ color: '#111' }}>Loading rented items...</div>
            ) : rentedItems.length === 0 ? (
              <div className="empty-message" style={{ color: '#111' }}>You haven't rented any items yet.</div>
            ) : (
              <div className="item-grid">
                {rentedItems.map((rental) => {
                  const item = rental.itemId;
                  return (
                    <div key={rental._id} className="item-card" style={{ position: 'relative' }}>
                      <button
                        onClick={() => handleReturnItem(rental._id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        title="Return item"
                      >
                        Return
                      </button>
                      <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {item.imageUrl && (
                          <div className="item-image" style={{ 
                            width: '120px', 
                            height: '120px', 
                            margin: '0 auto 10px auto',
                            overflow: 'hidden',
                            borderRadius: '8px'
                          }}>
                            <img 
                              src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                              alt={item.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}
                        <h3 className="item-title" style={{ color: '#111' }}>{item.title}</h3>
                        <p className="item-description" style={{ color: '#111' }}>{item.description}</p>
                        <div className="item-meta" style={{ color: '#111' }}>
                          <span className="item-price">${parseFloat(item.price).toFixed(2)} / day</span>
                          <span className="item-category">{item.category}</span>
                        </div>
                        <p className="item-location" style={{ color: '#111' }}>{item.location}</p>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                          Rented on: {new Date(rental.rentalDate).toLocaleDateString()}
                        </p>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Collapsible: Posted Items */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setShowItems(v => !v)} style={{ background: 'none', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', padding: 0, marginBottom: 8, color: '#111' }}>
          {showItems ? '▼' : '►'} Your Posted Items
        </button>
        {showItems && (
          <div style={{ marginLeft: 20, marginBottom: 12, color: '#111' }}>
            {loading ? (
              <div className="loading-message" style={{ color: '#111' }}>Loading your items...</div>
            ) : error ? (
              <div className="error-message" style={{ color: '#111' }}>{error}</div>
            ) : items.length === 0 ? (
              <div className="empty-message" style={{ color: '#111' }}>You haven't posted any items yet.</div>
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
                      <h3 className="item-title" style={{ color: '#111' }}>{item.title}</h3>
                      <p className="item-description" style={{ color: '#111' }}>{item.description}</p>
                      <div className="item-meta" style={{ color: '#111' }}>
                        <span className="item-price">${parseFloat(item.price).toFixed(2)} / day</span>
                        <span className="item-category">{item.category}</span>
                      </div>
                      <p className="item-location" style={{ color: '#111' }}>{item.location}</p>
                      <p className="item-date" style={{ color: '#111' }}>Listed on: {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
