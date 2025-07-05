
import React, { useState, useEffect } from "react";
import "../css/DataApproval.css";
import authService from "../../services/authService.js";

function DataApproval() {
  const [pendingData, setPendingData] = useState([]);
  const [waitingData, setWaitingData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    loadApprovalData();
  }, []);

  const loadApprovalData = async () => {
    try {
      setLoading(true);
      
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
          entryStatus: entry.entryStatus || 'pending'
        }))];
      }

      // Process booking entries
      if (bookingEntries.success && bookingEntries.data) {
        allEntries = [...allEntries, ...bookingEntries.data.map(entry => ({
          ...entry,
          dataType: 'Booking Entry',
          entryStatus: entry.entryStatus || 'pending'
        }))];
      }

      // Process off days
      if (offDays.success && offDays.data) {
        allEntries = [...allEntries, ...offDays.data.map(entry => ({
          ...entry,
          dataType: 'Off Day',
          entryStatus: entry.entryStatus || 'pending'
        }))];
      }

      // Process fuel payments
      if (fuelPayments.success && fuelPayments.data) {
        allEntries = [...allEntries, ...fuelPayments.data.map(entry => ({
          ...entry,
          dataType: 'Fuel Payment',
          entryStatus: entry.entryStatus || 'pending'
        }))];
      }

      // Process other payment types
      if (addaPayments.success && addaPayments.data) {
        allEntries = [...allEntries, ...addaPayments.data.map(entry => ({
          ...entry,
          dataType: 'Adda Payment',
          entryStatus: entry.entryStatus || 'pending'
        }))];
      }

      if (servicePayments.success && servicePayments.data) {
        allEntries = [...allEntries, ...servicePayments.data.map(entry => ({
          ...entry,
          dataType: 'Service Payment',
          entryStatus: entry.entryStatus || 'pending'
        }))];
      }

      if (unionPayments.success && unionPayments.data) {
        allEntries = [...allEntries, ...unionPayments.data.map(entry => ({
          ...entry,
          dataType: 'Union Payment',
          entryStatus: entry.entryStatus || 'pending'
        }))];
      }

      if (otherPayments.success && otherPayments.data) {
        allEntries = [...allEntries, ...otherPayments.data.map(entry => ({
          ...entry,
          dataType: 'Other Payment',
          entryStatus: entry.entryStatus || 'pending'
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
      alert('Error loading approval data: ' + error.message);
    } finally {
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
        // Add other payment types as needed
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
        // Add other payment types as needed
        default:
          throw new Error('Unknown data type');
      }

      if (result.success) {
        alert('Entry resent successfully!');
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
            {entry.entryStatus.toUpperCase()}
          </div>
        </div>
        
        <div className="entry-details">
          <div className="entry-row">
            <span className="label">Submitted By:</span>
            <span className="value">{entry.submittedBy}</span>
          </div>
          <div className="entry-row">
            <span className="label">Date:</span>
            <span className="value">{entry.date}</span>
          </div>
          {entry.totalAmount && (
            <div className="entry-row">
              <span className="label">Amount:</span>
              <span className="value">₹{entry.totalAmount?.toLocaleString()}</span>
            </div>
          )}
          {entry.description && (
            <div className="entry-row">
              <span className="label">Description:</span>
              <span className="value">{entry.description}</span>
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
              >
                <i className="bi bi-check-circle"></i> Approve
              </button>
              <button 
                className="btn btn-warning btn-sm"
                onClick={() => handleResend(entry)}
              >
                <i className="bi bi-arrow-clockwise"></i> Resend
              </button>
            </>
          )}
          {entry.entryStatus === 'approved' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleResend(entry)}
            >
              <i className="bi bi-arrow-clockwise"></i> Resend for Edit
            </button>
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
          <p>Loading approval data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <h2><i className="bi bi-clipboard-check"></i> Data Approval Management</h2>
          <p>Manage and approve data entries from drivers</p>
          <button 
            className="btn btn-primary btn-sm refresh-btn"
            onClick={loadApprovalData}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="approval-tabs">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingData.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'waiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('waiting')}
          >
            Waiting for Approval ({waitingData.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedData.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
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
        </div>
      </div>
    </div>
  );
}

export default DataApproval;
import React, { useState, useEffect } from 'react';
import authService from '../../services/authService.js';
import '../css/DataApproval.css';

function DataApproval() {
  const [pendingData, setPendingData] = useState([]);
  const [waitingData, setWaitingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    loadPendingData();
  }, []);

  const loadPendingData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data types
      const [fareReceipts, fuelPayments, otherPayments] = await Promise.all([
        authService.getFareReceipts(),
        authService.getFuelPayments(),
        authService.getOtherPayments()
      ]);

      let allData = [];
      
      // Process fare receipts
      if (fareReceipts.success && fareReceipts.data) {
        allData.push(...fareReceipts.data.map(entry => ({
          ...entry,
          dataType: 'fare',
          displayName: `Fare: ${entry.route}`,
          dateInfo: entry.date
        })));
      }

      // Process fuel payments
      if (fuelPayments.success && fuelPayments.data) {
        allData.push(...fuelPayments.data.map(entry => ({
          ...entry,
          dataType: 'fuel',
          displayName: `Fuel: ${entry.pumpName || 'Fuel Station'}`,
          dateInfo: entry.date
        })));
      }

      // Process other payments
      if (otherPayments.success && otherPayments.data) {
        allData.push(...otherPayments.data.map(entry => ({
          ...entry,
          dataType: 'other',
          displayName: `Other: ${entry.paymentDetails}`,
          dateInfo: entry.date
        })));
      }

      // Filter pending and waiting entries
      const pending = allData.filter(entry => entry.entryStatus === 'pending' || !entry.entryStatus);
      const waiting = allData.filter(entry => entry.entryStatus === 'waiting');

      setPendingData(pending);
      setWaitingData(waiting);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (entry) => {
    try {
      let result;
      const approverName = currentUser.fullName || currentUser.username;

      if (entry.dataType === 'fare') {
        result = await authService.approveFareReceipt({
          entryId: entry.entryId,
          approverName: approverName
        });
      } else if (entry.dataType === 'fuel') {
        result = await authService.approveFuelPayment({
          entryId: entry.entryId,
          approverName: approverName
        });
      } else if (entry.dataType === 'other') {
        result = await authService.approveOtherPayment({
          entryId: entry.entryId,
          approverName: approverName
        });
      }

      if (result && result.success) {
        alert('Entry approved successfully!');
        loadPendingData(); // Refresh data
      } else {
        alert('Failed to approve entry: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving entry:', error);
      alert('Error approving entry');
    }
  };

  const handleResend = async (entry) => {
    try {
      let result;

      if (entry.dataType === 'fare') {
        result = await authService.resendFareReceipt({
          entryId: entry.entryId
        });
      } else if (entry.dataType === 'fuel') {
        result = await authService.resendFuelPayment({
          entryId: entry.entryId
        });
      } else if (entry.dataType === 'other') {
        result = await authService.resendOtherPayment({
          entryId: entry.entryId
        });
      }

      if (result && result.success) {
        alert('Entry resent for correction!');
        loadPendingData(); // Refresh data
      } else {
        alert('Failed to resend entry: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error resending entry:', error);
      alert('Error resending entry');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading approval data...</p>
      </div>
    );
  }

  return (
    <div className="data-approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <h2><i className="bi bi-check2-square"></i> Data Approval Center</h2>
          <p>Review and approve pending data entries</p>
        </div>

        {/* Waiting for Approval Section */}
        <div className="approval-section mb-4">
          <h4><i className="bi bi-hourglass-split text-info"></i> Waiting for Approval ({waitingData.length})</h4>
          {waitingData.length === 0 ? (
            <div className="no-data">
              <p>No entries waiting for approval</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Cash Amount</th>
                    <th>Bank Amount</th>
                    <th>Total Amount</th>
                    <th>Submitted By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingData.map((entry) => (
                    <tr key={entry.entryId}>
                      <td>
                        <span className={`badge bg-${entry.dataType === 'fare' ? 'primary' : entry.dataType === 'fuel' ? 'warning' : 'info'}`}>
                          {entry.dataType.toUpperCase()}
                        </span>
                      </td>
                      <td>{entry.displayName}</td>
                      <td>{entry.dateInfo}</td>
                      <td>₹{entry.cashAmount || 0}</td>
                      <td>₹{entry.bankAmount || 0}</td>
                      <td>₹{entry.totalAmount || 0}</td>
                      <td>{entry.submittedBy}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(entry)}
                          >
                            <i className="bi bi-check-circle"></i> Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handleResend(entry)}
                          >
                            <i className="bi bi-arrow-clockwise"></i> Resend
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

        {/* Pending Entries Section */}
        <div className="approval-section">
          <h4><i className="bi bi-clock text-warning"></i> Recent Pending Entries ({pendingData.length})</h4>
          {pendingData.length === 0 ? (
            <div className="no-data">
              <p>No pending entries found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Cash Amount</th>
                    <th>Bank Amount</th>
                    <th>Total Amount</th>
                    <th>Submitted By</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingData.map((entry) => (
                    <tr key={entry.entryId}>
                      <td>
                        <span className={`badge bg-${entry.dataType === 'fare' ? 'primary' : entry.dataType === 'fuel' ? 'warning' : 'info'}`}>
                          {entry.dataType.toUpperCase()}
                        </span>
                      </td>
                      <td>{entry.displayName}</td>
                      <td>{entry.dateInfo}</td>
                      <td>₹{entry.cashAmount || 0}</td>
                      <td>₹{entry.bankAmount || 0}</td>
                      <td>₹{entry.totalAmount || 0}</td>
                      <td>{entry.submittedBy}</td>
                      <td>
                        <span className="badge bg-secondary">
                          <i className="bi bi-clock"></i> Pending
                        </span>
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
  );
}

export default DataApproval;
