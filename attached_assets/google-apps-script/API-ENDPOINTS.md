# 🌐 **AC SUKOON TRANSPORT - API ENDPOINTS DOCUMENTATION**

## 📖 **Complete API Reference Guide**

**Base URL**: `https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec`

**Method**: `POST`

**Content-Type**: `application/json`

---

## 🔐 **AUTHENTICATION & API KEYS**

### **API Key Requirements**
**Required for all endpoints except**: `test` and `login`

**Available API Keys**:
- **Driver**: `AC_SUKOON_2025_DRIVER_KEY_001`
- **Admin**: `AC_SUKOON_2025_ADMIN_KEY_002`
- **Manager**: `AC_SUKOON_2025_MANAGER_KEY_003`

**API Key Format**: All requests (except test/login) must include valid API key in request body:
```json
{
  "action": "addFareReceipt",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
  ...
}
```

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
    "lastLogin": "13/07/2025, 01:40:55 pm"
  },
  "timestamp": "13/07/2025, 01:40:55 pm"
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
**API Key Required**: Yes

**Request Body**:
```json
{
  "action": "addFareReceipt",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
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
**API Key Required**: Yes

**Request Body**:
```json
{
  "action": "getFareReceipts",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001"
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
**API Key Required**: Yes

**Request Body**:
```json
{
  "action": "updateFareReceipt",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
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
**API Key Required**: Yes

**Request Body**:
```json
{
  "action": "deleteFareReceipt",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
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
**API Key Required**: Yes (Admin/Manager level for approval)

**Request Body**:
```json
{
  "action": "updateFareReceiptStatus",
  "apiKey": "AC_SUKOON_2025_ADMIN_KEY_002",
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
**API Key Required**: Yes (Admin/Manager level)

**Request Body**:
```json
{
  "action": "approveFareReceipt",
  "apiKey": "AC_SUKOON_2025_ADMIN_KEY_002",
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

### **7. Resend Fare Receipt**
**Action**: `resendFareReceipt`
**API Key Required**: Yes

**Request Body**:
```json
{
  "action": "resendFareReceipt",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
  "entryId": "1704726185847"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Fare receipt status updated to pending",
  "entryId": "1704726185847",
  "newStatus": "pending"
}
```

---

## 📋 **BOOKING ENTRIES ENDPOINTS**

### **1. Add Booking Entry**
**Action**: `addBookingEntry`
**API Key Required**: Yes

**Request Body**:
```json
{
  "action": "addBookingEntry",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
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

### **2. Get All Booking Entries**
**Action**: `getBookingEntries`
**API Key Required**: Yes

### **3. Update Booking Entry**
**Action**: `updateBookingEntry`
**API Key Required**: Yes

### **4. Delete Booking Entry**
**Action**: `deleteBookingEntry`
**API Key Required**: Yes

### **5. Update Booking Entry Status**
**Action**: `updateBookingEntryStatus`
**API Key Required**: Yes (Admin/Manager for approval)

### **6. Approve Booking Entry**
**Action**: `approveBookingEntry`
**API Key Required**: Yes (Admin/Manager level)

---

## ⛽ **FUEL PAYMENTS ENDPOINTS**

### **1. Add Fuel Payment**
**Action**: `addFuelPayment`
**API Key Required**: Yes

**Request Body**:
```json
{
  "action": "addFuelPayment",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
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

### **2. Get All Fuel Payments**
**Action**: `getFuelPayments`
**API Key Required**: Yes

### **3. Update Fuel Payment**
**Action**: `updateFuelPayment`
**API Key Required**: Yes

### **4. Delete Fuel Payment**
**Action**: `deleteFuelPayment`
**API Key Required**: Yes

### **5. Update Fuel Payment Status**
**Action**: `updateFuelPaymentStatus`
**API Key Required**: Yes (Admin/Manager for approval)

### **6. Approve Fuel Payment**
**Action**: `approveFuelPayment`
**API Key Required**: Yes (Admin/Manager level)

---

## 🚌 **ADDA PAYMENTS ENDPOINTS**

### **1. Add Adda Payment**
**Action**: `addAddaPayment`
**API Key Required**: Yes

### **2. Get All Adda Payments**
**Action**: `getAddaPayments`
**API Key Required**: Yes

### **3. Update Adda Payment**
**Action**: `updateAddaPayment`
**API Key Required**: Yes

### **4. Delete Adda Payment**
**Action**: `deleteAddaPayment`
**API Key Required**: Yes

### **5. Update Adda Payment Status**
**Action**: `updateAddaPaymentStatus`
**API Key Required**: Yes (Admin/Manager for approval)

### **6. Approve Adda Payment**
**Action**: `approveAddaPayment`
**API Key Required**: Yes (Admin/Manager level)

---

## 🤝 **UNION PAYMENTS ENDPOINTS**

### **1. Add Union Payment**
**Action**: `addUnionPayment`
**API Key Required**: Yes

### **2. Get All Union Payments**
**Action**: `getUnionPayments`
**API Key Required**: Yes

### **3. Update Union Payment**
**Action**: `updateUnionPayment`
**API Key Required**: Yes

### **4. Delete Union Payment**
**Action**: `deleteUnionPayment`
**API Key Required**: Yes

### **5. Update Union Payment Status**
**Action**: `updateUnionPaymentStatus`
**API Key Required**: Yes (Admin/Manager for approval)

### **6. Approve Union Payment**
**Action**: `approveUnionPayment`
**API Key Required**: Yes (Admin/Manager level)

---

## 🔧 **SERVICE PAYMENTS ENDPOINTS**

### **1. Add Service Payment**
**Action**: `addServicePayment`
**API Key Required**: Yes

### **2. Get All Service Payments**
**Action**: `getServicePayments`
**API Key Required**: Yes

### **3. Update Service Payment**
**Action**: `updateServicePayment`
**API Key Required**: Yes

### **4. Delete Service Payment**
**Action**: `deleteServicePayment`
**API Key Required**: Yes

### **5. Update Service Payment Status**
**Action**: `updateServicePaymentStatus`
**API Key Required**: Yes (Admin/Manager for approval)

### **6. Approve Service Payment**
**Action**: `approveServicePayment`
**API Key Required**: Yes (Admin/Manager level)

---

## 📦 **OTHER PAYMENTS ENDPOINTS**

### **1. Add Other Payment**
**Action**: `addOtherPayment`
**API Key Required**: Yes

### **2. Get All Other Payments**
**Action**: `getOtherPayments`
**API Key Required**: Yes

### **3. Update Other Payment**
**Action**: `updateOtherPayment`
**API Key Required**: Yes

### **4. Delete Other Payment**
**Action**: `deleteOtherPayment`
**API Key Required**: Yes

### **5. Update Other Payment Status**
**Action**: `updateOtherPaymentStatus`
**API Key Required**: Yes (Admin/Manager for approval)

### **6. Approve Other Payment**
**Action**: `approveOtherPayment`
**API Key Required**: Yes (Admin/Manager level)

---

## 🏖️ **OFF DAYS ENDPOINTS**

### **1. Add Off Day**
**Action**: `addOffDay`
**API Key Required**: Yes

### **2. Get All Off Days**
**Action**: `getOffDays`
**API Key Required**: Yes

### **3. Update Off Day**
**Action**: `updateOffDay`
**API Key Required**: Yes

### **4. Delete Off Day**
**Action**: `deleteOffDay`
**API Key Required**: Yes

### **5. Update Off Day Status**
**Action**: `updateOffDayStatus`
**API Key Required**: Yes (Admin/Manager for approval)

### **6. Approve Off Day**
**Action**: `approveOffDay`
**API Key Required**: Yes (Admin/Manager level)

---

## 🧪 **UTILITY ENDPOINTS**

### **1. Test Connection**
**Action**: `test`
**API Key Required**: No

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
  "timestamp": "13/07/2025, 01:40:55 pm",
  "version": "2.0.0"
}
```

---

## 🔑 **API KEY VALIDATION & PERMISSIONS**

### **Permission Levels**:

**Driver Keys** (`AC_SUKOON_2025_DRIVER_KEY_001`):
- ✅ Add, Get, Update, Delete all entry types
- ❌ Approve entries (Admin/Manager only)
- ❌ Change status to 'approved'

**Admin Keys** (`AC_SUKOON_2025_ADMIN_KEY_002`):
- ✅ All driver permissions
- ✅ Approve all entry types
- ✅ Update status to 'approved'
- ✅ Full system access

**Manager Keys** (`AC_SUKOON_2025_MANAGER_KEY_003`):
- ✅ All admin permissions
- ✅ Full system management access

### **API Key Format Validation**:
- Pattern: `AC_SUKOON_YYYY_TYPE_KEY_NNN`
- Example: `AC_SUKOON_2025_DRIVER_KEY_001`

---

## 📊 **COMMON RESPONSE PATTERNS**

### **Success Response Structure**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}, // or array for get operations
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
- `"Invalid API key provided"`
- `"API key authentication required"`
- `"Permission denied for action: {action} with key type: {keyType}"`

### **Entry Not Found Errors**:
- `"Fare receipt not found with ID: {entryId}"`
- `"Booking entry not found with ID: {entryId}"`
- `"Fuel payment not found with ID: {entryId}"`
- And similar for other entry types...

### **Sheet Errors**:
- `"FareReceipts sheet not found"`
- `"BookingEntries sheet not found"`
- And similar for other sheet types...

---

## 📝 **NOTES**

1. **API Key Required**: All endpoints except `test` and `login` require valid API key
2. **Permission-Based Access**: Different key types have different permission levels
3. **EntryId**: Always generated by frontend using `Date.now()` for uniqueness
4. **Timestamps**: Stored in IST format as time-only strings
5. **Status Values**: `"pending"`, `"approved"`, `"waiting"`, `"cash"`, `"bank"`
6. **Sheet Auto-Creation**: All sheets are created automatically if they don't exist
7. **Error Handling**: All functions include comprehensive try-catch blocks
8. **Legacy Support**: Old function names are supported through LegacyFunctions.gs

---

**Last Updated**: January 13, 2025  
**Version**: 2.1.0  
**Status**: Production Ready with API Key Authentication 🚀