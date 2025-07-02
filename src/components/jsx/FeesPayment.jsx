import React, { useState } from "react";
import "../css/FeesPayment.css";

function AddaFeesEntry({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
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
      const updatedEntries = expenseData.map(entry => 
        entry.id === editingEntry.id 
          ? {
              ...entry,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
              description: formData.description,
              date: formData.date,
            }
          : entry
      );
      setExpenseData(updatedEntries);
      setTotalExpenses((prev) => prev - oldTotal + totalAmount);
      setEditingEntry(null);
    } else {
      // Create new entry
      const newEntry = {
        id: Date.now(),
        type: "fees",
        cashAmount: cashAmount,
        bankAmount: bankAmount,
        totalAmount: totalAmount,
        description: formData.description,
        date: formData.date,
      };
      setExpenseData([...expenseData, newEntry]);
      setTotalExpenses((prev) => prev + totalAmount);
      
      // Add to cash book - payments go to Cr. side
      if (cashAmount > 0 || bankAmount > 0) {
        const cashBookEntry = {
          id: Date.now() + 1,
          date: formData.date,
          particulars: "Adda Fees",
          description: `Adda fees payment - ${formData.description}`,
          jfNo: `ADDA-${Date.now()}`,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          type: 'cr', // Payments go to Cr. side
          timestamp: new Date().toISOString(),
          source: 'fees-payment'
        };
        setCashBookEntries(prev => [cashBookEntry, ...prev]);
      }
    }
    setFormData({ cashAmount: "", bankAmount: "", description: "", date: "" });
  };

  const handleDeleteEntry = (entryId) => {
    const entryToDelete = expenseData.find(entry => entry.id === entryId);
    if (entryToDelete && entryToDelete.totalAmount) {
      setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
    }
    setExpenseData(expenseData.filter(entry => entry.id !== entryId));
    
    // Remove corresponding cash book entry
    setCashBookEntries(prev => prev.filter(entry => entry.source === 'fees-payment' && !entry.jfNo?.includes(entryId.toString())));
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setFormData({
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      description: entry.description,
      date: entry.date,
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({ cashAmount: "", bankAmount: "", description: "", date: "" });
  };

  // Filter adda entries and calculate totals for summary
  const addaEntries = expenseData.filter(entry => entry.type === "fees");
  const totalCash = addaEntries.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = addaEntries.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const expenseToDelete = expenseData.find(expense => expense.id === id);
      setExpenseData(expenseData.filter(expense => expense.id !== id));

      // Remove corresponding cash book entry
      if (expenseToDelete && setCashBookEntries) {
        setCashBookEntries(prev => prev.filter(entry => 
          !(entry.source === 'fees-payment' && entry.id === expenseToDelete.id + 1)
        ));
      }
    }
  };

  return (
    <div className="adda-entry-container">
      <div className="container-fluid">
        <div className="adda-header">
          <h2><i className="bi bi-credit-card"></i> Adda Fees Payment Entry</h2>
          <p>Record your adda fees expenses (Payment)</p>
        </div>

        {/* Summary Cards */}
        {addaEntries.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cash-card">
                <div className="card-body">
                  <h6>Cash Expense</h6>
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
                  <h6>Total Expenses</h6>
                  <h4>₹{grandTotal.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card entries-card">
                <div className="card-body">
                  <h6>Total Entries</h6>
                  <h4>{addaEntries.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="adda-form-card">
          <h4><i className="bi bi-building"></i> {editingEntry ? "Edit Adda Fees" : "Add Adda Fees"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
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
              <div className="col-md-6 mb-3">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
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
                {editingEntry ? "Update Entry" : "Add Adda Entry"}
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
        {addaEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {addaEntries.slice(-6).reverse().map((entry) => (
                <div key={entry.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className="entry-type adda">
                          Adda Fees
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
                            onClick={() => handleDelete(entry.id)}
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
                        <p><strong>Description:</strong> {entry.description}</p>
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