import React, { useState, useEffect } from "react";
import "./App.css";

// Import all components
import Login from "./components/jsx/Login";
import Navbar from "./components/jsx/Navbar";
import Dashboard from "./components/jsx/Dashboard";
import FareEntry from "./components/jsx/FareRecipt";
import BasicPayment from "./components/jsx/BasicPayment.jsx";
import MiscPayment from "./components/jsx/MiscPayment";
import BonusCalculator from "./components/jsx/BonusCalculator";
import Analytics from "./components/jsx/Analytics";
import CashBook from "./components/jsx/CashBook";
import DataSummary from './components/jsx/DataSummary.jsx';
import CashSummary from './components/jsx/CashSummary.jsx';
import BankSummary from './components/jsx/BankSummary.jsx';
import authService from "./services/authService";


function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expenseData, setExpenseData] = useState([]);
  const [fareData, setFareData] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [cashBookEntries, setCashBookEntries] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [dataStats, setDataStats] = useState({
    totalRecords: 0,
    fareRecords: 0,
    expenseRecords: 0,
    lastSync: null
  });
  const [allUsers, setAllUsers] = useState([]);
  const [cashDeposit, setCashDeposit] = useState([]);


  // New detailed statistics state
  const [dataStatistics, setDataStatistics] = useState({
    totalRecords: 0,
    incomeRecords: 0,
    expenseRecords: 0,
    lastFetchTime: null,
    lastFetchDate: null,
    refreshCount: 0,
    dataBreakdown: {
      fareReceipts: 0,
      bookingEntries: 0,
      offDays: 0,
      fuelPayments: 0,
      addaPayments: 0,
      unionPayments: 0,
      servicePayments: 0,
      otherPayments: 0
    }
  });

  // Centralized function to fetch and log all users data
  const fetchAllUsersData = async () => {
    try {
      console.log('🔄 Fetching all users data centrally...');

      const response = await authService.getAllUsers();

      console.log('🔍 getAllUsers response:', response);

      if (response && response.success && response.data) {
        console.log('✅ All Users Data Retrieved Successfully:');
        console.log('📊 Total Users Count:', response.count || response.data.length);
        console.log('👥 Complete Users List:', response.data);
        console.log('⏰ Data Timestamp:', response.timestamp);

        // Log each user individually for better readability
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log('📝 Individual User Details:');
          response.data.forEach((user, index) => {
            console.log(`${index + 1}. User:`, {
              username: user.username,
              name: user.name,
              date: user.date,
              fixedCash: user.fixedCash
            });
          });

          setAllUsers(response.data);
          return response.data;
        } else {
          console.warn('⚠️ Empty users data array in response');
          setAllUsers([]);
          return [];
        }
      } else {
        const errorMessage = response?.error || response?.message || 'Unknown error';
        console.error('❌ Failed to fetch users:', errorMessage);
        console.error('❌ Full response:', response);

        // For debugging: Try to call the API with GET method as fallback
        console.log('🔄 Trying fallback GET method...');
        try {
          const fallbackResponse = await fetch(`${authService.API_URL}?action=getAllUsers`, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow'
          });

          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            console.log('🔄 Fallback GET response:', fallbackResult);

            if (fallbackResult.success && fallbackResult.data) {
              setAllUsers(fallbackResult.data);
              return fallbackResult.data;
            }
          }
        } catch (fallbackError) {
          console.log('❌ Fallback method also failed:', fallbackError.message);
        }

        setAllUsers([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
      console.error('❌ Error details:', error.message);
      setAllUsers([]);
      return [];
    }
  };


  // Handle user login - Only React state, no localStorage
  const handleLogin = (userData) => {
    setUser(userData);
    console.log('👤 User logged in via React state:', userData);

    // Refresh users data after login
    console.log('🔄 Refreshing users data after login...');
    fetchAllUsersData();
  };

  // Handle user logout - Only clear React state
  const handleLogout = () => {
    setUser(null);
    setActiveTab("dashboard");
  };

  // Centralized data refresh function used by Navbar
  const handleDataRefresh = async () => {
    setIsRefreshing(true);
    setLastRefreshTime(new Date().toISOString());

    try {
      console.log('🔄 App.jsx: Starting data refresh...');

      // Load all data with individual error handling
      const [
        fareReceiptsResult,
        bookingEntriesResult, 
        offDaysResult,
        fuelPaymentsResult,
        addaPaymentsResult,
        unionPaymentsResult,
        servicePaymentsResult,
        otherPaymentsResult,
        cashDepositsResult,
        allUsersResult
      ] = await Promise.allSettled([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays(),
        authService.getFuelPayments(),
        authService.getAddaPayments(),
        authService.getUnionPayments(),
        authService.getServicePayments(),
        authService.getOtherPayments(),
        authService.getCashDeposits(),
        authService.getAllUsers()
      ]);

      // Process fare receipts
      let processedFareReceipts = [];
      if (fareReceiptsResult.status === 'fulfilled' && fareReceiptsResult.value?.success) {
        processedFareReceipts = fareReceiptsResult.value.data.map(entry => ({
          ...entry,
          entryType: 'daily',
          type: 'daily'
        }));
        console.log(`✅ App.jsx: Processed ${processedFareReceipts.length} fare receipts`);
      } else {
        console.error('❌ App.jsx: Failed to load fare receipts:', fareReceiptsResult.reason);
      }

      // Process booking entries
      let processedBookingEntries = [];
      if (bookingEntriesResult.status === 'fulfilled' && bookingEntriesResult.value?.success) {
        processedBookingEntries = bookingEntriesResult.value.data.map(entry => ({
          ...entry,
          entryType: 'booking',
          type: 'booking'
        }));
        console.log(`✅ App.jsx: Processed ${processedBookingEntries.length} booking entries`);
      } else {
        console.error('❌ App.jsx: Failed to load booking entries:', bookingEntriesResult.reason);
      }

      // Process off days
      let processedOffDays = [];
      if (offDaysResult.status === 'fulfilled' && offDaysResult.value?.success) {
        processedOffDays = offDaysResult.value.data.map(entry => ({
          ...entry,
          entryType: 'off',
          type: 'off'
        }));
        console.log(`✅ App.jsx: Processed ${processedOffDays.length} off days`);
      } else {
        console.error('❌ App.jsx: Failed to load off days:', offDaysResult.reason);
      }

      // Process fuel payments
      let processedFuelPayments = [];
      if (fuelPaymentsResult.status === 'fulfilled' && fuelPaymentsResult.value?.success) {
        processedFuelPayments = fuelPaymentsResult.value.data.map(entry => ({
          ...entry,
          entryType: 'fuel',
          type: 'fuel'
        }));
        console.log(`✅ App.jsx: Processed ${processedFuelPayments.length} fuel payments`);
      } else {
        console.error('❌ App.jsx: Failed to load fuel payments:', fuelPaymentsResult.reason);
      }

      // Process adda payments
      let processedAddaPayments = [];
      if (addaPaymentsResult.status === 'fulfilled' && addaPaymentsResult.value?.success) {
        processedAddaPayments = addaPaymentsResult.value.data.map(entry => ({
          ...entry,
          entryType: 'adda',
          type: 'adda'
        }));
        console.log(`✅ App.jsx: Processed ${processedAddaPayments.length} adda payments`);
      } else {
        console.error('❌ App.jsx: Failed to load adda payments:', addaPaymentsResult.reason);
      }

      // Process union payments
      let processedUnionPayments = [];
      if (unionPaymentsResult.status === 'fulfilled' && unionPaymentsResult.value?.success) {
        processedUnionPayments = unionPaymentsResult.value.data.map(entry => ({
          ...entry,
          entryType: 'union',
          type: 'union'
        }));
        console.log(`✅ App.jsx: Processed ${processedUnionPayments.length} union payments`);
      } else {
        console.error('❌ App.jsx: Failed to load union payments:', unionPaymentsResult.reason);
      }

      // Process service payments
      let processedServicePayments = [];
      if (servicePaymentsResult.status === 'fulfilled' && servicePaymentsResult.value?.success) {
        processedServicePayments = servicePaymentsResult.value.data.map(entry => ({
          ...entry,
          entryType: 'service',
          type: 'service'
        }));
        console.log(`✅ App.jsx: Processed ${processedServicePayments.length} service payments`);
      } else {
        console.error('❌ App.jsx: Failed to load service payments:', servicePaymentsResult.reason);
      }

      // Process other payments
      let processedOtherPayments = [];
      if (otherPaymentsResult.status === 'fulfilled' && otherPaymentsResult.value?.success) {
        processedOtherPayments = otherPaymentsResult.value.data.map(entry => ({
          ...entry,
          entryType: 'other',
          type: 'other'
        }));
        console.log(`✅ App.jsx: Processed ${processedOtherPayments.length} other payments`);
      } else {
        console.error('❌ App.jsx: Failed to load other payments:', otherPaymentsResult.reason);
      }

      // Process cash deposits
      let processedCashDeposits = [];
      if (cashDepositsResult.status === 'fulfilled' && cashDepositsResult.value?.success) {
        processedCashDeposits = cashDepositsResult.value.data.map(entry => ({
          ...entry,
          entryType: 'cashDeposit',
          type: 'cashDeposit'
        }));
        setCashDeposit(processedCashDeposits);
        console.log(`✅ App.jsx: Processed ${processedCashDeposits.length} cash deposits`);
      } else {
        console.error('❌ App.jsx: Failed to load cash deposits:', cashDepositsResult.reason);
      }

      // Process all users data
      if (allUsersResult.status === 'fulfilled' && allUsersResult.value?.success) {
        setAllUsers(allUsersResult.value.data || []);
        console.log(`✅ App.jsx: Processed ${allUsersResult.value.data?.length || 0} users`);
      } else {
        console.error('❌ App.jsx: Failed to load users:', allUsersResult.reason);
      }

      // Combine all processed data
      const combinedFareData = [
        ...processedFareReceipts,
        ...processedBookingEntries,
        ...processedOffDays
      ];

      const combinedExpenseData = [
        ...processedFuelPayments,
        ...processedAddaPayments,
        ...processedUnionPayments,
        ...processedServicePayments,
        ...processedOtherPayments
      ];

      setFareData(combinedFareData);
      setExpenseData(combinedExpenseData);

      // Calculate and update totals
      const totalEarningsAmount = combinedFareData
        .filter(entry => entry.type !== 'off')
        .reduce((sum, entry) => sum + (parseFloat(entry.totalAmount) || 0), 0);

      const totalExpensesAmount = combinedExpenseData
        .reduce((sum, entry) => sum + (parseFloat(entry.totalAmount) || 0), 0);

      setTotalEarnings(totalEarningsAmount);
      setTotalExpenses(totalExpensesAmount);

      // Update detailed statistics
      const now = new Date();
      setDataStatistics(prev => ({
        totalRecords: combinedFareData.length + combinedExpenseData.length,
        incomeRecords: combinedFareData.filter(entry => entry.type !== 'off').length,
        expenseRecords: combinedExpenseData.length,
        lastFetchTime: now.toLocaleTimeString('en-IN'),
        lastFetchDate: now.toLocaleDateString('en-IN'),
        refreshCount: prev.refreshCount + 1,
        dataBreakdown: {
          fareReceipts: processedFareReceipts.length || 0,
          bookingEntries: processedBookingEntries.length || 0,
          offDays: processedOffDays.length || 0,
          fuelPayments: processedFuelPayments.length || 0,
          addaPayments: processedAddaPayments.length || 0,
          unionPayments: processedUnionPayments.length || 0,
          servicePayments: processedServicePayments.length || 0,
          otherPayments: processedOtherPayments.length || 0
        }
      }));

      // Trigger refresh event for other components
      window.dispatchEvent(new CustomEvent('dataRefreshed', {
        detail: {
          timestamp: new Date(),
          source: 'centralized-refresh'
        }
      }));

      console.log('✅ App.jsx: Data refresh completed');
      console.log(`📊 Loaded ${combinedFareData.length} fare entries and ${combinedExpenseData.length} expense entries`);

    } catch (error) {
      console.error('❌ App.jsx: Error in data refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to update entry status in parent state
  const updateEntryStatusInParent = (entryId, newStatus, entryType) => {
    console.log(`🔄 App.jsx: Updating entry ${entryId} status to ${newStatus}`);

    if (entryType === 'daily' || entryType === 'booking') {
      // Update fareData
      setFareData(prevData => 
        prevData.map(entry => 
          entry.entryId === entryId 
            ? { ...entry, entryStatus: newStatus }
            : entry
        )
      );
    } else {
      // Update expenseData for fuel, adda, union, service, other
      setExpenseData(prevData => 
        prevData.map(entry => 
          entry.entryId === entryId 
            ? { ...entry, entryStatus: newStatus }
            : entry
        )
      );
    }

    console.log(`✅ App.jsx: Entry ${entryId} status updated to ${newStatus}`);
  };

  // Expose status update function globally
  useEffect(() => {
    window.updateEntryStatusInParent = updateEntryStatusInParent;

    return () => {
      delete window.updateEntryStatusInParent;
    };
  }, []);

  // Global function to update entry status (accessible from DataSummary)
  useEffect(() => {
    window.updateEntryStatusInParent = (entryId, newStatus, entryType) => {
      console.log(`🔄 Global update: Entry ${entryId} → ${newStatus} (Type: ${entryType})`);

      // Update fareData
      setFareData(prevData => 
        prevData.map(entry => 
          entry.entryId === entryId 
            ? { ...entry, entryStatus: newStatus }
            : entry
        )
      );

      // Update expenseData
      setExpenseData(prevData => 
        prevData.map(entry => 
          entry.entryId === entryId 
            ? { ...entry, entryStatus: newStatus }
            : entry
        )
      );
    };

    // Add specific state updaters
    window.updateExpenseDataState = (entryId, newStatus, approverName) => {
      setExpenseData(prevData => 
        prevData.map(entry => 
          entry.entryId === entryId 
            ? { ...entry, entryStatus: newStatus, approvedBy: approverName }
            : entry
        )
      );
    };

    window.updateFareDataState = (entryId, newStatus, approverName) => {
      setFareData(prevData => 
        prevData.map(entry => 
          entry.entryId === entryId 
            ? { ...entry, entryStatus: newStatus, approvedBy: approverName }
            : entry
        )
      );
    };

      // Fetch all users data centrally on app initialization
    fetchAllUsersData();

    // Expose function globally for manual testing
    window.refreshUsersData = fetchAllUsersData;
    window.getAllUsersData = () => allUsers;

    // Cleanup function
    return () => {
      delete window.updateEntryStatusInParent;
      delete window.updateExpenseDataState;
      delete window.updateFareDataState;
        delete  window.refreshUsersData;
        delete window.getAllUsersData;
    };
  }, []);

  // Update data stats when data changes
  useEffect(() => {
    setDataStats({
      totalRecords: fareData.length + expenseData.length,
      fareRecords: fareData.length,
      expenseRecords: expenseData.length,
      lastSync: lastRefreshTime
    });
  }, [fareData, expenseData, lastRefreshTime]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        // Don't automatically set sidebar state on desktop
        // Let user control it with toggle button
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    if (window.innerWidth >= 992) {
      setSidebarOpen(true); // Default open on desktop
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate cash book entries whenever fareData or expenseData changes
  useEffect(() => {
    const generateCashBookEntries = () => {
      let entries = [];

      // Add fare receipt entries (Dr - income)
      fareData.forEach(fareEntry => {
        if (fareEntry.type !== 'off') { // Exclude off days
          entries.push({
            id: `fare-${fareEntry.entryId}`,
            date: fareEntry.date || fareEntry.dateFrom,
            description: fareEntry.type === 'daily' ? 
              `Daily Collection - ${fareEntry.route}` : 
              `Booking - ${fareEntry.bookingDetails || 'Booking Entry'}`,
            cashAmount: fareEntry.cashAmount || 0,
            bankAmount: fareEntry.bankAmount || 0,
            type: 'dr', // Debit (income)
            source: fareEntry.type === 'daily' ? 'fare-daily' : 'fare-booking',
            particulars: fareEntry.type === 'daily' ? fareEntry.route : fareEntry.bookingDetails,
            jfNo: `JF-${fareEntry.entryId}`,
            submittedBy: fareEntry.submittedBy
          });
        }
      });

      // Add expense entries (Cr - payments)
      expenseData.forEach(expenseEntry => {
        // Handle different expense types properly
        let description = '';
        let particulars = '';

        switch(expenseEntry.type) {
          case 'fuel':
            description = `Fuel Payment - ${expenseEntry.pumpName || 'Fuel Station'}`;
            particulars = expenseEntry.pumpName || 'Fuel Station';
            break;
          case 'fees':
          case 'adda':
            description = `Adda Payment - ${expenseEntry.description || 'Adda Fees'}`;
            particulars = expenseEntry.description || 'Adda Fees';
            break;
          case 'service':
            description = `Service Payment - ${expenseEntry.serviceType || expenseEntry.description || 'Service'}`;
            particulars = expenseEntry.serviceType || expenseEntry.description || 'Service';
            break;
          case 'union':
            description = `Union Payment - ${expenseEntry.description || 'Union Fees'}`;
            particulars = expenseEntry.description || 'Union Fees';
            break;
          case 'other':
            description = `Other Payment - ${expenseEntry.paymentDetails || expenseEntry.description || 'Other'}`;
            particulars = expenseEntry.paymentDetails || expenseEntry.description || 'Other';
            break;
          default:
            description = `${expenseEntry.type} - ${expenseEntry.description || 'Payment'}`;
            particulars = expenseEntry.description || 'Payment';
        }

        entries.push({
          id: `expense-${expenseEntry.entryId}`,
          date: expenseEntry.date,
          description: description,
          cashAmount: expenseEntry.cashAmount || 0,
          bankAmount: expenseEntry.bankAmount || 0,
          type: 'cr', // Credit (payment)
          source: `${expenseEntry.type}-payment`,
          particulars: particulars,
          jfNo: `PV-${expenseEntry.entryId}`,
          submittedBy: expenseEntry.submittedBy
        });
      });

      // Add Fixed Cash entries for all users (Cr - payments)
      if (allUsers && allUsers.length > 0) {
        allUsers.forEach(user => {
          if (user.fixedCash > 0) {
            entries.push({
              id: `fixed-cash-${user.username}`,
              date: user.date,
              description: `Fixed Cash - ${user.name}`,
              cashAmount: user.fixedCash,
              bankAmount: 0,
              type: 'cr', // Credit (payment)
              source: 'fixed-cash-payment',
              particulars: user.name,
              jfNo: `FC-${user.username}`,
              submittedBy: user.name
            });
          }
        });
      }

      // Sort by date (newest first)
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log('📖 Generated cash book entries:', entries.length);
      setCashBookEntries(entries);
    };

    generateCashBookEntries();
  }, [fareData, expenseData, allUsers, setCashBookEntries]);

  // If user is not logged in, show login component
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Calculate profit/loss
  const profit = totalEarnings - totalExpenses;
  const profitPercentage = ((profit / totalExpenses) * 100).toFixed(1);

  // Handle menu item click
  const handleMenuClick = (tab) => {
    setActiveTab(tab);
    // Only close sidebar on mobile view
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="app">
      {/* Navbar Component */}
      <Navbar 
          user={user} 
          onLogout={handleLogout}
          isRefreshing={isRefreshing}
          setIsRefreshing={setIsRefreshing}
          lastRefreshTime={lastRefreshTime}
          setLastRefreshTime={setLastRefreshTime}
          onDataRefresh={handleDataRefresh}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

      {/* Sidebar Overlay - Only for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen && window.innerWidth < 992 ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "show" : ""}`}>
        <div className="sidebar-menu">
          <div className="menu-section">
            <h6>MAIN</h6>
            <button
              className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => handleMenuClick("dashboard")}
            >
              <i className="bi bi-speedometer2"></i>
              Dashboard
            </button>
          </div>

          <div className="menu-section">
            <h6>DATA ENTRY</h6>
            <button
              className={`menu-item ${activeTab === "fare-entry" ? "active" : ""}`}
              onClick={() => handleMenuClick("fare-entry")}
            >
              <i className="bi bi-receipt"></i>
              Fare Receipt
            </button>
            <button
              className={`menu-item ${activeTab === "basic-payment" ? "active" : ""}`}
              onClick={() => handleMenuClick("basic-payment")}
            >
              <i className="bi bi-credit-card"></i>
              Basic Payment
            </button>
            <button
              className={`menu-item ${activeTab === "misc-payment" ? "active" : ""}`}
              onClick={() => handleMenuClick("misc-payment")}
            >
              <i className="bi bi-credit-card"></i>
              Misc Payment
            </button>
          </div>

          {(user.userType === "Manager" || user.userType === "Admin") && (
            <div className="menu-section">
              <h6>AUTOMATION</h6>
              <button
                className={`menu-item ${activeTab === "cash-book" ? "active" : ""}`}
                onClick={() => handleMenuClick("cash-book")}
              >
                <i className="bi bi-book"></i>
                Cash Book (Double Column)
              </button>
              <button
                className={`menu-item ${activeTab === "bonus-calc" ? "active" : ""}`}
                onClick={() => handleMenuClick("bonus-calc")}
              >
                <i className="bi bi-calculator"></i>
                Bonus Calculator
              </button>
            </div>
          )}

          {(user.userType === "Manager" || user.userType === "Admin") && (
            <div className="menu-section">
              <h6>MANAGEMENT</h6>
              <button
                className={`menu-item ${activeTab === "data-summary" ? "active" : ""}`}
                onClick={() => handleMenuClick("data-summary")}
              >
                <i className="bi bi-clipboard-check"></i>
                Data
              </button>
              <button
                className={`menu-item ${activeTab === "cash-summary" ? "active" : ""}`}
                onClick={() => handleMenuClick("cash-summary")}
              >
                <i className="bi bi-cash-stack"></i>
                Cash
              </button>
              <button
                className={`menu-item ${activeTab === "bank-summary" ? "active" : ""}`}
                onClick={() => handleMenuClick("bank-summary")}
              >
                <i className="bi bi-bank"></i>
                Bank
              </button>
            </div>
          )}

          <div className="menu-section">
            <h6>REPORTS</h6>
            <button
              className={`menu-item ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => handleMenuClick("analytics")}
            >
              <i className="bi bi-graph-up"></i>
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "dashboard" && (
          <Dashboard 
            expenseData={expenseData} 
            fareData={fareData} 
            totalExpenses={totalExpenses} 
            totalEarnings={totalEarnings}
            dataStatistics={dataStatistics}
            currentUser={user}
              allUsers={allUsers}
          />
        )}
        {activeTab === "fare-entry" && (
          <FareEntry 
            fareData={fareData} 
            setFareData={setFareData} 
            setTotalEarnings={setTotalEarnings}
            setCashBookEntries={setCashBookEntries}
            currentUser={user}
          />
        )}
        {activeTab === "basic-payment" && (
          <BasicPayment 
            expenseData={expenseData} 
            setExpenseData={setExpenseData} 
            setTotalExpenses={setTotalExpenses}
            setCashBookEntries={setCashBookEntries}
            currentUser={user}
          />
        )}
        {activeTab === "misc-payment" && (
          <MiscPayment 
            expenseData={expenseData} 
            setExpenseData={setExpenseData} 
            setTotalExpenses={setTotalExpenses}
            setCashBookEntries={setCashBookEntries}
            currentUser={user}
          />
        )}
        {activeTab === "bonus-calc" && <BonusCalculator currentUser={user} />}
        {activeTab === "analytics" && (
          <Analytics 
            expenseData={expenseData} 
            fareData={fareData}
            currentUser={user}
          />
        )}
        {activeTab === "cash-book" && (
          <CashBook 
            cashBookEntries={cashBookEntries} 
            setCashBookEntries={setCashBookEntries}
             allUsers={allUsers}
            currentUser={user}
          />
        )}
        {activeTab === "data-summary" && (
          <DataSummary 
            fareData={fareData} 
            expenseData={expenseData} 
            currentUser={user}
            cashDeposit={cashDeposit}
            setCashDeposit={setCashDeposit}
          />
        )}
        {activeTab === "cash-summary" && (
          <CashSummary 
            fareData={fareData} 
            expenseData={expenseData}
            currentUser={user}
              allUsers={allUsers}
          />
        )}
        {activeTab === "bank-summary" && (
          <BankSummary 
            fareData={fareData} 
            expenseData={expenseData}
            currentUser={user}
            cashDeposit={cashDeposit}
            setCashDeposit={setCashDeposit}
          />
        )}
      </div>
    </div>
  );
}

export default App;