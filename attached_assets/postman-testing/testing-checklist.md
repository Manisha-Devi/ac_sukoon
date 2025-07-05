
# 📋 Postman Testing Checklist

## Pre-Testing Setup ✅

- [ ] Google Apps Script deployed as Web App
- [ ] Permissions set to "Anyone" 
- [ ] Postman environment configured
- [ ] Base URL variable set correctly
- [ ] Internet connection stable

## Basic Tests (Required First) 🔧

- [ ] **01 - Connection Test**: Server health check
  - [ ] Test server connection response
  - [ ] Verify API is accessible
  - [ ] Check response format

- [ ] **02 - Authentication Test**: Login validation
  - [ ] Test valid credentials
  - [ ] Test invalid credentials
  - [ ] Verify response structure

## Core CRUD Operations 📊

### Fare Receipts (Daily Collection)
- [ ] **Add Fare Receipt**: Create new entry
- [ ] **Get Fare Receipts**: Retrieve all entries  
- [ ] **Update Fare Receipt**: Modify existing entry
- [ ] **Delete Fare Receipt**: Remove entry

### Booking Entries (Special Bookings)
- [ ] **Add Booking Entry**: Create booking record
- [ ] **Get Booking Entries**: Retrieve all bookings
- [ ] **Update Booking Entry**: Modify booking details
- [ ] **Delete Booking Entry**: Remove booking

### Off Days (Vehicle Off Records)
- [ ] **Add Off Day**: Record vehicle off day
- [ ] **Get Off Days**: Retrieve off day records
- [ ] **Update Off Day**: Modify off day details  
- [ ] **Delete Off Day**: Remove off day record

## Payment Operations 💰

### Fuel Payments
- [ ] **Add Fuel Payment**: Record fuel expense
- [ ] **Get Fuel Payments**: Retrieve fuel records
- [ ] **Update Fuel Payment**: Modify fuel details
- [ ] **Delete Fuel Payment**: Remove fuel record

### Adda Payments (Terminal Fees)
- [ ] **Add Adda Payment**: Record terminal payment
- [ ] **Get Adda Payments**: Retrieve terminal records
- [ ] **Update Adda Payment**: Modify payment details
- [ ] **Delete Adda Payment**: Remove payment record

### Union Payments  
- [ ] **Add Union Payment**: Record union fee
- [ ] **Get Union Payments**: Retrieve union records
- [ ] **Update Union Payment**: Modify union details
- [ ] **Delete Union Payment**: Remove union record

## Advanced & Admin Tests 🔧

### Legacy Functions (Backward Compatibility)
- [ ] **Legacy Update**: Test old update format
- [ ] **Legacy Delete**: Test old delete format

### Admin Functions
- [ ] **Get All Users**: Retrieve user list
- [ ] **Update Last Login**: Update user activity

## Testing Notes & Issues 📝

### Common Response Patterns to Verify:
```json
// Success Response
{
  "success": true,
  "message": "Operation completed",
  "entryId": "generated_id",
  "data": [...]
}

// Error Response  
{
  "success": false,
  "error": "Error description"
}
```

### Data Validation Checks:
- [ ] Date format: YYYY-MM-DD
- [ ] Numeric fields are numbers, not strings
- [ ] Required fields are not empty
- [ ] Entry IDs are generated automatically
- [ ] Timestamps are in IST format

### Performance Checks:
- [ ] Response time < 5 seconds
- [ ] Large data sets load properly
- [ ] Multiple concurrent requests work
- [ ] Memory usage acceptable

## Test Results Summary 📊

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Basic Tests | 2 | - | - | - |
| Fare Receipts | 4 | - | - | - |
| Booking Entries | 4 | - | - | - |
| Off Days | 4 | - | - | - |
| Fuel Payments | 4 | - | - | - |
| Adda Payments | 4 | - | - | - |
| Union Payments | 4 | - | - | - |
| Legacy Tests | 2 | - | - | - |
| Admin Tests | 2 | - | - | - |
| **TOTAL** | **30** | **-** | **-** | **-** |

## Sign-off ✍️

**Tester**: ________________  
**Date**: ________________  
**Environment**: ________________  
**Overall Status**: ✅ PASS / ❌ FAIL  

**Notes**:
_________________________________
_________________________________
_________________________________
