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
  const [error, setError] = useState(null);


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
  const handleLogin = async (userData) => {
    setUser(userData);
    console.log('👤 User logged in via React state:', userData);

    // Automatically trigger complete data refresh after login
    console.log('🔄 Auto-triggering complete data refresh after login...');

    try {
      // First refresh users data
      await fetchAllUsersData();

      // Then trigger the complete data refresh cycle (same as navbar refresh)
      await handleDataRefresh();

      console.log('✅ Auto data refresh completed after login');
    } catch (error) {
      console.error('❌ Auto data refresh failed after login:', error);
    }
  };

  // Handle user logout - Only clear React state
  const handleLogout = () => {
    setUser(null);
    setActiveTab("dashboard");
  };

  // Data refresh function for Navbar component
  const handleDataRefresh = async () => {
    console.log('🔄 App.jsx: Starting data refresh from Navbar...');

    try {
      // Direct data loading in App.jsx instead of Dashboard
      const authService = (await import('./services/authService.js')).default;

      console.log('🚀 App.jsx: Loading all data from Google Sheets...');

      const [
        fareReceipts, 
        bookingEntries, 
        offDays, 
        fuelPayments, 
        addaPayments,
        unionPayments,
        servicePayments,
        otherPayments,
        allUsersData,
        cashDepositsData,
      ] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays(),
        authService.getFuelPayments(),
        authService.getAddaPayments(),
        authService.getUnionPayments(),
        authService.getServicePayments(),
        authService.getOtherPayments(),
        authService.getAllUsers(),
        authService.getCashDeposits(),
      ]);

      // Process fare data (fare receipts + booking entries)
      let combinedFareData = [];

      // Add fare receipts
      if (fareReceipts?.data && Array.isArray(fareReceipts.data)) {
        combinedFareData.push(...fareReceipts.data.map(receipt => ({
          ...receipt,
          type: 'daily'
        })));
      }

      // Add booking entries (fix date field mapping)
      if (bookingEntries?.data && Array.isArray(bookingEntries.data)) {
        combinedFareData.push(...bookingEntries.data.map(booking => ({
          ...booking,
          type: 'booking',
          date: booking.dateFrom || booking.date // Use dateFrom as primary date for booking entries
        })));
      }

      // Add off days
      if (offDays?.data && Array.isArray(offDays.data)) {
        combinedFareData.push(...offDays.data.map(offDay => ({
          ...offDay,
          type: 'off'
        })));
      }

      // Process expense data
      let combinedExpenseData = [];

      if (fuelPayments?.data && Array.isArray(fuelPayments.data)) {
        combinedExpenseData.push(...fuelPayments.data.map(payment => ({
          ...payment,
          type: 'fuel'
        })));
      }

      if (addaPayments?.data && Array.isArray(addaPayments.data)) {
        combinedExpenseData.push(...addaPayments.data.map(payment => ({
          ...payment,
          type: 'adda'
        })));
      }

      if (unionPayments?.data && Array.isArray(unionPayments.data)) {
        combinedExpenseData.push(...unionPayments.data.map(payment => ({
          ...payment,
          type: 'union'
        })));
      }

      if (servicePayments?.data && Array.isArray(servicePayments.data)) {
        combinedExpenseData.push(...servicePayments.data.map(payment => ({
          ...payment,
          type: 'service'
        })));
      }

      if (otherPayments?.data && Array.isArray(otherPayments.data)) {
        combinedExpenseData.push(...otherPayments.data.map(payment => ({
          ...payment,
          type: 'other'
        })));
      }



      // Update parent state
      setFareData(combinedFareData);
      setExpenseData(combinedExpenseData);

      // Update allUsers state with fetched data
      if (allUsersData?.success && allUsersData?.data) {
        console.log('👥 Setting allUsers data:', allUsersData.data.length, 'users');
        setAllUsers(allUsersData.data);
      } else {
        console.warn('⚠️ Failed to load all users data:', allUsersData?.error);
        // Keep current user in allUsers if fetch fails
        if (user) {
          const currentUserForAllUsers = {
            username: user.username,
            name: user.fullName,
            date: new Date().toISOString().split('T')[0],
            fixedCash: user.fixedCash || 0
          };
          setAllUsers([currentUserForAllUsers]);
        }
      }

      // Update cashDeposit state with fetched data
      if (cashDepositsData?.success && cashDepositsData?.data) {
        console.log('💰 Setting cashDeposit data:', cashDepositsData.data.length, 'deposits');
        console.log('💰 Cash deposits fetched from Google Sheets:', cashDepositsData.data);
        console.log('💰 Individual deposits:', cashDepositsData.data.map(d => ({
          id: d.id || d.entryId,
          date: d.date,
          amount: d.cashAmount,
          depositedBy: d.depositedBy
        })));
        setCashDeposit(cashDepositsData.data);
      } else {
        console.warn('⚠️ Failed to load cash deposits data:', cashDepositsData?.error);
        console.warn('⚠️ Full cash deposits response:', cashDepositsData);
        // Keep existing data instead of clearing it
        console.log('💰 Keeping existing cash deposits data, current count:', cashDeposit.length);
      }

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
          fareReceipts: fareReceipts?.data?.length || 0,
          bookingEntries: bookingEntries?.data?.length || 0,
          offDays: offDays?.data?.length || 0,
          fuelPayments: fuelPayments?.data?.length || 0,
          addaPayments: addaPayments?.data?.length || 0,
          unionPayments: unionPayments?.data?.length || 0,
          servicePayments: servicePayments?.data?.length || 0,
          otherPayments: otherPayments?.data?.length || 0
        }
      }));

      // Trigger refresh event for other components
      window.dispatchEvent(new CustomEvent('dataRefreshed', {
        detail: {
          timestamp: new Date(),
          source: 'centralized-refresh'
        }
      }));

      console.log('✅ App.jsx: Data refresh completed from Navbar');
      console.log(`📊 Loaded ${combinedFareData.length} fare entries and ${combinedExpenseData.length} expense entries`);

    } catch (error) {
      console.error('❌ App.jsx: Error in data refresh:', error);
      throw error; // Re-throw to be handled by Navbar
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
    //fetchAllUsersData();
    initializeApp();

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

  useEffect(() => {
    initializeApp();
    fetchAllUsersData();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing AC Sukoon Transport App...');

      // Test API key first
      console.log('🔐 Testing API key authentication...');
      const isAPIKeyValid = await authService.testAPIKey();

      if (!isAPIKeyValid) {
        console.error('❌ API key authentication failed');
        setError('Authentication system error. Please contact administrator.');
        return;
      }

      console.log('✅ API key authentication successful');

      // Fetch all users data after successful API key validation
      //await fetchAllUsersData();

    } catch (error) {
      console.error('❌ App initialization error:', error);
      setError('Failed to initialize application. Please refresh the page.');
    }
  };

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

      // Add Cash Deposits (Cr - payments)
      if (cashDeposit && cashDeposit.length > 0) {
        cashDeposit.forEach(deposit => {
          entries.push({
            id: `cash-deposit-${deposit.entryId}`,
            date: deposit.date,
            description: `Cash Deposit - ${deposit.description}`,
            cashAmount: deposit.cashAmount || 0,
            bankAmount: 0,
            type: 'cr', // Credit (cash going to bank)
            source: 'cash-deposit',
            particulars: deposit.description,
            jfNo: `CD-${deposit.entryId}`,
            submittedBy: deposit.depositedBy
          });
        });
      }

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

          {user.userType === "Admin" && (
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

          {(user.userType === "Manager" || user.userType === "Admin" || user.userType === "Conductor") && (
            <div className="menu-section">
              <h6>MANAGEMENT</h6>
              {(user.userType === "Manager" || user.userType === "Admin") && (
                <button
                  className={`menu-item ${activeTab === "data-summary" ? "active" : ""}`}
                  onClick={() => handleMenuClick("data-summary")}
                >
                  <i className="bi bi-clipboard-check"></i>
                  Data
                </button>
              )}
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
            fareData={fareData}
            expenseData={expenseData}
            totalEarnings={totalEarnings}
            totalExpenses={totalExpenses}
            cashBookEntries={cashBookEntries}
            allUsers={allUsers}
            cashDeposit={cashDeposit}
            dataStatistics={dataStatistics}
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
            allUsers={allUsers}
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
            allUsers={allUsers}
          />
        )}
      </div>
    </div>
  );
}

export default App;