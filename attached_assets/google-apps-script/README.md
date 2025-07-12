
# 🚀 **AC SUKOON TRANSPORT MANAGEMENT - Google Apps Script Backend**

## 📖 **Complete System Documentation**

This Google Apps Script backend provides a complete CRUD (Create, Read, Update, Delete) system for managing transport operations data stored in Google Sheets with API key authentication and role-based access control.

---

## 🎯 **OVERVIEW**

### **What This System Does**
- **Complete Transport Management**: Handles all aspects of transport business operations
- **Multi-User Authentication**: Secure login system with role-based access
- **API Key Security**: Three-tier authentication (Driver, Admin, Manager)
- **Real-Time Data**: Direct Google Sheets integration for instant updates
- **CRUD Operations**: Full Create, Read, Update, Delete for all data types
- **Status Management**: Approval workflows for financial oversight
- **Auto Sheet Creation**: Automatically creates required sheets if missing

### **System Architecture**
```
Frontend (React) → Google Apps Script → Google Sheets Database
     ↑                    ↑                      ↑
  API Calls         Authentication          Data Storage
```

---

## 🔐 **AUTHENTICATION SYSTEM**

### **Multi-Role User Management**
- **Driver**: Basic operations and data entry
- **Admin**: Full system access and approvals
- **Manager**: Complete management oversight

### **API Key Authentication**
- **Driver Key**: `AC_SUKOON_2025_DRIVER_KEY_001`
- **Admin Key**: `AC_SUKOON_2025_ADMIN_KEY_002`
- **Manager Key**: `AC_SUKOON_2025_MANAGER_KEY_003`

### **User Login System**
- Secure username/password authentication
- Session management with last login tracking
- User status validation (active/inactive)
- Fixed cash amount assignment for drivers

---

## 📊 **DATA MODULES & FEATURES**

### **1. FARE RECEIPTS MANAGEMENT** (`FareReceipts.gs`)
**Purpose**: Daily fare collection tracking

**Features**:
- ✅ Add daily fare receipts
- ✅ Route-wise fare tracking
- ✅ Cash vs Bank amount separation
- ✅ Driver-wise submission tracking
- ✅ Status management (pending/approved)
- ✅ Approval workflow with approver names

**Data Fields**:
- Entry ID, Timestamp, Date
- Route information
- Cash Amount, Bank Amount, Total Amount
- Submitted By, Entry Status, Approved By

### **2. BOOKING ENTRIES MANAGEMENT** (`BookingEntries.gs`)
**Purpose**: Customer booking and special trip management

**Features**:
- ✅ Add customer bookings
- ✅ Multi-day booking support (Date From/To)
- ✅ Detailed booking descriptions
- ✅ Financial tracking per booking
- ✅ Status approval workflows
- ✅ Special event/wedding bookings

**Data Fields**:
- Entry ID, Timestamp
- Booking Details, Date From, Date To
- Cash Amount, Bank Amount, Total Amount
- Submitted By, Entry Status, Approved By

### **3. OFF DAYS MANAGEMENT** (`OffDays.gs`)
**Purpose**: Driver off-day tracking and leave management

**Features**:
- ✅ Add off-day requests
- ✅ Reason tracking for leave
- ✅ Date-wise off-day management
- ✅ Approval workflows for leave
- ✅ Driver availability tracking

**Data Fields**:
- Entry ID, Timestamp, Date
- Reason for off-day
- Submitted By, Entry Status, Approved By

### **4. FUEL PAYMENTS MANAGEMENT** (`FuelPayments.gs`)
**Purpose**: Comprehensive fuel expense tracking

**Features**:
- ✅ Add fuel purchase records
- ✅ Pump-wise tracking
- ✅ Liters and rate calculation
- ✅ Cash/Bank payment separation
- ✅ Remarks for additional notes
- ✅ Fuel efficiency analysis data

**Data Fields**:
- Entry ID, Timestamp, Date
- Pump Name, Liters, Rate per Liter
- Cash Amount, Bank Amount, Total Amount
- Remarks, Submitted By, Entry Status, Approved By

### **5. ADDA PAYMENTS MANAGEMENT** (`AddaPayments.gs`)
**Purpose**: Bus terminal and adda payment tracking

**Features**:
- ✅ Add adda/terminal payments
- ✅ Location-wise payment tracking
- ✅ Cash/Bank separation
- ✅ Remarks for payment details
- ✅ Terminal fee management

**Data Fields**:
- Entry ID, Timestamp, Date
- Adda Name, Payment Details
- Cash Amount, Bank Amount, Total Amount
- Remarks, Submitted By, Entry Status, Approved By

### **6. UNION PAYMENTS MANAGEMENT** (`UnionPayments.gs`)
**Purpose**: Union dues and association payment tracking

**Features**:
- ✅ Add union payment records
- ✅ Union-wise payment tracking
- ✅ Due payment management
- ✅ Cash/Bank transaction support
- ✅ Payment verification workflows

**Data Fields**:
- Entry ID, Timestamp, Date
- Union Name, Payment Details
- Cash Amount, Bank Amount, Total Amount
- Remarks, Submitted By, Entry Status, Approved By

### **7. SERVICE PAYMENTS MANAGEMENT** (`ServicePayments.gs`)
**Purpose**: Vehicle service and maintenance expense tracking

**Features**:
- ✅ Add service payment records
- ✅ Service type categorization
- ✅ Detailed service descriptions
- ✅ Workshop/mechanic tracking
- ✅ Maintenance cost analysis

**Data Fields**:
- Entry ID, Timestamp, Date
- Service Type, Service Details
- Cash Amount, Bank Amount, Total Amount
- Submitted By, Entry Status, Approved By

### **8. OTHER PAYMENTS MANAGEMENT** (`OtherPayments.gs`)
**Purpose**: Miscellaneous expense tracking

**Features**:
- ✅ Add miscellaneous payments
- ✅ Flexible payment categorization
- ✅ Custom payment descriptions
- ✅ General expense management
- ✅ Uncategorized expense tracking

**Data Fields**:
- Entry ID, Timestamp, Date
- Payment Type, Payment Details
- Cash Amount, Bank Amount, Total Amount
- Submitted By, Entry Status, Approved By

---

## 🔧 **TECHNICAL MODULES**

### **AUTHENTICATION MODULE** (`Authentication.gs`)
- User login validation
- Password verification
- Session management
- Last login tracking
- User status validation

### **API KEYS MODULE** (`Keys.gs`)
- API key validation
- Permission management
- Role-based access control
- Security enforcement

### **UTILITIES MODULE** (`Utils.gs`)
- Common helper functions
- Date/time formatting
- Data validation
- Error handling utilities

### **LEGACY FUNCTIONS** (`LegacyFunctions.gs`)
- Backward compatibility
- Old function name support
- Migration assistance
- Version compatibility

---

## 📋 **GOOGLE SHEETS STRUCTURE**

### **Auto-Created Sheets**:
1. **Users** - Authentication data
2. **FareReceipts** - Daily fare collections
3. **BookingEntries** - Customer bookings
4. **OffDays** - Driver leave management
5. **FuelPayments** - Fuel expenses
6. **AddaPayments** - Terminal payments
7. **UnionPayments** - Union dues
8. **ServicePayments** - Vehicle services
9. **OtherPayments** - Miscellaneous expenses

### **Common Sheet Structure**:
```
| Entry ID | Timestamp | Date | [Specific Fields] | Cash Amount | Bank Amount | Total Amount | Entry Type | Submitted By | Entry Status | Approved By |
```

---

## 🚀 **API ENDPOINTS**

### **Base Configuration**:
- **URL**: `https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec`
- **Method**: POST
- **Content-Type**: application/json

### **Available Actions**:
Each data module supports these operations:
- ✅ **Add**: Create new entries
- ✅ **Get**: Retrieve all entries
- ✅ **Update**: Modify existing entries
- ✅ **Delete**: Remove entries
- ✅ **UpdateStatus**: Change approval status
- ✅ **Approve**: Quick approval action

### **Example API Call**:
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

---

## 🔒 **SECURITY FEATURES**

### **API Key Authentication**:
- Mandatory for all operations (except test/login)
- Role-based permission validation
- Key format validation
- Unauthorized access prevention

### **Permission Levels**:
- **Driver**: CRUD operations on own entries
- **Admin**: Full system access + approvals
- **Manager**: Complete management oversight

### **Data Validation**:
- Input sanitization
- Required field validation
- Data type checking
- Error handling

---

## 🛠️ **DEVELOPMENT FEATURES**

### **Error Handling**:
- Comprehensive try-catch blocks
- Detailed error messages
- Graceful failure recovery
- Debug logging

### **Auto-Creation**:
- Missing sheet detection
- Automatic sheet creation
- Header row initialization
- Data structure setup

### **Legacy Support**:
- Old function name compatibility
- Version migration support
- Backward compatibility maintenance

---

## 📊 **STATUS MANAGEMENT**

### **Entry Statuses**:
- **pending**: Newly created, awaiting approval
- **approved**: Approved by admin/manager
- **waiting**: Pending additional information
- **cash**: Cash payment confirmed
- **bank**: Bank payment confirmed

### **Approval Workflow**:
1. Driver submits entry (status: pending)
2. Admin/Manager reviews entry
3. Admin/Manager approves/modifies status
4. System tracks approver name and timestamp

---

## 🧪 **TESTING & VALIDATION**

### **Test Function**:
```json
{
  "action": "test"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Google Apps Script is working!",
  "timestamp": "13/07/2025, 01:40:55 pm",
  "version": "2.0.0"
}
```

### **Connection Validation**:
- API endpoint health check
- Database connectivity test
- Authentication system test
- Response time monitoring

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Efficient Operations**:
- Batch data processing
- Optimized sheet queries
- Minimal API calls
- Cached responses

### **Error Recovery**:
- Retry mechanisms
- Fallback operations
- Graceful degradation
- User feedback

---

## 🔄 **INTEGRATION FEATURES**

### **Frontend Integration**:
- Real-time data synchronization
- Offline-capable design
- Background sync operations
- Error handling

### **Data Export**:
- Google Sheets native export
- CSV/Excel compatibility
- Report generation
- Data analytics support

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**:
- [ ] Google Sheets created/accessible
- [ ] Google Apps Script deployed as web app
- [ ] API keys configured
- [ ] User accounts created
- [ ] Permissions set correctly

### **Post-Deployment**:
- [ ] Test connection working
- [ ] All CRUD operations functional
- [ ] Authentication working
- [ ] Data validation active
- [ ] Error handling operational

---

## 📞 **SUPPORT & MAINTENANCE**

### **Monitoring**:
- Regular connection tests
- Data integrity checks
- Performance monitoring
- User access validation

### **Updates**:
- Feature additions
- Security improvements
- Bug fixes
- Performance optimization

---

## 📄 **VERSION INFORMATION**

- **Current Version**: 2.1.0
- **Last Updated**: January 13, 2025
- **Status**: Production Ready
- **Authentication**: API Key Enabled
- **Features**: Complete CRUD + Multi-Module Support

---

## 🚀 **GETTING STARTED**

### **Quick Setup**:
1. Deploy Google Apps Script as web app
2. Note the web app URL
3. Configure API keys
4. Create user accounts
5. Test connection
6. Start using the system

### **First API Call**:
```bash
curl -X POST https://your-web-app-url/exec \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

This comprehensive backend system provides everything needed for complete transport business management with security, reliability, and scalability built-in! 🚀
