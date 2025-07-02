
// Updated Google Apps Script Code for New Sheet Structure

// Fare Receipts Functions
function addFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    
    sheet.appendRow([
      new Date(),           // A: Timestamp
      data.date,            // B: Date
      data.route,           // C: Route
      data.cashAmount || 0, // D: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0, // E: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0,// F: TotalAmount
      "daily",              // G: EntryType
      data.id || Date.now(),// H: EntryId
      data.submittedBy || ''// I: SubmittedBy
    ]);

    return { success: true, message: 'Fare receipt added successfully' };
  } catch (error) {
    return { success: false, error: 'Add fare receipt error: ' + error.toString() };
  }
}

function getFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[7] || (index + 2),     // H: EntryId
      timestamp: row[0],             // A: Timestamp
      date: row[1],                  // B: Date
      route: row[2],                 // C: Route
      cashAmount: row[3],            // D: CashAmount
      bankAmount: row[4],            // E: BankAmount
      totalAmount: row[5],           // F: TotalAmount
      entryType: row[6],             // G: EntryType
      submittedBy: row[8]            // I: SubmittedBy
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: 'Get fare receipts error: ' + error.toString() };
  }
}

// Booking Entries Functions
function addBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    
    sheet.appendRow([
      new Date(),                    // A: Timestamp
      data.bookingDetails || '',     // B: BookingDetails
      data.dateFrom,                 // C: DateFrom
      data.dateTo,                   // D: DateTo
      data.cashAmount || 0,          // E: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0,          // F: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0,         // G: TotalAmount
      "booking",                     // H: EntryType
      data.id || Date.now(),         // I: EntryId
      data.submittedBy || ''         // J: SubmittedBy
    ]);

    return { success: true, message: 'Booking entry added successfully' };
  } catch (error) {
    return { success: false, error: 'Add booking entry error: ' + error.toString() };
  }
}

function getBookingEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[8] || (index + 2),     // I: EntryId
      timestamp: row[0],             // A: Timestamp
      bookingDetails: row[1],        // B: BookingDetails
      dateFrom: row[2],              // C: DateFrom
      dateTo: row[3],                // D: DateTo
      cashAmount: row[4],            // E: CashAmount
      bankAmount: row[5],            // F: BankAmount
      totalAmount: row[6],           // G: TotalAmount
      entryType: row[7],             // H: EntryType
      submittedBy: row[9]            // J: SubmittedBy
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: 'Get booking entries error: ' + error.toString() };
  }
}

// Off Days Functions (Simplified - Only Date and Reason)
function addOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    
    sheet.appendRow([
      new Date(),              // A: Timestamp
      data.date,               // B: Date
      data.reason || '',       // C: Reason (Required as per user request)
      "off",                   // D: EntryType
      data.id || Date.now(),   // E: EntryId
      data.submittedBy || ''   // F: SubmittedBy
    ]);

    return { success: true, message: 'Off day added successfully' };
  } catch (error) {
    return { success: false, error: 'Add off day error: ' + error.toString() };
  }
}

function getOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[4] || (index + 2),     // E: EntryId
      timestamp: row[0],             // A: Timestamp
      date: row[1],                  // B: Date
      reason: row[2],                // C: Reason
      entryType: row[3],             // D: EntryType
      submittedBy: row[5]            // F: SubmittedBy
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: 'Get off days error: ' + error.toString() };
  }
}

