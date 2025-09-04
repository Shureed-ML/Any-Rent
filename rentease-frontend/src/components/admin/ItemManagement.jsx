import React, { useState, useEffect, useRef } from 'react';
import { getAdminItems, deleteAdminItem, getItemDetails, updateItemStatus, toggleItemFeatured, bulkItemOperation } from '../../services/adminApi';
import ItemEditModal from './ItemEditModal';
import ItemCreateModal from './ItemCreateModal';
import './ItemManagement.css';

const ItemManagement = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [actionLoading, setActionLoading] = useState({});
    const [showSearch, setShowSearch] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const searchRef = useRef(null);

    const categories = ['Electronics', 'Furniture', 'Vehicles', 'Tools', 'Sports', 'Books', 'Clothing', 'Other'];

    useEffect(() => {
        fetchItems();
    }, [currentPage, searchTerm, selectedCategory]);

    useEffect(() => {
        if (showSearch && searchRef.current) {
            searchRef.current.focus();
        }
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
            const data = await getAdminItems(currentPage, 20, searchTerm, selectedCategory);
            setItems(data.items);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [itemId]: true }));
            await deleteAdminItem(itemId);
            fetchItems();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleEditItem = async (itemId) => {
        try {
            setActionLoading(prev => ({ ...prev, [itemId]: true }));
            const itemDetails = await getItemDetails(itemId);
            setEditingItem(itemDetails.item);
            setShowEditModal(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleToggleFeatured = async (itemId) => {
        try {
            setActionLoading(prev => ({ ...prev, [itemId]: true }));
            await toggleItemFeatured(itemId);
            fetchItems();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleStatusChange = async (itemId, status, rejectionReason = '') => {
        try {
            setActionLoading(prev => ({ ...prev, [itemId]: true }));
            await updateItemStatus(itemId, status, rejectionReason);
            fetchItems();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedItems.length === 0) {
            alert('Please select items first');
            return;
        }

        let confirmMessage = `Are you sure you want to ${action} ${selectedItems.length} selected items?`;
        if (action === 'delete') {
            confirmMessage = `Are you sure you want to delete ${selectedItems.length} selected items? This action cannot be undone.`;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setLoading(true);
            let data = {};
            if (action === 'reject') {
                const reason = prompt('Enter rejection reason:');
                if (!reason) return;
                data.rejectionReason = reason;
            }

            await bulkItemOperation(action, selectedItems, data);
            setSelectedItems([]);
            fetchItems();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item._id));
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1);
    };

    const renderGridView = () => (
        <div className="items-grid">
            {items.map(item => (
                <div key={item._id} className={`item-card ${selectedItems.includes(item._id) ? 'selected' : ''}`}>
                    <div className="item-select">
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                        />
                    </div>
                    <div className="item-image">
                        {item.imageUrl ? (
                            <img src={`http://localhost:5000${item.imageUrl}`} alt={item.title} />
                        ) : (
                            <div className="no-image">No Image</div>
                        )}
                        <div className="item-badges">
                            {item.isFeatured && <span className="badge featured">Featured</span>}
                            <span className={`badge status-${item.status || 'approved'}`}>
                                {(item.status || 'approved').charAt(0).toUpperCase() + (item.status || 'approved').slice(1)}
                            </span>
                        </div>
                    </div>
                    <div className="item-details">
                        <h3>{item.title}</h3>
                        <p className="item-description">{item.description}</p>
                        <div className="item-meta">
                            <span className="item-price">${item.price}/day</span>
                            <span className="item-category">{item.category}</span>
                        </div>
                        <div className="item-owner">
                            Owner: {item.owner?.username} ({item.owner?.email})
                        </div>
                        <div className="item-date">
                            Listed: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        <div className="item-stats">
                            <span>Views: {item.viewCount || 0}</span>
                            {item.reportCount > 0 && <span className="reports">Reports: {item.reportCount}</span>}
                        </div>
                        <div className="item-actions">
                            <button
                                onClick={() => handleEditItem(item._id)}
                                disabled={actionLoading[item._id]}
                                className="action-btn edit"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleToggleFeatured(item._id)}
                                disabled={actionLoading[item._id]}
                                className={`action-btn ${item.isFeatured ? 'unfeature' : 'feature'}`}
                            >
                                {item.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>
                            {(item.status === 'pending' || item.status === 'rejected') && (
                                <button
                                    onClick={() => handleStatusChange(item._id, 'approved')}
                                    disabled={actionLoading[item._id]}
                                    className="action-btn approve"
                                >
                                    Approve
                                </button>
                            )}
                            {item.status !== 'rejected' && (
                                <button
                                    onClick={() => {
                                        const reason = prompt('Enter rejection reason:');
                                        if (reason) handleStatusChange(item._id, 'rejected', reason);
                                    }}
                                    disabled={actionLoading[item._id]}
                                    className="action-btn reject"
                                >
                                    Reject
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteItem(item._id)}
                                disabled={actionLoading[item._id]}
                                className="action-btn delete"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading) return <div className="admin-loading">Loading items...</div>;

    return (
        <div className="item-management">
            <div className="management-header">
                <div className="header-left">
                    <h1>Item Management</h1>
                    <div className="item-count">
                        {items.length} items {selectedItems.length > 0 && `(${selectedItems.length} selected)`}
                    </div>
                </div>
                <div className="header-right">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="create-btn"
                    >
                        + Add Item
                    </button>
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                        >
                            Table
                        </button>
                    </div>
                </div>
            </div>

            <div className="controls-bar">
                <div className="filters-container">
                    <div className="search-container">
                        {showSearch ? (
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input active"
                                onBlur={() => !searchTerm && setShowSearch(false)}
                            />
                        ) : (
                            <button
                                onClick={() => setShowSearch(true)}
                                className="search-btn"
                            >
                                🔍 Search
                            </button>
                        )}
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="category-filter"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {selectedItems.length > 0 && (
                    <div className="bulk-actions">
                        <span className="bulk-label">Bulk Actions:</span>
                        <button onClick={() => handleBulkAction('approve')} className="bulk-btn approve">
                            Approve ({selectedItems.length})
                        </button>
                        <button onClick={() => handleBulkAction('reject')} className="bulk-btn reject">
                            Reject ({selectedItems.length})
                        </button>
                        <button onClick={() => handleBulkAction('feature')} className="bulk-btn feature">
                            Feature ({selectedItems.length})
                        </button>
                        <button onClick={() => handleBulkAction('delete')} className="bulk-btn delete">
                            Delete ({selectedItems.length})
                        </button>
                    </div>
                )}

                <div className="select-actions">
                    <button onClick={handleSelectAll} className="select-all-btn">
                        {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}

            {renderGridView()}

            {items.length === 0 && !loading && (
                <div className="no-items">
                    <div className="no-items-icon">📦</div>
                    <h3>No items found</h3>
                    <p>No items match your current filters.</p>
                    <button onClick={() => setShowCreateModal(true)} className="create-first-btn">
                        Create First Item
                    </button>
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        ← Previous
                    </button>
                    <div className="pagination-info">
                        <span>Page {currentPage} of {totalPages}</span>
                        <span className="total-items">({items.length} items)</span>
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next →
                    </button>
                </div>
            )}

            {showEditModal && editingItem && (
                <ItemEditModal
                    item={editingItem}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
                    }}
                    onSave={() => {
                        fetchItems();
                        setShowEditModal(false);
                        setEditingItem(null);
                    }}
                />
            )}

            {showCreateModal && (
                <ItemCreateModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={() => {
                        fetchItems();
                        setShowCreateModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ItemManagement;
