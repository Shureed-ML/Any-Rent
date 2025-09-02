import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/api';
import './ListItem.css';

const ListItem = ({ user }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        category: '',
        image: null,
        imagePreview: null
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'image' && files && files[0]) {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.title || !formData.description || !formData.price || !formData.location || !formData.category) {
                throw new Error('Please fill in all required fields');
            }

            const formDataToSend = new FormData();
            
            // Ensure all required fields are included
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('price', formData.price);
            formDataToSend.append('location', formData.location.trim());
            formDataToSend.append('category', formData.category);
            
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const response = await createItem(formDataToSend);
            console.log('Item created:', response); // For debugging
            setMessage('Item listed successfully!');
            navigate('/browse');
        } catch (err) {
            setError(err.message || 'Failed to list item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="list-item-container">
            <h2>List Your Item</h2>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="list-item-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price (per day)</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="electronics">Electronics</option>
                        <option value="tools">Tools</option>
                        <option value="sports">Sports Equipment</option>
                        <option value="clothing">Clothing</option>
                        <option value="furniture">Furniture</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Item Image</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="file-input"
                    />
                    {formData.imagePreview && (
                        <div className="image-preview">
                            <img 
                                src={formData.imagePreview} 
                                alt="Preview" 
                                style={{ maxWidth: '200px', marginTop: '10px' }}
                            />
                        </div>
                    )}
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Listing...' : 'List Item'}
                </button>
            </form>
        </div>
    );
};

export default ListItem;