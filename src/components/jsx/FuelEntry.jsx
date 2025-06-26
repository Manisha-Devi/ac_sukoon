
import React, { useState } from "react";
import "../css/FuelEntry.css";

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses }) {
  const [formData, setFormData] = useState({
    amount: "",
    liters: "",
    rate: "",
    date: "",
    pumpName: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: "fuel",
      ...formData,
    };
    setExpenseData([...expenseData, newEntry]);
    setTotalExpenses((prev) => prev + parseInt(formData.amount));
    setFormData({ amount: "", liters: "", rate: "", date: "", pumpName: "" });
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-fuel-pump me-2"></i>
        Fuel Expense Entry
      </h2>

      <div className="form-card">
        <h3>Add Fuel Expense</h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Liters</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.liters}
                onChange={(e) =>
                  setFormData({ ...formData, liters: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Rate per Liter (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Pump Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.pumpName}
                onChange={(e) =>
                  setFormData({ ...formData, pumpName: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Add Fuel Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FuelEntry;
