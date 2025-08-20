import React, { useState, useEffect, useRef } from 'react';
import { getAllItems } from '../services/api';
import { Link } from 'react-router-dom';
import './BrowseItems.css';

const BrowseItems = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
    // Collapse search bar if clicked outside
    const handleClick = (e) => {
      if (showSearch && searchRef.current && !searchRef.current.parentNode.contains(e.target)) {
        setShowSearch(false);
      }
    };
    if (showSearch) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSearch]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getAllItems();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  // Filter out user's own items (handle both object and string cases)
  let filteredItems = user ? items.filter(item => {
    if (!item.owner) return true;
    if (typeof item.owner === 'object' && item.owner._id) {
      return item.owner._id !== user._id;
    }
    return item.owner !== user._id;
  }) : items;

  // Apply search filter
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    filteredItems = filteredItems.filter(item =>
      (item.title && item.title.toLowerCase().includes(s)) ||
      (item.description && item.description.toLowerCase().includes(s)) ||
      (item.category && item.category.toLowerCase().includes(s))
    );
  }

  if (loading) {
    return <div className="loading-message">Loading items...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <section className="browse-items-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Explore Items for Rent</h2>
        <button
          aria-label="Search"
          onClick={() => setShowSearch(s => !s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          {/* Magnifying glass SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        {showSearch && (
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by title, description, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300, maxWidth: '60vw', padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc', color: '#111', marginLeft: 8 }}
          />
        )}
      </div>
      {(!filteredItems || filteredItems.length === 0) ? (
        <div className="empty-message">No items listed yet. Be the first to list one!</div>
      ) : (
        <div className="item-grid">
          {filteredItems.map((item) => (
            <Link to={`/product/${item._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="item-card">
                {item.imageUrl && (
                  <div className="item-image">
                    <img src={item.imageUrl} alt={item.title} />
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
                <button className="rent-button">Rent Now</button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default BrowseItems;
