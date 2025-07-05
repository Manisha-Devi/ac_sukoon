
import React, { useState, useEffect } from "react";
import "../css/DataApproval.css";

function DataSummary({ fareData, expenseData }) {
  const [allEntries, setAllEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  }, []);

  // Process centralized data from props
  useEffect(() => {
    if (!fareData || !expenseData) return;

    let combinedEntries = [];

    // Process fare data
    fareData.forEach(entry => {
      combinedEntries.push({
        ...entry,
        dataType: entry.type === 'daily' ? 'Fare Receipt' : 
                  entry.type === 'booking' ? 'Booking Entry' : 'Off Day',
        displayName: entry.type === 'daily' ? `Fare: ${entry.route}` :
                    entry.type === 'booking' ? `Booking: ${entry.bookingDetails}` :
                    `Off Day: ${entry.reason}`,
        description: entry.route || entry.bookingDetails || entry.reason || 'Fare entry'
      });
    });

    // Process expense data
    expenseData.forEach(entry => {
      let dataType = '';
      let displayName = '';
      
      switch(entry.type) {
        case 'fuel':
          dataType = 'Fuel Payment';
          displayName = `Fuel: ${entry.pumpName || 'Fuel Station'}`;
          break;
        case 'adda':
          dataType = 'Adda Payment';
          displayName = `Adda: ${entry.addaName || 'Adda Fees'}`;
          break;
        case 'union':
          dataType = 'Union Payment';
          displayName = `Union: ${entry.unionName || 'Union Fees'}`;
          break;
        case 'service':
          dataType = 'Service Payment';
          displayName = `Service: ${entry.serviceType || 'Service'}`;
          break;
        case 'other':
          dataType = 'Other Payment';
          displayName = `Other: ${entry.paymentDetails || 'Other Payment'}`;
          break;
        default:
          dataType = 'Payment';
          displayName = `Payment: ${entry.description || 'Payment'}`;
      }

      combinedEntries.push({
        ...entry,
        dataType: dataType,
        displayName: displayName,
        description: entry.description || entry.pumpName || entry.addaName || 'Payment'
      });
    });

    // Sort by date (newest first)
    combinedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    setAllEntries(combinedEntries);
  }, [fareData, expenseData]);

  // Filter entries based on active tab and date range
  useEffect(() => {
    let filtered = [...allEntries];

    // Filter by data type
    if (activeTab === 'income') {
      filtered = filtered.filter(entry => 
        entry.dataType === 'Fare Receipt' || 
        entry.dataType === 'Booking Entry'
      );
    } else if (activeTab === 'expenses') {
      filtered = filtered.filter(entry => 
        entry.dataType !== 'Fare Receipt' && 
        entry.dataType !== 'Booking Entry' && 
        entry.dataType !== 'Off Day'
      );
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        if (dateFrom && entryDate < new Date(dateFrom)) return false;
        if (dateTo && entryDate > new Date(dateTo)) return false;
        return true;
      });
    }

    setFilteredEntries(filtered);
  }, [allEntries, activeTab, dateFrom, dateTo]);

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  const calculateTotals = (entries) => {
    return entries.reduce((totals, entry) => {
      totals.cash += entry.cashAmount || 0;
      totals.bank += entry.bankAmount || 0;
      totals.total += entry.totalAmount || 0;
      return totals;
    }, { cash: 0, bank: 0, total: 0 });
  };

  const renderEntryCard = (entry) => {
    return (
      <div key={entry.entryId} className="approval-entry-card">
        <div className="entry-header">
          <div className="entry-type-badge">
            {entry.dataType}
          </div>
          <div className="entry-status-badge" data-status="approved">
            <i className="bi bi-check-circle-fill me-1"></i>
            RECORDED
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
          <div className="entry-row">
            <span className="label">Time:</span>
            <span className="value">{entry.timestamp}</span>
          </div>
        </div>
      </div>
    );
  };

  const totals = calculateTotals(filteredEntries);

  return (
    <div className="data-approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <h2><i className="bi bi-clipboard-data"></i> Data Summary</h2>
          <p>View all recorded entries from centralized data</p>
          <small className="text-muted">Data automatically synced from app state</small>
        </div>

        {/* Date Filter */}
        <div className="date-filter mb-3">
          <div className="row align-items-end">
            <div className="col-md-3">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={clearDateFilter}
                disabled={!dateFrom && !dateTo}
              >
                <i className="bi bi-x-circle"></i> Clear Filter
              </button>
            </div>
            <div className="col-md-3">
              <small className="text-muted">
                {filteredEntries.length} entries found
              </small>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="summary-card cash-card">
              <div className="card-body">
                <h6>Total Cash</h6>
                <h4>₹{totals.cash.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card bank-card">
              <div className="card-body">
                <h6>Total Bank</h6>
                <h4>₹{totals.bank.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card total-card">
              <div className="card-body">
                <h6>Grand Total</h6>
                <h4>₹{totals.total.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card entries-card">
              <div className="card-body">
                <h6>Total Entries</h6>
                <h4>{filteredEntries.length}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Data Type Tabs */}
        <div className="approval-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <i className="bi bi-list-ul"></i> All Entries ({allEntries.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => setActiveTab('income')}
          >
            <i className="bi bi-arrow-up-circle"></i> Income ({allEntries.filter(e => e.dataType === 'Fare Receipt' || e.dataType === 'Booking Entry').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <i className="bi bi-arrow-down-circle"></i> Expenses ({allEntries.filter(e => e.dataType !== 'Fare Receipt' && e.dataType !== 'Booking Entry' && e.dataType !== 'Off Day').length})
          </button>
        </div>

        {/* Entries Grid */}
        <div className="tab-content">
          <div className="entries-grid">
            {filteredEntries.length === 0 ? (
              <div className="no-data">
                <i className="bi bi-inbox"></i>
                <p>No entries found for the selected criteria</p>
              </div>
            ) : (
              filteredEntries.map(renderEntryCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataSummary;
