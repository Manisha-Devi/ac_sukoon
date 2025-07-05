
import React, { useState, useEffect } from "react";
import "../css/Analytics.css";
import authService from "../../services/authService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
);

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    fareReceipts: [],
    fuelPayments: [],
    addaPayments: [],
    unionPayments: [],
    servicePayments: [],
    otherPayments: [],
    isLoading: true
  });

  const [dateRange, setDateRange] = useState('thisMonth');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setAnalyticsData(prev => ({ ...prev, isLoading: true }));

      const [fareReceipts, fuelPayments, addaPayments, unionPayments, servicePayments, otherPayments] = await Promise.all([
        authService.getFareReceipts(),
        authService.getFuelPayments(),
        authService.getAddaPayments(),
        authService.getUnionPayments(),
        authService.getServicePayments(),
        authService.getOtherPayments()
      ]);

      setAnalyticsData({
        fareReceipts: fareReceipts.success ? fareReceipts.data : [],
        fuelPayments: fuelPayments.success ? fuelPayments.data : [],
        addaPayments: addaPayments.success ? addaPayments.data : [],
        unionPayments: unionPayments.success ? unionPayments.data : [],
        servicePayments: servicePayments.success ? servicePayments.data : [],
        otherPayments: otherPayments.success ? otherPayments.data : [],
        isLoading: false
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
      setAnalyticsData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Filter data based on date range
  const filterDataByDate = (data) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    return data.filter(item => {
      const itemDate = new Date(item.date);
      switch (dateRange) {
        case 'thisWeek':
          return itemDate >= startOfWeek;
        case 'thisMonth':
          return itemDate >= startOfMonth;
        case 'last30Days':
          const last30Days = new Date();
          last30Days.setDate(last30Days.getDate() - 30);
          return itemDate >= last30Days;
        default:
          return true;
      }
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    const filteredFareReceipts = filterDataByDate(analyticsData.fareReceipts);
    const filteredFuelPayments = filterDataByDate(analyticsData.fuelPayments);
    const filteredAddaPayments = filterDataByDate(analyticsData.addaPayments);
    const filteredUnionPayments = filterDataByDate(analyticsData.unionPayments);
    const filteredServicePayments = filterDataByDate(analyticsData.servicePayments);
    const filteredOtherPayments = filterDataByDate(analyticsData.otherPayments);

    const totalEarnings = filteredFareReceipts.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    
    const totalExpenses = 
      filteredFuelPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0) +
      filteredAddaPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0) +
      filteredUnionPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0) +
      filteredServicePayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0) +
      filteredOtherPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    const netProfit = totalEarnings - totalExpenses;

    return {
      totalEarnings,
      totalExpenses,
      netProfit,
      fuelExpenses: filteredFuelPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
      addaExpenses: filteredAddaPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
      unionExpenses: filteredUnionPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
      serviceExpenses: filteredServicePayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
      otherExpenses: filteredOtherPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
    };
  };

  const totals = calculateTotals();

  // Monthly trends data
  const getMonthlyTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const earningsData = months.map(() => Math.floor(Math.random() * 50000) + 20000);
    const expensesData = months.map(() => Math.floor(Math.random() * 30000) + 10000);

    return {
      labels: months,
      datasets: [
        {
          label: 'Earnings',
          data: earningsData,
          backgroundColor: 'rgba(38, 222, 129, 0.8)',
          borderColor: 'rgba(38, 222, 129, 1)',
          borderWidth: 2,
        },
        {
          label: 'Expenses',
          data: expensesData,
          backgroundColor: 'rgba(255, 107, 107, 0.8)',
          borderColor: 'rgba(255, 107, 107, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  // Expense breakdown pie chart
  const getExpenseBreakdown = () => {
    return {
      labels: ['Fuel', 'Adda Payments', 'Union Payments', 'Service', 'Other'],
      datasets: [
        {
          data: [
            totals.fuelExpenses,
            totals.addaExpenses,
            totals.unionExpenses,
            totals.serviceExpenses,
            totals.otherExpenses
          ],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  };

  // Profit trend line chart
  const getProfitTrend = () => {
    const days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const profitData = days.map(() => Math.floor(Math.random() * 5000) + 1000);

    return {
      labels: days,
      datasets: [
        {
          label: 'Daily Profit',
          data: profitData,
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(102, 126, 234, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (analyticsData.isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-graph-up me-2"></i>
          Business Analytics
        </h2>
        <select 
          className="form-select w-auto" 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="last30Days">Last 30 Days</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-3">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h5 className="card-title text-success">Total Earnings</h5>
              <h3 className="card-text">₹{totals.totalEarnings.toLocaleString()}</h3>
              <small className="text-success">
                <i className="bi bi-arrow-up"></i> Revenue
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">Total Expenses</h5>
              <h3 className="card-text">₹{totals.totalExpenses.toLocaleString()}</h3>
              <small className="text-danger">
                <i className="bi bi-arrow-down"></i> Costs
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h5 className="card-title text-primary">Net Profit</h5>
              <h3 className="card-text">₹{totals.netProfit.toLocaleString()}</h3>
              <small className={totals.netProfit > 0 ? "text-success" : "text-danger"}>
                <i className={`bi bi-arrow-${totals.netProfit > 0 ? 'up' : 'down'}`}></i> 
                {((totals.netProfit / totals.totalEarnings) * 100 || 0).toFixed(1)}%
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h5 className="card-title text-info">Profit Margin</h5>
              <h3 className="card-text">{((totals.netProfit / totals.totalEarnings) * 100 || 0).toFixed(1)}%</h3>
              <small className="text-info">
                <i className="bi bi-percent"></i> Efficiency
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-8">
          <div className="analytics-chart-card">
            <h5>
              <i className="bi bi-bar-chart me-2"></i>
              Monthly Earnings vs Expenses
            </h5>
            <Bar data={getMonthlyTrends()} options={chartOptions} />
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="analytics-chart-card">
            <h5>
              <i className="bi bi-pie-chart me-2"></i>
              Expense Breakdown
            </h5>
            <Doughnut data={getExpenseBreakdown()} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Profit Trend */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="analytics-chart-card">
            <h5>
              <i className="bi bi-graph-up me-2"></i>
              Weekly Profit Trend
            </h5>
            <Line data={getProfitTrend()} options={lineOptions} />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="analytics-summary-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clipboard-data me-2"></i>
                Quick Insights
              </h5>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Highest Expense:</span>
                    <strong>
                      {totals.fuelExpenses > totals.addaExpenses ? 'Fuel' : 'Adda'} 
                      (₹{Math.max(totals.fuelExpenses, totals.addaExpenses).toLocaleString()})
                    </strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Average Daily Profit:</span>
                    <strong>₹{Math.round(totals.netProfit / 30).toLocaleString()}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Cash vs Bank Ratio:</span>
                    <strong>60:40</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Total Entries:</span>
                    <strong>
                      {analyticsData.fareReceipts.length + 
                       analyticsData.fuelPayments.length + 
                       analyticsData.addaPayments.length + 
                       analyticsData.unionPayments.length + 
                       analyticsData.servicePayments.length + 
                       analyticsData.otherPayments.length}
                    </strong>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary btn-sm w-100"
                  onClick={loadAnalyticsData}
                  disabled={analyticsData.isLoading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
