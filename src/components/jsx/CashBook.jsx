
import React, { useState, useMemo, useEffect } from "react";
import "../css/CashBook.css";
import { getCashBookEntries } from "../../services/googleSheetsAPI";

const CashBook = () => {
  const [cashBookEntries, setCashBookEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadCashBookEntries();
  }, []);

  const loadCashBookEntries = async () => {
    try {
      setLoading(true);
      const response = await getCashBookEntries();
      if (response.success) {
        setCashBookEntries(response.data || []);
      } else {
        setError(response.error || 'Failed to load cash book entries');
      }
    } catch (error) {
      setError('Error loading cash book entries: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate date ranges
  const getWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { start: startOfWeek, end: endOfWeek };
  };

  const getMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: startOfMonth, end: endOfMonth };
  };

  // Filter entries based on selected filter
  const filteredEntries = useMemo(() => {
    if (!cashBookEntries || cashBookEntries.length === 0) return [];

    let filtered = [...cashBookEntries];

    switch (filterType) {
      case 'week': {
        const { start, end } = getWeekRange();
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });
        break;
      }
      case 'month': {
        const { start, end } = getMonthRange();
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });
        break;
      }
      case 'custom': {
        if (customDateFrom && customDateTo) {
          const fromDate = new Date(customDateFrom);
          const toDate = new Date(customDateTo);
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= fromDate && entryDate <= toDate;
          });
        }
        break;
      }
      default:
        // 'all' - no filtering
        break;
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [cashBookEntries, filterType, customDateFrom, customDateTo]);

  // Calculate totals for filtered entries
  const calculateTotals = useMemo(() => {
    let drCash = 0, drBank = 0, crCash = 0, crBank = 0;

    filteredEntries.forEach(entry => {
      if (entry.type === 'dr') {
        drCash += entry.cashAmount || 0;
        drBank += entry.bankAmount || 0;
      } else if (entry.type === 'cr') {
        crCash += entry.cashAmount || 0;
        crBank += entry.bankAmount || 0;
      }
    });

    return {
      drCash,
      drBank,
      crCash,
      crBank,
      cashBalance: drCash - crCash,
      bankBalance: drBank - crBank,
      totalDr: drCash + drBank,
      totalCr: crCash + crBank
    };
  }, [filteredEntries]);

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-journal-text me-2"></i>
        Cash Book
      </h2>

      {/* Filter Controls */}
      <div className="form-card mb-4">
        <h3>Filter Options</h3>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Filter Period</label>
            <select 
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filterType === 'custom' && (
            <>
              <div className="col-md-3">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  min={customDateFrom}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Cash Receipts</h6>
            <h4 className="text-success">₹{calculateTotals.drCash.toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Bank Receipts</h6>
            <h4 className="text-primary">₹{calculateTotals.drBank.toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Cash Payments</h6>
            <h4 className="text-danger">₹{calculateTotals.crCash.toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Bank Payments</h6>
            <h4 className="text-warning">₹{calculateTotals.crBank.toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Cash Balance</h6>
            <h4 className={calculateTotals.cashBalance >= 0 ? 'text-success' : 'text-danger'}>
              ₹{calculateTotals.cashBalance.toLocaleString('en-IN')}
            </h4>
          </div>
        </div>
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Bank Balance</h6>
            <h4 className={calculateTotals.bankBalance >= 0 ? 'text-success' : 'text-danger'}>
              ₹{calculateTotals.bankBalance.toLocaleString('en-IN')}
            </h4>
          </div>
        </div>
      </div>

      {/* Cash Book Table */}
      <div className="form-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Cash Book Entries</h3>
          <button className="btn btn-outline-primary btn-sm" onClick={loadCashBookEntries}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div className="text-center">Loading...</div>}

        {filteredEntries.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th>Description</th>
                  <th>Dr. Cash</th>
                  <th>Dr. Bank</th>
                  <th>Cr. Cash</th>
                  <th>Cr. Bank</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>{entry.category}</td>
                    <td>{entry.description}</td>
                    <td className="amount-cell">
                      {entry.type === 'dr' && entry.cashAmount > 0 ? `₹${entry.cashAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="amount-cell">
                      {entry.type === 'dr' && entry.bankAmount > 0 ? `₹${entry.bankAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="amount-cell">
                      {entry.type === 'cr' && entry.cashAmount > 0 ? `₹${entry.cashAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="amount-cell">
                      {entry.type === 'cr' && entry.bankAmount > 0 ? `₹${entry.bankAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-info">
                  <td colSpan="3"><strong>TOTALS</strong></td>
                  <td className="amount-cell"><strong>₹{calculateTotals.drCash.toLocaleString('en-IN')}</strong></td>
                  <td className="amount-cell"><strong>₹{calculateTotals.drBank.toLocaleString('en-IN')}</strong></td>
                  <td className="amount-cell"><strong>₹{calculateTotals.crCash.toLocaleString('en-IN')}</strong></td>
                  <td className="amount-cell"><strong>₹{calculateTotals.crBank.toLocaleString('en-IN')}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            <i className="bi bi-journal-x display-4"></i>
            <h5 className="mt-3">No Cash Book Entries</h5>
            <p>
              {cashBookEntries.length === 0 
                ? "Add fare receipts and expenses to see entries here."
                : "No entries found for the selected date range."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashBook;
