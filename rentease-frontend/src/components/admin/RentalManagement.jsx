import React, { useState, useEffect } from 'react';
import { getAdminRentals } from '../../services/adminApi';
import './RentalManagement.css';

const RentalManagement = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchRentals();
    }, [currentPage, statusFilter]);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const data = await getAdminRentals(currentPage, 10, statusFilter);
            setRentals(data.rentals);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const getStatusBadgeClass = (status) => {
        return status === 'active' ? 'status-active' : 'status-returned';
    };

    if (loading) return <div className="admin-loading">Loading rentals...</div>;

    return (
        <div className="rental-management">
            <div className="management-header">
                <h1>Rental Management</h1>
                <div className="filters-container">
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="status-filter"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="returned">Returned</option>
                    </select>
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="rentals-table-container">
                <table className="rentals-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Renter</th>
                            <th>Owner</th>
                            <th>Rental Date</th>
                            <th>Return Date</th>
                            <th>Total Cost</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals.map(rental => (
                            <tr key={rental._id}>
                                <td>
                                    <div className="item-info">
                                        <div className="item-title">{rental.itemId?.title || 'Item not found'}</div>
                                        <div className="item-price">${rental.itemId?.price}/day</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="user-info">
                                        <div>{rental.renterId?.username}</div>
                                        <div className="user-email">{rental.renterId?.email}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="user-info">
                                        <div>{rental.ownerId?.username}</div>
                                        <div className="user-email">{rental.ownerId?.email}</div>
                                    </div>
                                </td>
                                <td>{new Date(rental.rentalDate).toLocaleDateString()}</td>
                                <td>
                                    {rental.returnDate 
                                        ? new Date(rental.returnDate).toLocaleDateString()
                                        : 'Not returned'
                                    }
                                </td>
                                <td>${rental.totalCost}</td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(rental.status)}`}>
                                        {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rentals.length === 0 && !loading && (
                <div className="no-rentals">No rentals found matching your criteria.</div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default RentalManagement;
