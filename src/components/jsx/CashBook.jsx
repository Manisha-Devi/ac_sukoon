
import React, { useState, useEffect } from "react";
import "../css/CashBook.css";

const CashBook = ({ cashBookEntries, setCashBookEntries }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    particulars: "",
    description: "",
    jfNo: "",
    cashAmount: "",
    bankAmount: "",
    type: "dr" // dr for receipts, cr for payments
  });
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem('cashBookEntries');
    if (savedEntries && cashBookEntries.length === 0) {
      setCashBookEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cashBookEntries', JSON.stringify(cashBookEntries));
  }, [cashBookEntries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.particulars || (!formData.cashAmount && !formData.bankAmount)) {
      alert("Please fill in all required fields");
      return;
    }

    const entryData = {
      id: editingEntry ? editingEntry.id : Date.now(),
      date: formData.date,
      particulars: formData.particulars,
      description: formData.description,
      jfNo: formData.jfNo,
      cashAmount: parseFloat(formData.cashAmount) || 0,
      bankAmount: parseFloat(formData.bankAmount) || 0,
      type: formData.type, // dr or cr
      timestamp: editingEntry ? editingEntry.timestamp : new Date().toISOString()
    };

    if (editingEntry) {
      setCashBookEntries(cashBookEntries.map(entry => 
        entry.id === editingEntry.id ? entryData : entry
      ));
      setEditingEntry(null);
    } else {
      setCashBookEntries([entryData, ...cashBookEntries]);
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      particulars: "",
      description: "",
      jfNo: "",
      cashAmount: "",
      bankAmount: "",
      type: "dr"
    });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      particulars: entry.particulars,
      description: entry.description,
      jfNo: entry.jfNo,
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      type: entry.type
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setCashBookEntries(cashBookEntries.filter(entry => entry.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      particulars: "",
      description: "",
      jfNo: "",
      cashAmount: "",
      bankAmount: "",
      type: "dr"
    });
  };

  // Separate entries by type
  const drEntries = cashBookEntries.filter(entry => entry.type === 'dr');
  const crEntries = cashBookEntries.filter(entry => entry.type === 'cr');

  // Calculate totals
  const totalDrCash = drEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalDrBank = drEntries.reduce((sum, entry) => sum + entry.bankAmount, 0);
  const totalCrCash = crEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalCrBank = crEntries.reduce((sum, entry) => sum + entry.bankAmount, 0);

  const cashBalance = totalDrCash - totalCrCash;
  const bankBalance = totalDrBank - totalCrBank;

  return (
    <div className="cash-book-container">
      <div className="container-fluid">
        <div className="cash-book-header">
          <h2><i className="bi bi-book"></i> Cash Book (Double Column)</h2>
          <p>Traditional Dr./Cr. format with Cash and Bank columns</p>
        </div>

        {/* Form Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="cash-form-card">
              <div className="card-body">
                <h4><i className="bi bi-journal-plus"></i> Add Cash Book Entry</h4>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Date *</label>
                      <input
                        type="date"
                        className="form-control date-input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <label className="form-label">J.F. No.</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.jfNo}
                        onChange={(e) => setFormData({ ...formData, jfNo: e.target.value })}
                        placeholder="Journal folio"
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Type *</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                      >
                        <option value="dr">Dr. (Receipt)</option>
                        <option value="cr">Cr. (Payment)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Particulars *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.particulars}
                        onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
                        placeholder="Enter particulars"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
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
                    <div className="col-md-3 mb-3">
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
                  </div>

                  <div className="button-group">
                    <button type="submit" className="btn cash-entry-btn">
                      <i className={editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                      {editingEntry ? "Update Entry" : "Add Entry"}
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
          </div>
        </div>

        {/* Summary Cards */}
        {cashBookEntries.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card dr-cash-card">
                <div className="card-body">
                  <h6>Total Cash Receipts</h6>
                  <h4>₹{totalDrCash.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cr-cash-card">
                <div className="card-body">
                  <h6>Total Cash Payments</h6>
                  <h4>₹{totalCrCash.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card dr-bank-card">
                <div className="card-body">
                  <h6>Total Bank Receipts</h6>
                  <h4>₹{totalDrBank.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cr-bank-card">
                <div className="card-body">
                  <h6>Total Bank Payments</h6>
                  <h4>₹{totalCrBank.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Balance Cards */}
        {cashBookEntries.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="summary-card cash-balance-card">
                <div className="card-body">
                  <h6>Cash Balance</h6>
                  <h4 className={cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    {cashBalance < 0 && ' (Deficit)'}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="summary-card bank-balance-card">
                <div className="card-body">
                  <h6>Bank Balance</h6>
                  <h4 className={bankBalance >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    {bankBalance < 0 && ' (Overdraft)'}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Double Column Cash Book */}
        {cashBookEntries.length > 0 && (
          <div className="double-column-cash-book">
            <div className="cash-book-header-row">
              <h4><i className="bi bi-book-half"></i> In the Books of... Cash Book</h4>
            </div>
            
            <div className="cash-book-table-container">
              <div className="table-responsive">
                <table className="table cash-book-table">
                  <thead>
                    <tr>
                      <th colSpan="5" className="dr-header">Dr.</th>
                      <th colSpan="5" className="cr-header">Cr.</th>
                    </tr>
                    <tr>
                      <th>Date</th>
                      <th>Particulars</th>
                      <th>J.F.</th>
                      <th>Cash(₹)</th>
                      <th>Bank(₹)</th>
                      <th>Date</th>
                      <th>Particulars</th>
                      <th>J.F.</th>
                      <th>Cash(₹)</th>
                      <th>Bank(₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Balance b/d row */}
                    <tr>
                      <td></td>
                      <td><strong>To Balance b/d</strong></td>
                      <td></td>
                      <td className="text-success">
                        {cashBalance > 0 ? `₹${cashBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-success">
                        {bankBalance > 0 ? `₹${bankBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td></td>
                      <td><strong>By Balance b/d</strong></td>
                      <td></td>
                      <td className="text-danger">
                        {cashBalance < 0 ? `₹${Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-danger">
                        {bankBalance < 0 ? `₹${Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                    </tr>

                    {/* Render entries side by side */}
                    {Math.max(drEntries.length, crEntries.length) > 0 && 
                      Array.from({ length: Math.max(drEntries.length, crEntries.length) }).map((_, index) => {
                        const drEntry = drEntries[index];
                        const crEntry = crEntries[index];
                        
                        return (
                          <tr key={`row-${index}`}>
                            {/* Dr. Side */}
                            <td>{drEntry ? new Date(drEntry.date).toLocaleDateString('en-IN') : ''}</td>
                            <td>{drEntry ? `To ${drEntry.particulars}` : ''}</td>
                            <td>{drEntry ? drEntry.jfNo || '-' : ''}</td>
                            <td className="text-success">
                              {drEntry && drEntry.cashAmount > 0 ? `₹${drEntry.cashAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (drEntry ? '-' : '')}
                            </td>
                            <td className="text-success">
                              {drEntry && drEntry.bankAmount > 0 ? `₹${drEntry.bankAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (drEntry ? '-' : '')}
                            </td>
                            
                            {/* Cr. Side */}
                            <td>{crEntry ? new Date(crEntry.date).toLocaleDateString('en-IN') : ''}</td>
                            <td>{crEntry ? `By ${crEntry.particulars}` : ''}</td>
                            <td>{crEntry ? crEntry.jfNo || '-' : ''}</td>
                            <td className="text-danger">
                              {crEntry && crEntry.cashAmount > 0 ? `₹${crEntry.cashAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (crEntry ? '-' : '')}
                            </td>
                            <td className="text-danger">
                              {crEntry && crEntry.bankAmount > 0 ? `₹${crEntry.bankAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (crEntry ? '-' : '')}
                            </td>
                          </tr>
                        );
                      })}

                    {/* Totals row */}
                    <tr className="totals-row">
                      <td></td>
                      <td><strong>To Balance c/d</strong></td>
                      <td></td>
                      <td className="text-success">
                        {cashBalance < 0 ? `₹${Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-success">
                        {bankBalance < 0 ? `₹${Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td></td>
                      <td><strong>By Balance c/d</strong></td>
                      <td></td>
                      <td className="text-danger">
                        {cashBalance > 0 ? `₹${cashBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-danger">
                        {bankBalance > 0 ? `₹${bankBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                    </tr>

                    {/* Final totals */}
                    <tr className="final-totals-row">
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="total-cell">₹{(totalDrCash + Math.abs(cashBalance < 0 ? cashBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="total-cell">₹{(totalDrBank + Math.abs(bankBalance < 0 ? bankBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="total-cell">₹{(totalCrCash + (cashBalance > 0 ? cashBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="total-cell">₹{(totalCrBank + (bankBalance > 0 ? bankBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Entry Actions */}
            <div className="entries-actions">
              <h5><i className="bi bi-gear"></i> Manage Entries</h5>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-success">Dr. Entries (Receipts)</h6>
                  {drEntries.map((entry) => (
                    <div key={entry.id} className="entry-item dr-entry">
                      <div className="entry-info">
                        <strong>{entry.particulars}</strong>
                        <small className="d-block">{new Date(entry.date).toLocaleDateString('en-IN')}</small>
                        <small>Cash: ₹{entry.cashAmount} | Bank: ₹{entry.bankAmount}</small>
                      </div>
                      <div className="entry-actions">
                        <button className="btn btn-edit" onClick={() => handleEdit(entry)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-delete" onClick={() => handleDelete(entry.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="col-md-6">
                  <h6 className="text-danger">Cr. Entries (Payments)</h6>
                  {crEntries.map((entry) => (
                    <div key={entry.id} className="entry-item cr-entry">
                      <div className="entry-info">
                        <strong>{entry.particulars}</strong>
                        <small className="d-block">{new Date(entry.date).toLocaleDateString('en-IN')}</small>
                        <small>Cash: ₹{entry.cashAmount} | Bank: ₹{entry.bankAmount}</small>
                      </div>
                      <div className="entry-actions">
                        <button className="btn btn-edit" onClick={() => handleEdit(entry)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-delete" onClick={() => handleDelete(entry.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {cashBookEntries.length === 0 && (
          <div className="no-entries">
            <div className="text-center py-5">
              <i className="bi bi-book display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Cash Book Entries Found</h4>
              <p className="text-muted">Start by adding your first Dr. (Receipt) or Cr. (Payment) transaction above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashBook;
