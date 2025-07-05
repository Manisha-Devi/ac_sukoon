
import React, { useState, useEffect } from "react";
import "../css/BankSummary.css";

function BankSummary({ fareData, expenseData }) {
  const [filteredData, setFilteredData] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    filterUserData();
  }, [fareData, expenseData, dateFrom, dateTo, currentUser]);

  const filterUserData = () => {
    if (!currentUser) return;

    const currentUserName = currentUser.fullName || currentUser.username;
    let allData = [];

    // Filter fare data for current user
    if (fareData && fareData.length > 0) {
      const userFareData = fareData.filter(entry => 
        entry.submittedBy === currentUserName && entry.bankAmount > 0
      );
      allData = [...allData, ...userFareData.map(entry => ({
        ...entry,
        type: 'income',
        description: entry.route || entry.bookingDetails || 'Fare Collection'
      }))];
    }

    // Filter expense data for current user
    if (expenseData && expenseData.length > 0) {
      const userExpenseData = expenseData.filter(entry => 
        entry.submittedBy === currentUserName && entry.bankAmount > 0
      );
      allData = [...allData, ...userExpenseData.map(entry => ({
        ...entry,
        type: 'expense',
        description: entry.pumpName || entry.addaName || entry.unionName || 
                    entry.serviceType || entry.paymentDetails || 'Payment'
      }))];
    }

    // Apply date filter if dates are selected
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      
      allData = allData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }

    // Sort by date (newest first)
    allData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredData(allData);
  };

  const clearFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  // Calculate totals
  const totalBankIncome = filteredData
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

  const totalBankExpense = filteredData
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

  const bankBalance = totalBankIncome - totalBankExpense;

  return (
    <div className="bank-summary-container">
      <div className="summary-header">
        <h3><i className="bi bi-bank"></i> Bank Summary</h3>
        <small className="text-muted">Use navbar refresh icon to update data</small>
      </div>

      {/* Date Filter */}
      <div className="date-filter mb-3">
        <div className="row align-items-end">
          <div className="col-md-3">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={clearFilter}
              disabled={!dateFrom && !dateTo}
            >
              <i className="bi bi-x-circle"></i> Clear
            </button>
          </div>
          <div className="col-md-3">
            <small className="text-muted">
              {filteredData.length} entries
            </small>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="summary-card income-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-up-circle"></i> Bank Income</h6>
              <h4 className="text-success">₹{totalBankIncome.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card expense-card">
            <div className="card-body">
              <h6><i className="bi bi-arrow-down-circle"></i> Bank Expense</h6>
              <h4 className="text-danger">₹{totalBankExpense.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card balance-card">
            <div className="card-body">
              <h6><i className="bi bi-calculator"></i> Bank Balance</h6>
              <h4 className={bankBalance >= 0 ? 'text-success' : 'text-danger'}>
                ₹{Math.abs(bankBalance).toLocaleString()}
                {bankBalance < 0 && ' (Overdraft)'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-list">
        <h5>Bank Transactions</h5>
        {filteredData.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Bank Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry, index) => (
                  <tr key={`${entry.entryId || index}`}>
                    <td>{new Date(entry.date).toLocaleDateString('en-IN')}</td>
                    <td>{entry.description}</td>
                    <td>
                      <span className={`badge ${entry.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                        {entry.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className={entry.type === 'income' ? 'text-success' : 'text-danger'}>
                      ₹{(entry.bankAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data text-center py-4">
            <i className="bi bi-inbox display-4 text-muted"></i>
            <p className="text-muted mt-2">No bank transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BankSummary;
