
import React, { useState, useEffect } from "react";
import "../css/CashBook.css";
import { addCashBookEntry, getCashBookEntries } from "../../services/googleSheetsAPI";

const CashBook = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    cashAmount: '',
    bankAmount: '',
    category: ''
  });
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await getCashBookEntries();
      if (response.success) {
        setEntries(response.data || []);
      } else {
        setError(response.error || 'Failed to load cash book entries');
      }
    } catch (error) {
      setError('Error loading entries: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        cashAmount: parseFloat(formData.cashAmount) || 0,
        bankAmount: parseFloat(formData.bankAmount) || 0,
        submittedBy: currentUser.fullName || 'Unknown User'
      };

      const response = await addCashBookEntry(submitData);
      
      if (response.success) {
        setSuccess('Cash book entry added successfully!');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: '',
          description: '',
          cashAmount: '',
          bankAmount: '',
          category: ''
        });
        loadEntries();
      } else {
        setError(response.error || 'Failed to add cash book entry');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = () => {
    let cashBalance = 0;
    let bankBalance = 0;
    
    entries.forEach(entry => {
      if (entry.type === 'Income') {
        cashBalance += entry.cashAmount || 0;
        bankBalance += entry.bankAmount || 0;
      } else {
        cashBalance -= entry.cashAmount || 0;
        bankBalance -= entry.bankAmount || 0;
      }
    });
    
    return { cashBalance, bankBalance };
  };

  const { cashBalance, bankBalance } = calculateBalance();

  return (
    <div className="cash-book-container">
      <div className="header">
        <h2><i className="bi bi-book"></i> Cash Book Management</h2>
      </div>

      {/* Balance Summary */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5><i className="bi bi-cash-stack"></i> Cash Balance</h5>
              <h3>₹{cashBalance.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5><i className="bi bi-bank"></i> Bank Balance</h5>
              <h3>₹{bankBalance.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="bi bi-plus-circle"></i> Add New Cash Book Entry</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-control"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
                placeholder="Enter description"
                required
              ></textarea>
            </div>
            
            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Cash Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cashAmount"
                    value={formData.cashAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Bank Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="bankAmount"
                    value={formData.bankAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Fare Collection">Fare Collection</option>
                    <option value="Fuel Expense">Fuel Expense</option>
                    <option value="Service Expense">Service Expense</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Adding...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Entry
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Entries List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5><i className="bi bi-list"></i> Recent Cash Book Entries</h5>
          <button className="btn btn-outline-primary btn-sm" onClick={loadEntries}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="card-body">
          {loading && <div className="text-center">Loading...</div>}
          
          {entries.length === 0 && !loading ? (
            <div className="text-center text-muted">No cash book entries found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Cash</th>
                    <th>Bank</th>
                    <th>Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.id || index} className={entry.type === 'Income' ? 'table-success' : 'table-danger'}>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${entry.type === 'Income' ? 'bg-success' : 'bg-danger'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td>{entry.description}</td>
                      <td>{entry.category}</td>
                      <td>₹{entry.cashAmount}</td>
                      <td>₹{entry.bankAmount}</td>
                      <td>{entry.submittedBy}</td>
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
};

export default CashBook;

const CashBook = ({ cashBookEntries, setCashBookEntries }) => {
  
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    filterEntries();
  }, [cashBookEntries, customDateFrom, customDateTo]);

  const filterEntries = () => {
    let filtered = [...cashBookEntries];
    
    if (customDateFrom && customDateTo) {
      const fromDate = new Date(customDateFrom);
      const toDate = new Date(customDateTo);
      toDate.setHours(23, 59, 59); // Include full end date
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }
    
    setFilteredEntries(filtered);
  };

  const clearFilter = () => {
    setCustomDateFrom('');
    setCustomDateTo('');
  };

  // Calculate totals using filtered entries
  const drEntries = filteredEntries.filter(entry => entry.type === 'dr');
  const crEntries = filteredEntries.filter(entry => entry.type === 'cr');

  const totalDrCash = drEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalDrBank = drEntries.reduce((sum, entry) => sum + entry.bankAmount, 0);
  const totalCrCash = crEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalCrBank = crEntries.reduce((sum, entry) => sum + entry.bankAmount, 0);

  const cashBalance = totalDrCash - totalCrCash;
  const bankBalance = totalDrBank - totalCrBank;

  const formatEntryParticulars = (entry) => {
    switch (entry.source) {
      case 'fare-daily':
        return `To Daily Fare - ${entry.route || 'Route'}`;
      case 'fare-booking':
        return `To Booking - ${entry.bookingDetails || entry.description}`;
      case 'fees-payment':
        return `By Fees Payment - ${entry.description}`;
      case 'fuel-payment':
        return `By Fuel Payment - ${entry.description}`;
      case 'service-payment':
        return `By Service Payment - ${entry.description}`;
      case 'other-payment':
        return `By Other Payment - ${entry.description}`;
      default:
        return entry.type === 'dr' ? `To ${entry.particulars}` : `By ${entry.particulars}`;
    }
  };

  return (
    <div className="cash-book-container">
      <div className="container-fluid">
        <div className="cash-book-header">
          <h2><i className="bi bi-book"></i> Cash Book (Double Column)</h2>
          <p>Traditional Dr./Cr. format with Cash and Bank columns</p>
          
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

        {/* Date Filter Controls */}
        {showFilter && (
          <div className="simple-date-filter">
            <div className="row align-items-end">
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
                />
              </div>
              <div className="col-md-3">
                <button 
                  className="btn btn-outline-secondary btn-sm clear-filter-btn"
                  onClick={clearFilter}
                  disabled={!customDateFrom && !customDateTo}
                >
                  <i className="bi bi-x-circle"></i> Clear
                </button>
              </div>
              <div className="col-md-3">
                <small className="text-muted filter-info">
                  {customDateFrom || customDateTo ? 
                    `${filteredEntries.length} of ${cashBookEntries.length} entries` :
                    `${cashBookEntries.length} total entries`
                  }
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {filteredEntries.length > 0 && showSummary && (
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card dr-cash-card">
                <div className="card-body">
                  <h6>Total Cash Receipts</h6>
                  <h4>₹{totalDrCash.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cr-cash-card">
                <div className="card-body">
                  <h6>Total Cash Payments</h6>
                  <h4>₹{totalCrCash.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card dr-bank-card">
                <div className="card-body">
                  <h6>Total Bank Receipts</h6>
                  <h4>₹{totalDrBank.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cr-bank-card">
                <div className="card-body">
                  <h6>Total Bank Payments</h6>
                  <h4>₹{totalCrBank.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Balance Cards */}
        {filteredEntries.length > 0 && showSummary && (
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="summary-card cash-balance-card">
                <div className="card-body">
                  <h6>Cash Balance</h6>
                  <h4 className={cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    {cashBalance < 0 && ' (Deficit)'}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="summary-card bank-balance-card">
                <div className="card-body">
                  <h6>Bank Balance</h6>
                  <h4 className={bankBalance >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    {bankBalance < 0 && ' (Overdraft)'}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Double Column Cash Book */}
        {filteredEntries.length > 0 && (
          <div className="double-column-cash-book">
            <div className="cash-book-header-row">
              <h4>
                <i className="bi bi-book-half"></i> 
                Cash Book {customDateFrom || customDateTo ? 
                  `Custom Date [${customDateFrom ? new Date(customDateFrom).toLocaleDateString('en-IN') : 'Start'} - ${customDateTo ? new Date(customDateTo).toLocaleDateString('en-IN') : 'End'}]` : 
                  'All'
                }
              </h4>
            </div>

            <div className="cash-book-table-container">
              <div className="table-responsive">
                <table className="table cash-book-table">
                  <thead>
                    <tr>
                      <th colSpan="4" className="dr-header">Dr.</th>
                      <th colSpan="4" className="cr-header">Cr.</th>
                    </tr>
                    <tr>
                      <th>Date</th>
                      <th>Particulars</th>
                      <th>Cash(₹)</th>
                      <th>Bank(₹)</th>
                      <th>Date</th>
                      <th>Particulars</th>
                      <th>Cash(₹)</th>
                      <th>Bank(₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Balance b/d row */}
                    <tr>
                      <td></td>
                      <td><strong>To Balance b/d</strong></td>
                      <td className="text-success">
                        {cashBalance > 0 ? `₹${cashBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-success">
                        {bankBalance > 0 ? `₹${bankBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td></td>
                      <td><strong>By Balance b/d</strong></td>
                      <td className="text-danger">
                        {cashBalance < 0 ? `₹${Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-danger">
                        {bankBalance < 0 ? `₹${Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                    </tr>

                    {/* Render entries side by side */}
                    {Math.max(drEntries.length, crEntries.length) > 0 && 
                      Array.from({ length: Math.max(drEntries.length, crEntries.length) }).map((_, index) => {
                        const drEntry = drEntries[index];
                        const crEntry = crEntries[index];

                        return (
                          <tr key={`row-${index}`}>
                            {/* Dr. Side */}
                            <td>{drEntry ? new Date(drEntry.date).toLocaleDateString('en-IN') : ''}</td>
                            <td>{drEntry ? formatEntryParticulars(drEntry) : ''}</td>
                            <td className="text-success">
                              {drEntry && drEntry.cashAmount > 0 ? `₹${drEntry.cashAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (drEntry ? '-' : '')}
                            </td>
                            <td className="text-success">
                              {drEntry && drEntry.bankAmount > 0 ? `₹${drEntry.bankAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (drEntry ? '-' : '')}
                            </td>

                            {/* Cr. Side */}
                            <td>{crEntry ? new Date(crEntry.date).toLocaleDateString('en-IN') : ''}</td>
                            <td>{crEntry ? formatEntryParticulars(crEntry) : ''}</td>
                            <td className="text-danger">
                              {crEntry && crEntry.cashAmount > 0 ? `₹${crEntry.cashAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (crEntry ? '-' : '')}
                            </td>
                            <td className="text-danger">
                              {crEntry && crEntry.bankAmount > 0 ? `₹${crEntry.bankAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (crEntry ? '-' : '')}
                            </td>
                          </tr>
                        );
                      })}

                    {/* Totals row */}
                    <tr className="totals-row">
                      <td></td>
                      <td><strong>To Balance c/d</strong></td>
                      <td className="text-success">
                        {cashBalance < 0 ? `₹${Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-success">
                        {bankBalance < 0 ? `₹${Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td></td>
                      <td><strong>By Balance c/d</strong></td>
                      <td className="text-danger">
                        {cashBalance > 0 ? `₹${cashBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-danger">
                        {bankBalance > 0 ? `₹${bankBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                    </tr>

                    {/* Final totals */}
                    <tr className="final-totals-row">
                      <td></td>
                      <td></td>
                      <td className="total-cell">₹{(totalDrCash + Math.abs(cashBalance < 0 ? cashBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="total-cell">₹{(totalDrBank + Math.abs(bankBalance < 0 ? bankBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td></td>
                      <td></td>
                      <td className="total-cell">₹{(totalCrCash + (cashBalance > 0 ? cashBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="total-cell">₹{(totalCrBank + (bankBalance > 0 ? bankBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {filteredEntries.length === 0 && cashBookEntries.length === 0 && (
          <div className="no-entries">
            <div className="text-center py-5">
              <i className="bi bi-book display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Cash Book Entries Found</h4>
              <p className="text-muted">Entries will appear here automatically when you add Fare Receipts or Payment transactions.</p>
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
