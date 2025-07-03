
import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/jsx/Login";
import Dashboard from "./components/jsx/Dashboard";
import FareEntry from "./components/jsx/FareRecipt";
import FuelPayment from "./components/jsx/FuelPayment";
import FeesPayment from "./components/jsx/FeesPayment";
import ServicePayment from "./components/jsx/ServicePayment";
import UnionPayment from "./components/jsx/UnionPayment";
import OtherPayment from "./components/jsx/OtherPayment";
import CashBook from "./components/jsx/CashBook";
import DataSummary from "./components/jsx/DataSummary";
import Analytics from "./components/jsx/Analytics";
import BonusCalculator from "./components/jsx/BonusCalculator";
import hybridDataService from './services/hybridDataService.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentSection, setCurrentSection] = useState("dashboard");
  const [fareData, setFareData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [cashBookEntries, setCashBookEntries] = useState([]);

  // Initialize data on app load
  useEffect(() => {
    const initializeApp = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);

        // Initialize fare data using hybrid service
        const initialFareData = await hybridDataService.initializeData();
        setFareData(initialFareData);

        // Calculate total earnings
        const earnings = initialFareData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
        setTotalEarnings(earnings);

        // Load expense data
        const storedExpenseData = JSON.parse(localStorage.getItem('expenseData') || '[]');
        setExpenseData(storedExpenseData);

        // Calculate total expenses
        const expenses = storedExpenseData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
        setTotalExpenses(expenses);

        // Load cash book entries
        const storedCashBookEntries = JSON.parse(localStorage.getItem('cashBookEntries') || '[]');
        setCashBookEntries(storedCashBookEntries);
      }
    };

    initializeApp();
  }, []);

  // Global state update function for instant UI refresh
  useEffect(() => {
    window.updateAppState = (newFareData) => {
      console.log('🔄 Updating app state instantly with new data');
      setFareData([...newFareData]); // Force re-render with new array reference
      
      // Recalculate total earnings
      const earnings = newFareData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
      setTotalEarnings(earnings);

      // Update cash book entries from localStorage
      const updatedCashBook = JSON.parse(localStorage.getItem('cashBookEntries') || '[]');
      setCashBookEntries([...updatedCashBook]);
    };

    return () => {
      delete window.updateAppState;
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    setCurrentSection("dashboard");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "dashboard":
        return (
          <Dashboard
            fareData={fareData}
            expenseData={expenseData}
            totalEarnings={totalEarnings}
            totalExpenses={totalExpenses}
            cashBookEntries={cashBookEntries}
          />
        );
      case "fare-entry":
        return (
          <FareEntry
            fareData={fareData}
            setFareData={setFareData}
            setTotalEarnings={setTotalEarnings}
            setCashBookEntries={setCashBookEntries}
          />
        );
      case "fuel-payment":
        return (
          <FuelPayment
            expenseData={expenseData}
            setExpenseData={setExpenseData}
            setTotalExpenses={setTotalExpenses}
            setCashBookEntries={setCashBookEntries}
          />
        );
      case "fees-payment":
        return (
          <FeesPayment
            expenseData={expenseData}
            setExpenseData={setExpenseData}
            setTotalExpenses={setTotalExpenses}
            setCashBookEntries={setCashBookEntries}
          />
        );
      case "service-payment":
        return (
          <ServicePayment
            expenseData={expenseData}
            setExpenseData={setExpenseData}
            setTotalExpenses={setTotalExpenses}
            setCashBookEntries={setCashBookEntries}
          />
        );
      case "union-payment":
        return (
          <UnionPayment
            expenseData={expenseData}
            setExpenseData={setExpenseData}
            setTotalExpenses={setTotalExpenses}
            setCashBookEntries={setCashBookEntries}
          />
        );
      case "other-payment":
        return (
          <OtherPayment
            expenseData={expenseData}
            setExpenseData={setExpenseData}
            setTotalExpenses={setTotalExpenses}
            setCashBookEntries={setCashBookEntries}
          />
        );
      case "cash-book":
        return (
          <CashBook
            cashBookEntries={cashBookEntries}
            setCashBookEntries={setCashBookEntries}
          />
        );
      case "data-summary":
        return (
          <DataSummary
            fareData={fareData}
            expenseData={expenseData}
            cashBookEntries={cashBookEntries}
          />
        );
      case "analytics":
        return (
          <Analytics
            fareData={fareData}
            expenseData={expenseData}
            cashBookEntries={cashBookEntries}
          />
        );
      case "bonus-calculator":
        return (
          <BonusCalculator
            fareData={fareData}
            expenseData={expenseData}
          />
        );
      default:
        return (
          <Dashboard
            fareData={fareData}
            expenseData={expenseData}
            totalEarnings={totalEarnings}
            totalExpenses={totalExpenses}
            cashBookEntries={cashBookEntries}
          />
        );
    }
  };

  return (
    <div className="app">
      {/* Navigation Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3><i className="bi bi-car-front"></i> AC Sukoon</h3>
          <p>Transport Management</p>
        </div>

        <div className="nav-menu">
          <button
            className={`nav-item ${currentSection === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentSection("dashboard")}
          >
            <i className="bi bi-speedometer2"></i>
            Dashboard
          </button>

          <button
            className={`nav-item ${currentSection === "fare-entry" ? "active" : ""}`}
            onClick={() => setCurrentSection("fare-entry")}
          >
            <i className="bi bi-receipt"></i>
            Fare Receipt
          </button>

          <div className="nav-group">
            <div className="nav-group-title">
              <i className="bi bi-credit-card"></i>
              Payment Expenses
            </div>
            <button
              className={`nav-item sub-item ${currentSection === "fuel-payment" ? "active" : ""}`}
              onClick={() => setCurrentSection("fuel-payment")}
            >
              <i className="bi bi-fuel-pump"></i>
              Fuel Payment
            </button>
            <button
              className={`nav-item sub-item ${currentSection === "fees-payment" ? "active" : ""}`}
              onClick={() => setCurrentSection("fees-payment")}
            >
              <i className="bi bi-building"></i>
              Adda Fees
            </button>
            <button
              className={`nav-item sub-item ${currentSection === "service-payment" ? "active" : ""}`}
              onClick={() => setCurrentSection("service-payment")}
            >
              <i className="bi bi-tools"></i>
              Service Payment
            </button>
            <button
              className={`nav-item sub-item ${currentSection === "union-payment" ? "active" : ""}`}
              onClick={() => setCurrentSection("union-payment")}
            >
              <i className="bi bi-people"></i>
              Union Payment
            </button>
            <button
              className={`nav-item sub-item ${currentSection === "other-payment" ? "active" : ""}`}
              onClick={() => setCurrentSection("other-payment")}
            >
              <i className="bi bi-credit-card"></i>
              Other Payment
            </button>
          </div>

          <button
            className={`nav-item ${currentSection === "cash-book" ? "active" : ""}`}
            onClick={() => setCurrentSection("cash-book")}
          >
            <i className="bi bi-book"></i>
            Cash Book
          </button>

          <button
            className={`nav-item ${currentSection === "data-summary" ? "active" : ""}`}
            onClick={() => setCurrentSection("data-summary")}
          >
            <i className="bi bi-check-circle"></i>
            Data Summary
          </button>

          <button
            className={`nav-item ${currentSection === "analytics" ? "active" : ""}`}
            onClick={() => setCurrentSection("analytics")}
          >
            <i className="bi bi-graph-up"></i>
            Analytics
          </button>

          <button
            className={`nav-item ${currentSection === "bonus-calculator" ? "active" : ""}`}
            onClick={() => setCurrentSection("bonus-calculator")}
          >
            <i className="bi bi-calculator"></i>
            Bonus Calculator
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{user?.fullName || user?.username}</span>
              <span className="user-type">{user?.userType}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {renderCurrentSection()}
      </main>
    </div>
  );
}

export default App;
