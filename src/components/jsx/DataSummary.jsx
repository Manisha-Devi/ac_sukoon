import React, { useState, useEffect, useRef } from "react";
import "../css/DataSummary.css";
import hybridDataService from '../../services/hybridDataService.js';
import localStorageService from '../../services/localStorageService.js';

function DataSummary({ fareData, expenseData, cashBookEntries }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentFareData, setCurrentFareData] = useState([]);
  const [currentExpenseData, setCurrentExpenseData] = useState([]);
  const [currentCashBookEntries, setCurrentCashBookEntries] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [settlementData, setSettlementData] = useState({
    cashSettlement: "",
    bankSettlement: "",
    settlementWith: "",
    remarks: ""
  });
  const [syncStatus, setSyncStatus] = useState(hybridDataService.getSyncStatus());

  // Force refresh function
  const forceRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  // Load data from localStorage immediately for real-time updates
  useEffect(() => {
    const loadLatestData = () => {
      console.log('📊 DataSummary - Loading latest data from localStorage...');

      // Always load fresh data from localStorage
      const localFareData = localStorageService.loadFareData();
      const localCashBookEntries = JSON.parse(localStorage.getItem('cashBookEntries') || '[]');

      console.log('📊 DataSummary - Fresh data loaded:', {
        fareEntries: localFareData.length,
        expenseEntries: expenseData.length,
        cashBookEntries: localCashBookEntries.length
      });

      // Update local state immediately
      setCurrentFareData(localFareData);
      setCurrentExpenseData(expenseData);
      setCurrentCashBookEntries(localCashBookEntries);
    };

    // Load data immediately
    loadLatestData();

    // Listen for all data update events for immediate refresh
    const handleDataUpdate = () => {
      console.log('📊 DataSummary - Data updated, refreshing from localStorage');
      loadLatestData();
      forceRefresh();
    };

    const handleFareDataUpdate = (event) => {
      console.log('📊 DataSummary - Fare data updated, immediate refresh');
      loadLatestData();
      forceRefresh();
    };

    const handleCashBookUpdate = (event) => {
      console.log('📊 DataSummary - Cash book updated, immediate refresh');
      loadLatestData();
      forceRefresh();
    };

    const handleComponentRefresh = () => {
      console.log('📊 DataSummary - Component refresh triggered');
      loadLatestData();
      forceRefresh();
    };

    // Listen for all possible data update events
    window.addEventListener('storage', handleDataUpdate);
    window.addEventListener('dataUpdated', handleDataUpdate);
    window.addEventListener('fareDataUpdated', handleFareDataUpdate);
    window.addEventListener('cashBookUpdated', handleCashBookUpdate);
    window.addEventListener('componentRefresh', handleComponentRefresh);

    return () => {
      window.removeEventListener('storage', handleDataUpdate);
      window.removeEventListener('dataUpdated', handleDataUpdate);
      window.removeEventListener('fareDataUpdated', handleFareDataUpdate);
      window.removeEventListener('cashBookUpdated', handleCashBookUpdate);
      window.removeEventListener('componentRefresh', handleComponentRefresh);
    };
  }, [fareData, expenseData, cashBookEntries, refreshCounter]);

  // Monitor sync status
  useEffect(() => {
    const updateSyncStatus = () => {
      const newStatus = hybridDataService.getSyncStatus();
      setSyncStatus(newStatus);
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 1000);

    // Listen for sync status changes
    const handleSyncStatusChange = () => {
      updateSyncStatus();
    };

    window.addEventListener('syncStatusChanged', handleSyncStatusChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('syncStatusChanged', handleSyncStatusChange);
    };
  }, []);

  // Calculate totals using current state data (always fresh from localStorage)
  const calculateTotals = () => {
    // Get current user info for filtering
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    // Filter fare data by current user
    const userFareData = currentFareData.filter(entry => 
      entry.submittedBy === currentUserName
    );

    // Filter expense data by current user
    const userExpenseData = currentExpenseData.filter(entry => 
      entry.submittedBy === currentUserName
    );

    // Calculate fare totals
    const totalFareCash = userFareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
    const totalFareBank = userFareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
    const totalFareAmount = totalFareCash + totalFareBank;

    // Calculate expense totals
    const totalExpenseCash = userExpenseData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
    const totalExpenseBank = userExpenseData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
    const totalExpenseAmount = totalExpenseCash + totalExpenseBank;

    // Calculate profit/loss
    const profit = totalFareAmount - totalExpenseAmount;
    const profitPercentage = totalExpenseAmount > 0 ? ((profit / totalExpenseAmount) * 100).toFixed(1) : 0;

    return {
      totalFareCash,
      totalFareBank,
      totalFareAmount,
      totalExpenseCash,
      totalExpenseBank,
      totalExpenseAmount,
      profit,
      profitPercentage,
      fareEntries: userFareData.length,
      expenseEntries: userExpenseData.length
    };
  };

  const totals = calculateTotals();

  const handleApprovalSubmit = (e) => {
    e.preventDefault();

    const approvalEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'settlement',
      cashSettlement: parseInt(settlementData.cashSettlement) || 0,
      bankSettlement: parseInt(settlementData.bankSettlement) || 0,
      totalSettlement: (parseInt(settlementData.cashSettlement) || 0) + (parseInt(settlementData.bankSettlement) || 0),
      settlementWith: settlementData.settlementWith,
      remarks: settlementData.remarks,
      timestamp: new Date().toISOString(),
      submittedBy: JSON.parse(localStorage.getItem('user') || '{}').fullName || 'Unknown User'
    };

    // Add settlement to localStorage
    const existingSettlements = JSON.parse(localStorage.getItem('settlements') || '[]');
    existingSettlements.unshift(approvalEntry);
    localStorage.setItem('settlements', JSON.stringify(existingSettlements));

    console.log('✅ Settlement added:', approvalEntry);

    // Reset form and close modal
    setSettlementData({
      cashSettlement: "",
      bankSettlement: "",
      settlementWith: "",
      remarks: ""
    });
    setShowApprovalModal(false);

    // Trigger data refresh
    forceRefresh();
  };

  return (
    <div className="data-summary-container">
      <div className="container-fluid">
        <div className="summary-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-clipboard-data"></i> Data Summary & Approval</h2>
              <p>Review and approve financial entries</p>
            </div>
            <div className="header-actions">
              <div className="sync-status">
                <div className={`simple-sync-indicator ${syncStatus.pendingSync > 0 || syncStatus.syncInProgress ? 'syncing' : 'synced'}`}>
                  {syncStatus.pendingSync > 0 || syncStatus.syncInProgress ? (
                    <i className="bi bi-arrow-clockwise"></i>
                  ) : (
                    <i className="bi bi-check-circle"></i>
                  )}
                </div>
                <span className="sync-text">
                  {syncStatus.pendingSync > 0 ? `${syncStatus.pendingSync} pending` : 'All synced'}
                </span>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setShowApprovalModal(true)}
              >
                <i className="bi bi-check-circle"></i> Add Settlement
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards - Real-time data */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="summary-card income-card">
              <div className="card-body">
                <div className="card-header">
                  <h6>Total Earnings (Income)</h6>
                  <i className="bi bi-arrow-up-circle text-success"></i>
                </div>
                <h3>₹{totals.totalFareAmount.toLocaleString('en-IN')}</h3>
                <div className="card-details">
                  <small>Cash: ₹{totals.totalFareCash.toLocaleString('en-IN')} | Bank: ₹{totals.totalFareBank.toLocaleString('en-IN')}</small>
                  <div className="entry-count">{totals.fareEntries} entries</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="summary-card expense-card">
              <div className="card-body">
                <div className="card-header">
                  <h6>Total Expenses</h6>
                  <i className="bi bi-arrow-down-circle text-danger"></i>
                </div>
                <h3>₹{totals.totalExpenseAmount.toLocaleString('en-IN')}</h3>
                <div className="card-details">
                  <small>Cash: ₹{totals.totalExpenseCash.toLocaleString('en-IN')} | Bank: ₹{totals.totalExpenseBank.toLocaleString('en-IN')}</small>
                  <div className="entry-count">{totals.expenseEntries} entries</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className={`summary-card ${totals.profit >= 0 ? 'profit-card' : 'loss-card'}`}>
              <div className="card-body">
                <div className="card-header">
                  <h6>{totals.profit >= 0 ? 'Net Profit' : 'Net Loss'}</h6>
                  <i className={`bi ${totals.profit >= 0 ? 'bi-arrow-up-circle text-success' : 'bi-arrow-down-circle text-danger'}`}></i>
                </div>
                <h3>₹{Math.abs(totals.profit).toLocaleString('en-IN')}</h3>
                <div className="card-details">
                  <small>{totals.profitPercentage}% margin</small>
                  <div className="entry-count">
                    {totals.profit >= 0 ? 'Profitable' : 'Loss'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="summary-card entries-card">
              <div className="card-body">
                <div className="card-header">
                  <h6>Cash Book Entries</h6>
                  <i className="bi bi-journal-text"></i>
                </div>
                <h3>{currentCashBookEntries.length}</h3>
                <div className="card-details">
                  <small>Auto-generated entries</small>
                  <div className="entry-count">Real-time sync</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Entries - Real-time data */}
        <div className="row">
          {/* Recent Fare Entries */}
          <div className="col-lg-6 mb-4">
            <div className="recent-entries-card">
              <div className="card-header">
                <h5><i className="bi bi-receipt"></i> Recent Fare Entries</h5>
                <span className="entry-count">{currentFareData.length} total</span>
              </div>
              <div className="entries-list">
                {currentFareData.slice(0, 5).map((entry) => (
                  <div key={entry.entryId} className="entry-item">
                    <div className="entry-info">
                      <div className="entry-type-badge">
                        <span className={`badge ${entry.type}`}>
                          {entry.type === 'daily' ? 'Daily' : entry.type === 'booking' ? 'Booking' : 'Off Day'}
                        </span>
                      </div>
                      <div className="entry-details">
                        <div className="entry-title">
                          {entry.type === 'daily' && entry.route}
                          {entry.type === 'booking' && entry.bookingDetails?.substring(0, 30)}
                          {entry.type === 'off' && entry.reason}
                        </div>
                        <div className="entry-date">
                          {entry.type === 'daily' && entry.date}
                          {entry.type === 'booking' && `${entry.dateFrom} - ${entry.dateTo}`}
                          {entry.type === 'off' && entry.date}
                        </div>
                      </div>
                    </div>
                    {entry.type !== 'off' && (
                      <div className="entry-amount">
                        <strong>₹{entry.totalAmount?.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <div className="sync-indicator">
                      {entry.synced ? (
                        <i className="bi bi-check-circle text-success" title="Synced"></i>
                      ) : (
                        <i className="bi bi-clock text-warning" title="Pending sync"></i>
                      )}
                    </div>
                  </div>
                ))}
                {currentFareData.length === 0 && (
                  <div className="no-entries">
                    <i className="bi bi-inbox"></i>
                    <p>No fare entries found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Expense Entries */}
          <div className="col-lg-6 mb-4">
            <div className="recent-entries-card">
              <div className="card-header">
                <h5><i className="bi bi-credit-card"></i> Recent Expense Entries</h5>
                <span className="entry-count">{currentExpenseData.length} total</span>
              </div>
              <div className="entries-list">
                {currentExpenseData.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="entry-item">
                    <div className="entry-info">
                      <div className="entry-type-badge">
                        <span className="badge expense">{entry.category || 'Expense'}</span>
                      </div>
                      <div className="entry-details">
                        <div className="entry-title">
                          {entry.description || entry.category || 'Expense'}
                        </div>
                        <div className="entry-date">{entry.date}</div>
                      </div>
                    </div>
                    <div className="entry-amount">
                      <strong>₹{entry.totalAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
                {currentExpenseData.length === 0 && (
                  <div className="no-entries">
                    <i className="bi bi-inbox"></i>
                    <p>No expense entries found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settlement Modal */}
        {showApprovalModal && (
          <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-check-circle"></i> Add Settlement Entry
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowApprovalModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleApprovalSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Cash Settlement (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settlementData.cashSettlement}
                          onChange={(e) => setSettlementData({...settlementData, cashSettlement: e.target.value})}
                          placeholder="Enter cash settlement amount"
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Bank Settlement (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settlementData.bankSettlement}
                          onChange={(e) => setSettlementData({...settlementData, bankSettlement: e.target.value})}
                          placeholder="Enter bank settlement amount"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Settlement With</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settlementData.settlementWith}
                        onChange={(e) => setSettlementData({...settlementData, settlementWith: e.target.value})}
                        placeholder="Enter person/organization name"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={settlementData.remarks}
                        onChange={(e) => setSettlementData({...settlementData, remarks: e.target.value})}
                        placeholder="Enter additional remarks..."
                      />
                    </div>
                    <div className="settlement-summary mb-3">
                      <div className="row">
                        <div className="col-4">
                          <span>Cash: ₹{parseInt(settlementData.cashSettlement) || 0}</span>
                        </div>
                        <div className="col-4">
                          <span>Bank: ₹{parseInt(settlementData.bankSettlement) || 0}</span>
                        </div>
                        <div className="col-4">
                          <strong>Total: ₹{(parseInt(settlementData.cashSettlement) || 0) + (parseInt(settlementData.bankSettlement) || 0)}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowApprovalModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check-circle"></i> Add Settlement
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataSummary;