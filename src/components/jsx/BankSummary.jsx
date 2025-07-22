import React, { useState, useEffect } from "react";
import "../css/BankSummary.css";

function BankSummary({ fareData, expenseData, currentUser, cashDeposit, setCashDeposit, allUsers }) {
  // 📊 RECEIVED DATA EXPLANATION:
  // fareData = Daily entries (income) + Booking entries + Off days
  // expenseData = Fuel + Adda + Union + Service + Other payments
  // cashDeposit = Cash deposit entries from DataSummary

  const [filteredData, setFilteredData] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [entriesPerPage] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    console.log('🔄 BankSummary: Props data updated');
    console.log('📈 FareData (Income):', fareData?.length || 0, 'entries');
    console.log('📉 ExpenseData (Expense):', expenseData?.length || 0, 'entries');
    console.log('🏦 CashDeposit Data:', cashDeposit?.length || 0, 'entries');

    // Debug: Log complete data structure
    console.log('💰 BANK SUMMARY - Complete FareData:', fareData);
    console.log('💸 BANK SUMMARY - Complete ExpenseData:', expenseData);
    console.log('🏦 BANK SUMMARY - Complete CashDeposit:', cashDeposit);

    // Log individual cash deposit entries for detailed inspection
    if (cashDeposit && cashDeposit.length > 0) {
      console.log('🔍 BANK SUMMARY - Cash Deposit Entries Details:');
      cashDeposit.forEach((deposit, index) => {
        console.log(`${index + 1}. Cash Deposit Entry:`, {
          entryType: deposit.entryType,
          entryId: deposit.entryId,
          date: deposit.date,
          cashAmount: deposit.cashAmount,
          description: deposit.description,
          depositedBy: deposit.depositedBy
        });
      });
    } else {
      console.log('⚠️ BANK SUMMARY - No cash deposit entries found');
    }

    // Sample entries for debugging
    if (fareData && fareData.length > 0) {
      console.log('📊 BANK SUMMARY - Sample FareData Entry:', fareData[0]);
    }
    if (expenseData && expenseData.length > 0) {
      console.log('📊 BANK SUMMARY - Sample ExpenseData Entry:', expenseData[0]);
    }

    filterUserData();
  }, [fareData, expenseData, dateFrom, dateTo, currentUser, cashDeposit]);

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

    // 📈 Filter fare data (INCOME) for current user - Include all entries including off days  
    // Data now comes pre-filtered: entryId, date, bankAmount, type, submittedBy, entryStatus, approvedBy
    if (fareData && fareData.length > 0) {
      const userFareData = fareData.filter(entry => 
        entry.submittedBy === currentUserName && 
        (entry.bankAmount > 0 || entry.type === 'off') && // Include off days
        (entry.type === 'daily' || entry.type === 'booking' || entry.type === 'off') // Include off days
      );
      console.log('💰 Bank Income entries found:', userFareData.length);
      console.log('📋 Sample Filtered Bank Entry:', userFareData[0]);

      allData = [...allData, ...userFareData.map(entry => ({
        entryId: entry.entryId,
        date: entry.date,
        dateFrom: entry.dateFrom, // Add dateFrom for booking entries
        bankAmount: entry.type === 'off' ? 0 : entry.bankAmount, // Off days have 0 bank amount
        type: entry.type === 'off' ? 'off-day' : 'income', // Special type for off days
        entryType: entry.type, // daily, booking, or off
        submittedBy: entry.submittedBy,
        entryStatus: entry.entryStatus,
        approvedBy: entry.approvedBy,
        description: entry.type === 'off' ? `Off Day - ${entry.reason}` : (entry.route || entry.bookingDetails || 'Fare Collection')
      }))];
    }

    // 📉 Filter expense data (EXPENSE) for current user - Only BANK entries
    // Data now comes pre-filtered: entryId, date, bankAmount, type, submittedBy, entryStatus, approvedBy
    if (expenseData && expenseData.length > 0) {
      const userExpenseData = expenseData.filter(entry => 
        entry.submittedBy === currentUserName && entry.bankAmount > 0
      );
      console.log('💸 Bank Expense entries found:', userExpenseData.length);
      console.log('📋 Sample Filtered Expense Entry:', userExpenseData[0]);

      allData = [...allData, ...userExpenseData.map(entry => ({
        entryId: entry.entryId,
        date: entry.date,
        bankAmount: entry.bankAmount,
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
    console.log('✅ BANK SUMMARY - Final filtered data:', allData);
    console.log('📊 BANK SUMMARY - Data breakdown:');
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

  // Handle checkbox selection for individual rows (only pending entries)
  const handleSelectEntry = (entryId) => {
    const entry = currentEntries.find(e => e.entryId === entryId);
    if (entry && entry.entryStatus === 'pending') {
      setSelectedEntries(prev => {
        if (prev.includes(entryId)) {
          return prev.filter(id => id !== entryId);
        } else {
          return [...prev, entryId];
        }
      });
    }
  };

  // Handle select all checkbox (only pending entries)
  const handleSelectAll = () => {
    const pendingEntryIds = currentEntries
      .filter(entry => entry.entryStatus === 'pending')
      .map(entry => entry.entryId);

    if (selectedEntries.length === pendingEntryIds.length && pendingEntryIds.length > 0) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(pendingEntryIds);
    }
  };

  // Check if all visible pending entries are selected
  const pendingEntries = currentEntries.filter(entry => entry.entryStatus === 'pending');
  const isAllSelected = pendingEntries.length > 0 && 
    pendingEntries.every(entry => selectedEntries.includes(entry.entryId));

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
        return null; // Show checkbox
      case 'approved':
        return <i className="bi bi-check-circle-fill text-success" title="Final Approved"></i>; // green tick icon
      default:
        return <i className="bi bi-lock-fill text-warning" title={`Status: ${entryStatus}`}></i>; // lock icon for all other statuses
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

  const handleForwardForApproval = async () => {
    if (selectedEntries.length === 0) {
      alert('Please select entries to forward for approval');
      return;
    }

    try {
      console.log('🔄 BankSummary: Forwarding entries for bank approval:', selectedEntries);

      // Process each selected entry
      for (const entryId of selectedEntries) {
        const entry = filteredData.find(e => e.entryId === entryId);
        if (!entry) continue;

        // Update status locally first (for immediate UI feedback)
        updateEntryStatus(entryId, "forwardedBank");

        // Update parent state
        if (window.updateEntryStatusInParent) {
          window.updateEntryStatusInParent(entryId, "forwardedBank", entry.entryType);
        }

        // Background API call to Google Sheets (don't wait for it)
        try {
          const authService = (await import('../../services/authService.js')).default;

          if (entry.entryType === 'daily') {
            authService.updateFareReceiptStatus(entryId, "forwardedBank", "").catch(error => {
              console.error('Background API sync failed for fare receipt:', error);
            });
          } else if (entry.entryType === 'booking') {
            authService.updateBookingEntryStatus(entryId, "forwardedBank", "").catch(error => {
              console.error('Background API sync failed for booking entry:', error);
            });
          } else if (entry.entryType === 'fuel') {
            authService.updateFuelPaymentStatus(entryId, "forwardedBank", "").catch(error => {
              console.error('Background API sync failed for fuel payment:', error);
            });
          } else if (entry.entryType === 'adda') {
            authService.updateAddaPaymentStatus(entryId, "forwardedBank", "").catch(error => {
              console.error('Background API sync failed for adda payment:', error);
            });
          } else if (entry.entryType === 'union') {
            authService.updateUnionPaymentStatus(entryId, "forwardedBank", "").catch(error => {
              console.error('Background API sync failed for union payment:', error);
            });
          } else if (entry.entryType === 'service') {
            authService.updateServicePaymentStatus(entryId, "forwardedBank", "").catch(error => {
              console.error('Background API sync failed for service payment:', error);
            });
          } else if (entry.entryType === 'other') {
            authService.updateOtherPaymentStatus(entryId, "forwardedBank", "").catch(error => {
              console.error('Background API sync failed for other payment:', error);
            });
          }
        } catch (error) {
          console.error('Error importing authService:', error);
        }
      }

      alert(`✅ ${selectedEntries.length} entries forwarded for bank approval!`);
      setSelectedEntries([]);

      console.log('✅ BankSummary: Status update completed');

    } catch (error) {
      console.error('❌ Error forwarding entries:', error);
      alert('Error forwarding entries for approval');
    }
  };

  // Calculate totals - Only NON-APPROVED entries (exclude approved status)
  const totalBankIncome = filteredData
    .filter(entry => entry.type === 'income' && entry.entryStatus !== 'approved') // Exclude approved and off-day
    .reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

  const totalBankExpense = filteredData
    .filter(entry => entry.type === 'expense' && entry.entryStatus !== 'approved')
    .reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

  // Bank balance = Non-Approved Income - Non-Approved Expenses
  const bankBalance = totalBankIncome - totalBankExpense;

  

  useEffect(() => {
  }, []);

  // Listen for centralized refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('🔄 BankSummary: Recalculating from centralized refresh');
      filterUserData();
    };

    // Listen for entry status updates from DataSummary
    const handleEntryStatusUpdate = (event) => {
      console.log('📝 BankSummary: Entry status updated:', event.detail);
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
    <div className="bank-summary-container">
      <div className="cash-book-header">
        <h2><i className="bi bi-bank"></i> Bank Summary</h2>
        <p>Personal bank transactions and balance overview</p>

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

      {/* Date Filter */}
      {showFilter && (
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
      )}

      {/* Summary Cards */}
      {showSummary && (
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="summary-card income-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-up-circle"></i> Bank Income</h6>
              <h4 className="text-success">₹{totalBankIncome.toLocaleString()}</h4>
              <small className="text-muted">Pending entries</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="summary-card expense-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-down-circle"></i> Bank Expense</h6>
              <h4 className="text-danger">₹{totalBankExpense.toLocaleString()}</h4>
              <small className="text-muted">Pending payments</small>
            </div>
          </div>
        </div>
      </div>
      )}

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
                        disabled={pendingEntries.length === 0}
                        title="Select all pending entries"
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
                          {entry.entryType || 'bank'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          entry.type === 'income' ? 'bg-success' : 
                          entry.type === 'off-day' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {entry.type === 'income' ? 'I' : 
                           entry.type === 'off-day' ? 'O' : 'E'}
                        </span>
                      </td>
                      <td className={
                        entry.type === 'income' ? 'text-success' : 
                        entry.type === 'off-day' ? 'text-warning' : 'text-danger'
                      }>
                        {entry.type === 'off-day' ? 'Off Day' : `₹${(entry.bankAmount || 0).toLocaleString()}`}
                      </td>
                      <td>
                        {entry.entryStatus === 'pending' ? (
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
                      title="Previous Page"
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
                          title={`Go to page ${pageNumber}`}
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
                      title="Next Page"
                    >
                      Next
                    </button>
                  </li>
                </ul>
                <div className="pagination-info">
                  <small className="text-muted">
                    Page {currentPage} of {totalPages}
                  </small>
                </div>
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
                      {selectedEntry.entryType || 'bank'}
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

export default BankSummary;