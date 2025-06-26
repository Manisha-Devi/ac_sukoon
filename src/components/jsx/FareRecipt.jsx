import React, { useState, useEffect } from "react";
import "../css/FareRecipt.css";

function FareRecipt({ onAddFare, existingData = [] }) {
  const [bookingData, setBookingData] = useState({
    passengerName: "",
    phoneNumber: "",
    fromLocation: "",
    toLocation: "",
    travelDate: "",
    totalAmount: "",
    cashAmount: "",
    bankAmount: "",
    paymentMethod: "cash",
  });

  const [entries, setEntries] = useState(existingData);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    setEntries(existingData);
  }, [existingData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!bookingData.passengerName || !bookingData.fromLocation || !bookingData.toLocation || !bookingData.totalAmount) {
      alert("Please fill in all required fields");
      return;
    }

    const totalAmount = parseFloat(bookingData.totalAmount) || 0;
    const cashAmount = parseFloat(bookingData.cashAmount) || 0;
    const bankAmount = parseFloat(bookingData.bankAmount) || 0;

    if (Math.abs(totalAmount - (cashAmount + bankAmount)) > 0.01) {
      alert("Total amount should equal cash + bank amount");
      return;
    }

    const newEntry = {
      id: editingEntry ? editingEntry.id : Date.now(),
      type: "fare",
      passengerName: bookingData.passengerName,
      phoneNumber: bookingData.phoneNumber,
      fromLocation: bookingData.fromLocation,
      toLocation: bookingData.toLocation,
      date: bookingData.travelDate,
      totalAmount: totalAmount,
      cashAmount: cashAmount,
      bankAmount: bankAmount,
      paymentMethod: bookingData.paymentMethod,
      timestamp: new Date().toISOString()
    };

    if (editingEntry) {
      const updatedEntries = entries.map(entry => 
        entry.id === editingEntry.id ? newEntry : entry
      );
      setEntries(updatedEntries);
      setEditingEntry(null);
    } else {
      setEntries([...entries, newEntry]);
    }

    if (onAddFare) {
      onAddFare(newEntry);
    }

    setBookingData({
      passengerName: "",
      phoneNumber: "",
      fromLocation: "",
      toLocation: "",
      travelDate: "",
      totalAmount: "",
      cashAmount: "",
      bankAmount: "",
      paymentMethod: "cash",
    });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setBookingData({
      passengerName: entry.passengerName,
      phoneNumber: entry.phoneNumber || "",
      fromLocation: entry.fromLocation,
      toLocation: entry.toLocation,
      travelDate: entry.date,
      totalAmount: entry.totalAmount.toString(),
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      paymentMethod: entry.paymentMethod,
    });
  };

  const handleDelete = (entryId) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(updatedEntries);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setBookingData({
      passengerName: "",
      phoneNumber: "",
      fromLocation: "",
      toLocation: "",
      travelDate: "",
      totalAmount: "",
      cashAmount: "",
      bankAmount: "",
      paymentMethod: "cash",
    });
  };

  const handleTotalAmountChange = (e) => {
    const total = parseFloat(e.target.value) || 0;
    setBookingData({
      ...bookingData,
      totalAmount: e.target.value,
      cashAmount: bookingData.paymentMethod === "cash" ? total.toString() : "0",
      bankAmount: bookingData.paymentMethod === "bank" ? total.toString() : "0"
    });
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    const total = parseFloat(bookingData.totalAmount) || 0;

    setBookingData({
      ...bookingData,
      paymentMethod: method,
      cashAmount: method === "cash" ? total.toString() : "0",
      bankAmount: method === "bank" ? total.toString() : "0"
    });
  };

  // Calculate totals
  const totalCash = entries.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = entries.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="fare-container">
      <div className="container-fluid">
        <div className="fare-header">
          <h2><i className="bi bi-receipt"></i> Fare Receipt Entry</h2>
          <p>Record passenger bookings and fare collections (Receipt)</p>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="summary-card cash-card">
              <div className="card-body">
                <h6>Total Cash</h6>
                <h4>₹{totalCash.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card bank-card">
              <div className="card-body">
                <h6>Total Bank</h6>
                <h4>₹{totalBank.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card total-card">
              <div className="card-body">
                <h6>Grand Total</h6>
                <h4>₹{grandTotal.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card entries-card">
              <div className="card-body">
                <h6>Total Entries</h6>
                <h4>{entries.length}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-5">
            <div className="fare-form-card">
              <h4>
                <i className="bi bi-plus-circle"></i>
                {editingEntry ? "Edit Booking" : "New Booking Entry"}
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Passenger Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bookingData.passengerName}
                      onChange={(e) => setBookingData({ ...bookingData, passengerName: e.target.value })}
                      placeholder="Enter passenger name"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={bookingData.phoneNumber}
                      onChange={(e) => setBookingData({ ...bookingData, phoneNumber: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">From Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bookingData.fromLocation}
                      onChange={(e) => setBookingData({ ...bookingData, fromLocation: e.target.value })}
                      placeholder="Departure location"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">To Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bookingData.toLocation}
                      onChange={(e) => setBookingData({ ...bookingData, toLocation: e.target.value })}
                      placeholder="Destination location"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Travel Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={bookingData.travelDate}
                      onChange={(e) => setBookingData({ ...bookingData, travelDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-control"
                      value={bookingData.paymentMethod}
                      onChange={handlePaymentMethodChange}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                      <option value="mixed">Mixed (Cash + Bank)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Total Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bookingData.totalAmount}
                    onChange={handleTotalAmountChange}
                    placeholder="Enter total fare amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {(bookingData.paymentMethod === "mixed" || bookingData.paymentMethod === "cash") && (
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
                        step="0.01"
                      />
                    </div>
                    {bookingData.paymentMethod === "mixed" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Bank Amount (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bookingData.bankAmount}
                          onChange={(e) => setBookingData({ ...bookingData, bankAmount: e.target.value })}
                          placeholder="Enter bank amount"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                )}

                {bookingData.paymentMethod === "bank" && (
                  <div className="mb-3">
                    <label className="form-label">Bank Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bookingData.bankAmount}
                      onChange={(e) => setBookingData({ ...bookingData, bankAmount: e.target.value })}
                      placeholder="Enter bank amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                <div className="amount-summary mb-3">
                  <div className="row text-center">
                    <div className="col-4">
                      <span>Cash: ₹{parseFloat(bookingData.cashAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <span>Bank: ₹{parseFloat(bookingData.bankAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <strong>Total: ₹{(parseFloat(bookingData.cashAmount) || 0) + (parseFloat(bookingData.bankAmount) || 0)}</strong>
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
          </div>

          <div className="col-lg-7">
            <div className="entries-list-card">
              <div className="card-header">
                <h5><i className="bi bi-list-ul"></i> Recent Bookings ({entries.length})</h5>
              </div>
              <div className="card-body">
                {entries.length === 0 ? (
                  <div className="no-entries">
                    <i className="bi bi-inbox"></i>
                    <p>No bookings recorded yet</p>
                  </div>
                ) : (
                  <div className="entries-list">
                    {entries.map((entry) => (
                      <div key={entry.id} className="entry-item">
                        <div className="entry-header">
                          <h6>{entry.passengerName}</h6>
                          <div className="entry-actions">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(entry)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        <div className="entry-details">
                          <p><strong>Route:</strong> {entry.fromLocation} → {entry.toLocation}</p>
                          <p><strong>Date:</strong> {entry.date}</p>
                          {entry.phoneNumber && <p><strong>Phone:</strong> {entry.phoneNumber}</p>}
                        </div>
                        <div className="entry-amounts">
                          <div className="amount-breakdown">
                            {entry.cashAmount > 0 && <span className="cash-amount">Cash: ₹{entry.cashAmount}</span>}
                            {entry.bankAmount > 0 && <span className="bank-amount">Bank: ₹{entry.bankAmount}</span>}
                          </div>
                          <div className="total-amount">Total: ₹{entry.totalAmount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FareRecipt;