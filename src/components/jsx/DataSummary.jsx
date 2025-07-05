import React, { useState, useEffect } from "react";
import "../css/DataApproval.css";
import authService from "../../services/authService.js";

function DataSummary({ fareData, expenseData }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingData, setPendingData] = useState([]);
  const [bankData, setBankData] = useState([]);
  const [cashData, setCashData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

  // Check if user has permission to access this component
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  }, []);

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
              displayName = `Service: ${entry.serviceType || entry.description || 'Service'}`;
              description = entry.serviceType || entry.description || 'Service payment';
              break;
            case 'union':
              dataType = 'Union Payment';
              displayName = `Union: ${entry.unionName || entry.description || 'Union Fees'}`;
              description = entry.unionName || entry.description || 'Union payment';
              break;
            case 'other':
              dataType = 'Other Payment';
              displayName = `Other: ${entry.paymentDetails || entry.description || 'Other Payment'}`;
              description = entry.paymentDetails || entry.description || 'Other payment';
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

      // Separate by status - New 6-step flow
      setPendingData(allEntries.filter(entry => entry.entryStatus === 'pending'));
      setBankData(allEntries.filter(entry => 
        entry.entryStatus === 'forwardedBank' || entry.entryStatus === 'approvedBank'
      ));
      setCashData(allEntries.filter(entry => 
        entry.entryStatus === 'forwardedCash' || entry.entryStatus === 'approvedCash'
      ));
      setApprovedData(allEntries.filter(entry => entry.entryStatus === 'approved'));

      setLoading(false);
    } catch (error) {
      console.error('Error processing data:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (entry) => {
    try {
      const approverName = currentUser.fullName || currentUser.username;

      // Call appropriate approval function based on data type
      let result;
      switch (entry.dataType) {
        case 'Fare Receipt':
          result = await authService.updateFareReceiptStatus({
            entryId: entry.entryId,
            newStatus: 'approved',
            approverName: approverName
          });
          break;
        case 'Booking Entry':
          result = await authService.updateBookingEntryStatus({
            entryId: entry.entryId,
            newStatus: 'approved',
            approverName: approverName
          });
          break;
        case 'Fuel Payment':
          result = await authService.updateFuelPaymentStatus({
            entryId: entry.entryId,
            newStatus: 'approved',
            approverName: approverName
          });
          break;
        case 'Other Payment':
          result = await authService.updateOtherPaymentStatus({
            entryId: entry.entryId,
            newStatus: 'approved',
            approverName: approverName
          });
          break;
        case 'Adda Payment':
          result = await authService.updateAddaPaymentStatus({
            entryId: entry.entryId,
            newStatus: 'approved',
            approverName: approverName
          });
          break;
        case 'Service Payment':
          result = await authService.updateServicePaymentStatus({
            entryId: entry.entryId,
            newStatus: 'approved',
            approverName: approverName
          });
          break;
        case 'Union Payment':
          result = await authService.updateUnionPaymentStatus({
            entryId: entry.entryId,
            newStatus: 'approved',
            approverName: approverName
          });
          break;
        default:
          throw new Error(`Unsupported data type: ${entry.dataType}`);
      }

      if (result.success) {
        alert(`Entry approved successfully by ${approverName}`);

        // Update parent state
        if (window.updateEntryStatusInParent) {
          window.updateEntryStatusInParent(entry.entryId, "approved", entry.type);
        }

        processAllData(); // Reprocess current data
      } else {
        alert('Error approving entry: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving entry:', error);
      alert('Error approving entry: ' + error.message);
    }
  };

  const handleResend = async (entry) => {
    try {
      // Call appropriate resend function based on data type
      let result;
      switch (entry.dataType) {
        case 'Fare Receipt':
          result = await authService.updateFareReceiptStatus({
            entryId: entry.entryId,
            newStatus: 'pending',
            approverName: ""
          });
          break;
        case 'Booking Entry':
          result = await authService.updateBookingEntryStatus({
            entryId: entry.entryId,
            newStatus: 'pending',
            approverName: ""
          });
          break;
        case 'Fuel Payment':
          result = await authService.updateFuelPaymentStatus({
            entryId: entry.entryId,
            newStatus: 'pending',
            approverName: ""
          });
          break;
        case 'Other Payment':
          result = await authService.updateOtherPaymentStatus({
            entryId: entry.entryId,
            newStatus: 'pending',
            approverName: ""
          });
          break;
        case 'Adda Payment':
          result = await authService.updateAddaPaymentStatus({
            entryId: entry.entryId,
            newStatus: 'pending',
            approverName: ""
          });
          break;
        case 'Service Payment':
          result = await authService.updateServicePaymentStatus({
            entryId: entry.entryId,
            newStatus: 'pending',
            approverName: ""
          });
          break;
        case 'Union Payment':
          result = await authService.updateUnionPaymentStatus({
            entryId: entry.entryId,
            newStatus: 'pending',
            approverName: ""
          });
          break;
        default:
          throw new Error(`Unsupported data type: ${entry.dataType}`);
      }

      if (result.success) {
        alert('Entry sent back for correction');

        // Update parent state
        if (window.updateEntryStatusInParent) {
          window.updateEntryStatusInParent(entry.entryId, "pending", entry.type);
        }

        processAllData(); // Reprocess current data
      } else {
        alert('Error resending entry: ' + result.error);
      }
    } catch (error) {
      console.error('Error resending entry:', error);
      alert('Error resending entry: ' + error.message);
    }
  };

  const renderEntryCard = (entry) => {
    return (
      <div key={entry.entryId} className="approval-entry-card">
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
            {(entry.entryStatus === 'forwardedBank' || entry.entryStatus === 'approvedBank') && (
              <>
                <i className="bi bi-bank me-1"></i>
                {entry.entryStatus === 'forwardedBank' ? 'FORWARDED TO BANK' : 'BANK APPROVED'}
              </>
            )}
            {(entry.entryStatus === 'forwardedCash' || entry.entryStatus === 'approvedCash') && (
              <>
                <i className="bi bi-cash-stack me-1"></i>
                {entry.entryStatus === 'forwardedCash' ? 'FORWARDED TO CASH' : 'CASH APPROVED'}
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
            <span className="value">{entry.date}</span>
          </div>
          <div className="entry-row">
            <span className="label">Description:</span>
            <span className="value">{entry.displayName}</span>
          </div>
          <div className="entry-row">
            <span className="label">Total Amount:</span>
            <span className="value">₹{(entry.totalAmount || 0).toLocaleString('en-IN')}</span>
          </div>
          {(entry.cashAmount || 0) > 0 && (
            <div className="entry-row">
              <span className="label">Cash Amount:</span>
              <span className="value">₹{(entry.cashAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          )}
          {(entry.bankAmount || 0) > 0 && (
            <div className="entry-row">
              <span className="label">Bank Amount:</span>
              <span className="value">₹{(entry.bankAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="entry-row">
            <span className="label">Time:</span>
            <span className="value">{entry.timestamp}</span>
          </div>
          {entry.approvedBy && (
            <div className="entry-row">
              <span className="label">Approved By:</span>
              <span className="value">{entry.approvedBy}</span>
            </div>
          )}
        </div>

        <div className="entry-actions">
          {entry.entryStatus === 'approvedCash' && (
            <>
              <button 
                className="btn btn-success btn-sm"
                onClick={() => handleApprove(entry)}
                title="Final approval"
              >
                <i className="bi bi-check-circle"></i> Final Approve
              </button>
              <button 
                className="btn btn-warning btn-sm"
                onClick={() => handleResend(entry)}
                title="Send back for correction"
              >
                <i className="bi bi-arrow-clockwise"></i> Resend
              </button>
            </>
          )}
          {entry.entryStatus === 'approved' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleResend(entry)}
              title="Send back for editing"
            >
              <i className="bi bi-arrow-clockwise"></i> Resend for Edit
            </button>
          )}
          {(entry.entryStatus === 'pending' || 
            entry.entryStatus === 'forwardedBank' || 
            entry.entryStatus === 'approvedBank' || 
            entry.entryStatus === 'forwardedCash') && (
            <span className="badge bg-secondary">
              <i className="bi bi-clock"></i> In process
            </span>
          )}
        </div>
      </div>
    );
  };

  const userRole = currentUser?.role;

  // Show loading while checking user data
  if (!currentUser) {
    return (
      <div className="data-approval-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Loading user information...</p>
          <small className="text-muted">Checking localStorage for user data...</small>
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

            <hr />
            <div className="debug-info">
              <h6>🔍 Debug Information:</h6>
              <p><strong>Current Role:</strong> <code>{userRole || 'undefined'}</code></p>
              <p><strong>Username:</strong> <code>{currentUser.username || 'undefined'}</code></p>
              <p><strong>Full Name:</strong> <code>{currentUser.fullName || 'undefined'}</code></p>
              <p><strong>User Type:</strong> <code>{currentUser.userType || 'undefined'}</code></p>
              <p><strong>Is Authenticated:</strong> <code>{String(currentUser.isAuthenticated)}</code></p>
              <p><strong>User Object:</strong> <code>{JSON.stringify(currentUser, null, 2)}</code></p>
            </div>

            <div className="mt-3">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  console.log('🔍 Full localStorage user data:', localStorage.getItem('user'));
                  console.log('👤 Current user object:', currentUser);
                }}
              >
                <i className="bi bi-bug"></i> Log Debug Info to Console
              </button>
            </div>
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

  return (
    <div className="data-approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <h2><i className="bi bi-clipboard-check"></i> Data Summary</h2>
          <p>Review and approve submitted entries</p>
          <small className="text-muted">New Flow: Pending → Bank → Cash → Approved</small>
        </div>

        {/* Approval Tabs - Updated with new status flow */}
        <div className="approval-tabs">
          <button 
            className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            <i className="bi bi-bank"></i> Bank Approval ({bankData.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cash' ? 'active' : ''}`}
            onClick={() => setActiveTab('cash')}
          >
            <i className="bi bi-cash-stack"></i> Cash Approval ({cashData.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            <i className="bi bi-check-circle"></i> Approved ({approvedData.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="bi bi-clock"></i> Pending ({pendingData.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'bank' && (
            <div className="entries-grid">
              {bankData.length === 0 ? (
                <div className="no-data">
                  <i className="bi bi-bank"></i>
                  <p>No entries waiting for bank approval</p>
                </div>
              ) : (
                bankData.map(renderEntryCard)
              )}
            </div>
          )}

          {activeTab === 'cash' && (
            <div className="entries-grid">
              {cashData.length === 0 ? (
                <div className="no-data">
                  <i className="bi bi-cash-stack"></i>
                  <p>No entries waiting for cash approval</p>
                </div>
              ) : (
                cashData.map(renderEntryCard)
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="entries-grid">
              {approvedData.length === 0 ? (
                <div className="no-data">
                  <i className="bi bi-check-circle"></i>
                  <p>No approved entries</p>
                </div>
              ) : (
                approvedData.map(renderEntryCard)
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="entries-grid">
              {pendingData.length === 0 ? (
                <div className="no-data">
                  <i className="bi bi-inbox"></i>
                  <p>No pending entries</p>
                </div>
              ) : (
                pendingData.map(renderEntryCard)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataSummary;