
# Postman Testing Guide for Google Apps Script API

## Setup Steps:

### 1. Google Apps Script Deploy करें:
1. Google Apps Script में जाकर code paste करें
2. SPREADSHEET_ID को अपनी sheet की ID से replace करें
3. Deploy > New Deployment > Web App
4. Execute as: Me
5. Who has access: Anyone
6. Deploy button दबाएं
7. Web app URL copy करें

### 2. Postman में Collection बनाएं:
- New Collection: "AC Sukoon API Tests"
- Base URL variable बनाएं: `{{baseUrl}}`
- Value में आपका web app URL paste करें

## Test Cases:

### 1. Connection Test (GET)
**Method:** GET
**URL:** `{{baseUrl}}?action=test`
**Expected Response:**
```json
{
  "success": true,
  "message": "API is working perfectly!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "tests": {
    "spreadsheet": {
      "success": true,
      "name": "Your Sheet Name"
    },
    "sheets": {
      "success": true,
      "available": ["Users", "FareReceipts", ...]
    }
  }
}
```

### 2. Login Test (POST)
**Method:** POST
**URL:** `{{baseUrl}}`
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "action": "login",
  "username": "admin",
  "password": "admin123"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "admin",
    "userType": "Admin",
    "fullName": "Admin User",
    "status": "Active"
  }
}
```

### 3. Add Fare Receipt (POST)
**Method:** POST
**URL:** `{{baseUrl}}`
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "action": "addFareReceipt",
  "date": "2024-01-01",
  "route": "Delhi to Mumbai",
  "cashAmount": 1000,
  "bankAmount": 500,
  "totalAmount": 1500,
  "remarks": "Test entry from Postman",
  "submittedBy": "Test User"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Fare receipt added successfully"
}
```

### 4. Get Fare Receipts (GET)
**Method:** GET
**URL:** `{{baseUrl}}?action=getFareReceipts`
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "timestamp": "2024-01-01T12:00:00.000Z",
      "date": "2024-01-01",
      "route": "Delhi to Mumbai",
      "cashAmount": 1000,
      "bankAmount": 500,
      "totalAmount": 1500,
      "remarks": "Test entry from Postman",
      "submittedBy": "Test User"
    }
  ]
}
```

### 5. Add Fuel Payment (POST)
**Method:** POST
**URL:** `{{baseUrl}}`
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "action": "addFuelPayment",
  "date": "2024-01-01",
  "pumpName": "HP Petrol Pump",
  "liters": 50,
  "ratePerLiter": 100,
  "cashAmount": 3000,
  "bankAmount": 2000,
  "totalAmount": 5000,
  "remarks": "Full tank",
  "submittedBy": "Driver"
}
```

### 6. Get All Data Tests (GET)
Test करें ये सभी GET requests:
- `{{baseUrl}}?action=getBookingEntries`
- `{{baseUrl}}?action=getOffDays`
- `{{baseUrl}}?action=getFuelPayments`
- `{{baseUrl}}?action=getAddaPayments`
- `{{baseUrl}}?action=getUnionPayments`
- `{{baseUrl}}?action=getServicePayments`
- `{{baseUrl}}?action=getOtherPayments`
- `{{baseUrl}}?action=getCashBookEntries`
- `{{baseUrl}}?action=getApprovalData`

## Common Error Responses:

### 1. Invalid Action:
```json
{
  "success": false,
  "error": "Invalid action: wrongAction"
}
```

### 2. Missing Data:
```json
{
  "success": false,
  "error": "No data received"
}
```

### 3. Sheet Access Error:
```json
{
  "success": false,
  "error": "Server Error: Exception: You do not have permission to call SpreadsheetApp.openById"
}
```

## Troubleshooting:

### 1. CORS Error:
- Apps Script में CORS automatically handle होता है
- doOptions() function ensure करें

### 2. Permission Error:
- Google Apps Script में deployment settings check करें
- "Execute as: Me" और "Anyone" access ensure करें

### 3. Sheet Not Found:
- SPREADSHEET_ID correct है या नहीं check करें
- Sheet names exactly match करते हैं या नहीं verify करें

### 4. Invalid JSON:
- Body में valid JSON format ensure करें
- Content-Type header correctly set करें

## Postman Environment Variables:
```
baseUrl: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Test Collection Structure:
```
AC Sukoon API Tests/
├── 01 - Connection Test
├── 02 - Login Test
├── 03 - Data Retrieval Tests/
│   ├── Get Fare Receipts
│   ├── Get Booking Entries
│   ├── Get Fuel Payments
│   └── ...
└── 04 - Data Addition Tests/
    ├── Add Fare Receipt
    ├── Add Fuel Payment
    ├── Add Booking Entry
    └── ...
```

इस guide के साथ आप अपनी Google Apps Script API को completely test कर सकते हैं Postman में!
