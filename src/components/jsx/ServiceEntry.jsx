
import React, { useState } from "react";
import "../css/ServiceEntry.css";

function ServiceEntry() {
  const [formData, setFormData] = useState({
    serviceType: "",
    amount: "",
    description: "",
    date: "",
    mechanic: "",
  });

  const serviceTypes = [
    "Engine Service",
    "Brake Service",
    "Tire Change",
    "Oil Change",
    "General Maintenance",
    "Repair Work",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Service entry:", formData);
    setFormData({
      serviceType: "",
      amount: "",
      description: "",
      date: "",
      mechanic: "",
    });
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-tools me-2"></i>
        Service Expense Entry
      </h2>

      <div className="form-card">
        <h3>Add Service Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Service Type</label>
              <select
                className="form-select"
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData({ ...formData, serviceType: e.target.value })
                }
                required
              >
                <option value="">Select Service Type</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
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

            <div className="col-md-6">
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

            <div className="col-md-6">
              <label className="form-label">Mechanic/Service Center</label>
              <input
                type="text"
                className="form-control"
                value={formData.mechanic}
                onChange={(e) =>
                  setFormData({ ...formData, mechanic: e.target.value })
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
                Add Service Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceEntry;
