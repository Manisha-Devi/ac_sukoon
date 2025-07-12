import React, { useState, useEffect } from "react";
import "../css/CashSummary.css";

function CashSummary({ fareData, expenseData, currentUser }) {
  // 📊 RECEIVED DATA EXPLANATION:
  // fareData = Daily entries (income) + Booking entries + Off days
  // expenseData = Fuel + Adda + Union + Service + Other payments

  const [filteredData, setFilteredData] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [entriesPerPage] = useState(10);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);


  useEffect(() => {
    console.log('🔄 CashSummary: Props data updated');
    console.log('📈 FareData (Income):', fareData?.length || 0, 'entries');
    console.log('📉 ExpenseData (Expense):', expenseData?.length || 0, 'entries');

    // Debug: Log complete data structure
    console.log('💰 CASH SUMMARY - Complete FareData:', fareData);
    console.log('💸 CASH SUMMARY - Complete ExpenseData:', expenseData);

    // Sample entries for debugging
    if (fareData && fareData.length > 0) {
      console.log('📊 CASH SUMMARY - Sample FareData Entry:', fareData[0]);
    }
    if (expenseData && expenseData.length > 0) {
      console.log('📊 CASH SUMMARY - Sample ExpenseData Entry:', expenseData[0]);
    }

    filterUserData();
  }, [fareData, expenseData, dateFrom, dateTo, currentUser]);

  const filterUserData = () => {
    if (!currentUser) {
      console.log('⚠️ No current user found');
      return;
    }

    const currentUserName = currentUser.fullName || currentUser.username;
    let allData = [];

    console.log('👤 Filtering data for user:', currentUserName);
    console.log('📊 FareData Filtered Structure:');

    // Log sample objects for debugging  
    if (fareData && fareData.length > 0) {
      console.log('🔸 Daily Entry Sample:', fareData.find(e => e.type === 'daily'));
      console.log('🔸 Booking Entry Sample:', fareData.find(e => e.type === 'booking'));
      console.log('🔸 All Entry Types in FareData:', [...new Set(fareData.map(e => e.type))]);
    }

    // Debug expense data types  
    if (expenseData && expenseData.length > 0) {
      console.log('🔸 All Entry Types in ExpenseData:', [...new Set(expenseData.map(e => e.type))]);
      console.log('🔸 Sample Expense Entry:', expenseData[0]);
    }

    // 📈 Filter fare data (INCOME) for current user - Only CASH entries  
    // Data now comes pre-filtered: entryId, date, cashAmount, type, submittedBy, entryStatus, approvedBy
    if (fareData && fareData.length > 0) {
      const userFareData = fareData.filter(entry => 
        entry.submittedBy === currentUserName && 
        entry.cashAmount > 0 &&
        (entry.type === 'daily' || entry.type === 'booking') // No off days
      );
      console.log('💰 Cash Income entries found:', userFareData.length);
      console.log('📋 Sample Filtered Cash Entry:', userFareData[0]);

      allData = [...allData, ...userFareData.map(entry => ({
        entryId: entry.entryId,
        date: entry.date,
        cashAmount: entry.cashAmount,
        type: 'income',
        entryType: entry.type, // daily or booking
        submittedBy: entry.submittedBy,
        entryStatus: entry.entryStatus,
        approvedBy: entry.approvedBy,
        description: entry.route || entry.bookingDetails || 'Fare Collection'
      }))];
    }

    // 📉 Filter expense data (EXPENSE) for current user - Only CASH entries
    // Data now comes pre-filtered: entryId, date, cashAmount, type, submittedBy, entryStatus, approvedBy
    if (expenseData && expenseData.length > 0) {
      const userExpenseData = expenseData.filter(entry => 
        entry.submittedBy === currentUserName && entry.cashAmount > 0
      );
      console.log('💸 Cash Expense entries found:', userExpenseData.length);
      console.log('📋 Sample Filtered Expense Entry:', userExpenseData[0]);

      allData = [...allData, ...userExpenseData.map(entry => ({
        entryId: entry.entryId,
        date: entry.date,
        cashAmount: entry.cashAmount,
        type: 'expense',
        entryType: entry.type, // fuel, adda, union, service, other
        submittedBy: entry.submittedBy,
        entryStatus: entry.entryStatus,
        approvedBy: entry.approvedBy,
        description: entry.pumpName || entry.addaName || entry.unionName || 
                    entry.serviceType || entry.serviceDetails || 
                    entry.paymentType || entry.paymentDetails || 'Payment'
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

    // Debug: Log final filtered data
    console.log('✅ CASH SUMMARY - Final filtered data:', allData);
    console.log('📊 CASH SUMMARY - Data breakdown:');
    console.log('   - Income entries:', allData.filter(e => e.type === 'income').length);
    console.log('   - Expense entries:', allData.filter(e => e.type === 'expense').length);
    console.log('   - Entry types:', [...new Set(allData.map(e => e.entryType))]);

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

  // Handle checkbox selection for individual rows (only for approvedBank status)
  const handleSelectEntry = (entryId) => {
    const entry = currentEntries.find(e => e.entryId === entryId);
    if (entry && entry.entryStatus === 'approvedBank') {
      setSelectedEntries(prev => {
        if (prev.includes(entryId)) {
          return prev.filter(id => id !== entryId);
        } else {
          return [...prev, entryId];
        }
      });
    }
  };

  // Handle select all checkbox (only approvedBank status entries)
  const handleSelectAll = () => {
    const approvedBankEntries = currentEntries.filter(entry => entry.entryStatus === 'approvedBank');
    const approvedBankEntryIds = approvedBankEntries.map(entry => entry.entryId);

    if (selectedEntries.length === approvedBankEntryIds.length && approvedBankEntryIds.length > 0) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(approvedBankEntryIds);
    }
  };

  // Check if all visible approvedBank entries are selected
  const approvedBankEntries = currentEntries.filter(entry => entry.entryStatus === 'approvedBank');
  const isAllSelected = approvedBankEntries.length > 0 && 
    approvedBankEntries.every(entry => selectedEntries.includes(entry.entryId));

  // Handle type column click to show details
  const handleTypeClick = (entry) => {
    setSelectedEntry(entry);
    setShowDialog(true);
  };

  // Close dialog
  const closeDialog = () => {
    setShowDialog(false);
    setSelectedEntry(null);
  };

  // Get status icon for entry
  const getStatusIcon = (entryStatus) => {
    switch (entryStatus) {
      case 'pending':
        return <i className="bi bi-dash text-muted" title="Pending"></i>; // - icon
      case 'forwardedBank':
        return <i className="bi bi-dash text-muted" title="Forwarded to Bank"></i>; // - icon
      case 'approvedBank':
        return null; // Show checkbox
      case 'forwardedCash':
        return <i className="bi bi-lock-fill text-warning" title="Forwarded to Cash"></i>; // lock icon
      case 'approvedCash':
        return <i className="bi bi-lock-fill text-warning" title="Cash Approved"></i>; // lock icon
      case 'approved':
        return <i className="bi bi-check-circle-fill text-success" title="Final Approved"></i>; // tick icon
      default:
        return null;
    }
  };

  // Function to update entry status based on entryId (primary key)
  const updateEntryStatus = (entryId, newStatus) => {
    console.log(`📝 Updating entry ${entryId}: status → ${newStatus}`);

    // Update in filteredData state
    const updatedFilteredData = filteredData.map(entry => {
      if (entry.entryId === entryId) {
        return { ...entry, entryStatus: newStatus };
      }
      return entry;
    });

    setFilteredData(updatedFilteredData);

    // Also trigger parent component update if needed
    window.dispatchEvent(new CustomEvent('entryStatusUpdated', { 
      detail: { entryId, newStatus }
    }));
  };

  // Forward entries for cash approval (only forward, not approve)
  const handleForwardForCashApproval = () => {
    if (selectedEntries.length === 0) {
      alert('Please select entries to forward for cash approval');
      return;
    }

    try {
      console.log('🔄 CashSummary: Forwarding entries for cash approval:', selectedEntries);

      // Step 1: Update local state immediately for UI feedback
      const updatedEntries = [...selectedEntries];
      updatedEntries.forEach(entryId => {
        updateEntryStatus(entryId, "forwardedCash");
      });

      // Step 2: Update parent component state immediately
      updatedEntries.forEach(entryId => {
        const entry = filteredData.find(e => e.entryId === entryId);
        if (entry && window.updateEntryStatusInParent) {
          window.updateEntryStatusInParent(entryId, "forwardedCash", entry.entryType);
        }
      });

      // Step 3: Clear selection and show immediate feedback
      setSelectedEntries([]);
      alert(`✅ ${updatedEntries.length} entries forwarded for cash approval!`);

      // Note: Actual Google Sheets sync will be handled by DataSummary's approve function

    } catch (error) {
      console.error('❌ Error forwarding entries:', error);
      alert('Error forwarding entries for cash approval');
    }
  };

  // Calculate totals
  const totalCashIncome = filteredData
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);

  const totalCashExpense = filteredData
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);

  const cashBalance = totalCashIncome - totalCashExpense;

  useEffect(() => {
  }, []);

  // Listen for centralized refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('🔄 CashSummary: Recalculating from centralized refresh');
      filterUserData();
    };

    // Listen for entry status updates from DataSummary
    const handleEntryStatusUpdate = (event) => {
      console.log('📝 CashSummary: Entry status updated:', event.detail);
      const { entryId, newStatus } = event.detail;
      updateEntryStatus(entryId, newStatus);
    };

    window.addEventListener('dataRefreshed', handleDataRefresh);
    window.addEventListener('entryStatusUpdated', handleEntryStatusUpdate);

    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefresh);
      window.removeEventListener('entryStatusUpdated', handleEntryStatusUpdate);
    };
  }, []);

  return (
    <div className="cash-summary-container">
      <div className="summary-header">
        <h3><i className="bi bi-cash-stack"></i> Cash Summary</h3>
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
              <h6><i className="bi bi-arrow-up-circle"></i> Cash Income</h6>
              <h4 className="text-success">₹{totalCashIncome.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card expense-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-down-circle"></i> Cash Expense</h6>
              <h4 className="text-danger">₹{totalCashExpense.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card balance-card">
            <div className="card-body">
              <h6><i className="bi bi-calculator"></i> Cash Balance</h6>
              <h4 className={cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                ₹{Math.abs(cashBalance).toLocaleString()}
                {cashBalance < 0 && ' (Deficit)'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List with Pagination */}
      <div className="transactions-list">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Cash Transactions</h5>
          {selectedEntries.length > 0 && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleForwardForCashApproval}
            >
              <i className="bi bi-send"></i> Forward {selectedEntries.length} for Cash Approval
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
                    <th>Cash</th>
                    <th>
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        onChange={handleSelectAll}
                        checked={isAllSelected}
                        disabled={approvedBankEntries.length === 0}
                        title="Select all approved bank entries"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry, index) => (
                    <tr key={`${entry.entryId || index}`}>
                      <td>
                        {entry.entryType === 'booking' && entry.dateFrom ? 
                          new Date(entry.dateFrom).toLocaleDateString('en-IN') : 
                          new Date(entry.date).toLocaleDateString('en-IN')
                        }
                      </td>
                      <td>
                        <span 
                          className="badge bg-info clickable-type" 
                          onClick={() => handleTypeClick(entry)}
                          style={{cursor: 'pointer'}}
                          title="Click to view details"
                        >
                          {entry.entryType || 'cash'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${entry.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                          {entry.type === 'income' ? 'I' : 'E'}
                        </span>
                      </td>
                      <td className={entry.type === 'income' ? 'text-success' : 'text-danger'}>
                        ₹{(entry.cashAmount || 0).toLocaleString()}
                      </td>
                      <td>
                        {entry.entryStatus === 'approvedBank' ? (
                          <input 
                            type="checkbox" 
                            className="form-check-input"
                            checked={selectedEntries.includes(entry.entryId)}
                            onChange={() => handleSelectEntry(entry.entryId)}
                          />
                        ) : (
                          getStatusIcon(entry.entryStatus)
                        )}
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
            <p className="text-muted mt-2">No cash transactions found</p>
          </div>
        )}
      </div>

      {/* Entry Details Dialog */}
      {showDialog && selectedEntry && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-info-circle"></i> Entry Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeDialog}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <strong>Entry Type:</strong>
                    <span className={`badge bg-info ms-2`}>
                      {selectedEntry.entryType || 'cash'}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Date:</strong> {new Date(selectedEntry.date).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-4">
                    <strong>Cash Amount:</strong>
                    <div className="text-success">₹{(selectedEntry.cashAmount || 0).toLocaleString()}</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Bank Amount:</strong>
                    <div className="text-info">₹{(selectedEntry.bankAmount || 0).toLocaleString()}</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Total Amount:</strong>
                    <div className="text-primary">₹{((selectedEntry.cashAmount || 0) + (selectedEntry.bankAmount || 0)).toLocaleString()}</div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-6">
                    <strong>Transaction Type:</strong>
                    <span className={`badge ms-2 ${selectedEntry.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                      {selectedEntry.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong>
                    <span className="badge bg-secondary ms-2">{selectedEntry.entryStatus}</span>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-12">
                    <strong>Description:</strong>
                    <p className="mt-2">{selectedEntry.description || 'No description available'}</p>
                  </div>
                </div>
                {selectedEntry.submittedBy && (
                  <>
                    <hr />
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Submitted By:</strong> {selectedEntry.submittedBy}
                      </div>
                      {selectedEntry.approvedBy && (
                        <div className="col-md-6">
                          <strong>Approved By:</strong> {selectedEntry.approvedBy}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDialog}>
                  <i className="bi bi-x-circle"></i> Close
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