
import React, { useState } from "react";
import "../css/AddaFeesEntry.css";

function AddaFeesEntry({ addaData, setAddaData, setTotalExpenses }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    type: "adda",
    cashAmount: "",
    bankAmount: "",
    description: "",
    date: "",
  });

  // Function to get min date for date inputs (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cashAmount = parseInt(formData.cashAmount) || 0;
    const bankAmount = parseInt(formData.bankAmount) || 0;
    const totalAmount = cashAmount + bankAmount;

    if (editingEntry) {
      // Update existing entry
      const oldTotal = editingEntry.totalAmount;
      const updatedEntries = addaData.map(entry => 
        entry.id === editingEntry.id 
          ? {
              ...entry,
              type: formData.type,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
              description: formData.description,
              date: formData.date,
            }
          : entry
      );
      setAddaData(updatedEntries);
      setTotalExpenses((prev) => prev - oldTotal + totalAmount);
      setEditingEntry(null);
    } else {
      // Create new entry
      const newEntry = {
        id: Date.now(),
        type: formData.type,
        cashAmount: cashAmount,
        bankAmount: bankAmount,
        totalAmount: totalAmount,
        description: formData.description,
        date: formData.date,
      };
      setAddaData([...addaData, newEntry]);
      setTotalExpenses((prev) => prev + totalAmount);
    }
    setFormData({ type: "adda", cashAmount: "", bankAmount: "", description: "", date: "" });
  };

  const handleDeleteEntry = (entryId) => {
    const entryToDelete = addaData.find(entry => entry.id === entryId);
    if (entryToDelete && entryToDelete.totalAmount) {
      setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
    }
    setAddaData(addaData.filter(entry => entry.id !== entryId));
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      description: entry.description,
      date: entry.date,
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({ type: "adda", cashAmount: "", bankAmount: "", description: "", date: "" });
  };

  // Calculate totals for summary
  const totalCash = addaData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = addaData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="adda-entry-container">
      <div className="container-fluid">
        <div className="adda-header">
          <h2><i className="bi bi-building"></i> Adda & Agent Fees</h2>
          <p>Record your adda and agent fee expenses</p>
        </div>

        {/* Summary Cards */}
        {addaData.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cash-card">
                <div className="card-body">
                  <h6>Cash Payment</h6>
                  <h4>₹{totalCash.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card bank-card">
                <div className="card-body">
                  <h6>Bank Payment</h6>
                  <h4>₹{totalBank.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card total-card">
                <div className="card-body">
                  <h6>Total Expenses</h6>
                  <h4>₹{grandTotal.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card entries-card">
                <div className="card-body">
                  <h6>Total Entries</h6>
                  <h4>{addaData.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="adda-form-card">
          <h4><i className="bi bi-building"></i> {editingEntry ? "Edit Fees Entry" : "Add Fees Entry"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="adda">Adda Fees</option>
                  <option value="agent">Agent Fees</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control date-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                  placeholder="Select date"
                  min={getTodayDate()}
                  required
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-12 mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description..."
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
                  value={formData.cashAmount}
                  onChange={(e) => setFormData({ ...formData, cashAmount: e.target.value })}
                  placeholder="Enter cash amount"
                  min="0"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Bank Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.bankAmount}
                  onChange={(e) => setFormData({ ...formData, bankAmount: e.target.value })}
                  placeholder="Enter bank amount"
                  min="0"
                />
              </div>
            </div>
            
            <div className="amount-summary mb-3">
              <div className="row">
                <div className="col-4">
                  <span>Cash: ₹{parseInt(formData.cashAmount) || 0}</span>
                </div>
                <div className="col-4">
                  <span>Bank: ₹{parseInt(formData.bankAmount) || 0}</span>
                </div>
                <div className="col-4">
                  <strong>Total: ₹{(parseInt(formData.cashAmount) || 0) + (parseInt(formData.bankAmount) || 0)}</strong>
                </div>
              </div>
            </div>
            
            <div className="button-group">
              <button type="submit" className="btn adda-entry-btn">
                <i className={editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                {editingEntry ? "Update Entry" : "Add Fees Entry"}
              </button>
              {editingEntry && (
                <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                  <i className="bi bi-x-circle"></i> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Recent Entries */}
        {addaData.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {addaData.slice(-6).reverse().map((entry) => (
                <div key={entry.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className={`entry-type ${entry.type}`}>
                          {entry.type === "adda" ? "Adda Fees" : "Agent Fees"}
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
                        <small className="text-muted">{entry.date}</small>
                      </div>
                      <div className="entry-content">
                        <p>{entry.description?.substring(0, 60)}...</p>
                      </div>
                      <div className="entry-amounts">
                        <div className="amount-row">
                          <span>Cash: ₹{entry.cashAmount}</span>
                          <span>Bank: ₹{entry.bankAmount}</span>
                        </div>
                        <div className="total-amount">
                          <strong>Total: ₹{entry.totalAmount}</strong>
                        </div>
                      </div>
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

export default AddaFeesEntry;
