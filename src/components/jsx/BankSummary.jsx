import React, { useState, useEffect } from "react";
import "../css/BankSummary.css";

function BankSummary({ bankData }) {
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
  }, [bankData, dateFrom, dateTo, currentUser]);

  const filterUserData = () => {
    if (!currentUser || !bankData) return;

    const currentUserName = currentUser.fullName || currentUser.username;
    let allData = [];

    console.log('👤 Filtering bank data for user:', currentUserName);
    console.log('📊 BankData Structure Examples:');
    
    // Log sample objects for debugging
    if (bankData && bankData.length > 0) {
      console.log('🔸 Daily Entry Sample:', bankData.find(e => e.type === 'daily'));
      console.log('🔸 Booking Entry Sample:', bankData.find(e => e.type === 'booking'));
      console.log('🔸 Fuel Payment Sample:', bankData.find(e => e.type === 'fuel'));
    }

    // 📈 Filter bank data (INCOME & EXPENSE) for current user - Only BANK entries
    if (bankData && bankData.length > 0) {
      const userBankData = bankData.filter(entry => 
        entry.submittedBy === currentUserName && entry.bankAmount > 0
      );
      console.log('💰 Bank entries found:', userBankData.length);
      console.log('📋 Sample Bank Entry:', userBankData[0]);
      
      allData = [...allData, ...userBankData.map(entry => ({
        entryId: entry.entryId,
        date: entry.date || entry.dateFrom, // Use dateFrom for booking entries
        bankAmount: entry.bankAmount || 0,
        type: entry.type,
        submittedBy: entry.submittedBy,
        entryStatus: entry.entryStatus || 'pending',
        approvedBy: entry.approvedBy || '',
        entryType: entry.entryType || entry.type,
        // Determine if income or expense based on type
        transactionType: ['daily', 'booking'].includes(entry.type) ? 'income' : 'expense'
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
    
    console.log('📊 Filtered bank data:', allData.length, 'entries');
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
    .filter(entry => entry.transactionType === 'income')
    .reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

  const totalBankExpense = filteredData
    .filter(entry => entry.transactionType === 'expense')
    .reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

  const bankBalance = totalBankIncome - totalBankExpense;

  useEffect(() => {
    filterUserData();
  }, [fareData, expenseData, dateFrom, dateTo, currentUser]);

  // Listen for centralized refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('🔄 BankSummary: Recalculating from centralized refresh');
      filterUserData();
    };

    window.addEventListener('dataRefreshed', handleDataRefresh);

    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefresh);
    };
  }, [bankData, dateFrom, dateTo, currentUser]);

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
                    <th>Type</th>
                    <th>I/E</th>
                    <th>Bank</th>
                    <th>
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        onChange={handleSelectAll}
                        checked={isAllSelected}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry, index) => (
                    <tr key={`${entry.entryId || index}`}>
                      <td>
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {entry.entryType || entry.type || 'bank'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${entry.transactionType === 'income' ? 'bg-success' : 'bg-danger'}`}>
                          {entry.transactionType === 'income' ? 'I' : 'E'}
                        </span>
                      </td>
                      <td className={entry.transactionType === 'income' ? 'text-success' : 'text-danger'}>
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