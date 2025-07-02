import React, { useState, useEffect } from "react";
import "../css/UnionPayment.css";
import { addUnionPayment, getUnionPayments } from "../../services/googleSheetsAPI";

function UnionPayment({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    unionName: "",
    cashAmount: "",
    bankAmount: "",
    totalAmount: "",
    remarks: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    loadUnionPayments();
  }, []);

  const loadUnionPayments = async () => {
    try {
      setLoadingEntries(true);
      const result = await getUnionPayments();

      if (result.success) {
        setEntries(result.data || []);

        // Update expense data
        const currentExpenses = expenseData.filter(expense => expense.category !== 'Union');
        const unionExpenses = (result.data || []).map(entry => ({
          id: entry.id,
          date: entry.date,
          type: 'Union Payment',
          amount: parseFloat(entry.totalAmount) || 0,
          category: 'Union',
          description: `Union Payment - ${entry.unionName}`,
          submittedBy: entry.submittedBy
        }));

        const updatedExpenses = [...currentExpenses, ...unionExpenses];
        setExpenseData(updatedExpenses);

        const total = updatedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalExpenses(total);
      }
    } catch (error) {
      console.error('Error loading union payments:', error);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate total amount
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

    if (!formData.unionName || !formData.totalAmount) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const submittedBy = localStorage.getItem('username') || 'Unknown';

      const dataToSubmit = {
        ...formData,
        cashAmount: parseFloat(formData.cashAmount) || 0,
        bankAmount: parseFloat(formData.bankAmount) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        submittedBy: submittedBy
      };

      const result = await addUnionPayment(dataToSubmit);

      if (result.success) {
        setSubmitStatus({ type: 'success', message: 'Union payment added successfully!' });

        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          unionName: "",
          cashAmount: "",
          bankAmount: "",
          totalAmount: "",
          remarks: ""
        });

        // Reload entries
        await loadUnionPayments();

        // Add to cash book
        setCashBookEntries(prev => [...prev, {
          id: Date.now(),
          date: formData.date,
          type: 'Expense',
          description: `Union Payment - ${formData.unionName}`,
          cashAmount: dataToSubmit.cashAmount,
          bankAmount: dataToSubmit.bankAmount,
          category: 'Union',
          submittedBy: submittedBy
        }]);

      } else {
        setSubmitStatus({ type: 'error', message: result.error || 'Failed to add union payment' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Error submitting data: ' + error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="union-payment-entry">
      <div className="row">
        {/* Form Section */}
        <div className="col-lg-4 col-md-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-people me-2"></i>
                Add Union Payment
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Union Name</label>
                  <input
                    type="text"
                    name="unionName"
                    className="form-control"
                    value={formData.unionName}
                    onChange={handleInputChange}
                    placeholder="e.g., Transport Union"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Cash Amount</label>
                      <input
                        type="number"
                        name="cashAmount"
                        className="form-control"
                        value={formData.cashAmount}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Bank Amount</label>
                      <input
                        type="number"
                        name="bankAmount"
                        className="form-control"
                        value={formData.bankAmount}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Total Amount</label>
                  <input
                    type="number"
                    name="totalAmount"
                    className="form-control"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    name="remarks"
                    className="form-control"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Optional remarks..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Union Payment
                    </>
                  )}
                </button>
              </form>

              {submitStatus && (
                <div className={`alert alert-${submitStatus.type === 'success' ? 'success' : 'danger'} mt-3`}>
                  {submitStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="col-lg-8 col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Recent Union Payments
              </h5>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={loadUnionPayments}
                disabled={loadingEntries}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
            <div className="card-body">
              {loadingEntries ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading union payments...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="text-muted mt-2">No union payments found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Union Name</th>
                        <th>Cash</th>
                        <th>Bank</th>
                        <th>Total</th>
                        <th>Remarks</th>
                        <th>By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{new Date(entry.date).toLocaleDateString()}</td>
                          <td>{entry.unionName}</td>
                          <td>Rs. {parseFloat(entry.cashAmount || 0).toLocaleString()}</td>
                          <td>Rs. {parseFloat(entry.bankAmount || 0).toLocaleString()}</td>
                          <td className="fw-bold">Rs. {parseFloat(entry.totalAmount || 0).toLocaleString()}</td>
                          <td>{entry.remarks || '-'}</td>
                          <td><small>{entry.submittedBy}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnionPayment;