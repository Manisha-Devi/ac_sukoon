
import React, { useState } from "react";
import "../css/FeesPayment.css";

function FeesPayment({ onAddExpense }) {
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    totalAmount: "",
    cashAmount: "",
    bankAmount: "",
    paymentMethod: "cash",
    addaName: "",
    remarks: ""
  });

  const [entries, setEntries] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.description || !formData.totalAmount) {
      alert("Please fill in all required fields");
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const cashAmount = parseFloat(formData.cashAmount) || 0;
    const bankAmount = parseFloat(formData.bankAmount) || 0;

    if (Math.abs(totalAmount - (cashAmount + bankAmount)) > 0.01) {
      alert("Total amount should equal cash + bank amount");
      return;
    }

    const newEntry = {
      id: editIndex >= 0 ? entries[editIndex].id : Date.now(),
      type: "fees",
      date: formData.date,
      description: formData.description,
      totalAmount: totalAmount,
      cashAmount: cashAmount,
      bankAmount: bankAmount,
      paymentMethod: formData.paymentMethod,
      addaName: formData.addaName,
      remarks: formData.remarks,
      timestamp: new Date().toISOString()
    };

    if (editIndex >= 0) {
      const updatedEntries = [...entries];
      updatedEntries[editIndex] = newEntry;
      setEntries(updatedEntries);
      setEditIndex(-1);
    } else {
      setEntries([...entries, newEntry]);
    }

    if (onAddExpense) {
      onAddExpense(newEntry);
    }

    setFormData({
      date: "",
      description: "",
      totalAmount: "",
      cashAmount: "",
      bankAmount: "",
      paymentMethod: "cash",
      addaName: "",
      remarks: ""
    });
  };

  const handleEdit = (index) => {
    const entry = entries[index];
    setFormData({
      date: entry.date,
      description: entry.description,
      totalAmount: entry.totalAmount.toString(),
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      paymentMethod: entry.paymentMethod,
      addaName: entry.addaName || "",
      remarks: entry.remarks || ""
    });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updatedEntries = entries.filter((_, i) => i !== index);
      setEntries(updatedEntries);
    }
  };

  const handleCancelEdit = () => {
    setEditIndex(-1);
    setFormData({
      date: "",
      description: "",
      totalAmount: "",
      cashAmount: "",
      bankAmount: "",
      paymentMethod: "cash",
      addaName: "",
      remarks: ""
    });
  };

  const handleTotalAmountChange = (e) => {
    const total = parseFloat(e.target.value) || 0;
    setFormData({
      ...formData,
      totalAmount: e.target.value,
      cashAmount: formData.paymentMethod === "cash" ? total.toString() : "0",
      bankAmount: formData.paymentMethod === "bank" ? total.toString() : "0"
    });
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    const total = parseFloat(formData.totalAmount) || 0;
    
    setFormData({
      ...formData,
      paymentMethod: method,
      cashAmount: method === "cash" ? total.toString() : "0",
      bankAmount: method === "bank" ? total.toString() : "0"
    });
  };

  return (
    <div className="fees-entry-container">
      <div className="container-fluid">
        <div className="fees-header">
          <h2><i className="bi bi-building"></i> Adda Payment Entry</h2>
          <p>Record your adda fees and parking expenses (Payment)</p>
        </div>

        <div className="row">
          <div className="col-lg-5">
            <div className="form-card">
              <div className="form-header">
                <h5>
                  <i className="bi bi-plus-circle"></i>
                  {editIndex >= 0 ? "Edit Entry" : "Add New Entry"}
                </h5>
              </div>
              <div className="form-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Adda Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.addaName}
                        onChange={(e) => setFormData({ ...formData, addaName: e.target.value })}
                        placeholder="Enter adda/stand name"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., Daily parking fee, Stand charge"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Payment Method</label>
                      <select
                        className="form-control"
                        value={formData.paymentMethod}
                        onChange={handlePaymentMethodChange}
                      >
                        <option value="cash">Cash</option>
                        <option value="bank">Bank</option>
                        <option value="mixed">Mixed (Cash + Bank)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Total Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.totalAmount}
                        onChange={handleTotalAmountChange}
                        placeholder="Enter total amount"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {(formData.paymentMethod === "mixed" || formData.paymentMethod === "cash") && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Cash Amount (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.cashAmount}
                          onChange={(e) => setFormData({ ...formData, cashAmount: e.target.value })}
                          placeholder="Enter cash amount"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {formData.paymentMethod === "mixed" && (
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Bank Amount (₹)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.bankAmount}
                            onChange={(e) => setFormData({ ...formData, bankAmount: e.target.value })}
                            placeholder="Enter bank amount"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {formData.paymentMethod === "bank" && (
                    <div className="mb-3">
                      <label className="form-label">Bank Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.bankAmount}
                        onChange={(e) => setFormData({ ...formData, bankAmount: e.target.value })}
                        placeholder="Enter bank amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Any additional notes"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle"></i>
                      {editIndex >= 0 ? "Update Entry" : "Add Entry"}
                    </button>
                    {editIndex >= 0 && (
                      <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                        <i className="bi bi-x-circle"></i> Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="entries-card">
              <div className="entries-header">
                <h5><i className="bi bi-list-ul"></i> Recent Entries ({entries.length})</h5>
              </div>
              <div className="entries-body">
                {entries.length === 0 ? (
                  <div className="no-entries">
                    <i className="bi bi-inbox"></i>
                    <p>No adda payments recorded yet</p>
                  </div>
                ) : (
                  <div className="entries-list">
                    {entries.map((entry, index) => (
                      <div key={entry.id} className="entry-item">
                        <div className="entry-content">
                          <div className="entry-main">
                            <h6>{entry.description}</h6>
                            <p className="entry-details">
                              <span className="entry-date">{entry.date}</span>
                              {entry.addaName && <span className="entry-adda">• {entry.addaName}</span>}
                            </p>
                          </div>
                          <div className="entry-amounts">
                            <div className="total-amount">₹{entry.totalAmount.toLocaleString()}</div>
                            <div className="amount-breakdown">
                              {entry.cashAmount > 0 && <span className="cash-amount">Cash: ₹{entry.cashAmount}</span>}
                              {entry.bankAmount > 0 && <span className="bank-amount">Bank: ₹{entry.bankAmount}</span>}
                            </div>
                          </div>
                          <div className="entry-actions">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(index)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        {entry.remarks && (
                          <div className="entry-remarks">
                            <small><i className="bi bi-chat-text"></i> {entry.remarks}</small>
                          </div>
                        )}
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

export default FeesPayment;
