
import React, { useState, useEffect } from 'react';
import '../css/CashSummary.css';

function CashSummary({ fareData, expenseData, currentUser }) {
  const [filteredIncomeData, setFilteredIncomeData] = useState([]);
  const [filteredExpenseData, setFilteredExpenseData] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [selectedDateFrom, setSelectedDateFrom] = useState('');
  const [selectedDateTo, setSelectedDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const currentUserName = currentUser?.fullName || currentUser?.username;

  // Filter entries for cash amounts only
  useEffect(() => {
    if (fareData && fareData.length > 0) {
      const filteredIncome = fareData.filter(entry => 
        entry.submittedBy === currentUserName && 
        entry.cashAmount > 0
      );
      setFilteredIncomeData(filteredIncome);
    }

    if (expenseData && expenseData.length > 0) {
      const filteredExpense = expenseData.filter(entry => 
        entry.submittedBy === currentUserName && 
        entry.cashAmount > 0
      );
      setFilteredExpenseData(filteredExpense);
    }
  }, [fareData, expenseData, currentUserName]);

  // Calculate totals
  const totalCashIncome = filteredIncomeData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalCashExpense = filteredExpenseData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const cashBalance = totalCashIncome - totalCashExpense;

  // Combine and filter data based on date range
  const getAllEntries = () => {
    const allEntries = [
      ...filteredIncomeData.map(entry => ({ ...entry, category: 'Income' })),
      ...filteredExpenseData.map(entry => ({ ...entry, category: 'Expense' }))
    ];

    let filtered = allEntries;
    if (selectedDateFrom && selectedDateTo) {
      filtered = allEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        const fromDate = new Date(selectedDateFrom);
        const toDate = new Date(selectedDateTo);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const allFilteredEntries = getAllEntries();

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = allFilteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(allFilteredEntries.length / entriesPerPage);

  // Handle entry selection
  const handleEntrySelection = (entryId) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  // Handle Forward for Approval
  const handleForwardForApproval = async () => {
    if (selectedEntries.length === 0) {
      alert('कृपया कम से कम एक entry select करें।');
      return;
    }

    setIsLoading(true);
    try {
      const promises = selectedEntries.map(async (entryId) => {
        const entry = allFilteredEntries.find(e => e.entryId === entryId);
        
        if (entry.category === 'Income') {
          // Update fare receipt status
          const response = await fetch('https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              action: 'updateFareReceiptStatus',
              entryId: entryId,
              newStatus: 'forwardedCash',
              approverName: currentUserName
            })
          });
          return response.json();
        } else {
          // Update expense entry status based on type
          const actionMap = {
            'fuel': 'updateFuelPaymentStatus',
            'adda': 'updateAddaPaymentStatus', 
            'union': 'updateUnionPaymentStatus',
            'service': 'updateServicePaymentStatus',
            'other': 'updateOtherPaymentStatus'
          };

          const action = actionMap[entry.type];
          if (action) {
            const response = await fetch('https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                action: action,
                entryId: entryId,
                newStatus: 'forwardedCash',
                approverName: currentUserName
              })
            });
            return response.json();
          }
        }
      });

      await Promise.all(promises);
      
      // Trigger data refresh
      window.dispatchEvent(new CustomEvent('dataRefreshed'));
      setSelectedEntries([]);
      alert('Selected entries forwarded for cash approval successfully!');
      
    } catch (error) {
      console.error('Error forwarding entries:', error);
      alert('Error forwarding entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDateFrom('');
    setSelectedDateTo('');
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle entry details modal
  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setShowEntryModal(true);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
      case 'forwardedBank':
        return <span className="status-icon pending">🔒</span>;
      case 'approvedBank':
        return <span className="status-icon approved">✅</span>;
      case 'forwardedCash':
        return <span className="status-icon forwarded">📤</span>;
      case 'approvedCash':
        return <span className="status-icon final-approved">✅</span>;
      default:
        return <span className="status-icon unknown">❓</span>;
    }
  };

  const canSelectEntry = (entry) => {
    return entry.entryStatus === 'approvedBank';
  };

  return (
    <div className="cash-summary-container">
      {/* Header */}
      <div className="summary-header">
        <h3><i className="bi bi-cash-coin"></i> Cash Summary</h3>
        <button 
          className="btn refresh-btn" 
          onClick={() => window.dispatchEvent(new CustomEvent('dataRefreshed'))}
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="summary-card income-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-up-circle"></i> Cash Income</h6>
              <h4>₹{totalCashIncome.toLocaleString('en-IN')}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="summary-card expense-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-down-circle"></i> Cash Expense</h6>
              <h4>₹{totalCashExpense.toLocaleString('en-IN')}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="summary-card balance-card">
            <div className="card-body">
              <h6><i className="bi bi-wallet2"></i> Cash Balance</h6>
              <h4 className={cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                ₹{Math.abs(cashBalance).toLocaleString('en-IN')}
                {cashBalance < 0 && ' (Deficit)'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="filter-section mb-4">
        <div className="row">
          <div className="col-md-4 mb-2">
            <label className="form-label">From Date:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDateFrom}
              onChange={(e) => setSelectedDateFrom(e.target.value)}
            />
          </div>
          <div className="col-md-4 mb-2">
            <label className="form-label">To Date:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDateTo}
              onChange={(e) => setSelectedDateTo(e.target.value)}
            />
          </div>
          <div className="col-md-4 mb-2 d-flex align-items-end">
            <button className="btn btn-outline-secondary me-2" onClick={clearDateFilter}>
              <i className="bi bi-x-circle"></i> Clear Filter
            </button>
          </div>
        </div>
      </div>

      {/* Forward Button */}
      {selectedEntries.length > 0 && (
        <div className="action-section mb-3">
          <button 
            className="btn btn-success" 
            onClick={handleForwardForApproval}
            disabled={isLoading}
          >
            <i className={isLoading ? "bi bi-arrow-repeat spin" : "bi bi-check-circle"}></i>
            {isLoading ? "Processing..." : `Forward ${selectedEntries.length} entries for Cash Approval`}
          </button>
        </div>
      )}

      {/* Entries Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Select</th>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Details</th>
              <th>Cash Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((entry) => (
                <tr key={entry.entryId}>
                  <td>
                    {canSelectEntry(entry) ? (
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.entryId)}
                        onChange={() => handleEntrySelection(entry.entryId)}
                      />
                    ) : (
                      getStatusIcon(entry.entryStatus)
                    )}
                  </td>
                  <td>{new Date(entry.date).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`badge ${entry.category === 'Income' ? 'bg-success' : 'bg-danger'}`}>
                      {entry.category}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{entry.type || 'fare'}</span>
                  </td>
                  <td>
                    {entry.route || entry.serviceDetails || entry.paymentDetails || 
                     entry.pumpName || entry.addaName || entry.unionName || 'N/A'}
                  </td>
                  <td>₹{(entry.cashAmount || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge status-${entry.entryStatus}`}>
                      {entry.entryStatus || 'pending'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-info"
                      onClick={() => handleViewEntry(entry)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <p className="mt-2 text-muted">No cash entries found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-section d-flex justify-content-between align-items-center">
          <button 
            className="btn btn-outline-primary" 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
          >
            <i className="bi bi-chevron-left"></i> Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            className="btn btn-outline-primary" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
          >
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Entry Details Modal */}
      {showEntryModal && selectedEntry && (
        <div className="modal fade show" style={{display: 'block'}} onClick={() => setShowEntryModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Entry Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowEntryModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-6"><strong>Entry ID:</strong></div>
                  <div className="col-6">{selectedEntry.entryId}</div>
                </div>
                <div className="row">
                  <div className="col-6"><strong>Date:</strong></div>
                  <div className="col-6">{new Date(selectedEntry.date).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="row">
                  <div className="col-6"><strong>Category:</strong></div>
                  <div className="col-6">{selectedEntry.category}</div>
                </div>
                <div className="row">
                  <div className="col-6"><strong>Type:</strong></div>
                  <div className="col-6">{selectedEntry.type || 'fare'}</div>
                </div>
                <div className="row">
                  <div className="col-6"><strong>Cash Amount:</strong></div>
                  <div className="col-6">₹{(selectedEntry.cashAmount || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="row">
                  <div className="col-6"><strong>Status:</strong></div>
                  <div className="col-6">{selectedEntry.entryStatus || 'pending'}</div>
                </div>
                <div className="row">
                  <div className="col-6"><strong>Submitted By:</strong></div>
                  <div className="col-6">{selectedEntry.submittedBy}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEntryModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashSummary;
