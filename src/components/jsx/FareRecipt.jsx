
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../css/FareRecipt.css';
import localStorageService from '../../services/localStorageService';
import hybridDataService from '../../services/hybridDataService';

const FareRecipt = () => {
  // State management
  const [fareData, setFareData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    route: '',
    cashAmount: '',
    bankAmount: '',
    bookingDetails: '',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    reason: ''
  });
  
  const [selectedEntryType, setSelectedEntryType] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
    
    // Listen for network status changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync status changes
    const handleSyncStatusChange = (event) => {
      setIsSyncing(event.detail.syncing);
    };

    window.addEventListener('syncStatusChanged', handleSyncStatusChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncStatusChanged', handleSyncStatusChange);
    };
  }, []);

  // Load initial data from localStorage and sync with Google Sheets
  const loadInitialData = async () => {
    try {
      console.log('🔄 Loading initial data...');
      
      // Load from localStorage first for instant display
      const localData = localStorageService.loadFareData();
      setFareData(localData);
      
      // Calculate total earnings
      const total = localData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
      setTotalEarnings(total);
      
      // Background sync with Google Sheets
      if (navigator.onLine) {
        console.log('🌐 Syncing with Google Sheets...');
        const result = await hybridDataService.syncFromGoogleSheets();
        if (result.success && result.data) {
          setFareData(result.data);
          const syncedTotal = result.data.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
          setTotalEarnings(syncedTotal);
        }
      }
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    const cash = parseFloat(formData.cashAmount) || 0;
    const bank = parseFloat(formData.bankAmount) || 0;
    return cash + bank;
  }, [formData.cashAmount, formData.bankAmount]);

  // Add new entry
  const handleAddEntry = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'driver';

      let entryData = {
        submittedBy,
        timestamp: new Date().toISOString(),
        entryId: `${selectedEntryType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      if (selectedEntryType === 'daily') {
        entryData = {
          ...entryData,
          date: formData.date,
          route: formData.route,
          cashAmount: parseFloat(formData.cashAmount) || 0,
          bankAmount: parseFloat(formData.bankAmount) || 0,
          totalAmount: totalAmount,
          type: 'daily'
        };

        const result = await hybridDataService.addFareEntry(entryData);
        if (result.success) {
          // UI instantly updated with localStorage data
          setFareData(result.data);
          setTotalEarnings((prev) => prev + totalAmount);
          
          // Force immediate re-render by triggering parent state updates
          const updatedData = result.data;
          
          // Trigger immediate UI refresh for all components
          setTimeout(() => {
            const event = new CustomEvent('fareDataUpdated', { detail: updatedData });
            window.dispatchEvent(event);
          }, 0);
          
          console.log('✅ Daily entry added instantly - UI updated!');
        }
      }
      
      if (selectedEntryType === 'booking') {
        entryData = {
          ...entryData,
          bookingDetails: formData.bookingDetails,
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo,
          cashAmount: parseFloat(formData.cashAmount) || 0,
          bankAmount: parseFloat(formData.bankAmount) || 0,
          totalAmount: totalAmount,
          type: 'booking'
        };

        const result = await hybridDataService.addFareEntry(entryData);
        if (result.success) {
          // UI instantly updated with localStorage data
          setFareData(result.data);
          setTotalEarnings((prev) => prev + totalAmount);
          
          // Force immediate re-render by triggering parent state updates
          const updatedData = result.data;
          
          // Trigger immediate UI refresh for all components
          setTimeout(() => {
            const event = new CustomEvent('fareDataUpdated', { detail: updatedData });
            window.dispatchEvent(event);
          }, 0);
          
          console.log('✅ Booking entry added instantly - UI updated!');
        }
      }
      
      if (selectedEntryType === 'off') {
        entryData = {
          ...entryData,
          date: formData.date,
          reason: formData.reason,
          type: 'off'
        };

        const result = await hybridDataService.addFareEntry(entryData);
        if (result.success) {
          // UI instantly updated with localStorage data
          setFareData(result.data);
          
          // Force immediate re-render by triggering parent state updates
          const updatedData = result.data;
          
          // Trigger immediate UI refresh for all components
          setTimeout(() => {
            const event = new CustomEvent('fareDataUpdated', { detail: updatedData });
            window.dispatchEvent(event);
          }, 0);
          
          console.log('✅ Off day entry added instantly - UI updated!');
        }
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        route: '',
        cashAmount: '',
        bankAmount: '',
        bookingDetails: '',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        reason: ''
      });
      setShowForm(false);

    } catch (error) {
      console.error('❌ Error adding entry:', error);
      alert('Error adding entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId, entryType) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const result = await hybridDataService.deleteFareEntry(entryId, entryType);
      if (result.success) {
        setFareData(result.data);
        
        // Trigger immediate UI refresh for all components
        setTimeout(() => {
          const event = new CustomEvent('fareDataUpdated', { detail: result.data });
          window.dispatchEvent(event);
        }, 0);
        
        console.log('✅ Entry deleted instantly - UI updated!');
      }
    } catch (error) {
      console.error('❌ Error deleting entry:', error);
      alert('Error deleting entry. Please try again.');
    }
  };

  // Update entry
  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      setIsLoading(true);
      
      let updatedData = {};
      
      if (editingEntry.type === 'daily') {
        updatedData = {
          date: formData.date,
          route: formData.route,
          cashAmount: parseFloat(formData.cashAmount) || 0,
          bankAmount: parseFloat(formData.bankAmount) || 0,
          totalAmount: totalAmount
        };
      } else if (editingEntry.type === 'booking') {
        updatedData = {
          bookingDetails: formData.bookingDetails,
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo,
          cashAmount: parseFloat(formData.cashAmount) || 0,
          bankAmount: parseFloat(formData.bankAmount) || 0,
          totalAmount: totalAmount
        };
      } else if (editingEntry.type === 'off') {
        updatedData = {
          date: formData.date,
          reason: formData.reason
        };
      }

      const result = await hybridDataService.updateFareEntry(editingEntry.entryId, updatedData, editingEntry.type);
      
      if (result.success) {
        setFareData(result.data);
        
        // Trigger immediate UI refresh for all components
        setTimeout(() => {
          const event = new CustomEvent('fareDataUpdated', { detail: result.data });
          window.dispatchEvent(event);
        }, 0);
        
        setEditingEntry(null);
        setShowForm(false);
        console.log('✅ Entry updated instantly - UI updated!');
      }
    } catch (error) {
      console.error('❌ Error updating entry:', error);
      alert('Error updating entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing an entry
  const startEditing = (entry) => {
    setEditingEntry(entry);
    
    if (entry.type === 'daily') {
      setFormData({
        date: entry.date,
        route: entry.route,
        cashAmount: entry.cashAmount?.toString() || '',
        bankAmount: entry.bankAmount?.toString() || '',
        bookingDetails: '',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        reason: ''
      });
      setSelectedEntryType('daily');
    } else if (entry.type === 'booking') {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        route: '',
        cashAmount: entry.cashAmount?.toString() || '',
        bankAmount: entry.bankAmount?.toString() || '',
        bookingDetails: entry.bookingDetails || '',
        dateFrom: entry.dateFrom,
        dateTo: entry.dateTo,
        reason: ''
      });
      setSelectedEntryType('booking');
    } else if (entry.type === 'off') {
      setFormData({
        date: entry.date,
        route: '',
        cashAmount: '',
        bankAmount: '',
        bookingDetails: '',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        reason: entry.reason || ''
      });
      setSelectedEntryType('off');
    }
    
    setShowForm(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEntry(null);
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      route: '',
      cashAmount: '',
      bankAmount: '',
      bookingDetails: '',
      dateFrom: new Date().toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      reason: ''
    });
  };

  // Get current user entries
  const getCurrentUserEntries = useCallback(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;
    
    return fareData.filter(entry => 
      entry.submittedBy === currentUserName || 
      entry.submittedBy === 'driver' || 
      !entry.submittedBy
    );
  }, [fareData]);

  const userEntries = getCurrentUserEntries();

  return (
    <div className="fare-entry-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="fare-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-receipt"></i> Fare Entry Management</h2>
              <p className="text-muted">Manage daily fares, bookings, and off days</p>
            </div>
            <div className="sync-status">
              <div className={`simple-sync-indicator ${isSyncing ? 'syncing' : 'synced'}`}>
                <i className={`bi ${isSyncing ? 'bi-arrow-repeat' : isOnline ? 'bi-check-circle-fill' : 'bi-wifi-off'}`}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons mb-4">
          <button 
            className="btn btn-primary me-2"
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle"></i> Add New Entry
          </button>
        </div>

        {/* Entry Form */}
        {showForm && (
          <div className="entry-form-card mb-4">
            <div className="card">
              <div className="card-header">
                <h5>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h5>
              </div>
              <div className="card-body">
                {/* Entry Type Selection */}
                {!editingEntry && (
                  <div className="mb-3">
                    <label className="form-label">Entry Type</label>
                    <div className="btn-group w-100" role="group">
                      <input 
                        type="radio" 
                        className="btn-check" 
                        name="entryType" 
                        id="daily" 
                        value="daily"
                        checked={selectedEntryType === 'daily'}
                        onChange={(e) => setSelectedEntryType(e.target.value)}
                      />
                      <label className="btn btn-outline-primary" htmlFor="daily">Daily Fare</label>

                      <input 
                        type="radio" 
                        className="btn-check" 
                        name="entryType" 
                        id="booking" 
                        value="booking"
                        checked={selectedEntryType === 'booking'}
                        onChange={(e) => setSelectedEntryType(e.target.value)}
                      />
                      <label className="btn btn-outline-primary" htmlFor="booking">Booking</label>

                      <input 
                        type="radio" 
                        className="btn-check" 
                        name="entryType" 
                        id="off" 
                        value="off"
                        checked={selectedEntryType === 'off'}
                        onChange={(e) => setSelectedEntryType(e.target.value)}
                      />
                      <label className="btn btn-outline-primary" htmlFor="off">Off Day</label>
                    </div>
                  </div>
                )}

                <form onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}>
                  {/* Daily Fare Fields */}
                  {selectedEntryType === 'daily' && (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Route</label>
                          <input
                            type="text"
                            className="form-control"
                            name="route"
                            value={formData.route}
                            onChange={handleInputChange}
                            placeholder="e.g., Ghuraka to Bhaderwah"
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Cash Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            name="cashAmount"
                            value={formData.cashAmount}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Bank Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            name="bankAmount"
                            value={formData.bankAmount}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Total Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            value={totalAmount}
                            readOnly
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Booking Fields */}
                  {selectedEntryType === 'booking' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Booking Details</label>
                        <textarea
                          className="form-control"
                          name="bookingDetails"
                          value={formData.bookingDetails}
                          onChange={handleInputChange}
                          placeholder="Enter booking details"
                          rows="3"
                          required
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">From Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="dateFrom"
                            value={formData.dateFrom}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">To Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="dateTo"
                            value={formData.dateTo}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Cash Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            name="cashAmount"
                            value={formData.cashAmount}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Bank Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            name="bankAmount"
                            value={formData.bankAmount}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Total Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            value={totalAmount}
                            readOnly
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Off Day Fields */}
                  {selectedEntryType === 'off' && (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Reason</label>
                          <input
                            type="text"
                            className="form-control"
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            placeholder="Reason for off day"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Form Actions */}
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {editingEntry ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        editingEntry ? 'Update Entry' : 'Add Entry'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="entries-list">
          <div className="card">
            <div className="card-header">
              <h5>Recent Entries ({userEntries.length})</h5>
            </div>
            <div className="card-body">
              {userEntries.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="text-muted mt-2">No entries found. Add your first entry!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Details</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userEntries.slice().reverse().map((entry) => (
                        <tr key={entry.entryId || entry.id}>
                          <td>
                            <span className={`badge ${
                              entry.type === 'daily' ? 'bg-primary' : 
                              entry.type === 'booking' ? 'bg-success' : 'bg-warning'
                            }`}>
                              {entry.type === 'daily' ? 'Daily' : 
                               entry.type === 'booking' ? 'Booking' : 'Off Day'}
                            </span>
                          </td>
                          <td>
                            {entry.type === 'booking' 
                              ? `${entry.dateFrom} to ${entry.dateTo}`
                              : entry.date
                            }
                          </td>
                          <td>
                            {entry.type === 'daily' && entry.route}
                            {entry.type === 'booking' && (
                              <span title={entry.bookingDetails}>
                                {entry.bookingDetails?.substring(0, 50)}
                                {entry.bookingDetails?.length > 50 ? '...' : ''}
                              </span>
                            )}
                            {entry.type === 'off' && entry.reason}
                          </td>
                          <td>
                            {entry.type !== 'off' ? `₹${entry.totalAmount || 0}` : '-'}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => startEditing(entry)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteEntry(entry.entryId, entry.type)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareRecipt;
