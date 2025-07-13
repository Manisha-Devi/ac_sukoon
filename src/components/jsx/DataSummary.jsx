import React, { useState, useEffect } from "react";
import "../css/DataSummary.css";
import authService from "../../services/authService.js";

function DataSummary({ fareData, expenseData, currentUser, cashDeposit, setCashDeposit }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingData, setPendingData] = useState([]);
  const [bankApprovalData, setBankApprovalData] = useState([]);
  const [cashApprovalData, setCashApprovalData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showCashDepositModal, setShowCashDepositModal] = useState(false);
  const [summaryActiveTab, setSummaryActiveTab] = useState('approved');
  const [cashDepositForm, setCashDepositForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load cash deposits when component mounts
  useEffect(() => {
    const loadCashDeposits = async () => {
      try {
        console.log('💰 DataSummary: Loading cash deposits...');
        const result = await authService.getCashDeposits();

        if (result.success && result.data) {
          console.log('💰 DataSummary: Cash deposits loaded successfully:', result.data.length);
          setCashDeposit(result.data);
        } else {
          console.warn('⚠️ DataSummary: Failed to load cash deposits:', result.error);
        }
      } catch (error) {
        console.error('❌ DataSummary: Error loading cash deposits:', error);
      }
    };

    // Load cash deposits if not already loaded
    if (!cashDeposit || cashDeposit.length === 0) {
      loadCashDeposits();
    }

    // Listen for data refresh events
    const handleDataRefresh = () => {
      console.log('💰 DataSummary: Refreshing cash deposits...');
      loadCashDeposits();
    };

    window.addEventListener('dataRefreshed', handleDataRefresh);

    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefresh);
    };
  }, []);

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
            description: description,
            submittedBy: entry.submittedBy
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
            description: description,
            submittedBy: entry.submittedBy
          });
        });
      }

      // Sort by timestamp (newest first)
      allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Separate by status with correct filtering
      setPendingData(allEntries.filter(entry => entry.entryStatus === 'pending'));
      setBankApprovalData(allEntries.filter(entry => entry.entryStatus === 'forwardedBank'));
      setCashApprovalData(allEntries.filter(entry => entry.entryStatus === 'forwardedCash'));
      // Approved tab should only show approvedCash entries (ready for final approval)
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

  // Get approved entries for current user - only approvedCash status (for calculations)
  const getApprovedEntriesForCurrentUser = () => {
    const currentUserName = currentUser?.fullName || currentUser?.username;
    if (!currentUserName) return [];

    const filteredEntries = approvedData.filter(entry => 
      entry.approvedBy === currentUserName && entry.entryStatus === 'approvedCash'
    );

    console.log('🔍 DataSummary - Checking approved entries:');
    console.log('📊 Current user:', currentUserName);
    console.log('📋 Total approved data:', approvedData.length);
    console.log('💰 Entries with approvedCash status approved by current user:', filteredEntries.length);
    console.log('📝 ApprovedCash entries details:', filteredEntries);

    return filteredEntries;
  };

  // Get final approved entries for table display - only approved status from all data
  const getFinalApprovedEntriesForTable = () => {
    const currentUserName = currentUser?.fullName || currentUser?.username;
    if (!currentUserName) return [];

    // Search in all data sources, not just approvedData
    let allEntries = [];

    // Process Fare Data
    if (fareData && fareData.length > 0) {
      fareData.forEach(entry => {
        if (entry.entryStatus === 'approved' && entry.approvedBy === currentUserName) {
          let dataType = '';
          let displayName = '';

          if (entry.type === 'daily') {
            dataType = 'Fare Receipt';
            displayName = `Fare: ${entry.route || 'Daily Collection'}`;
          } else if (entry.type === 'booking') {
            dataType = 'Booking Entry';
            displayName = `Booking: ${entry.bookingDetails || 'Booking Entry'}`;
          } else if (entry.type === 'off') {
            dataType = 'Off Day';
            displayName = `Off Day: ${entry.reason || 'Off Day Request'}`;
          }

          allEntries.push({
            ...entry,
            dataType: dataType,
            displayName: displayName
          });
        }
      });
    }

    // Process Expense Data
    if (expenseData && expenseData.length > 0) {
      expenseData.forEach(entry => {
        if (entry.entryStatus === 'approved' && entry.approvedBy === currentUserName) {
          let dataType = '';
          let displayName = '';

          switch(entry.type) {
            case 'fuel':
              dataType = 'Fuel Payment';
              displayName = `Fuel: ${entry.pumpName || 'Fuel Station'}`;
              break;
            case 'adda':
              dataType = 'Adda Payment';
              displayName = `Adda: ${entry.addaName || entry.description || 'Adda Fees'}`;
              break;
            case 'service':
              dataType = 'Service Payment';
              displayName = `Service: ${entry.serviceType || entry.serviceDetails || 'Service'}`;
              break;
            case 'union':
              dataType = 'Union Payment';
              displayName = `Union: ${entry.unionName || entry.description || 'Union Fees'}`;
              break;
            case 'other':
              dataType = 'Other Payment';
              displayName = `Other: ${entry.paymentType || entry.paymentDetails || 'Other Payment'}`;
              break;
            default:
              dataType = 'Payment';
              displayName = `Payment: ${entry.description || 'Payment Entry'}`;
          }

          allEntries.push({
            ...entry,
            dataType: dataType,
            displayName: displayName
          });
        }
      });
    }

    // Sort by timestamp (newest first)
    allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log('🔍 DataSummary - Checking final approved entries for table:');
    console.log('📊 Current user:', currentUserName);
    console.log('✅ Entries with approved status approved by current user:', allEntries.length);
    console.log('📝 Final approved entries details:', allEntries);

    return allEntries;
  };

  // Calculate total cash from final approved entries of current user
  const calculateTotalCash = () => {
    const userApprovedEntries = getFinalApprovedEntriesForTable();
    return userApprovedEntries.reduce((total, entry) => total + (entry.cashAmount || 0), 0);
  };

  // Calculate total bank from final approved entries of current user
  const calculateTotalBank = () => {
    const userApprovedEntries = getFinalApprovedEntriesForTable();
    return userApprovedEntries.reduce((total, entry) => total + (entry.bankAmount || 0), 0);
  };

  // Calculate income cash (only from fare receipts and bookings)
  const calculateIncomeCash = () => {
    const userApprovedEntries = getFinalApprovedEntriesForTable();
    return userApprovedEntries
      .filter(entry => entry.dataType === 'Fare Receipt' || entry.dataType === 'Booking Entry')
      .reduce((total, entry) => total + (entry.cashAmount || 0), 0);
  };

  // Get fixed cash for current user
  const getFixedCash = () => {
    return currentUser?.fixedCash || 0;
  };

  // Calculate total cash deposits by current user
  const calculateTotalCashDeposits = () => {
    const currentUserName = currentUser?.fullName || currentUser?.username;
    if (!currentUserName) return 0;

    const userCashDeposits = cashDeposit.filter(deposit => 
      deposit.depositedBy === currentUserName
    );

    return userCashDeposits.reduce((total, deposit) => total + (deposit.cashAmount || 0), 0);
  };

  // Calculate cash in hand (Income Cash - Cash Deposits)
  const calculateCashInHand = () => {
    return calculateIncomeCash() - calculateTotalCashDeposits();
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
          newStatus = 'approved'; // Final approval (approvedCash -> approved)
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

      // Always show in "16 Jul 2025" format for consistency
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateStr;
    }
  };

  // Helper function to format time for display - with seconds format
  const formatDisplayTime = (timestampStr) => {
    if (!timestampStr) return '--:--:-- --';

    try {
      let date;
      
      // Handle different timestamp formats
      if (timestampStr.includes('/')) {
        // Handle format like "13/07/2025 16:14:45"
        const parts = timestampStr.split(' ');
        if (parts.length >= 2) {
          const datePart = parts[0]; // "13/07/2025"
          const timePart = parts[1]; // "16:14:45"
          
          // Convert to proper date format
          const [day, month, year] = datePart.split('/');
          const properDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
          date = new Date(properDateStr);
        } else {
          date = new Date(timestampStr);
        }
      } else {
        date = new Date(timestampStr);
      }

      if (isNaN(date.getTime())) {
        // If still invalid, try to extract just time part if possible
        if (timestampStr.includes(' ')) {
          const timePart = timestampStr.split(' ')[1];
          if (timePart && timePart.includes(':')) {
            const [hours, minutes, seconds] = timePart.split(':');
            const hour = parseInt(hours);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes}:${seconds || '00'} ${period}`;
          }
        }
        return timestampStr;
      }

      // Time format with seconds - HH:MM:SS AM/PM
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      console.error('Error formatting time:', error, timestampStr);
      return '--:--:-- --';
    }
  };

  // Handle Cash Deposit modal
  const handleCashDepositSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!cashDepositForm.amount || !cashDepositForm.description) {
      alert('Please fill all required fields');
      return;
    }

    // Create new cash deposit entry
    const entryIdNumber = Date.now();
    const newCashDeposit = {
      id: entryIdNumber,
      entryType: 'Cash Deposit',
      entryId: entryIdNumber,
      date: cashDepositForm.date,
      cashAmount: parseFloat(cashDepositForm.amount),
      description: cashDepositForm.description,
      depositedBy: currentUser?.fullName || currentUser?.username || 'Unknown',
      timestamp: new Date().toISOString()
    };

    // Add to cash deposits array using parent state (immediate local update)
    setCashDeposit(prev => [newCashDeposit, ...prev]);

    console.log('Cash Deposit:', newCashDeposit);
    alert(`Cash Deposit of ₹${parseFloat(cashDepositForm.amount).toLocaleString('en-IN')} submitted successfully!`);

    // Reset form and close modal
    setCashDepositForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowCashDepositModal(false);

    // Sync to Google Sheets in background
    try {
      console.log('💰 Syncing cash deposit to Google Sheets...');
      const syncResult = await authService.addCashDeposit({
        entryId: newCashDeposit.entryId,
        timestamp: newCashDeposit.timestamp,
        entryType: newCashDeposit.entryType,
        date: newCashDeposit.date,
        cashAmount: newCashDeposit.cashAmount,
        description: newCashDeposit.description,
        depositedBy: newCashDeposit.depositedBy
      });

      if (syncResult.success) {
        console.log('✅ Cash deposit synced to Google Sheets successfully');
      } else {
        console.log('⚠️ Cash deposit sync failed, but saved locally:', syncResult.error);
      }
    } catch (error) {
      console.error('❌ Error syncing cash deposit to Google Sheets:', error);
    }
  };

  const handleModalClose = () => {
    setShowCashDepositModal(false);
    setCashDepositForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
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

        {/* Filter Card */}
        {showFilter && (
          <div className="filter-card">
            <div className="filter-card-content">
              <h5><i className="bi bi-funnel"></i> Filter Approved Entries</h5>
              <p className="text-muted mb-3">Filter approved entries by date range</p>
              <div className="filter-options">
                <div className="row justify-content-center">
                  <div className="col-md-4">
                    <label className="form-label">Date From</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date To</label>
                    <input type="date" className="form-control" />
                  </div>
                </div>
                <div className="filter-actions mt-3">
                  <button className="btn btn-primary btn-sm me-2">
                    <i className="bi bi-search"></i> Apply Filter
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-arrow-clockwise"></i> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Card */}
        {showSummary && (
          <div className="summary-card-container">
            <div className="summary-card-content">
              <h5><i className="bi bi-bar-chart"></i> Data Summary</h5>

              {/* Financial Summary Cards */}
              <div className="financial-summary-cards mb-4">
                <div className="row g-4">
                  <div className="col-lg-3 col-md-6">
                    <div className="financial-card total-cash">
                      <div className="card-gradient"></div>
                      <div className="financial-icon">
                        <i className="bi bi-cash-stack"></i>
                      </div>
                      <div className="financial-details">
                        <div className="financial-amount">₹{calculateTotalCash().toLocaleString('en-IN')}</div>
                        <div className="financial-label">Total Cash</div>
                        <div className="financial-subtitle">From Entries You Approved</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="financial-card total-bank">
                      <div className="card-gradient"></div>
                      <div className="financial-icon">
                        <i className="bi bi-bank"></i>
                      </div>
                      <div className="financial-details">
                        <div className="financial-amount">₹{calculateTotalBank().toLocaleString('en-IN')}</div>
                        <div className="financial-label">Total Bank</div>
                        <div className="financial-subtitle">From Entries You Approved</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="financial-card cash-in-hand">
                      <div className="card-gradient"></div>
                      <div className="financial-icon">
                        <i className="bi bi-wallet2"></i>
                      </div>
                      <div className="financial-details">
                        <div className="financial-amount">₹{calculateCashInHand().toLocaleString('en-IN')}</div>
                        <div className="financial-label">Cash in Hand</div>
                        <div className="financial-subtitle">Income - Cash Deposits</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="financial-card cash-deposit">
                      <div className="card-gradient"></div>
                      <div className="financial-icon">
                        <i className="bi bi-bank2"></i>
                      </div>
                      <div className="financial-details">
                        <div className="financial-amount">₹{calculateTotalCashDeposits().toLocaleString('en-IN')}</div>
                        <div className="financial-label">Cash Deposits</div>
                        <div className="financial-subtitle">Total Deposits by You</div>
                      </div>
                      {/* Cash Deposit Add Button */}
                      <div className="cash-deposit-add-container">
                        <button 
                          className="btn btn-outline-light cash-deposit-add-btn"
                          onClick={() => setShowCashDepositModal(true)}
                          title="Add Cash Deposit"
                        >
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Tabs */}
              <div className="summary-tabs-section">
                <div className="summary-tabs">
                  <button 
                    className={`summary-tab-btn ${summaryActiveTab === 'approved' ? 'active' : ''}`}
                    onClick={() => setSummaryActiveTab('approved')}
                  >
                    <i className="bi bi-check-circle-fill"></i> Approved Entries by You
                  </button>
                  <button 
                    className={`summary-tab-btn ${summaryActiveTab === 'deposits' ? 'active' : ''}`}
                    onClick={() => setSummaryActiveTab('deposits')}
                  >
                    <i className="bi bi-bank2"></i> Cash Deposits by You
                  </button>
                </div>

                <div className="summary-tab-content">
                  {summaryActiveTab === 'approved' ? (
                    <div className="approved-entries-section">
                      <h6><i className="bi bi-check-circle-fill"></i> Entries Approved By You</h6>
                      {getFinalApprovedEntriesForTable().length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-striped table-sm approved-entries-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>I/E</th>
                                <th>Description</th>
                                <th>Cash</th>
                                <th>Bank</th>
                                <th>Total</th>
                                <th>SubmittedBy</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getFinalApprovedEntriesForTable().map((entry) => (
                                  <tr key={entry.entryId}>
                                    <td>{formatDisplayDate(entry.date)}</td>
                                    <td>
                                      <span className={`badge ${entry.dataType === 'Fare Receipt' || entry.dataType === 'Booking Entry' ? 'bg-success' : 'bg-danger'}`}>
                                        {entry.dataType === 'Fare Receipt' || entry.dataType === 'Booking Entry' ? 'I' : 'E'}
                                      </span>
                                    </td>
                                    <td>{entry.displayName}</td>
                                    <td className="text-success">₹{(entry.cashAmount || 0).toLocaleString('en-IN')}</td>
                                    <td className="text-primary">₹{(entry.bankAmount || 0).toLocaleString('en-IN')}</td>
                                    <td className="fw-bold">₹{(entry.totalAmount || 0).toLocaleString('en-IN')}</td>
                                    <td>
                                      <span className="badge bg-info">
                                        <i className="bi bi-person"></i> {entry.submittedBy || 'N/A'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="no-approved-entries">
                            <i className="bi bi-inbox"></i>
                            <p>No entries with final approval status found that were approved by you</p>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="cash-deposits-section">
                      <h6><i className="bi bi-bank2"></i> Cash Deposits by You</h6>
                      {(() => {
                        const currentUserName = currentUser?.fullName || currentUser?.username;
                        const userCashDeposits = cashDeposit.filter(deposit => 
                          deposit.depositedBy === currentUserName
                        );

                        return userCashDeposits.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-striped table-sm cash-deposits-table">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Time</th>
                                  <th>EntryType</th>
                                  <th>EntryId</th>
                                  <th>CashAmount</th>
                                  <th>Description</th>
                                  <th>DepositedBy</th>
                                </tr>
                              </thead>
                              <tbody>
                                {userCashDeposits.map((deposit) => (
                                  <tr key={deposit.id}>
                                    <td>
                                      {deposit.date ? 
                                        formatDisplayDate(deposit.date) : 
                                        formatDisplayDate(deposit.timestamp)
                                      }
                                    </td>
                                    <td>
                                      {deposit.timestamp ? 
                                        formatDisplayTime(deposit.timestamp) : 
                                        '--:--:-- --'
                                      }
                                    </td>
                                    <td>
                                      <span className="badge bg-warning">
                                        {deposit.entryType}
                                      </span>
                                    </td>
                                    <td>{deposit.entryId}</td>
                                    <td className="text-danger">₹{deposit.cashAmount.toLocaleString('en-IN')}</td>
                                    <td>{deposit.description}</td>
                                    <td>
                                      <span className="badge bg-primary">
                                        <i className="bi bi-person"></i> {deposit.depositedBy}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="no-cash-deposits">
                            <i className="bi bi-inbox"></i>
                            <p>No cash deposits found that were made by you</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
        )}

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

      {/* Cash Deposit Modal */}
      {showCashDepositModal && (
        <div className="modal fade show cash-deposit-modal" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-overlay" onClick={handleModalClose}></div>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-bank2 me-2"></i>
                  Cash Deposit
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleModalClose}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleCashDepositSubmit}>
                <div className="modal-body">
                  <div className="cash-deposit-info mb-4">
                    <div className="info-card">
                      <div className="info-icon">
                        <i className="bi bi-wallet2"></i>
                      </div>
                      <div className="info-content">
                        <h6>Current Cash in Hand</h6>
                        <p className="amount">₹{calculateCashInHand().toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="number"
                      className="form-control"
                      id="depositAmount"
                      placeholder="Enter amount"
                      value={cashDepositForm.amount}
                      onChange={(e) => setCashDepositForm({...cashDepositForm, amount: e.target.value})}
                      required
                      min="1"
                      step="0.01"
                    />
                    <label htmlFor="depositAmount">
                      <i className="bi bi-currency-rupee me-1"></i>
                      Deposit Amount *
                    </label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="date"
                      className="form-control"
                      id="depositDate"
                      value={cashDepositForm.date}
                      onChange={(e) => setCashDepositForm({...cashDepositForm, date: e.target.value})}
                      required
                    />
                    <label htmlFor="depositDate">
                      <i className="bi bi-calendar me-1"></i>
                      Deposit Date *
                    </label>
                  </div>

                  <div className="form-floating mb-3">
                    <textarea
                      className="form-control"
                      id="depositDescription"
                      placeholder="Enter description"
                      style={{ height: '80px' }}
                      value={cashDepositForm.description}
                      onChange={(e) => setCashDepositForm({...cashDepositForm, description: e.target.value})}
                      required
                    ></textarea>
                    <label htmlFor="depositDescription">
                      <i className="bi bi-chat-left-text me-1"></i>
                      Description *
                    </label>
                  </div>

                  {cashDepositForm.amount && (
                    <div className="deposit-preview">
                      <div className="preview-card">
                        <h6><i className="bi bi-eye me-1"></i> Preview</h6>
                        <div className="preview-details">
                          <div className="preview-row">
                            <span>Amount:</span>
                            <span className="fw-bold text-success">₹{parseFloat(cashDepositForm.amount || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="preview-row">
                            <span>Date:</span>
                            <span>{new Date(cashDepositForm.date).toLocaleDateString('en-IN')}</span>
                          </div>
                          <div className="preview-row">
                            <span>New Cash Balance:</span>
                            <span className="fw-bold text-primary">
                              ₹{(calculateCashInHand() - parseFloat(cashDepositForm.amount || 0)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={handleModalClose}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={!cashDepositForm.amount || !cashDepositForm.description}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Submit Deposit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataSummary;