
import React from 'react';
import "../css/Analytics.css";

function Analytics() {
  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-graph-up me-2"></i>
        Analytics & Reports
      </h2>

      <div className="row g-4">
        <div className="col-12">
          <div className="analytics-card">
            <div className="card-body">
              <h5 className="card-title">Business Analytics</h5>
              <p className="card-text">
                Detailed analytics and reporting features will be available here.
                Track your business performance, generate reports, and analyze trends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
