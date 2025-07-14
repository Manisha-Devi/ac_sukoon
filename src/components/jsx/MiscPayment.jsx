import React, { useState, useEffect } from "react";
import "../css/MiscPayment.css";
import authService from "../../services/authService.js";
import SearchableSelect from "./SearchableSelect.jsx";

// Helper function to format date for display
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return dateStr;
  }
};

// Helper function to format time for display
const formatDisplayTime = (timestampStr) => {
  if (!timestampStr) return "";
  try {
    const date = new Date(timestampStr);
    if (isNaN(date.getTime())) return timestampStr;
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    return timestampStr;
  }
};

function MiscPayment({
  expenseData,
  setExpenseData,
  setTotalExpenses,
  currentUser,
}) {
  const [activeTab, setActiveTab] = useState("service");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [serviceData, setServiceData] = useState({
    date: "",
    serviceDetails: "",
    description: "",
    mechanicCenter: "",
    cashAmount: "",
    bankAmount: "",
  });

  const [otherData, setOtherData] = useState({
    date: "",
    paymentType: "",
    description: "",
    cashAmount: "",
    bankAmount: "",
  });

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Function to determine the date range based on user role
  const getDateRange = () => {
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];
    const userType = currentUser?.userType;
    
    if (userType === "Conductor") {
      // Conductor: 7 days past to current date + future dates enabled
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 7);
      
      return {
        min: pastDate.toISOString().split("T")[0],
        max: null // No max limit for future dates
      };
    } else if (userType === "Manager" || userType === "Admin") {
      // Manager and Admin: All dates enabled (no restrictions)
      return {
        min: null,
        max: null
      };
    } else {
      // Other users: Only current date and past dates enabled
      return {
        min: null,
        max: todayISO
      };
    }
  };

  const serviceDetailOptions = [
    "Engine Oil Change",
    "Engine Repair",
    "Engine Overhaul",
    "Engine Tune Up",
    "Brake Service",
    "Brake Pad Change",
    "Brake Oil Change",
    "Clutch Service",
    "Clutch Plate Change",
    "Clutch Oil Change",
    "Gear Box Service",
    "Gear Oil Change",
    "Transmission Repair",
    "AC Service",
    "AC Gas Filling",
    "AC Compressor Repair",
    "AC Filter Change",
    "Radiator Service",
    "Radiator Repair",
    "Coolant Change",
    "Battery Service",
    "Battery Change",
    "Alternator Repair",
    "Starter Motor Repair",
    "Electrical Work",
    "Wiring Repair",
    "Headlight Repair",
    "Tail Light Repair",
    "Horn Repair",
    "Indicator Repair",
    "Tyre Change",
    "Tyre Puncture",
    "Tyre Alignment",
    "Wheel Balancing",
    "Suspension Service",
    "Shock Absorber Change",
    "Spring Repair",
    "Steering Service",
    "Power Steering Oil",
    "Body Work",
    "Denting Work",
    "Painting Work",
    "Welding Work",
    "Glass Work",
    "Mirror Change",
    "Door Lock Repair",
    "Window Repair",
    "Seat Repair",
    "Interior Cleaning",
    "Upholstery Work",
    "Floor Mat Change",
    "Seat Cover Change",
    "Dashboard Repair",
    "Exhaust Service",
    "Silencer Change",
    "Catalytic Converter",
    "Fuel System Service",
    "Fuel Pump Repair",
    "Fuel Filter Change",
    "Carburetor Service",
    "Injector Cleaning",
    "Spark Plug Change",
    "Air Filter Change",
    "Oil Filter Change",
    "Fuel Tank Repair",
    "Speedometer Repair",
    "Odometer Service",
    "Music System Repair",
    "Speaker Change",
    "Antenna Repair",
    "GPS Installation",
    "CCTV Installation",
    "Fire Extinguisher Service",
    "First Aid Kit Refill",
    "Tool Kit Update",
    "Emergency Kit",
    "Safety Equipment",
    "Pollution Check",
    "Fitness Certificate",
    "Insurance Claim Work",
    "Accident Repair",
    "Complete Service",
    "Minor Service",
    "Major Service",
    "Pre-delivery Service",
    "Periodic Maintenance",
    "Preventive Maintenance",
    "Emergency Repair",
    "Roadside Assistance",
    "Towing Service",
    "Jump Start Service",
    "Lockout Service",
    "Flat Tyre Service",
    "Other Service"
  ];

  const otherPaymentDescriptions = [
    "Parking Fee",
    "Toll Tax",
    "Police Challan",
    "RTO Fee",
    "Insurance Premium",
    "Permit Fee",
    "Registration Fee",
    "Fitness Certificate",
    "Pollution Certificate",
    "Route Permit",
    "Tax Payment",
    "Fine Payment",
    "Document Fee",
    "Spare Parts",
    "Tyre Purchase",
    "Battery Purchase",
    "Oil Change",
    "Brake Service",
    "Clutch Service",
    "Engine Service",
    "AC Service",
    "Electrical Work",
    "Body Work",
    "Painting Work",
    "Welding Work",
    "Denting Work",
    "Glass Work",
    "Seat Cover",
    "Floor Mat",
    "Accessories",
    "Cleaning Material",
    "Tools Purchase",
    "Emergency Repair",
    "Towing Charge",
    "Driver Allowance",
    "Conductor Allowance",
    "Food Expense",
    "Accommodation",
    "Medical Expense",
    "Uniform Purchase",
    "Safety Equipment",
    "Fire Extinguisher",
    "First Aid Kit",
    "Communication Device",
    "GPS Device",
    "Entertainment System",
    "CCTV Camera",
    "Security System",
    "Stationery",
    "Office Supplies",
    "Printing Cost",
    "Photocopy Cost",
    "Legal Fee",
    "Consultant Fee",
    "Audit Fee",
    "Bank Charges",
    "Interest Payment",
    "Loan EMI",
    "Rent Payment",
    "Electricity Bill",
    "Water Bill",
    "Phone Bill",
    "Internet Bill",
    "Salary Payment",
    "Bonus Payment",
    "Overtime Payment",
    "Festival Bonus",
    "Incentive Payment",
    "Commission Payment",
    "Contractor Payment",
    "Vendor Payment",
    "Supplier Payment",
    "Maintenance Contract",
    "Annual Maintenance",
    "Washing Expense",
    "Cleaning Service",
    "Security Service",
    "Advertisement Cost",
    "Promotion Cost",
    "Donation",
    "Charity Payment",
    "Social Event",
    "Staff Welfare",
    "Training Cost",
    "Conference Fee",
    "Seminar Fee",
    "Workshop Fee",
    "Subscription Fee",
    "Membership Fee",
    "License Fee",
    "Software Cost",
    "Hardware Cost",
    "Equipment Purchase",
    "Furniture Purchase",
    "Fixture Purchase",
    "Renovation Cost",
    "Repair Work",
    "Maintenance Work",
    "Upgrade Cost",
    "Modernization Cost",
    "Safety Upgrade",
    "Compliance Cost",
    "Audit Cost",
    "Inspection Fee",
    "Certification Fee",
    "Testing Fee",
    "Calibration Fee",
    "Verification Fee",
    "Validation Cost",
    "Quality Check",
    "Emergency Fund",
    "Contingency Fund",
    "Miscellaneous",
    "Other Expense"
  ];

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cashAmount = parseInt(serviceData.cashAmount) || 0;
      const bankAmount = parseInt(serviceData.bankAmount) || 0;
      const totalAmount = cashAmount + bankAmount;
      const submittedBy = currentUser?.fullName || currentUser?.username || "Unknown User";
      const now = new Date();
      const timeOnly = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });

      if (editingEntry) {
        const oldTotal = editingEntry.totalAmount;
        const updatedData = expenseData.map((entry) =>
          entry.entryId === editingEntry.entryId
            ? {
                ...entry,
                date: serviceData.date,
                serviceDetails: serviceData.serviceDetails,
                description: serviceData.description,
                mechanicCenter: serviceData.mechanicCenter,
                cashAmount: cashAmount,
                bankAmount: bankAmount,
                totalAmount: totalAmount,
              }
            : entry,
        );

        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setServiceData({
          date: "",
          serviceDetails: "",
          description: "",
          mechanicCenter: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .updateServicePayment({
            entryId: editingEntry.entryId,
            updatedData: {
              date: serviceData.date,
              serviceDetails: serviceData.serviceDetails,
              description: serviceData.description,
              mechanicCenter: serviceData.mechanicCenter,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
            },
          })
          .catch((error) => {
            console.error("Background service update sync failed:", error);
          });
      } else {
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly,
          type: "service",
          date: serviceData.date,
          serviceDetails: serviceData.serviceDetails,
          description: serviceData.description,
          mechanicCenter: serviceData.mechanicCenter,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
          entryStatus: "pending",
        };

        const updatedData = [newEntry, ...expenseData];
        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev + totalAmount);
        setServiceData({
          date: "",
          serviceDetails: "",
          description: "",
          mechanicCenter: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .addServicePayment({
            entryId: newEntry.entryId,
            timestamp: timeOnly,
            date: serviceData.date,
            serviceDetails: serviceData.serviceDetails,
            description: serviceData.description,
            mechanicCenter: serviceData.mechanicCenter,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            submittedBy: submittedBy,
            entryStatus: "pending",
          })
          .catch((error) => {
            console.error("Background service add sync failed:", error);
          });
      }
    } catch (error) {
      console.error("Error submitting service payment:", error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || "Unknown error"}. Please try again.`);
    }
  };

  const handleOtherSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cashAmount = parseInt(otherData.cashAmount) || 0;
      const bankAmount = parseInt(otherData.bankAmount) || 0;
      const totalAmount = cashAmount + bankAmount;
      const submittedBy = currentUser?.fullName || currentUser?.username || "Unknown User";
      const now = new Date();
      const timeOnly = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });

      if (editingEntry) {
        const oldTotal = editingEntry.totalAmount;
        const updatedData = expenseData.map((entry) =>
          entry.entryId === editingEntry.entryId
            ? {
                ...entry,
                date: otherData.date,
                paymentType: otherData.paymentType,
                description: otherData.description,
                cashAmount: cashAmount,
                bankAmount: bankAmount,
                totalAmount: totalAmount,
              }
            : entry,
        );

        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setOtherData({
          date: "",
          paymentType: "",
          description: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .updateOtherPayment({
            entryId: editingEntry.entryId,
            updatedData: {
              date: otherData.date,
              paymentType: otherData.paymentType,
              description: otherData.description,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
            },
          })
          .catch((error) => {
            console.error("Background other update sync failed:", error);
          });
      } else {
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly,
          type: "other",
          date: otherData.date,
          paymentType: otherData.paymentType,
          description: otherData.description,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
          entryStatus: "pending",
        };

        const updatedData = [newEntry, ...expenseData];
        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev + totalAmount);
        setOtherData({
          date: "",
          paymentType: "",
          description: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .addOtherPayment({
            entryId: newEntry.entryId,
            timestamp: timeOnly,
            date: otherData.date,
            paymentType: otherData.paymentType,
            description: otherData.description,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            submittedBy: submittedBy,
            entryStatus: "pending",
          })
          .catch((error) => {
            console.error("Background other add sync failed:", error);
          });
      }
    } catch (error) {
      console.error("Error submitting other payment:", error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || "Unknown error"}. Please try again.`);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const entryToDelete = expenseData.find((entry) => entry.entryId === entryId);

      if (!entryToDelete) {
        alert("Entry not found!");
        return;
      }

      const updatedData = expenseData.filter((entry) => entry.entryId !== entryId);
      setExpenseData(updatedData);

      if (entryToDelete && entryToDelete.totalAmount) {
        setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
      }

      try {
        let deleteResult;
        if (entryToDelete.type === "service") {
          deleteResult = await authService.deleteServicePayment({
            entryId: entryToDelete.entryId,
          });
        } else if (entryToDelete.type === "other") {
          deleteResult = await authService.deleteOtherPayment({
            entryId: entryToDelete.entryId,
          });
        }
      } catch (syncError) {
        console.warn("Background delete sync failed:", syncError.message);
      }
    } catch (error) {
      console.error("Error in delete process:", error);
      alert("Error deleting entry. Please try again.");
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    if (entry.type === "service") {
      setActiveTab("service");
      setServiceData({
        date: entry.date,
        serviceDetails: entry.serviceDetails || "",
        description: entry.description || "",
        mechanicCenter: entry.mechanicCenter || "",
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
      });
    } else if (entry.type === "other") {
      setActiveTab("other");
      setOtherData({
        date: entry.date,
        paymentType: entry.paymentType,
        description: entry.description,
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setServiceData({
      date: "",
      serviceDetails: "",
      description: "",
      mechanicCenter: "",
      cashAmount: "",
      bankAmount: "",
    });
    setOtherData({
      date: "",
      paymentType: "",
      description: "",
      cashAmount: "",
      bankAmount: "",
    });
  };

  // Calculate totals for current user
  const calculateSummaryTotals = () => {
    const currentUserName = currentUser?.fullName || currentUser?.username;
    const userExpenseData = expenseData.filter(
      (entry) =>
        entry.submittedBy === currentUserName &&
        entry.entryStatus !== "approved" &&
        (entry.type === "service" || entry.type === "other"),
    );

    const totalCash = userExpenseData.reduce(
      (sum, entry) => sum + (entry.cashAmount || 0),
      0,
    );
    const totalBank = userExpenseData.reduce(
      (sum, entry) => sum + (entry.bankAmount || 0),
      0,
    );
    const grandTotal = totalCash + totalBank;

    return { totalCash, totalBank, grandTotal };
  };

  const getCurrentUserNonApprovedEntries = () => {
    const currentUserName = currentUser?.fullName || currentUser?.username;
    return expenseData.filter(
      (entry) =>
        entry.submittedBy === currentUserName &&
        entry.entryStatus !== "approved" &&
        (entry.type === "service" || entry.type === "other"),
    );
  };

  const { totalCash, totalBank, grandTotal } = calculateSummaryTotals();

  return (
    <div className="misc-payment-container">
      <div className="container-fluid">
        <div className="payment-header">
          <div className="header-content">
            <div>
              <h2>
                <i className="bi bi-wrench"></i> Misc Payment Entry
              </h2>
              <p>Record your miscellaneous expenses - Service & Other payments</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {(() => {
          const userEntries = getCurrentUserNonApprovedEntries();
          return userEntries.length > 0 ? (
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card cash-card">
                  <div className="card-body">
                    <h6>Cash Spent</h6>
                    <h4>₹{totalCash.toLocaleString("en-IN")}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card bank-card">
                  <div className="card-body">
                    <h6>Bank Payment</h6>
                    <h4>₹{totalBank.toLocaleString("en-IN")}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card total-card">
                  <div className="card-body">
                    <h6>Total Expenses</h6>
                    <h4>₹{grandTotal.toLocaleString("en-IN")}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="summary-card entries-card">
                  <div className="card-body">
                    <h6>Total Entries</h6>
                    <h4>{userEntries.length}</h4>
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Tab Navigation */}
        <div className="tab-navigation mb-4">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "service" ? "active" : ""}`}
                onClick={() => setActiveTab("service")}
              >
                <i className="bi bi-gear"></i> Service
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "other" ? "active" : ""}`}
                onClick={() => setActiveTab("other")}
              >
                <i className="bi bi-three-dots"></i> Other
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "service" && (
            <div className="payment-form-card">
              <h4>
                <i className="bi bi-gear"></i> Add Service
              </h4>
              <form onSubmit={handleServiceSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control date-input"
                      value={serviceData.date}
                      onChange={(e) =>
                        setServiceData({ ...serviceData, date: e.target.value })
                      }
                      onFocus={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                      placeholder="Select date"
                      min={getDateRange().min}
                      max={getDateRange().max}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Service Details</label>
                    <SearchableSelect
                      options={serviceDetailOptions}
                      value={serviceData.serviceDetails}
                      onChange={(value) =>
                        setServiceData({ ...serviceData, serviceDetails: value })
                      }
                      placeholder="Type to search service details..."
                      allowCustom={true}
                      name="serviceDetails"
                      className="service-details-selector"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={serviceData.description}
                      onChange={(e) =>
                        setServiceData({
                          ...serviceData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter detailed description of service work (optional)"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Mechanic/Service Center (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={serviceData.mechanicCenter}
                      onChange={(e) =>
                        setServiceData({
                          ...serviceData,
                          mechanicCenter: e.target.value,
                        })
                      }
                      placeholder="Enter mechanic or service center name"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cash Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={serviceData.cashAmount}
                      onChange={(e) =>
                        setServiceData({
                          ...serviceData,
                          cashAmount: e.target.value,
                        })
                      }
                      placeholder="Enter cash amount"
                      min="0"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bank Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={serviceData.bankAmount}
                      onChange={(e) =>
                        setServiceData({
                          ...serviceData,
                          bankAmount: e.target.value,
                        })
                      }
                      placeholder="Enter bank amount"
                      min="0"
                    />
                  </div>
                </div>
                <div className="amount-summary mb-3">
                  <div className="row">
                    <div className="col-4">
                      <span>Cash: ₹{parseInt(serviceData.cashAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <span>Bank: ₹{parseInt(serviceData.bankAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <strong>
                        Total: ₹
                        {(parseInt(serviceData.cashAmount) || 0) +
                          (parseInt(serviceData.bankAmount) || 0)}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="button-group">
                  <button
                    type="submit"
                    className="btn payment-entry-btn"
                    disabled={isLoading}
                  >
                    <i
                      className={
                        isLoading
                          ? "bi bi-arrow-repeat"
                          : editingEntry
                            ? "bi bi-check-circle"
                            : "bi bi-plus-circle"
                      }
                    ></i>
                    {isLoading
                      ? "Processing..."
                      : editingEntry
                        ? "Update Entry"
                        : "Add Service Entry"}
                  </button>
                  {editingEntry && (
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={handleCancelEdit}
                    >
                      <i className="bi bi-x-circle"></i> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === "other" && (
            <div className="payment-form-card">
              <h4>
                <i className="bi bi-three-dots"></i> Add Other Payment
              </h4>
              <form onSubmit={handleOtherSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control date-input"
                      value={otherData.date}
                      onChange={(e) =>
                        setOtherData({ ...otherData, date: e.target.value })
                      }
                      onFocus={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                      placeholder="Select date"
                      min={getDateRange().min}
                      max={getDateRange().max}
                      required
                    />
                  </div>
                   <div className="col-md-6 mb-3">
                    <label className="form-label">Payment Type</label>
                    <SearchableSelect
                      options={otherPaymentDescriptions}
                      value={otherData.paymentType}
                      onChange={(value) =>
                        setOtherData({ ...otherData, paymentType: value })
                      }
                      placeholder="Type to search payment types..."
                      allowCustom={true}
                      name="paymentType"
                      className="payment-type-selector"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={otherData.description}
                      onChange={(e) =>
                        setOtherData({ ...otherData, description: e.target.value })
                      }
                      placeholder="Enter detailed description of payment (optional)"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cash Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={otherData.cashAmount}
                      onChange={(e) =>
                        setOtherData({
                          ...otherData,
                          cashAmount: e.target.value,
                        })
                      }
                      placeholder="Enter cash amount"
                      min="0"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bank Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={otherData.bankAmount}
                      onChange={(e) =>
                        setOtherData({
                          ...otherData,
                          bankAmount: e.target.value,
                        })
                      }
                      placeholder="Enter bank amount"
                      min="0"
                    />
                  </div>
                </div>
                <div className="amount-summary mb-3">
                  <div className="row">
                    <div className="col-4">
                      <span>Cash: ₹{parseInt(otherData.cashAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <span>Bank: ₹{parseInt(otherData.bankAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <strong>
                        Total: ₹
                        {(parseInt(otherData.cashAmount) || 0) +
                          (parseInt(otherData.bankAmount) || 0)}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="button-group">
                  <button
                    type="submit"
                    className="btn payment-entry-btn"
                    disabled={isLoading}
                  >
                    <i
                      className={
                        isLoading
                          ? "bi bi-arrow-repeat"
                          : editingEntry
                            ? "bi bi-check-circle"
                            : "bi bi-plus-circle"
                      }
                    ></i>
                    {isLoading
                      ? "Processing..."
                      : editingEntry
                        ? "Update Entry"
                        : "Add Other Entry"}
                  </button>
                  {editingEntry && (
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={handleCancelEdit}
                    >
                      <i className="bi bi-x-circle"></i> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Recent Entries */}
        {(() => {
          const userEntries = getCurrentUserNonApprovedEntries();
          return userEntries.length > 0 ? (
            <div className="recent-entries mt-4">
              <h4>Recent Entries</h4>
              <div className="row">
                {userEntries.slice(0, 6).map((entry) => (
                  <div key={entry.entryId} className="col-md-6 col-lg-4 mb-3">
                    <div className="entry-card">
                      <div className="card-body">
                        <div className="entry-header">
                          <span className={`entry-type ${entry.type}`}>
                            {entry.type === "service" ? "Service" : "Other"}
                          </span>

                          {entry.entryStatus === "pending" && (
                            <>
                              <button
                                className="btn btn-sm btn-edit"
                                onClick={() => handleEditEntry(entry)}
                                title="Edit Entry"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-delete"
                                onClick={() => handleDeleteEntry(entry.entryId)}
                                title="Delete Entry"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                        <div className="entry-date">
                          <small className="text-muted">
                            <div>{formatDisplayDate(entry.date)}</div>
                            <div className="timestamp">
                              {formatDisplayTime(entry.timestamp)}
                            </div>
                          </small>
                        </div>
                        <div className="entry-content">
                          {entry.type === "service" && (
                            <div>
                              <p><strong>{entry.serviceDetails}</strong></p>
                              {entry.mechanicCenter && (
                                <p><small>@ {entry.mechanicCenter}</small></p>
                              )}
                              {entry.description && (
                                <p><small>{entry.description.substring(0, 60)}...</small></p>
                              )}
                            </div>
                          )}
                          {entry.type === "other" && (
                            <div>
                              <p><strong>{entry.paymentType}</strong></p>
                              {entry.description && (
                                <p><small>{entry.description.substring(0, 60)}...</small></p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="entry-amounts">
                          <div className="amount-row">
                            <span>Cash: ₹{entry.cashAmount}</span>
                            <span>Bank: ₹{entry.bankAmount}</span>
                          </div>
                          <div className="total-amount">
                            <strong>Total: ₹{entry.totalAmount}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}

export default MiscPayment;