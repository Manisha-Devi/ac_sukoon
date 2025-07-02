
# Google Apps Script Setup Instructions

## Step 1: Create Google Sheets
1. Google Sheets mein jaiye aur naya spreadsheet banaye
2. Naam rakhiye: "AC Sukoon Transport Management"
3. Exact 11 sheets banaye with exact names:
   - Users
   - FareReceipts
   - BookingEntries
   - OffDays
   - FuelPayments
   - AddaPayments
   - UnionPayments
   - ServicePayments
   - OtherPayments
   - CashBookEntries
   - ApprovalData

## Step 2: Add Column Headers
Har sheet mein exact columns add kare as per backup documentation

## Step 3: Google Apps Script Setup
1. Extensions > Apps Script par jaiye
2. Code.gs file mein sara code paste kare
3. SPREADSHEET_ID replace kare:
   - Spreadsheet URL se ID copy kare
   - Example: https://docs.google.com/spreadsheets/d/1ABC123XYZ/edit
   - ID = 1ABC123XYZ

## Step 4: Deploy as Web App
1. Deploy > New Deployment par click kare
2. Type: Web app select kare
3. Execute as: Me
4. Who has access: Anyone
5. Deploy button click kare
6. Web app URL copy kare

## Step 5: React App Integration
1. Web app URL ko React mein use kare
2. API calls banaye har function ke liye
3. Authentication implement kare

## Sample API Calls for React:

```javascript
const API_URL = 'YOUR_WEB_APP_URL_HERE';

// Login
const login = async (username, password) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      username: username,
      password: password
    })
  });
  return response.json();
};

// Add Fare Receipt
const addFareReceipt = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'addFareReceipt',
      ...data
    })
  });
  return response.json();
};

// Get Fare Receipts
const getFareReceipts = async () => {
  const response = await fetch(`${API_URL}?action=getFareReceipts`);
  return response.json();
};
```

## Step 6: Testing
1. Pehle login test kare
2. Data add/get test kare
3. All CRUD operations test kare

## Important Notes:
- Exact sheet names use kare
- Column order maintain kare
- API URL secure rakhiye
- Regular backup liye rahe

## Backup Strategy:
1. Code ka backup yahan hai
2. Sheet structure documented hai
3. Regular exports kare
4. Version control maintain kare
