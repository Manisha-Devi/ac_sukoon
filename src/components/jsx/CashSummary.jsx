import React, { useState, useEffect } from "react";
import "../css/CashSummary.css";

function CashSummary({ fareData, expenseData, currentUser, allUsers }) {
  // 📊 RECEIVED DATA EXPLANATION:
  // fareData = Daily entries (income) + Booking entries + Off days
  // expenseData = Fuel + Adda + Union + Service + Other payments
  // allUsers = Array of all users with fixedCash data

  const [filteredData, setFilteredData] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [entriesPerPage] = useState(10);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showSummary, setShowSummary] = useState(true);


  useEffect(() => {
    console.log('🔄 CashSummary: Props data updated');
    console.log('📈 FareData (Income):', fareData?.length || 0, 'entries');
    console.log('📉 ExpenseData (Expense):', expenseData?.length || 0, 'entries');

    // 🚨 DETAILED OBJECT STRUCTURE DEBUG 🚨
    console.log('💰 CASH SUMMARY - Complete FareData OBJECT STRUCTURE:');
    console.log('   - fareData type:', typeof fareData);
    console.log('   - fareData is Array:', Array.isArray(fareData));
    console.log('   - fareData value:', fareData);
    
    console.log('💸 CASH SUMMARY - Complete ExpenseData OBJECT STRUCTURE:');
    console.log('   - expenseData type:', typeof expenseData);
    console.log('   - expenseData is Array:', Array.isArray(expenseData));
    console.log('   - expenseData value:', expenseData);

    console.log('👤 CURRENT USER OBJECT STRUCTURE:');
    console.log('   - currentUser type:', typeof currentUser);
    console.log('   - currentUser value:', currentUser);
    console.log('   - currentUser.fullName:', currentUser?.fullName);
    console.log('   - currentUser.username:', currentUser?.username);

    console.log('👥 ALL USERS OBJECT STRUCTURE:');
    console.log('   - allUsers type:', typeof allUsers);
    console.log('   - allUsers is Array:', Array.isArray(allUsers));
    console.log('   - allUsers value:', allUsers);

    // Sample entries for debugging
    if (fareData && fareData.length > 0) {
      console.log('📊 CASH SUMMARY - Sample FareData Entry:');
      console.log('   - Entry object keys:', Object.keys(fareData[0]));
      console.log('   - Complete entry:', fareData[0]);
    }
    if (expenseData && expenseData.length > 0) {
      console.log('📊 CASH SUMMARY - Sample ExpenseData Entry:');
      console.log('   - Entry object keys:', Object.keys(expenseData[0]));
      console.log('   - Complete entry:', expenseData[0]);
    }

    console.log('🔍 PROPS RECEIVED IN CASH SUMMARY:');
    console.log('   - Props keys:', Object.keys({ fareData, expenseData, currentUser, allUsers }));

    filterUserData();
  }, [fareData, expenseData, dateFrom, dateTo, currentUser, allUsers]);

  const filterUserData = () => {
    console.log('🔍 STARTING filterUserData function...');
    
    if (!currentUser) {
      console.log('⚠️ No current user found');
      console.log('   - currentUser is:', currentUser);
      return;
    }

    const currentUserName = currentUser.fullName || currentUser.username;
    let allData = [];

    console.log('👤 Filtering data for user:', currentUserName);
    console.log('   - currentUser.fullName:', currentUser.fullName);
    console.log('   - currentUser.username:', currentUser.username);
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
    // Data now comes pre-filtered: entryId, date, cashAmount, type, submittedBy, entryStatus, approvedBy
    if (fareData && fareData.length > 0) {
      const userFareData = fareData.filter(entry => 
        entry.submittedBy === currentUserName && 
        (entry.cashAmount > 0 || entry.type === 'off') && // Include off days
        (entry.type === 'daily' || entry.type === 'booking' || entry.type === 'off') // Include off days
      );
      console.log('💰 Cash Income entries found:', userFareData.length);
      console.log('📋 Sample Filtered Cash Entry:', userFareData[0]);
      console.log('🔍 All Fare Entries for', currentUserName, ':', userFareData);

      allData = [...allData, ...userFareData.map(entry => ({
        entryId: entry.entryId,
        date: entry.date,
        dateFrom: entry.dateFrom, // Add dateFrom for booking entries
        cashAmount: entry.type === 'off' ? 0 : entry.cashAmount, // Off days have 0 cash amount
        type: entry.type === 'off' ? 'off-day' : 'income', // Special type for off days
        entryType: entry.type, // daily, booking, or off
        submittedBy: entry.submittedBy,
        entryStatus: entry.entryStatus,
        approvedBy: entry.approvedBy,
        description: entry.type === 'off' ? `Off Day - ${entry.reason}` : (entry.route || entry.bookingDetails || 'Fare Collection')
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
      console.log('🔍 All Expense Entries for', currentUserName, ':', userExpenseData);

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

    // 💰 Fixed Cash entries are now excluded from Cash Summary
    // They will only appear in Cash Book for proper accounting
    console.log('💰 Fixed Cash entries excluded from Cash Summary display');

    // Apply date filter if dates are selected
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);

      allData = allData.filter(entry => {
        const entryDate = new Date(entry.date);
        // Skip entries with invalid dates
        if (isNaN(entryDate.getTime())) {
          console.warn('Invalid date found in entry:', entry);
          return false;
        }
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

  // Handle checkbox selection for individual rows (only for specific conditions)
  const handleSelectEntry = (entryId) => {
    const entry = filteredData.find(e => e.entryId === entryId);
    
    if (!entry) {
      console.log('⚠️ Entry not found:', entryId);
      return;
    }

    // Get bankAmount from original entry data
    const originalEntry = [...(fareData || []), ...(expenseData || [])].find(e => e.entryId === entryId);
    const bankAmount = originalEntry?.bankAmount || 0;
    
    console.log('🎯 handleSelectEntry called:', {
      entryId: entryId,
      entryStatus: entry.entryStatus,
      bankAmount: bankAmount,
      shouldShowCheckbox: entry.entryStatus === 'approvedBank' || 
                         (entry.entryStatus === 'pending' && bankAmount === 0)
    });
    
    // Show checkbox only for:
    // 1. status = 'approvedBank' (regardless of bankAmount)  
    // 2. status = 'pending' AND bankAmount = 0
    if (entry.entryStatus === 'approvedBank' || 
        (entry.entryStatus === 'pending' && bankAmount === 0)) {
      setSelectedEntries(prev => {
        if (prev.includes(entryId)) {
          return prev.filter(id => id !== entryId);
        } else {
          return [...prev, entryId];
        }
      });
    }
  };

  // Handle select all checkbox (for selectable entries only)
  const handleSelectAll = () => {
    const selectableEntries = currentEntries.filter(entry => {
      // Get bankAmount from original entry data
      const originalEntry = [...(fareData || []), ...(expenseData || [])].find(e => e.entryId === entry.entryId);
      const bankAmount = originalEntry?.bankAmount || 0;
      
      return entry.entryStatus === 'approvedBank' || 
             (entry.entryStatus === 'pending' && bankAmount === 0);
    });
    const selectableEntryIds = selectableEntries.map(entry => entry.entryId);

    console.log('📋 handleSelectAll called:', {
      totalEntries: currentEntries.length,
      selectableEntries: selectableEntries.length,
      selectableEntryIds: selectableEntryIds
    });

    if (selectedEntries.length === selectableEntryIds.length && selectableEntryIds.length > 0) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(selectableEntryIds);
    }
  };

  // Check if all visible selectable entries are selected
  const selectableEntries = currentEntries.filter(entry => {
    // Get bankAmount from original entry data
    const originalEntry = [...(fareData || []), ...(expenseData || [])].find(e => e.entryId === entry.entryId);
    const bankAmount = originalEntry?.bankAmount || 0;
    
    return entry.entryStatus === 'approvedBank' || 
           (entry.entryStatus === 'pending' && bankAmount === 0);
  });
  const isAllSelected = selectableEntries.length > 0 && 
    selectableEntries.every(entry => selectedEntries.includes(entry.entryId));

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

  // Get status icon for entry based on status and bankAmount
  const getStatusIcon = (entry) => {
    const entryStatus = entry.entryStatus;
    
    // Get bankAmount from original entry data
    const originalEntry = [...(fareData || []), ...(expenseData || [])].find(e => e.entryId === entry.entryId);
    const bankAmount = originalEntry?.bankAmount || 0;
    
    console.log('🔍 getStatusIcon called for entry:', {
      entryId: entry.entryId,
      entryStatus: entryStatus,
      bankAmount: bankAmount,
      type: entry.type
    });
    
    switch (entryStatus) {
      case 'pending':
        if (bankAmount === 0) {
          console.log('✅ Showing checkbox for pending entry with bankAmount = 0');
          return null; // Show checkbox
        } else {
          console.log('➖ Showing dash for pending entry with bankAmount > 0');
          return <i className="bi bi-dash text-muted" title="Pending with Bank Amount"></i>; // - icon
        }
      case 'forwardedBank':
        console.log('➖ Showing dash for forwardedBank entry');
        return <i className="bi bi-dash text-muted" title="Forwarded to Bank"></i>; // - icon
      case 'forwardedCash':
        console.log('➖ Showing dash for forwardedCash entry');
        return <i className="bi bi-dash text-muted" title="Forwarded to Cash"></i>; // - icon
      case 'approvedBank':
        console.log('✅ Showing checkbox for approvedBank entry');
        return null; // Show checkbox
      case 'approved':
        console.log('✅ Showing green tick for approved entry');
        return <i className="bi bi-check-circle-fill text-success" title="Final Approved"></i>; // green tick icon
      default:
        console.log('🔒 Showing lock for other status:', entryStatus);
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
      return;
    });

    setFilteredData(updatedFilteredData);

    // Also trigger parent component update if needed
    window.dispatchEvent(new CustomEvent('entryStatusUpdated', { 
      detail: { entryId, newStatus }
    }));
  };

  // Forward selected entries for approval
  const handleForwardForApproval = async () => {
    if (selectedEntries.length === 0) {
      alert('Please select entries to forward for approval');
      return;
    }

    try {
      console.log('🔄 CashSummary: Forwarding entries for cash approval:', selectedEntries);

      // Process each selected entry
      for (const entryId of selectedEntries) {
        const entry = filteredData.find(e => e.entryId === entryId);
        if (!entry) continue;

        // Determine new status based on current entry status
        let newStatus = "forwardedCash";

        if (entry && entry.entryStatus === 'pending') {
          newStatus = "forwardedCash"; // pending -> forwardedCash
        } else if (entry && entry.entryStatus === 'approvedBank') {
          newStatus = "forwardedCash"; // approvedBank -> forwardedCash
        }

        // Update status locally first (for immediate UI feedback)
        updateEntryStatus(entryId, newStatus);

        // Update parent state
        if (window.updateEntryStatusInParent) {
          window.updateEntryStatusInParent(entryId, newStatus, entry.entryType);
        }

        // Background API call to Google Sheets (don't wait for it)
        try {
          const authService = (await import('../../services/authService.js')).default;

          if (entry.entryType === 'daily') {
            authService.updateFareReceiptStatus(entryId, newStatus, "").catch(error => {
              console.error('Background API sync failed for fare receipt:', error);
            });
          } else if (entry.entryType === 'booking') {
            authService.updateBookingEntryStatus(entryId, newStatus, "").catch(error => {
              console.error('Background API sync failed for booking entry:', error);
            });
          } else if (entry.entryType === 'fuel') {
            authService.updateFuelPaymentStatus(entryId, newStatus, "").catch(error => {
              console.error('Background API sync failed for fuel payment:', error);
            });
          } else if (entry.entryType === 'adda') {
            authService.updateAddaPaymentStatus(entryId, newStatus, "").catch(error => {
              console.error('Background API sync failed for adda payment:', error);
            });
          } else if (entry.entryType === 'union') {
            authService.updateUnionPaymentStatus(entryId, newStatus, "").catch(error => {
              console.error('Background API sync failed for union payment:', error);
            });
          } else if (entry.entryType === 'service') {
            authService.updateServicePaymentStatus(entryId, newStatus, "").catch(error => {
              console.error('Background API sync failed for service payment:', error);
            });
          } else if (entry.entryType === 'other') {
            authService.updateOtherPaymentStatus(entryId, newStatus, "").catch(error => {
              console.error('Background API sync failed for other payment:', error);
            });
          }
        } catch (error) {
          console.error('Error importing authService:', error);
        }
      }

      alert(`✅ ${selectedEntries.length} entries forwarded for cash approval!`);
      setSelectedEntries([]);

      console.log('✅ CashSummary: Status update completed');

    } catch (error) {
      console.error('❌ Error forwarding entries:', error);
      alert('Error forwarding entries for approval');
    }
  };

  // Calculate totals - Only NON-APPROVED entries (exclude approved status)
  const totalCashIncome = filteredData
    .filter(entry => entry.type === 'income' && entry.entryStatus !== 'approved')
    .reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);

  const totalCashExpense = filteredData
    .filter(entry => entry.type === 'expense' && entry.entryStatus !== 'approved')
    .reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);

  // Calculate non-approved cash income (exclude approved entries) for current user only
  const nonApprovedCashIncome = filteredData
    .filter(entry => {
      const isCurrentUserEntry = entry.submittedBy === (currentUser?.fullName || currentUser?.username);
      const isIncomeEntry = entry.type === 'income';
      const isNotApproved = entry.entryStatus !== 'approved';
      
      console.log('💰 Income Entry Check:', {
        entryId: entry.entryId,
        submittedBy: entry.submittedBy,
        currentUser: currentUser?.fullName || currentUser?.username,
        isCurrentUserEntry,
        isIncomeEntry,
        isNotApproved,
        cashAmount: entry.cashAmount,
        include: isCurrentUserEntry && isIncomeEntry && isNotApproved
      });
      
      return isCurrentUserEntry && isIncomeEntry && isNotApproved;
    })
    .reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);

  // Calculate non-approved cash expense (exclude approved entries) for current user only
  const nonApprovedCashExpense = filteredData
    .filter(entry => {
      const isCurrentUserEntry = entry.submittedBy === (currentUser?.fullName || currentUser?.username);
      const isExpenseEntry = entry.type === 'expense';
      const isNotApproved = entry.entryStatus !== 'approved';
      
      console.log('💸 Expense Entry Check:', {
        entryId: entry.entryId,
        submittedBy: entry.submittedBy,
        currentUser: currentUser?.fullName || currentUser?.username,
        isCurrentUserEntry,
        isExpenseEntry,
        isNotApproved,
        cashAmount: entry.cashAmount,
        include: isCurrentUserEntry && isExpenseEntry && isNotApproved
      });
      
      return isCurrentUserEntry && isExpenseEntry && isNotApproved;
    })
    .reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);

  // Get Fixed Cash for current user
  const getCurrentUserFixedCash = () => {
    if (!currentUser || !allUsers) return 0;
    const currentUserName = currentUser.fullName || currentUser.username;
    const userInfo = allUsers.find(user => 
      user.name === currentUserName || user.username === currentUserName
    );
    console.log('🏦 Fixed Cash Check:', {
      currentUserName,
      userInfo,
      fixedCash: userInfo ? (userInfo.fixedCash || 0) : 0
    });
    return userInfo ? (userInfo.fixedCash || 0) : 0;
  };

  const fixedCash = getCurrentUserFixedCash();

  // Cash balance = Non-approved Income - Non-approved Expenses (Fixed Cash not included)
  const cashBalance = nonApprovedCashIncome - nonApprovedCashExpense;

  // Debug logging for calculation verification
  console.log('💰 CASH BALANCE CALCULATION DEBUG:');
  console.log('👤 Current User:', currentUser?.fullName || currentUser?.username);
  console.log('📊 Non-approved Cash Income (Current User Only):', nonApprovedCashIncome);
  console.log('📊 Non-approved Cash Expense (Current User Only):', nonApprovedCashExpense);
  console.log('📊 Fixed Cash for Current User:', fixedCash);
  console.log('📊 Cash Balance Formula: Income - Expenses');
  console.log('📊 Cash Balance = ', nonApprovedCashIncome, '-', nonApprovedCashExpense, '=', cashBalance);
  
  // Detailed breakdown
  const currentUserName = currentUser?.fullName || currentUser?.username;
  const incomeEntries = filteredData.filter(entry => 
    entry.submittedBy === currentUserName && 
    entry.type === 'income' && 
    entry.entryStatus !== 'approved'
  );
  const expenseEntries = filteredData.filter(entry => 
    entry.submittedBy === currentUserName && 
    entry.type === 'expense' && 
    entry.entryStatus !== 'approved'
  );
  
  // Show ALL entries for comparison
  const allIncomeEntries = filteredData.filter(entry => 
    entry.submittedBy === currentUserName && 
    entry.type === 'income'
  );
  const allExpenseEntries = filteredData.filter(entry => 
    entry.submittedBy === currentUserName && 
    entry.type === 'expense'
  );
  
  console.log('📋 ========== INCOME ENTRIES COMPARISON ==========');
  console.log('📋 ALL Income entries for current user:', allIncomeEntries.length, allIncomeEntries);
  console.log('📋 NON-APPROVED Income entries for current user:', incomeEntries.length, incomeEntries);
  console.log('📋 ========== EXPENSE ENTRIES COMPARISON ==========');
  console.log('📋 ALL Expense entries for current user:', allExpenseEntries.length, allExpenseEntries);
  console.log('📋 NON-APPROVED Expense entries for current user:', expenseEntries.length, expenseEntries);
  
  console.log('🔍 ========== ENTRY STATUS BREAKDOWN ==========');
  allIncomeEntries.forEach((entry, index) => {
    console.log(`📈 Income Entry ${index + 1}:`, {
      entryId: entry.entryId,
      date: entry.date,
      cashAmount: entry.cashAmount,
      entryStatus: entry.entryStatus,
      isApproved: entry.entryStatus === 'approved',
      includedInBalance: entry.entryStatus !== 'approved'
    });
  });
  
  allExpenseEntries.forEach((entry, index) => {
    console.log(`📉 Expense Entry ${index + 1}:`, {
      entryId: entry.entryId,
      date: entry.date,
      cashAmount: entry.cashAmount,
      entryStatus: entry.entryStatus,
      isApproved: entry.entryStatus === 'approved',
      includedInBalance: entry.entryStatus !== 'approved'
    });
  });
  
  console.log('🏦 Fixed Cash source user info:', allUsers?.find(user => 
    user.name === currentUserName || user.username === currentUserName
  ));

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
  }, [allUsers]);

  return (
    <div className="cash-summary-container">
      <div className="cash-book-header">
        <h2><i className="bi bi-cash-stack"></i> Cash Summary</h2>
        <p>Personal cash transactions and balance overview</p>

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
        <div className="simple-date-filter">
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
                className="btn btn-outline-secondary btn-sm clear-filter-btn"
                onClick={clearFilter}
                disabled={!dateFrom && !dateTo}
              >
                <i className="bi bi-x-circle"></i> Clear
              </button>
            </div>
            <div className="col-md-3">
              <small className="text-muted filter-info">
                {dateFrom || dateTo ? 
                  `${filteredData.length} of ${filteredData.length} entries` :
                  `${filteredData.length} total entries`
                }
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {showSummary && (
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="summary-card income-card">
              <div className="card-body">
                <h6><i className="bi bi-arrow-up-circle"></i> Cash Income</h6>
                <h4 className="text-success">₹{totalCashIncome.toLocaleString()}</h4>
                <small className="text-muted">Pending entries</small>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="summary-card expense-card">
              <div className="card-body">
                <h6><i className="bi bi-arrow-down-circle"></i> Cash Expense</h6>
                <h4 className="text-danger">₹{totalCashExpense.toLocaleString()}</h4>
                <small className="text-muted">Pending payments</small>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="summary-card fixed-cash-card">
              <div className="card-body">
                <h6><i className="bi bi-cash-coin"></i> Fixed Cash</h6>
                <h4 className="text-info">₹{fixedCash.toLocaleString()}</h4>
                <small className="text-muted">Starting amount</small>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="summary-card balance-card">
              <div className="card-body">
                <h6><i className="bi bi-calculator"></i> Cash Balance</h6>
                <h4 className={cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                  ₹{Math.abs(cashBalance).toLocaleString()}
                  {cashBalance < 0 && ' (Deficit)'}
                </h4>
                <small className="text-muted">Cash in Hand</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List with Pagination */}
      <div className="transactions-list">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Cash Transactions</h5>
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
                    <th>Cash</th>
                    <th>
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        onChange={handleSelectAll}
                        checked={isAllSelected}
                        disabled={selectableEntries.length === 0}
                        title="Select all pending and approved bank entries"
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
                        {(() => {
                          // Get bankAmount from original entry data
                          const originalEntry = [...(fareData || []), ...(expenseData || [])].find(e => e.entryId === entry.entryId);
                          const bankAmount = originalEntry?.bankAmount || 0;
                          const shouldShowCheckbox = entry.entryStatus === 'approvedBank' || 
                                                   (entry.entryStatus === 'pending' && bankAmount === 0);
                          
                          console.log('🎛️ Table cell render for entry:', {
                            entryId: entry.entryId,
                            entryStatus: entry.entryStatus,
                            bankAmount: bankAmount,
                            shouldShowCheckbox: shouldShowCheckbox
                          });
                          
                          if (shouldShowCheckbox) {
                            return (
                              <input 
                                type="checkbox" 
                                className="form-check-input"
                                checked={selectedEntries.includes(entry.entryId)}
                                onChange={() => handleSelectEntry(entry.entryId)}
                              />
                            );
                          } else {
                            return getStatusIcon(entry);
                          }
                        })()}
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