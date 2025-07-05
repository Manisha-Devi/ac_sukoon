
import React, { useState, useEffect } from "react";
import "../css/DataApproval.css";
import authService from "../../services/authService.js";

function DataApproval() {
  const [pendingData, setPendingData] = useState([]);
  const [waitingData, setWaitingData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('waiting');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await loadApprovalData();
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApprovalData = async () => {
    try {
      // Get all data types
      const [fareReceipts, bookingEntries, offDays, fuelPayments, addaPayments, 
             servicePayments, unionPayments, otherPayments] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(), 
        authService.getOffDays(),
        authService.getFuelPayments(),
        authService.getAddaPayments(),
        authService.getServicePayments(),
        authService.getUnionPayments(),
        authService.getOtherPayments()
      ]);

      let allEntries = [];

      // Process fare receipts
      if (fareReceipts.success && fareReceipts.data) {
        allEntries = [...allEntries, ...fareReceipts.data.map(entry => ({
          ...entry,
          dataType: 'Fare Receipt',
          entryStatus: entry.entryStatus || 'pending',
          displayName: `Fare: ${entry.route || 'Daily Collection'}`,
          description: entry.route || 'Daily fare collection'
        }))];
      }

      // Process booking entries
      if (bookingEntries.success && bookingEntries.data) {
        allEntries = [...allEntries, ...bookingEntries.data.map(entry => ({
          ...entry,
          dataType: 'Booking Entry',
          entryStatus: entry.entryStatus || 'pending',
          displayName: `Booking: ${entry.bookingDetails || 'Booking'}`,
          description: entry.bookingDetails || 'Booking entry'
        }))];
      }

      // Process off days
      if (offDays.success && offDays.data) {
        allEntries = [...allEntries, ...offDays.data.map(entry => ({
          ...entry,
          dataType: 'Off Day',
          entryStatus: entry.entryStatus || 'pending',
          displayName: `Off Day: ${entry.reason || 'Off day'}`,
          description: entry.reason || 'Off day entry',
          totalAmount: 0
        }))];
      }

      // Process fuel payments
      if (fuelPayments.success && fuelPayments.data) {
        allEntries = [...allEntries, ...fuelPayments.data.map(entry => ({
          ...entry,
          dataType: 'Fuel Payment',
          entryStatus: entry.entryStatus || 'pending',
          displayName: `Fuel: ${entry.pumpName || 'Fuel Station'}`,
          description: entry.pumpName || 'Fuel payment'
        }))];
      }

      // Process other payment types
      if (addaPayments.success && addaPayments.data) {
        allEntries = [...allEntries, ...addaPayments.data.map(entry => ({
          ...entry,
          dataType: 'Adda Payment',
          entryStatus: entry.entryStatus || 'pending',
          displayName: `Adda: ${entry.addaName || 'Adda Fees'}`,
          description: entry.addaName || 'Adda payment'
        }))];
      }

      if (servicePayments.success && servicePayments.data) {
        allEntries = [...allEntries, ...servicePayments.data.map(entry => ({
          ...entry,
          dataType: 'Service Payment',
          entryStatus: entry.entryStatus || 'pending',
          displayName: `Service: ${entry.serviceType || 'Service'}`,
          description: entry.serviceType || 'Service payment'
        }))];
      }

      if (unionPayments.success && unionPayments.data) {
        allEntries = [...allEntries, ...unionPayments.data.map(entry => ({
          ...entry,
          dataType: 'Union Payment',
          entryStatus: entry.entryStatus || 'pending',
          displayName: `Union: ${entry.unionName || 'Union Fees'}`,
          description: entry.unionName || 'Union payment'
        }))];
      }

      if (otherPayments.success && otherPayments.data) {
        allEntries = [...allEntries, ...otherPayments.data.map(entry => ({
          ...entry,
          dataType: 'Other Payment',
          entryStatus: entry.entryStatus || 'pending',
          displayName: `Other: ${entry.paymentDetails || 'Other Payment'}`,
          description: entry.paymentDetails || 'Other payment'
        }))];
      }

      // Sort by timestamp (newest first)
      allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Separate by status
      setPendingData(allEntries.filter(entry => entry.entryStatus === 'pending'));
      setWaitingData(allEntries.filter(entry => entry.entryStatus === 'waiting'));
      setApprovedData(allEntries.filter(entry => entry.entryStatus === 'approved'));

    } catch (error) {
      console.error('Error loading approval data:', error);
      throw error;
    }
  };

  

  const handleApprove = async (entry) => {
    try {
      const approverName = currentUser.fullName || currentUser.username;

      // Call appropriate approval function based on data type
      let result;
      switch (entry.dataType) {
        case 'Fare Receipt':
          result = await authService.approveFareReceipt({
            entryId: entry.entryId,
            approverName: approverName
          });
          break;
        case 'Booking Entry':
          result = await authService.approveBookingEntry({
            entryId: entry.entryId,
            approverName: approverName
          });
          break;
        case 'Fuel Payment':
          result = await authService.approveFuelPayment({
            entryId: entry.entryId,
            approverName: approverName
          });
          break;
        case 'Other Payment':
          result = await authService.approveOtherPayment({
            entryId: entry.entryId,
            approverName: approverName
          });
          break;
        case 'Adda Payment':
          result = await authService.approveAddaPayment({
            entryId: entry.entryId,
            approverName: approverName
          });
          break;
        case 'Service Payment':
          result = await authService.approveServicePayment({
            entryId: entry.entryId,
            approverName: approverName
          });
          break;
        case 'Union Payment':
          result = await authService.approveUnionPayment({
            entryId: entry.entryId,
            approverName: approverName
          });
          break;
        default:
          throw new Error('Unknown data type');
      }

      if (result.success) {
        alert('Entry approved successfully!');
        loadApprovalData(); // Refresh data
      } else {
        throw new Error(result.error);
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
          result = await authService.resendFareReceipt({
            entryId: entry.entryId
          });
          break;
        case 'Booking Entry':
          result = await authService.resendBookingEntry({
            entryId: entry.entryId
          });
          break;
        case 'Fuel Payment':
          result = await authService.resendFuelPayment({
            entryId: entry.entryId
          });
          break;
        case 'Other Payment':
          result = await authService.resendOtherPayment({
            entryId: entry.entryId
          });
          break;
        case 'Adda Payment':
          result = await authService.resendAddaPayment({
            entryId: entry.entryId
          });
          break;
        case 'Service Payment':
          result = await authService.resendServicePayment({
            entryId: entry.entryId
          });
          break;
        case 'Union Payment':
          result = await authService.resendUnionPayment({
            entryId: entry.entryId
          });
          break;
        default:
          throw new Error('Unknown data type');
      }

      if (result.success) {
        alert('Entry resent successfully! User can now edit and resubmit.');
        loadApprovalData(); // Refresh data
      } else {
        throw new Error(result.error);
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
            {entry.entryStatus === 'waiting' && <i className="bi bi-lock-fill me-1"></i>}
            {entry.entryStatus.toUpperCase()}
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
          {entry.totalAmount > 0 && (
            <div className="entry-row">
              <span className="label">Total Amount:</span>
              <span className="value">₹{entry.totalAmount?.toLocaleString()}</span>
            </div>
          )}
          {entry.cashAmount > 0 && (
            <div className="entry-row">
              <span className="label">Cash Amount:</span>
              <span className="value">₹{entry.cashAmount?.toLocaleString()}</span>
            </div>
          )}
          {entry.bankAmount > 0 && (
            <div className="entry-row">
              <span className="label">Bank Amount:</span>
              <span className="value">₹{entry.bankAmount?.toLocaleString()}</span>
            </div>
          )}
          {entry.approvedBy && (
            <div className="entry-row">
              <span className="label">Approved By:</span>
              <span className="value">{entry.approvedBy}</span>
            </div>
          )}
        </div>

        <div className="entry-actions">
          {entry.entryStatus === 'waiting' && (
            <>
              <button 
                className="btn btn-success btn-sm"
                onClick={() => handleApprove(entry)}
                title="Approve this entry"
              >
                <i className="bi bi-check-circle"></i> Approve
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
          {entry.entryStatus === 'pending' && (
            <span className="badge bg-secondary">
              <i className="bi bi-clock"></i> Not sent for approval yet
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="data-approval-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <h2><i className="bi bi-clipboard-check"></i> Data Approval</h2>
          <p>Review and approve submitted entries</p>
          <button 
            className="btn btn-primary btn-sm refresh-btn"
            onClick={loadAllData}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh Data
          </button>
        </div>

        {/* Approval Tabs */}
        <div className="approval-tabs">
          <button 
            className={`tab-btn ${activeTab === 'waiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('waiting')}
          >
            <i className="bi bi-hourglass-split"></i> Waiting for Approval ({waitingData.length})
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
          {activeTab === 'waiting' && (
            <div className="entries-grid">
              {waitingData.length === 0 ? (
                <div className="no-data">
                  <i className="bi bi-hourglass-split"></i>
                  <p>No entries waiting for approval</p>
                </div>
              ) : (
                waitingData.map(renderEntryCard)
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

export default DataApproval;
