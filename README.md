
# 🚀 **AC SUKOON TRANSPORT MANAGEMENT SYSTEM**

## 📖 **Complete Project Documentation**

A comprehensive transport management system built with **React + Vite** frontend and **Google Apps Script** backend for managing transport operations, payments, and analytics.

## 🏗️ **System Architecture**

### Frontend (React + Vite)
- **Framework**: React 19.1.0 with Vite 7.0.0
- **UI**: Bootstrap 5.3.7 for responsive design
- **Charts**: Chart.js for data visualization
- **State Management**: React hooks with hybrid data service

### Backend (Google Apps Script)
- **Database**: Google Sheets as database
- **API**: RESTful API endpoints via Google Apps Script Web App
- **Authentication**: Multi-role authentication system
- **Security**: API key-based authorization

## 🔑 **User Roles & Authentication**

### Available User Types:
1. **Driver** - Basic operations and data entry
2. **Admin** - Full system access and management
3. **Manager** - Management level access

### API Keys:
```javascript
Driver: "AC_SUKOON_2025_DRIVER_KEY_001"
Admin: "AC_SUKOON_2025_ADMIN_KEY_002" 
Manager: "AC_SUKOON_2025_MANAGER_KEY_003"
```

## 🗂️ **Data Management Modules**

### 1. **Fare Receipts** (`FareRecipt.jsx`)
- Add, view, update, delete fare receipts
- Cash/Bank amount tracking
- Route and date management
- Status approval workflow

### 2. **Booking Entries** (`BasicPayment.jsx`)
- Customer booking management
- Payment tracking (cash/bank)
- Date range bookings
- Commission calculations

### 3. **Off Days Management**
- Driver off-day tracking
- Date and reason management
- Monthly analytics

### 4. **Payment Systems** (`MiscPayment.jsx`)
- **Fuel Payments** - Fuel expense tracking
- **Adda Payments** - Adda/terminal payments
- **Union Payments** - Union dues and fees
- **Service Payments** - Vehicle service costs
- **Other Payments** - Miscellaneous expenses

### 5. **Analytics & Reports** (`Analytics.jsx`)
- Revenue analytics with charts
- Monthly/yearly comparisons
- Cash vs Bank analysis
- Category-wise breakdowns

### 6. **Cash Book** (`CashBook.jsx`)
- Daily cash flow tracking
- Transaction summaries
- Balance calculations

### 7. **Bank Summary** (`BankSummary.jsx`)
- Bank transaction overview
- Approval workflows
- Digital payment tracking

## 🔧 **Technical Features**

### Hybrid Data Service
```javascript
// File: src/services/hybridDataService.js
- Real-time Google Sheets synchronization
- Offline data caching
- Automatic retry mechanisms
- Error handling and recovery
```

### Authentication Service
```javascript
// File: src/services/authService.js
- Multi-role authentication
- API key management
- Session handling
- Secure API communication
```

### Keys Service
```javascript
// File: src/services/keys.js
- API key validation
- Permission management
- User role authorization
- Security enforcement
```

## 🚀 **Installation & Setup**

### Prerequisites
- Node.js 20+
- NPM or Yarn
- Google Account for Sheets access

### Quick Start
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup
1. Configure Google Apps Script Web App URL in `authService.js`
2. Set up Google Sheets with proper structure
3. Deploy Google Apps Script with API endpoints

## 📊 **Google Sheets Database Structure**

### Sheets Created:
1. **FareReceipts** - Fare collection data
2. **BookingEntries** - Customer bookings
3. **OffDays** - Driver off-days
4. **FuelPayments** - Fuel expenses
5. **AddaPayments** - Terminal payments
6. **UnionPayments** - Union dues
7. **ServicePayments** - Vehicle services
8. **OtherPayments** - Miscellaneous expenses
9. **Users** - Authentication data

### Common Data Fields:
- `entryId` - Unique identifier
- `timestamp` - Entry time
- `date` - Transaction date
- `cashAmount` - Cash payment
- `bankAmount` - Digital payment
- `totalAmount` - Total amount
- `submittedBy` - User who created entry
- `status` - Approval status

## 🔌 **API Endpoints**

### Authentication
```http
POST /exec
{
  "action": "login",
  "username": "driver1",
  "password": "password123",
  "userType": "driver"
}
```

### Data Operations
```http
# Add Entry
POST /exec
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
  "submittedBy": "driver1"
}

# Get All Entries
POST /exec
{
  "action": "getFareReceipts",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001"
}

# Update Entry
POST /exec
{
  "action": "updateFareReceipt",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
  "entryId": "1704726185847",
  "updatedData": {
    "route": "Updated Route",
    "totalAmount": 6000
  }
}

# Delete Entry
POST /exec
{
  "action": "deleteFareReceipt",
  "apiKey": "AC_SUKOON_2025_DRIVER_KEY_001",
  "entryId": "1704726185847"
}
```

## 🎨 **UI Components**

### Dashboard (`Dashboard.jsx`)
- Central navigation hub
- Quick stats overview
- Module access cards

### Data Summary (`DataSummary.jsx`)
- Tabular data display
- Sorting and filtering
- Bulk operations
- Status management

### Navigation (`Navbar.jsx`)
- User authentication status
- Module switching
- Logout functionality

## 📱 **Responsive Design**

- **Mobile-First** approach
- **Bootstrap 5** components
- **Flexible layouts** for all screen sizes
- **Touch-friendly** interfaces

## 🔒 **Security Features**

### API Security
- API key validation on every request
- Role-based access control
- Request timeout handling
- Error logging and monitoring

### Data Protection
- Input validation and sanitization
- XSS protection
- Secure API communication
- User session management

## 📈 **Performance Optimization**

### Frontend
- Vite for fast development and building
- Component lazy loading
- Optimized re-renders
- Efficient state management

### Backend
- Cached data responses
- Batch operations
- Optimized Google Sheets queries
- Error recovery mechanisms

## 🔄 **Data Synchronization**

### Hybrid Approach
- **Online-First**: Direct Google Sheets integration
- **Offline Fallback**: Local storage caching
- **Auto-Sync**: Background synchronization
- **Conflict Resolution**: Last-write-wins strategy

## 🛠️ **Development Tools**

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Dependencies
- **React**: UI framework
- **Chart.js**: Data visualization
- **Bootstrap**: CSS framework
- **Vite**: Build tool and dev server

## 🐛 **Debugging & Monitoring**

### Console Logging
- Detailed operation logs
- Error tracking
- Performance monitoring
- API response logging

### Error Handling
- Graceful error recovery
- User-friendly error messages
- Automatic retry mechanisms
- Fallback data sources

## 📄 **File Structure**

```
src/
├── components/
│   ├── jsx/          # React components
│   └── css/          # Component styles
├── services/         # API and data services
│   ├── authService.js
│   ├── hybridDataService.js
│   ├── keys.js
│   └── localStorageService.js
└── assets/           # Static assets

attached_assets/google-apps-script/
├── Code.gs           # Main Google Apps Script
├── Authentication.gs # User authentication
├── FareReceipts.gs   # Fare receipt operations
├── BookingEntries.gs # Booking management
├── (Various payment modules)
└── README.md         # Backend documentation
```

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📞 **Support & Contact**

For technical support or feature requests:
- Check the Google Apps Script backend documentation
- Review API endpoints documentation
- Test connection using the built-in test function

## 📄 **License**

This project is proprietary software for AC SUKOON Transport Management.

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Platform**: Replit + Google Workspace
