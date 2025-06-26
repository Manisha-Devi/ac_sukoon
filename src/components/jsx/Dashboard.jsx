
import React from "react";
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

export default Dashboard;
