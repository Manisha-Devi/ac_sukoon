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
    <div className="fare-entry-container">
      <div className="container-fluid">
            <div className="fare-header">
              <h2><i className="bi bi-wallet2"></i> Fare Entry</h2>
              <p>Record your daily earnings and bookings</p>
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
                    <i className="bi bi-calendar-day"></i> Daily Collection
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'booking' ? 'active' : ''}`}
                    onClick={() => setActiveTab('booking')}
                  >
                    <i className="bi bi-journal-bookmark"></i> Booking Entry
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
                          className="form-control"
                          value={dailyFareData.date}
                          onChange={(e) => setDailyFareData({ ...dailyFareData, date: e.target.value })}
                          required
                        />
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
                    <button type="submit" className="btn fare-entry-btn">
                      <i className="bi bi-plus-circle"></i> Add Daily Entry
                    </button>
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
                          className="form-control"
                          value={bookingData.dateFrom}
                          onChange={(e) => setBookingData({ ...bookingData, dateFrom: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">To Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={bookingData.dateTo}
                          onChange={(e) => setBookingData({ ...bookingData, dateTo: e.target.value })}
                          required
                        />
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
                    <button type="submit" className="btn fare-entry-btn">
                      <i className="bi bi-journal-plus"></i> Add Booking Entry
                    </button>
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
                          className="form-control"
                          value={offDayData.date}
                          onChange={(e) => setOffDayData({ ...offDayData, date: e.target.value })}
                          required
                        />
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
                    <button type="submit" className="btn fare-entry-btn">
                      <i className="bi bi-check-circle"></i> Mark Day as Off
                    </button>
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