import React, { useState, useEffect, useRef } from "react";
import "../css/MiscPayment.css";
import authService from "../../services/authService.js";
import SearchableSelect from "./SearchableSelect.jsx";

// Smart SearchableSelect component with dynamic categorization
const SmartSearchableSelect = ({ 
  allOptions = [], 
  getFilteredOptions,
  value = '', 
  onChange, 
  placeholder = 'Type to search...', 
  allowCustom = false,
  name,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(allOptions);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showCategoryHint, setShowCategoryHint] = useState(false);
  
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Smart filtering based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(allOptions);
      setShowCategoryHint(false);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const smartFiltered = getFilteredOptions(searchTerm);
      
      // Check if smart filtering detected a category keyword
      const isCategoryKeyword = (
        lowerSearchTerm === 'food' || 
        lowerSearchTerm === 'transport' || 
        lowerSearchTerm === 'challan'
      );
      
      let finalFiltered;
      if (isCategoryKeyword) {
        // If it's exactly a category keyword, show all items from that category
        finalFiltered = smartFiltered;
        setShowCategoryHint(true);
      } else {
        // Otherwise, filter normally by search term
        finalFiltered = smartFiltered.filter(option => 
          option.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setShowCategoryHint(
          lowerSearchTerm.includes('food') || 
          lowerSearchTerm.includes('transport') || 
          lowerSearchTerm.includes('challan')
        );
      }
      
      setFilteredOptions(finalFiltered);
    }
    setFocusedIndex(-1);
  }, [searchTerm, allOptions, getFilteredOptions]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (newValue.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    
    if (allowCustom) {
      onChange(newValue);
    }
  };

  const handleOptionClick = (option) => {
    setSearchTerm(option);
    setIsOpen(false);
    onChange(option);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (searchTerm.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = (e) => {
    const clickedElement = e.relatedTarget;
    if (clickedElement && clickedElement.closest('.smart-searchable-dropdown')) {
      return;
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if ((e.key === 'ArrowDown' || e.key === 'Enter') && searchTerm.trim().length > 0) {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleOptionClick(filteredOptions[focusedIndex]);
        } else if (allowCustom && searchTerm.trim()) {
          setIsOpen(false);
          onChange(searchTerm);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      
      default:
        break;
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [focusedIndex]);

  return (
    <div className={`searchable-select smart-searchable-select ${className}`}>
      <input
        ref={inputRef}
        type="text"
        className="form-control searchable-input"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        name={name}
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="searchable-dropdown smart-searchable-dropdown">
          <ul ref={listRef} className="searchable-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option}
                  className={`searchable-option ${
                    index === focusedIndex ? 'focused' : ''
                  } ${option === value ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleOptionClick(option);
                  }}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="searchable-option no-results">
                {allowCustom ? (
                  <span>
                    Press Enter to add "{searchTerm}"
                  </span>
                ) : (
                  <span>No matches found</span>
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

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
    "Lunch",
    "Breakfast", 
    "Dinner",
    "Tea",
    "Cold Drink",
    "Water Bottle",
    "Challan",
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
    "Cleaning Material",
    "Tools Purchase",
    "Emergency Repair",
    "Towing Charge",
    "Food Expense",
    "Accommodation",
    "Medical Expense",
    "Legal Fee",
    "Consultant Fee",
    "Audit Fee",
    "Bank Charges",
    "Interest Payment",
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
    "Advertisement Cost",
    "Promotion Cost",
    "Donation",
    "Charity Payment",
    "Social Event",
    "Training Cost",
    "Conference Fee",
    "Seminar Fee",
    "Workshop Fee",
    "Subscription Fee",
    "Membership Fee",
    "License Fee",
    "Repair Work",
    "Maintenance Work",
    "Compliance Cost",
    "Audit Cost",
    "Inspection Fee",
    "Certification Fee",
    "Testing Fee",
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

  // Food items list - these will be stored as EntryType: 'food'
  const foodItems = [
    "Lunch", "Breakfast", "Dinner", "Tea", "Cold Drink", "Water Bottle"
  ];

  // Transport & Legal items list - these will be stored as EntryType: 'transport'
  const transportLegalItems = [
    "Challan", "Parking Fee", "Toll Tax", "Police Challan", "RTO Fee", 
    "Insurance Premium", "Permit Fee", "Registration Fee", "Fitness Certificate", 
    "Pollution Certificate", "Route Permit", "Tax Payment", "Fine Payment", "Document Fee",
    "Loan EMI", "Loan Deductions"
  ];

  // Smart categorization function
  const getFilteredPaymentOptions = (searchTerm) => {
    if (!searchTerm) return otherPaymentDescriptions;

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // If user types "food" related keywords, show only food items
    if (lowerSearchTerm.includes('food') || 
        lowerSearchTerm.includes('lunch') || 
        lowerSearchTerm.includes('breakfast') || 
        lowerSearchTerm.includes('dinner') || 
        lowerSearchTerm.includes('tea') || 
        lowerSearchTerm.includes('drink')) {
      return foodItems;
    }
    
    // If user types "transport" or "challan" related keywords, show only transport items
    if (lowerSearchTerm.includes('transport') || 
        lowerSearchTerm.includes('challan') || 
        lowerSearchTerm.includes('rto') || 
        lowerSearchTerm.includes('police') || 
        lowerSearchTerm.includes('toll') || 
        lowerSearchTerm.includes('parking') || 
        lowerSearchTerm.includes('fine') || 
        lowerSearchTerm.includes('tax') ||
        lowerSearchTerm.includes('loan') ||
        lowerSearchTerm.includes('emi')) {
      return transportLegalItems;
    }
    
    // Otherwise, return all options
    return otherPaymentDescriptions;
  };

  // Check if selected payment type is a food item
  const isFoodItem = (paymentType) => {
    return foodItems.includes(paymentType);
  };

  // Check if selected payment type is a transport/legal item
  const isTransportLegalItem = (paymentType) => {
    return transportLegalItems.includes(paymentType);
  };

  // Handle Other Payment submission
  const handleOtherSubmit = async (e) => {
    e.preventDefault();
    
    // Validate payment type - prevent generic "food" or "transport" entries
    const paymentType = otherData.paymentType.toLowerCase().trim();
    if (paymentType === 'food' || paymentType === 'transport') {
      alert('⚠️ Please select a specific payment type from the dropdown options instead of just typing "food" or "transport".');
      return;
    }
    
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

      const isFood = isFoodItem(otherData.paymentType);
      const isTransportLegal = isTransportLegalItem(otherData.paymentType);

      if (editingEntry) {
        // Update existing entry - IMMEDIATE STATE UPDATE
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
                type: isFood ? 'food' : isTransportLegal ? 'transport' : 'other',
                entryType: isFood ? 'food' : isTransportLegal ? 'transport' : 'other'
              }
            : entry
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

        // BACKGROUND SYNC - Don't wait for this
        if (isFood) {
          authService.updateFoodPayment({
            entryId: editingEntry.entryId,
            updatedData: {
              date: otherData.date,
              paymentType: otherData.paymentType,
              description: otherData.description,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
            }
          }).catch((error) => {
            console.error("Background food update sync failed:", error);
          });
        } else if (isTransportLegal) {
          // Use transportPayments API for transport/legal items
          authService.updateTransportPayment({
            entryId: editingEntry.entryId,
            updatedData: {
              date: otherData.date,
              paymentType: otherData.paymentType,
              description: otherData.description,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
            }
          }).catch((error) => {
            console.error("Background transport update sync failed:", error);
          });
        } else {
          authService.updateOtherPayment({
            entryId: editingEntry.entryId,
            updatedData: {
              date: otherData.date,
              paymentType: otherData.paymentType,
              description: otherData.description,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
            }
          }).catch((error) => {
            console.error("Background other update sync failed:", error);
          });
        }

      } else {
        // Add new entry - IMMEDIATE STATE UPDATE
        const newEntry = {
          entryId: Date.now(),
          timestamp: timeOnly,
          type: isFood ? "food" : isTransportLegal ? "transport" : "other",
          date: otherData.date,
          paymentType: otherData.paymentType,
          description: otherData.description,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
          entryStatus: "pending",
          entryType: isFood ? "food" : isTransportLegal ? "transport" : "other"
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

        // BACKGROUND SYNC - Don't wait for this
        if (isFood) {
          authService.addFoodPayment({
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
          }).catch((error) => {
            console.error("Background food add sync failed:", error);
          });
        } else if (isTransportLegal) {
          // Use transportPayments API for transport/legal items
          authService.addTransportPayment({
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
          }).catch((error) => {
            console.error("Background transport add sync failed:", error);
          });
        } else {
          authService.addOtherPayment({
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
          }).catch((error) => {
            console.error("Background other add sync failed:", error);
          });
        }
      }
    } catch (error) {
      console.error("Error submitting other payment:", error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || "Unknown error"}. Please try again.`);
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      // IMMEDIATE STATE UPDATE
      const updatedData = expenseData.filter((item) => item.entryId !== entry.entryId);
      setExpenseData(updatedData);

      if (entry && entry.totalAmount) {
        setTotalExpenses((prev) => prev - entry.totalAmount);
      }

      const entryToDelete = entry;

      // BACKGROUND SYNC - Don't wait for this
      if (entryToDelete.type === 'food' || entryToDelete.entryType === 'food') {
        authService.deleteFoodPayment({ entryId: entryToDelete.entryId })
          .catch((error) => {
            console.error("Background food delete sync failed:", error);
          });
      } else if (entryToDelete.type === 'transport') {
        authService.deleteTransportPayment({ entryId: entryToDelete.entryId })
          .catch((error) => {
            console.error("Background transport delete sync failed:", error);
          });
      } else {
        authService.deleteOtherPayment({ entryId: entryToDelete.entryId })
          .catch((error) => {
            console.error("Background other delete sync failed:", error);
          });
      }
    }
  };

  // Helper function to convert date to YYYY-MM-DD format for date input
  const convertToInputDateFormat = (dateStr) => {
    if (!dateStr) return "";

    // If already in YYYY-MM-DD format, return as is
    if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }

    // If in DD-MM-YYYY format, convert to YYYY-MM-DD
    // IMPORTANT: DD-MM-YYYY me [0]=day, [1]=month, [2]=year
    // YYYY-MM-DD me year-month-day hona chahiye, DD aur MM swap nahi karna
    if (typeof dateStr === "string" && dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // If it's an ISO string or other format, try to parse and convert
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Error converting date:', dateStr, error);
    }

    return dateStr;
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    if (entry.type === "service") {
      setActiveTab("service");
      setServiceData({
        date: convertToInputDateFormat(entry.date),
        serviceDetails: entry.serviceDetails || "",
        description: entry.description || "",
        mechanicCenter: entry.mechanicCenter || "",
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
      });
    } else if (entry.type === "other" || entry.type === "food" || entry.type === "transport") {
      setActiveTab("other");
      setOtherData({
        date: convertToInputDateFormat(entry.date),
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
      (entry) => entry.submittedBy === currentUserName &&
                 entry.entryStatus !== "approved" &&
                 (entry.type === "service" || entry.type === "other" || entry.type === "food" || entry.type === "transport")
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
    const userEntries = expenseData.filter(
      (entry) =>
        entry.submittedBy === currentUserName &&
        entry.entryStatus !== "approved" &&
        (entry.type === "service" || entry.type === "other" || entry.type === "food" || entry.type === "transport"),
    );

    // Sort by entryId (timestamp) in descending order to show newest first
    return userEntries.sort((a, b) => {
      const timeA = a.entryId || 0;
      const timeB = b.entryId || 0;
      return timeB - timeA; // Newest first
    });
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
                    <SmartSearchableSelect
                      allOptions={otherPaymentDescriptions}
                      getFilteredOptions={getFilteredPaymentOptions}
                      value={otherData.paymentType}
                      onChange={(value) =>
                        setOtherData({ ...otherData, paymentType: value })
                      }
                      placeholder="Type 'food', 'transport' or search payment types..."
                      allowCustom={true}
                      name="paymentType"
                      className="payment-type-selector"
                    />
                    {(otherData.paymentType.toLowerCase().trim() === 'food' || 
                      otherData.paymentType.toLowerCase().trim() === 'transport') && (
                      <div className="alert alert-warning mt-2 mb-0" style={{padding: '8px 12px', fontSize: '14px'}}>
                        <i className="bi bi-exclamation-triangle"></i> Please select a specific item from the dropdown instead of just "{otherData.paymentType}".
                      </div>
                    )}
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
                            {entry.type === "service" ? "Service" : 
                             entry.type === "food" ? "Food" : 
                             entry.type === "transport" ? "Transport" : "Other"}
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
                                onClick={() => handleDeleteEntry(entry)}
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
                           {entry.type === "food" && (
                            <div>
                              <p><strong>{entry.paymentType}</strong></p>
                              {entry.description && (
                                <p><small>{entry.description.substring(0, 60)}...</small></p>
                              )}
                            </div>
                          )}
                          {entry.type === "transport" && (
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