
import React, { useState, useMemo } from "react";
import "../css/Analytics.css";
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
  Filler,
  RadialLinearScale,
} from "chart.js";
import { Bar, Doughnut, Line, PolarArea, Radar } from "react-chartjs-2";

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
  Filler,
  RadialLinearScale,
);

function Analytics({ fareData, expenseData, totalEarnings, totalExpenses }) {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [chartType, setChartType] = useState('bar');
  const [viewMode, setViewMode] = useState('overview');

  // Get data from props instead of fetching
  const analyticsData = useMemo(() => {
    // Separate expense data by type
    const fuelPayments = expenseData.filter(item => item.type === 'fuel') || [];
    const addaPayments = expenseData.filter(item => item.type === 'adda') || [];
    const unionPayments = expenseData.filter(item => item.type === 'union') || [];
    const servicePayments = expenseData.filter(item => item.type === 'service') || [];
    const otherPayments = expenseData.filter(item => item.type === 'other') || [];

    return {
      fareReceipts: fareData || [],
      fuelPayments,
      addaPayments,
      unionPayments,
      servicePayments,
      otherPayments,
      isLoading: false
    };
  }, [fareData, expenseData]);

  // Filter data based on date range
  const filterDataByDate = (data) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfYear = new Date(now.getFullYear(), 0, 1);

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
        case 'thisYear':
          return itemDate >= startOfYear;
        default:
          return true;
      }
    });
  };

  // Calculate comprehensive totals
  const calculateTotals = () => {
    const filteredFareReceipts = filterDataByDate(analyticsData.fareReceipts);
    const filteredFuelPayments = filterDataByDate(analyticsData.fuelPayments);
    const filteredAddaPayments = filterDataByDate(analyticsData.addaPayments);
    const filteredUnionPayments = filterDataByDate(analyticsData.unionPayments);
    const filteredServicePayments = filterDataByDate(analyticsData.servicePayments);
    const filteredOtherPayments = filterDataByDate(analyticsData.otherPayments);

    const totalEarningsFiltered = filteredFareReceipts.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalCashAmount = filteredFareReceipts.reduce((sum, item) => sum + (item.cashAmount || 0), 0);
    const totalBankAmount = filteredFareReceipts.reduce((sum, item) => sum + (item.bankAmount || 0), 0);
    
    const fuelExpenses = filteredFuelPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const addaExpenses = filteredAddaPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const unionExpenses = filteredUnionPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const serviceExpenses = filteredServicePayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const otherExpenses = filteredOtherPayments.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    const totalExpensesFiltered = fuelExpenses + addaExpenses + unionExpenses + serviceExpenses + otherExpenses;
    const netProfit = totalEarningsFiltered - totalExpensesFiltered;

    return {
      totalEarnings: totalEarningsFiltered,
      totalCash: totalCashAmount,
      totalBank: totalBankAmount,
      totalExpenses: totalExpensesFiltered,
      netProfit,
      fuelExpenses,
      addaExpenses,
      unionExpenses,
      serviceExpenses,
      otherExpenses,
      transactionCount: filteredFareReceipts.length + filteredFuelPayments.length + filteredAddaPayments.length + filteredUnionPayments.length + filteredServicePayments.length + filteredOtherPayments.length,
      avgTransactionValue: filteredFareReceipts.length > 0 ? totalEarningsFiltered / filteredFareReceipts.length : 0,
      profitMargin: totalEarningsFiltered > 0 ? (netProfit / totalEarningsFiltered) * 100 : 0,
      expenseRatio: totalEarningsFiltered > 0 ? (totalExpensesFiltered / totalEarningsFiltered) * 100 : 0
    };
  };

  const totals = calculateTotals();

  // Enhanced daily trends data
  const getDailyTrends = () => {
    const days = Array.from({length: 14}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        date: date.toISOString().split('T')[0]
      };
    });

    const earningsData = days.map(day => {
      const dayData = analyticsData.fareReceipts.filter(item => 
        new Date(item.date).toISOString().split('T')[0] === day.date
      );
      return dayData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    });

    const expensesData = days.map(day => {
      const dayExpenses = [
        ...analyticsData.fuelPayments,
        ...analyticsData.addaPayments,
        ...analyticsData.unionPayments,
        ...analyticsData.servicePayments,
        ...analyticsData.otherPayments
      ].filter(item => 
        new Date(item.date).toISOString().split('T')[0] === day.date
      );
      return dayExpenses.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    });

    const profitData = earningsData.map((earning, index) => earning - expensesData[index]);

    return {
      labels: days.map(day => day.label),
      datasets: [
        {
          label: 'Earnings',
          data: earningsData,
          backgroundColor: 'rgba(38, 222, 129, 0.8)',
          borderColor: 'rgba(38, 222, 129, 1)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'Expenses',
          data: expensesData,
          backgroundColor: 'rgba(255, 107, 107, 0.8)',
          borderColor: 'rgba(255, 107, 107, 1)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'Profit',
          data: profitData,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          tension: 0.4,
        }
      ],
    };
  };

  // Enhanced expense breakdown
  const getExpenseBreakdown = () => {
    const expenseTypes = [
      { label: 'Fuel', value: totals.fuelExpenses, color: '#FF6384' },
      { label: 'Adda Payments', value: totals.addaExpenses, color: '#36A2EB' },
      { label: 'Union Payments', value: totals.unionExpenses, color: '#FFCE56' },
      { label: 'Service', value: totals.serviceExpenses, color: '#4BC0C0' },
      { label: 'Other', value: totals.otherExpenses, color: '#9966FF' }
    ].filter(item => item.value > 0);

    return {
      labels: expenseTypes.map(item => item.label),
      datasets: [
        {
          data: expenseTypes.map(item => item.value),
          backgroundColor: expenseTypes.map(item => item.color),
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 5,
          hoverBorderColor: '#000000',
        },
      ],
    };
  };

  // Payment method analysis
  const getPaymentMethodAnalysis = () => {
    return {
      labels: ['Cash Payments', 'Bank Transfers'],
      datasets: [
        {
          data: [totals.totalCash, totals.totalBank],
          backgroundColor: ['#FF9F43', '#10AC84'],
          borderWidth: 3,
          borderColor: '#ffffff',
        },
      ],
    };
  };

  // Performance radar chart
  const getPerformanceRadar = () => {
    const maxValues = {
      earnings: Math.max(totalEarnings, 100000),
      expenses: Math.max(totalExpenses, 50000),
      profit: Math.max(totals.netProfit, 50000),
      transactions: Math.max(totals.transactionCount, 100),
      avgTransaction: Math.max(totals.avgTransactionValue, 1000)
    };

    return {
      labels: ['Earnings', 'Expense Control', 'Profit', 'Transaction Volume', 'Avg Transaction Value'],
      datasets: [
        {
          label: 'Performance Metrics',
          data: [
            (totals.totalEarnings / maxValues.earnings) * 100,
            ((maxValues.expenses - totals.totalExpenses) / maxValues.expenses) * 100,
            (totals.netProfit / maxValues.profit) * 100,
            (totals.transactionCount / maxValues.transactions) * 100,
            (totals.avgTransactionValue / maxValues.avgTransaction) * 100
          ],
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(102, 126, 234, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
        },
      ],
    };
  };

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 8
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
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
    elements: {
      arc: {
        borderWidth: 3
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.r.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 10,
            weight: 'bold'
          }
        },
        ticks: {
          display: false
        }
      }
    }
  };

  return (
    <div className="analytics-container fade-in">
      <div className="analytics-header">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h2 className="analytics-title mb-3 mb-md-0">
            <i className="bi bi-graph-up me-2"></i>
            Business Analytics Dashboard
          </h2>
          <div className="analytics-controls d-flex flex-column flex-sm-row gap-2">
            <select 
              className="form-select analytics-select" 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="last30Days">Last 30 Days</option>
              <option value="thisYear">This Year</option>
            </select>
            <select 
              className="form-select analytics-select" 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed</option>
              <option value="performance">Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics Cards */}
      <div className="analytics-metrics-grid mb-4">
        <div className="analytics-metric-card earnings-card">
          <div className="metric-content">
            <div className="metric-icon">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div className="metric-details">
              <h3 className="metric-value">₹{totals.totalEarnings.toLocaleString()}</h3>
              <p className="metric-label">Total Earnings</p>
              <div className="metric-trend positive">
                <i className="bi bi-arrow-up"></i>
                <span>{totals.profitMargin.toFixed(1)}% margin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-metric-card expenses-card">
          <div className="metric-content">
            <div className="metric-icon">
              <i className="bi bi-credit-card"></i>
            </div>
            <div className="metric-details">
              <h3 className="metric-value">₹{totals.totalExpenses.toLocaleString()}</h3>
              <p className="metric-label">Total Expenses</p>
              <div className="metric-trend negative">
                <i className="bi bi-arrow-down"></i>
                <span>{totals.expenseRatio.toFixed(1)}% of earnings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-metric-card profit-card">
          <div className="metric-content">
            <div className="metric-icon">
              <i className="bi bi-graph-up"></i>
            </div>
            <div className="metric-details">
              <h3 className="metric-value">₹{totals.netProfit.toLocaleString()}</h3>
              <p className="metric-label">Net Profit</p>
              <div className={`metric-trend ${totals.netProfit > 0 ? 'positive' : 'negative'}`}>
                <i className={`bi bi-arrow-${totals.netProfit > 0 ? 'up' : 'down'}`}></i>
                <span>{totals.profitMargin.toFixed(1)}% margin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-metric-card transactions-card">
          <div className="metric-content">
            <div className="metric-icon">
              <i className="bi bi-receipt"></i>
            </div>
            <div className="metric-details">
              <h3 className="metric-value">{totals.transactionCount}</h3>
              <p className="metric-label">Total Transactions</p>
              <div className="metric-trend neutral">
                <i className="bi bi-graph-up"></i>
                <span>₹{totals.avgTransactionValue.toFixed(0)} avg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-charts-section">
        <div className="row g-4 mb-4">
          <div className="col-12 col-xl-8">
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h5>
                  <i className="bi bi-graph-up me-2"></i>
                  Daily Performance Trends (Last 14 Days)
                </h5>
                <div className="chart-controls">
                  <select 
                    className="form-select form-select-sm"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                  </select>
                </div>
              </div>
              <div className="chart-container">
                {chartType === 'bar' ? (
                  <Bar data={getDailyTrends()} options={chartOptions} />
                ) : (
                  <Line data={getDailyTrends()} options={chartOptions} />
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h5>
                  <i className="bi bi-pie-chart me-2"></i>
                  Expense Distribution
                </h5>
              </div>
              <div className="chart-container">
                <Doughnut data={getExpenseBreakdown()} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h5>
                  <i className="bi bi-wallet2 me-2"></i>
                  Payment Method Analysis
                </h5>
              </div>
              <div className="chart-container">
                <PolarArea data={getPaymentMethodAnalysis()} options={doughnutOptions} />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h5>
                  <i className="bi bi-speedometer2 me-2"></i>
                  Performance Radar
                </h5>
              </div>
              <div className="chart-container">
                <Radar data={getPerformanceRadar()} options={radarOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Insights Section */}
      <div className="analytics-insights-section">
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="analytics-insights-card">
              <div className="card-header">
                <h5>
                  <i className="bi bi-lightbulb me-2"></i>
                  Business Insights & Recommendations
                </h5>
              </div>
              <div className="insights-content">
                <div className="insight-item">
                  <div className="insight-icon positive">
                    <i className="bi bi-trending-up"></i>
                  </div>
                  <div className="insight-content">
                    <h6>Profit Margin Analysis</h6>
                    <p>Your current profit margin is {totals.profitMargin.toFixed(1)}%. 
                    {totals.profitMargin > 20 ? ' Excellent performance!' : 
                     totals.profitMargin > 10 ? ' Good performance, room for improvement.' : 
                     ' Consider reducing expenses or increasing revenue.'}</p>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon neutral">
                    <i className="bi bi-graph-up"></i>
                  </div>
                  <div className="insight-content">
                    <h6>Expense Optimization</h6>
                    <p>Fuel expenses account for ₹{totals.fuelExpenses.toLocaleString()} 
                    ({((totals.fuelExpenses / totals.totalExpenses) * 100).toFixed(1)}% of total expenses). 
                    Consider fuel-efficient routes and maintenance.</p>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon info">
                    <i className="bi bi-cash-stack"></i>
                  </div>
                  <div className="insight-content">
                    <h6>Cash Flow Analysis</h6>
                    <p>Cash payments: ₹{totals.totalCash.toLocaleString()} | 
                    Bank transfers: ₹{totals.totalBank.toLocaleString()}. 
                    Ratio: {totals.totalCash > 0 ? Math.round((totals.totalCash / (totals.totalCash + totals.totalBank)) * 100) : 0}% cash.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="analytics-summary-card">
              <div className="card-header">
                <h5>
                  <i className="bi bi-clipboard-data me-2"></i>
                  Quick Stats
                </h5>
              </div>
              <div className="summary-content">
                <div className="summary-stat">
                  <span className="stat-label">Highest Expense Category</span>
                  <span className="stat-value">
                    {totals.fuelExpenses >= Math.max(totals.addaExpenses, totals.unionExpenses, totals.serviceExpenses, totals.otherExpenses) ? 'Fuel' : 
                     totals.addaExpenses >= Math.max(totals.unionExpenses, totals.serviceExpenses, totals.otherExpenses) ? 'Adda' : 
                     totals.unionExpenses >= Math.max(totals.serviceExpenses, totals.otherExpenses) ? 'Union' : 
                     totals.serviceExpenses >= totals.otherExpenses ? 'Service' : 'Other'}
                  </span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Average Daily Profit</span>
                  <span className="stat-value">₹{Math.round(totals.netProfit / 30).toLocaleString()}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Average Transaction Value</span>
                  <span className="stat-value">₹{totals.avgTransactionValue.toFixed(0)}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Expense Efficiency</span>
                  <span className="stat-value">{(100 - totals.expenseRatio).toFixed(1)}%</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Revenue Growth Potential</span>
                  <span className="stat-value">
                    {totals.profitMargin > 15 ? 'High' : totals.profitMargin > 8 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Total Data Points</span>
                  <span className="stat-value">{totals.transactionCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
