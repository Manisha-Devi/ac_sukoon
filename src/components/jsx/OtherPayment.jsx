import React, { useState, useEffect } from "react";
import "../css/OtherPayment.css";
import { addOtherPayment, getOtherPayments } from "../../services/googleSheetsAPI";

const OtherPayment = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paymentType: '',
    description: '',
    cashAmount: '',
    bankAmount: '',
    totalAmount: '',
    category: '',
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
      const response = await getOtherPayments();
      if (response.success) {
        setPayments(response.data || []);
      } else {
        setError(response.error || 'Failed to load other payments');
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

      const response = await addOtherPayment(submitData);

      if (response.success) {
        setSuccess('Other payment added successfully!');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          paymentType: '',
          description: '',
          cashAmount: '',
          bankAmount: '',
          totalAmount: '',
          category: '',
          remarks: ''
        });
        loadPayments();
      } else {
        setError(response.error || 'Failed to add other payment');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="other-payment-container">
      <div className="header">
        <h2><i className="bi bi-wallet2"></i> Other Payment Management</h2>
      </div>

      {/* Add Payment Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="bi bi-plus-circle"></i> Add New Other Payment</h5>
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
                  <label className="form-label">Payment Type</label>
                  <select
                    className="form-control"
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Payment Type</option>
                    <option value="Insurance">Insurance</option>
                    <option value="License Fee">License Fee</option>
                    <option value="Permit Fee">Permit Fee</option>
                    <option value="Fine/Penalty">Fine/Penalty</option>
                    <option value="Parking Fee">Parking Fee</option>
                    <option value="Toll Tax">Toll Tax</option>
                    <option value="Office Expense">Office Expense</option>
                    <option value="Emergency Expense">Emergency Expense</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter payment description"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Vehicle Related">Vehicle Related</option>
                    <option value="Legal/Compliance">Legal/Compliance</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
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
          <h5><i className="bi bi-list"></i> Recent Other Payments</h5>
          <button className="btn btn-outline-primary btn-sm" onClick={loadPayments}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="card-body">
          {loading && <div className="text-center">Loading...</div>}

          {payments.length === 0 && !loading ? (
            <div className="text-center text-muted">No other payments found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Cash</th>
                    <th>Bank</th>
                    <th>Total</th>
                    <th>Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={payment.id || index}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>{payment.paymentType}</td>
                      <td>{payment.description}</td>
                      <td>{payment.category}</td>
                      <td>₹{payment.cashAmount}</td>
                      <td>₹{payment.bankAmount}</td>
                      <td><strong>₹{payment.totalAmount}</strong></td>
                      <td>{payment.submittedBy}</td>
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

export default OtherPayment;