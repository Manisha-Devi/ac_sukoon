
import React, { useState } from "react";

function AddaFeesEntry() {
  const [formData, setFormData] = useState({
    type: "adda",
    amount: "",
    description: "",
    date: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Adda/Agent fees:", formData);
    setFormData({ type: "adda", amount: "", description: "", date: "" });
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-building me-2"></i>
        Adda & Agent Fees
      </h2>

      <div className="form-card">
        <h3>Add Fees Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              >
                <option value="adda">Adda Fees</option>
                <option value="agent">Agent Fees</option>
              </select>
            </div>

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
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Add Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddaFeesEntry;
