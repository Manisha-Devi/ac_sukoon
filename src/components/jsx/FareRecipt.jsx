import React, { useState, useEffect } from "react";
import "../css/FareRecipt.css";
import hybridDataService from '../../services/hybridDataService.js';
import localStorageService from '../../services/localStorageService.js';

function FareEntry({ fareData, setFareData, setTotalEarnings, setCashBookEntries }) {
  const [activeTab, setActiveTab] = useState("daily");
  const [editingEntry, setEditingEntry] = useState(null);
  const [syncStatus, setSyncStatus] = useState(hybridDataService.getSyncStatus());
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

  // Initialize data from localStorage first
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        console.log('🚀 Loading data from localStorage for immediate UI...');

        // Load from localStorage immediately for instant UI
        const localData = localStorageService.loadFareData();
        console.log('📂 Loaded from localStorage:', localData.length, 'entries');

        setFareData(localData);

        // Calculate total earnings from localStorage data
        const total = localData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
        setTotalEarnings(total);

        console.log('💰 Total earnings calculated from localStorage:', total);

        // Start background sync but don't wait for it
        if (hybridDataService.isOnline) {
          hybridDataService.backgroundSync().catch(error => {
            console.error('⚠️ Background sync failed:', error);
          });
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [setFareData, setTotalEarnings]);

  // Update sync status periodically and on changes
  useEffect(() => {
    const updateSyncStatus = () => {
      const newStatus = hybridDataService.getSyncStatus();
      setSyncStatus(newStatus);
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 1000); // Update every 1 second for better responsiveness

    // Listen for custom sync status changes
    const handleSyncStatusChange = () => {
      updateSyncStatus();
    };

    // Listen for data updates from background sync
    const handleDataUpdate = (event) => {
      console.log('📱 Background sync completed, loading fresh data from localStorage...');

      // Always load from localStorage for consistent UI
      const freshLocalData = localStorageService.loadFareData();
      console.log('📂 Fresh data from localStorage:', freshLocalData.length, 'entries');

      setFareData(freshLocalData);

      // Calculate total earnings from localStorage
      const total = freshLocalData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
      setTotalEarnings(total);

      // Update sync status immediately
      updateSyncStatus();
    };

    window.addEventListener('syncStatusChanged', handleSyncStatusChange);
    window.addEventListener('dataUpdated', handleDataUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('syncStatusChanged', handleSyncStatusChange);
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, [setFareData, setTotalEarnings]);

  // Function to check if a date is disabled for daily collection
  const isDailyDateDisabled = (selectedDate, selectedRoute) => {
    if (!selectedDate || !selectedRoute) return false;

    // Check if same route and date already exists in daily entries
    const existingDailyEntry = fareData.find(entry => 
      entry.type === 'daily' && 
      entry.date === selectedDate && 
      entry.route === selectedRoute &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    // Check if date is used in booking entries
    const existingBookingEntry = fareData.find(entry => 
      entry.type === 'booking' && 
      selectedDate >= entry.dateFrom && 
      selectedDate <= entry.dateTo &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    // Check if date is used in off day entries
    const existingOffEntry = fareData.find(entry => 
      entry.type === 'off' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    return existingDailyEntry || existingBookingEntry || existingOffEntry;
  };

  // Function to check if a date is disabled for booking
  const isBookingDateDisabled = (selectedDate) => {
    if (!selectedDate) return false;

    // Check if date is used in daily entries
    const existingDailyEntry = fareData.find(entry => 
      entry.type === 'daily' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    // Check if date is used in off day entries
    const existingOffEntry = fareData.find(entry => 
      entry.type === 'off' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    return existingDailyEntry || existingOffEntry;
  };

  // Function to check if a date is disabled for off day
  const isOffDayDateDisabled = (selectedDate) => {
    if (!selectedDate) return false;

    // Check if date is used in daily entries
    const existingDailyEntry = fareData.find(entry => 
      entry.type === 'daily' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    // Check if date is used in booking entries
    const existingBookingEntry = fareData.find(entry => 
      entry.type === 'booking' && 
      selectedDate >= entry.dateFrom && 
      selectedDate <= entry.dateTo &&
      (!editingEntry || entry.entryId !== editingEntry.entryId)
    );

    return existingDailyEntry || existingBookingEntry;
  };

  // Function to get min date for date inputs (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Function to get disabled dates for HTML date input
  const getDisabledDatesForDaily = () => {
    if (!dailyFareData.route) return [];

    const disabledDates = [];
    fareData.forEach(entry => {
      if (editingEntry && entry.entryId === editingEntry.entryId) return;

      if (entry.type === 'daily' && entry.route === dailyFareData.route) {
        disabledDates.push(entry.date);
      } else if (entry.type === 'booking') {
        const startDate = new Date(entry.dateFrom);
        const endDate = new Date(entry.dateTo);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          disabledDates.push(d.toISOString().split('T')[0]);
        }
      } else if (entry.type === 'off') {
        disabledDates.push(entry.date);
      }
    });

    return disabledDates;
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
      // Validate if date is disabled
      if (isDailyDateDisabled(dailyFareData.date, dailyFareData.route)) {
        alert('This date is already taken for this route or conflicts with existing bookings/off days!');
        return;
      }

      const cashAmount = parseInt(dailyFareData.cashAmount) || 0;
      const bankAmount = parseInt(dailyFareData.bankAmount) || 0;
      const totalAmount = cashAmount + bankAmount;

      if (editingEntry) {
        // Update existing entry using hybrid service
        const oldTotal = editingEntry.totalAmount;
        const result = await hybridDataService.updateFareEntry(editingEntry.entryId, {
          route: dailyFareData.route,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          date: dailyFareData.date,
        }, fareData);

        if (result.success) {
          // UI instantly updated with localStorage data
          setFareData(result.data);
          setTotalEarnings((prev) => prev - oldTotal + totalAmount);
          setEditingEntry(null);
          console.log('✅ Daily entry updated instantly - UI updated!');
        }
      } else {
        // Create new entry using hybrid service
        const newEntryData = {
          type: "daily",
          route: dailyFareData.route,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          date: dailyFareData.date,
        };

        const result = await hybridDataService.addFareEntry(newEntryData, fareData);

        if (result.success) {
          // UI instantly updated with localStorage data
          setFareData(result.data);
          setTotalEarnings((prev) => prev + totalAmount);
          console.log('✅ Daily entry added instantly - UI updated!');
        }
      }
      setDailyFareData({ route: "", cashAmount: "", bankAmount: "", date: "" });
    } catch (error) {
      console.error('Error submitting daily fare:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate date range for conflicts
      const startDate = new Date(bookingData.dateFrom);
      const endDate = new Date(bookingData.dateTo);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (isBookingDateDisabled(dateStr)) {
          alert(`Date ${dateStr} conflicts with existing daily collection or off day entries!`);
          return;
        }
      }

      const cashAmount = parseInt(bookingData.cashAmount) || 0;
      const bankAmount = parseInt(bookingData.bankAmount) || 0;
      const totalAmount = cashAmount + bankAmount;

      if (editingEntry) {
        // Update existing entry using hybrid service
        const oldTotal = editingEntry.totalAmount;
        const result = await hybridDataService.updateFareEntry(editingEntry.entryId, {
          bookingDetails: bookingData.bookingDetails,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          dateFrom: bookingData.dateFrom,
          dateTo: bookingData.dateTo,
        }, fareData);

        if (result.success) {
          // UI instantly updated with localStorage data
          setFareData(result.data);
          setTotalEarnings((prev) => prev - oldTotal + totalAmount);
          setEditingEntry(null);
          console.log('✅ Booking entry updated instantly - UI updated!');
        }
      } else {
        // Create new entry using hybrid service
        const newEntryData = {
          type: "booking",
          bookingDetails: bookingData.bookingDetails,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          dateFrom: bookingData.dateFrom,
          dateTo: bookingData.dateTo,
        };

        const result = await hybridDataService.addFareEntry(newEntryData, fareData);

        if (result.success) {
          // UI instantly updated with localStorage data
          setFareData(result.data);
          setTotalEarnings((prev) => prev + totalAmount);
          console.log('✅ Booking entry added instantly - UI updated!');
        }
      }
      setBookingData({ bookingDetails: "", cashAmount: "", bankAmount: "", dateFrom: "", dateTo: "" });
    } catch (error) {
      console.error('Error submitting booking entry:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOffDaySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate if date is disabled
      if (isOffDayDateDisabled(offDayData.date)) {
        alert('This date conflicts with existing daily collection or booking entries!');
        return;
      }

      if (editingEntry) {
        // Update existing entry using hybrid service
        const result = await hybridDataService.updateFareEntry(editingEntry.entryId, {
          date: offDayData.date,
          reason: offDayData.reason
        }, fareData);

        if (result.success) {
          setFareData(result.data);
          setEditingEntry(null);
        }
      } else {
        // Create new entry using hybrid service
        const newEntryData = {
          type: "off",
          date: offDayData.date,
          reason: offDayData.reason,
          cashAmount: 0,
          bankAmount: 0,
          totalAmount: 0,
        };

        const result = await hybridDataService.addFareEntry(newEntryData, fareData);

        if (result.success) {
          // UI instantly updated with localStorage data
          setFareData(result.data);
          console.log('✅ Off day entry added instantly - UI updated!');
        }
      }
      setOffDayData({ date: "", reason: "" });
    } catch (error) {
      console.error('Error submitting off day:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const entryToDelete = fareData.find(entry => entry.entryId === entryId);

      const result = await hybridDataService.deleteFareEntry(entryId, fareData);

      if (result.success) {
        setFareData(result.data);

        if (entryToDelete && entryToDelete.totalAmount) {
          setTotalEarnings((prev) => prev - entryToDelete.totalAmount);
        }

        // Remove corresponding cash book entry
        setCashBookEntries(prev => prev.filter(entry => entry.source === 'fare-entry' && !entry.jfNo?.includes(entryId.toString())));
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
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
    // Get current user info for filtering
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    // Filter data by current user only
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
                  <div className={`simple-sync-indicator ${syncStatus.pendingSync > 0 || syncStatus.syncInProgress || isLoading ? 'syncing' : 'synced'}`}>
                    {syncStatus.pendingSync > 0 || syncStatus.syncInProgress || isLoading ? (
                      <i className="bi bi-arrow-clockwise"></i>
                    ) : (
                      <i className="bi bi-check-circle"></i>
                    )}
                  </div>
                  {syncStatus.pendingSync > 0 && (
                    <button 
                      className="btn btn-sm btn-outline-primary ms-2"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          await hybridDataService.forceSync();
                          console.log('✅ Manual sync completed');
                        } catch (error) {
                          console.error('❌ Manual sync failed:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading || syncStatus.syncInProgress}
                      title="Force sync pending entries"
                    >
                      <i className="bi bi-cloud-upload"></i> Sync
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards - Only show when user has entries */}
            {(() => {
              // Get current user info for filtering
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              const currentUserName = currentUser.fullName || currentUser.username;

              // Filter entries by current user only
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
                          onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                          placeholder="Select from date"
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
                      <button type="submit" className="btn fare-entry-btn"  disabled={isLoading}>
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
                      <button type="submit" className="btn fare-entry-btn"  disabled={isLoading}>
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
              // Get current user info for filtering
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              const currentUserName = currentUser.fullName || currentUser.username;

              // Filter entries by current user
              const userEntries = fareData.filter(entry => 
                entry.submittedBy === currentUserName
              );

              return userEntries.length > 0 ? (
                <div className="recent-entries mt-4">
                  <h4>Recent Entries</h4>
                  <div className="row">
                    {userEntries.slice(-6).reverse().map((entry) => (
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
                                {entry.type === "daily" && entry.date}
                                {entry.type === "booking" && `${entry.dateFrom} - ${entry.dateTo}`}
                                {entry.type === "off" && entry.date}
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