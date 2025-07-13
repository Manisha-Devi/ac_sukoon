
import React, { useState, useEffect } from "react";
import "../css/DataSummary.css";
import authService from "../../services/authService.js";

function DataSummary({ fareData, expenseData, currentUser }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingData, setPendingData] = useState([]);
  const [waitingData, setWaitingData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState([]);

  // Log user data for debugging
  useEffect(() => {
    console.log('🔍 DataSummary - User from props:', currentUser);
    console.log('🔑 DataSummary - User role:', currentUser?.role);
    console.log('🔑 DataSummary - User type:', currentUser?.userType);
  }, [currentUser]);

  // Process data whenever fareData or expenseData changes
  useEffect(() => {
    processAllData();
  }, [fareData, expenseData]);

  const processAllData = () => {
    try {
      setLoading(true);
      let allEntries = [];

      // Process Fare Data
      if (fareData && fareData.length > 0) {
        fareData.forEach(entry => {
          let dataType = '';
          let displayName = '';
          let description = '';

          if (entry.type === 'daily') {
            dataType = 'Fare Receipt';
            displayName = `Fare: ${entry.route || 'Daily Collection'}`;
            description = entry.route;
          } else if (entry.type === 'booking') {
            dataType = 'Booking Entry';
            displayName = `Booking: ${entry.bookingDetails || 'Booking Entry'}`;
            description = entry.bookingDetails;
          } else if (entry.type === 'off') {
            dataType = 'Off Day';
            displayName = `Off Day: ${entry.reason || 'Off Day Request'}`;
            description = entry.reason;
          }

          allEntries.push({
            ...entry,
            dataType: dataType,
            entryStatus: entry.entryStatus || 'pending',
            displayName: displayName,
            description: description
          });
        });
      }

      // Process Expense Data
      if (expenseData && expenseData.length > 0) {
        expenseData.forEach(entry => {
          let dataType = '';
          let displayName = '';
          let description = '';

          switch(entry.type) {
            case 'fuel':
              dataType = 'Fuel Payment';
              displayName = `Fuel: ${entry.pumpName || 'Fuel Station'}`;
              description = entry.pumpName || 'Fuel payment';
              break;
            case 'adda':
              dataType = 'Adda Payment';
              displayName = `Adda: ${entry.addaName || entry.description || 'Adda Fees'}`;
              description = entry.addaName || entry.description || 'Adda payment';
              break;
            case 'service':
              dataType = 'Service Payment';
              displayName = `Service: ${entry.serviceType || entry.serviceDetails || 'Service'}`;
              description = entry.serviceDetails || entry.serviceType || 'Service payment';
              break;
            case 'union':
              dataType = 'Union Payment';
              displayName = `Union: ${entry.unionName || entry.description || 'Union Fees'}`;
              description = entry.unionName || entry.description || 'Union payment';
              break;
            case 'other':
              dataType = 'Other Payment';
              displayName = `Other: ${entry.paymentType || entry.paymentDetails || 'Other Payment'}`;
              description = entry.paymentDetails || entry.paymentType || 'Other payment';
              break;
            default:
              dataType = 'Payment';
              displayName = `Payment: ${entry.description || 'Payment Entry'}`;
              description = entry.description || 'Payment';
          }

          allEntries.push({
            ...entry,
            dataType: dataType,
            entryStatus: entry.entryStatus || 'pending',
            displayName: displayName,
            description: description
          });
        });
      }

      // Sort by timestamp (newest first)
      allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Separate by status
      setPendingData(allEntries.filter(entry => entry.entryStatus === 'pending'));
      setWaitingData(allEntries.filter(entry => 
        entry.entryStatus === 'waiting' || 
        entry.entryStatus === 'forwardedBank' || 
        entry.entryStatus === 'forwardedCash'
      ));
      setApprovedData(allEntries.filter(entry => 
        entry.entryStatus === 'approved' || 
        entry.entryStatus === 'approvedCash' || 
        entry.entryStatus === 'approvedBank' ||
        entry.entryStatus === 'cashApproved' ||
        entry.entryStatus === 'bankApproved'
      ));

      setLoading(false);
    } catch (error) {
      console.error('Error processing data:', error);
      setLoading(false);
    }
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'pending': return pendingData;
      case 'waiting': return waitingData;
      case 'approved': return approvedData;
      default: return pendingData;
    }
  };

  // Handle checkbox selection
  const handleEntrySelection = (entryId, isSelected) => {
    if (isSelected) {
      setSelectedEntries(prev => [...prev, entryId]);
    } else {
      setSelectedEntries(prev => prev.filter(id => id !== entryId));
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (isSelected) => {
    const currentData = getCurrentTabData();
    if (isSelected) {
      setSelectedEntries(currentData.map(entry => entry.entryId));
    } else {
      setSelectedEntries([]);
    }
  };

  // Helper function to format date for display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateStr;
    }
  };

  // Helper function to format time for display
  const formatDisplayTime = (timestampStr) => {
    if (!timestampStr) return '';

    try {
      const date = new Date(timestampStr);
      if (isNaN(date.getTime())) return timestampStr;

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timestampStr;
    }
  };

  // Get user role from different possible fields
  const userRole = currentUser?.role || currentUser?.userType;

  // Show loading while checking user data
  if (!currentUser || Object.keys(currentUser).length === 0) {
    return (
      <div className="data-approval-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  // Check user permission
  if (userRole !== 'Manager' && userRole !== 'Admin') {
    return (
      <div className="data-approval-container">
        <div className="container-fluid">
          <div className="alert alert-warning text-center" role="alert">
            <h4><i className="bi bi-exclamation-triangle"></i> Access Denied</h4>
            <p>You don't have permission to access this page.</p>
            <p>Only <strong>Manager</strong> and <strong>Admin</strong> can view the Data Summary.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="data-approval-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Processing data...</p>
        </div>
      </div>
    );
  }

  const currentData = getCurrentTabData();

  return (
    <div className="data-approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <h2><i className="bi bi-clipboard-check"></i> Data Summary</h2>
          <p>Review and approve submitted entries</p>
        </div>

        {/* Approval Tabs */}
        <div className="approval-tabs">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="bi bi-clock"></i>
            Pending ({pendingData.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'waiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('waiting')}
          >
            <i className="bi bi-hourglass-split"></i>
            Waiting ({waitingData.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            <i className="bi bi-check-circle"></i>
            Approved ({approvedData.length})
          </button>
        </div>

        {/* Selection Controls */}
        {activeTab !== 'approved' && currentData.length > 0 && (
          <div className="selection-controls">
            <div className="select-all-container">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedEntries.length === currentData.length && currentData.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <label htmlFor="selectAll">
                Select All ({selectedEntries.length}/{currentData.length})
              </label>
            </div>
            
            {selectedEntries.length > 0 && (
              <button className="btn approve-btn">
                <i className="bi bi-check-circle"></i>
                Approve Selected ({selectedEntries.length})
              </button>
            )}
          </div>
        )}

        {/* Data Entries */}
        <div className="tab-content">
          {currentData.length === 0 ? (
            <div className="no-data">
              <i className="bi bi-inbox"></i>
              <p>No {activeTab} entries found</p>
            </div>
          ) : (
            <div className="recent-entries-grid">
              {currentData.map(entry => (
                <div
                  key={entry.entryId}
                  className={`recent-entry-card ${selectedEntries.includes(entry.entryId) ? 'selected' : ''}`}
                  onClick={() => {
                    if (activeTab !== 'approved') {
                      handleEntrySelection(entry.entryId, !selectedEntries.includes(entry.entryId));
                    }
                  }}
                >
                  {activeTab !== 'approved' && (
                    <div className="entry-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.entryId)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleEntrySelection(entry.entryId, e.target.checked);
                        }}
                      />
                    </div>
                  )}

                  <div className="entry-content">
                    <div className="entry-header">
                      <span className="entry-type-badge">
                        {entry.dataType}
                      </span>
                      <span className="entry-status-badge" data-status={entry.entryStatus}>
                        {entry.entryStatus === 'pending' && 'PENDING'}
                        {entry.entryStatus === 'waiting' && 'WAITING'}
                        {entry.entryStatus === 'forwardedBank' && 'FORWARDED TO BANK'}
                        {entry.entryStatus === 'forwardedCash' && 'FORWARDED TO CASH'}
                        {(entry.entryStatus === 'approved' || entry.entryStatus === 'approvedCash' || entry.entryStatus === 'approvedBank') && 'APPROVED'}
                      </span>
                    </div>

                    <div className="entry-details">
                      <div className="entry-row">
                        <span className="label">Entry ID:</span>
                        <span className="value">{entry.entryId}</span>
                      </div>
                      
                      <div className="entry-row">
                        <span className="label">Date:</span>
                        <span className="value">
                          {entry.entryType === 'booking' && entry.dateFrom ? 
                            formatDisplayDate(entry.dateFrom) : 
                            formatDisplayDate(entry.date)
                          }
                        </span>
                      </div>

                      <div className="entry-row">
                        <span className="label">Description:</span>
                        <span className="value">{entry.displayName}</span>
                      </div>

                      <div className="entry-row">
                        <span className="label">Amount:</span>
                        <span className="value">₹{(entry.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="entry-row">
                        <span className="label">Submitted By:</span>
                        <span className="value">{entry.submittedBy}</span>
                      </div>

                      <div className="entry-row">
                        <span className="label">Time:</span>
                        <span className="value">{formatDisplayTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataSummary;
