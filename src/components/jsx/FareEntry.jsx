
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
    <div className="fare-collection-container fade-in">
      {/* Header Section */}
      <div className="fare-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <i className="bi bi-ticket-perforated"></i>
            </div>
            <div>
              <h1>Fare Collection</h1>
              <p>Manage daily routes, bookings, and off-day entries</p>
            </div>
          </div>
          <div className="header-date">
            <i className="bi bi-calendar3"></i>
            {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>

      {/* Summary Dashboard */}
      {fareData.length > 0 && (
        <div className="fare-summary">
          <div className="summary-grid">
            <div className="summary-card cash">
              <div className="card-icon">
                <i className="bi bi-cash-coin"></i>
              </div>
              <div className="card-content">
                <h3>₹{totalCash.toLocaleString()}</h3>
                <p>Total Cash</p>
                <span className="trend positive">
                  <i className="bi bi-trending-up"></i>
                  Daily Collection
                </span>
              </div>
            </div>

            <div className="summary-card bank">
              <div className="card-icon">
                <i className="bi bi-bank"></i>
              </div>
              <div className="card-content">
                <h3>₹{totalBank.toLocaleString()}</h3>
                <p>Total Bank</p>
                <span className="trend positive">
                  <i className="bi bi-trending-up"></i>
                  Digital Payments
                </span>
              </div>
            </div>

            <div className="summary-card total">
              <div className="card-icon">
                <i className="bi bi-wallet2"></i>
              </div>
              <div className="card-content">
                <h3>₹{grandTotal.toLocaleString()}</h3>
                <p>Grand Total</p>
                <span className="trend positive">
                  <i className="bi bi-graph-up"></i>
                  Overall Collection
                </span>
              </div>
            </div>

            <div className="summary-card entries">
              <div className="card-icon">
                <i className="bi bi-list-ol"></i>
              </div>
              <div className="card-content">
                <h3>{fareData.length}</h3>
                <p>Total Entries</p>
                <span className="trend neutral">
                  <i className="bi bi-journal-check"></i>
                  Records Added
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collection Type Selector */}
      <div className="collection-selector">
        <h3>Select Collection Type</h3>
        <div className="selector-grid">
          <button
            className={`selector-card ${activeCase === "daily" ? "active" : ""}`}
            onClick={() => setActiveCase("daily")}
          >
            <div className="selector-icon">
              <i className="bi bi-calendar-day"></i>
            </div>
            <div className="selector-content">
              <h4>Daily Collection</h4>
              <p>Regular route fare collection</p>
            </div>
          </button>

          <button
            className={`selector-card ${activeCase === "booking" ? "active" : ""}`}
            onClick={() => setActiveCase("booking")}
          >
            <div className="selector-icon">
              <i className="bi bi-journal-bookmark"></i>
            </div>
            <div className="selector-content">
              <h4>Booking</h4>
              <p>Private bookings & contracts</p>
            </div>
          </button>

          <button
            className={`selector-card ${activeCase === "off" ? "active" : ""}`}
            onClick={() => setActiveCase("off")}
          >
            <div className="selector-icon">
              <i className="bi bi-x-circle"></i>
            </div>
            <div className="selector-content">
              <h4>Off Day</h4>
              <p>Mark day as closed</p>
            </div>
          </button>
        </div>
      </div>

      {/* Entry Forms */}
      <div className="entry-form-section">
        {activeCase === "daily" && (
          <div className="entry-form daily-form">
            <div className="form-header">
              <h3>Daily Route Collection</h3>
              <p>Record your daily route fare collection with cash and bank amounts</p>
            </div>
            
            <form onSubmit={handleDailySubmit} className="collection-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Select Route</label>
                  <select
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
                  <label>
                    <i className="bi bi-cash-coin"></i>
                    Cash Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={dailyFareData.cashAmount}
                    onChange={(e) => setDailyFareData({ ...dailyFareData, cashAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="bi bi-bank"></i>
                    Bank Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={dailyFareData.bankAmount}
                    onChange={(e) => setDailyFareData({ ...dailyFareData, bankAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={dailyFareData.date}
                    onChange={(e) => setDailyFareData({ ...dailyFareData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="amount-preview full-width">
                  <div className="preview-content">
                    <div className="preview-item">
                      <span>Cash: ₹{parseInt(dailyFareData.cashAmount) || 0}</span>
                      <span>Bank: ₹{parseInt(dailyFareData.bankAmount) || 0}</span>
                    </div>
                    <div className="preview-total">
                      <strong>Total: ₹{(parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)}</strong>
                    </div>
                  </div>
                </div>

                <div className="form-actions full-width">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={!dailyFareData.route || !dailyFareData.date || 
                             ((parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)) === 0}
                  >
                    <i className="bi bi-plus-circle"></i>
                    Add Daily Collection
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeCase === "booking" && (
          <div className="entry-form booking-form">
            <div className="form-header">
              <h3>Booking Collection</h3>
              <p>Record private bookings and contract payments</p>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="collection-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Booking Details</label>
                  <textarea
                    rows={3}
                    value={bookingData.bookingDetails}
                    onChange={(e) => setBookingData({ ...bookingData, bookingDetails: e.target.value })}
                    placeholder="Enter booking details, customer info, route details etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="bi bi-cash-coin"></i>
                    Cash Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={bookingData.cashAmount}
                    onChange={(e) => setBookingData({ ...bookingData, cashAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="bi bi-bank"></i>
                    Bank Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={bookingData.bankAmount}
                    onChange={(e) => setBookingData({ ...bookingData, bankAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Date From</label>
                  <input
                    type="date"
                    value={bookingData.dateFrom}
                    onChange={(e) => setBookingData({ ...bookingData, dateFrom: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date To</label>
                  <input
                    type="date"
                    value={bookingData.dateTo}
                    onChange={(e) => setBookingData({ ...bookingData, dateTo: e.target.value })}
                    required
                  />
                </div>

                <div className="amount-preview full-width">
                  <div className="preview-content">
                    <div className="preview-item">
                      <span>Cash: ₹{parseInt(bookingData.cashAmount) || 0}</span>
                      <span>Bank: ₹{parseInt(bookingData.bankAmount) || 0}</span>
                    </div>
                    <div className="preview-total">
                      <strong>Total: ₹{(parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)}</strong>
                    </div>
                  </div>
                </div>

                <div className="form-actions full-width">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={!bookingData.bookingDetails || !bookingData.dateFrom || !bookingData.dateTo ||
                             ((parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)) === 0}
                  >
                    <i className="bi bi-plus-circle"></i>
                    Add Booking Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeCase === "off" && (
          <div className="entry-form off-form">
            <div className="form-header">
              <h3>Off Day Entry</h3>
              <p>Mark a day as closed when no work is done</p>
            </div>
            
            <form onSubmit={handleOffDaySubmit} className="collection-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={offDayData.date}
                    onChange={(e) => setOffDayData({ ...offDayData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Reason for Off Day</label>
                  <textarea
                    rows={3}
                    value={offDayData.reason}
                    onChange={(e) => setOffDayData({ ...offDayData, reason: e.target.value })}
                    placeholder="Enter reason for off day (e.g., maintenance, personal, weather, etc.)"
                    required
                  />
                </div>

                <div className="form-actions full-width">
                  <button type="submit" className="submit-btn off-btn">
                    <i className="bi bi-x-circle"></i>
                    Mark Day as Off
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Recent Entries */}
      {fareData.length > 0 && (
        <div className="recent-entries">
          <div className="entries-header">
            <h3>Recent Entries</h3>
            <span className="entries-count">{fareData.length} total records</span>
          </div>
          
          <div className="entries-grid">
            {fareData.slice(-6).reverse().map((entry) => (
              <div key={entry.id} className={`entry-card ${entry.type}`}>
                <div className="entry-header">
                  <span className={`entry-type ${entry.type}`}>
                    {entry.type === "daily" ? "Daily" : 
                     entry.type === "booking" ? "Booking" : "Off Day"}
                  </span>
                  <span className="entry-date">
                    {entry.type === "daily" && entry.date}
                    {entry.type === "booking" && `${entry.dateFrom} - ${entry.dateTo}`}
                    {entry.type === "off" && entry.date}
                  </span>
                </div>
                
                <div className="entry-content">
                  <div className="entry-details">
                    {entry.type === "daily" && <p>{entry.route}</p>}
                    {entry.type === "booking" && <p>{entry.bookingDetails?.substring(0, 60)}...</p>}
                    {entry.type === "off" && <p>{entry.reason?.substring(0, 60)}...</p>}
                  </div>
                  
                  {entry.type !== "off" && (
                    <div className="entry-amounts">
                      <div className="amount-item">
                        <span>Cash</span>
                        <strong>₹{entry.cashAmount || 0}</strong>
                      </div>
                      <div className="amount-item">
                        <span>Bank</span>
                        <strong>₹{entry.bankAmount || 0}</strong>
                      </div>
                      <div className="total-amount">
                        <span>Total</span>
                        <strong>₹{entry.totalAmount}</strong>
                      </div>
                    </div>
                  )}
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
