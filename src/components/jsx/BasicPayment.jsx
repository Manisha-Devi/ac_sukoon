
import React, { useState, useEffect } from "react";
import "../css/BasicPayment.css";
import FuelEntry from "./FuelPayment.jsx";
import AddaPayment from "./AddaPayment.jsx";
import UnionPaymentEntry from "./UnionPayment.jsx";

function BasicPayment({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [activeTab, setActiveTab] = useState("fuel");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate totals for summary - only for current user
  const calculateSummaryTotals = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    const userExpenseData = expenseData.filter(entry => 
      (entry.type === 'fuel' || entry.type === 'adda' || entry.type === 'union') &&
      entry.submittedBy === currentUserName
    );

    const fuelTotal = userExpenseData.filter(entry => entry.type === 'fuel')
      .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const addaTotal = userExpenseData.filter(entry => entry.type === 'adda')
      .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const unionTotal = userExpenseData.filter(entry => entry.type === 'union')
      .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);

    const totalCash = userExpenseData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
    const totalBank = userExpenseData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
    const grandTotal = totalCash + totalBank;

    return { fuelTotal, addaTotal, unionTotal, totalCash, totalBank, grandTotal, totalEntries: userExpenseData.length };
  };

  const { fuelTotal, addaTotal, unionTotal, totalCash, totalBank, grandTotal, totalEntries } = calculateSummaryTotals();

  return (
    <div className="basic-payment-container">
      <div className="container-fluid">
        <div className="basic-payment-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-credit-card"></i> Basic Payment Entry</h2>
              <p>Record your basic expenses - Fuel, Adda & Union payments</p>
            </div>
            <div className="sync-status">
              <div className={`simple-sync-indicator ${isLoading ? 'syncing' : 'synced'}`}>
                {isLoading ? (
                  <i className="bi bi-arrow-clockwise"></i>
                ) : (
                  <i className="bi bi-check-circle"></i>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Only show when user has entries */}
        {totalEntries > 0 && (
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cash-card">
                <div className="card-body">
                  <h6>Cash Expense</h6>
                  <h4>₹{totalCash.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card bank-card">
                <div className="card-body">
                  <h6>Bank Transfer</h6>
                  <h4>₹{totalBank.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card total-card">
                <div className="card-body">
                  <h6>Total Expenses</h6>
                  <h4>₹{grandTotal.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card entries-card">
                <div className="card-body">
                  <h6>Total Entries</h6>
                  <h4>{totalEntries}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown - Only show when user has entries */}
        {totalEntries > 0 && (
          <div className="row mb-4">
            <div className="col-md-4 col-sm-6 mb-3">
              <div className="category-card fuel-category">
                <div className="card-body">
                  <h6><i className="bi bi-fuel-pump"></i> Fuel Expenses</h6>
                  <h4>₹{fuelTotal.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6 mb-3">
              <div className="category-card adda-category">
                <div className="card-body">
                  <h6><i className="bi bi-building"></i> Adda Expenses</h6>
                  <h4>₹{addaTotal.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6 mb-3">
              <div className="category-card union-category">
                <div className="card-body">
                  <h6><i className="bi bi-people"></i> Union Expenses</h6>
                  <h4>₹{unionTotal.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation mb-4">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'fuel' ? 'active' : ''}`}
                onClick={() => setActiveTab('fuel')}
              >
                <i className="bi bi-fuel-pump"></i> Fuel Payment
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'adda' ? 'active' : ''}`}
                onClick={() => setActiveTab('adda')}
              >
                <i className="bi bi-building"></i> Adda Payment
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'union' ? 'active' : ''}`}
                onClick={() => setActiveTab('union')}
              >
                <i className="bi bi-people"></i> Union Payment
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'fuel' && (
            <FuelEntry
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
              setCashBookEntries={setCashBookEntries}
            />
          )}

          {activeTab === 'adda' && (
            <AddaPayment
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
              setCashBookEntries={setCashBookEntries}
            />
          )}

          {activeTab === 'union' && (
            <UnionPaymentEntry
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              setTotalExpenses={setTotalExpenses}
              setCashBookEntries={setCashBookEntries}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BasicPayment;
