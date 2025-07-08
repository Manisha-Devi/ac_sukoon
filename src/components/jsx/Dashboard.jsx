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

function Dashboard({ totalEarnings, totalExpenses, profit, profitPercentage, setFareData, setExpenseData, setCashBookEntries, isRefreshing, dataStats, dataStatistics, onRefreshComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDataBreakdown, setShowDataBreakdown] = useState(false);
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
        addaPayments,
        unionPayments,
        servicePayments,
        otherPayments
      ] = await Promise.all([
        loadWithRetry(() => authService.getFareReceipts()),
        loadWithRetry(() => authService.getBookingEntries()),
        loadWithRetry(() => authService.getOffDays()),
        loadWithRetry(() => authService.getFuelPayments()),
        loadWithRetry(() => authService.getAddaPayments()),
        loadWithRetry(() => authService.getUnionPayments()),
        loadWithRetry(() => authService.getServicePayments()),
        loadWithRetry(() => authService.getOtherPayments())
      ]);

      // Process and combine all data
      let combinedFareData = [];
      let combinedExpenseData = [];
      let combinedCashBookEntries = [];

      // Helper functions to convert ISO strings to proper format (same as components)
      const convertToTimeString = (timestamp) => {
        if (!timestamp) return '';
        if (typeof timestamp === 'string' && timestamp.match(/^\d{1,2}:\d{2}:\d{2} (AM|PM)$/)) {
          return timestamp;
        }
        if (typeof timestamp === 'string' && timestamp.includes('T')) {
          try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('en-US', {
              hour12: true,
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              timeZone: 'Asia/Kolkata'
            });
          } catch (error) {
            return timestamp.split('T')[1]?.split('.')[0] || timestamp;
          }
        }
        if (timestamp instanceof Date) {
          return timestamp.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Kolkata'
          });
        }
        return String(timestamp);
      };

      const convertToDateString = (date) => {
        if (!date) return '';
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return date;
        }
        if (typeof date === 'string' && date.includes('T')) {
          try {
            const dateObj = new Date(date);
            const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));
            return istDate.toISOString().split('T')[0];
          } catch (error) {
            return date.split('T')[0];
          }
        }
        if (date instanceof Date) {
          const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
          return istDate.toISOString().split('T')[0];
        }
        return String(date);
      };

      // Process Fare Receipts (Daily Entries) - Only required fields for CashSummary
      if (fareReceipts.success && fareReceipts.data) {
        const processedFareReceipts = fareReceipts.data.map(entry => ({
          entryId: entry.entryId,
          date: convertToDateString(entry.date),
          cashAmount: entry.cashAmount || 0,
          type: 'daily',
          submittedBy: entry.submittedBy,
          entryStatus: entry.entryStatus || 'pending',
          approvedBy: entry.approvedBy || '',
          // Keep full data for other components
          timestamp: convertToTimeString(entry.timestamp),
          route: entry.route,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount || 0
        }));
        combinedFareData = [...combinedFareData, ...processedFareReceipts];

        // Generate cash book entries from fare receipts
        const fareCashEntries = processedFareReceipts.map(entry => ({
          id: `fare-${entry.entryId}`,
          date: entry.date,
          description: `Daily Collection - ${entry.route}`,
          cashReceived: entry.cashAmount || 0,
          bankReceived: entry.bankAmount || 0,
          cashPaid: 0,
          bankPaid: 0,
          source: 'fare-entry',
          jfNo: `JF-${entry.entryId}`,
          submittedBy: entry.submittedBy
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...fareCashEntries];
      }

      // Process Booking Entries - Only required fields for CashSummary  
      if (bookingEntries.success && bookingEntries.data) {
        const processedBookingEntries = bookingEntries.data.map(entry => ({
          entryId: entry.entryId,
          date: convertToDateString(entry.dateFrom), // Use dateFrom as main date
          cashAmount: entry.cashAmount || 0,
          type: 'booking',
          submittedBy: entry.submittedBy,
          entryStatus: entry.entryStatus || 'pending',
          approvedBy: entry.approvedBy || '',
          // Keep full data for other components
          timestamp: convertToTimeString(entry.timestamp),
          bookingDetails: entry.bookingDetails,
          dateFrom: convertToDateString(entry.dateFrom),
          dateTo: convertToDateString(entry.dateTo),
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount || 0
        }));
        combinedFareData = [...combinedFareData, ...processedBookingEntries];

        // Generate cash book entries from booking entries
        const bookingCashEntries = processedBookingEntries.map(entry => ({
          id: `booking-${entry.entryId}`,
          date: entry.dateFrom,
          description: `Booking - ${entry.bookingDetails}`,
          cashReceived: entry.cashAmount || 0,
          bankReceived: entry.bankAmount || 0,
          cashPaid: 0,
          bankPaid: 0,
          source: 'fare-entry',
          jfNo: `JF-${entry.entryId}`,
          submittedBy: entry.submittedBy
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...bookingCashEntries];
      }

      // Process Off Days - Add them to fare data for comprehensive display
      if (offDays.success && offDays.data) {
        const processedOffDays = offDays.data.map(entry => ({
          entryId: entry.entryId,
          date: convertToDateString(entry.date),
          cashAmount: 0, // Off days have no cash amount
          type: 'off',
          submittedBy: entry.submittedBy,
          entryStatus: entry.entryStatus || 'pending',
          approvedBy: entry.approvedBy || '',
          // Keep full data for other components
          timestamp: convertToTimeString(entry.timestamp),
          reason: entry.reason,
          bankAmount: 0,
          totalAmount: 0
        }));
        combinedFareData = [...combinedFareData, ...processedOffDays];

        // Generate cash book entries from off days (informational entries)
        const offDaysCashEntries = processedOffDays.map(entry => ({
          id: `off-${entry.entryId}`,
          date: entry.date,
          description: `Off Day - ${entry.reason}`,
          cashReceived: 0,
          bankReceived: 0,
          cashPaid: 0,
          bankPaid: 0,
          source: 'off-day',
          jfNo: `OFF-${entry.entryId}`,
          submittedBy: entry.submittedBy
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...offDaysCashEntries];
      }

      // Process Fuel Payments - Only required fields for CashSummary
      if (fuelPayments.success && fuelPayments.data) {
        const processedFuelPayments = fuelPayments.data.map(entry => ({
          entryId: entry.entryId,
          date: convertToDateString(entry.date),
          cashAmount: entry.cashAmount || 0,
          type: 'fuel',
          submittedBy: entry.submittedBy,
          entryStatus: entry.entryStatus || 'pending',
          approvedBy: entry.approvedBy || '',
          // Keep full data for other components
          id: entry.entryId,
          timestamp: convertToTimeString(entry.timestamp),
          pumpName: entry.pumpName,
          liters: entry.liters,
          rate: entry.rate,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount || 0,
          remarks: entry.remarks || ""
        }));
        combinedExpenseData = [...combinedExpenseData, ...processedFuelPayments];

        // Generate cash book entries from fuel payments
        const fuelCashEntries = processedFuelPayments.map(entry => ({
          id: `fuel-${entry.entryId}`,
          date: entry.date,
          particulars: "Fuel",
          description: `Fuel expense - ${entry.pumpName || 'Fuel Station'}${entry.liters ? ` (${entry.liters}L)` : ''}`,
          jfNo: `FUEL-${entry.entryId}`,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          type: 'cr',
          timestamp: entry.timestamp,
          source: 'fuel-payment'
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...fuelCashEntries];
      }

      // Process Adda Payments - Only required fields for CashSummary
      if (addaPayments.success && addaPayments.data) {
        const processedAddaPayments = addaPayments.data.map(entry => ({
          entryId: entry.entryId,
          date: convertToDateString(entry.date),
          cashAmount: entry.cashAmount || 0,
          type: 'adda',
          submittedBy: entry.submittedBy,
          entryStatus: entry.entryStatus || 'pending',
          approvedBy: entry.approvedBy || '',
          // Keep full data for other components
          id: entry.entryId,
          timestamp: convertToTimeString(entry.timestamp),
          addaName: entry.addaName,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount || 0,
          remarks: entry.remarks || ""
        }));
        combinedExpenseData = [...combinedExpenseData, ...processedAddaPayments];

        // Generate cash book entries from adda payments
        const addaCashEntries = processedAddaPayments.map(entry => ({
          id: `adda-${entry.entryId}`,
          date: entry.date,
          particulars: "Adda",
          description: `Adda payment - ${entry.addaName || 'Adda Station'}`,
          jfNo: `ADDA-${entry.entryId}`,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          type: 'cr',
          timestamp: entry.timestamp,
          source: 'adda-payment'
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...addaCashEntries];
      }

      // Process Union Payments - Only required fields for CashSummary
      if (unionPayments.success && unionPayments.data) {
        const processedUnionPayments = unionPayments.data.map(entry => ({
          entryId: entry.entryId,
          date: convertToDateString(entry.date),
          cashAmount: entry.cashAmount || 0,
          type: 'union',
          submittedBy: entry.submittedBy,
          entryStatus: entry.entryStatus || 'pending',
          approvedBy: entry.approvedBy || '',
          // Keep full data for other components
          id: entry.entryId,
          timestamp: convertToTimeString(entry.timestamp),
          unionName: entry.unionName,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount || 0,
          remarks: entry.remarks || ""
        }));
        combinedExpenseData = [...combinedExpenseData, ...processedUnionPayments];

        // Generate cash book entries from union payments
        const unionCashEntries = processedUnionPayments.map(entry => ({
          id: `union-${entry.entryId}`,
          date: entry.date,
          particulars: "Union Payment",
          description: `Union payment - ${entry.unionName || 'Union'}`,
          jfNo: `UNION-${entry.entryId}`,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          type: 'cr',
          timestamp: entry.timestamp,
          source: 'union-payment'
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...unionCashEntries];
      }

      // Process Service Payments - Only required fields for CashSummary
      if (servicePayments.success && servicePayments.data) {
        const processedServicePayments = servicePayments.data.map(entry => ({
          entryId: entry.entryId,
          date: convertToDateString(entry.date),
          cashAmount: entry.cashAmount || 0,
          type: 'service',
          submittedBy: entry.submittedBy,
          entryStatus: entry.entryStatus || 'pending',
          approvedBy: entry.approvedBy || '',
          // Keep full data for other components
          id: entry.entryId,
          timestamp: convertToTimeString(entry.timestamp),
          serviceType: entry.serviceType || entry.serviceDetails,
          serviceDetails: entry.serviceDetails || entry.serviceType,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount || 0
        }));
        combinedExpenseData = [...combinedExpenseData, ...processedServicePayments];

        // Generate cash book entries from service payments
        const serviceCashEntries = processedServicePayments.map(entry => ({
          id: `service-${entry.entryId}`,
          date: entry.date,
          particulars: "Service Payment",
          description: `Service payment - ${entry.serviceDetails || entry.serviceType || 'Service'}`,
          jfNo: `SERVICE-${entry.entryId}`,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          type: 'cr',
          timestamp: entry.timestamp,
          source: 'service-payment'
        }));
        combinedCashBookEntries = [...combinedCashBookEntries, ...serviceCashEntries];
      }

      // Process Other Payments - Only required fields for CashSummary
       if (otherPayments.success && otherPayments.data) {
         const processedOtherPayments = otherPayments.data.map(entry => ({
           entryId: entry.entryId,
           date: convertToDateString(entry.date),
           cashAmount: entry.cashAmount || 0,
           type: 'other',
           submittedBy: entry.submittedBy,
           entryStatus: entry.entryStatus || 'pending',
           approvedBy: entry.approvedBy || '',
           // Keep full data for other components
           id: entry.entryId,
           timestamp: convertToTimeString(entry.timestamp),
           paymentType: entry.paymentType,
           paymentDetails: entry.paymentDetails,
           bankAmount: entry.bankAmount || 0,
           totalAmount: entry.totalAmount || 0
         }));
         combinedExpenseData = [...combinedExpenseData, ...processedOtherPayments];

         // Generate cash book entries from other payments
         const otherCashEntries = processedOtherPayments.map(entry => ({
           id: `other-${entry.entryId}`,
           date: entry.date,
           particulars: "Other Payment",
           description: `Other payment - ${entry.paymentDetails || entry.paymentType || 'Other'}`,
           jfNo: `OTHER-${entry.entryId}`,
           cashAmount: entry.cashAmount || 0,
           bankAmount: entry.bankAmount || 0,
           type: 'cr',
           timestamp: entry.timestamp,
           source: 'other-payment'
         }));
         combinedCashBookEntries = [...combinedCashBookEntries, ...otherCashEntries];
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
        unionPayments: unionPayments.data || [],
        servicePayments: servicePayments.data || [],
        otherPayments: otherPayments.data || [],
        totalRecords: combinedFareData.length + combinedExpenseData.length
      });

      console.log('✅ Dashboard: All data loaded successfully');
      console.log('📊 Summary:', {
        fareRecords: combinedFareData.length,
        expenseRecords: combinedExpenseData.length,
        cashBookEntries: combinedCashBookEntries.length,
        offDays: offDays.data?.length || 0,
        unionPayments: unionPayments.data?.length || 0,
        servicePayments: servicePayments.data?.length || 0,
        otherPayments: otherPayments.data?.length || 0,
        totalRecords: combinedFareData.length + combinedExpenseData.length
      });
      console.log('🔍 Breakdown - Fuel:', fuelPayments.data?.length || 0, 
                   'Adda:', addaPayments.data?.length || 0,
                   'OffDays:', offDays.data?.length || 0,
                   'Union:', unionPayments.data?.length || 0, 
                   'Service:', servicePayments.data?.length || 0,
                   'Other:', otherPayments.data?.length || 0);

    } catch (error) {
      console.error('❌ Dashboard: Error loading data:', error);
      // Show user-friendly error message
      alert('Unable to load data from Google Sheets. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove automatic loading - only manual refresh from navbar
  // useEffect(() => {
  //   loadAllDataFromSheets();
  // }, []);

  // Listen for data refresh events instead of exposing global function
  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('🔄 Dashboard: Received data refresh event');
      // Dashboard will get updated data via props automatically
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    };

    window.addEventListener('dataRefreshed', handleDataRefresh);

    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefresh);
    };
  }, [onRefreshComplete]);
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

      {/* Data Statistics Section */}
      {dataStatistics && dataStatistics.totalRecords > 0 && (
        <div className="data-statistics-section mb-5">
          <div className="data-statistics-main-card">
            <div className="data-stats-header">
              <h4 className="data-stats-title">
                <i className="bi bi-database-fill me-3"></i>
                Data Statistics
              </h4>
              <div className="refresh-indicator">
                <i className="bi bi-arrow-clockwise me-1"></i>
                <span>Refresh #{dataStatistics.refreshCount}</span>
              </div>
            </div>

            {/* Main Statistics Grid */}
            <div className="data-stats-grid">
              <div className="data-stat-item total-records">
                <div className="stat-icon">
                  <i className="bi bi-collection"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{dataStatistics.totalRecords}</div>
                  <div className="stat-label">Total Records</div>
                  <div className="stat-trend">
                    <i className="bi bi-graph-up"></i>
                    All Entries
                  </div>
                </div>
              </div>

              <div className="data-stat-item income-records">
                <div className="stat-icon">
                  <i className="bi bi-arrow-up-circle-fill"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{dataStatistics.incomeRecords}</div>
                  <div className="stat-label">Income Records</div>
                  <div className="stat-trend">
                    <i className="bi bi-currency-rupee"></i>
                    Earnings
                  </div>
                </div>
              </div>

              <div className="data-stat-item expense-records">
                <div className="stat-icon">
                  <i className="bi bi-arrow-down-circle-fill"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{dataStatistics.expenseRecords}</div>
                  <div className="stat-label">Expense Records</div>
                  <div className="stat-trend">
                    <i className="bi bi-cash-stack"></i>
                    Payments
                  </div>
                </div>
              </div>

              <div className="data-stat-item last-updated">
                <div className="stat-icon">
                  <i className="bi bi-clock-history"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{dataStatistics.lastFetchTime || '--:--'}</div>
                  <div className="stat-label">Last Updated</div>
                  <div className="stat-trend">
                    <i className="bi bi-calendar3"></i>
                    <span className="d-none d-md-inline">{dataStatistics.lastFetchDate || 'Today'}</span>
                    <span className="d-md-none">
                      {dataStatistics.lastFetchDate ? 
                        new Date(dataStatistics.lastFetchDate).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short' 
                        }) : 
                        'Today'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="data-breakdown-section">
              <div className="breakdown-title-container">
                <h6 className="breakdown-title">
                  <i className="bi bi-pie-chart me-2"></i>
                  Data Breakdown
                </h6>
                <button 
                  className="btn btn-sm btn-outline-secondary breakdown-toggle-btn"
                  onClick={() => setShowDataBreakdown(!showDataBreakdown)}
                >
                  <i className={`bi bi-chevron-${showDataBreakdown ? 'up' : 'down'}`}></i>
                  {showDataBreakdown ? 'Hide' : 'Show'}
                </button>
              </div>
              {showDataBreakdown && (
                <div className="breakdown-grid">
                  <div className="breakdown-column">
                    <div className="breakdown-item income-type">
                      <span className="breakdown-icon">📋</span>
                      <span className="breakdown-label">Fare Receipts</span>
                      <span className="breakdown-value">{dataStatistics.dataBreakdown.fareReceipts}</span>
                    </div>
                    <div className="breakdown-item income-type">
                      <span className="breakdown-icon">🎫</span>
                      <span className="breakdown-label">Booking Entries</span>
                      <span className="breakdown-value">{dataStatistics.dataBreakdown.bookingEntries}</span>
                    </div>
                    <div className="breakdown-item neutral-type">
                      <span className="breakdown-icon">🔒</span>
                      <span className="breakdown-label">Off Days</span>
                      <span className="breakdown-value">{dataStatistics.dataBreakdown.offDays}</span>
                    </div>
                    <div className="breakdown-item expense-type">
                      <span className="breakdown-icon">⛽</span>
                      <span className="breakdown-label">Fuel Payments</span>
                      <span className="breakdown-value">{dataStatistics.dataBreakdown.fuelPayments}</span>
                    </div>
                  </div>
                  <div className="breakdown-column">
                    <div className="breakdown-item expense-type">
                      <span className="breakdown-icon">🏪</span>
                      <span className="breakdown-label">Adda Payments</span>
                      <span className="breakdown-value">{dataStatistics.dataBreakdown.addaPayments}</span>
                    </div>
                    <div className="breakdown-item expense-type">
                      <span className="breakdown-icon">🤝</span>
                      <span className="breakdown-label">Union Payments</span>
                      <span className="breakdown-value">{dataStatistics.dataBreakdown.unionPayments}</span>
                    </div>
                    <div className="breakdown-item expense-type">
                      <span className="breakdown-icon">🔧</span>
                      <span className="breakdown-label">Service Payments</span>
                      <span className="breakdown-value">{dataStatistics.dataBreakdown.servicePayments}</span>
                    </div>
                    <div className="breakdown-item expense-type">
                      <span className="breakdown-icon">💸</span>
                      <span className="breakdown-label">Other Payments</span>
                      <span className="breakdown-value">{dataStatistics.dataBreakdown.otherPayments}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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