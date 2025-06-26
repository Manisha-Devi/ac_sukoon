
import React, { useState } from "react";
import "../css/Approval.css";

function Approval({ cashBookEntries }) {
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementDescription, setSettlementDescription] = useState('');

  // Calculate totals from cash book entries
  const drEntries = cashBookEntries.filter(entry => entry.type === 'dr');
  const crEntries = cashBookEntries.filter(entry => entry.type === 'cr');

  const totalCashReceipts = drEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalBankReceipts = drEntries.reduce((sum, entry) => sum + entry.bankAmount, 0);
  const totalCashPayments = crEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalBankPayments = crEntries.reduce((sum, entry) => sum + entry.bankAmount, 0);

  const cashBalance = totalCashReceipts - totalCashPayments;
  const bankBalance = totalBankReceipts - totalBankPayments;

  const handleSendForApproval = () => {
    if (cashBalance > 0) {
      setShowSettlementModal(true);
    } else {
      // Direct approval without settlement
      alert('Data sent for approval successfully!');
    }
  };

  const handleSettlementSubmit = () => {
    if (!settlementAmount || !settlementDescription) {
      alert('Please fill all settlement details');
      return;
    }
    
    alert(`Settlement of ₹${settlementAmount} sent for approval with cash balance!`);
    setShowSettlementModal(false);
    setSettlementAmount('');
    setSettlementDescription('');
  };

  return (
    <div className="approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <h2><i className="bi bi-check-circle"></i> Data Approval</h2>
          <p>Review your financial summary and send for approval</p>
        </div>

        {/* Data Summary Section */}
        <div className="data-summary-section">
          <h4 className="mb-4">
            <i className="bi bi-bar-chart"></i> Financial Summary
          </h4>
          
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cash-receipts-card">
                <div className="card-body">
                  <h6>Total Cash Receipts</h6>
                  <h4>₹{totalCashReceipts.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cash-payments-card">
                <div className="card-body">
                  <h6>Total Cash Payments</h6>
                  <h4>₹{totalCashPayments.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card bank-receipts-card">
                <div className="card-body">
                  <h6>Total Bank Receipts</h6>
                  <h4>₹{totalBankReceipts.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card bank-payments-card">
                <div className="card-body">
                  <h6>Total Bank Payments</h6>
                  <h4>₹{totalBankPayments.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Cards */}
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

          {/* All Receipts and Payments Summary */}
          <div className="transactions-summary">
            <h5 className="mb-3">
              <i className="bi bi-list-check"></i> All Receipts and Payments Summary
            </h5>
            
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Cash Amount</th>
                    <th>Bank Amount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cashBookEntries.map((entry, index) => (
                    <tr key={index}>
                      <td>{new Date(entry.date).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`badge ${entry.type === 'dr' ? 'bg-success' : 'bg-danger'}`}>
                          {entry.type === 'dr' ? 'Receipt' : 'Payment'}
                        </span>
                      </td>
                      <td>{entry.particulars || entry.description}</td>
                      <td className={entry.type === 'dr' ? 'text-success' : 'text-danger'}>
                        ₹{entry.cashAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </td>
                      <td className={entry.type === 'dr' ? 'text-success' : 'text-danger'}>
                        ₹{entry.bankAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </td>
                      <td className={entry.type === 'dr' ? 'text-success' : 'text-danger'}>
                        ₹{(entry.cashAmount + entry.bankAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Send for Approval Button */}
          <div className="approval-actions text-center mt-4">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleSendForApproval}
              disabled={cashBookEntries.length === 0}
            >
              <i className="bi bi-send"></i> Send for Approval
            </button>
          </div>
        </div>

        {/* Settlement Modal */}
        {showSettlementModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-cash-coin"></i> Settlement Required
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowSettlementModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle"></i>
                    <strong> Cash Balance Available: ₹{cashBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong>
                    <br />
                    Please specify settlement details for the cash balance.
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Settlement Amount *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(e.target.value)}
                      placeholder="Enter amount to settle"
                      max={cashBalance}
                    />
                    <small className="text-muted">Maximum: ₹{cashBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</small>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Settlement Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settlementDescription}
                      onChange={(e) => setSettlementDescription(e.target.value)}
                      placeholder="Describe settlement details (e.g., who received the cash, purpose, etc.)"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowSettlementModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSettlementSubmit}
                  >
                    <i className="bi bi-send"></i> Send with Settlement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {cashBookEntries.length === 0 && (
          <div className="no-data text-center py-5">
            <i className="bi bi-clipboard-x display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No Data Available</h4>
            <p className="text-muted">Add some receipts or payments to view the approval summary.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Approval;
