
import React, { useState, useEffect } from 'react';
import '../css/CashBook.css';
import { hybridDataService } from '../../services/hybridDataService';

const CashBook = ({ cashBookEntries, setCashBookEntries }) => {
  const [entries, setEntries] = useState([]);
  const [syncStatus, setSyncStatus] = useState({ isOnline: true, lastSync: null, pendingCount: 0 });
  const [loading, setLoading] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    loadCashBookData();
    
    // Set up sync status monitoring
    const updateSyncStatus = () => {
      const status = hybridDataService.getSyncStatus();
      setSyncStatus(status);
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Load cash book data from hybrid service
  const loadCashBookData = async () => {
    setLoading(true);
    try {
      const fareData = await hybridDataService.getFareReceipts();
      const bookingData = await hybridDataService.getBookingEntries();
      const offDayData = await hybridDataService.getOffDays();
      
      // Generate cash book entries from all data
      const allEntries = [];
      
      // Add fare receipt entries
      fareData.forEach(fare => {
        if (fare.cashAmount > 0) {
          allEntries.push({
            id: fare.entryId,
            date: fare.date,
            description: `Fare Receipt - ${fare.route}`,
            drCash: fare.cashAmount,
            crCash: 0,
            drBank: 0,
            crBank: 0,
            source: 'fare-receipt',
            synced: fare.synced || true,
            pendingSync: fare.pendingSync || false
          });
        }
        
        if (fare.bankAmount > 0) {
          allEntries.push({
            id: fare.entryId + '_bank',
            date: fare.date,
            description: `Fare Receipt (Bank) - ${fare.route}`,
            drCash: 0,
            crCash: 0,
            drBank: fare.bankAmount,
            crBank: 0,
            source: 'fare-receipt',
            synced: fare.synced || true,
            pendingSync: fare.pendingSync || false
          });
        }
      });

      // Add booking entries
      bookingData.forEach(booking => {
        if (booking.totalAmount > 0) {
          allEntries.push({
            id: booking.entryId,
            date: booking.date,
            description: `Booking - ${booking.route}`,
            drCash: booking.totalAmount,
            crCash: 0,
            drBank: 0,
            crBank: 0,
            source: 'booking',
            synced: booking.synced || true,
            pendingSync: booking.pendingSync || false
          });
        }
      });

      // Add off day entries
      offDayData.forEach(offDay => {
        allEntries.push({
          id: offDay.entryId,
          date: offDay.date,
          description: `Off Day - ${offDay.reason}`,
          drCash: 0,
          crCash: 0,
          drBank: 0,
          crBank: 0,
          source: 'off-day',
          synced: offDay.synced || true,
          pendingSync: offDay.pendingSync || false
        });
      });

      // Add existing cash book entries from props
      if (cashBookEntries) {
        cashBookEntries.forEach(entry => {
          allEntries.push({
            id: entry.id,
            date: entry.date,
            description: entry.description,
            drCash: entry.drCash || 0,
            crCash: entry.crCash || 0,
            drBank: entry.drBank || 0,
            crBank: entry.crBank || 0,
            source: entry.source,
            synced: entry.synced || true,
            pendingSync: entry.pendingSync || false
          });
        });
      }

      // Sort entries by date (newest first)
      allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading cash book data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manual sync function
  const handleManualSync = async () => {
    setLoading(true);
    try {
      await hybridDataService.forceSyncAll();
      await loadCashBookData();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = entries.reduce((acc, entry) => {
      acc.drCash += entry.drCash || 0;
      acc.crCash += entry.crCash || 0;
      acc.drBank += entry.drBank || 0;
      acc.crBank += entry.crBank || 0;
      return acc;
    }, { drCash: 0, crCash: 0, drBank: 0, crBank: 0 });

    return {
      ...totals,
      cashBalance: totals.drCash - totals.crCash,
      bankBalance: totals.drBank - totals.crBank
    };
  };

  const totals = calculateTotals();

  return (
    <div className="cash-book-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="cash-book-header">
          <h2>
            <i className="bi bi-book"></i> Cash Book (Double Column)
          </h2>
          <p>Complete record of all cash and bank transactions</p>
        </div>

        {/* Sync Status */}
        <div className="sync-status-bar">
          <div className="sync-info">
            <span className={`sync-indicator ${syncStatus.isOnline ? 'online' : 'offline'}`}>
              <i className={`bi ${syncStatus.isOnline ? 'bi-wifi' : 'bi-wifi-off'}`}></i>
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </span>
            {syncStatus.lastSync && (
              <span className="last-sync">
                Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
              </span>
            )}
            {syncStatus.pendingCount > 0 && (
              <span className="pending-count">
                {syncStatus.pendingCount} pending
              </span>
            )}
          </div>
          <div className="sync-actions">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={handleManualSync}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
              {loading ? 'Syncing...' : 'Manual Sync'}
            </button>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={loadCashBookData}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-2 col-6 mb-3">
            <div className="summary-card dr-cash-card">
              <div className="card-body">
                <h6>Cash Debit (Dr)</h6>
                <h4>₹{totals.drCash.toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6 mb-3">
            <div className="summary-card cr-cash-card">
              <div className="card-body">
                <h6>Cash Credit (Cr)</h6>
                <h4>₹{totals.crCash.toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6 mb-3">
            <div className="summary-card dr-bank-card">
              <div className="card-body">
                <h6>Bank Debit (Dr)</h6>
                <h4>₹{totals.drBank.toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6 mb-3">
            <div className="summary-card cr-bank-card">
              <div className="card-body">
                <h6>Bank Credit (Cr)</h6>
                <h4>₹{totals.crBank.toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6 mb-3">
            <div className="summary-card cash-balance-card">
              <div className="card-body">
                <h6>Cash Balance</h6>
                <h4>₹{totals.cashBalance.toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-6 mb-3">
            <div className="summary-card bank-balance-card">
              <div className="card-body">
                <h6>Bank Balance</h6>
                <h4>₹{totals.bankBalance.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Book Table */}
        <div className="double-column-cash-book">
          <div className="cash-book-header-row">
            <div className="row">
              <div className="col-6">
                <h4><i className="bi bi-plus-circle"></i> Debit (Dr)</h4>
              </div>
              <div className="col-6">
                <h4><i className="bi bi-dash-circle"></i> Credit (Cr)</h4>
              </div>
            </div>
          </div>

          <div className="cash-book-table-container">
            <table className="table table-bordered cash-book-table">
              <thead>
                <tr>
                  <th className="dr-header">Date</th>
                  <th className="dr-header">Description</th>
                  <th className="dr-header">Cash (₹)</th>
                  <th className="dr-header">Bank (₹)</th>
                  <th className="dr-header">Source</th>
                  <th className="cr-header">Date</th>
                  <th className="cr-header">Description</th>
                  <th className="cr-header">Cash (₹)</th>
                  <th className="cr-header">Bank (₹)</th>
                  <th className="cr-header">Source</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Loading entries...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted">
                      No entries found
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => (
                    <tr key={entry.id || index}>
                      {/* Debit Side */}
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>
                        {entry.description}
                        {entry.pendingSync && (
                          <span className="badge bg-warning ms-2">Pending</span>
                        )}
                      </td>
                      <td>{entry.drCash > 0 ? `₹${entry.drCash.toFixed(2)}` : '-'}</td>
                      <td>{entry.drBank > 0 ? `₹${entry.drBank.toFixed(2)}` : '-'}</td>
                      <td>
                        <span className="badge bg-secondary">{entry.source}</span>
                      </td>
                      
                      {/* Credit Side */}
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>
                        {entry.description}
                        {entry.pendingSync && (
                          <span className="badge bg-warning ms-2">Pending</span>
                        )}
                      </td>
                      <td>{entry.crCash > 0 ? `₹${entry.crCash.toFixed(2)}` : '-'}</td>
                      <td>{entry.crBank > 0 ? `₹${entry.crBank.toFixed(2)}` : '-'}</td>
                      <td>
                        <span className="badge bg-secondary">{entry.source}</span>
                      </td>
                    </tr>
                  ))
                )}
                
                {/* Totals Row */}
                <tr className="final-totals-row">
                  <td colSpan="2" className="text-end"><strong>Total:</strong></td>
                  <td className="total-cell"><strong>₹{totals.drCash.toFixed(2)}</strong></td>
                  <td className="total-cell"><strong>₹{totals.drBank.toFixed(2)}</strong></td>
                  <td></td>
                  <td colSpan="2" className="text-end"><strong>Total:</strong></td>
                  <td className="total-cell"><strong>₹{totals.crCash.toFixed(2)}</strong></td>
                  <td className="total-cell"><strong>₹{totals.crBank.toFixed(2)}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h5>Cash Balance</h5>
                <h3 className={totals.cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                  ₹{totals.cashBalance.toFixed(2)}
                </h3>
                <small className="text-muted">
                  {totals.cashBalance >= 0 ? 'Cash in hand' : 'Cash shortage'}
                </small>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h5>Bank Balance</h5>
                <h3 className={totals.bankBalance >= 0 ? 'text-success' : 'text-danger'}>
                  ₹{totals.bankBalance.toFixed(2)}
                </h3>
                <small className="text-muted">
                  {totals.bankBalance >= 0 ? 'Bank balance' : 'Bank overdraft'}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashBook;
