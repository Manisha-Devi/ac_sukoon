import React, { useState, useEffect } from "react";
import "../css/FareRecipt.css";
import { addFareReceipt, getFareReceipts } from "../../services/googleSheetsAPI";

const FareReceipt = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    route: '',
    cashAmount: '',
    bankAmount: '',
    totalAmount: '',
    remarks: ''
  });

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const response = await getFareReceipts();
      if (response.success) {
        setReceipts(response.data || []);
      } else {
        setError(response.error || 'Failed to load receipts');
      }
    } catch (error) {
      setError('Error loading receipts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto calculate total amount
      if (name === 'cashAmount' || name === 'bankAmount') {
        const cash = parseFloat(name === 'cashAmount' ? value : updated.cashAmount) || 0;
        const bank = parseFloat(name === 'bankAmount' ? value : updated.bankAmount) || 0;
        updated.totalAmount = (cash + bank).toString();
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        cashAmount: parseFloat(formData.cashAmount) || 0,
        bankAmount: parseFloat(formData.bankAmount) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        submittedBy: currentUser.fullName || 'Unknown User'
      };

      const response = await addFareReceipt(submitData);

      if (response.success) {
        setSuccess('Fare receipt added successfully!');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          route: '',
          cashAmount: '',
          bankAmount: '',
          totalAmount: '',
          remarks: ''
        });
        loadReceipts(); // Reload the list
      } else {
        setError(response.error || 'Failed to add fare receipt');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fare-receipt-container">
      <div className="header">
        <h2><i className="bi bi-receipt"></i> Fare Receipt Management</h2>
      </div>

      {/* Add Receipt Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="bi bi-plus-circle"></i> Add New Fare Receipt</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Route</label>
                  <input
                    type="text"
                    className="form-control"
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                    placeholder="Enter route details"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Cash Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cashAmount"
                    value={formData.cashAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Bank Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="bankAmount"
                    value={formData.bankAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Total Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-control"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter any remarks"
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Adding...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Receipt
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Receipts List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5><i className="bi bi-list"></i> Recent Fare Receipts</h5>
          <button className="btn btn-outline-primary btn-sm" onClick={loadReceipts}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="card-body">
          {loading && <div className="text-center">Loading...</div>}

          {receipts.length === 0 && !loading ? (
            <div className="text-center text-muted">No fare receipts found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Route</th>
                    <th>Cash</th>
                    <th>Bank</th>
                    <th>Total</th>
                    <th>Submitted By</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt, index) => (
                    <tr key={receipt.id || index}>
                      <td>{new Date(receipt.date).toLocaleDateString()}</td>
                      <td>{receipt.route}</td>
                      <td>₹{receipt.cashAmount}</td>
                      <td>₹{receipt.bankAmount}</td>
                      <td><strong>₹{receipt.totalAmount}</strong></td>
                      <td>{receipt.submittedBy}</td>
                      <td>{receipt.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FareReceipt;