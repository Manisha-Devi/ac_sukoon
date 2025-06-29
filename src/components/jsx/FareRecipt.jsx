import React, { useState } from "react";
import "../css/FareRecipt.css";

function FareEntry({ fareData, setFareData, setTotalEarnings, setCashBookEntries }) {
  const [activeTab, setActiveTab] = useState("daily");
  const [editingEntry, setEditingEntry] = useState(null);
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

  // Function to check if a date is disabled for daily collection
  const isDailyDateDisabled = (selectedDate, selectedRoute) => {
    if (!selectedDate || !selectedRoute) return false;

    // Check if same route and date already exists in daily entries
    const existingDailyEntry = fareData.find(entry => 
      entry.type === 'daily' && 
      entry.date === selectedDate && 
      entry.route === selectedRoute &&
      (!editingEntry || entry.id !== editingEntry.id)
    );

    // Check if date is used in booking entries
    const existingBookingEntry = fareData.find(entry => 
      entry.type === 'booking' && 
      selectedDate >= entry.dateFrom && 
      selectedDate <= entry.dateTo &&
      (!editingEntry || entry.id !== editingEntry.id)
    );

    // Check if date is used in off day entries
    const existingOffEntry = fareData.find(entry => 
      entry.type === 'off' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.id !== editingEntry.id)
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
      (!editingEntry || entry.id !== editingEntry.id)
    );

    // Check if date is used in off day entries
    const existingOffEntry = fareData.find(entry => 
      entry.type === 'off' && 
      entry.date === selectedDate &&
      (!editingEntry || entry.id !== editingEntry.id)
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
      (!editingEntry || entry.id !== editingEntry.id)
    );

    // Check if date is used in booking entries
    const existingBookingEntry = fareData.find(entry => 
      entry.type === 'booking' && 
      selectedDate >= entry.dateFrom && 
      selectedDate <= entry.dateTo &&
      (!editingEntry || entry.id !== editingEntry.id)
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
      if (editingEntry && entry.id === editingEntry.id) return;

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

  const handleDailySubmit = (e) => {
    e.preventDefault();

    // Validate if date is disabled
    if (isDailyDateDisabled(dailyFareData.date, dailyFareData.route)) {
      alert('This date is already taken for this route or conflicts with existing bookings/off days!');
      return;
    }

    const cashAmount = parseInt(dailyFareData.cashAmount) || 0;
    const bankAmount = parseInt(dailyFareData.bankAmount) || 0;
    const totalAmount = cashAmount + bankAmount;

    if (editingEntry) {
      // Update existing entry
      const oldTotal = editingEntry.totalAmount;
      const updatedEntries = fareData.map(entry => 
        entry.id === editingEntry.id 
          ? {
              ...entry,
              route: dailyFareData.route,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
              date: dailyFareData.date,
            }
          : entry
      );
      setFareData(updatedEntries);
      setTotalEarnings((prev) => prev - oldTotal + totalAmount);
      setEditingEntry(null);
    } else {
      // Create new entry
      const newEntry = {
        id: Date.now(),
        type: "daily",
        route: dailyFareData.route,
        cashAmount: cashAmount,
        bankAmount: bankAmount,
        totalAmount: totalAmount,
        date: dailyFareData.date,
      };
      setFareData([...fareData, newEntry]);
      setTotalEarnings((prev) => prev + totalAmount);

      // Add to cash book - receipts go to Dr. side
      if (cashAmount > 0 || bankAmount > 0) {
        const cashBookEntry = {
          id: Date.now() + 1,
          date: dailyFareData.date,
          particulars: "Fare",
          description: `Daily fare collection - ${dailyFareData.route}`,
          jfNo: `FARE-${Date.now()}`,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          type: 'dr', // Receipts go to Dr. side
          timestamp: new Date().toISOString(),
          source: 'fare-entry'
        };
        setCashBookEntries(prev => [cashBookEntry, ...prev]);
      }
    }
    setDailyFareData({ route: "", cashAmount: "", bankAmount: "", date: "" });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

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
      // Update existing entry
      const oldTotal = editingEntry.totalAmount;
      const updatedEntries = fareData.map(entry => 
        entry.id === editingEntry.id 
          ? {
              ...entry,
              bookingDetails: bookingData.bookingDetails,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
              dateFrom: bookingData.dateFrom,
              dateTo: bookingData.dateTo,
            }
          : entry
      );
      setFareData(updatedEntries);
      setTotalEarnings((prev) => prev - oldTotal + totalAmount);
      setEditingEntry(null);
    } else {
      // Create new entry
      const newEntry = {
        id: Date.now(),
        type: "booking",
        bookingDetails: bookingData.bookingDetails,
        cashAmount: cashAmount,
        bankAmount: bankAmount,
        totalAmount: totalAmount,
        dateFrom: bookingData.dateFrom,
        dateTo: bookingData.dateTo,
      };
      setFareData([...fareData, newEntry]);
      setTotalEarnings((prev) => prev + totalAmount);

      // Add to cash book - receipts go to Dr. side  
      if (cashAmount > 0 || bankAmount > 0) {
        const cashBookEntry = {
          id: Date.now() + 1,
          date: bookingData.dateFrom,
          particulars: "Fare",
          description: `Booking fare - ${bookingData.bookingDetails}`,
          jfNo: `BOOKING-${Date.now()}`,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          type: 'dr', // Receipts go to Dr. side
          timestamp: new Date().toISOString(),
          source: 'fare-entry'
        };
        setCashBookEntries(prev => [cashBookEntry, ...prev]);
      }
    }
    setBookingData({ bookingDetails: "", cashAmount: "", bankAmount: "", dateFrom: "", dateTo: "" });
  };

  const handleOffDaySubmit = (e) => {
    e.preventDefault();

    // Validate if date is disabled
    if (isOffDayDateDisabled(offDayData.date)) {
      alert('This date conflicts with existing daily collection or booking entries!');
      return;
    }
    if (editingEntry) {
      // Update existing entry
      const updatedEntries = fareData.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, date: offDayData.date, reason: offDayData.reason }
          : entry
      );
      setFareData(updatedEntries);
      setEditingEntry(null);
    } else {
      // Create new entry
      const newEntry = {
        id: Date.now(),
        type: "off",
        date: offDayData.date,
        reason: offDayData.reason,
        cashAmount: 0,
        bankAmount: 0,
        totalAmount: 0,
      };
      setFareData([...fareData, newEntry]);
    }
    setOffDayData({ date: "", reason: "" });
  };

  const handleDeleteEntry = (entryId) => {
    const entryToDelete = fareData.find(entry => entry.id === entryId);
    if (entryToDelete && entryToDelete.totalAmount) {
      setTotalEarnings((prev) => prev - entryToDelete.totalAmount);
    }
    setFareData(fareData.filter(entry => entry.id !== entryId));

    // Remove corresponding cash book entry
    setCashBookEntries(prev => prev.filter(entry => entry.source === 'fare-entry' && !entry.jfNo?.includes(entryId.toString())));
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

  // Calculate totals for summary
  const totalCash = fareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = fareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="fare-entry-container">
      <div className="container-fluid">
            <div className="fare-header">
              <h2><i className="bi bi-receipt"></i> Fare Receipt Entry</h2>
              <p>Record your daily earnings and bookings (Income)</p>
            </div>

            {/* Summary Cards */}
            {fareData.length > 0 && (
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
                      <h4>{fareData.length}</h4>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      <button type="submit" className="btn fare-entry-btn">
                        <i className={editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                        {editingEntry ? "Update Entry" : "Add Daily Entry"}
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
                      <button type="submit" className="btn fare-entry-btn">
                        <i className={editingEntry ? "bi bi-check-circle" : "bi bi-journal-plus"}></i> 
                        {editingEntry ? "Update Entry" : "Add Booking Entry"}
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
                      <button type="submit" className="btn fare-entry-btn">
                        <i className="bi bi-check-circle"></i> 
                        {editingEntry ? "Update Entry" : "Mark Day as Off"}
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
            {fareData.length > 0 && (
              <div className="recent-entries mt-4">
                <h4>Recent Entries</h4>
                <div className="row">
                  {fareData.slice(-6).reverse().map((entry) => (
                    <div key={entry.id} className="col-md-6 col-lg-4 mb-3">
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
                                onClick={() => handleDeleteEntry(entry.id)}
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
            )}
      </div>
    </div>
  );
}

export default FareEntry;