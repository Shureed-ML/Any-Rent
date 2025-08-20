import React, { useEffect, useState } from 'react';
import { getUserItems } from '../services/api';
import './BrowseItems.css';
import { Link } from 'react-router-dom';

const UserProfile = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collapsible state
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserItems();
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
                          <img src={item.imageUrl} alt={item.title} />
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
