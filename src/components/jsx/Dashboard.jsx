import React, { useState, useEffect } from "react";
import "../css/Dashboard.css";
import authService from "../../services/authService.js";
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
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

function Dashboard({ totalEarnings, totalExpenses, profit, profitPercentage, setFareData, setExpenseData, setCashBookEntries }) {
  const [isLoading, setIsLoading] = useState(false);
  const [allData, setAllData] = useState({
    fareReceipts: [],
    bookingEntries: [],
    offDays: [],
    fuelPayments: [],
    addaPayments: [],
    totalRecords: 0
  });

  // Comprehensive data loading function
  const loadAllDataFromSheets = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Dashboard: Loading all data from Google Sheets...');

      // Add timeout and retry logic for each API call
      const loadWithRetry = async (fn, retries = 2) => {
        for (let i = 0; i <= retries; i++) {
          try {
            return await fn();
          } catch (error) {
            if (i === retries) throw error;
            console.log(`⚠️ Retry ${i + 1}/${retries} after error:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          }
        }
      };

      // Fetch all types of data in parallel with retry mechanism
      const [
        fareReceipts, 
        bookingEntries, 
        offDays, 
        fuelPayments, 
        addaPayments
      ] = await Promise.all([
        loadWithRetry(() => authService.getFareReceipts()),
        loadWithRetry(() => authService.getBookingEntries()),
        loadWithRetry(() => authService.getOffDays()),
        loadWithRetry(() => authService.getFuelPayments()),
        loadWithRetry(() => authService.getAddaPayments())
      ]);

      // Process and combine all data
      let combinedFareData = [];
      let combinedExpenseData = [];
      let combinedCashBookEntries = [];

      // Process Fare Receipts
      if (fareReceipts.success && fareReceipts.data) {
        const processedFareReceipts = fareReceipts.data.map(entry => ({
          ...entry,
          type: 'daily',
          timestamp: entry.timestamp || new Date().toISOString()
        }));
        combinedFareData = [...combinedFareData, ...processedFareReceipts];
        
        // Generate cash book entries from fare receipts
        const fareCashEntries = processedFareReceipts.map(entry => ({
          entryId: entry.entryId,
          date: entry.date,
          description: `Fare Collection - ${entry.route}`,
          cashIn: entry.cashAmount || 0,
          bankIn: entry.bankAmount || 0,
          totalIn: entry.totalAmount || 0,
          cashOut: 0,
          bankOut: 0,
          totalOut: 0,
          type: 'income',
          category: 'Fare Collection',
          submittedBy: entry.submittedBy
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...fareCashEntries];
      }

      // Process Booking Entries
      if (bookingEntries.success && bookingEntries.data) {
        const processedBookingEntries = bookingEntries.data.map(entry => ({
          ...entry,
          type: 'booking',
          timestamp: entry.timestamp || new Date().toISOString()
        }));
        combinedFareData = [...combinedFareData, ...processedBookingEntries];
        
        // Generate cash book entries from booking entries
        const bookingCashEntries = processedBookingEntries.map(entry => ({
          entryId: entry.entryId,
          date: entry.dateFrom,
          description: `Booking - ${entry.bookingDetails}`,
          cashIn: entry.cashAmount || 0,
          bankIn: entry.bankAmount || 0,
          totalIn: entry.totalAmount || 0,
          cashOut: 0,
          bankOut: 0,
          totalOut: 0,
          type: 'income',
          category: 'Booking Revenue',
          submittedBy: entry.submittedBy
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...bookingCashEntries];
      }

      // Process Off Days
      if (offDays.success && offDays.data) {
        const processedOffDays = offDays.data.map(entry => ({
          ...entry,
          type: 'off',
          timestamp: entry.timestamp || new Date().toISOString()
        }));
        combinedFareData = [...combinedFareData, ...processedOffDays];
      }

      // Process Fuel Payments (Expenses)
      if (fuelPayments.success && fuelPayments.data) {
        const processedFuelPayments = fuelPayments.data.map(entry => ({
          ...entry,
          type: 'fuel',
          timestamp: entry.timestamp || new Date().toISOString()
        }));
        combinedExpenseData = [...combinedExpenseData, ...processedFuelPayments];
        
        // Generate cash book entries from fuel payments
        const fuelCashEntries = processedFuelPayments.map(entry => ({
          entryId: entry.entryId,
          date: entry.date,
          description: `Fuel Payment - ${entry.pumpName} (${entry.liters}L @ ₹${entry.rate})`,
          cashIn: 0,
          bankIn: 0,
          totalIn: 0,
          cashOut: entry.cashAmount || 0,
          bankOut: entry.bankAmount || 0,
          totalOut: entry.totalAmount || 0,
          type: 'expense',
          category: 'Fuel',
          submittedBy: entry.submittedBy
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...fuelCashEntries];
      }

      // Process Adda Payments (Expenses)
      if (addaPayments.success && addaPayments.data) {
        const processedAddaPayments = addaPayments.data.map(entry => ({
          ...entry,
          type: 'adda',
          timestamp: entry.timestamp || new Date().toISOString()
        }));
        combinedExpenseData = [...combinedExpenseData, ...processedAddaPayments];
        
        // Generate cash book entries from adda payments
        const addaCashEntries = processedAddaPayments.map(entry => ({
          entryId: entry.entryId,
          date: entry.date,
          description: `Adda Payment - ${entry.addaName}`,
          cashIn: 0,
          bankIn: 0,
          totalIn: 0,
          cashOut: entry.cashAmount || 0,
          bankOut: entry.bankAmount || 0,
          totalOut: entry.totalAmount || 0,
          type: 'expense',
          category: 'Adda Fees',
          submittedBy: entry.submittedBy
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...addaCashEntries];
      }

      // Sort all data by timestamp (newest first)
      combinedFareData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      combinedExpenseData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      combinedCashBookEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Update state in parent components
      if (setFareData) setFareData(combinedFareData);
      if (setExpenseData) setExpenseData(combinedExpenseData);
      if (setCashBookEntries) setCashBookEntries(combinedCashBookEntries);

      // Update local state for dashboard display
      setAllData({
        fareReceipts: fareReceipts.data || [],
        bookingEntries: bookingEntries.data || [],
        offDays: offDays.data || [],
        fuelPayments: fuelPayments.data || [],
        addaPayments: addaPayments.data || [],
        totalRecords: combinedFareData.length + combinedExpenseData.length
      });

      console.log('✅ Dashboard: All data loaded successfully');
      console.log('📊 Summary:', {
        fareRecords: combinedFareData.length,
        expenseRecords: combinedExpenseData.length,
        cashBookEntries: combinedCashBookEntries.length,
        totalRecords: combinedFareData.length + combinedExpenseData.length
      });

    } catch (error) {
      console.error('❌ Dashboard: Error loading data:', error);
      // Show user-friendly error message
      alert('Unable to load data from Google Sheets. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when dashboard mounts
  useEffect(() => {
    loadAllDataFromSheets();
  }, []);

  // Refresh data function (can be called manually)
  const refreshAllData = () => {
    loadAllDataFromSheets();
  };
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
              {isLoading && <span className="spinner-border spinner-border-sm ms-3" role="status"></span>}
            </h1>
            <p className="dashboard-subtitle mb-0">
              Welcome back! Here's what's happening with your business today.
              {allData.totalRecords > 0 && (
                <small className="text-success ms-2">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  {allData.totalRecords} records loaded
                </small>
              )}
            </p>
          </div>
          <div className="mt-3 mt-md-0 d-flex flex-column align-items-end gap-2">
            <div className="dashboard-date">
              <i className="bi bi-calendar3 me-2"></i>
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <button 
              className="btn btn-outline-primary btn-sm" 
              onClick={refreshAllData}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </button>
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

export default Dashboard;