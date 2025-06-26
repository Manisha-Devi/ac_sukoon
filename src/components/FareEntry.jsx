import React, { useState } from "react";

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
          <div className="fare-form-card">
            <h3>Case 1: Daily Fare Collection</h3>
            <p className="text-muted mb-3">Daily basis route fare collection with cash and bank amounts</p>
            <form onSubmit={handleDailySubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Route</label>
                  <select
                    className="form-select"
                    value={dailyFareData.route}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, route: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map((route) => (
                      <option key={route} value={route}>
                        {route}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-cash-coin me-2 text-success"></i>
                    Cash Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={dailyFareData.cashAmount}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, cashAmount: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-bank me-2 text-primary"></i>
                    Bank Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={dailyFareData.bankAmount}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, bankAmount: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="col-12">
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="bi bi-info-circle me-2"></i>
                    <div>
                      <strong>Total Amount: ₹{(parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)}</strong>
                      <br />
                      <small>Cash: ₹{parseInt(dailyFareData.cashAmount) || 0} | Bank: ₹{parseInt(dailyFareData.bankAmount) || 0}</small>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dailyFareData.date}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <button 
                    type="submit" 
                    className="btn btn-primary fare-entry-btn"
                    disabled={!dailyFareData.route || !dailyFareData.date || 
                             ((parseInt(dailyFareData.cashAmount) || 0) + (parseInt(dailyFareData.bankAmount) || 0)) === 0}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Daily Fare Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        );

      case "booking":
        return (
          <div className="fare-form-card">
            <h3>Case 2: Booking Fare Collection</h3>
            <p className="text-muted mb-3">Booking details with cash and bank amounts and date range</p>
            <form onSubmit={handleBookingSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Booking Details</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={bookingData.bookingDetails}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, bookingDetails: e.target.value })
                    }
                    placeholder="Enter booking details, customer info, route details etc."
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-cash-coin me-2 text-success"></i>
                    Cash Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={bookingData.cashAmount}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, cashAmount: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-bank me-2 text-primary"></i>
                    Bank Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={bookingData.bankAmount}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, bankAmount: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="col-12">
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="bi bi-info-circle me-2"></i>
                    <div>
                      <strong>Total Amount: ₹{(parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)}</strong>
                      <br />
                      <small>Cash: ₹{parseInt(bookingData.cashAmount) || 0} | Bank: ₹{parseInt(bookingData.bankAmount) || 0}</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Date From</label>
                  <input
                    type="date"
                    className="form-control"
                    value={bookingData.dateFrom}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, dateFrom: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Date To</label>
                  <input
                    type="date"
                    className="form-control"
                    value={bookingData.dateTo}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, dateTo: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <button 
                    type="submit" 
                    className="btn btn-primary fare-entry-btn"
                    disabled={!bookingData.bookingDetails || !bookingData.dateFrom || !bookingData.dateTo ||
                             ((parseInt(bookingData.cashAmount) || 0) + (parseInt(bookingData.bankAmount) || 0)) === 0}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Booking Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        );

      case "off":
        return (
          <div className="fare-form-card">
            <h3>Case 3: Off Day Entry</h3>
            <p className="text-muted mb-3">Mark a day as off when no work is done</p>
            <form onSubmit={handleOffDaySubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={offDayData.date}
                    onChange={(e) =>
                      setOffDayData({ ...offDayData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Reason for Off Day</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={offDayData.reason}
                    onChange={(e) =>
                      setOffDayData({ ...offDayData, reason: e.target.value })
                    }
                    placeholder="Enter reason for off day (e.g., maintenance, personal, weather, etc.)"
                    required
                  />
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-danger">
                    <i className="bi bi-x-circle me-2"></i>
                    Mark Day as Off
                  </button>
                </div>
              </div>
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
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-ticket-perforated me-2"></i>
        Fare Collection Management
      </h2>

      {/* Summary Cards */}
      {fareData.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="bi bi-cash-coin fs-3 me-3"></i>
                  <div>
                    <h5 className="card-title mb-1">Total Cash</h5>
                    <h3 className="mb-0">₹{totalCash.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="bi bi-bank fs-3 me-3"></i>
                  <div>
                    <h5 className="card-title mb-1">Total Bank</h5>
                    <h3 className="mb-0">₹{totalBank.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="bi bi-wallet2 fs-3 me-3"></i>
                  <div>
                    <h5 className="card-title mb-1">Grand Total</h5>
                    <h3 className="mb-0">₹{grandTotal.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Selection Tabs */}
      <div className="mb-4">
        <div className="btn-group w-100" role="group">
          <button
            type="button"
            className={`btn ${activeCase === "daily" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveCase("daily")}
          >
            <i className="bi bi-calendar-day me-2"></i>
            Daily Collection
          </button>
          <button
            type="button"
            className={`btn ${activeCase === "booking" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveCase("booking")}
          >
            <i className="bi bi-journal-bookmark me-2"></i>
            Booking
          </button>
          <button
            type="button"
            className={`btn ${activeCase === "off" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveCase("off")}
          >
            <i className="bi bi-x-circle me-2"></i>
            Off Day
          </button>
        </div>
      </div>

      {/* Render Selected Case Form */}
      {renderCaseForm()}

      {/* Recent Entries Table */}
      {fareData.length > 0 && (
        <div className="table-card mt-4">
          <h5>Recent Fare Entries</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Cash Amount</th>
                  <th>Bank Amount</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fareData.slice(-10).reverse().map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className={`badge ${
                        entry.type === "daily" ? "bg-success" : 
                        entry.type === "booking" ? "bg-info" : "bg-danger"
                      }`}>
                        {entry.type === "daily" ? "Daily" : 
                         entry.type === "booking" ? "Booking" : "Off Day"}
                      </span>
                    </td>
                    <td>
                      {entry.type === "daily" && entry.route}
                      {entry.type === "booking" && entry.bookingDetails?.substring(0, 50) + "..."}
                      {entry.type === "off" && entry.reason?.substring(0, 50) + "..."}
                    </td>
                    <td>
                      {entry.type !== "off" ? (
                        <span className="badge bg-success">
                          ₹{entry.cashAmount || 0}
                        </span>
                      ) : "-"}
                    </td>
                    <td>
                      {entry.type !== "off" ? (
                        <span className="badge bg-primary">
                          ₹{entry.bankAmount || 0}
                        </span>
                      ) : "-"}
                    </td>
                    <td>
                      {entry.type !== "off" ? (
                        <strong>₹{entry.totalAmount}</strong>
                      ) : "-"}
                    </td>
                    <td>
                      {entry.type === "daily" && entry.date}
                      {entry.type === "booking" && `${entry.dateFrom} to ${entry.dateTo}`}
                      {entry.type === "off" && entry.date}
                    </td>
                    <td>
                      {entry.type === "off" ? 
                        <span className="badge bg-secondary">Closed</span> : 
                        <span className="badge bg-success">Active</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default FareEntry;