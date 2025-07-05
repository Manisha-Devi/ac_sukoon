
import React, { useState, useEffect } from "react";
import "../css/BankSummary.css";

function BankSummary({ fareData, expenseData }) {
  const [filteredData, setFilteredData] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [entriesPerPage] = useState(10);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    filterUserData();
  }, [fareData, expenseData, dateFrom, dateTo, currentUser]);

  const filterUserData = () => {
    if (!currentUser) return;

    const currentUserName = currentUser.fullName || currentUser.username;
    let allData = [];

    // Filter fare data for current user
    if (fareData && fareData.length > 0) {
      const userFareData = fareData.filter(entry => 
        entry.submittedBy === currentUserName && entry.bankAmount > 0
      );
      allData = [...allData, ...userFareData.map(entry => ({
        ...entry,
        type: 'income',
        description: entry.route || entry.bookingDetails || 'Fare Collection'
      }))];
    }

    // Filter expense data for current user
    if (expenseData && expenseData.length > 0) {
      const userExpenseData = expenseData.filter(entry => 
        entry.submittedBy === currentUserName && entry.bankAmount > 0
      );
      allData = [...allData, ...userExpenseData.map(entry => ({
        ...entry,
        type: 'expense',
        description: entry.pumpName || entry.addaName || entry.unionName || 
                    entry.serviceType || entry.paymentDetails || 'Payment'
      }))];
    }

    // Apply date filter if dates are selected
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      
      allData = allData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }

    // Sort by date (newest first)
    allData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredData(allData);
  };

  const clearFilter = () => {
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  // Handle checkbox selection for individual rows
  const handleSelectEntry = (entryId) => {
    setSelectedEntries(prev => {
      if (prev.includes(entryId)) {
        return prev.filter(id => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    const allCurrentEntryIds = currentEntries.map(entry => entry.entryId);
    
    if (selectedEntries.length === allCurrentEntryIds.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(allCurrentEntryIds);
    }
  };

  // Check if all visible entries are selected
  const isAllSelected = currentEntries.length > 0 && 
    currentEntries.every(entry => selectedEntries.includes(entry.entryId));

  // Forward selected entries for approval
  const handleForwardForApproval = () => {
    if (selectedEntries.length === 0) {
      alert('Please select entries to forward for approval');
      return;
    }
    
    // Here you would call your API to forward entries
    console.log('Forwarding entries for approval:', selectedEntries);
    alert(`${selectedEntries.length} entries forwarded for approval!`);
    setSelectedEntries([]);
  };

  // Calculate totals
  const totalBankIncome = filteredData
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

  const totalBankExpense = filteredData
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

  const bankBalance = totalBankIncome - totalBankExpense;

  return (
    <div className="bank-summary-container">
      <div className="summary-header">
        <h3><i className="bi bi-bank"></i> Bank Summary</h3>
        <small className="text-muted">Use navbar refresh icon to update data</small>
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
              onClick={clearFilter}
              disabled={!dateFrom && !dateTo}
            >
              <i className="bi bi-x-circle"></i> Clear
            </button>
          </div>
          <div className="col-md-3">
            <small className="text-muted">
              {filteredData.length} entries
            </small>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="summary-card income-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-up-circle"></i> Bank Income</h6>
              <h4 className="text-success">₹{totalBankIncome.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card expense-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-down-circle"></i> Bank Expense</h6>
              <h4 className="text-danger">₹{totalBankExpense.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card balance-card">
            <div className="card-body">
              <h6><i className="bi bi-calculator"></i> Bank Balance</h6>
              <h4 className={bankBalance >= 0 ? 'text-success' : 'text-danger'}>
                ₹{Math.abs(bankBalance).toLocaleString()}
                {bankBalance < 0 && ' (Overdraft)'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List with Pagination */}
      <div className="transactions-list">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Bank Transactions</h5>
          {selectedEntries.length > 0 && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleForwardForApproval}
            >
              <i className="bi bi-send"></i> Forward {selectedEntries.length} for Approval
            </button>
          )}
        </div>
        
        {filteredData.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Bank Amount</th>
                    <th width="50">
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        onChange={handleSelectAll}
                        checked={isAllSelected}
                        indeterminate={selectedEntries.length > 0 && !isAllSelected}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry, index) => (
                    <tr key={`${entry.entryId || index}`}>
                      <td>{new Date(entry.date).toLocaleDateString('en-IN')}</td>
                      <td>{entry.description}</td>
                      <td>
                        <span className={`badge ${entry.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                          {entry.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className={entry.type === 'income' ? 'text-success' : 'text-danger'}>
                        ₹{(entry.bankAmount || 0).toLocaleString()}
                      </td>
                      <td>
                        <input 
                          type="checkbox" 
                          className="form-check-input"
                          checked={selectedEntries.includes(entry.entryId)}
                          onChange={() => handleSelectEntry(entry.entryId)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Transaction pagination">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}

            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredData.length)} of {filteredData.length} entries
              </small>
              <small className="text-muted">
                {selectedEntries.length} selected
              </small>
            </div>
          </>
        ) : (
          <div className="no-data text-center py-4">
            <i className="bi bi-inbox display-4 text-muted"></i>
            <p className="text-muted mt-2">No bank transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BankSummary;
