import React, { useState, useEffect } from 'react';
import { getAllItems } from '../services/api';
import './BrowseItems.css';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

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

  if (loading) {
    return <div className="loading-message">Loading items...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!items || items.length === 0) {
    return <div className="empty-message">No items listed yet. Be the first to list one!</div>;
  }

  return (
    <section className="browse-items-section">
      <h2 className="section-title">Explore Items for Rent</h2>
      <div className="item-grid">
        {items.map((item) => (
          <div key={item._id} className="item-card">
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
        ))}
      </div>
    </section>
  );
};

export default BrowseItems;
