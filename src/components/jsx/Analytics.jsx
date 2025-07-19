import React, { useState, useMemo, useCallback } from "react";
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
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
);

function Analytics({ 
  fareData = [], 
  expenseData = [], 
  totalEarnings = 0, 
  totalExpenses = 0,
  cashBookEntries = [],
  allUsers = [],
  cashDeposit = [],
  dataStatistics = {},
  currentUser = {}
}) {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [entryTypeFilter, setEntryTypeFilter] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [addExpenseAdjustment, setAddExpenseAdjustment] = useState(false);
  const [addExpenseAdjustment1400, setAddExpenseAdjustment1400] = useState(false);
  const [addWeeklyExpenseAdjustment, setAddWeeklyExpenseAdjustment] = useState(false);
  const [addWeeklyExpenseAdjustment1400, setAddWeeklyExpenseAdjustment1400] = useState(false);
  const [addMonthlyExpenseAdjustment, setAddMonthlyExpenseAdjustment] = useState(false);
  const [addMonthlyExpenseAdjustment1400, setAddMonthlyExpenseAdjustment1400] = useState(false);

  // Simplified logging for better performance
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics loaded with', fareData.length, 'fare entries and', expenseData.length, 'expense entries');
  }

  // Optimized date filtering function
  const filterDataByDateRange = useCallback((data) => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'thisWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(now);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        break;
      case 'last7Days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        break;
      case 'last30Days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = new Date(now);
        break;
      case 'last3Months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        endDate = new Date(now);
        break;
      case 'custom':
        if (customDateFrom && customDateTo) {
          startDate = new Date(customDateFrom);
          endDate = new Date(customDateTo);
        } else {
          return data; // Return all data if custom dates not set
        }
        break;
      default:
        return data;
    }

    return data.filter(item => {
      // Handle different date field formats
      let itemDate;
      if (item.date) {
        itemDate = new Date(item.date);
      } else if (item.dateFrom) {
        itemDate = new Date(item.dateFrom);
      } else if (item.dateTo) {
        itemDate = new Date(item.dateTo);
      } else {
        return false;
      }

      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [dateRange, customDateFrom, customDateTo]);

  // Filter data by user
  const filterDataByUser = useCallback((data) => {
    if (userFilter === 'all') return data;
    return data.filter(item => 
      item.submittedBy === userFilter || 
      item.depositedBy === userFilter ||
      item.givenBy === userFilter ||
      item.conductorName === userFilter
    );
  }, [userFilter]);

  // Filter data by entry type
  const filterDataByEntryType = useCallback((data) => {
    if (entryTypeFilter === 'all') return data;
    return data.filter(item => item.type === entryTypeFilter || item.entryType === entryTypeFilter);
  }, [entryTypeFilter]);

  // Apply all filters
  const applyFilters = useCallback((data) => {
    return filterDataByEntryType(filterDataByUser(filterDataByDateRange(data)));
  }, [filterDataByDateRange, filterDataByUser, filterDataByEntryType]);

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const filteredFareData = applyFilters(fareData);
    const filteredExpenseData = applyFilters(expenseData);
    const filteredCashDeposit = applyFilters(cashDeposit);

    // Calculate earnings
    const dailyEarnings = filteredFareData
      .filter(entry => entry.type === 'daily')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const bookingEarnings = filteredFareData
      .filter(entry => entry.type === 'booking')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const totalFilteredEarnings = dailyEarnings + bookingEarnings;

    // Calculate expenses by type
    const fuelExpenses = filteredExpenseData
      .filter(item => item.type === 'fuel')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const addaExpenses = filteredExpenseData
      .filter(item => item.type === 'adda')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const unionExpenses = filteredExpenseData
      .filter(item => item.type === 'union')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const serviceExpenses = filteredExpenseData
      .filter(item => item.type === 'service')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const otherExpenses = filteredExpenseData
      .filter(item => item.type === 'other')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    let totalFilteredExpenses = fuelExpenses + addaExpenses + unionExpenses + serviceExpenses + otherExpenses;

    // Calculate actual days in the filtered period for expense adjustments
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'thisWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(now);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        break;
      case 'last7Days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        break;
      case 'last30Days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = new Date(now);
        break;
      case 'last3Months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        endDate = new Date(now);
        break;
      case 'custom':
        if (customDateFrom && customDateTo) {
          startDate = new Date(customDateFrom);
          endDate = new Date(customDateTo);
        } else {
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = new Date(now);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = new Date(now);
    }

    // Calculate actual days in the period (excluding future days)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const endDateForCount = endDate > today ? today : endDate;
    const actualDays = Math.max(1, Math.ceil((endDateForCount - startDate) / (1000 * 60 * 60 * 24)) + 1);

    // Apply expense adjustments to match chart calculations
    if (dateRange === 'thisMonth' || dateRange === 'last30Days' || dateRange === 'last3Months' || dateRange === 'custom') {
      // Monthly calculations
      if (addMonthlyExpenseAdjustment1400) {
        totalFilteredExpenses += (1400 * actualDays);
      }
      if (addMonthlyExpenseAdjustment) {
        totalFilteredExpenses += (1000 * actualDays);
      }
    } else if (dateRange === 'thisWeek' || dateRange === 'last7Days') {
      // Weekly calculations
      if (addWeeklyExpenseAdjustment1400) {
        totalFilteredExpenses += (1400 * actualDays);
      }
      if (addWeeklyExpenseAdjustment) {
        totalFilteredExpenses += (1000 * actualDays);
      }
    } else {
      // Daily calculations (default)
      if (addExpenseAdjustment1400) {
        totalFilteredExpenses += (1400 * actualDays);
      }
      if (addExpenseAdjustment) {
        totalFilteredExpenses += (1000 * actualDays);
      }
    }

    // Calculate cash vs bank breakdown
    const totalCash = filteredFareData.reduce((sum, item) => sum + (parseFloat(item.cashAmount) || 0), 0);
    const totalBank = filteredFareData.reduce((sum, item) => sum + (parseFloat(item.bankAmount) || 0), 0);

    const expenseCash = filteredExpenseData.reduce((sum, item) => sum + (parseFloat(item.cashAmount) || 0), 0);
    const expenseBank = filteredExpenseData.reduce((sum, item) => sum + (parseFloat(item.bankAmount) || 0), 0);

    // Calculate cash deposits total
    const totalCashDeposits = filteredCashDeposit.reduce((sum, item) => sum + (parseFloat(item.cashAmount) || 0), 0);

    const filteredProfit = totalFilteredEarnings - totalFilteredExpenses;

    // User-wise breakdown
    const userBreakdown = {};
    allUsers.forEach(user => {
      const userEarnings = filteredFareData
        .filter(entry => entry.submittedBy === user.name)
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      const userExpenses = filteredExpenseData
        .filter(entry => entry.submittedBy === user.name)
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      userBreakdown[user.name] = {
        earnings: userEarnings,
        expenses: userExpenses,
        profit: userEarnings - userExpenses,
        fixedCash: user.fixedCash || 0
      };
    });

    return {
      earnings: totalFilteredEarnings,
      dailyEarnings,
      bookingEarnings,
      expenses: totalFilteredExpenses,
      profit: filteredProfit,
      profitMargin: totalFilteredEarnings > 0 ? (filteredProfit / totalFilteredEarnings) * 100 : 0,
      breakdown: {
        fuel: fuelExpenses,
        adda: addaExpenses,
        union: unionExpenses,
        service: serviceExpenses,
        other: otherExpenses
      },
      cashVsBank: {
        incomeCash: totalCash,
        incomeBank: totalBank,
        expenseCash,
        expenseBank,
        cashDeposits: totalCashDeposits
      },
      userBreakdown,
      entryStats: {
        totalEntries: filteredFareData.length + filteredExpenseData.length,
        fareEntries: filteredFareData.length,
        expenseEntries: filteredExpenseData.length,
        offDays: filteredFareData.filter(entry => entry.type === 'off').length
      }
    };
  }, [fareData, expenseData, cashDeposit, allUsers, dateRange, customDateFrom, customDateTo, userFilter, entryTypeFilter]);

  // Enhanced charts data
  const expenseBreakdownData = useMemo(() => ({
    labels: ['⛽ Fuel', '🏪 Adda', '🤝 Union', '🔧 Service', '📦 Other'],
    datasets: [
      {
        data: [
          analytics.breakdown.fuel,
          analytics.breakdown.adda,
          analytics.breakdown.union,
          analytics.breakdown.service,
          analytics.breakdown.other
        ],
        backgroundColor: [
          '#e74c3c', // Red for fuel
          '#3498db', // Blue for adda
          '#f39c12', // Orange for union
          '#2ecc71', // Green for service
          '#9b59b6'  // Purple for other
        ],
        borderWidth: 4,
        borderColor: '#ffffff',
        hoverBorderWidth: 6,
        hoverOffset: 15,
      },
    ],
  }), [analytics.breakdown]);

  // User-wise performance chart
  const userPerformanceData = useMemo(() => {
    const userNames = Object.keys(analytics.userBreakdown);
    const userEarnings = userNames.map(name => analytics.userBreakdown[name].earnings);
    const userExpenses = userNames.map(name => analytics.userBreakdown[name].expenses);

    return {
      labels: userNames,
      datasets: [
        {
          label: '💰 Earnings',
          data: userEarnings,
          backgroundColor: 'rgba(46, 213, 115, 0.8)',
          borderColor: '#2ed573',
          borderWidth: 2,
        },
        {
          label: '💸 Expenses',
          data: userExpenses,
          backgroundColor: 'rgba(255, 107, 107, 0.8)',
          borderColor: '#ff6b6b',
          borderWidth: 2,
        },
      ],
    };
  }, [analytics.userBreakdown]);

  // Enhanced Daily trend chart with swiper support
  const dailyTrendData = useMemo(() => {
    // Get date range based on filter
    const now = new Date();
    let startDate, endDate, dayCount;

    switch (dateRange) {
      case 'thisWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(now);
        dayCount = 7;
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        break;
      case 'last7Days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        dayCount = 7;
        break;
      case 'last30Days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = new Date(now);
        dayCount = 30;
        break;
      case 'last3Months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        endDate = new Date(now);
        dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        break;
      case 'custom':
        if (customDateFrom && customDateTo) {
          startDate = new Date(customDateFrom);
          endDate = new Date(customDateTo);
          dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        } else {
          // Default to last 14 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 14);
          endDate = new Date(now);
          dayCount = 14;
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 14);
        endDate = new Date(now);
        dayCount = 14;
    }

    // Generate array of dates (most recent first - left to right)
    const dateArray = Array.from({length: dayCount}, (_, i) => {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    const dailyData = dateArray.map(date => {
      // Use direct props data for consistent calculations
      const fareDataForDay = fareData.filter(entry => {
        const entryDate = entry.date || entry.dateFrom;
        return entryDate === date && entry.type !== 'off';
      });

      const expenseDataForDay = expenseData.filter(entry => 
        entry.date === date
      );

      const dayEarnings = fareDataForDay
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      let dayExpenses = expenseDataForDay
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      // Add ₹1400 to expenses if first checkbox is checked
      if (addExpenseAdjustment1400) {
        dayExpenses += 1400;
      }

      // Add ₹1000 to expenses if second checkbox is checked
      if (addExpenseAdjustment) {
        dayExpenses += 1000;
      }

      return {
        date,
        earnings: dayEarnings,
        expenses: dayExpenses,
        profit: dayEarnings - dayExpenses
      };
    });

    // Mobile optimization: Create slides for chunks of data
    const isMobile = window.innerWidth <= 768;
    const daysPerSlide = isMobile ? 15 : dayCount; // 15 days per slide on mobile
    const slides = [];

    if (isMobile && dayCount > 15) {
      // Create multiple slides for mobile
      for (let i = 0; i < dayCount; i += daysPerSlide) {
        const slideData = dailyData.slice(i, i + daysPerSlide);
        const backgroundColors = slideData.map(d => 
          d.profit >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 107, 107, 0.3)'
        );

        const borderColors = slideData.map(d => 
          d.profit >= 0 ? '#2ed573' : '#ff6b6b'
        );

        slides.push({
          labels: slideData.map(d => new Date(d.date).toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric'
          })),
          datasets: [
            {
              label: '📈 Daily Profit',
              data: slideData.map(d => d.profit),
              borderColor: borderColors,
              backgroundColor: backgroundColors,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: borderColors,
              pointBorderColor: borderColors,
              pointRadius: 4,
              pointHoverRadius: 6,
              segment: {
                borderColor: function(ctx) {
                  const currentProfit = ctx.p0.parsed.y;
                  return currentProfit >= 0 ? '#2ed573' : '#ff6b6b';
                },
                backgroundColor: function(ctx) {
                  const currentProfit = ctx.p0.parsed.y;
                  return currentProfit >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 107, 107, 0.3)';
                }
              }
            },
          ]
        });
      }
    } else {
      // Single slide for desktop or small data
      const backgroundColors = dailyData.map(d => 
        d.profit >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 107, 107, 0.3)'
      );

      const borderColors = dailyData.map(d => 
        d.profit >= 0 ? '#2ed573' : '#ff6b6b'
      );

      slides.push({
        labels: dailyData.map(d => new Date(d.date).toLocaleDateString('en-IN', { 
          month: 'short', 
          day: 'numeric',
          ...(dayCount > 30 && { year: '2-digit' })
        })),
        datasets: [
          {
            label: '📈 Daily Profit',
            data: dailyData.map(d => d.profit),
            borderColor: borderColors,
            backgroundColor: backgroundColors,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: borderColors,
            pointBorderColor: borderColors,
            pointRadius: 4,
            pointHoverRadius: 6,
            segment: {
              borderColor: function(ctx) {
                const currentProfit = ctx.p0.parsed.y;
                return currentProfit >= 0 ? '#2ed573' : '#ff6b6b';
              },
              backgroundColor: function(ctx) {
                const currentProfit = ctx.p0.parsed.y;
                return currentProfit >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 107, 107, 0.3)';
              }
            }
          },
        ]
      });
    }

    return {
      slides,
      dailyDataCount: dayCount,
      totalSlides: slides.length,
      daysPerSlide,
      isMobile
    };
  }, [fareData, expenseData, dateRange, customDateFrom, customDateTo, addExpenseAdjustment, addExpenseAdjustment1400]);

  // Weekly Profit Chart Data
  const weeklyTrendData = useMemo(() => {
    const now = new Date();
    const weeksToShow = 12; // Show last 12 weeks

    const weeklyData = [];

    // Generate weeks from newest to oldest (most recent on left)
    for (let i = 0; i < weeksToShow; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0); // Set to start of day
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999); // Set to end of day

      // For current week, use today as end date instead of end of week
      const actualEndDate = i === 0 ? new Date(now) : new Date(weekEnd);
      if (i === 0) {
        actualEndDate.setHours(23, 59, 59, 999);
      }

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = actualEndDate.toISOString().split('T')[0];

      // Use direct props data instead of filtered data for accurate calculations
      const fareDataForWeek = fareData.filter(entry => {
        const entryDate = entry.date || entry.dateFrom;
        if (!entryDate) return false;
        
        const entryDateObj = new Date(entryDate + 'T00:00:00');
        const isInWeekRange = entryDateObj >= weekStart && entryDateObj <= actualEndDate;
        const isValidEntry = entry.type !== 'off';
        
        return isInWeekRange && isValidEntry;
      });

      const expenseDataForWeek = expenseData.filter(entry => {
        if (!entry.date) return false;
        
        const entryDateObj = new Date(entry.date + 'T00:00:00');
        const isInWeekRange = entryDateObj >= weekStart && entryDateObj <= actualEndDate;
        
        return isInWeekRange;
      });

      // Calculate week earnings from direct props data
      const weekEarnings = fareDataForWeek
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      // Calculate week expenses from direct props data
      let weekExpenses = expenseDataForWeek
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      // Calculate actual days in the week period (excluding future days)
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const endDateForCount = actualEndDate > today ? today : actualEndDate;
      const actualDaysInWeek = Math.max(1, Math.ceil((endDateForCount - weekStart) / (1000 * 60 * 60 * 24)) + 1);
      
      // Add weekly adjustments (actual days * adjustment amounts)
      if (addWeeklyExpenseAdjustment1400) {
        weekExpenses += (1400 * actualDaysInWeek);
      }

      if (addWeeklyExpenseAdjustment) {
        weekExpenses += (1000 * actualDaysInWeek);
      }

      weeklyData.push({
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        earnings: weekEarnings,
        expenses: weekExpenses,
        profit: weekEarnings - weekExpenses,
        label: `${weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${actualEndDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
        daysInWeek: actualDaysInWeek
      });
    }

    const backgroundColors = weeklyData.map(d => 
      d.profit >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 107, 107, 0.3)'
    );

    const borderColors = weeklyData.map(d => 
      d.profit >= 0 ? '#2ed573' : '#ff6b6b'
    );

    return {
      labels: weeklyData.map(d => d.label),
      datasets: [
        {
          label: '📊 Weekly Profit',
          data: weeklyData.map(d => d.profit),
          borderColor: borderColors,
          backgroundColor: backgroundColors,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: borderColors,
          pointBorderColor: borderColors,
          pointRadius: 4,
          pointHoverRadius: 6,
          segment: {
            borderColor: function(ctx) {
              const currentProfit = ctx.p0.parsed.y;
              return currentProfit >= 0 ? '#2ed573' : '#ff6b6b';
            },
            backgroundColor: function(ctx) {
              const currentProfit = ctx.p0.parsed.y;
              return currentProfit >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 107, 107, 0.3)';
            }
          }
        },
      ]
    };
  }, [fareData, expenseData, addWeeklyExpenseAdjustment, addWeeklyExpenseAdjustment1400]);

  // Monthly Profit Chart Data
  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    const monthsToShow = 12; // Show last 12 months

    const monthlyData = [];

    // Generate months from newest to oldest (most recent on left)
    for (let i = 0; i < monthsToShow; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0); // Set to start of day
      
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999); // Set to end of day

      // For current month, use today as end date instead of end of month
      const actualEndDate = i === 0 ? new Date(now) : new Date(monthEnd);
      if (i === 0) {
        actualEndDate.setHours(23, 59, 59, 999);
      }

      const monthStartStr = monthStart.toISOString().split('T')[0];
      const monthEndStr = actualEndDate.toISOString().split('T')[0];

      // Use direct props data instead of filtered data for accurate calculations
      const fareDataForMonth = fareData.filter(entry => {
        const entryDate = entry.date || entry.dateFrom;
        if (!entryDate) return false;
        
        const entryDateObj = new Date(entryDate + 'T00:00:00');
        const isInMonthRange = entryDateObj >= monthStart && entryDateObj <= actualEndDate;
        const isValidEntry = entry.type !== 'off';
        
        return isInMonthRange && isValidEntry;
      });

      const expenseDataForMonth = expenseData.filter(entry => {
        if (!entry.date) return false;
        
        const entryDateObj = new Date(entry.date + 'T00:00:00');
        const isInMonthRange = entryDateObj >= monthStart && entryDateObj <= actualEndDate;
        
        return isInMonthRange;
      });

      // Calculate month earnings from direct props data
      const monthEarnings = fareDataForMonth
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      // Calculate month expenses from direct props data
      let monthExpenses = expenseDataForMonth
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      // Calculate actual days in the period (excluding future days)
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const endDateForCount = actualEndDate > today ? today : actualEndDate;
      const actualDays = Math.max(1, Math.ceil((endDateForCount - monthStart) / (1000 * 60 * 60 * 24)) + 1);
      
      // Add monthly adjustments (actual days * adjustment amounts)
      if (addMonthlyExpenseAdjustment1400) {
        monthExpenses += (1400 * actualDays);
      }

      if (addMonthlyExpenseAdjustment) {
        monthExpenses += (1000 * actualDays);
      }

      const monthProfit = monthEarnings - monthExpenses;

      monthlyData.push({
        monthStart: monthStartStr,
        monthEnd: monthEndStr,
        earnings: monthEarnings,
        expenses: monthExpenses,
        profit: monthProfit,
        label: monthStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        daysInMonth: actualDays
      });
    }

    const backgroundColors = monthlyData.map(d => 
      d.profit >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 107, 107, 0.3)'
    );

    const borderColors = monthlyData.map(d => 
      d.profit >= 0 ? '#2ed573' : '#ff6b6b'
    );

    return {
      labels: monthlyData.map(d => d.label),
      datasets: [
        {
          label: '📅 Monthly Profit',
          data: monthlyData.map(d => d.profit),
          borderColor: borderColors,
          backgroundColor: backgroundColors,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: borderColors,
          pointBorderColor: borderColors,
          pointRadius: 4,
          pointHoverRadius: 6,
          segment: {
            borderColor: function(ctx) {
              const currentProfit = ctx.p0.parsed.y;
              return currentProfit >= 0 ? '#2ed573' : '#ff6b6b';
            },
            backgroundColor: function(ctx) {
              const currentProfit = ctx.p0.parsed.y;
              return currentProfit >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 107, 107, 0.3)';
            }
          }
        },
      ]
    };
  }, [fareData, expenseData, addMonthlyExpenseAdjustment, addMonthlyExpenseAdjustment1400]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const color = value >= 0 ? '🟢' : '🔴';
            return `${color} ${context.dataset.label}: ₹${value?.toLocaleString('en-IN') || context.parsed?.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: false,
          maxTicksLimit: dailyTrendData.dailyDataCount > 30 ? 15 : dailyTrendData.dailyDataCount
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            const sign = value >= 0 ? '+' : '';
            return sign + '₹' + value.toLocaleString('en-IN');
          }
        },
        grid: {
          color: function(context) {
            return context.tick.value === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
          },
          lineWidth: function(context) {
            return context.tick.value === 0 ? 2 : 1;
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  // Simplified chart options for better performance - hide all axis labels
  const trendChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend also for cleaner look
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const color = value >= 0 ? '🟢' : '🔴';
            const date = context.label;
            return `${color} ${date}: ₹${value?.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false, // Hide X-axis completely (dates)
      },
      y: {
        display: false, // Hide Y-axis completely (values)
      },
    },
  }), []);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="fade-in">
      {/* Header with toggle buttons */}
      <div className="analytics-header">
        <h2>
          <i className="bi bi-graph-up me-2"></i>
          Advanced Analytics
        </h2>
        <p>Comprehensive data analysis and insights</p>

        {/* Toggle Buttons */}
        <div className="filter-toggle-section">
          <button 
            className="btn btn-outline-primary btn-sm filter-toggle-btn me-2"
            onClick={() => setShowFilter(!showFilter)}
          >
            <i className={`bi ${showFilter ? 'bi-eye-slash' : 'bi-funnel'}`}></i>
            {showFilter ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button 
            className="btn btn-outline-info btn-sm filter-toggle-btn"
            onClick={() => setShowSummary(!showSummary)}
          >
            <i className={`bi ${showSummary ? 'bi-eye-slash' : 'bi-bar-chart'}`}></i>
            {showSummary ? 'Hide Cards' : 'Show Cards'}
          </button>
        </div>
      </div>

      {/* Advanced Filter Controls */}
      {showFilter && (
        <div className="analytics-filter-section">
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Date Range</label>
              <select 
                className="form-select" 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="last7Days">Last 7 Days</option>
                <option value="last30Days">Last 30 Days</option>
                <option value="last3Months">Last 3 Months</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div className="col-md-4">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                  />
                </div>
              </>
            )}


          </div>
        </div>
      )}

      {/* Enhanced Key Metrics Cards */}
      {showSummary && (
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-2">
            <div className="analytics-stats-card">
              <div className="card-body text-center">
                <h6 className="card-title text-success">Total Earnings</h6>
                <h4 className="card-text">₹{analytics.earnings.toLocaleString()}</h4>
                <small className="text-muted">
                  Daily: ₹{analytics.dailyEarnings.toLocaleString()} | 
                  Booking: ₹{analytics.bookingEarnings.toLocaleString()}
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="analytics-stats-card">
              <div className="card-body text-center">
                <h6 className="card-title text-danger">Total Expenses</h6>
                <h4 className="card-text">₹{analytics.expenses.toLocaleString()}</h4>
                <small className="text-muted">
                  {analytics.entryStats.expenseEntries} entries
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="analytics-stats-card">
              <div className="card-body text-center">
                <h6 className="card-title text-primary">Net Profit</h6>
                <h4 className="card-text">₹{analytics.profit.toLocaleString()}</h4>
                <small className={analytics.profit > 0 ? "text-success" : "text-danger"}>
                  {analytics.profitMargin.toFixed(1)}% margin
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="analytics-stats-card">
              <div className="card-body text-center">
                <h6 className="card-title text-info">Cash vs Bank</h6>
                <h4 className="card-text">₹{analytics.cashVsBank.incomeCash.toLocaleString()}</h4>
                <small className="text-muted">
                  Cash Income
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="analytics-stats-card">
              <div className="card-body text-center">
                <h6 className="card-title text-warning">Total Entries</h6>
                <h4 className="card-text">{analytics.entryStats.totalEntries}</h4>
                <small className="text-muted">
                  {analytics.entryStats.fareEntries} income | {analytics.entryStats.expenseEntries} expense
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="analytics-stats-card">
              <div className="card-body text-center">
                <h6 className="card-title text-secondary">Cash Deposits</h6>
                <h4 className="card-text">₹{analytics.cashVsBank.cashDeposits.toLocaleString()}</h4>
                <small className="text-muted">
                  Bank deposits
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Daily Profit Chart */}
        <div className="col-12">
          <div className="analytics-chart-card">
            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                <div className="d-flex align-items-center flex-wrap">
                  <h5 className="mb-0 flex-shrink-1 me-1">
                    <i className="bi bi-line-chart me-2"></i>
                    Daily Profit 
                    <small className="text-muted ms-2 d-none d-md-inline">
                      ({dailyTrendData.dailyDataCount} days)
                    </small>
                  </h5>
                  <div className="d-flex gap-2 align-items-center">
                    {addExpenseAdjustment && (
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="expenseAdjustment1400"
                          checked={addExpenseAdjustment1400}
                          onChange={(e) => {
                            setAddExpenseAdjustment1400(e.target.checked);
                          }}
                        />
                      </div>
                    )}
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="expenseAdjustment"
                        checked={addExpenseAdjustment}
                        onChange={(e) => {
                          setAddExpenseAdjustment(e.target.checked);
                          // When 1000 checkbox is unchecked, hide and uncheck 1400
                          if (!e.target.checked) {
                            setAddExpenseAdjustment1400(false);
                          }
                        }}
                      />
                    </div>
                  </div>
              </div>

              {/* Navigation Controls for Mobile */}
              {dailyTrendData.isMobile && dailyTrendData.totalSlides > 1 && (
                <div className="d-flex align-items-center gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary swiper-btn-prev"
                    type="button"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <small className="text-muted">
                    {currentSlide + 1}/{dailyTrendData.totalSlides}
                  </small>
                  <button 
                    className="btn btn-sm btn-outline-primary swiper-btn-next"
                    type="button"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}

              {!dailyTrendData.isMobile && dailyTrendData.dailyDataCount > 30 && (
                <small className="text-muted d-none d-lg-block">
                  <i className="bi bi-mouse me-1"></i>
                  Scroll/Zoom to view all data
                </small>
              )}
            </div>

            <div style={{ 
              height: 'calc(100% - 60px)', 
              minHeight: window.innerWidth <= 576 ? '280px' : '340px',
              width: '100%',
              position: 'relative'
            }}>
              {dailyTrendData.isMobile && dailyTrendData.totalSlides > 1 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={10}
                  slidesPerView={1}
                  navigation={{
                    prevEl: '.swiper-btn-prev',
                    nextEl: '.swiper-btn-next',
                  }}
                  pagination={{ 
                    clickable: true,
                    el: '.swiper-pagination-custom'
                  }}
                  onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
                  style={{ height: '100%' }}
                  className="chart-swiper"
                >
                  {dailyTrendData.slides.map((slideData, index) => (
                    <SwiperSlide key={index}>
                      <div style={{ height: '100%', padding: '0 5px' }}>
                        <Line 
                          data={slideData} 
                          options={{
                            ...trendChartOptions,
                            responsive: true,
                            maintainAspectRatio: false,
                            layout: {
                              padding: {
                                left: 5,
                                right: 5,
                                top: 5,
                                bottom: 15
                              }
                            }
                          }} 
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>) : (
                <Line 
                  data={dailyTrendData.slides[0]} 
                  options={{
                    ...trendChartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                      padding: {
                        left: 5,
                        right: 5,
                        top: 5,
                        bottom: 5
                      }
                    }
                  }} 
                />
              )}

              {/* Custom pagination dots for mobile */}
              {dailyTrendData.isMobile && dailyTrendData.totalSlides > 1 && (
                <div className="swiper-pagination-custom"></div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Profit Chart */}
        <div className="col-12">
          <div className="analytics-chart-card">
            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
              <div className="d-flex align-items-center flex-wrap">
                <h5 className="mb-0 flex-shrink-1 me-1">
                  <i className="bi bi-bar-chart me-2"></i>
                  Weekly Profit 
                  <small className="text-muted ms-2 d-none d-md-inline">
                    (Last 12 weeks)
                  </small>
                </h5>
                <div className="d-flex gap-2 align-items-center">
                    {addWeeklyExpenseAdjustment && (
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="weeklyExpenseAdjustment1400"
                          checked={addWeeklyExpenseAdjustment1400}
                          onChange={(e) => {
                            setAddWeeklyExpenseAdjustment1400(e.target.checked);
                          }}
                        />
                      </div>
                    )}
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="weeklyExpenseAdjustment"
                        checked={addWeeklyExpenseAdjustment}
                        onChange={(e) => {
                          setAddWeeklyExpenseAdjustment(e.target.checked);
                          if (!e.target.checked) {
                            setAddWeeklyExpenseAdjustment1400(false);
                          }
                        }}
                      />
                    </div>
                  </div>
              </div>
            </div>

            <div style={{ 
              height: 'calc(100% - 60px)', 
              minHeight: window.innerWidth <= 576 ? '280px' : '340px',
              width: '100%',
              position: 'relative'
            }}>
              <Line 
                data={weeklyTrendData} 
                options={{
                  ...trendChartOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: {
                      left: 5,
                      right: 5,
                      top: 5,
                      bottom: 5
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Monthly Profit Chart */}
        <div className="col-12">
          <div className="analytics-chart-card">
            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
              <div className="d-flex align-items-center flex-wrap">
                <h5 className="mb-0 flex-shrink-1 me-1">
                  <i className="bi bi-calendar-month me-2"></i>
                  Monthly Profit 
                  <small className="text-muted ms-2 d-none d-md-inline">
                    (Last 12 months)
                  </small>
                </h5>
                <div className="d-flex gap-2 align-items-center">
                    {addMonthlyExpenseAdjustment && (
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="monthlyExpenseAdjustment1400"
                          checked={addMonthlyExpenseAdjustment1400}
                          onChange={(e) => {
                            setAddMonthlyExpenseAdjustment1400(e.target.checked);
                          }}
                        />
                      </div>
                    )}
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="monthlyExpenseAdjustment"
                        checked={addMonthlyExpenseAdjustment}
                        onChange={(e) => {
                          setAddMonthlyExpenseAdjustment(e.target.checked);
                          if (!e.target.checked) {
                            setAddMonthlyExpenseAdjustment1400(false);
                          }
                        }}
                      />
                    </div>
                  </div>
              </div>
            </div>

            <div style={{ 
              height: 'calc(100% - 60px)', 
              minHeight: window.innerWidth <= 576 ? '280px' : '340px',
              width: '100%',
              position: 'relative'
            }}>
              <Line 
                data={monthlyTrendData} 
                options={{
                  ...trendChartOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: {
                      left: 5,
                      right: 5,
                      top: 5,
                      bottom: 5
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>




    </div>
  );
}

export default Analytics;