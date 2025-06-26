
import React from 'react';
import "../css/Dashboard.css";

function Dashboard({ totalEarnings, totalExpenses, profit, profitPercentage }) {
  return (
    <div className="dashboard">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="dashboard-title">
            <i className="bi bi-speedometer2 me-3"></i>
            Dashboard Overview
          </h1>
          <p className="text-muted">Welcome to AC SUKOON transport management system</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="stats-card earnings">
            <div className="stats-icon">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div className="stats-content">
              <h3>₹{totalEarnings.toLocaleString()}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="stats-card expenses">
            <div className="stats-icon">
              <i className="bi bi-credit-card"></i>
            </div>
            <div className="stats-content">
              <h3>₹{totalExpenses.toLocaleString()}</h3>
              <p>Total Expenses</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className={`stats-card ${profit >= 0 ? 'profit' : 'loss'}`}>
            <div className="stats-icon">
              <i className={`bi ${profit >= 0 ? 'bi-graph-up' : 'bi-graph-down'}`}></i>
            </div>
            <div className="stats-content">
              <h3>₹{Math.abs(profit).toLocaleString()}</h3>
              <p>{profit >= 0 ? 'Profit' : 'Loss'}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="stats-card percentage">
            <div className="stats-icon">
              <i className="bi bi-percent"></i>
            </div>
            <div className="stats-content">
              <h3>{profitPercentage}%</h3>
              <p>Profit Margin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="quick-actions-card">
            <h4 className="mb-3">Quick Actions</h4>
            <div className="row">
              <div className="col-md-3 col-sm-6 mb-3">
                <button className="btn btn-outline-primary w-100">
                  <i className="bi bi-ticket-perforated me-2"></i>
                  Add Fare Entry
                </button>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <button className="btn btn-outline-success w-100">
                  <i className="bi bi-fuel-pump me-2"></i>
                  Add Fuel Entry
                </button>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <button className="btn btn-outline-warning w-100">
                  <i className="bi bi-tools me-2"></i>
                  Service Entry
                </button>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <button className="btn btn-outline-info w-100">
                  <i className="bi bi-graph-up me-2"></i>
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="activity-card">
            <div className="card-header">
              <h4 className="card-title">Recent Activity</h4>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon earnings">
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <div className="activity-content">
                  <h6>Fare Collection</h6>
                  <p className="text-muted">Daily route fare collected</p>
                </div>
                <div className="activity-time">
                  <span className="text-success">+₹2,500</span>
                  <small className="text-muted d-block">2 hours ago</small>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon expenses">
                  <i className="bi bi-fuel-pump"></i>
                </div>
                <div className="activity-content">
                  <h6>Fuel Expense</h6>
                  <p className="text-muted">Petrol refill at local station</p>
                </div>
                <div className="activity-time">
                  <span className="text-danger">-₹800</span>
                  <small className="text-muted d-block">5 hours ago</small>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon service">
                  <i className="bi bi-tools"></i>
                </div>
                <div className="activity-content">
                  <h6>Service Entry</h6>
                  <p className="text-muted">AC repair and maintenance</p>
                </div>
                <div className="activity-time">
                  <span className="text-danger">-₹1,200</span>
                  <small className="text-muted d-block">1 day ago</small>
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
