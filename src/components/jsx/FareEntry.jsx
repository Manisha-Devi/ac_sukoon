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

  const renderCaseForm = () => {
    switch (activeCase) {
      case "daily":
        return (
          <div className="modern-form-container">
            <div className="form-header">
              <div className="form-icon daily-icon">
                <i className="bi bi-calendar-day"></i>
              </div>
              <h3>Daily Fare Collection</h3>
              <p>Track your daily route earnings with ease</p>
            </div>

            <form onSubmit={handleDailySubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="modern-label">
                    <i className="bi bi-geo-alt"></i>
                    Select Route
                  </label>
                  <select
                    className="modern-select"
                    value={dailyFareData.route}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, route: e.target.value })
                    }
                    required
                  >
                    <option value="">Choose your route...</option>
                    {routes.map((route) => (
                      <option key={route} value={route}>
                        {route}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="modern-label">
                    <i className="bi bi-cash-coin"></i>
                    Cash Amount
                  </label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      className="modern-input"
                      value={dailyFareData.cashAmount}
                      onChange={(e) =>
                        setDailyFareData({ ...dailyFareData, cashAmount: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="modern-label">
                    <i className="bi bi-bank"></i>
                    Bank Amount
                  </label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      className="modern-input"
                      value={dailyFareData.bankAmount}
                      onChange={(e) =>
                        setDailyFareData({ ...dailyFareData, bankAmount: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="amount-summary">
                <div className="summary-item">
                  <span>Cash</span>
                  <span className="cash-amount">₹{parseInt(dailyFareData.cashAmount) || 0}</span>
                </div>
                <div className="summary-item">
                  <span>Bank</span>
                  <span className="bank-amount">₹{parseInt(dailyFareData.bankAmount) || 0}</span>
                </div>
                <div className="summary-item total">
                  <span>Total</span>
                  <span className="total-amount">₹{(parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)}</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="modern-label">
                    <i className="bi bi-calendar3"></i>
                    Date
                  </label>
                  <input
                    type="date"
                    className="modern-input"
                    value={dailyFareData.date}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="modern-submit-btn daily-btn"
                disabled={!dailyFareData.route || !dailyFareData.date || 
                         ((parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)) === 0}
              >
                <i className="bi bi-plus-circle"></i>
                Add Daily Entry
              </button>
            </form>
          </div>
        );

      case "booking":
        return (
          <div className="modern-form-container">
            <div className="form-header">
              <div className="form-icon booking-icon">
                <i className="bi bi-journal-bookmark"></i>
              </div>
              <h3>Booking Fare Collection</h3>
              <p>Record special bookings and reservations</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="modern-label">
                    <i className="bi bi-file-text"></i>
                    Booking Details
                  </label>
                  <textarea
                    className="modern-textarea"
                    rows={4}
                    value={bookingData.bookingDetails}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, bookingDetails: e.target.value })
                    }
                    placeholder="Enter booking details, customer info, destination..."
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="modern-label">
                    <i className="bi bi-cash-coin"></i>
                    Cash Amount
                  </label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      className="modern-input"
                      value={bookingData.cashAmount}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, cashAmount: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="modern-label">
                    <i className="bi bi-bank"></i>
                    Bank Amount
                  </label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      className="modern-input"
                      value={bookingData.bankAmount}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, bankAmount: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="amount-summary">
                <div className="summary-item">
                  <span>Cash</span>
                  <span className="cash-amount">₹{parseInt(bookingData.cashAmount) || 0}</span>
                </div>
                <div className="summary-item">
                  <span>Bank</span>
                  <span className="bank-amount">₹{parseInt(bookingData.bankAmount) || 0}</span>
                </div>
                <div className="summary-item total">
                  <span>Total</span>
                  <span className="total-amount">₹{(parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)}</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="modern-label">
                    <i className="bi bi-calendar-check"></i>
                    From Date
                  </label>
                  <input
                    type="date"
                    className="modern-input"
                    value={bookingData.dateFrom}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, dateFrom: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="modern-label">
                    <i className="bi bi-calendar-x"></i>
                    To Date
                  </label>
                  <input
                    type="date"
                    className="modern-input"
                    value={bookingData.dateTo}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, dateTo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="modern-submit-btn booking-btn"
                disabled={!bookingData.bookingDetails || !bookingData.dateFrom || !bookingData.dateTo ||
                         ((parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)) === 0}
              >
                <i className="bi bi-plus-circle"></i>
                Add Booking Entry
              </button>
            </form>
          </div>
        );

      case "off":
        return (
          <div className="modern-form-container">
            <div className="form-header">
              <div className="form-icon off-icon">
                <i className="bi bi-x-circle"></i>
              </div>
              <h3>Off Day Entry</h3>
              <p>Mark days when no work was done</p>
            </div>

            <form onSubmit={handleOffDaySubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="modern-label">
                    <i className="bi bi-calendar3"></i>
                    Date
                  </label>
                  <input
                    type="date"
                    className="modern-input"
                    value={offDayData.date}
                    onChange={(e) =>
                      setOffDayData({ ...offDayData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="modern-label">
                    <i className="bi bi-chat-left-text"></i>
                    Reason for Off Day
                  </label>
                  <textarea
                    className="modern-textarea"
                    rows={4}
                    value={offDayData.reason}
                    onChange={(e) =>
                      setOffDayData({ ...offDayData, reason: e.target.value })
                    }
                    placeholder="Enter reason (e.g., maintenance, personal, weather, holiday...)"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="modern-submit-btn off-btn">
                <i className="bi bi-x-circle"></i>
                Mark Day as Off
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate totals for summary
  const totalCash = fareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = fareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="fare-entry-modern">
      {/* Header Section */}
      <div className="fare-header-modern">
        <div className="header-content">
          <div className="header-title">
            <i className="bi bi-ticket-perforated"></i>
            <div>
              <h1>Fare Collection</h1>
              <p>Manage your daily earnings efficiently</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {fareData.length > 0 && (
        <div className="summary-cards">
          <div className="summary-card cash-card">
            <div className="card-content">
              <div className="card-icon">
                <i className="bi bi-cash-coin"></i>
              </div>
              <div className="card-info">
                <h3>₹{totalCash.toLocaleString()}</h3>
                <p>Total Cash</p>
              </div>
            </div>
          </div>

          <div className="summary-card bank-card">
            <div className="card-content">
              <div className="card-icon">
                <i className="bi bi-bank"></i>
              </div>
              <div className="card-info">
                <h3>₹{totalBank.toLocaleString()}</h3>
                <p>Total Bank</p>
              </div>
            </div>
          </div>

          <div className="summary-card total-card">
            <div className="card-content">
              <div className="card-icon">
                <i className="bi bi-wallet2"></i>
              </div>
              <div className="card-info">
                <h3>₹{grandTotal.toLocaleString()}</h3>
                <p>Grand Total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="modern-tabs">
        <button
          className={`tab-btn ${activeCase === "daily" ? "active" : ""}`}
          onClick={() => setActiveCase("daily")}
        >
          <i className="bi bi-calendar-day"></i>
          <span>Daily</span>
        </button>
        <button
          className={`tab-btn ${activeCase === "booking" ? "active" : ""}`}
          onClick={() => setActiveCase("booking")}
        >
          <i className="bi bi-journal-bookmark"></i>
          <span>Booking</span>
        </button>
        <button
          className={`tab-btn ${activeCase === "off" ? "active" : ""}`}
          onClick={() => setActiveCase("off")}
        >
          <i className="bi bi-x-circle"></i>
          <span>Off Day</span>
        </button>
      </div>

      {/* Form Section */}
      {renderCaseForm()}

      {/* Recent Entries */}
      {fareData.length > 0 && (
        <div className="recent-entries-modern">
          <div className="entries-header">
            <h3>
              <i className="bi bi-clock-history"></i>
              Recent Entries
            </h3>
            <span className="entries-count">{fareData.length} entries</span>
          </div>

          <div className="entries-grid">
            {fareData.slice(-6).reverse().map((entry) => (
              <div key={entry.id} className={`entry-card-modern ${entry.type}`}>
                <div className="entry-header">
                  <div className={`entry-icon-modern ${entry.type}`}>
                    <i className={`bi ${
                      entry.type === "daily" ? "bi-calendar-day" : 
                      entry.type === "booking" ? "bi-journal-bookmark" : "bi-x-circle"
                    }`}></i>
                  </div>
                  <div className="entry-type">
                    {entry.type === "daily" ? "Daily" : 
                     entry.type === "booking" ? "Booking" : "Off Day"}
                  </div>
                </div>

                <div className="entry-details">
                  {entry.type === "daily" && (
                    <p className="entry-route">{entry.route}</p>
                  )}
                  {entry.type === "booking" && (
                    <p className="entry-description">{entry.bookingDetails?.substring(0, 40)}...</p>
                  )}
                  {entry.type === "off" && (
                    <p className="entry-reason">{entry.reason?.substring(0, 40)}...</p>
                  )}
                </div>

                {entry.type !== "off" && (
                  <div className="entry-amounts">
                    <div className="amount-row">
                      <span className="amount-label">Cash:</span>
                      <span className="amount-value cash">₹{entry.cashAmount || 0}</span>
                    </div>
                    <div className="amount-row">
                      <span className="amount-label">Bank:</span>
                      <span className="amount-value bank">₹{entry.bankAmount || 0}</span>
                    </div>
                    <div className="amount-row total">
                      <span className="amount-label">Total:</span>
                      <span className="amount-value">₹{entry.totalAmount}</span>
                    </div>
                  </div>
                )}

                <div className="entry-date">
                  {entry.type === "daily" && entry.date}
                  {entry.type === "booking" && `${entry.dateFrom} to ${entry.dateTo}`}
                  {entry.type === "off" && entry.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FareEntry;