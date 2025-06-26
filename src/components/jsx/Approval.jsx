
import React, { useState } from "react";
import "../css/Approval.css";

function Approval({ fareData, expenseData, cashBookEntries }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [settlementData, setSettlementData] = useState({
    cashSettlement: "",
    bankSettlement: "",
    settlementWith: "",
    remarks: ""
  });

  // Calculate totals from cashBookEntries
  const calculateTotals = () => {
    let totalCashReceipts = 0;
    let totalCashPayments = 0;
    let totalBankReceipts = 0;
    let totalBankPayments = 0;

    cashBookEntries.forEach(entry => {
      if (entry.type === 'receipt') {
        totalCashReceipts += entry.cashAmount || 0;
        totalBankReceipts += entry.bankAmount || 0;
      } else if (entry.type === 'payment') {
        totalCashPayments += entry.cashAmount || 0;
        totalBankPayments += entry.bankAmount || 0;
      }
    });

    const cashBalance = totalCashReceipts - totalCashPayments;
    const bankBalance = totalBankReceipts - totalBankPayments;

    return {
      totalCashReceipts,
      totalCashPayments,
      totalBankReceipts,
      totalBankPayments,
      cashBalance,
      bankBalance
    };
  };

  const totals = calculateTotals();

  const handleSendForApproval = () => {
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = (e) => {
    e.preventDefault();
    // Here you can handle the approval submission
    console.log("Approval submitted:", { totals, settlementData });
    alert("Data sent for approval successfully!");
    setShowApprovalModal(false);
    setSettlementData({
      cashSettlement: "",
      bankSettlement: "",
      settlementWith: "",
      remarks: ""
    });
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setSettlementData({
      cashSettlement: "",
      bankSettlement: "",
      settlementWith: "",
      remarks: ""
    });
  };

  return (
    <div className="approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <h2><i className="bi bi-check-circle"></i> Data Summary & Approval</h2>
          <p>Review your financial data and send for approval</p>
        </div>

        {/* Data Summary Cards */}
        <div className="row mb-4">
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card cash-receipts">
              <div className="card-body">
                <h6>Total Cash Receipts</h6>
                <h4>₹{totals.totalCashReceipts.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card cash-payments">
              <div className="card-body">
                <h6>Total Cash Payments</h6>
                <h4>₹{totals.totalCashPayments.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card bank-receipts">
              <div className="card-body">
                <h6>Total Bank Receipts</h6>
                <h4>₹{totals.totalBankReceipts.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card bank-payments">
              <div className="card-body">
                <h6>Total Bank Payments</h6>
                <h4>₹{totals.totalBankPayments.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card cash-balance">
              <div className="card-body">
                <h6>Cash Balance</h6>
                <h4>₹{totals.cashBalance.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card bank-balance">
              <div className="card-body">
                <h6>Bank Balance</h6>
                <h4>₹{totals.bankBalance.toLocaleString()}</h4>
              </div>
            </div>
          </div>
        </div>

        

        {/* Send for Approval Button */}
        <div className="text-center">
          <button 
            className="btn btn-lg approval-btn"
            onClick={handleSendForApproval}
          >
            <i className="bi bi-send"></i>
            Send for Approval
          </button>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5><i className="bi bi-check-circle"></i> Send for Approval</h5>
                <button className="btn-close" onClick={handleCloseModal}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleApprovalSubmit}>
                  {/* Settlement Options - Only show if there's cash balance */}
                  {totals.cashBalance > 0 && (
                    <div className="settlement-section mb-4">
                      <h6 className="mb-3">Settlement Options</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Cash Settlement Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            value={settlementData.cashSettlement}
                            onChange={(e) => setSettlementData({...settlementData, cashSettlement: e.target.value})}
                            placeholder="Enter cash settlement amount"
                            max={totals.cashBalance}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Bank Settlement Amount</label>
                          <input
                            type="number"
                            className="form-control"
                            value={settlementData.bankSettlement}
                            onChange={(e) => setSettlementData({...settlementData, bankSettlement: e.target.value})}
                            placeholder="Enter bank settlement amount"
                            max={totals.bankBalance}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12 mb-3">
                          <label className="form-label">Settlement With</label>
                          <input
                            type="text"
                            className="form-control"
                            value={settlementData.settlementWith}
                            onChange={(e) => setSettlementData({...settlementData, settlementWith: e.target.value})}
                            placeholder="Enter person/entity name"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settlementData.remarks}
                      onChange={(e) => setSettlementData({...settlementData, remarks: e.target.value})}
                      placeholder="Add any additional remarks..."
                    ></textarea>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-send"></i>
                      Submit for Approval
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Approval;
