
# Google Apps Script Setup Instructions

## 📁 File Structure

Yeh modular Google Apps Script code hai jo multiple files mein organized hai:

### 🔧 Core Files:
1. **Code.gs** - Main entry point (doPost, doGet handlers)
2. **Utils.gs** - Utility functions (timestamps, IDs, test connection)
3. **Authentication.gs** - User login aur authentication

### 📊 Data Operation Files:
4. **FareReceipts.gs** - Daily fare entries CRUD
5. **BookingEntries.gs** - Booking entries CRUD  
6. **OffDays.gs** - Off days CRUD
7. **AddaPayments.gs** - Adda payments CRUD
8. **FuelPayments.gs** - Fuel payments CRUD
9. **UnionPayments.gs** - Union payments CRUD
10. **LegacyFunctions.gs** - Backward compatibility functions

## 🚀 Setup Instructions:

### Step 1: Create New Google Apps Script Project
1. Go to https://script.google.com
2. Click "New Project"
3. Name your project "AC Sukoon Transport API"

### Step 2: Add Files
1. Default `Code.gs` file already exists
2. Copy content from `Code.gs` file into it
3. For each additional file, click **+ > Script** to create new `.gs` files:
   - Utils.gs
   - Authentication.gs
   - FareReceipts.gs
   - BookingEntries.gs
   - OffDays.gs
   - AddaPayments.gs
   - FuelPayments.gs
   - UnionPayments.gs
   - LegacyFunctions.gs

### Step 3: Configure Spreadsheet ID
1. Open `Code.gs` file
2. Replace `SPREADSHEET_ID` with your actual Google Sheets ID:
```javascript
const SPREADSHEET_ID = "YOUR_ACTUAL_SPREADSHEET_ID_HERE";
```

### Step 4: Deploy as Web App
1. Click **Deploy > New Deployment**
2. Choose **Web app** as type
3. Set Execute as: **Me**
4. Set Access: **Anyone** (for public API)
5. Click **Deploy**
6. Copy the Web app URL
7. Update this URL in your React app's `authService.js`

### Step 5: Test Connection
1. Use the Web app URL with `?action=test` parameter
2. Should return: `{"success":true,"message":"Google Apps Script is working!"}`

## 🔄 File Dependencies:

```
Code.gs (Main)
├── Utils.gs (formatISTTimestamp, generateEntryId, testConnection)
├── Authentication.gs (handleLogin)
├── FareReceipts.gs (CRUD operations)
├── BookingEntries.gs (CRUD operations) 
├── OffDays.gs (CRUD operations)
├── AddaPayments.gs (CRUD operations)
├── FuelPayments.gs (CRUD operations)
├── UnionPayments.gs (CRUD operations)
└── LegacyFunctions.gs (backward compatibility)
```

## ✅ Benefits of Modular Structure:

1. **Easy Maintenance** - Har module alag se edit kar sakte hain
2. **Better Organization** - Related functions ek saath grouped
3. **Reusability** - Functions ko multiple places use kar sakte hain
4. **Debugging** - Specific module mein issues easily identify
5. **Team Collaboration** - Different developers different modules handle kar sakte hain

## 🔧 Quick Copy-Paste Order:

1. **Code.gs** (replace existing)
2. **Utils.gs** (new file)
3. **Authentication.gs** (new file)
4. **FareReceipts.gs** (new file)
5. **BookingEntries.gs** (new file)
6. **OffDays.gs** (new file)
7. **AddaPayments.gs** (new file)
8. **FuelPayments.gs** (new file)
9. **UnionPayments.gs** (new file)
10. **LegacyFunctions.gs** (new file)

Bas in files ko is order mein copy-paste kar do Google Apps Script mein! 🚀
