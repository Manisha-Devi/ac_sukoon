
import React, { useState } from "react";
import "../css/FareEntry.css";

function FareEntry({ fareData, setFareData, setTotalEarnings }) {
  const [activeCase, setActiveCase] = useState("daily");
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
    const cashAmount = parseInt(dailyFareData.cashAmount) || 0;
    const bankAmount = parseInt(dailyFareData.bankAmount) || 0;
    const totalAmount = cashAmount + bankAmount;
    
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
    setDailyFareData({ route: "", cashAmount: "", bankAmount: "", date: "" });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const cashAmount = parseInt(bookingData.cashAmount) || 0;
    const bankAmount = parseInt(bookingData.bankAmount) || 0;
    const totalAmount = cashAmount + bankAmount;
    
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
    setBookingData({ bookingDetails: "", cashAmount: "", bankAmount: "", dateFrom: "", dateTo: "" });
  };

  const handleOffDaySubmit = (e) => {
    e.preventDefault();
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
    setOffDayData({ date: "", reason: "" });
  };

  // Calculate totals for summary
  const totalCash = fareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = fareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="fare-entry-container">
      {/* Header Section */}
      <div className="fare-header">
        <div className="fare-header-content">
          <div className="fare-title-section">
            <h1 className="fare-main-title">
              <i className="bi bi-wallet2"></i>
              Fare Collection
            </h1>
            <p className="fare-subtitle">Manage daily collections, bookings, and track earnings</p>
          </div>
          
          {/* Quick Stats */}
          <div className="fare-quick-stats">
            <div className="stat-item">
              <div className="stat-icon cash">
                <i className="bi bi-cash-coin"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Cash</span>
                <span className="stat-value">₹{totalCash.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon bank">
                <i className="bi bi-bank"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Bank</span>
                <span className="stat-value">₹{totalBank.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon total">
                <i className="bi bi-calculator"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Grand Total</span>
                <span className="stat-value">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="fare-nav-tabs">
        <button
          className={`fare-nav-btn ${activeCase === "daily" ? "active" : ""}`}
          onClick={() => setActiveCase("daily")}
        >
          <i className="bi bi-calendar-day"></i>
          <span>Daily Collection</span>
          <div className="nav-indicator"></div>
        </button>
        <button
          className={`fare-nav-btn ${activeCase === "booking" ? "active" : ""}`}
          onClick={() => setActiveCase("booking")}
        >
          <i className="bi bi-journal-bookmark"></i>
          <span>Booking</span>
          <div className="nav-indicator"></div>
        </button>
        <button
          className={`fare-nav-btn ${activeCase === "off" ? "active" : ""}`}
          onClick={() => setActiveCase("off")}
        >
          <i className="bi bi-x-circle"></i>
          <span>Off Day</span>
          <div className="nav-indicator"></div>
        </button>
      </div>

      {/* Content Area */}
      <div className="fare-content">
        {/* Daily Collection Form */}
        {activeCase === "daily" && (
          <div className="fare-form-section">
            <div className="form-header">
              <h2>Daily Route Collection</h2>
              <p>Record daily fare collection with cash and bank payments</p>
            </div>
            
            <form onSubmit={handleDailySubmit} className="fare-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="bi bi-geo-alt"></i>
                    Route Selection
                  </label>
                  <select
                    className="form-input"
                    value={dailyFareData.route}
                    onChange={(e) => setDailyFareData({ ...dailyFareData, route: e.target.value })}
                    required
                  >
                    <option value="">Choose your route</option>
                    {routes.map((route) => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-cash-coin"></i>
                    Cash Collection (₹)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={dailyFareData.cashAmount}
                    onChange={(e) => setDailyFareData({ ...dailyFareData, cashAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-credit-card"></i>
                    Bank Transfer (₹)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={dailyFareData.bankAmount}
                    onChange={(e) => setDailyFareData({ ...dailyFareData, bankAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-calendar3"></i>
                    Collection Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={dailyFareData.date}
                    onChange={(e) => setDailyFareData({ ...dailyFareData, date: e.target.value })}
                    required
                  />
                </div>

                {/* Amount Preview */}
                <div className="amount-preview full-width">
                  <div className="preview-content">
                    <h4>Collection Summary</h4>
                    <div className="preview-breakdown">
                      <div className="breakdown-item">
                        <span>Cash</span>
                        <span>₹{parseInt(dailyFareData.cashAmount) || 0}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Bank</span>
                        <span>₹{parseInt(dailyFareData.bankAmount) || 0}</span>
                      </div>
                      <div className="breakdown-total">
                        <span>Total</span>
                        <span>₹{(parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={!dailyFareData.route || !dailyFareData.date || 
                         ((parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)) === 0}
              >
                <i className="bi bi-plus-circle"></i>
                Add Daily Collection
              </button>
            </form>
          </div>
        )}

        {/* Booking Form */}
        {activeCase === "booking" && (
          <div className="fare-form-section">
            <div className="form-header">
              <h2>Booking Management</h2>
              <p>Record special bookings with detailed information</p>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="fare-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="bi bi-journal-text"></i>
                    Booking Details
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={bookingData.bookingDetails}
                    onChange={(e) => setBookingData({ ...bookingData, bookingDetails: e.target.value })}
                    placeholder="Enter booking details, customer info, route details, etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-cash-coin"></i>
                    Cash Payment (₹)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={bookingData.cashAmount}
                    onChange={(e) => setBookingData({ ...bookingData, cashAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-credit-card"></i>
                    Bank Transfer (₹)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={bookingData.bankAmount}
                    onChange={(e) => setBookingData({ ...bookingData, bankAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-calendar-event"></i>
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingData.dateFrom}
                    onChange={(e) => setBookingData({ ...bookingData, dateFrom: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-calendar-check"></i>
                    End Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingData.dateTo}
                    onChange={(e) => setBookingData({ ...bookingData, dateTo: e.target.value })}
                    required
                  />
                </div>

                {/* Amount Preview */}
                <div className="amount-preview full-width">
                  <div className="preview-content">
                    <h4>Booking Summary</h4>
                    <div className="preview-breakdown">
                      <div className="breakdown-item">
                        <span>Cash</span>
                        <span>₹{parseInt(bookingData.cashAmount) || 0}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Bank</span>
                        <span>₹{parseInt(bookingData.bankAmount) || 0}</span>
                      </div>
                      <div className="breakdown-total">
                        <span>Total</span>
                        <span>₹{(parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={!bookingData.bookingDetails || !bookingData.dateFrom || !bookingData.dateTo ||
                         ((parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)) === 0}
              >
                <i className="bi bi-bookmark-plus"></i>
                Add Booking Entry
              </button>
            </form>
          </div>
        )}

        {/* Off Day Form */}
        {activeCase === "off" && (
          <div className="fare-form-section">
            <div className="form-header">
              <h2>Off Day Record</h2>
              <p>Mark days when no collections were made</p>
            </div>
            
            <form onSubmit={handleOffDaySubmit} className="fare-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-calendar-x"></i>
                    Off Day Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={offDayData.date}
                    onChange={(e) => setOffDayData({ ...offDayData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="bi bi-chat-text"></i>
                    Reason for Off Day
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={offDayData.reason}
                    onChange={(e) => setOffDayData({ ...offDayData, reason: e.target.value })}
                    placeholder="Enter reason (maintenance, personal, weather, holiday, etc.)"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn off-day">
                <i className="bi bi-x-circle"></i>
                Mark as Off Day
              </button>
            </form>
          </div>
        )}

        {/* Recent Entries */}
        {fareData.length > 0 && (
          <div className="recent-entries">
            <div className="entries-header">
              <h3>Recent Collections</h3>
              <span className="entries-count">{fareData.length} entries</span>
            </div>
            
            <div className="entries-list">
              {fareData.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className={`entry-card ${entry.type}`}>
                  <div className="entry-icon">
                    {entry.type === "daily" && <i className="bi bi-calendar-day"></i>}
                    {entry.type === "booking" && <i className="bi bi-journal-bookmark"></i>}
                    {entry.type === "off" && <i className="bi bi-x-circle"></i>}
                  </div>
                  
                  <div className="entry-content">
                    <div className="entry-title">
                      {entry.type === "daily" && entry.route}
                      {entry.type === "booking" && "Booking Entry"}
                      {entry.type === "off" && "Off Day"}
                    </div>
                    
                    <div className="entry-details">
                      {entry.type === "daily" && entry.date}
                      {entry.type === "booking" && `${entry.dateFrom} to ${entry.dateTo}`}
                      {entry.type === "off" && entry.date}
                    </div>
                    
                    {entry.type !== "off" && (
                      <div className="entry-description">
                        {entry.type === "booking" && entry.bookingDetails?.substring(0, 50) + "..."}
                      </div>
                    )}
                    
                    {entry.type === "off" && (
                      <div className="entry-description">
                        {entry.reason?.substring(0, 50) + "..."}
                      </div>
                    )}
                  </div>
                  
                  {entry.type !== "off" && (
                    <div className="entry-amount">
                      <div className="amount-breakdown">
                        <span className="cash-amount">₹{entry.cashAmount}</span>
                        <span className="bank-amount">₹{entry.bankAmount}</span>
                      </div>
                      <div className="total-amount">₹{entry.totalAmount}</div>
                    </div>
                  )}
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
