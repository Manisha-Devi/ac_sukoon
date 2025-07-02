import React, { useState, useMemo } from "react";
import "../css/CashBook.css";
import { addCashBookEntry, getCashBookEntries } from "../../services/googleSheetsAPI";

const CashBook = ({ cashBookEntries, setCashBookEntries }) => {
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'week', 'month', 'custom'

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
    <div className="cash-book-container">
      <div className="container-fluid">
        <div className="cash-book-header">
          <h2><i className="bi bi-journal-text"></i> Cash Book</h2>
          <p>Track all receipts and payments</p>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls mb-4">
          <div className="row align-items-end">
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
            <div className="summary-card receipts-card">
              <div className="card-body">
                <h6>Cash Receipts</h6>
                <h5>₹{calculateTotals.drCash.toLocaleString('en-IN')}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="summary-card receipts-card">
              <div className="card-body">
                <h6>Bank Receipts</h6>
                <h5>₹{calculateTotals.drBank.toLocaleString('en-IN')}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="summary-card payments-card">
              <div className="card-body">
                <h6>Cash Payments</h6>
                <h5>₹{calculateTotals.crCash.toLocaleString('en-IN')}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="summary-card payments-card">
              <div className="card-body">
                <h6>Bank Payments</h6>
                <h5>₹{calculateTotals.crBank.toLocaleString('en-IN')}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className={`summary-card ${calculateTotals.cashBalance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
              <div className="card-body">
                <h6>Cash Balance</h6>
                <h5>₹{calculateTotals.cashBalance.toLocaleString('en-IN')}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className={`summary-card ${calculateTotals.bankBalance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
              <div className="card-body">
                <h6>Bank Balance</h6>
                <h5>₹{calculateTotals.bankBalance.toLocaleString('en-IN')}</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Book Table */}
        {filteredEntries.length > 0 ? (
          <div className="cash-book-table">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Particulars</th>
                    <th>Description</th>
                    <th>JF No.</th>
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
                      <td>{entry.particulars}</td>
                      <td>{entry.description}</td>
                      <td>{entry.jfNo}</td>
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
                  <tr className="totals-row">
                    <td colSpan="4"><strong>TOTALS</strong></td>
                    <td className="amount-cell"><strong>₹{calculateTotals.drCash.toLocaleString('en-IN')}</strong></td>
                    <td className="amount-cell"><strong>₹{calculateTotals.drBank.toLocaleString('en-IN')}</strong></td>
                    <td className="amount-cell"><strong>₹{calculateTotals.crCash.toLocaleString('en-IN')}</strong></td>
                    <td className="amount-cell"><strong>₹{calculateTotals.crBank.toLocaleString('en-IN')}</strong></td>
                  </tr>
                  <tr className="balance-row">
                    <td colSpan="4"><strong>BALANCE</strong></td>
                    <td className="amount-cell" colSpan="2">
                      <strong className={calculateTotals.cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                        Cash: ₹{calculateTotals.cashBalance.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td className="amount-cell" colSpan="2">
                      <strong className={calculateTotals.bankBalance >= 0 ? 'text-success' : 'text-danger'}>
                        Bank: ₹{calculateTotals.bankBalance.toLocaleString('en-IN')}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="no-entries">
            <div className="text-center py-5">
              <i className="bi bi-journal-x display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Cash Book Entries</h4>
              <p className="text-muted">
                {cashBookEntries.length === 0 
                  ? "Add fare receipts and expenses to see entries here."
                  : "No entries found for the selected date range."
                }
              </p>
            </div>
          </div>
        )}

        {filteredEntries.length === 0 && cashBookEntries.length > 0 && (
          <div className="no-entries">
            <div className="text-center py-5">
              <i className="bi bi-calendar-x display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Entries for Selected Date Range</h4>
              <p className="text-muted">Try adjusting the date filter to view entries from different time periods.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashBook;