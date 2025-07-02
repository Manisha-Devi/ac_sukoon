import React, { useState, useEffect } from "react";
import "../css/Approval.css";
import { addApprovalData, getApprovalData } from "../../services/googleSheetsAPI";

const Approval = () => {
  const [formData, setFormData] = useState({
    submissionDate: new Date().toISOString().split('T')[0],
    managerName: '',
    cashHandover: '',
    bankAmount: '',
    totalCashReceipts: '',
    totalCashPayments: '',
    totalBankReceipts: '',
    totalBankPayments: '',
    cashBalance: '',
    bankBalance: '',
    remarks: '',
    status: 'Pending'
  });

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = await getApprovalData();
      if (response.success) {
        setApprovals(response.data || []);
      } else {
        setError(response.error || 'Failed to load approval data');
      }
    } catch (error) {
      setError('Error loading approvals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto calculate balances
      if (['totalCashReceipts', 'totalCashPayments', 'totalBankReceipts', 'totalBankPayments'].includes(name)) {
        const cashReceipts = parseFloat(updated.totalCashReceipts) || 0;
        const cashPayments = parseFloat(updated.totalCashPayments) || 0;
        const bankReceipts = parseFloat(updated.totalBankReceipts) || 0;
        const bankPayments = parseFloat(updated.totalBankPayments) || 0;

        updated.cashBalance = (cashReceipts - cashPayments).toString();
        updated.bankBalance = (bankReceipts - bankPayments).toString();
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
        cashHandover: parseFloat(formData.cashHandover) || 0,
        bankAmount: parseFloat(formData.bankAmount) || 0,
        totalCashReceipts: parseFloat(formData.totalCashReceipts) || 0,
        totalCashPayments: parseFloat(formData.totalCashPayments) || 0,
        totalBankReceipts: parseFloat(formData.totalBankReceipts) || 0,
        totalBankPayments: parseFloat(formData.totalBankPayments) || 0,
        cashBalance: parseFloat(formData.cashBalance) || 0,
        bankBalance: parseFloat(formData.bankBalance) || 0,
        submittedBy: currentUser.fullName || 'Unknown User'
      };

      const response = await addApprovalData(submitData);

      if (response.success) {
        setSuccess('Approval data submitted successfully!');
        setFormData({
          submissionDate: new Date().toISOString().split('T')[0],
          managerName: '',
          cashHandover: '',
          bankAmount: '',
          totalCashReceipts: '',
          totalCashPayments: '',
          totalBankReceipts: '',
          totalBankPayments: '',
          cashBalance: '',
          bankBalance: '',
          remarks: '',
          status: 'Pending'
        });
        loadApprovals();
      } else {
        setError(response.error || 'Failed to submit approval data');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approval-container">
      <div className="header">
        <h2><i className="bi bi-check-circle"></i> Manager Approval & Daily Summary</h2>
      </div>

      {/* Submit Approval Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="bi bi-plus-circle"></i> Submit Daily Summary for Approval</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Submission Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="submissionDate"
                    value={formData.submissionDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Manager Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleInputChange}
                    placeholder="Enter manager name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Cash Handover Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cashHandover"
                    value={formData.cashHandover}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
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
                    required
                  />
                </div>
              </div>
            </div>

            <h6>Daily Summary</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Total Cash Receipts</label>
                  <input
                    type="number"
                    className="form-control"
                    name="totalCashReceipts"
                    value={formData.totalCashReceipts}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Total Cash Payments</label>
                  <input
                    type="number"
                    className="form-control"
                    name="totalCashPayments"
                    value={formData.totalCashPayments}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Total Bank Receipts</label>
                  <input
                    type="number"
                    className="form-control"
                    name="totalBankReceipts"
                    value={formData.totalBankReceipts}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Total Bank Payments</label>
                  <input
                    type="number"
                    className="form-control"
                    name="totalBankPayments"
                    value={formData.totalBankPayments}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Cash Balance</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cashBalance"
                    value={formData.cashBalance}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    readOnly
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Bank Balance</label>
                  <input
                    type="number"
                    className="form-control"
                    name="bankBalance"
                    value={formData.bankBalance}
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
                placeholder="Enter any remarks or notes"
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Submit for Approval
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Approvals List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5><i className="bi bi-list"></i> Recent Approval Submissions</h5>
          <button className="btn btn-outline-primary btn-sm" onClick={loadApprovals}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="card-body">
          {loading && <div className="text-center">Loading...</div>}

          {approvals.length === 0 && !loading ? (
            <div className="text-center text-muted">No approval submissions found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Manager</th>
                    <th>Cash Handover</th>
                    <th>Bank Amount</th>
                    <th>Cash Balance</th>
                    <th>Bank Balance</th>
                    <th>Status</th>
                    <th>Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((approval, index) => (
                    <tr key={approval.id || index}>
                      <td>{new Date(approval.submissionDate).toLocaleDateString()}</td>
                      <td>{approval.managerName}</td>
                      <td>₹{approval.cashHandover}</td>
                      <td>₹{approval.bankAmount}</td>
                      <td>₹{approval.cashBalance}</td>
                      <td>₹{approval.bankBalance}</td>
                      <td>
                        <span className={`badge ${approval.status === 'Approved' ? 'bg-success' : 
                          approval.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>
                          {approval.status}
                        </span>
                      </td>
                      <td>{approval.submittedBy}</td>
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

export default Approval;