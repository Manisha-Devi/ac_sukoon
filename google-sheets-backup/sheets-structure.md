
# Google Sheets Structure Backup - AC Sukoon Transport Management

## Complete Sheets List (11 Sheets Total)

### Sheet 1: "Users" (Login Management)
**Purpose:** User authentication and role management
**Columns:**
- A: Username
- B: Password  
- C: UserType (Admin/Manager/Conductor)
- D: FullName
- E: Status (Active/Inactive)
- F: CreatedDate
- G: LastLogin

**Sample Data:**
Row 2: admin, 1234, Admin, Admin User, Active, 2024-01-01, 
Row 3: manager, 1234, Manager, Manager User, Active, 2024-01-01,
Row 4: conductor, 1234, Conductor, Conductor User, Active, 2024-01-01,

### Sheet 2: "FareReceipts" (Daily Fare Collection)
**Purpose:** Daily route fare collection tracking
**Columns:**
- A: Timestamp
- B: Date
- C: Route
- D: CashAmount
- E: BankAmount
- F: TotalAmount
- G: Remarks
- H: SubmittedBy

### Sheet 3: "BookingEntries" (Booking Fare Collection)
**Purpose:** Special booking fare collection
**Columns:**
- A: Timestamp
- B: BookingDetails
- C: DateFrom
- D: DateTo
- E: CashAmount
- F: BankAmount
- G: TotalAmount
- H: Remarks
- I: SubmittedBy

### Sheet 4: "OffDays" (Off Day Records)
**Purpose:** Track vehicle off days
**Columns:**
- A: Timestamp
- B: Date
- C: Reason
- D: SubmittedBy

### Sheet 5: "FuelPayments"
**Purpose:** Fuel expense tracking
**Columns:**
- A: Timestamp
- B: Date
- C: PumpName
- D: Liters
- E: RatePerLiter
- F: CashAmount
- G: BankAmount
- H: TotalAmount
- I: Remarks
- J: SubmittedBy

### Sheet 6: "AddaPayments"
**Purpose:** Adda/terminal payment tracking
**Columns:**
- A: Timestamp
- B: Date
- C: AddaName
- D: CashAmount
- E: BankAmount
- F: TotalAmount
- G: Remarks
- H: SubmittedBy

### Sheet 7: "UnionPayments"
**Purpose:** Union fee payment tracking
**Columns:**
- A: Timestamp
- B: Date
- C: UnionName
- D: CashAmount
- E: BankAmount
- F: TotalAmount
- G: Remarks
- H: SubmittedBy

### Sheet 8: "ServicePayments"
**Purpose:** Vehicle service and maintenance tracking
**Columns:**
- A: Timestamp
- B: Date
- C: ServiceType
- D: CashAmount
- E: BankAmount
- F: TotalAmount
- G: ServiceDetails
- H: SubmittedBy

### Sheet 9: "OtherPayments"
**Purpose:** Miscellaneous payments
**Columns:**
- A: Timestamp
- B: Date
- C: PaymentType
- D: Description
- E: CashAmount
- F: BankAmount
- G: TotalAmount
- H: Category
- I: SubmittedBy

### Sheet 10: "CashBookEntries"
**Purpose:** Manual cash book entries
**Columns:**
- A: Timestamp
- B: Date
- C: Type (Income/Expense)
- D: Description
- E: CashAmount
- F: BankAmount
- G: Category
- H: SubmittedBy

### Sheet 11: "ApprovalData"
**Purpose:** Manager approval and daily summary
**Columns:**
- A: Timestamp
- B: SubmissionDate
- C: ManagerName
- D: CashHandover
- E: BankAmount
- F: TotalCashReceipts
- G: TotalCashPayments
- H: TotalBankReceipts
- I: TotalBankPayments
- J: CashBalance
- K: BankBalance
- L: Remarks
- M: Status
- N: SubmittedBy

## Notes:
- All sheets created for AC Sukoon single vehicle transport business
- VehicleNumber columns removed as single vehicle operation
- Each sheet has proper timestamp tracking
- Authentication system built-in
- All amounts tracked separately for Cash and Bank
