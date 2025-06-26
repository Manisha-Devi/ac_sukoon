
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Analytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

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

export default Analytics;
