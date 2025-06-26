
import React, { useState, useEffect } from "react";
import "../css/CashBook.css";

const CashBook = ({ cashBookEntries, setCashBookEntries }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    particulars: "",
    description: "",
    voucherNo: "",
    debit: "",
    credit: ""
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
    
    if (!formData.particulars || (!formData.debit && !formData.credit)) {
      alert("Please fill in all required fields");
      return;
    }

    const entryData = {
      id: editingEntry ? editingEntry.id : Date.now(),
      date: formData.date,
      particulars: formData.particulars,
      description: formData.description,
      voucherNo: formData.voucherNo,
      debit: parseFloat(formData.debit) || 0,
      credit: parseFloat(formData.credit) || 0,
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
      voucherNo: "",
      debit: "",
      credit: ""
    });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      particulars: entry.particulars,
      description: entry.description,
      voucherNo: entry.voucherNo,
      debit: entry.debit.toString(),
      credit: entry.credit.toString()
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
      voucherNo: "",
      debit: "",
      credit: ""
    });
  };

  // Calculate running balance
  let runningBalance = 0;
  const entriesWithBalance = cashBookEntries.map(entry => {
    runningBalance += (entry.debit - entry.credit);
    return { ...entry, balance: runningBalance };
  });

  const totalDebit = cashBookEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = cashBookEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const finalBalance = totalDebit - totalCredit;

  return (
    <div className="cash-book-container">
      <div className="container-fluid">
        <div className="cash-book-header">
          <h2><i className="bi bi-cash-coin"></i> Cash Book</h2>
          <p>Record your cash transactions (Dr/Cr)</p>
        </div>

        {/* Form Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="cash-form-card">
              <div className="card-body">
                <h4><i className="bi bi-journal-plus"></i> Add Cash Entry</h4>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Date *</label>
                      <input
                        type="date"
                        className="form-control date-input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Voucher No.</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.voucherNo}
                        onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value })}
                        placeholder="Enter voucher number"
                      />
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
                      <label className="form-label">Debit Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.debit}
                        onChange={(e) => setFormData({ ...formData, debit: e.target.value })}
                        placeholder="Enter debit amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Credit Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.credit}
                        onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                        placeholder="Enter credit amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="button-group">
                    <button type="submit" className="btn cash-entry-btn">
                      <i className={editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                      {editingEntry ? "Update Entry" : "Add Cash Entry"}
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
              <div className="summary-card debit-card">
                <div className="card-body">
                  <h6>Total Debit</h6>
                  <h4>₹{totalDebit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card credit-card">
                <div className="card-body">
                  <h6>Total Credit</h6>
                  <h4>₹{totalCredit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card balance-card">
                <div className="card-body">
                  <h6>Cash Balance</h6>
                  <h4 className={finalBalance >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{Math.abs(finalBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    {finalBalance < 0 && ' (Cr)'}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card entries-card">
                <div className="card-body">
                  <h6>Total Entries</h6>
                  <h4>{cashBookEntries.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Book Ledger */}
        {cashBookEntries.length > 0 && (
          <div className="cash-book-ledger">
            <h4><i className="bi bi-table"></i> Cash Book Ledger</h4>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Voucher No.</th>
                    <th>Particulars</th>
                    <th>Description</th>
                    <th>Debit (₹)</th>
                    <th>Credit (₹)</th>
                    <th>Balance (₹)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entriesWithBalance.map((entry) => (
                    <tr key={entry.id}>
                      <td>{new Date(entry.date).toLocaleDateString('en-IN')}</td>
                      <td>{entry.voucherNo || '-'}</td>
                      <td><strong>{entry.particulars}</strong></td>
                      <td>{entry.description || '-'}</td>
                      <td className="text-success">
                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-danger">
                        {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className={entry.balance >= 0 ? 'text-success' : 'text-danger'}>
                        ₹{Math.abs(entry.balance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                        {entry.balance < 0 && ' (Cr)'}
                      </td>
                      <td>
                        <div className="entry-actions">
                          <button className="btn btn-edit" onClick={() => handleEdit(entry)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-delete" onClick={() => handleDelete(entry.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {cashBookEntries.length === 0 && (
          <div className="no-entries">
            <div className="text-center py-5">
              <i className="bi bi-journal-x display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Cash Entries Found</h4>
              <p className="text-muted">Start by adding your first cash transaction above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashBook;
