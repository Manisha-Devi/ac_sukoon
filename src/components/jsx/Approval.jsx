
import React, { useState, useEffect } from "react";
import "../css/Approval.css";
import { 
  addApprovalData, 
  getApprovalData,
  getFareReceipts,
  getFuelPayments,
  getAddaPayments,
  getUnionPayments,
  getServicePayments,
  getOtherPayments
} from "../../services/googleSheetsAPI";

const Approval = () => {
  const [formData, setFormData] = useState({
    submissionDate: new Date().toISOString().split('T')[0],
    managerName: '',
    cashHandover: '',
    bankAmount: '',
    remarks: '',
    status: 'Pending'
  });

  const [approvalData, setApprovalData] = useState([]);
  const [summary, setSummary] = useState({
    totalCashReceipts: 0,
    totalCashPayments: 0,
    totalBankReceipts: 0,
    totalBankPayments: 0,
    cashBalance: 0,
    bankBalance: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadApprovalData();
    calculateSummary();
  }, []);

  const loadApprovalData = async () => {
    try {
      setLoading(true);
      const response = await getApprovalData();
      if (response.success) {
        setApprovalData(response.data || []);
      } else {
        setError(response.error || 'Failed to load approval data');
      }
    } catch (error) {
      setError('Error loading approval data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = async () => {
    try {
      // Fetch all data from different sheets
      const [fareResponse, fuelResponse, addaResponse, unionResponse, serviceResponse, otherResponse] = await Promise.all([
        getFareReceipts(),
        getFuelPayments(),
        getAddaPayments(),
        getUnionPayments(),
        getServicePayments(),
        getOtherPayments()
      ]);

      let totalCashReceipts = 0;
      let totalBankReceipts = 0;
      let totalCashPayments = 0;
      let totalBankPayments = 0;

      // Calculate receipts (income)
      if (fareResponse.success && fareResponse.data) {
        fareResponse.data.forEach(item => {
          totalCashReceipts += item.cashAmount || 0;
          totalBankReceipts += item.bankAmount || 0;
        });
      }

      // Calculate payments (expenses)
      const paymentResponses = [fuelResponse, addaResponse, unionResponse, serviceResponse, otherResponse];
      paymentResponses.forEach(response => {
        if (response.success && response.data) {
          response.data.forEach(item => {
            totalCashPayments += item.cashAmount || 0;
            totalBankPayments += item.bankAmount || 0;
          });
        }
      });

      setSummary({
        totalCashReceipts,
        totalBankReceipts,
        totalCashPayments,
        totalBankPayments,
        cashBalance: totalCashReceipts - totalCashPayments,
        bankBalance: totalBankReceipts - totalBankPayments
      });

    } catch (error) {
      console.error('Error calculating summary:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        totalCashReceipts: summary.totalCashReceipts,
        totalCashPayments: summary.totalCashPayments,
        totalBankReceipts: summary.totalBankReceipts,
        totalBankPayments: summary.totalBankPayments,
        cashBalance: summary.cashBalance,
        bankBalance: summary.bankBalance,
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
          remarks: '',
          status: 'Pending'
        });
        loadApprovalData();
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
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-check-circle me-2"></i>
        Manager Approval
      </h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Cash Receipts</h6>
            <h4 className="text-success">₹{summary.totalCashReceipts.toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Bank Receipts</h6>
            <h4 className="text-primary">₹{summary.totalBankReceipts.toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Cash Payments</h6>
            <h4 className="text-danger">₹{summary.totalCashPayments.toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="summary-card">
            <h6>Bank Payments</h6>
            <h4 className="text-warning">₹{summary.totalBankPayments.toLocaleString('en-IN')}</h4>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="summary-card">
            <h6>Cash Balance</h6>
            <h4 className={summary.cashBalance >= 0 ? 'text-success' : 'text-danger'}>
              ₹{summary.cashBalance.toLocaleString('en-IN')}
            </h4>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="summary-card">
            <h6>Bank Balance</h6>
            <h4 className={summary.bankBalance >= 0 ? 'text-success' : 'text-danger'}>
              ₹{summary.bankBalance.toLocaleString('en-IN')}
            </h4>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3>Submit for Approval</h3>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
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
            <div className="col-md-6">
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
            <div className="col-md-6">
              <label className="form-label">Cash Handover Amount</label>
              <input
                type="number"
                className="form-control"
                name="cashHandover"
                value={formData.cashHandover}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="col-md-6">
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Submit for Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Approval History */}
      <div className="form-card mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Approval History</h3>
          <button className="btn btn-outline-primary btn-sm" onClick={loadApprovalData}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        
        {loading && <div className="text-center">Loading...</div>}

        {approvalData.length === 0 && !loading ? (
          <div className="text-center text-muted">No approval data found</div>
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
                {approvalData.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{new Date(item.submissionDate).toLocaleDateString()}</td>
                    <td>{item.managerName}</td>
                    <td>₹{item.cashHandover}</td>
                    <td>₹{item.bankAmount}</td>
                    <td className={item.cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                      ₹{item.cashBalance}
                    </td>
                    <td className={item.bankBalance >= 0 ? 'text-success' : 'text-danger'}>
                      ₹{item.bankBalance}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Approved' ? 'bg-success' : item.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.submittedBy}</td>
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

export default Approval;
