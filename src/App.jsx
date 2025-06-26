import React, { useState, useEffect } from "react";
import "./App.css";

// Import all components
import Dashboard from "./components/jsx/Dashboard";
import FareEntry from "./components/jsx/FareRecipt";
import FuelEntry from "./components/jsx/FuelPayment";
import AddaFeesEntry from "./components/jsx/FeesPayment";
import ServiceEntry from "./components/jsx/ServicePayment";
import OtherPayment from "./components/jsx/OtherPayment";
import BonusCalculator from "./components/jsx/BonusCalculator";
import Analytics from "./components/jsx/Analytics";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [fareData, setFareData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(30200);
  const [totalExpenses, setTotalExpenses] = useState(15600);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                Admin
              </span>
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
              className={`menu-item ${activeTab === "fuel-entry" ? "active" : ""}`}
              onClick={() => handleMenuClick("fuel-entry")}
            >
              <i className="bi bi-credit-card"></i>
              Fuel Payment
            </button>
            <button
              className={`menu-item ${activeTab === "adda-fees" ? "active" : ""}`}
              onClick={() => handleMenuClick("adda-fees")}
            >
              <i className="bi bi-credit-card"></i>
              Adda Payment
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

          <div className="menu-section">
            <h6>AUTOMATION</h6>
            <button
              className={`menu-item ${activeTab === "bonus-calc" ? "active" : ""}`}
              onClick={() => handleMenuClick("bonus-calc")}
            >
              <i className="bi bi-calculator"></i>
              Bonus Calculator
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
            />
          )}
          {activeTab === "fare-entry" && (
            <FareEntry
              fareData={fareData}
              setFareData={setFareData}
              setTotalEarnings={setTotalEarnings}
            />
          )}
          {activeTab === "fuel-entry" && (
            <FuelEntry
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
            />
          )}
          {activeTab === "adda-fees" && (
            <AddaFeesEntry
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
            />
          )}
          {activeTab === "service-entry" && (
            <ServiceEntry
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
            />
          )}
          {activeTab === "other-payment" && (
            <OtherPayment
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
            />
          )}
          {activeTab === "bonus-calc" && <BonusCalculator />}
          {activeTab === "analytics" && <Analytics />}
        </div>
      </div>
    </div>
  );
}

export default App;