import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
);

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
              <i className="bi bi-ticket-perforated"></i>
              Fare Collection
            </button>
            <button
              className={`menu-item ${activeTab === "fuel-entry" ? "active" : ""}`}
              onClick={() => handleMenuClick("fuel-entry")}
            >
              <i className="bi bi-fuel-pump"></i>
              Fuel Expense
            </button>
            <button
              className={`menu-item ${activeTab === "adda-fees" ? "active" : ""}`}
              onClick={() => handleMenuClick("adda-fees")}
            >
              <i className="bi bi-building"></i>
              Adda & Agent Fees
            </button>
            <button
              className={`menu-item ${activeTab === "service-entry" ? "active" : ""}`}
              onClick={() => handleMenuClick("service-entry")}
            >
              <i className="bi bi-tools"></i>
              Service Expense
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
          {activeTab === "adda-fees" && <AddaFeesEntry />}
          {activeTab === "service-entry" && <ServiceEntry />}
          {activeTab === "bonus-calc" && <BonusCalculator />}
          {activeTab === "analytics" && <Analytics />}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ totalEarnings, totalExpenses, profit, profitPercentage }) {
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Earnings (₹)",
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#667eea",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: ["Fare Collection", "Fuel Expense", "Service Cost", "Other"],
    datasets: [
      {
        data: [60, 25, 10, 5],
        backgroundColor: [
          "#667eea",
          "#ff6b6b", 
          "#26de81",
          "#feca57"
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter'
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
            family: 'Inter'
          }
        }
      }
    }
  };

  return (
    <div className="dashboard-container fade-in">
      {/* Header Section */}
      <div className="dashboard-header mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div>
            <h1 className="dashboard-title mb-2">
              <i className="bi bi-speedometer2 me-3"></i>
              Dashboard Overview
            </h1>
            <p className="dashboard-subtitle mb-0">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="mt-3 mt-md-0">
            <div className="dashboard-date">
              <i className="bi bi-calendar3 me-2"></i>
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="quick-stats-grid mb-5">
        <div className="quick-stat-card earnings">
          <div className="stat-content">
            <div className="stat-icon-wrapper">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div className="stat-details">
              <h3 className="stat-number">₹{totalEarnings.toLocaleString()}</h3>
              <p className="stat-title">Total Earnings</p>
              <div className="stat-trend positive">
                <i className="bi bi-trending-up"></i>
                <span>+10% from last month</span>
              </div>
            </div>
          </div>
          <div className="stat-chart-mini">
            <div className="mini-chart-line earnings-line"></div>
          </div>
        </div>

        <div className="quick-stat-card expenses">
          <div className="stat-content">
            <div className="stat-icon-wrapper">
              <i className="bi bi-graph-down-arrow"></i>
            </div>
            <div className="stat-details">
              <h3 className="stat-number">₹{totalExpenses.toLocaleString()}</h3>
              <p className="stat-title">Total Expenses</p>
              <div className="stat-trend negative">
                <i className="bi bi-trending-up"></i>
                <span>+5% from last month</span>
              </div>
            </div>
          </div>
          <div className="stat-chart-mini">
            <div className="mini-chart-line expenses-line"></div>
          </div>
        </div>

        <div className="quick-stat-card profit">
          <div className="stat-content">
            <div className="stat-icon-wrapper">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div className="stat-details">
              <h3 className="stat-number">₹{profit.toLocaleString()}</h3>
              <p className="stat-title">Net Profit</p>
              <div className="stat-trend positive">
                <i className="bi bi-trending-up"></i>
                <span>+{profitPercentage}% margin</span>
              </div>
            </div>
          </div>
          <div className="stat-chart-mini">
            <div className="mini-chart-line profit-line"></div>
          </div>
        </div>

        <div className="quick-stat-card routes">
          <div className="stat-content">
            <div className="stat-icon-wrapper">
              <i className="bi bi-bus-front"></i>
            </div>
            <div className="stat-details">
              <h3 className="stat-number">12</h3>
              <p className="stat-title">Active Routes</p>
              <div className="stat-trend neutral">
                <i className="bi bi-clock"></i>
                <span>Daily operations</span>
              </div>
            </div>
          </div>
          <div className="stat-chart-mini">
            <div className="mini-chart-line routes-line"></div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section mb-5">
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="analytics-card">
              <div className="card-header">
                <h5 className="card-title">
                  <i className="bi bi-graph-up me-2"></i>
                  Monthly Earnings Trend
                </h5>
                <div className="card-actions">
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-download"></i>
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <Line data={lineData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="analytics-card">
              <div className="card-header">
                <h5 className="card-title">
                  <i className="bi bi-pie-chart me-2"></i>
                  Expense Breakdown
                </h5>
              </div>
              <div className="chart-container">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity and Insights */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="activity-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-clock-history me-2"></i>
                Recent Activity
              </h5>
              <button className="btn btn-sm btn-link">View All</button>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon success">
                  <i className="bi bi-ticket-perforated"></i>
                </div>
                <div className="activity-content">
                  <h6 className="activity-title">Fare Collection Completed</h6>
                  <p className="activity-description">Ghuraka to Bhaderwah route - ₹2,500</p>
                  <small className="activity-time">2 hours ago</small>
                </div>
                <div className="activity-amount positive">+₹2,500</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon danger">
                  <i className="bi bi-fuel-pump"></i>
                </div>
                <div className="activity-content">
                  <h6 className="activity-title">Fuel Expense Added</h6>
                  <p className="activity-description">Fuel purchase at local pump</p>
                  <small className="activity-time">4 hours ago</small>
                </div>
                <div className="activity-amount negative">-₹3,200</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon info">
                  <i className="bi bi-tools"></i>
                </div>
                <div className="activity-content">
                  <h6 className="activity-title">Service Maintenance</h6>
                  <p className="activity-description">Regular engine checkup completed</p>
                  <small className="activity-time">1 day ago</small>
                </div>
                <div className="activity-amount negative">-₹1,800</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="insights-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-lightbulb me-2"></i>
                Business Insights
              </h5>
            </div>
            <div className="insight-list">
              <div className="insight-item">
                <div className="insight-icon">
                  <i className="bi bi-arrow-up-circle-fill text-success"></i>
                </div>
                <div className="insight-content">
                  <h6>Peak Performance Route</h6>
                  <p>Ghuraka to Bhaderwah is your most profitable route this month</p>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">
                  <i className="bi bi-fuel-pump-fill text-warning"></i>
                </div>
                <div className="insight-content">
                  <h6>Fuel Efficiency Alert</h6>
                  <p>Consider optimizing routes to reduce fuel consumption</p>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">
                  <i className="bi bi-calendar-check-fill text-info"></i>
                </div>
                <div className="insight-content">
                  <h6>Maintenance Due</h6>
                  <p>Schedule service for vehicles within next week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FareEntry({ fareData, setFareData, setTotalEarnings }) {
  const [activeCase, setActiveCase] = useState("daily");
  const [dailyFareData, setDailyFareData] = useState({
    route: "",
    totalFare: "",
    paymentMethod: "cash",
    date: "",
  });

  const [bookingData, setBookingData] = useState({
    bookingDetails: "",
    totalFare: "",
    paymentMethod: "cash",
    dateFrom: "",
    dateTo: "",
  });

  const [offDayData, setOffDayData] = useState({
    date: "",
    reason: "",
  });

  const routes = [
    "Ghuraka to Bhaderwah",
    "Bhaderwah to Pul Doda", 
    "Pul Doda to Thatri",
    "Thatri to Pul Doda",
    "Pul Doda to Bhaderwah",
    "Bhaderwah to Ghuraka",
  ];

  const handleDailySubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: "daily",
      ...dailyFareData,
      totalAmount: parseInt(dailyFareData.totalFare),
    };
    setFareData([...fareData, newEntry]);
    setTotalEarnings((prev) => prev + parseInt(dailyFareData.totalFare));
    setDailyFareData({ route: "", totalFare: "", paymentMethod: "cash", date: "" });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: "booking",
      ...bookingData,
      totalAmount: parseInt(bookingData.totalFare),
    };
    setFareData([...fareData, newEntry]);
    setTotalEarnings((prev) => prev + parseInt(bookingData.totalFare));
    setBookingData({ bookingDetails: "", totalFare: "", paymentMethod: "cash", dateFrom: "", dateTo: "" });
  };

  const handleOffDaySubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: "off",
      ...offDayData,
      totalAmount: 0,
    };
    setFareData([...fareData, newEntry]);
    setOffDayData({ date: "", reason: "" });
  };

  const renderCaseForm = () => {
    switch (activeCase) {
      case "daily":
        return (
          <div className="form-card">
            <h3>Case 1: Daily Fare Collection</h3>
            <p className="text-muted mb-3">Daily basis route fare collection with payment method</p>
            <form onSubmit={handleDailySubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Route</label>
                  <select
                    className="form-select"
                    value={dailyFareData.route}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, route: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map((route) => (
                      <option key={route} value={route}>
                        {route}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Total Fare Collected (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={dailyFareData.totalFare}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, totalFare: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={dailyFareData.paymentMethod}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, paymentMethod: e.target.value })
                    }
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dailyFareData.date}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Daily Fare Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        );

      case "booking":
        return (
          <div className="form-card">
            <h3>Case 2: Booking Fare Collection</h3>
            <p className="text-muted mb-3">Booking details with separate total fare and date range</p>
            <form onSubmit={handleBookingSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Booking Details</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={bookingData.bookingDetails}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, bookingDetails: e.target.value })
                    }
                    placeholder="Enter booking details, customer info, route details etc."
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Total Fare (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bookingData.totalFare}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, totalFare: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={bookingData.paymentMethod}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, paymentMethod: e.target.value })
                    }
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Date From</label>
                  <input
                    type="date"
                    className="form-control"
                    value={bookingData.dateFrom}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, dateFrom: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Date To</label>
                  <input
                    type="date"
                    className="form-control"
                    value={bookingData.dateTo}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, dateTo: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Booking Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        );

      case "off":
        return (
          <div className="form-card">
            <h3>Case 3: Off Day Entry</h3>
            <p className="text-muted mb-3">Mark a day as off when no work is done</p>
            <form onSubmit={handleOffDaySubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={offDayData.date}
                    onChange={(e) =>
                      setOffDayData({ ...offDayData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Reason for Off Day</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={offDayData.reason}
                    onChange={(e) =>
                      setOffDayData({ ...offDayData, reason: e.target.value })
                    }
                    placeholder="Enter reason for off day (e.g., maintenance, personal, weather, etc.)"
                    required
                  />
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-danger">
                    <i className="bi bi-x-circle me-2"></i>
                    Mark Day as Off
                  </button>
                </div>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-ticket-perforated me-2"></i>
        Fare Collection Management
      </h2>

      {/* Case Selection Tabs */}
      <div className="mb-4">
        <div className="btn-group w-100" role="group">
          <button
            type="button"
            className={`btn ${activeCase === "daily" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveCase("daily")}
          >
            <i className="bi bi-calendar-day me-2"></i>
            Daily Collection
          </button>
          <button
            type="button"
            className={`btn ${activeCase === "booking" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveCase("booking")}
          >
            <i className="bi bi-journal-bookmark me-2"></i>
            Booking
          </button>
          <button
            type="button"
            className={`btn ${activeCase === "off" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveCase("off")}
          >
            <i className="bi bi-x-circle me-2"></i>
            Off Day
          </button>
        </div>
      </div>

      {/* Render Selected Case Form */}
      {renderCaseForm()}

      {/* Recent Entries Table */}
      {fareData.length > 0 && (
        <div className="table-card mt-4">
          <h5>Recent Fare Entries</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fareData.slice(-10).reverse().map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className={`badge ${
                        entry.type === "daily" ? "bg-success" : 
                        entry.type === "booking" ? "bg-info" : "bg-danger"
                      }`}>
                        {entry.type === "daily" ? "Daily" : 
                         entry.type === "booking" ? "Booking" : "Off Day"}
                      </span>
                    </td>
                    <td>
                      {entry.type === "daily" && entry.route}
                      {entry.type === "booking" && entry.bookingDetails?.substring(0, 50) + "..."}
                      {entry.type === "off" && entry.reason?.substring(0, 50) + "..."}
                    </td>
                    <td>
                      {entry.type !== "off" ? `₹${entry.totalAmount}` : "-"}
                    </td>
                    <td>
                      {entry.type !== "off" && (
                        <span className={`badge ${entry.paymentMethod === "cash" ? "bg-warning" : "bg-primary"}`}>
                          {entry.paymentMethod?.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td>
                      {entry.type === "daily" && entry.date}
                      {entry.type === "booking" && `${entry.dateFrom} to ${entry.dateTo}`}
                      {entry.type === "off" && entry.date}
                    </td>
                    <td>
                      {entry.type === "off" ? 
                        <span className="badge bg-secondary">Closed</span> : 
                        <span className="badge bg-success">Active</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses }) {
  const [formData, setFormData] = useState({
    amount: "",
    liters: "",
    rate: "",
    date: "",
    pumpName: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: "fuel",
      ...formData,
    };
    setExpenseData([...expenseData, newEntry]);
    setTotalExpenses((prev) => prev + parseInt(formData.amount));
    setFormData({ amount: "", liters: "", rate: "", date: "", pumpName: "" });
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-fuel-pump me-2"></i>
        Fuel Expense Entry
      </h2>

      <div className="form-card">
        <h3>Add Fuel Expense</h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Liters</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.liters}
                onChange={(e) =>
                  setFormData({ ...formData, liters: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Rate per Liter (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Pump Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.pumpName}
                onChange={(e) =>
                  setFormData({ ...formData, pumpName: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Add Fuel Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddaFeesEntry() {
  const [formData, setFormData] = useState({
    type: "adda",
    amount: "",
    description: "",
    date: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Adda/Agent fees:", formData);
    setFormData({ type: "adda", amount: "", description: "", date: "" });
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-building me-2"></i>
        Adda & Agent Fees
      </h2>

      <div className="form-card">
        <h3>Add Fees Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              >
                <option value="adda">Adda Fees</option>
                <option value="agent">Agent Fees</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Add Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServiceEntry() {
  const [formData, setFormData] = useState({
    serviceType: "",
    amount: "",
    description: "",
    date: "",
    mechanic: "",
  });

  const serviceTypes = [
    "Engine Service",
    "Brake Service",
    "Tire Change",
    "Oil Change",
    "General Maintenance",
    "Repair Work",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Service entry:", formData);
    setFormData({
      serviceType: "",
      amount: "",
      description: "",
      date: "",
      mechanic: "",
    });
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-tools me-2"></i>
        Service Expense Entry
      </h2>

      <div className="form-card">
        <h3>Add Service Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Service Type</label>
              <select
                className="form-select"
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData({ ...formData, serviceType: e.target.value })
                }
                required
              >
                <option value="">Select Service Type</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Mechanic/Service Center</label>
              <input
                type="text"
                className="form-control"
                value={formData.mechanic}
                onChange={(e) =>
                  setFormData({ ...formData, mechanic: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Add Service Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function BonusCalculator() {
  const [period, setPeriod] = useState("weekly");
  const [driverName, setDriverName] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState("");
  const [calculatedBonus, setCalculatedBonus] = useState(0);

  const calculateBonus = () => {
    const base = parseFloat(baseSalary);
    const percentage = parseFloat(bonusPercentage);
    const bonus = (base * percentage) / 100;
    setCalculatedBonus(bonus);
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-calculator me-2"></i>
        Bonus Calculator
      </h2>

      <div className="form-card">
        <h3>Calculate Driver Bonus</h3>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Period</label>
            <select
              className="form-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Driver Name</label>
            <input
              type="text"
              className="form-control"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Base Salary (₹)</label>
            <input
              type="number"
              className="form-control"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Bonus Percentage (%)</label>
            <input
              type="number"
              className="form-control"
              value={bonusPercentage}
              onChange={(e) => setBonusPercentage(e.target.value)}
            />
          </div>

          <div className="col-12">
            <button onClick={calculateBonus} className="btn btn-primary">
              <i className="bi bi-calculator me-2"></i>
              Calculate Bonus
            </button>
          </div>

          {calculatedBonus > 0 && (
            <div className="col-12">
              <div className="alert alert-success">
                <h5 className="alert-heading">
                  Calculated Bonus: ₹{calculatedBonus.toFixed(2)}
                </h5>
                <p className="mb-0">
                  <strong>Period:</strong> {period} |<strong> Driver:</strong>{" "}
                  {driverName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Analytics() {
  const profitData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Profit",
        data: [5000, 8000, 6000, 12000, 9000, 15000],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
      {
        label: "Loss",
        data: [2000, 1500, 3000, 1000, 2500, 800],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-graph-up me-2"></i>
        Profit & Loss Analysis
      </h2>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="chart-card">
            <h5>Monthly Profit vs Loss</h5>
            <Bar
              data={profitData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="row g-3">
            <div className="col-12">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title text-success">Total Profit</h5>
                  <h3 className="card-text">₹55,000</h3>
                  <small className="text-success">
                    <i className="bi bi-arrow-up"></i> 12% from last period
                  </small>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title text-danger">Total Loss</h5>
                  <h3 className="card-text">₹10,800</h3>
                  <small className="text-danger">
                    <i className="bi bi-arrow-down"></i> 5% from last period
                  </small>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title text-primary">Net Profit</h5>
                  <h3 className="card-text">₹44,200</h3>
                  <small className="text-success">
                    <i className="bi bi-arrow-up"></i> 18% from last period
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Detailed Analysis</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="d-flex justify-content-between">
                <span>Best Performing Route:</span>
                <strong>Ghuraka to Bhaderwah</strong>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex justify-content-between">
                <span>Average Daily Profit:</span>
                <strong>₹1,473</strong>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex justify-content-between">
                <span>Fuel Efficiency:</span>
                <strong>12.5 km/L</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;