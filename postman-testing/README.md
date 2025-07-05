
# 🚀 AC Sukoon Transport API - Postman Testing Guide

## 📁 Complete Testing Guide - Step by Step

Yeh comprehensive guide hai jo har API endpoint ko test karne ke liye step-by-step process provide karta hai.

## 🔧 Setup Instructions

### Step 1: Postman Collection Import
1. Postman open karo
2. **Import** button click karo
3. **Raw Text** tab select karo
4. `postman-collections/` folder se JSON file copy karo
5. **Continue** → **Import** click karo

### Step 2: Environment Setup
1. Postman mein **Environments** tab open karo
2. **New Environment** click karo
3. Environment name: `AC Sukoon Transport`
4. Variables add karo:
   - `base_url`: `https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec`
   - `content_type`: `application/json`

## 📋 Testing Sequence (Recommended Order)

### Level 1: Basic Connection Tests
1. **Test Connection** - Server health check
2. **Authentication Test** - Login validation

### Level 2: Core CRUD Operations
3. **Fare Receipts** - Daily fare collection
4. **Booking Entries** - Special bookings
5. **Off Days** - Vehicle off records

### Level 3: Payment Operations
6. **Adda Payments** - Terminal payments
7. **Fuel Payments** - Fuel expense records
8. **Union Payments** - Union fee payments

### Level 4: Legacy & Admin Tests
9. **Legacy Functions** - Backward compatibility
10. **Admin Functions** - User management

## 🎯 Testing Best Practices

### ✅ Pre-Test Checklist
- [ ] Google Apps Script deployed as Web App
- [ ] Access permissions set to "Anyone"
- [ ] Test environment selected in Postman
- [ ] Internet connection stable

### 📊 Expected Response Formats
```json
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "entryId": "1234567890",
  "timestamp": "15/01/2024, 10:30:45 AM"
}

// Error Response
{
  "success": false,
  "error": "Error description here"
}
```

## 🔍 Common Issues & Solutions

### Issue 1: "Script function not found"
**Solution**: Check function names in Google Apps Script match exactly

### Issue 2: "Permission denied"
**Solution**: Re-deploy Web App with correct permissions

### Issue 3: "Invalid JSON"
**Solution**: Validate JSON format in request body

### Issue 4: "Network error"
**Solution**: Check API URL and internet connection

## 📈 Test Results Tracking

Create a simple tracking sheet:
```
Test Case | Status | Response Time | Notes
----------|--------|---------------|-------
Connection| ✅     | 1.2s         | Working
Login     | ✅     | 2.1s         | Valid user
Add Fare  | ❌     | N/A          | Check data format
```

## 🚨 Important Notes

1. **Rate Limits**: Google Apps Script has execution time limits
2. **Data Format**: Ensure dates are in YYYY-MM-DD format
3. **Authentication**: Some endpoints require valid user session
4. **Entry IDs**: Generated automatically, don't manually set
5. **Timestamps**: Automatically added in IST timezone

---

**Happy Testing! 🎉**

For issues or questions, refer to individual test folders for detailed examples.
