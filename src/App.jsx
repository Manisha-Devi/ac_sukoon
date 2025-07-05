import React, { useState, useEffect } from "react";
import "./App.css";

// Import all components
import Login from "./components/jsx/Login";
import Dashboard from "./components/jsx/Dashboard";
import FareEntry from "./components/jsx/FareRecipt";
import BasicPayment from "./components/jsx/BasicPayment.jsx";
import ServiceEntry from "./components/jsx/ServicePayment.jsx";
import OtherPayment from "./components/jsx/OtherPayment.jsx";
import BonusCalculator from "./components/jsx/BonusCalculator";
import Analytics from "./components/jsx/Analytics";
import CashBook from "./components/jsx/CashBook";
import DataSummary from "./components/jsx/DataSummary";
import localStorageService from "./services/localStorageService.js";


function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expenseData, setExpenseData] = useState([]);
  const [fareData, setFareData] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [cashBookEntries, setCashBookEntries] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("dashboard");
  };

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

      // Sort by date (newest first)
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log('📖 Generated cash book entries:', entries.length);
      setCashBookEntries(entries);
    };

    generateCashBookEntries();
  }, [fareData, expenseData, setCashBookEntries]);

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
      {/* Bootstrap Navbar */}
      <nav className="navbar navbar-expand-lg custom-navbar">
        <div className="container-fluid">
          {/* Mobile Menu Button - Left Side */}
          <button 
            className="btn btn-link text-white p-2 d-lg-none" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            aria-label="Toggle sidebar"
            type="button"
          >
            <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
          </button>

          {/* Brand - Center on Mobile, Left on Desktop */}
          <a className="navbar-brand mx-auto mx-lg-0" href="#">
            <i className="bi bi-speedometer2 me-2"></i>
            <span className="d-none d-md-inline">AC SUKOON Dashboard System</span>
            <span className="d-md-none">AC SUKOON</span>
          </a>

          {/* Search Bar - Hidden on Small Screens */}
          <div className="navbar-search d-none d-md-block">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
            />
          </div>

          {/* Right Side Controls */}
          <div className="d-flex align-items-center">
            {/* Desktop Toggle and User Info */}
            <div className="d-none d-lg-flex align-items-center">
              <button 
                className="btn btn-link text-white p-2 me-3" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSidebarOpen(!sidebarOpen);
                }}
                title="Toggle Sidebar"
                type="button"
              >
                <i className="bi bi-layout-sidebar-inset fs-5"></i>
              </button>
              <span className="text-white">
                <i className="bi bi-person-circle me-2"></i>
                 {user.username} ({user.userType})
              </span>
              <button
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
            </div>

            {/* Mobile User Icon */}
            <div className="d-lg-none">
              <span className="text-white">
                <i className="bi bi-person-circle fs-5"></i>
              </span>
            </div>
          </div>
        </div>
      </nav>

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
              className={`menu-item ${activeTab === "service-entry" ? "active" : ""}`}
              onClick={() => handleMenuClick("service-entry")}
            >
              <i className="bi bi-credit-card"></i>
              Service Payment
            </button>
            <button
              className={`menu-item ${activeTab === "other-payment" ? "active" : ""}`}
              onClick={() => handleMenuClick("other-payment")}
            >
              <i className="bi bi-credit-card"></i>
              Other Payment
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

          <div className="menu-section">
            <h6>APPROVAL</h6>
            <button
              className={`menu-item ${activeTab === "approval" ? "active" : ""}`}
              onClick={() => handleMenuClick("approval")}
            >
              <i className="bi bi-check-circle"></i>
              Data Summary
            </button>
          </div>

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
        <div className="container-fluid">
          {activeTab === "dashboard" && (
            <Dashboard
              totalEarnings={totalEarnings}
              totalExpenses={totalExpenses}
              profit={profit}
              profitPercentage={profitPercentage}
              setFareData={setFareData}
              setExpenseData={setExpenseData}
              setCashBookEntries={setCashBookEntries}
            />
          )}
          {activeTab === "fare-entry" && (
            <FareEntry
              fareData={fareData}
              setFareData={setFareData}
              setTotalEarnings={setTotalEarnings}
              setCashBookEntries={setCashBookEntries}
            />
          )}
          {activeTab === "basic-payment" && (
            <BasicPayment
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
              setCashBookEntries={setCashBookEntries}
            />
          )}
          {activeTab === "service-entry" && (
            <ServiceEntry
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
              setCashBookEntries={setCashBookEntries}
            />
          )}
          {activeTab === "other-payment" && (
            <OtherPayment
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
              setCashBookEntries={setCashBookEntries}
            />
          )}
          {activeTab === "bonus-calc" && <BonusCalculator />}
          {activeTab === "analytics" && (
            <Analytics 
              fareData={fareData} 
              expenseData={expenseData} 
              totalEarnings={totalEarnings} 
              totalExpenses={totalExpenses} 
            />
          )}
          {activeTab === "cash-book" && (
            <CashBook
              cashBookEntries={cashBookEntries}
              setCashBookEntries={setCashBookEntries}
            />
          )}
          {activeTab === "approval" && (
            <DataSummary
              fareData={fareData}
              expenseData={expenseData}
              cashBookEntries={cashBookEntries}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;