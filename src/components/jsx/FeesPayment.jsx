import React, { useState, useEffect } from "react";
import "../css/FeesPayment.css";
import { addAddaPayment, getAddaPayments } from "../../services/googleSheetsAPI";

const FeesPayment = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    addaName: '',
    cashAmount: '',
    bankAmount: '',
    totalAmount: '',
    remarks: ''
  });

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await getAddaPayments();
      if (response.success) {
        setPayments(response.data || []);
      } else {
        setError(response.error || 'Failed to load adda payments');
      }
    } catch (error) {
      setError('Error loading payments: ' + error.message);
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

      const response = await addAddaPayment(submitData);

      if (response.success) {
        setSuccess('Adda payment added successfully!');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          addaName: '',
          cashAmount: '',
          bankAmount: '',
          totalAmount: '',
          remarks: ''
        });
        loadPayments();
      } else {
        setError(response.error || 'Failed to add adda payment');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fees-payment-container">
      <div className="header">
        <h2><i className="bi bi-building"></i> Adda/Terminal Fees Payment</h2>
      </div>

      {/* Add Payment Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="bi bi-plus-circle"></i> Add New Adda Payment</h5>
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
                  <label className="form-label">Adda/Terminal Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="addaName"
                    value={formData.addaName}
                    onChange={handleInputChange}
                    placeholder="Enter adda or terminal name"
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
                  Add Payment
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Payments List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5><i className="bi bi-list"></i> Recent Adda Payments</h5>
          <button className="btn btn-outline-primary btn-sm" onClick={loadPayments}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="card-body">
          {loading && <div className="text-center">Loading...</div>}

          {payments.length === 0 && !loading ? (
            <div className="text-center text-muted">No adda payments found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Adda/Terminal</th>
                    <th>Cash</th>
                    <th>Bank</th>
                    <th>Total</th>
                    <th>Submitted By</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={payment.id || index}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>{payment.addaName}</td>
                      <td>₹{payment.cashAmount}</td>
                      <td>₹{payment.bankAmount}</td>
                      <td><strong>₹{payment.totalAmount}</strong></td>
                      <td>{payment.submittedBy}</td>
                      <td>{payment.remarks}</td>
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

export default FeesPayment;