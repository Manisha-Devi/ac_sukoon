import React, { useState, useEffect } from "react";
import "../css/DataSummary.css";
import authService from "../../services/authService.js";

function DataSummary({ fareData, expenseData, currentUser }) {
  const [activeTab, setActiveTab] = useState('cashApproval');
  const [pendingData, setPendingData] = useState([]);
  const [bankApprovalData, setBankApprovalData] = useState([]);
  const [cashApprovalData, setCashApprovalData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setBankApprovalData(allEntries.filter(entry => entry.entryStatus === 'forwardedBank'));
      setCashApprovalData(allEntries.filter(entry => entry.entryStatus === 'forwardedCash'));
      setApprovedData(allEntries.filter(entry => 
        entry.entryStatus === 'approvedCash' || 
        entry.entryStatus === 'approvedBank' ||
        entry.entryStatus === 'cashApproved' ||
        entry.entryStatus === 'bankApproved' ||
        entry.entryStatus === 'approved'
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
      case 'cashApproval': 
        data = cashApprovalData;
        break;
      case 'bankApproval': 
        data = bankApprovalData;
        break;
      case 'approved': 
        data = approvedData;
        break;
      default: 
        data = approvedData;
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

  // Calculate summary totals
  const totalCashApproval = cashApprovalData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
  const totalBankApproval = bankApprovalData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
  const cashInHand = approvedData
    .filter(entry => entry.cashAmount > 0)
    .reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);

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

        {/* Summary Cards */}
        {showSummary && (
          <div className="summary-cards-section">
            <div className="row mb-4">
              <div className="col-md-4 col-sm-6 mb-3">
                <div className="summary-card cash-approval-card">
                  <div className="card-body">
                    <h6><i className="bi bi-cash-stack"></i> Total Cash Approval</h6>
                    <h4>{cashApprovalData.length}</h4>
                    <small>₹{totalCashApproval.toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 mb-3">
                <div className="summary-card bank-approval-card">
                  <div className="card-body">
                    <h6><i className="bi bi-bank"></i> Total Bank Approval</h6>
                    <h4>{bankApprovalData.length}</h4>
                    <small>₹{totalBankApproval.toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 mb-3">
                <div className="summary-card cash-in-hand-card">
                  <div className="card-body">
                    <h6><i className="bi bi-wallet2"></i> Cash in Hand</h6>
                    <h4>₹{cashInHand.toLocaleString()}</h4>
                    <small>From approved entries</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Tabs */}
        <div className="approval-tabs">
          <button
            className={`tab-btn ${activeTab === 'cashApproval' ? 'active' : ''}`}
            onClick={() => setActiveTab('cashApproval')}
          >
            <i className="bi bi-cash-stack"></i>
            Cash Approval ({cashApprovalData.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'bankApproval' ? 'active' : ''}`}
            onClick={() => setActiveTab('bankApproval')}
          >
            <i className="bi bi-bank"></i>
            Bank Approval ({bankApprovalData.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            <i className="bi bi-check-circle"></i>
            Approved ({approvedData.length})
          </button>
        </div>

        {/* Date Filter */}
        {showFilter && (
          <div className="date-filter-section">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="data-table-section">
          <div className="table-header">
            <h5>
              {activeTab === 'cashApproval' && 'Cash Approval Entries'}
              {activeTab === 'bankApproval' && 'Bank Approval Entries'}
              {activeTab === 'approved' && 'Approved Entries'}
            </h5>
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
                    <th width="15%">Entry ID</th>
                    <th width="15%">Date</th>
                    <th width="15%">Type</th>
                    <th width="25%">Description</th>
                    <th width="10%">Amount</th>
                    <th width="10%">Status</th>
                    <th width="10%">Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map(entry => (
                    <tr key={entry.entryId}>
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