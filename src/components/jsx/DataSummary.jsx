import React, { useState, useEffect } from "react";
import "../css/DataSummary.css";
import authService from "../../services/authService.js";

function DataSummary({ fareData, expenseData, currentUser }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingData, setPendingData] = useState([]);
  const [bankApprovalData, setBankApprovalData] = useState([]);
  const [cashApprovalData, setCashApprovalData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
          // Include all entries including off days
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

      // Separate by status with correct filtering
      setPendingData(allEntries.filter(entry => entry.entryStatus === 'pending'));
      setBankApprovalData(allEntries.filter(entry => entry.entryStatus === 'forwardedBank'));
      setCashApprovalData(allEntries.filter(entry => entry.entryStatus === 'forwardedCash'));
      setApprovedData(allEntries.filter(entry => 
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

  // Get current tab data with date filtering
  const getCurrentTabData = () => {
    let data = [];
    
    switch (activeTab) {
      case 'pending': 
        data = pendingData;
        break;
      case 'bankApproval': 
        data = bankApprovalData;
        break;
      case 'cashApproval': 
        data = cashApprovalData;
        break;
      case 'approved': 
        data = approvedData;
        break;
      case 'all':
      default: 
        data = [...pendingData, ...bankApprovalData, ...cashApprovalData, ...approvedData];
        break;
    }

    // Apply date filter if dates are selected
    if (dateFrom && dateTo) {
      data = data.filter(entry => {
        const entryDate = entry.entryType === 'booking' && entry.dateFrom ? 
                         new Date(entry.dateFrom) : 
                         new Date(entry.date);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }

    return data;
  };

  // Handle entry selection
  const handleEntrySelect = (entryId) => {
    setSelectedEntries(prev => {
      if (prev.includes(entryId)) {
        return prev.filter(id => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    const currentData = getCurrentTabData();
    const currentIds = currentData.map(entry => entry.entryId);

    if (selectedEntries.length === currentIds.length && currentIds.length > 0) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(currentIds);
    }
  };

  // Check if all entries in current tab are selected
  const isAllSelected = () => {
    const currentData = getCurrentTabData();
    const currentIds = currentData.map(entry => entry.entryId);
    return currentIds.length > 0 && currentIds.every(id => selectedEntries.includes(id));
  };

  // Handle approval action
  const handleApproval = async () => {
    if (selectedEntries.length === 0) {
      alert('Please select entries to approve');
      return;
    }

    try {
      const approverName = currentUser?.fullName || currentUser?.username;
      let newStatus = '';

      // Determine new status based on current tab and proper flow
      switch (activeTab) {
        case 'pending':
          newStatus = 'approved'; // Direct approval from pending
          break;
        case 'bankApproval':
          newStatus = 'approvedBank'; // forwardedBank -> approvedBank
          break;
        case 'cashApproval':
          newStatus = 'approvedCash'; // forwardedCash -> approvedCash
          break;
        case 'approved':
          newStatus = 'approved'; // Final approval (approvedCash/approvedBank -> approved)
          break;
        default:
          throw new Error('Invalid tab for approval');
      }

      // First update local UI state immediately
      const updatedEntryIds = [...selectedEntries];

      // Update local state for immediate UI feedback
      const updateLocalData = (dataArray) => {
        return dataArray.map(entry => {
          if (updatedEntryIds.includes(entry.entryId)) {
            return {
              ...entry,
              entryStatus: newStatus,
              approvedBy: approverName
            };
          }
          return entry;
        });
      };

      // Update all local data states immediately
      setPendingData(prev => updateLocalData(prev));
      setBankApprovalData(prev => updateLocalData(prev));
      setCashApprovalData(prev => updateLocalData(prev));
      setApprovedData(prev => updateLocalData(prev));

      // Clear selection immediately
      setSelectedEntries([]);

      // Show immediate success feedback
      alert(`${updatedEntryIds.length} entries approved successfully`);

      // Then sync to Google Sheets in background
      const syncPromises = updatedEntryIds.map(async (entryId) => {
        // Find entry from all data sources, not just current tab
        let entry = null;

        // Search in all data arrays
        const allData = [...pendingData, ...bankApprovalData, ...cashApprovalData, ...approvedData];
        entry = allData.find(e => e.entryId === entryId);

        if (!entry) {
          console.error(`Entry ${entryId} not found in any data source`);
          return;
        }

        console.log(`🔄 Syncing entry ${entryId} to Google Sheets:`, entry);

        // Call appropriate status update function
        let result;
        try {
          switch (entry.dataType) {
            case 'Fare Receipt':
              result = await authService.updateFareReceiptStatus(entryId, newStatus, approverName);
              break;
            case 'Booking Entry':
              result = await authService.updateBookingEntryStatus(entryId, newStatus, approverName);
              break;
            case 'Off Day':
              result = await authService.updateOffDayStatus(entryId, newStatus, approverName);
              break;
            case 'Fuel Payment':
              result = await authService.updateFuelPaymentStatus(entryId, newStatus, approverName);
              break;
            case 'Adda Payment':
              result = await authService.updateAddaPaymentStatus(entryId, newStatus, approverName);
              break;
            case 'Union Payment':
              result = await authService.updateUnionPaymentStatus(entryId, newStatus, approverName);
              break;
            case 'Service Payment':
              result = await authService.updateServicePaymentStatus(entryId, newStatus, approverName);
              break;
            case 'Other Payment':
              result = await authService.updateOtherPaymentStatus(entryId, newStatus, approverName);
              break;
            default:
              console.error(`Unsupported data type: ${entry.dataType}`);
              return { success: false, error: 'Unsupported data type' };
          }
        } catch (error) {
          console.error(`Error updating ${entry.dataType} status:`, error);
          result = { success: false, error: error.message };
        }

        if (!result || !result.success) {
          console.error(`❌ Failed to sync entry ${entryId} to Google Sheets:`, result?.error || 'Unknown error');
          return { success: false, error: result?.error || 'Unknown error' };
        } else {
          console.log(`✅ Entry ${entryId} synced to Google Sheets successfully`);
        }

        // Update parent state after successful sync
        if (window.updateEntryStatusInParent) {
          window.updateEntryStatusInParent(entryId, newStatus, entry.type || entry.entryType);
        }

        // Also update parent component states directly
        if (result.success && typeof window.updateExpenseDataState === 'function') {
          window.updateExpenseDataState(entryId, newStatus, approverName);
        }
        if (result.success && typeof window.updateFareDataState === 'function') {
          window.updateFareDataState(entryId, newStatus, approverName);
        }
      });

      // Wait for all syncs to complete in background
      Promise.all(syncPromises).then(() => {
        console.log('✅ All entries synced to Google Sheets');
        // Refresh local data after sync
        processAllData();
      }).catch((error) => {
        console.error('❌ Some entries failed to sync to Google Sheets:', error);
        // Still refresh local data to show any partial updates
        processAllData();
      });

    } catch (error) {
      console.error('Error approving entries:', error);
      alert('Error approving entries: ' + error.message);
    }
  };

  // Helper function to format date for display - consistent format
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      // Always show in "07 Sept 2025" format for consistency
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateStr;
    }
  };

  // Helper function to format time for display - simple format
  const formatDisplayTime = (timestampStr) => {
    if (!timestampStr) return '';

    try {
      const date = new Date(timestampStr);
      if (isNaN(date.getTime())) return timestampStr;

      // Simple time format - HH:MM AM/PM
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timestampStr;
    }
  };

  // Render entry card
  const renderEntryCard = (entry) => {
    const isSelected = selectedEntries.includes(entry.entryId);

    return (
      <div 
        key={entry.entryId} 
        className={`recent-entry-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleEntrySelect(entry.entryId)}
      >
        <div className="entry-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleEntrySelect(entry.entryId)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="entry-content">
          <div className="entry-header">
            <div className="entry-type-badge">
              {entry.dataType}
            </div>
            <div className="entry-status-badge" data-status={entry.entryStatus}>
              {entry.entryStatus === 'pending' && (
                <>
                  <i className="bi bi-clock me-1"></i>
                  PENDING
                </>
              )}
              {entry.entryStatus === 'forwardedBank' && (
                <>
                  <i className="bi bi-bank me-1"></i>
                  FORWARDED TO BANK
                </>
              )}
              {entry.entryStatus === 'forwardedCash' && (
                <>
                  <i className="bi bi-cash-stack me-1"></i>
                  FORWARDED TO CASH
                </>
              )}
              {(entry.entryStatus === 'approvedCash' || entry.entryStatus === 'cashApproved') && (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  CASH APPROVED
                </>
              )}
              {(entry.entryStatus === 'approvedBank' || entry.entryStatus === 'bankApproved') && (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  BANK APPROVED
                </>
              )}
              {entry.entryStatus === 'approved' && (
                <>
                  <i className="bi bi-check-circle-fill me-1"></i>
                  FINAL APPROVED
                </>
              )}
            </div>
          </div>

          <div className="entry-details">
            <div className="entry-row">
              <span className="label">Entry ID:</span>
              <span className="value">{entry.entryId}</span>
            </div>
            <div className="entry-row">
              <span className="label">Submitted By:</span>
              <span className="value">{entry.submittedBy}</span>
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
              <span className="label">Total Amount:</span>
              <span className="value">₹{(entry.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="entry-row">
              <span className="label">Time:</span>
              <span className="value">{formatDisplayTime(entry.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    );
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

  // Check user permission after all hooks are executed
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
        <div className="cash-book-header">
          <h2><i className="bi bi-clipboard-check"></i> Data Summary</h2>
          <p>Review and approve submitted entries</p>

          {/* Toggle Buttons */}
          <div className="filter-toggle-section">
            <button 
              className="btn btn-outline-primary btn-sm filter-toggle-btn me-2"
              onClick={() => setShowFilter(!showFilter)}
            >
              <i className={`bi ${showFilter ? 'bi-eye-slash' : 'bi-funnel'}`}></i>
              {showFilter ? 'Hide Filter' : 'Show Filter'}
            </button>
            <button 
              className="btn btn-outline-info btn-sm filter-toggle-btn"
              onClick={() => setShowSummary(!showSummary)}
            >
              <i className={`bi ${showSummary ? 'bi-eye-slash' : 'bi-bar-chart'}`}></i>
              {showSummary ? 'Hide Summary' : 'Show Summary'}
            </button>
          </div>
        </div>

        {/* Date Filter */}
        {showFilter && (
          <div className="date-filter-section">
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Status Filter</label>
                <select 
                  className="form-control"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  <option value="all">All Entries</option>
                  <option value="pending">Pending</option>
                  <option value="bankApproval">Bank Approval</option>
                  <option value="cashApproval">Cash Approval</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {showSummary && (
          <div className="summary-cards-section">
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card pending-card">
                  <div className="card-body">
                    <h6><i className="bi bi-clock"></i> Pending</h6>
                    <h4>{pendingData.length}</h4>
                    <small>₹{pendingData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card bank-approval-card">
                  <div className="card-body">
                    <h6><i className="bi bi-bank"></i> Bank Approval</h6>
                    <h4>{bankApprovalData.length}</h4>
                    <small>₹{bankApprovalData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card cash-approval-card">
                  <div className="card-body">
                    <h6><i className="bi bi-cash-stack"></i> Cash Approval</h6>
                    <h4>{cashApprovalData.length}</h4>
                    <small>₹{cashApprovalData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card approved-card">
                  <div className="card-body">
                    <h6><i className="bi bi-check-circle"></i> Approved</h6>
                    <h4>{approvedData.length}</h4>
                    <small>₹{approvedData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="data-table-section">
          <div className="table-header">
            <h5>Data Entries</h5>
            {currentData.length > 0 && (
              <div className="selection-controls">
                <div className="select-all-container">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={isAllSelected()}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll">
                    Select All ({selectedEntries.length}/{currentData.length})
                  </label>
                </div>

                {selectedEntries.length > 0 && (
                  <button 
                    className="btn btn-success approve-btn"
                    onClick={handleApproval}
                  >
                    <i className="bi bi-check-circle"></i> 
                    Approve Selected ({selectedEntries.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {currentData.length === 0 ? (
            <div className="no-data">
              <i className="bi bi-inbox"></i>
              <p>No entries found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover data-entries-table">
                <thead>
                  <tr>
                    <th width="5%">Select</th>
                    <th width="15%">Entry ID</th>
                    <th width="15%">Date</th>
                    <th width="15%">Type</th>
                    <th width="20%">Description</th>
                    <th width="10%">Amount</th>
                    <th width="10%">Status</th>
                    <th width="10%">Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map(entry => (
                    <tr 
                      key={entry.entryId}
                      className={selectedEntries.includes(entry.entryId) ? 'table-primary' : ''}
                      onClick={() => handleEntrySelect(entry.entryId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedEntries.includes(entry.entryId)}
                          onChange={() => handleEntrySelect(entry.entryId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td><small>{entry.entryId}</small></td>
                      <td>
                        {entry.entryType === 'booking' && entry.dateFrom ? 
                          formatDisplayDate(entry.dateFrom) : 
                          formatDisplayDate(entry.date)
                        }
                      </td>
                      <td>
                        <span className="entry-type-badge">
                          {entry.dataType}
                        </span>
                      </td>
                      <td><small>{entry.displayName}</small></td>
                      <td>₹{(entry.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className="entry-status-badge" data-status={entry.entryStatus}>
                          {entry.entryStatus === 'pending' && 'PENDING'}
                          {entry.entryStatus === 'forwardedBank' && 'BANK APPROVAL'}
                          {entry.entryStatus === 'forwardedCash' && 'CASH APPROVAL'}
                          {(entry.entryStatus === 'approvedCash' || entry.entryStatus === 'cashApproved') && 'CASH APPROVED'}
                          {(entry.entryStatus === 'approvedBank' || entry.entryStatus === 'bankApproved') && 'BANK APPROVED'}
                          {entry.entryStatus === 'approved' && 'APPROVED'}
                        </span>
                      </td>
                      <td><small>{entry.submittedBy}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataSummary;