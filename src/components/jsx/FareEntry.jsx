
import React, { useState } from "react";
import "../css/FareEntry.css";

function FareEntry({ fareData, setFareData, setTotalEarnings }) {
  const [activeTab, setActiveTab] = useState("daily");
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
    <div className="fare-entry-wrapper">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <i className="bi bi-wallet2"></i>
          </div>
          <div className="hero-text">
            <h1>Fare Collection Hub</h1>
            <p>Streamline your daily earnings with smart tracking</p>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>

      {/* Stats Overview */}
      {fareData.length > 0 && (
        <div className="stats-overview">
          <div className="stat-card cash-stat">
            <div className="stat-header">
              <i className="bi bi-cash-coin"></i>
              <span>Cash Collection</span>
            </div>
            <div className="stat-value">₹{totalCash.toLocaleString('en-IN')}</div>
            <div className="stat-trend">
              <i className="bi bi-arrow-up"></i>
              <span>+12.5%</span>
            </div>
          </div>
          
          <div className="stat-card bank-stat">
            <div className="stat-header">
              <i className="bi bi-bank"></i>
              <span>Bank Transfer</span>
            </div>
            <div className="stat-value">₹{totalBank.toLocaleString('en-IN')}</div>
            <div className="stat-trend">
              <i className="bi bi-arrow-up"></i>
              <span>+8.3%</span>
            </div>
          </div>
          
          <div className="stat-card total-stat">
            <div className="stat-header">
              <i className="bi bi-trophy"></i>
              <span>Total Earnings</span>
            </div>
            <div className="stat-value">₹{grandTotal.toLocaleString('en-IN')}</div>
            <div className="stat-trend">
              <i className="bi bi-arrow-up"></i>
              <span>+10.2%</span>
            </div>
          </div>
          
          <div className="stat-card entries-stat">
            <div className="stat-header">
              <i className="bi bi-journal-check"></i>
              <span>Total Entries</span>
            </div>
            <div className="stat-value">{fareData.length}</div>
            <div className="stat-trend">
              <i className="bi bi-plus-circle"></i>
              <span>Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-container">
          <button 
            className={`nav-tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <i className="bi bi-calendar-day"></i>
            <span>Daily Collection</span>
            <div className="tab-indicator"></div>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            <i className="bi bi-journal-bookmark"></i>
            <span>Booking Entry</span>
            <div className="tab-indicator"></div>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'off' ? 'active' : ''}`}
            onClick={() => setActiveTab('off')}
          >
            <i className="bi bi-x-circle"></i>
            <span>Off Day</span>
            <div className="tab-indicator"></div>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="form-content">
        {activeTab === 'daily' && (
          <div className="form-section daily-section">
            <div className="section-header">
              <div className="header-icon daily-icon">
                <i className="bi bi-calendar-day"></i>
              </div>
              <div className="header-text">
                <h2>Daily Collection</h2>
                <p>Record your daily route earnings</p>
              </div>
            </div>

            <div className="form-card">
              <form onSubmit={handleDailySubmit} className="modern-form">
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label className="field-label">
                      <i className="bi bi-geo-alt"></i>
                      Route Selection
                    </label>
                    <div className="select-wrapper">
                      <select
                        className="form-select"
                        value={dailyFareData.route}
                        onChange={(e) => setDailyFareData({ ...dailyFareData, route: e.target.value })}
                        required
                      >
                        <option value="">Choose your route...</option>
                        {routes.map((route) => (
                          <option key={route} value={route}>{route}</option>
                        ))}
                      </select>
                      <i className="bi bi-chevron-down select-icon"></i>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <i className="bi bi-cash-coin"></i>
                      Cash Amount
                    </label>
                    <div className="input-wrapper">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        className="form-input"
                        value={dailyFareData.cashAmount}
                        onChange={(e) => setDailyFareData({ ...dailyFareData, cashAmount: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <i className="bi bi-bank"></i>
                      Bank Amount
                    </label>
                    <div className="input-wrapper">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        className="form-input"
                        value={dailyFareData.bankAmount}
                        onChange={(e) => setDailyFareData({ ...dailyFareData, bankAmount: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <i className="bi bi-calendar3"></i>
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={dailyFareData.date}
                      onChange={(e) => setDailyFareData({ ...dailyFareData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="amount-preview">
                  <div className="preview-item">
                    <span className="preview-label">Cash</span>
                    <span className="preview-value cash-value">₹{parseInt(dailyFareData.cashAmount) || 0}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Bank</span>
                    <span className="preview-value bank-value">₹{parseInt(dailyFareData.bankAmount) || 0}</span>
                  </div>
                  <div className="preview-item total-preview">
                    <span className="preview-label">Total</span>
                    <span className="preview-value total-value">₹{(parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn daily-btn"
                  disabled={!dailyFareData.route || !dailyFareData.date || 
                           ((parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)) === 0}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Daily Entry
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="form-section booking-section">
            <div className="section-header">
              <div className="header-icon booking-icon">
                <i className="bi bi-journal-bookmark"></i>
              </div>
              <div className="header-text">
                <h2>Booking Entry</h2>
                <p>Manage special bookings and reservations</p>
              </div>
            </div>

            <div className="form-card">
              <form onSubmit={handleBookingSubmit} className="modern-form">
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label className="field-label">
                      <i className="bi bi-file-text"></i>
                      Booking Details
                    </label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      value={bookingData.bookingDetails}
                      onChange={(e) => setBookingData({ ...bookingData, bookingDetails: e.target.value })}
                      placeholder="Enter booking details, customer info, destination..."
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <i className="bi bi-cash-coin"></i>
                      Cash Amount
                    </label>
                    <div className="input-wrapper">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        className="form-input"
                        value={bookingData.cashAmount}
                        onChange={(e) => setBookingData({ ...bookingData, cashAmount: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <i className="bi bi-bank"></i>
                      Bank Amount
                    </label>
                    <div className="input-wrapper">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        className="form-input"
                        value={bookingData.bankAmount}
                        onChange={(e) => setBookingData({ ...bookingData, bankAmount: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <i className="bi bi-calendar-check"></i>
                      From Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={bookingData.dateFrom}
                      onChange={(e) => setBookingData({ ...bookingData, dateFrom: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <i className="bi bi-calendar-x"></i>
                      To Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={bookingData.dateTo}
                      onChange={(e) => setBookingData({ ...bookingData, dateTo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="amount-preview">
                  <div className="preview-item">
                    <span className="preview-label">Cash</span>
                    <span className="preview-value cash-value">₹{parseInt(bookingData.cashAmount) || 0}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Bank</span>
                    <span className="preview-value bank-value">₹{parseInt(bookingData.bankAmount) || 0}</span>
                  </div>
                  <div className="preview-item total-preview">
                    <span className="preview-label">Total</span>
                    <span className="preview-value total-value">₹{(parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn booking-btn"
                  disabled={!bookingData.bookingDetails || !bookingData.dateFrom || !bookingData.dateTo ||
                           ((parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)) === 0}
                >
                  <i className="bi bi-journal-plus"></i>
                  Add Booking Entry
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'off' && (
          <div className="form-section off-section">
            <div className="section-header">
              <div className="header-icon off-icon">
                <i className="bi bi-x-circle"></i>
              </div>
              <div className="header-text">
                <h2>Off Day Entry</h2>
                <p>Record non-working days with reasons</p>
              </div>
            </div>

            <div className="form-card">
              <form onSubmit={handleOffDaySubmit} className="modern-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      <i className="bi bi-calendar3"></i>
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={offDayData.date}
                      onChange={(e) => setOffDayData({ ...offDayData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field full-width">
                    <label className="field-label">
                      <i className="bi bi-chat-left-text"></i>
                      Reason for Off Day
                    </label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      value={offDayData.reason}
                      onChange={(e) => setOffDayData({ ...offDayData, reason: e.target.value })}
                      placeholder="Enter reason (e.g., maintenance, personal, weather, holiday...)"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn off-btn">
                  <i className="bi bi-check-circle"></i>
                  Mark Day as Off
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Recent Entries */}
      {fareData.length > 0 && (
        <div className="recent-entries">
          <div className="entries-header">
            <div className="header-text">
              <h3>Recent Entries</h3>
              <p>Latest {Math.min(6, fareData.length)} entries</p>
            </div>
            <div className="entries-badge">
              {fareData.length} total
            </div>
          </div>
          
          <div className="entries-grid">
            {fareData.slice(-6).reverse().map((entry) => (
              <div key={entry.id} className={`entry-card ${entry.type}-entry`}>
                <div className="entry-header">
                  <div className={`entry-icon ${entry.type}-icon`}>
                    <i className={`bi ${
                      entry.type === "daily" ? "bi-calendar-day" : 
                      entry.type === "booking" ? "bi-journal-bookmark" : "bi-x-circle"
                    }`}></i>
                  </div>
                  <div className="entry-meta">
                    <span className="entry-type">
                      {entry.type === "daily" ? "Daily" : 
                       entry.type === "booking" ? "Booking" : "Off Day"}
                    </span>
                    <span className="entry-date">
                      {entry.type === "daily" && entry.date}
                      {entry.type === "booking" && `${entry.dateFrom} to ${entry.dateTo}`}
                      {entry.type === "off" && entry.date}
                    </span>
                  </div>
                </div>
                
                <div className="entry-content">
                  {entry.type === "daily" && (
                    <p className="entry-route">{entry.route}</p>
                  )}
                  {entry.type === "booking" && (
                    <p className="entry-description">{entry.bookingDetails?.substring(0, 50)}...</p>
                  )}
                  {entry.type === "off" && (
                    <p className="entry-reason">{entry.reason?.substring(0, 50)}...</p>
                  )}
                </div>
                
                {entry.type !== "off" && (
                  <div className="entry-amounts">
                    <div className="amount-item">
                      <span className="amount-label">Cash</span>
                      <span className="amount-value cash">₹{entry.cashAmount || 0}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Bank</span>
                      <span className="amount-value bank">₹{entry.bankAmount || 0}</span>
                    </div>
                    <div className="amount-item total-amount">
                      <span className="amount-label">Total</span>
                      <span className="amount-value">₹{entry.totalAmount}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FareEntry;
