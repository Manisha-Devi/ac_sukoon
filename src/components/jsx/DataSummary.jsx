
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
          if (entry.type !== 'off') { // Exclude off days from approval
            allEntries.push({
              ...entry,
              dataType: entry.type === 'daily' ? 'Fare Receipt' : 'Booking Entry',
              entryStatus: entry.entryStatus || 'pending',
              displayName: entry.type === 'daily' ? 
                `Fare: ${entry.route || 'Daily Collection'}` : 
                `Booking: ${entry.bookingDetails || 'Booking Entry'}`,
              description: entry.type === 'daily' ? entry.route : entry.bookingDetails
            });
          }
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
              description = entry.serviceType || entry.serviceDetails || 'Service payment';
              break;
            case 'union':
              dataType = 'Union Payment';
              displayName = `Union: ${entry.unionName || entry.description || 'Union Fees'}`;
              description = entry.unionName || entry.description || 'Union payment';
              break;
            case 'other':
              dataType = 'Other Payment';
              displayName = `Other: ${entry.paymentType || entry.paymentDetails || 'Other Payment'}`;
              description = entry.paymentType || entry.paymentDetails || 'Other payment';
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
      setApprovedData(allEntries.filter(entry => entry.entryStatus === 'approvedCash'));

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
      case 'bankApproval': return bankApprovalData;
      case 'cashApproval': return cashApprovalData;
      case 'approved': return approvedData;
      default: return [];
    }
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

      // Determine new status based on current tab
      switch (activeTab) {
        case 'pending':
          newStatus = 'approved';
          break;
        case 'bankApproval':
          newStatus = 'approvedBank';
          break;
        case 'cashApproval':
          newStatus = 'approvedCash';
          break;
        case 'approved':
          newStatus = 'approved';
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
        const currentData = getCurrentTabData();
        const entry = currentData.find(e => e.entryId === entryId);
        if (!entry) return;

        // Call appropriate status update function
        let result;
        switch (entry.dataType) {
          case 'Fare Receipt':
            result = await authService.updateFareReceiptStatus({
              entryId: entryId,
              newStatus: newStatus,
              approverName: approverName
            });
            break;
          case 'Booking Entry':
            result = await authService.updateBookingEntryStatus({
              entryId: entryId,
              newStatus: newStatus,
              approverName: approverName
            });
            break;
          case 'Fuel Payment':
            result = await authService.updateFuelPaymentStatus({
              entryId: entryId,
              newStatus: newStatus,
              approverName: approverName
            });
            break;
          case 'Adda Payment':
            result = await authService.updateAddaPaymentStatus({
              entryId: entryId,
              newStatus: newStatus,
              approverName: approverName
            });
            break;
          case 'Union Payment':
            result = await authService.updateUnionPaymentStatus({
              entryId: entryId,
              newStatus: newStatus,
              approverName: approverName
            });
            break;
          case 'Service Payment':
            result = await authService.updateServicePaymentStatus({
              entryId: entryId,
              newStatus: newStatus,
              approverName: approverName
            });
            break;
          case 'Other Payment':
            result = await authService.updateOtherPaymentStatus({
              entryId: entryId,
              newStatus: newStatus,
              approverName: approverName
            });
            break;
          default:
            console.error(`Unsupported data type: ${entry.dataType}`);
            return;
        }

        if (!result.success) {
          console.error(`Failed to sync entry ${entryId} to Google Sheets:`, result.error);
        } else {
          console.log(`✅ Entry ${entryId} synced to Google Sheets successfully`);
        }

        // Update parent state after successful sync
        if (window.updateEntryStatusInParent) {
          window.updateEntryStatusInParent(entryId, newStatus, entry.type);
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
              {entry.entryStatus === 'approvedCash' && (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  CASH APPROVED
                </>
              )}
              {entry.entryStatus === 'approvedBank' && (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  BANK APPROVED
                </>
              )}
              {entry.entryStatus === 'approved' && (
                <>
                  <i className="bi bi-check-circle-fill me-1"></i>
                  APPROVED
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
              <span className="value">{formatDisplayDate(entry.date)}</span>
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
        <div className="approval-header">
          <h2><i className="bi bi-clipboard-check"></i> Data Summary</h2>
          <p>Review and approve submitted entries</p>
        </div>

        {/* Approval Tabs - Correct Order */}
        <div className="approval-tabs">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pending');
              setSelectedEntries([]);
            }}
          >
            <i className="bi bi-clock"></i> Pending ({pendingData.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bankApproval' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bankApproval');
              setSelectedEntries([]);
            }}
          >
            <i className="bi bi-bank"></i> Bank Approval ({bankApprovalData.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cashApproval' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('cashApproval');
              setSelectedEntries([]);
            }}
          >
            <i className="bi bi-cash-stack"></i> Cash Approval ({cashApprovalData.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('approved');
              setSelectedEntries([]);
            }}
          >
            <i className="bi bi-check-circle"></i> Approved ({approvedData.length})
          </button>
        </div>

        {/* Selection Controls */}
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

        {/* Tab Content */}
        <div className="tab-content">
          {currentData.length === 0 ? (
            <div className="no-data">
              <i className="bi bi-inbox"></i>
              <p>No entries in this category</p>
            </div>
          ) : (
            <div className="recent-entries-grid">
              {currentData.map(renderEntryCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataSummary;
