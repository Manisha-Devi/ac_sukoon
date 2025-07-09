
# 🌐 **AC SUKOON TRANSPORT - API ENDPOINTS DOCUMENTATION**

## 📖 **Complete API Reference Guide**

**Base URL**: `https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec`

**Method**: `POST`

**Content-Type**: `application/json`

---

## 🔐 **AUTHENTICATION ENDPOINTS**

### **1. User Login**
**Action**: `login`

**Request Body**:
```json
{
  "action": "login",
  "username": "testdriver",
  "password": "password123",
  "userType": "driver"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "testdriver",
    "userType": "driver",
    "fullName": "Test Driver",
    "status": "active",
    "fixedCash": 5000,
    "lastLogin": "09/07/2025, 06:18:13 pm"
  },
  "timestamp": "09/07/2025, 06:18:13 pm"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

---

## 🧾 **FARE RECEIPTS ENDPOINTS**

### **1. Add Fare Receipt**
**Action**: `addFareReceipt`

**Request Body**:
```json
{
  "action": "addFareReceipt",
  "entryId": "1704726185847",
  "timestamp": "14:30:15 PM",
  "date": "2024-01-08",
  "route": "Jammu to Srinagar",
  "cashAmount": 3000,
  "bankAmount": 2000,
  "totalAmount": 5000,
  "submittedBy": "testdriver"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Fare receipt added successfully",
  "entryId": "1704726185847",
  "timestamp": "14:30:15 PM"
}
```

### **2. Get All Fare Receipts**
**Action**: `getFareReceipts`

**Request Body**:
```json
{
  "action": "getFareReceipts"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185847",
      "timestamp": "14:30:15 PM",
      "date": "2024-01-08",
      "route": "Jammu to Srinagar",
      "cashAmount": 3000,
      "bankAmount": 2000,
      "totalAmount": 5000,
      "entryType": "fare",
      "submittedBy": "testdriver",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ]
}
```

### **3. Update Fare Receipt**
**Action**: `updateFareReceipt`

**Request Body**:
```json
{
  "action": "updateFareReceipt",
  "entryId": "1704726185847",
  "updatedData": {
    "route": "Updated Route",
    "cashAmount": 3500,
    "bankAmount": 2500,
    "totalAmount": 6000
  }
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Fare receipt updated successfully",
  "entryId": "1704726185847",
  "updatedRow": 2
}
```

### **4. Delete Fare Receipt**
**Action**: `deleteFareReceipt`

**Request Body**:
```json
{
  "action": "deleteFareReceipt",
  "entryId": "1704726185847"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Fare receipt deleted successfully",
  "entryId": "1704726185847",
  "deletedRow": 2
}
```

### **5. Update Fare Receipt Status**
**Action**: `updateFareReceiptStatus`

**Request Body**:
```json
{
  "action": "updateFareReceiptStatus",
  "entryId": "1704726185847",
  "newStatus": "approved",
  "approverName": "Manager Name"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Fare receipt status updated to approved",
  "entryId": "1704726185847",
  "newStatus": "approved"
}
```

### **6. Approve Fare Receipt**
**Action**: `approveFareReceipt`

**Request Body**:
```json
{
  "action": "approveFareReceipt",
  "entryId": "1704726185847",
  "approverName": "Manager Name"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Fare receipt status updated to approved",
  "entryId": "1704726185847",
  "newStatus": "approved"
}
```

---

## 📋 **BOOKING ENTRIES ENDPOINTS**

### **1. Add Booking Entry**
**Action**: `addBookingEntry`

**Request Body**:
```json
{
  "action": "addBookingEntry",
  "entryId": "1704726185848",
  "timestamp": "15:45:30 PM",
  "bookingDetails": "Wedding booking from Bhaderwah to Jammu",
  "dateFrom": "2024-01-20",
  "dateTo": "2024-01-22",
  "cashAmount": 5000,
  "bankAmount": 10000,
  "totalAmount": 15000,
  "submittedBy": "testdriver"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Booking entry added successfully",
  "entryId": "1704726185848",
  "timestamp": "15:45:30 PM"
}
```

### **2. Get All Booking Entries**
**Action**: `getBookingEntries`

**Request Body**:
```json
{
  "action": "getBookingEntries"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185848",
      "timestamp": "15:45:30 PM",
      "bookingDetails": "Wedding booking from Bhaderwah to Jammu",
      "dateFrom": "2024-01-20",
      "dateTo": "2024-01-22",
      "cashAmount": 5000,
      "bankAmount": 10000,
      "totalAmount": 15000,
      "entryType": "booking",
      "submittedBy": "testdriver",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ]
}
```

### **3. Update Booking Entry**
**Action**: `updateBookingEntry`

**Request Body**:
```json
{
  "action": "updateBookingEntry",
  "entryId": "1704726185848",
  "updatedData": {
    "bookingDetails": "Updated wedding booking details",
    "cashAmount": 6000,
    "bankAmount": 12000,
    "totalAmount": 18000
  }
}
```

### **4. Delete Booking Entry**
**Action**: `deleteBookingEntry`

**Request Body**:
```json
{
  "action": "deleteBookingEntry",
  "entryId": "1704726185848"
}
```

### **5. Update Booking Entry Status**
**Action**: `updateBookingEntryStatus`

**Request Body**:
```json
{
  "action": "updateBookingEntryStatus",
  "entryId": "1704726185848",
  "newStatus": "approved",
  "approverName": "Manager Name"
}
```

### **6. Approve Booking Entry**
**Action**: `approveBookingEntry`

**Request Body**:
```json
{
  "action": "approveBookingEntry",
  "entryId": "1704726185848",
  "approverName": "Manager Name"
}
```

---

## ⛽ **FUEL PAYMENTS ENDPOINTS**

### **1. Add Fuel Payment**
**Action**: `addFuelPayment`

**Request Body**:
```json
{
  "action": "addFuelPayment",
  "entryId": "1704726185849",
  "timestamp": "16:20:45 PM",
  "date": "2024-01-08",
  "pumpName": "HP Petrol Pump",
  "liters": 50,
  "rate": 85.50,
  "cashAmount": 2000,
  "bankAmount": 2275,
  "totalAmount": 4275,
  "remarks": "Full tank for long route",
  "submittedBy": "testdriver"
}
```

**Success Response**:
```json
{
  "success": true,
  "entryId": "1704726185849",
  "message": "Fuel payment added successfully",
  "timestamp": "16:20:45 PM"
}
```

### **2. Get All Fuel Payments**
**Action**: `getFuelPayments`

**Request Body**:
```json
{
  "action": "getFuelPayments"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185849",
      "timestamp": "16:20:45 PM",
      "date": "2024-01-08",
      "pumpName": "HP Petrol Pump",
      "liters": 50,
      "rate": 85.50,
      "cashAmount": 2000,
      "bankAmount": 2275,
      "totalAmount": 4275,
      "remarks": "Full tank for long route",
      "submittedBy": "testdriver",
      "entryType": "fuel",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ],
  "count": 1
}
```

### **3. Update Fuel Payment**
**Action**: `updateFuelPayment`

**Request Body**:
```json
{
  "action": "updateFuelPayment",
  "entryId": "1704726185849",
  "updatedData": {
    "pumpName": "Updated Pump Name",
    "liters": 55,
    "rate": 86.00,
    "totalAmount": 4730
  }
}
```

### **4. Delete Fuel Payment**
**Action**: `deleteFuelPayment`

**Request Body**:
```json
{
  "action": "deleteFuelPayment",
  "entryId": "1704726185849"
}
```

### **5. Update Fuel Payment Status**
**Action**: `updateFuelPaymentStatus`

**Request Body**:
```json
{
  "action": "updateFuelPaymentStatus",
  "entryId": "1704726185849",
  "newStatus": "approved",
  "approverName": "Manager Name"
}
```

### **6. Approve Fuel Payment**
**Action**: `approveFuelPayment`

**Request Body**:
```json
{
  "action": "approveFuelPayment",
  "entryId": "1704726185849",
  "approverName": "Manager Name"
}
```

---

## 🚌 **ADDA PAYMENTS ENDPOINTS**

### **1. Add Adda Payment**
**Action**: `addAddaPayment`

**Request Body**:
```json
{
  "action": "addAddaPayment",
  "entryId": "1704726185850",
  "timestamp": "17:10:20 PM",
  "date": "2024-01-08",
  "addaName": "Jammu Bus Stand",
  "cashAmount": 500,
  "bankAmount": 0,
  "totalAmount": 500,
  "remarks": "Daily adda charges",
  "submittedBy": "testdriver"
}
```

**Success Response**:
```json
{
  "success": true,
  "entryId": "1704726185850",
  "message": "Adda payment added successfully",
  "timestamp": "17:10:20 PM"
}
```

### **2. Get All Adda Payments**
**Action**: `getAddaPayments`

**Request Body**:
```json
{
  "action": "getAddaPayments"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185850",
      "timestamp": "17:10:20 PM",
      "date": "2024-01-08",
      "addaName": "Jammu Bus Stand",
      "cashAmount": 500,
      "bankAmount": 0,
      "totalAmount": 500,
      "remarks": "Daily adda charges",
      "submittedBy": "testdriver",
      "entryType": "adda",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ],
  "count": 1
}
```

### **3. Update Adda Payment**
**Action**: `updateAddaPayment`

**Request Body**:
```json
{
  "action": "updateAddaPayment",
  "entryId": "1704726185850",
  "updatedData": {
    "addaName": "Updated Adda Name",
    "cashAmount": 600,
    "totalAmount": 600,
    "remarks": "Updated remarks"
  }
}
```

### **4. Delete Adda Payment**
**Action**: `deleteAddaPayment`

**Request Body**:
```json
{
  "action": "deleteAddaPayment",
  "entryId": "1704726185850"
}
```

### **5. Update Adda Payment Status**
**Action**: `updateAddaPaymentStatus`

**Request Body**:
```json
{
  "action": "updateAddaPaymentStatus",
  "entryId": "1704726185850",
  "newStatus": "approved",
  "approverName": "Manager Name"
}
```

### **6. Approve Adda Payment**
**Action**: `approveAddaPayment`

**Request Body**:
```json
{
  "action": "approveAddaPayment",
  "entryId": "1704726185850",
  "approverName": "Manager Name"
}
```

---

## 🤝 **UNION PAYMENTS ENDPOINTS**

### **1. Add Union Payment**
**Action**: `addUnionPayment`

**Request Body**:
```json
{
  "action": "addUnionPayment",
  "entryId": "1704726185851",
  "timestamp": "18:05:15 PM",
  "date": "2024-01-08",
  "unionName": "Transport Workers Union",
  "cashAmount": 1000,
  "bankAmount": 0,
  "totalAmount": 1000,
  "remarks": "Monthly union fees",
  "submittedBy": "testdriver"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Union payment added successfully",
  "entryId": "1704726185851",
  "timestamp": "18:05:15 PM"
}
```

### **2. Get All Union Payments**
**Action**: `getUnionPayments`

**Request Body**:
```json
{
  "action": "getUnionPayments"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185851",
      "timestamp": "18:05:15 PM",
      "date": "2024-01-08",
      "unionName": "Transport Workers Union",
      "cashAmount": 1000,
      "bankAmount": 0,
      "totalAmount": 1000,
      "remarks": "Monthly union fees",
      "submittedBy": "testdriver",
      "entryType": "union",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ],
  "count": 1
}
```

### **3. Update Union Payment**
**Action**: `updateUnionPayment`

### **4. Delete Union Payment**
**Action**: `deleteUnionPayment`

### **5. Update Union Payment Status**
**Action**: `updateUnionPaymentStatus`

### **6. Approve Union Payment**
**Action**: `approveUnionPayment`

---

## 🔧 **SERVICE PAYMENTS ENDPOINTS**

### **1. Add Service Payment**
**Action**: `addServicePayment`

**Request Body**:
```json
{
  "action": "addServicePayment",
  "entryId": "1704726185852",
  "timestamp": "19:30:40 PM",
  "date": "2024-01-08",
  "serviceType": "Engine Repair",
  "cashAmount": 2500,
  "bankAmount": 1500,
  "totalAmount": 4000,
  "serviceDetails": "Engine oil change and filter replacement",
  "submittedBy": "testdriver"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Service payment added successfully",
  "entryId": "1704726185852",
  "timestamp": "19:30:40 PM"
}
```

### **2. Get All Service Payments**
**Action**: `getServicePayments`

**Request Body**:
```json
{
  "action": "getServicePayments"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185852",
      "timestamp": "19:30:40 PM",
      "date": "2024-01-08",
      "serviceType": "Engine Repair",
      "cashAmount": 2500,
      "bankAmount": 1500,
      "totalAmount": 4000,
      "serviceDetails": "Engine oil change and filter replacement",
      "submittedBy": "testdriver",
      "entryType": "service",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ],
  "count": 1
}
```

### **3. Update Service Payment**
**Action**: `updateServicePayment`

### **4. Delete Service Payment**
**Action**: `deleteServicePayment`

### **5. Update Service Payment Status**
**Action**: `updateServicePaymentStatus`

### **6. Approve Service Payment**
**Action**: `approveServicePayment`

---

## 📦 **OTHER PAYMENTS ENDPOINTS**

### **1. Add Other Payment**
**Action**: `addOtherPayment`

**Request Body**:
```json
{
  "action": "addOtherPayment",
  "entryId": "1704726185853",
  "timestamp": "20:15:25 PM",
  "date": "2024-01-08",
  "paymentType": "Miscellaneous Expense",
  "cashAmount": 800,
  "bankAmount": 200,
  "totalAmount": 1000,
  "paymentDetails": "Cleaning and maintenance supplies",
  "submittedBy": "testdriver"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Other payment added successfully",
  "entryId": "1704726185853",
  "timestamp": "20:15:25 PM"
}
```

### **2. Get All Other Payments**
**Action**: `getOtherPayments`

**Request Body**:
```json
{
  "action": "getOtherPayments"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185853",
      "timestamp": "20:15:25 PM",
      "date": "2024-01-08",
      "paymentType": "Miscellaneous Expense",
      "cashAmount": 800,
      "bankAmount": 200,
      "totalAmount": 1000,
      "paymentDetails": "Cleaning and maintenance supplies",
      "submittedBy": "testdriver",
      "entryType": "other",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ],
  "count": 1
}
```

### **3. Update Other Payment**
**Action**: `updateOtherPayment`

### **4. Delete Other Payment**
**Action**: `deleteOtherPayment`

### **5. Update Other Payment Status**
**Action**: `updateOtherPaymentStatus`

### **6. Approve Other Payment**
**Action**: `approveOtherPayment`

---

## 🏖️ **OFF DAYS ENDPOINTS**

### **1. Add Off Day**
**Action**: `addOffDay`

**Request Body**:
```json
{
  "action": "addOffDay",
  "entryId": "1704726185854",
  "timestamp": "21:00:10 PM",
  "date": "2024-01-08",
  "offDate": "2024-01-10",
  "reason": "Personal emergency",
  "offType": "Emergency Leave",
  "submittedBy": "testdriver"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Off day added successfully",
  "entryId": "1704726185854",
  "timestamp": "21:00:10 PM"
}
```

### **2. Get All Off Days**
**Action**: `getOffDays`

**Request Body**:
```json
{
  "action": "getOffDays"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185854",
      "timestamp": "21:00:10 PM",
      "date": "2024-01-08",
      "offDate": "2024-01-10",
      "reason": "Personal emergency",
      "offType": "Emergency Leave",
      "submittedBy": "testdriver",
      "entryType": "off",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ]
}
```

### **3. Update Off Day**
**Action**: `updateOffDay`

### **4. Delete Off Day**
**Action**: `deleteOffDay`

### **5. Update Off Day Status**
**Action**: `updateOffDayStatus`

### **6. Approve Off Day**
**Action**: `approveOffDay`

---

## 🧪 **UTILITY ENDPOINTS**

### **1. Test Connection**
**Action**: `test`

**Request Body**:
```json
{
  "action": "test"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Google Apps Script is working!",
  "timestamp": "09/07/2025, 06:20:18 pm",
  "version": "2.0.0"
}
```

---

## 📊 **COMMON RESPONSE PATTERNS**

### **Success Response Structure**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}, // or array
  "entryId": "1704726185847", // for add/update operations
  "timestamp": "14:30:15 PM" // for add operations
}
```

### **Error Response Structure**:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

## ⚠️ **ERROR CODES & MESSAGES**

### **Authentication Errors**:
- `"Invalid username or password"`
- `"Users sheet not found. Please check sheet configuration."`
- `"No users configured in the system"`

### **Entry Not Found Errors**:
- `"Fare receipt not found with ID: {entryId}"`
- `"Booking entry not found with ID: {entryId}"`
- `"Fuel payment not found with ID: {entryId}"`
- `"Adda payment not found with ID: {entryId}"`
- `"Union payment not found with ID: {entryId}"`
- `"Service payment not found with ID: {entryId}"`
- `"Other payment not found with ID: {entryId}"`
- `"Off day not found with ID: {entryId}"`

### **Sheet Errors**:
- `"FareReceipts sheet not found"`
- `"BookingEntries sheet not found"`
- `"FuelPayments sheet not found"`
- `"AddaPayments sheet not found"`
- `"UnionPayments sheet not found"`
- `"ServicePayments sheet not found"`
- `"OtherPayments sheet not found"`
- `"OffDays sheet not found"`

---

## 🔄 **REQUEST FLOW EXAMPLE**

### **Complete Add Fare Receipt Flow**:

**1. Frontend Request**:
```javascript
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'addFareReceipt',
    entryId: '1704726185847',
    timestamp: '14:30:15 PM',
    date: '2024-01-08',
    route: 'Jammu to Srinagar',
    cashAmount: 3000,
    bankAmount: 2000,
    totalAmount: 5000,
    submittedBy: 'testdriver'
  })
});
```

**2. Backend Processing**:
- Code.gs routes to FareReceipts.addFareReceipt()
- Function validates data
- Creates/gets FareReceipts sheet
- Inserts new row with data
- Returns success response

**3. Frontend Response Handling**:
```javascript
const result = await response.json();
if (result.success) {
  console.log('Entry added:', result.entryId);
  // Update UI with new entry
} else {
  console.error('Error:', result.error);
  // Show error message to user
}
```

---

## 📝 **NOTES**

1. **EntryId**: Always generated by frontend using `Date.now()` for uniqueness
2. **Timestamps**: Stored in IST format as time-only strings
3. **Status Values**: `"pending"`, `"approved"`, `"waiting"`, `"cash"`, `"bank"`
4. **Sheet Auto-Creation**: All sheets are created automatically if they don't exist
5. **Error Handling**: All functions include comprehensive try-catch blocks
6. **Legacy Support**: Old function names are supported through LegacyFunctions.gs
7. **Data Consistency**: All modules follow the same 6-function pattern
8. **Row Indexing**: Sheet rows are 1-indexed, data rows start from row 2

---

**Last Updated**: January 9, 2025  
**Version**: 2.0.0  
**Status**: Production Ready 🚀
