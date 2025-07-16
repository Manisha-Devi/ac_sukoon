import React, { useState, useEffect } from "react";
import "../css/BasicPayment.css";
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

function BasicPayment({
  expenseData,
  setExpenseData,
  setTotalExpenses,
  currentUser,
}) {
  const [activeTab, setActiveTab] = useState("fuel");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [fuelData, setFuelData] = useState({
    date: "",
    pumpName: "",
    liters: "",
    ratePerLiter: "",
    cashAmount: "",
    bankAmount: "",
  });

  const [addaData, setAddaData] = useState({
    date: "",
    addaName: "",
    description: "",
    cashAmount: "",
    bankAmount: "",
  });

  const [unionData, setUnionData] = useState({
    date: "",
    unionName: "",
    description: "",
    cashAmount: "",
    bankAmount: "",
  });

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Get date range based on user type
  const getDateRange = () => {
    const today = new Date();
    const userType = currentUser?.userType;

    if (userType === "Conductor") {
      // Conductor: 7 days past to current date + future dates
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
      // Default: Only current date and past dates
      return {
        min: null,
        max: getTodayDate()
      };
    }
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cashAmount = parseInt(fuelData.cashAmount) || 0;
      const bankAmount = parseInt(fuelData.bankAmount) || 0;
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
                date: fuelData.date,
                pumpName: fuelData.pumpName,
                liters: parseFloat(fuelData.liters) || 0,
                ratePerLiter: parseFloat(fuelData.ratePerLiter) || 0,
                cashAmount: cashAmount,
                bankAmount: bankAmount,
                totalAmount: totalAmount,
              }
            : entry,
        );

        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setFuelData({
          date: "",
          pumpName: "",
          liters: "",
          ratePerLiter: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .updateFuelPayment({
            entryId: editingEntry.entryId,
            updatedData: {
              date: fuelData.date,
              pumpName: fuelData.pumpName,
              liters: parseFloat(fuelData.liters) || 0,
              ratePerLiter: parseFloat(fuelData.ratePerLiter) || 0,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
            },
          })
          .catch((error) => {
            console.error("Background fuel update sync failed:", error);
          });
      } else {
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly,
          type: "fuel",
          date: fuelData.date,
          pumpName: fuelData.pumpName,
          liters: parseFloat(fuelData.liters) || 0,
          ratePerLiter: parseFloat(fuelData.ratePerLiter) || 0,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
          entryStatus: "pending",
        };

        const updatedData = [newEntry, ...expenseData];
        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev + totalAmount);
        setFuelData({
          date: "",
          pumpName: "",
          liters: "",
          ratePerLiter: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .addFuelPayment({
            entryId: newEntry.entryId,
            timestamp: timeOnly,
            date: fuelData.date,
            pumpName: fuelData.pumpName,
            liters: parseFloat(fuelData.liters) || 0,
            ratePerLiter: parseFloat(fuelData.ratePerLiter) || 0,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            submittedBy: submittedBy,
            entryStatus: "pending",
          })
          .catch((error) => {
            console.error("Background fuel add sync failed:", error);
          });
      }
    } catch (error) {
      console.error("Error submitting fuel payment:", error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || "Unknown error"}. Please try again.`);
    }
  };

  const handleAddaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cashAmount = parseInt(addaData.cashAmount) || 0;
      const bankAmount = parseInt(addaData.bankAmount) || 0;
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
                date: addaData.date,
                addaName: addaData.addaName,
                description: addaData.description,
                cashAmount: cashAmount,
                bankAmount: bankAmount,
                totalAmount: totalAmount,
              }
            : entry,
        );

        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setAddaData({
          date: "",
          addaName: "",
          description: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .updateAddaPayment({
            entryId: editingEntry.entryId,
            updatedData: {
              date: addaData.date,
              addaName: addaData.addaName,
              description: addaData.description,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
            },
          })
          .catch((error) => {
            console.error("Background adda update sync failed:", error);
          });
      } else {
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly,
          type: "adda",
          date: addaData.date,
          addaName: addaData.addaName,
          description: addaData.description,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
          entryStatus: "pending",
        };

        const updatedData = [newEntry, ...expenseData];
        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev + totalAmount);
        setAddaData({
          date: "",
          addaName: "",
          description: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .addAddaPayment({
            entryId: newEntry.entryId,
            timestamp: timeOnly,
            date: addaData.date,
            addaName: addaData.addaName,
            description: addaData.description,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            submittedBy: submittedBy,
            entryStatus: "pending",
          })
          .catch((error) => {
            console.error("Background adda add sync failed:", error);
          });
      }
    } catch (error) {
      console.error("Error submitting adda payment:", error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || "Unknown error"}. Please try again.`);
    }
  };

  const handleUnionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cashAmount = parseInt(unionData.cashAmount) || 0;
      const bankAmount = parseInt(unionData.bankAmount) || 0;
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
                date: unionData.date,
                unionName: unionData.unionName,
                description: unionData.description,
                cashAmount: cashAmount,
                bankAmount: bankAmount,
                totalAmount: totalAmount,
              }
            : entry,
        );

        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setUnionData({
          date: "",
          unionName: "",
          description: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .updateUnionPayment({
            entryId: editingEntry.entryId,
            updatedData: {
              date: unionData.date,
              unionName: unionData.unionName,
              description: unionData.description,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
            },
          })
          .catch((error) => {
            console.error("Background union update sync failed:", error);
          });
      } else {
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly,
          type: "union",
          date: unionData.date,
          unionName: unionData.unionName,
          description: unionData.description,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
          entryStatus: "pending",
        };

        const updatedData = [newEntry, ...expenseData];
        setExpenseData(updatedData);
        setTotalExpenses((prev) => prev + totalAmount);
        setUnionData({
          date: "",
          unionName: "",
          description: "",
          cashAmount: "",
          bankAmount: "",
        });
        setIsLoading(false);

        authService
          .addUnionPayment({
            entryId: newEntry.entryId,
            timestamp: timeOnly,
            date: unionData.date,
            unionName: unionData.unionName,
            description: unionData.description,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            submittedBy: submittedBy,
            entryStatus: "pending",
          })
          .catch((error) => {
            console.error("Background union add sync failed:", error);
          });
      }
    } catch (error) {
      console.error("Error submitting union payment:", error);
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
        if (entryToDelete.type === "fuel") {
          deleteResult = await authService.deleteFuelPayment({
            entryId: entryToDelete.entryId,
          });
        } else if (entryToDelete.type === "adda") {
          deleteResult = await authService.deleteAddaPayment({
            entryId: entryToDelete.entryId,
          });
        } else if (entryToDelete.type === "union") {
          deleteResult = await authService.deleteUnionPayment({
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
    if (entry.type === "fuel") {
      setActiveTab("fuel");
      setFuelData({
        date: entry.date,
        pumpName: entry.pumpName || "",
        liters: entry.liters?.toString() || "",
        ratePerLiter: entry.ratePerLiter?.toString() || "",
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
      });
    } else if (entry.type === "adda") {
      setActiveTab("adda");
      setAddaData({
        date: entry.date,
        addaName: entry.addaName,
        description: entry.description,
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
      });
    } else if (entry.type === "union") {
      setActiveTab("union");
      setUnionData({
        date: entry.date,
        unionName: entry.unionName || "",
        description: entry.description,
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFuelData({
      date: "",
      pumpName: "",
      liters: "",
      ratePerLiter: "",
      cashAmount: "",
      bankAmount: "",
    });
    setAddaData({
      date: "",
      addaName: "",
      description: "",
      cashAmount: "",
      bankAmount: "",
    });
    setUnionData({
      date: "",
      unionName: "",
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
        (entry.type === "fuel" || entry.type === "adda" || entry.type === "union"),
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
        (entry.type === "fuel" || entry.type === "adda" || entry.type === "union"),
    );
  };

  const { totalCash, totalBank, grandTotal } = calculateSummaryTotals();

  return (
    <div className="basic-payment-container">
      <div className="container-fluid">
        <div className="payment-header">
          <div className="header-content">
            <div>
              <h2>
                <i className="bi bi-credit-card"></i> Basic Payment Entry
              </h2>
              <p>Record your basic expenses - Fuel, Adda & Union payments</p>
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
                className={`nav-link ${activeTab === "fuel" ? "active" : ""}`}
                onClick={() => setActiveTab("fuel")}
              >
                <i className="bi bi-fuel-pump"></i> Fuel
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "adda" ? "active" : ""}`}
                onClick={() => setActiveTab("adda")}
              >
                <i className="bi bi-building"></i> Adda
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "union" ? "active" : ""}`}
                onClick={() => setActiveTab("union")}
              >
                <i className="bi bi-people"></i> Union
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "fuel" && (
            <div className="payment-form-card">
              <h4>
                <i className="bi bi-fuel-pump"></i> Add Fuel
              </h4>
              <form onSubmit={handleFuelSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control date-input"
                      value={fuelData.date}
                      onChange={(e) =>
                        setFuelData({ ...fuelData, date: e.target.value })
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
                    <label className="form-label">Pump Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fuelData.pumpName}
                      onChange={(e) =>
                        setFuelData({ ...fuelData, pumpName: e.target.value })
                      }
                      placeholder="Enter pump name"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Liters (Optional)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={fuelData.liters}
                      onChange={(e) =>
                        setFuelData({ ...fuelData, liters: e.target.value })
                      }
                      placeholder="Enter liters"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Rate per Liter (₹) (Optional)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={fuelData.ratePerLiter}
                      onChange={(e) =>
                        setFuelData({
                          ...fuelData,
                          ratePerLiter: e.target.value,
                        })
                      }
                      placeholder="Enter rate per liter"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cash Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={fuelData.cashAmount}
                      onChange={(e) =>
                        setFuelData({
                          ...fuelData,
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
                      value={fuelData.bankAmount}
                      onChange={(e) =>
                        setFuelData({
                          ...fuelData,
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
                      <span>Cash: ₹{parseInt(fuelData.cashAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <span>Bank: ₹{parseInt(fuelData.bankAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <strong>
                        Total: ₹
                        {(parseInt(fuelData.cashAmount) || 0) +
                          (parseInt(fuelData.bankAmount) || 0)}
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
                        : "Add Fuel Entry"}
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

          {activeTab === "adda" && (
            <div className="payment-form-card">
              <h4>
                <i className="bi bi-building"></i> Add Adda Payment
              </h4>
              <form onSubmit={handleAddaSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control date-input"
                      value={addaData.date}
                      onChange={(e) =>
                        setAddaData({ ...addaData, date: e.target.value })
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
                    <label className="form-label">Adda Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addaData.addaName}
                      onChange={(e) =>
                        setAddaData({ ...addaData, addaName: e.target.value })
                      }
                      placeholder="Enter Adda Name"
                    />
                  </div>
                  </div>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={addaData.description}
                      onChange={(e) =>
                        setAddaData({ ...addaData, description: e.target.value })
                      }
                      placeholder="Enter detailed description of adda payment"
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cash Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={addaData.cashAmount}
                      onChange={(e) =>
                        setAddaData({
                          ...addaData,
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
                      value={addaData.bankAmount}
                      onChange={(e) =>
                        setAddaData({
                          ...addaData,
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
                      <span>Cash: ₹{parseInt(addaData.cashAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <span>Bank: ₹{parseInt(addaData.bankAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <strong>
                        Total: ₹
                        {(parseInt(addaData.cashAmount) || 0) +
                          (parseInt(addaData.bankAmount) || 0)}
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
                        : "Add Adda Entry"}
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

          {activeTab === "union" && (
            <div className="payment-form-card">
              <h4>
                <i className="bi bi-people"></i> Add Union Payment
              </h4>
              <form onSubmit={handleUnionSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control date-input"
                      value={unionData.date}
                      onChange={(e) =>
                        setUnionData({ ...unionData, date: e.target.value })
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
                    <label className="form-label">Union Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={unionData.unionName}
                      onChange={(e) =>
                        setUnionData({ ...unionData, unionName: e.target.value })
                      }
                      placeholder="Enter union name"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={unionData.description}
                      onChange={(e) =>
                        setUnionData({ ...unionData, description: e.target.value })
                      }
                      placeholder="Enter description"
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cash Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={unionData.cashAmount}
                      onChange={(e) =>
                        setUnionData({
                          ...unionData,
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
                      value={unionData.bankAmount}
                      onChange={(e) =>
                        setUnionData({
                          ...unionData,
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
                      <span>Cash: ₹{parseInt(unionData.cashAmount) || 0}</span>
                    </div>
                    <div className="col-4">
                      <span>Bank: ₹{parseInt(unionData.bankAmount) || 0}                    </div>
                    <div className="col-4">
                      <strong>
                        Total: ₹
                        {(parseInt(unionData.cashAmount) || 0) +
                          (parseInt(unionData.bankAmount) || 0)}
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
                        : "Add Union Entry"}
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
                            {entry.type === "fuel"
                              ? "Fuel"
                              : entry.type === "adda"
                                ? "Adda"
                                : "Union"}
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
                          {entry.type === "fuel" && (
                            <p>                              {entry.pumpName && `${entry.pumpName} - `}
                              {entry.liters && `${entry.liters}L`}
                              {entry.ratePerLiter && ` @ ₹${entry.ratePerLiter}/L`}
                            </p>
                          )}
                          {(entry.type === "adda" || entry.type === "union") && (
                            <p>{entry.description}</p>
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

export default BasicPayment;