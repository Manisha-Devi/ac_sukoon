
import React, { useState, useEffect } from "react";
import "./App.css";

// Import all components
import Login from "./components/jsx/Login";
import Dashboard from "./components/jsx/Dashboard";
import FareEntry from "./components/jsx/FareRecipt";
import FuelEntry from "./components/jsx/FuelPayment";
import AddaFeesEntry from "./components/jsx/FeesPayment";
import ServiceEntry from "./components/jsx/ServicePayment";
import OtherPayment from "./components/jsx/OtherPayment";
import BonusCalculator from "./components/jsx/BonusCalculator";
import Analytics from "./components/jsx/Analytics";
import CashBook from "./components/jsx/CashBook";
import Approval from "./components/jsx/Approval";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Global data states
  const [fareData, setFareData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [cashBookEntries, setCashBookEntries] = useState([]);

  // Load data from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    const savedFareData = localStorage.getItem('fareData');
    if (savedFareData) {
      setFareData(JSON.parse(savedFareData));
    }

    const savedExpenseData = localStorage.getItem('expenseData');
    if (savedExpenseData) {
      setExpenseData(JSON.parse(savedExpenseData));
    }

    const savedCashBookEntries = localStorage.getItem('cashBookEntries');
    if (savedCashBookEntries) {
      setCashBookEntries(JSON.parse(savedCashBookEntries));
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('fareData', JSON.stringify(fareData));
  }, [fareData]);

  useEffect(() => {
    localStorage.setItem('expenseData', JSON.stringify(expenseData));
  }, [expenseData]);

  useEffect(() => {
    localStorage.setItem('cashBookEntries', JSON.stringify(cashBookEntries));
  }, [cashBookEntries]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab("dashboard");
    localStorage.removeItem('currentUser');
  };

  const handleMenuClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Handle adding fare receipt data
  const handleAddFareData = (data) => {
    const newEntry = {
      ...data,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    setFareData(prev => [...prev, newEntry]);
    
    // Add to cash book
    const cashBookEntry = {
      id: Date.now() + Math.random(),
      type: 'dr',
      date: data.date,
      particulars: `${data.passengerName || 'Passenger'} - ${data.fromLocation} to ${data.toLocation}`,
      jfNo: `FR${newEntry.id}`,
      cashAmount: parseFloat(data.cashAmount) || 0,
      bankAmount: parseFloat(data.bankAmount) || 0,
      source: 'fare-receipt',
      timestamp: new Date().toISOString()
    };
    
    setCashBookEntries(prev => [...prev, cashBookEntry]);
  };

  // Handle adding expense data
  const handleAddExpenseData = (data) => {
    const newEntry = {
      ...data,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    setExpenseData(prev => [...prev, newEntry]);
    
    // Add to cash book
    const cashBookEntry = {
      id: Date.now() + Math.random(),
      type: 'cr',
      date: data.date,
      particulars: data.description || data.serviceType || data.paymentDetails || 'Payment',
      jfNo: `${data.type?.toUpperCase() || 'EXP'}${newEntry.id}`,
      cashAmount: parseFloat(data.cashAmount) || 0,
      bankAmount: parseFloat(data.bankAmount) || 0,
      source: `${data.type}-payment`,
      timestamp: new Date().toISOString()
    };
    
    setCashBookEntries(prev => [...prev, cashBookEntry]);
  };

  // Handle direct cash book entries
  const handleAddCashBookEntry = (entry) => {
    setCashBookEntries(prev => [...prev, entry]);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>
            <i className="bi bi-truck-front"></i>
            AC Sukoon Transport
          </h3>
          <div className="user-info">
            <div className="user-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-details">
              <span className="user-name">{user.username}</span>
              <span className="user-role">{user.userType}</span>
            </div>
          </div>
        </div>

        <div className="menu">
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
              className={`menu-item ${activeTab === "fuel-entry" ? "active" : ""}`}
              onClick={() => handleMenuClick("fuel-entry")}
            >
              <i className="bi bi-fuel-pump"></i>
              Fuel Payment
            </button>
            <button
              className={`menu-item ${activeTab === "adda-fees" ? "active" : ""}`}
              onClick={() => handleMenuClick("adda-fees")}
            >
              <i className="bi bi-building"></i>
              Adda Payment
            </button>
            <button
              className={`menu-item ${activeTab === "service-payment" ? "active" : ""}`}
              onClick={() => handleMenuClick("service-payment")}
            >
              <i className="bi bi-tools"></i>
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
            <h6>ANALYTICS</h6>
            <button
              className={`menu-item ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => handleMenuClick("analytics")}
            >
              <i className="bi bi-graph-up"></i>
              Analytics
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        {activeTab === "dashboard" && (
          <Dashboard 
            fareData={fareData}
            expenseData={expenseData}
            cashBookEntries={cashBookEntries}
          />
        )}
        {activeTab === "fare-entry" && (
          <FareEntry 
            onAddFare={handleAddFareData}
            existingData={fareData}
          />
        )}
        {activeTab === "fuel-entry" && (
          <FuelEntry 
            onAddExpense={handleAddExpenseData}
            existingData={expenseData.filter(item => item.type === 'fuel')}
          />
        )}
        {activeTab === "adda-fees" && (
          <AddaFeesEntry 
            onAddExpense={handleAddExpenseData}
            existingData={expenseData.filter(item => item.type === 'fees')}
          />
        )}
        {activeTab === "service-payment" && (
          <ServiceEntry 
            onAddExpense={handleAddExpenseData}
            existingData={expenseData.filter(item => item.type === 'service')}
          />
        )}
        {activeTab === "other-payment" && (
          <OtherPayment 
            onAddExpense={handleAddExpenseData}
            existingData={expenseData.filter(item => item.type === 'other')}
          />
        )}
        {activeTab === "cash-book" && (
          <CashBook 
            entries={cashBookEntries}
            onAddEntry={handleAddCashBookEntry}
          />
        )}
        {activeTab === "bonus-calc" && <BonusCalculator />}
        {activeTab === "approval" && (
          <Approval 
            fareData={fareData}
            expenseData={expenseData}
            cashBookEntries={cashBookEntries}
          />
        )}
        {activeTab === "analytics" && (
          <Analytics 
            fareData={fareData}
            expenseData={expenseData}
            cashBookEntries={cashBookEntries}
          />
        )}
      </div>
    </div>
  );
}

export default App;
