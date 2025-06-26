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
        label: "Earnings",
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const doughnutData = {
    labels: ["Fare Collection", "Fuel Expense", "Service Cost", "Other"],
    datasets: [
      {
        data: [60, 25, 10, 5],
        backgroundColor: ["#4CAF50", "#FF5722", "#2196F3", "#FFC107"],
      },
    ],
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard Overview
        </h2>
        <div className="d-none d-md-block">
          <small className="text-muted">
            Last updated: {new Date().toLocaleDateString()}
          </small>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="card-body">
              <div className="stat-icon earnings">
                <i className="bi bi-currency-rupee"></i>
              </div>
              <h3 className="stat-value">₹{totalEarnings.toLocaleString()}</h3>
              <p className="stat-label">Total Earnings</p>
              <span className="stat-change positive">
                <i className="bi bi-arrow-up"></i> +10% from last month
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="card-body">
              <div className="stat-icon expenses">
                <i className="bi bi-graph-down-arrow"></i>
              </div>
              <h3 className="stat-value">₹{totalExpenses.toLocaleString()}</h3>
              <p className="stat-label">Total Expenses</p>
              <span className="stat-change negative">
                <i className="bi bi-arrow-up"></i> +5% from last month
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="card-body">
              <div className="stat-icon profit">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <h3 className="stat-value">₹{profit.toLocaleString()}</h3>
              <p className="stat-label">Net Profit</p>
              <span className="stat-change positive">
                <i className="bi bi-arrow-up"></i> +{profitPercentage}% margin
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="card-body">
              <div className="stat-icon routes">
                <i className="bi bi-bus-front"></i>
              </div>
              <h3 className="stat-value">12</h3>
              <p className="stat-label">Active Routes</p>
              <span className="stat-change">Daily operations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="chart-card">
            <h5>
              <i className="bi bi-graph-up me-2"></i>
              Monthly Earnings Trend
            </h5>
            <Line
              data={lineData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="chart-card">
            <h5>
              <i className="bi bi-pie-chart me-2"></i>
              Expense Breakdown
            </h5>
            <Doughnut
              data={doughnutData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clock-history me-2"></i>
                Recent Activity
              </h5>
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="bi bi-ticket-perforated"></i>
                </div>
                <div>
                  <h6 className="mb-1">Fare collected: Ghuraka to Bhaderwah</h6>
                  <p className="mb-0 text-muted">₹2,500 - 2 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="bi bi-fuel-pump"></i>
                </div>
                <div>
                  <h6 className="mb-1">Fuel expense added</h6>
                  <p className="mb-0 text-muted">₹3,200 - 4 hours ago</p>
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
  const [formData, setFormData] = useState({
    route: "",
    fare: "",
    passengers: "",
    date: "",
    time: "",
  });

  const routes = [
    "Ghuraka to Bhaderwah",
    "Bhaderwah to Pul Doda",
    "Pul Doda to Thatri",
    "Thatri to Pul Doda",
    "Pul Doda to Bhaderwah",
    "Bhaderwah to Ghuraka",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      ...formData,
      totalAmount: parseInt(formData.fare) * parseInt(formData.passengers),
    };
    setFareData([...fareData, newEntry]);
    setTotalEarnings((prev) => prev + newEntry.totalAmount);
    setFormData({ route: "", fare: "", passengers: "", date: "", time: "" });
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-ticket-perforated me-2"></i>
        Route-wise Fare Collection
      </h2>

      <div className="form-card">
        <h3>Add New Fare Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Route</label>
              <select
                className="form-select"
                value={formData.route}
                onChange={(e) =>
                  setFormData({ ...formData, route: e.target.value })
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
              <label className="form-label">Fare per Passenger (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.fare}
                onChange={(e) =>
                  setFormData({ ...formData, fare: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Number of Passengers</label>
              <input
                type="number"
                className="form-control"
                value={formData.passengers}
                onChange={(e) =>
                  setFormData({ ...formData, passengers: e.target.value })
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
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Add Fare Entry
              </button>
            </div>
          </div>
        </form>
      </div>

      {fareData.length > 0 && (
        <div className="table-card">
          <h5>Recent Fare Entries</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Fare</th>
                  <th>Passengers</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {fareData.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.route}</td>
                    <td>₹{entry.fare}</td>
                    <td>{entry.passengers}</td>
                    <td>₹{entry.totalAmount}</td>
                    <td>{entry.date}</td>
                    <td>{entry.time}</td>
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