
import React, { useState, useEffect } from "react";
import "../css/BankBook.css";
import { addBankBookEntry, getBankBookEntries } from "../../services/googleSheetsAPI";

const BankBook = ({ bankBookEntries, setBankBookEntries }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    particulars: "",
    description: "",
    chequeNo: "",
    debit: "",
    credit: ""
  });
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    loadBankData();
  }, []);

  useEffect(() => {
    const savedEntries = localStorage.getItem('bankBookEntries');
    if (savedEntries && bankBookEntries.length === 0) {
      setBankBookEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bankBookEntries', JSON.stringify(bankBookEntries));
  }, [bankBookEntries]);

  const loadBankData = async () => {
    setIsLoading(true);
    try {
      const result = await getBankBookEntries();
      if (result.success) {
        setBankBookEntries(result.data || []);
        setApiError("");
      } else {
        setApiError("Failed to load bank data: " + result.error);
        // Fallback to local storage if API fails
        const savedEntries = localStorage.getItem('bankBookEntries');
        if (savedEntries) {
          setBankBookEntries(JSON.parse(savedEntries));
        }
      }
    } catch (error) {
      setApiError("Error loading data: " + error.message);
      // Fallback to local storage if API fails
      const savedEntries = localStorage.getItem('bankBookEntries');
      if (savedEntries) {
        setBankBookEntries(JSON.parse(savedEntries));
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.particulars || (!formData.debit && !formData.credit)) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setApiError("");

    const entryData = {
      id: editingEntry ? editingEntry.id : Date.now(),
      date: formData.date,
      particulars: formData.particulars,
      description: formData.description,
      chequeNo: formData.chequeNo,
      debit: parseFloat(formData.debit) || 0,
      credit: parseFloat(formData.credit) || 0,
      timestamp: editingEntry ? editingEntry.timestamp : new Date().toISOString()
    };

    if (editingEntry) {
      setBankBookEntries(bankBookEntries.map(entry => 
        entry.id === editingEntry.id ? entryData : entry
      ));
      setEditingEntry(null);
    } else {
      try {
        // Submit to Google Sheets
        const apiData = {
          date: formData.date,
          particulars: formData.particulars,
          description: formData.description,
          chequeNo: formData.chequeNo,
          debit: parseFloat(formData.debit) || 0,
          credit: parseFloat(formData.credit) || 0,
          submittedBy: localStorage.getItem('username') || 'Unknown'
        };

        const result = await addBankBookEntry(apiData);
        
        if (result.success) {
          setBankBookEntries([entryData, ...bankBookEntries]);
          setApiError("");
        } else {
          setApiError("Failed to save to server, but saved locally: " + result.error);
          setBankBookEntries([entryData, ...bankBookEntries]);
        }
      } catch (error) {
        setApiError("Error saving to server, but saved locally: " + error.message);
        setBankBookEntries([entryData, ...bankBookEntries]);
      }
    }

    setIsLoading(false);

    setFormData({
      date: new Date().toISOString().split('T')[0],
      particulars: "",
      description: "",
      chequeNo: "",
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
      chequeNo: entry.chequeNo,
      debit: entry.debit.toString(),
      credit: entry.credit.toString()
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setBankBookEntries(bankBookEntries.filter(entry => entry.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      particulars: "",
      description: "",
      chequeNo: "",
      debit: "",
      credit: ""
    });
  };

  // Calculate running balance
  let runningBalance = 0;
  const entriesWithBalance = bankBookEntries.map(entry => {
    runningBalance += (entry.debit - entry.credit);
    return { ...entry, balance: runningBalance };
  });

  const totalDebit = bankBookEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = bankBookEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const finalBalance = totalDebit - totalCredit;

  return (
    <div className="bank-book-container">
      <div className="container-fluid">
        <div className="bank-book-header">
          <h2><i className="bi bi-bank"></i> Bank Book</h2>
          <p>Record your bank transactions (Dr/Cr)</p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {apiError}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setApiError("")}
            ></button>
          </div>
        )}

        {/* Form Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bank-form-card">
              <div className="card-body">
                <h4><i className="bi bi-journal-plus"></i> Add Bank Entry</h4>
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
                      <label className="form-label">Cheque/Ref No.</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.chequeNo}
                        onChange={(e) => setFormData({ ...formData, chequeNo: e.target.value })}
                        placeholder="Enter cheque/ref number"
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
                    <button 
                      type="submit" 
                      className="btn bank-entry-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className={editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                          {editingEntry ? "Update Entry" : "Add Bank Entry"}
                        </>
                      )}
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
        {bankBookEntries.length > 0 && (
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
                  <h6>Bank Balance</h6>
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
                  <h4>{bankBookEntries.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Book Ledger */}
        {bankBookEntries.length > 0 && (
          <div className="bank-book-ledger">
            <h4><i className="bi bi-table"></i> Bank Book Ledger</h4>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Cheque/Ref No.</th>
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
                      <td>{entry.chequeNo || '-'}</td>
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

        {bankBookEntries.length === 0 && (
          <div className="no-entries">
            <div className="text-center py-5">
              <i className="bi bi-journal-x display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Bank Entries Found</h4>
              <p className="text-muted">Start by adding your first bank transaction above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankBook;
