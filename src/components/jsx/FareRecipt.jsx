import React, { useState, useEffect } from "react";
import "../css/FareRecipt.css";
import authService from '../../services/authService.js';

// Helper functions to convert ISO strings to proper format
const convertToTimeString = (timestamp) => {
  if (!timestamp) return '';

  // If it's already in H:MM:SS AM/PM format, return as is
  if (typeof timestamp === 'string' && timestamp.match(/^\d{1,2}:\d{2}:\d{2} (AM|PM)$/)) {
    return timestamp;
  }

  // If it's an ISO string from Google Sheets, convert to IST format
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
      console.warn('Error converting timestamp:', timestamp, error);
      return timestamp.split('T')[1]?.split('.')[0] || timestamp;
    }
  }

  // If it's a Date object, convert to IST time string
  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  }

  // Return as string fallback
  return String(timestamp);
};

const convertToDateString = (date) => {
  if (!date) return '';

  // If it's already in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }

  // If it's an ISO string from Google Sheets, convert to IST date
  if (typeof date === 'string' && date.includes('T')) {
    try {
      const dateObj = new Date(date);
      // Convert to IST and get date part
      const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));
      return istDate.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error converting date:', date, error);
      return date.split('T')[0];
    }
  }

  // If it's a Date object, convert to IST date string
  if (date instanceof Date) {
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
  }

  // Return as string fallback
  return String(date);
};

// Function to format time in IST
const formatISTTime = () => {
    const now = new Date();
    const istOffset = 330 * 60000; // IST is UTC+5:30
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata' // Explicitly set timezone to IST
    });
};

function FareEntry({ fareData, setFareData, setTotalEarnings, setCashBookEntries }) {
  const [activeTab, setActiveTab] = useState("daily");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyFareData, setDailyFareData] = useState({
    route: "",
    cashAmount: "",
    bankAmount: "",
    date: "",
  });

  const [bookingData, setBookingData] = useState({
    bookingDetails: "",
    cashAmount: "",
    bankAmount: "",
    dateFrom: "",
    dateTo: "",
  });

  const [offDayData, setOffDayData] = useState({
    date: "",
    reason: "",
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('🚀 Loading data from Google Sheets...');

        // Fetch all types of entries separately
        const [fareReceipts, bookingEntries, offDays] = await Promise.all([
          authService.getFareReceipts(),
          authService.getBookingEntries(),
          authService.getOffDays()
        ]);

        let allData = [];

        // Process fare receipts (daily entries)
        if (fareReceipts.success && fareReceipts.data) {
          allData = [...allData, ...fareReceipts.data.map(entry => ({
            entryId: entry.entryId,
            timestamp: convertToTimeString(entry.timestamp), // Convert any ISO strings to time-only
            date: convertToDateString(entry.date), // Convert any ISO strings to date-only
            route: entry.route,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            totalAmount: entry.totalAmount || 0,
            submittedBy: entry.submittedBy,
            type: 'daily'
          }))];
        }

        // Process booking entries
        if (bookingEntries.success && bookingEntries.data) {
          allData = [...allData, ...bookingEntries.data.map(entry => ({
            entryId: entry.entryId,
            timestamp: convertToTimeString(entry.timestamp), // Convert any ISO strings to time-only
            bookingDetails: entry.bookingDetails,
            dateFrom: convertToDateString(entry.dateFrom), // Convert any ISO strings to date-only
            dateTo: convertToDateString(entry.dateTo), // Convert any ISO strings to date-only
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            totalAmount: entry.totalAmount || 0,
            submittedBy: entry.submittedBy,
            type: 'booking'
          }))];
        }

        // Process off days
        if (offDays.success && offDays.data) {
          allData = [...allData, ...offDays.data.map(entry => ({
            entryId: entry.entryId,
            timestamp: convertToTimeString(entry.timestamp), // Convert any ISO strings to time-only
            date: convertToDateString(entry.date), // Convert any ISO strings to date-only
            reason: entry.reason,
            submittedBy: entry.submittedBy,
            cashAmount: 0,
            bankAmount: 0,
            totalAmount: 0,
            type: 'off'
          }))];
        }

        // Sort by entryId (newest first) since timestamp is now time-only string
        allData.sort((a, b) => b.entryId - a.entryId);

        console.log('✅ Data loaded successfully:', allData.length, 'entries');
        setFareData(allData);

        const total = allData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
        setTotalEarnings(total);

        // Generate cash book entries
        const cashBookEntries = allData
          .filter(entry => entry.type !== 'off')
          .map(entry => ({
            id: `fare-${entry.entryId}`,
            date: entry.date || entry.dateFrom,
            description: entry.type === 'daily' ? `Daily Collection - ${entry.route}` : `Booking - ${entry.bookingDetails}`,
            cashReceived: entry.cashAmount || 0,
            bankReceived: entry.bankAmount || 0,
            cashPaid: 0,
            bankPaid: 0,
            source: 'fare-entry',
            jfNo: `JF-${entry.entryId}`,
            submittedBy: entry.submittedBy
          }));

        setCashBookEntries(cashBookEntries);

      } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please check your internet connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setFareData, setTotalEarnings, setCashBookEntries]);

  // Function to check if a date is disabled for daily collection
  const isDailyDateDisabled = (selectedDate, selectedRoute) => {
    if (!selectedDate || !selectedRoute) return false;

    const existingDailyEntry = fareData.find(entry => 
      entry.type === 'daily' && 
      entry.date === selectedDate && 
      entry.route === selectedRoute &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    const existingBookingEntry = fareData.find(entry => 
      entry.type === 'booking' && 
      selectedDate >= entry.dateFrom && 
      selectedDate <= entry.dateTo &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    const existingOffEntry = fareData.find(entry => 
      entry.type === 'off' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    return existingDailyEntry || existingBookingEntry || existingOffEntry;
  };

  const isBookingDateDisabled = (selectedDate) => {
    if (!selectedDate) return false;

    const existingDailyEntry = fareData.find(entry => 
      entry.type === 'daily' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    const existingOffEntry = fareData.find(entry => 
      entry.type === 'off' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    return existingDailyEntry || existingOffEntry;
  };

  const isOffDayDateDisabled = (selectedDate) => {
    if (!selectedDate) return false;

    const existingDailyEntry = fareData.find(entry => 
      entry.type === 'daily' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    const existingBookingEntry = fareData.find(entry => 
      entry.type === 'booking' && 
      selectedDate >= entry.dateFrom && 
      selectedDate <= entry.dateTo &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    return existingDailyEntry || existingBookingEntry;
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const routes = [
    "Ghuraka to Bhaderwah",
    "Bhaderwah to Pul Doda", 
    "Pul Doda to Thatri",
    "Thatri to Pul Doda",
    "Pul Doda to Bhaderwah",
    "Bhaderwah to Ghuraka",
  ];

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isDailyDateDisabled(dailyFareData.date, dailyFareData.route)) {
        alert('This date is already taken for this route or conflicts with existing bookings/off days!');
        setIsLoading(false);
        return;
      }

      const cashAmount = parseInt(dailyFareData.cashAmount) || 0;
      const bankAmount = parseInt(dailyFareData.bankAmount) || 0;
      const totalAmount = cashAmount + bankAmount;
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';
      const now = new Date();
      const timeOnly = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit' 
      }); // Returns H:MM:SS AM/PM format
      const dateOnly = dailyFareData.date; // Keep date as string (YYYY-MM-DD)

      if (editingEntry) {
        // UPDATE: First update React state immediately
        const oldTotal = editingEntry.totalAmount;
        const updatedData = fareData.map(entry => 
          entry.entryId === editingEntry.entryId 
            ? { ...entry, 
                route: dailyFareData.route,
                cashAmount: cashAmount,
                bankAmount: bankAmount,
                totalAmount: totalAmount,
                date: dateOnly, // Use string date
                timestamp: timeOnly, // Update timestamp
              }
            : entry
        );

        setFareData(updatedData);
        setTotalEarnings((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setDailyFareData({ route: "", cashAmount: "", bankAmount: "", date: "" });
        setIsLoading(false);

        // Then sync to Google Sheets in background
        authService.updateFareReceipt({
          entryId: editingEntry.entryId,
          updatedData: {
            date: dateOnly, // Send date as string
            route: dailyFareData.route,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
          }
        }).catch(error => {
          console.error('Background daily update sync failed:', error);
        });

      } else {
        // ADD: First create entry and update React state immediately
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly, // Time as string (HH:MM:SS)
          type: "daily",
          route: dailyFareData.route,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          date: dateOnly, // Date as string (YYYY-MM-DD)
          submittedBy: submittedBy
        };

        const updatedData = [newEntry, ...fareData];
        setFareData(updatedData);
        setTotalEarnings((prev) => prev + totalAmount);
        setDailyFareData({ route: "", cashAmount: "", bankAmount: "", date: "" });
        setIsLoading(false);

        // Then sync to Google Sheets in background
        authService.addFareReceipt({
          entryId: newEntry.entryId,
          timestamp: timeOnly, // Send time as string
          date: dateOnly, // Send date as string
          route: dailyFareData.route,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy
        }).catch(error => {
          console.error('Background daily add sync failed:', error);
        });
      }
    } catch (error) {
      console.error('Error submitting daily fare:', error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Handle date strings directly without converting to Date objects
      const startDateStr = bookingData.dateFrom; // Keep as string (YYYY-MM-DD)
      const endDateStr = bookingData.dateTo; // Keep as string (YYYY-MM-DD)

      // Generate date range as strings
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (isBookingDateDisabled(dateStr)) {
          alert(`Date ${dateStr} conflicts with existing daily collection or off day entries!`);
          setIsLoading(false);
          return;
        }
      }

      const cashAmount = parseInt(bookingData.cashAmount) || 0;
      const bankAmount = parseInt(bookingData.bankAmount) || 0;
      const totalAmount = cashAmount + bankAmount;
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';
      const timeOnly = formatISTTime(); // IST time in H:MM:SS AM/PM format

      if (editingEntry) {
        // UPDATE: First update React state immediately
        const oldTotal = editingEntry.totalAmount;
        const updatedData = fareData.map(entry => 
          entry.entryId === editingEntry.entryId 
            ? { ...entry,
                bookingDetails: bookingData.bookingDetails,
                cashAmount: cashAmount,
                bankAmount: bankAmount,
                totalAmount: totalAmount,
                dateFrom: startDateStr, // Use string date
                dateTo: endDateStr, // Use string date
                timestamp: timeOnly, // Update timestamp
              }
            : entry
        );

        setFareData(updatedData);
        setTotalEarnings((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setBookingData({ bookingDetails: "", cashAmount: "", bankAmount: "", dateFrom: "", dateTo: "" });
        setIsLoading(false);

        // Then sync to Google Sheets in background
        authService.updateBookingEntry({
          entryId: editingEntry.entryId,
          updatedData: {
            bookingDetails: bookingData.bookingDetails,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            dateFrom: startDateStr, // Send date as string
            dateTo: endDateStr, // Send date as string
          }
        }).catch(error => {
          console.error('Background booking update sync failed:', error);
        });

      } else {
        // ADD: First create entry and update React state immediately
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly, // Time as string (HH:MM:SS)
          type: "booking",
          bookingDetails: bookingData.bookingDetails,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          dateFrom: startDateStr, // Date as string (YYYY-MM-DD)
          dateTo: endDateStr, // Date as string (YYYY-MM-DD)
          submittedBy: submittedBy
        };

        const updatedData = [newEntry, ...fareData];
        setFareData(updatedData);
        setTotalEarnings((prev) => prev + totalAmount);
        setBookingData({ bookingDetails: "", cashAmount: "", bankAmount: "", dateFrom: "", dateTo: "" });
        setIsLoading(false);

        // Then sync to Google Sheets in background
        authService.addBookingEntry({
          entryId: newEntry.entryId,
          timestamp: timeOnly, // Send time as string
          bookingDetails: bookingData.bookingDetails,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          dateFrom: startDateStr, // Send date as string
          dateTo: endDateStr, // Send date as string
          submittedBy: submittedBy
        }).catch(error => {
          console.error('Background booking add sync failed:', error);
        });
      }
    } catch (error) {
      console.error('Error submitting booking entry:', error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  const handleOffDaySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isOffDayDateDisabled(offDayData.date)) {
        alert('This date conflicts with existing daily collection or booking entries!');
        setIsLoading(false);
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';
      const now = new Date();
      const timeOnly = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit' 
      }); // Returns H:MM:SS AM/PM format
      const dateOnly = offDayData.date; // Keep date as string (YYYY-MM-DD)

      if (editingEntry) {
        // UPDATE: First update React state immediately
        const updatedData = fareData.map(entry => 
          entry.entryId === editingEntry.entryId 
            ? { ...entry, date: dateOnly, reason: offDayData.reason, timestamp: timeOnly } // Use string date and update timestamp
            : entry
        );
        setFareData(updatedData);
        setEditingEntry(null);
        setOffDayData({ date: "", reason: "" });
        setIsLoading(false);

        // Then sync to Google Sheets in background
        authService.updateOffDay({
          entryId: editingEntry.entryId,
          updatedData: {
            date: dateOnly, // Send date as string
            reason: offDayData.reason,
          }
        }).catch(error => {
          console.error('Background off day update sync failed:', error);
        });

      } else {
        // ADD: First create entry and update React state immediately
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly, // Time as string (HH:MM:SS)
          type: "off",
          date: dateOnly, // Date as string (YYYY-MM-DD)
          reason: offDayData.reason,
          cashAmount: 0,
          bankAmount: 0,
          totalAmount: 0,
          submittedBy: submittedBy
        };

        const updatedData = [newEntry, ...fareData];
        setFareData(updatedData);
        setOffDayData({ date: "", reason: "" });
        setIsLoading(false);

        // Then sync to Google Sheets in background
        authService.addOffDay({
          entryId: newEntry.entryId,
          timestamp: timeOnly, // Send time as string
          date: dateOnly, // Send date as string
          reason: offDayData.reason,
          submittedBy: submittedBy
        }).catch(error => {
          console.error('Background off day add sync failed:', error);
        });
      }
    } catch (error) {
      console.error('Error submitting off day:', error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const entryToDelete = fareData.find(entry => entry.entryId === entryId);

      if (!entryToDelete) {
        alert('Entry not found!');
        return;
      }

      console.log('🗑️ Deleting entry:', { entryId, type: entryToDelete.type });

      // DELETE: First update React state immediately for better UX
      const updatedData = fareData.filter(entry => entry.entryId !== entryId);
      setFareData(updatedData);

      if (entryToDelete && entryToDelete.totalAmount) {
        setTotalEarnings((prev) => prev - entryToDelete.totalAmount);
      }

      setCashBookEntries(prev => prev.filter(entry => entry.source === 'fare-entry' && !entry.jfNo?.includes(entryId.toString())));

      console.log('✅ Entry removed from React state immediately');

      // Then sync deletion to Google Sheets in background
      try {
        let deleteResult;
        if (entryToDelete.type === 'daily') {
          deleteResult = await authService.deleteFareReceipt({ entryId: entryToDelete.entryId });
        } else if (entryToDelete.type === 'booking') {
          deleteResult = await authService.deleteBookingEntry({ entryId: entryToDelete.entryId });
        } else if (entryToDelete.type === 'off') {
          deleteResult = await authService.deleteOffDay({ entryId: entryToDelete.entryId });
        }
        if (deleteResult.success) {
          console.log('✅ Entry successfully deleted from Google Sheets');
        } else {
          console.warn('⚠️ Delete from Google Sheets failed but entry removed locally:', deleteResult.error);
          // Don't revert the state - keep the optimistic update for better UX
        }
      } catch (syncError) {
        console.warn('⚠️ Background delete sync failed but entry removed locally:', syncError.message);
        // Don't revert the state - keep the optimistic update for better UX
      }

    } catch (error) {
      console.error('❌ Error in delete process:', error);
      alert('Error deleting entry. Please try again.');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    if (entry.type === "daily") {
      setActiveTab("daily");
      setDailyFareData({
        route: entry.route,
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
        date: entry.date,
      });
    } else if (entry.type === "booking") {
      setActiveTab("booking");
      setBookingData({
        bookingDetails: entry.bookingDetails,
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
        dateFrom: entry.dateFrom,
        dateTo: entry.dateTo,
      });
    } else if (entry.type === "off") {
      setActiveTab("off");
      setOffDayData({
        date: entry.date,
        reason: entry.reason,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setDailyFareData({ route: "", cashAmount: "", bankAmount: "", date: "" });
    setBookingData({ bookingDetails: "", cashAmount: "", bankAmount: "", dateFrom: "", dateTo: "" });
    setOffDayData({ date: "", reason: "" });
  };

  // Calculate totals for summary - only for current user
  const calculateSummaryTotals = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    const userFareData = fareData.filter(entry => 
      entry.submittedBy === currentUserName
    );

    const totalCash = userFareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
    const totalBank = userFareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
    const grandTotal = totalCash + totalBank;

    return { totalCash, totalBank, grandTotal };
  };

  const { totalCash, totalBank, grandTotal } = calculateSummaryTotals();

  return (
    <div className="fare-entry-container">
      <div className="container-fluid">
        <div className="fare-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-receipt"></i> Fare Receipt Entry</h2>
              <p>Record your daily earnings and bookings (Income)</p>
            </div>
            <div className="sync-status">
              <div className={`simple-sync-indicator ${isLoading ? 'syncing' : 'synced'}`}>
                {isLoading ? (
                  <i className="bi bi-arrow-clockwise"></i>
                ) : (
                  <i className="bi bi-check-circle"></i>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Only show when user has entries */}
        {(() => {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserName = currentUser.fullName || currentUser.username;
          const userEntries = fareData.filter(entry => 
            entry.submittedBy === currentUserName
          );

          return userEntries.length > 0 ? (
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card cash-card">
                  <div className="card-body">
                    <h6>Cash Collection</h6>
                    <h4>₹{totalCash.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card bank-card">
                  <div className="card-body">
                    <h6>Bank Transfer</h6>
                    <h4>₹{totalBank.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card total-card">
                  <div className="card-body">
                    <h6>Total Earnings</h6>
                    <h4>₹{grandTotal.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card entries-card">
                  <div className="card-body">
                    <h6>Total Entries</h6>
                    <h4>{userEntries.length}</h4>
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Tab Navigation */}
        <div className="tab-navigation mb-4">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`}
                onClick={() => setActiveTab('daily')}
              >
                <i className="bi bi-calendar-day"></i> Daily Fare
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'booking' ? 'active' : ''}`}
                onClick={() => setActiveTab('booking')}
              >
                <i className="bi bi-journal-bookmark"></i> Booking 
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'off' ? 'active' : ''}`}
                onClick={() => setActiveTab('off')}
              >
                <i className="bi bi-x-circle"></i> Off Day
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'daily' && (
            <div className="fare-form-card">
              <h4><i className="bi bi-calendar-day"></i> Daily Collection</h4>
              <form onSubmit={handleDailySubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Route</label>
                    <select
                      className="form-select"
                      value={dailyFareData.route}
                      onChange={(e) => setDailyFareData({ ...dailyFareData, route: e.target.value })}
                      required
                    >
                      <option value="">Select Route</option>
                      {routes.map((route) => (
                        <option key={route} value={route}>{route}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className={`form-control date-input ${isDailyDateDisabled(dailyFareData.date, dailyFareData.route) ? 'is-invalid' : ''}`}
                      value={dailyFareData.date}
                      onChange={(e) => setDailyFareData({ ...dailyFareData, date: e.target.value })}
                      onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                      placeholder="Select date"
                      min={getTodayDate()}
                      required
                    />
                    {isDailyDateDisabled(dailyFareData.date, dailyFareData.route) && (
                      <div className="invalid-feedback">
                        This date is already taken for this route or conflicts with existing entries!
                      </div>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cash Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={dailyFareData.cashAmount}
                      onChange={(e) => setDailyFareData({ ...dailyFareData, cashAmount: e.target.value })}
                      placeholder="Enter cash amount"
                      min="0"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bank Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={dailyFareData.bankAmount}
                      onChange={(e) => setDailyFareData({ ...dailyFareData, bankAmount: e.target.value })}
                      placeholder="Enter bank amount"
                      min="0"
                    />
                  </div>
                </div>
                <div className="amount-summary mb-3">
                  <div className="row">
                    <div className="col-4">
                      <span>Cash: ₹{parseInt(dailyFareData.cashAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <span>Bank: ₹{parseInt(dailyFareData.bankAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <strong>Total: ₹{(parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)}</strong>
                    </div>
                  </div>
                </div>
                <div className="button-group">
                  <button type="submit" className="btn fare-entry-btn" disabled={isLoading}>
                    <i className={isLoading ? "bi bi-hourglass-split" : editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                    {isLoading ? "Saving..." : editingEntry ? "Update Entry" : "Add Daily Entry"}
                  </button>
                  {editingEntry && (
                    <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                      <i className="bi bi-x-circle"></i> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="fare-form-card">
              <h4><i className="bi bi-journal-bookmark"></i> Booking Entry</h4>
              <form onSubmit={handleBookingSubmit}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Booking Details</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={bookingData.bookingDetails}
                      onChange={(e) => setBookingData({ ...bookingData, bookingDetails: e.target.value })}
                      placeholder="Enter booking details..."
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">From Date</label>
                    <input
                      type="date"
                      className={`form-control date-input ${isBookingDateDisabled(bookingData.dateFrom) ? 'is-invalid' : ''}`}
                      value={bookingData.dateFrom}
                      onChange={(e) => setBookingData({ ...bookingData, dateFrom: e.target.value })}
                      onFocus={(e) => e.target.showPicker && e.target.showPicker()}                      placeholder="Select from date"
                      min={getTodayDate()}
                      required
                    />
                    {isBookingDateDisabled(bookingData.dateFrom) && (
                      <div className="invalid-feedback">
                        This date conflicts with existing entries!
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">To Date</label>
                    <input
                      type="date"
                      className={`form-control date-input ${isBookingDateDisabled(bookingData.dateTo) ? 'is-invalid' : ''}`}
                      value={bookingData.dateTo}
                      onChange={(e) => setBookingData({ ...bookingData, dateTo: e.target.value })}
                      onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                      placeholder="Select to date"
                      min={bookingData.dateFrom || getTodayDate()}
                      required
                    />
                    {isBookingDateDisabled(bookingData.dateTo) && (
                      <div className="invalid-feedback">
                        This date conflicts with existing entries!
                      </div>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cash Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bookingData.cashAmount}
                      onChange={(e) => setBookingData({ ...bookingData, cashAmount: e.target.value })}
                      placeholder="Enter cash amount"
                      min="0"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bank Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bookingData.bankAmount}
                      onChange={(e) => setBookingData({ ...bookingData, bankAmount: e.target.value })}
                      placeholder="Enter bank amount"
                      min="0"
                    />
                  </div>
                </div>
                <div className="amount-summary mb-3">
                  <div className="row">
                    <div className="col-4">
                      <span>Cash: ₹{parseInt(bookingData.cashAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <span>Bank: ₹{parseInt(bookingData.bankAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <strong>Total: ₹{(parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)}</strong>
                    </div>
                  </div>
                </div>
                <div className="button-group">
                  <button type="submit" className="btn fare-entry-btn" disabled={isLoading}>
                    <i className={isLoading ? "bi bi-hourglass-split" : editingEntry ? "bi bi-check-circle" : "bi bi-journal-plus"}></i> 
                    {isLoading ? "Saving..." : editingEntry ? "Update Entry" : "Add Booking Entry"}
                  </button>
                  {editingEntry && (
                    <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                      <i className="bi bi-x-circle"></i> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === 'off' && (
            <div className="fare-form-card">
              <h4><i className="bi bi-x-circle"></i> Off Day Entry</h4>
              <form onSubmit={handleOffDaySubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className={`form-control date-input ${isOffDayDateDisabled(offDayData.date) ? 'is-invalid' : ''}`}
                      value={offDayData.date}
                      onChange={(e) => setOffDayData({ ...offDayData, date: e.target.value })}
                      onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                      placeholder="Select off day date"
                      min={getTodayDate()}
                      required
                    />
                    {isOffDayDateDisabled(offDayData.date) && (
                      <div className="invalid-feedback">
                        This date conflicts with existing entries!
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      value={offDayData.reason}
                      onChange={(e) => setOffDayData({ ...offDayData, reason: e.target.value })}
                      placeholder="Enter reason for off day"
                      required
                    />
                  </div>
                </div>
                <div className="button-group">
                  <button type="submit" className="btn fare-entry-btn" disabled={isLoading}>
                    <i className={isLoading ? "bi bi-hourglass-split" : editingEntry ? "bi bi-check-circle" : "bi bi-check-circle"}></i> 
                    {isLoading ? "Saving..." : editingEntry ? "Update Entry" : "Mark Day as Off"}
                  </button>
                  {editingEntry && (
                    <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                      <i className="bi bi-x-circle"></i> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Recent Entries */}
        {(() => {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserName = currentUser.fullName || currentUser.username;
          const userEntries = fareData.filter(entry => 
            entry.submittedBy === currentUserName
          );

          return userEntries.length > 0 ? (
            <div className="recent-entries mt-4">
              <h4>Recent Entries</h4>
              <div className="row">
                {userEntries.slice(0, 6).map((entry) => (
                  <div key={entry.entryId} className="col-md-6 col-lg-4 mb-3">
                    <div className="entry-card">
                      <div className="card-body">
                        <div className="entry-header">
                          <span className={`entry-type ${entry.type}`}>
{entry.type === "daily" ? "Daily" : 
                             entry.type === "booking" ? "Booking" : "Off Day"}
                          </span>
                          <div className="entry-actions">
                            <button 
                              className="btn btn-sm btn-edit" 
                              onClick={() => handleEditEntry(entry)}
                              title="Edit Entry"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-delete" 
                              onClick={() => handleDeleteEntry(entry.entryId)}
                              title="Delete Entry"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        <div className="entry-date">
                          <small className="text-muted">
                            {entry.type === "daily" && (
                              <>
                                <div>{entry.date}</div>
                                <div className="timestamp">{entry.timestamp || ''}</div>
                              </>
                            )}
                            {entry.type === "booking" && (
                              <>
                                <div>{entry.dateFrom} - {entry.dateTo}</div>
                                <div className="timestamp">{entry.timestamp || ''}</div>
                              </>
                            )}
                            {entry.type === "off" && (
                              <>
                                <div>{entry.date}</div>
                                <div className="timestamp">{entry.timestamp || ''}</div>
                              </>
                            )}
                          </small>
                        </div>
                        <div className="entry-content">
                          {entry.type === "daily" && <p>{entry.route}</p>}
                          {entry.type === "booking" && <p>{entry.bookingDetails?.substring(0, 60)}...</p>}
                          {entry.type === "off" && <p>{entry.reason}</p>}
                        </div>
                        {entry.type !== "off" && (
                          <div className="entry-amounts">
                            <div className="amount-row">
                              <span>Cash: ₹{entry.cashAmount}</span>
                              <span>Bank: ₹{entry.bankAmount}</span>
                            </div>
                            <div className="total-amount">
                              <strong>Total: ₹{entry.totalAmount}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}

export default FareEntry;