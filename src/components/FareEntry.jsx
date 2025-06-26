
import React, { useState } from "react";

function FareEntry({ fareData, setFareData, setTotalEarnings }) {
  const [activeCase, setActiveCase] = useState("daily");
  const [dailyFareData, setDailyFareData] = useState({
    route: "",
    totalFare: "",
    paymentMethod: "cash",
    date: "",
  });

  const [bookingData, setBookingData] = useState({
    bookingDetails: "",
    totalFare: "",
    paymentMethod: "cash",
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
    const newEntry = {
      id: Date.now(),
      type: "daily",
      ...dailyFareData,
      totalAmount: parseInt(dailyFareData.totalFare),
    };
    setFareData([...fareData, newEntry]);
    setTotalEarnings((prev) => prev + parseInt(dailyFareData.totalFare));
    setDailyFareData({ route: "", totalFare: "", paymentMethod: "cash", date: "" });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: "booking",
      ...bookingData,
      totalAmount: parseInt(bookingData.totalFare),
    };
    setFareData([...fareData, newEntry]);
    setTotalEarnings((prev) => prev + parseInt(bookingData.totalFare));
    setBookingData({ bookingDetails: "", totalFare: "", paymentMethod: "cash", dateFrom: "", dateTo: "" });
  };

  const handleOffDaySubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: "off",
      ...offDayData,
      totalAmount: 0,
    };
    setFareData([...fareData, newEntry]);
    setOffDayData({ date: "", reason: "" });
  };

  const renderCaseForm = () => {
    switch (activeCase) {
      case "daily":
        return (
          <div className="form-card">
            <h3>Case 1: Daily Fare Collection</h3>
            <p className="text-muted mb-3">Daily basis route fare collection with payment method</p>
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
                  <label className="form-label">Total Fare Collected (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={dailyFareData.totalFare}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, totalFare: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={dailyFareData.paymentMethod}
                    onChange={(e) =>
                      setDailyFareData({ ...dailyFareData, paymentMethod: e.target.value })
                    }
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
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
                  <button type="submit" className="btn btn-primary">
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
          <div className="form-card">
            <h3>Case 2: Booking Fare Collection</h3>
            <p className="text-muted mb-3">Booking details with separate total fare and date range</p>
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
                  <label className="form-label">Total Fare (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bookingData.totalFare}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, totalFare: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={bookingData.paymentMethod}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, paymentMethod: e.target.value })
                    }
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
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
                  <button type="submit" className="btn btn-primary">
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
          <div className="form-card">
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

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-ticket-perforated me-2"></i>
        Fare Collection Management
      </h2>

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
                  <th>Amount</th>
                  <th>Payment</th>
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
                      {entry.type !== "off" ? `₹${entry.totalAmount}` : "-"}
                    </td>
                    <td>
                      {entry.type !== "off" && (
                        <span className={`badge ${entry.paymentMethod === "cash" ? "bg-warning" : "bg-primary"}`}>
                          {entry.paymentMethod?.toUpperCase()}
                        </span>
                      )}
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
