
# 🌐 **AC SUKOON TRANSPORT - API ENDPOINTS DOCUMENTATION**

## 📖 **Complete API Reference Guide**

**Base URL**: `https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec`

**Method**: `POST`

**Content-Type**: `text/plain;charset=utf-8`

**API Key**: `adsfsyieryieradafas123ew45` (automatically added by APIKeyService)

---

## 🔐 **AUTHENTICATION ENDPOINTS**

### **1. Test Connection**
**Action**: `test`

**Request Body**:
```json
{
  "action": "test",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Google Apps Script is working!",
  "timestamp": "13-07-2025 23:17:09",
  "version": "2.0.0"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

### **2. User Login**
**Action**: `login`

**Request Body**:
```json
{
  "action": "login",
  "username": "testdriver",
  "password": "password123",
  "apiKey": "adsfsyieryieradafas123ew45"
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
    "lastLogin": "13-07-2025 23:17:09"
  },
  "timestamp": "13-07-2025 23:17:09"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

### **3. Get All Users**
**Action**: `getAllUsers`

**Request Body**:
```json
{
  "action": "getAllUsers",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "username": "Admin",
      "name": "Pankaj Singh",
      "date": "01-01-2024",
      "fixedCash": 100
    },
    {
      "username": "manager",
      "name": "Ashish Parihar",
      "date": "01-01-2024",
      "fixedCash": 100
    },
    {
      "username": "conductor",
      "name": "Akshay Kumar",
      "date": "01-01-2024",
      "fixedCash": 2000
    }
  ],
  "count": 3,
  "timestamp": "13-07-2025 21:48:35"
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
  "submittedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "action": "getFareReceipts",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  },
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "entryId": "1704726185847",
  "apiKey": "adsfsyieryieradafas123ew45"
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

### **5. Approve Fare Receipt**
**Action**: `approveFareReceipt`

**Request Body**:
```json
{
  "action": "approveFareReceipt",
  "entryId": "1704726185847",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "submittedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "action": "getBookingEntries",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  },
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **4. Delete Booking Entry**
**Action**: `deleteBookingEntry`

**Request Body**:
```json
{
  "action": "deleteBookingEntry",
  "entryId": "1704726185848",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **5. Approve Booking Entry**
**Action**: `approveBookingEntry`

**Request Body**:
```json
{
  "action": "approveBookingEntry",
  "entryId": "1704726185848",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Booking entry status updated to approved",
  "entryId": "1704726185848",
  "newStatus": "approved"
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
  "submittedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "action": "getFuelPayments",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  },
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **4. Delete Fuel Payment**
**Action**: `deleteFuelPayment`

**Request Body**:
```json
{
  "action": "deleteFuelPayment",
  "entryId": "1704726185849",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **5. Approve Fuel Payment**
**Action**: `approveFuelPayment`

**Request Body**:
```json
{
  "action": "approveFuelPayment",
  "entryId": "1704726185849",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Fuel payment status updated to approved",
  "entryId": "1704726185849",
  "newStatus": "approved"
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
  "submittedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "action": "getAddaPayments",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  },
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **4. Delete Adda Payment**
**Action**: `deleteAddaPayment`

**Request Body**:
```json
{
  "action": "deleteAddaPayment",
  "entryId": "1704726185850",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **5. Approve Adda Payment**
**Action**: `approveAddaPayment`

**Request Body**:
```json
{
  "action": "approveAddaPayment",
  "entryId": "1704726185850",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "submittedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "action": "getUnionPayments",
  "apiKey": "adsfsyieryieradafas123ew45"
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

**Request Body**:
```json
{
  "action": "updateUnionPayment",
  "entryId": "1704726185851",
  "updatedData": {
    "unionName": "Updated Union Name",
    "cashAmount": 1200,
    "totalAmount": 1200,
    "remarks": "Updated union fees"
  },
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **4. Delete Union Payment**
**Action**: `deleteUnionPayment`

**Request Body**:
```json
{
  "action": "deleteUnionPayment",
  "entryId": "1704726185851",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **5. Approve Union Payment**
**Action**: `approveUnionPayment`

**Request Body**:
```json
{
  "action": "approveUnionPayment",
  "entryId": "1704726185851",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

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
  "submittedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "action": "getServicePayments",
  "apiKey": "adsfsyieryieradafas123ew45"
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

**Request Body**:
```json
{
  "action": "updateServicePayment",
  "entryId": "1704726185852",
  "updatedData": {
    "serviceType": "Updated Service Type",
    "cashAmount": 3000,
    "bankAmount": 2000,
    "totalAmount": 5000,
    "serviceDetails": "Updated service details"
  },
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **4. Delete Service Payment**
**Action**: `deleteServicePayment`

**Request Body**:
```json
{
  "action": "deleteServicePayment",
  "entryId": "1704726185852",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **5. Approve Service Payment**
**Action**: `approveServicePayment`

**Request Body**:
```json
{
  "action": "approveServicePayment",
  "entryId": "1704726185852",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

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
  "submittedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "action": "getOtherPayments",
  "apiKey": "adsfsyieryieradafas123ew45"
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

**Request Body**:
```json
{
  "action": "updateOtherPayment",
  "entryId": "1704726185853",
  "updatedData": {
    "paymentType": "Updated Payment Type",
    "cashAmount": 1000,
    "bankAmount": 500,
    "totalAmount": 1500,
    "paymentDetails": "Updated payment details"
  },
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **4. Delete Other Payment**
**Action**: `deleteOtherPayment`

**Request Body**:
```json
{
  "action": "deleteOtherPayment",
  "entryId": "1704726185853",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **5. Approve Other Payment**
**Action**: `approveOtherPayment`

**Request Body**:
```json
{
  "action": "approveOtherPayment",
  "entryId": "1704726185853",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

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
  "submittedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
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
  "action": "getOffDays",
  "apiKey": "adsfsyieryieradafas123ew45"
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

**Request Body**:
```json
{
  "action": "updateOffDay",
  "entryId": "1704726185854",
  "updatedData": {
    "offDate": "2024-01-11",
    "reason": "Updated reason",
    "offType": "Sick Leave"
  },
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **4. Delete Off Day**
**Action**: `deleteOffDay`

**Request Body**:
```json
{
  "action": "deleteOffDay",
  "entryId": "1704726185854",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **5. Approve Off Day**
**Action**: `approveOffDay`

**Request Body**:
```json
{
  "action": "approveOffDay",
  "entryId": "1704726185854",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

---

## 💰 **CASH DEPOSITS ENDPOINTS**

### **1. Add Cash Deposit**
**Action**: `addCashDeposit`

**Request Body**:
```json
{
  "action": "addCashDeposit",
  "entryId": "1704726185855",
  "timestamp": "22:30:10 PM",
  "date": "2024-01-08",
  "cashAmount": 15000,
  "description": "Daily cash deposit",
  "depositedBy": "testdriver",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Cash deposit added successfully",
  "entryId": "1704726185855",
  "timestamp": "22:30:10 PM"
}
```

### **2. Get All Cash Deposits**
**Action**: `getCashDeposits`

**Request Body**:
```json
{
  "action": "getCashDeposits",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "entryId": "1704726185855",
      "timestamp": "22:30:10 PM",
      "date": "2024-01-08",
      "cashAmount": 15000,
      "description": "Daily cash deposit",
      "depositedBy": "testdriver",
      "entryType": "cash_deposit",
      "entryStatus": "pending",
      "approvedBy": "",
      "rowIndex": 2
    }
  ],
  "count": 1
}
```

### **3. Update Cash Deposit**
**Action**: `updateCashDeposit`

**Request Body**:
```json
{
  "action": "updateCashDeposit",
  "entryId": "1704726185855",
  "updatedData": {
    "cashAmount": 18000,
    "description": "Updated daily cash deposit"
  },
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **4. Delete Cash Deposit**
**Action**: `deleteCashDeposit`

**Request Body**:
```json
{
  "action": "deleteCashDeposit",
  "entryId": "1704726185855",
  "apiKey": "adsfsyieryieradafas123ew45"
}
```

### **5. Approve Cash Deposit**
**Action**: `approveCashDeposit`

**Request Body**:
```json
{
  "action": "approveCashDeposit",
  "entryId": "1704726185855",
  "approverName": "Manager Name",
  "apiKey": "adsfsyieryieradafas123ew45"
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
- `"Invalid API key"`
- `"API key is required"`
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
- `"Cash deposit not found with ID: {entryId}"`

### **Sheet Errors**:
- `"FareReceipts sheet not found"`
- `"BookingEntries sheet not found"`
- `"FuelPayments sheet not found"`
- `"AddaPayments sheet not found"`
- `"UnionPayments sheet not found"`
- `"ServicePayments sheet not found"`
- `"OtherPayments sheet not found"`
- `"OffDays sheet not found"`
- `"CashDeposits sheet not found"`

---

## 🔄 **REQUEST FLOW EXAMPLE**

### **Complete Add Fare Receipt Flow**:

**1. Frontend Request**:
```javascript
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
  },
  mode: 'cors',
  redirect: 'follow',
  body: JSON.stringify({
    action: 'addFareReceipt',
    entryId: '1704726185847',
    timestamp: '14:30:15 PM',
    date: '2024-01-08',
    route: 'Jammu to Srinagar',
    cashAmount: 3000,
    bankAmount: 2000,
    totalAmount: 5000,
    submittedBy: 'testdriver',
    apiKey: 'adsfsyieryieradafas123ew45'
  })
});
```

**2. Backend Processing**:
- Code.gs routes to FareReceipts.addFareReceipt()
- Function validates API key using Key.gs
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

## 🔐 **API KEY AUTHENTICATION**

All API requests must include the API key for authentication:

**API Key**: `adsfsyieryieradafas123ew45`

The API key is automatically added by the `APIKeyService` class in the frontend:

```javascript
// Example usage in frontend
import APIKeyService from './services/key.js';

const requestData = APIKeyService.addAPIKey({
  action: 'getFareReceipts'
});

// requestData will now contain:
// {
//   "action": "getFareReceipts",
//   "apiKey": "adsfsyieryieradafas123ew45"
// }
```

### **API Key Validation**:
- All endpoints validate the API key before processing
- Invalid or missing API key returns: `{"success": false, "error": "Invalid API key"}`
- API key validation is handled by `validateAPIKey()` function in Key.gs

---

## 📝 **NOTES**

1. **EntryId**: Always generated by frontend using `Date.now()` for uniqueness
2. **Timestamps**: Stored in IST format as time-only strings (e.g., "14:30:15 PM")
3. **Dates**: Stored in format "2024-01-08" or "01-01-2024" depending on context
4. **Status Values**: `"pending"`, `"approved"`, `"waiting"`, `"cash"`, `"bank"`
5. **Sheet Auto-Creation**: All sheets are created automatically if they don't exist
6. **Error Handling**: All functions include comprehensive try-catch blocks
7. **Legacy Support**: Old function names are supported through LegacyFunctions.gs
8. **Data Consistency**: All modules follow the same 6-function pattern (add, get, update, delete, approve, status)
9. **Row Indexing**: Sheet rows are 1-indexed, data rows start from row 2
10. **Content-Type**: Always use `text/plain;charset=utf-8` for POST requests
11. **CORS**: All endpoints support CORS for cross-origin requests
12. **Authentication**: API key validation is mandatory for all operations

---

## 🚀 **QUICK START GUIDE**

### **Test API Connection**:
```bash
curl -X POST "https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"test","apiKey":"adsfsyieryieradafas123ew45"}'
```

### **Login User**:
```bash
curl -X POST "https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"login","username":"Admin","password":"password123","apiKey":"adsfsyieryieradafas123ew45"}'
```

### **Get All Users**:
```bash
curl -X POST "https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"getAllUsers","apiKey":"adsfsyieryieradafas123ew45"}'
```

---

**Last Updated**: January 13, 2025  
**Version**: 2.1.0  
**Status**: Production Ready 🚀  
**API Key**: `adsfsyieryieradafas123ew45`
