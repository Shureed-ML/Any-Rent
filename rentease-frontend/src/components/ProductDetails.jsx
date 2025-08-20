import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllItems, deleteItem, updateItem } from '../services/api';

const ProductDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const items = await getAllItems();
      const found = items.find(i => i._id === id);
      if (!found) throw new Error('Item not found');
      setItem(found);
      setEditForm({
        title: found.title,
        description: found.description,
        price: found.price,
        location: found.location,
        category: found.category,
        imageUrl: found.imageUrl || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      setDeleting(true);
      await deleteItem(id);
      navigate('/profile');
    } catch (err) {
      console.error('Delete error:', err, err.message);
      alert(err.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateItem(id, editForm);
      await fetchItem(); // Refresh the item data
      setEditing(false);
      alert('Item updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      title: item.title,
      description: item.description,
      price: item.price,
      location: item.location,
      category: item.category,
      imageUrl: item.imageUrl || ''
    });
  };

  if (loading) return <div style={{ color: '#111' }}>Loading...</div>;
  if (error) return <div style={{ color: '#111' }}>Error: {error}</div>;
  if (!item) return null;

  // Increased image size
  const imageBoxSize = 380;
  const imageSize = 340;
  const isOwner = user && item.owner && ((typeof item.owner === 'object' ? item.owner._id : item.owner) === user._id);

  return (
    <div style={{ color: '#111', margin: '2rem 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'flex-start' }}>
        {/* Image or Placeholder */}
        <div style={{ flex: `0 0 ${imageBoxSize}px`, minWidth: imageBoxSize, minHeight: imageBoxSize, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: 12 }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} style={{ maxWidth: imageSize, maxHeight: imageSize, borderRadius: 12, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: imageSize, height: imageSize, background: '#ddd', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 22 }}>
              No Image
            </div>
          )}
        </div>
        {/* Details */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {editing ? (
            // Edit Form
            <div>
              <h2 style={{ marginBottom: '1rem' }}>Edit Item</h2>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title:</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description:</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4, minHeight: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Price (per day):</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
                  min="0"
                  step="0.01"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Location:</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category:</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
                >
                  <option value="electronics">Electronics</option>
                  <option value="tools">Tools</option>
                  <option value="sports">Sports Equipment</option>
                  <option value="clothing">Clothing</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Image URL (optional):</label>
                <input
                  type="url"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  style={{ padding: '0.75rem 2rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  style={{ padding: '0.75rem 2rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <h2 style={{ marginBottom: '1rem' }}>{item.title}</h2>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Price:</strong> ${parseFloat(item.price).toFixed(2)} / day</p>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Listed on:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
              {item.owner && (
                <p><strong>Owner:</strong> {typeof item.owner === 'object' ? item.owner.username : item.owner}</p>
              )}
              <button style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                Rent Now
              </button>
              {isOwner && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: 16 }}>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ padding: '0.6rem 1.5rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    style={{ padding: '0.6rem 1.5rem', background: '#ffc107', color: '#222', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
