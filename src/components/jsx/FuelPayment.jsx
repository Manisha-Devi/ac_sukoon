
import React, { useState, useEffect } from "react";
import "../css/FuelPayment.css";
import { addFuelPayment, getFuelPayments } from "../../services/googleSheetsAPI";

const FuelPayment = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    pumpName: '',
    liters: '',
    ratePerLiter: '',
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
      const response = await getFuelPayments();
      if (response.success) {
        setPayments(response.data || []);
      } else {
        setError(response.error || 'Failed to load fuel payments');
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

      // Auto calculate amounts
      if (name === 'liters' || name === 'ratePerLiter') {
        const liters = parseFloat(name === 'liters' ? value : updated.liters) || 0;
        const rate = parseFloat(name === 'ratePerLiter' ? value : updated.ratePerLiter) || 0;
        const calculatedTotal = liters * rate;
        updated.totalAmount = calculatedTotal.toString();

        // If no manual cash/bank split, put all in cash
        if (!updated.cashAmount && !updated.bankAmount) {
          updated.cashAmount = calculatedTotal.toString();
          updated.bankAmount = '0';
        }
      }

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
        liters: parseFloat(formData.liters) || 0,
        ratePerLiter: parseFloat(formData.ratePerLiter) || 0,
        cashAmount: parseFloat(formData.cashAmount) || 0,
        bankAmount: parseFloat(formData.bankAmount) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        submittedBy: currentUser.fullName || 'Unknown User'
      };

      const response = await addFuelPayment(submitData);

      if (response.success) {
        setSuccess('Fuel payment added successfully!');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          pumpName: '',
          liters: '',
          ratePerLiter: '',
          cashAmount: '',
          bankAmount: '',
          totalAmount: '',
          remarks: ''
        });
        loadPayments();
      } else {
        setError(response.error || 'Failed to add fuel payment');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-fuel-pump me-2"></i>
        Fuel Payment Entry
      </h2>

      <div className="form-card">
        <h3>Add New Fuel Payment</h3>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
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
            <div className="col-md-6">
              <label className="form-label">Pump Name</label>
              <input
                type="text"
                className="form-control"
                name="pumpName"
                value={formData.pumpName}
                onChange={handleInputChange}
                placeholder="Enter petrol pump name"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Liters</label>
              <input
                type="number"
                className="form-control"
                name="liters"
                value={formData.liters}
                onChange={handleInputChange}
                placeholder="Enter liters"
                step="0.01"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Rate per Liter</label>
              <input
                type="number"
                className="form-control"
                name="ratePerLiter"
                value={formData.ratePerLiter}
                onChange={handleInputChange}
                placeholder="Enter rate"
                step="0.01"
                required
              />
            </div>
            <div className="col-md-4">
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
            <div className="col-md-4">
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
            <div className="col-md-4">
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
            <div className="col-12">
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
            <div className="col-12">
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
            </div>
          </div>
        </form>
      </div>

      {/* Recent Entries */}
      <div className="form-card mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Recent Entries</h3>
          <button className="btn btn-outline-primary btn-sm" onClick={loadPayments}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        
        {loading && <div className="text-center">Loading...</div>}

        {payments.length === 0 && !loading ? (
          <div className="text-center text-muted">No fuel payments found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pump Name</th>
                  <th>Liters</th>
                  <th>Rate/L</th>
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
                    <td>{payment.pumpName}</td>
                    <td>{payment.liters}L</td>
                    <td>₹{payment.ratePerLiter}</td>
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
  );
};

export default FuelPayment;
