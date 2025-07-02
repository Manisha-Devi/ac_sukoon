// AC Sukoon Transport Management - Google Apps Script API
// Complete Clean Code

// IMPORTANT: Replace this with your actual Google Sheets ID
const SPREADSHEET_ID = "1bM61ei_kP2QdBQQyRN_d00aOAu0qcWACleOidEmhzgM";

// Sheet names - must match exactly
const SHEET_NAMES = {
  USERS: "Users",
  FARE_RECEIPTS: "FareReceipts",
  BOOKING_ENTRIES: "BookingEntries",
  OFF_DAYS: "OffDays",
  FUEL_PAYMENTS: "FuelPayments",
  ADDA_PAYMENTS: "AddaPayments",
  UNION_PAYMENTS: "UnionPayments",
  SERVICE_PAYMENTS: "ServicePayments",
  OTHER_PAYMENTS: "OtherPayments",
  CASH_BOOK_ENTRIES: "CashBookEntries",
  APPROVAL_DATA: "ApprovalData",
};

// Handle OPTIONS requests for CORS
function doOptions() {
  return ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.TEXT,
  );
}

// Main POST handler
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received");
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;

    switch (action) {
      case "login":
        result = handleLogin(data);
        break;
      case "addFareReceipt":
        result = addFareReceipt(data);
        break;
      case "getFareReceipts":
        result = getFareReceipts();
        break;
      case "addBookingEntry":
        result = addBookingEntry(data);
        break;
      case "getBookingEntries":
        result = getBookingEntries();
        break;
      case "addOffDay":
        result = addOffDay(data);
        break;
      case "getOffDays":
        result = getOffDays();
        break;
      case "addFuelPayment":
        result = addFuelPayment(data);
        break;
      case "getFuelPayments":
        result = getFuelPayments();
        break;
      case "addAddaPayment":
        result = addAddaPayment(data);
        break;
      case "getAddaPayments":
        result = getAddaPayments();
        break;
      case "addUnionPayment":
        result = addUnionPayment(data);
        break;
      case "getUnionPayments":
        result = getUnionPayments();
        break;
      case "addServicePayment":
        result = addServicePayment(data);
        break;
      case "getServicePayments":
        result = getServicePayments();
        break;
      case "addOtherPayment":
        result = addOtherPayment(data);
        break;
      case "getOtherPayments":
        result = getOtherPayments();
        break;
      case "addCashBookEntry":
        result = addCashBookEntry(data);
        break;
      case "getCashBookEntries":
        result = getCashBookEntries();
        break;
      case "addApprovalData":
        result = addApprovalData(data);
        break;
      case "getApprovalData":
        result = getApprovalData();
        break;
      default:
        result = { success: false, error: "Invalid action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Server Error: " + error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Main GET handler
function doGet(e) {
  try {
    if (!e || !e.parameter || !e.parameter.action) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "No action parameter provided",
        }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const action = e.parameter.action;
    let result;

    switch (action) {
      case "test":
        result = testConnection();
        break;
      case "getFareReceipts":
        result = getFareReceipts();
        break;
      case "getBookingEntries":
        result = getBookingEntries();
        break;
      case "getOffDays":
        result = getOffDays();
        break;
      case "getFuelPayments":
        result = getFuelPayments();
        break;
      case "getAddaPayments":
        result = getAddaPayments();
        break;
      case "getUnionPayments":
        result = getUnionPayments();
        break;
      case "getServicePayments":
        result = getServicePayments();
        break;
      case "getOtherPayments":
        result = getOtherPayments();
        break;
      case "getCashBookEntries":
        result = getCashBookEntries();
        break;
      case "getApprovalData":
        result = getApprovalData();
        break;
      default:
        result = { success: false, error: "Invalid GET action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "GET Error: " + error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test Connection Function
function testConnection() {
  try {
    const result = {
      success: true,
      message: "API is working perfectly!",
      timestamp: new Date().toISOString(),
      spreadsheetId: SPREADSHEET_ID,
      tests: {},
    };

    // Test spreadsheet access
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      result.tests.spreadsheet = {
        success: true,
        name: spreadsheet.getName(),
      };
    } catch (error) {
      result.tests.spreadsheet = {
        success: false,
        error: error.toString(),
      };
    }

    // Test sheets existence
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheets = spreadsheet.getSheets();
      const sheetNames = sheets.map((sheet) => sheet.getName());

      result.tests.sheets = {
        success: true,
        available: sheetNames,
        required: Object.values(SHEET_NAMES),
      };
    } catch (error) {
      result.tests.sheets = {
        success: false,
        error: error.toString(),
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: "Test failed: " + error.toString(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Authentication
function handleLogin(data) {
  try {
    console.log("Login attempt:", data);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.USERS,
    );
    const values = sheet.getDataRange().getValues();

    console.log("Sheet data:", values);
    console.log(
      "Looking for username:",
      data.username,
      "password:",
      data.password,
    );

    for (let i = 1; i < values.length; i++) {
      console.log("Checking row", i, ":", values[i][0], values[i][1]);

      // Convert to string and trim whitespace
      const sheetUsername = String(values[i][0]).trim();
      const sheetPassword = String(values[i][1]).trim();
      const inputUsername = String(data.username).trim();
      const inputPassword = String(data.password).trim();

      console.log(
        "Comparing:",
        sheetUsername,
        "===",
        inputUsername,
        "&&",
        sheetPassword,
        "===",
        inputPassword,
      );

      if (sheetUsername === inputUsername && sheetPassword === inputPassword) {
        // Update last login
        sheet.getRange(i + 1, 7).setValue(new Date());

        return {
          success: true,
          message: "Login successful",
          user: {
            username: values[i][0],
            userType: values[i][2],
            fullName: values[i][3],
            status: values[i][4],
          },
        };
      }
    }

    return {
      success: false,
      error: "Invalid username or password",
      debug: {
        receivedUsername: data.username,
        receivedPassword: data.password,
        sheetData: values
          .slice(1)
          .map((row) => ({ username: row[0], password: row[1] })),
      },
    };
  } catch (error) {
    return { success: false, error: "Login error: " + error.toString() };
  }
}

// Fare Receipts
function addFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );

    sheet.appendRow([
      new Date(),
      data.date,
      data.route,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Fare receipt added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add fare receipt error: " + error.toString(),
    };
  }
}

function getFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      route: row[2],
      cashAmount: row[3],
      bankAmount: row[4],
      totalAmount: row[5],
      remarks: row[6],
      submittedBy: row[7],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get fare receipts error: " + error.toString(),
    };
  }
}

// Booking Entries
function addBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );

    sheet.appendRow([
      new Date(),
      data.bookingDetails || "",
      data.dateFrom,
      data.dateTo,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Booking entry added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add booking entry error: " + error.toString(),
    };
  }
}

function getBookingEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      bookingDetails: row[1],
      dateFrom: row[2],
      dateTo: row[3],
      cashAmount: row[4],
      bankAmount: row[5],
      totalAmount: row[6],
      remarks: row[7],
      submittedBy: row[8],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get booking entries error: " + error.toString(),
    };
  }
}

// Off Days
function addOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );

    sheet.appendRow([
      new Date(),
      data.date,
      data.reason || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Off day added successfully" };
  } catch (error) {
    return { success: false, error: "Add off day error: " + error.toString() };
  }
}

function getOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      reason: row[2],
      submittedBy: row[3],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: "Get off days error: " + error.toString() };
  }
}

// Fuel Payments
function addFuelPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FUEL_PAYMENTS,
    );

    sheet.appendRow([
      new Date(),
      data.date,
      data.pumpName || "",
      data.liters || 0,
      data.ratePerLiter || 0,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Fuel payment added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add fuel payment error: " + error.toString(),
    };
  }
}

function getFuelPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FUEL_PAYMENTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      pumpName: row[2],
      liters: row[3],
      ratePerLiter: row[4],
      cashAmount: row[5],
      bankAmount: row[6],
      totalAmount: row[7],
      remarks: row[8],
      submittedBy: row[9],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get fuel payments error: " + error.toString(),
    };
  }
}

// Adda Payments
function addAddaPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.ADDA_PAYMENTS,
    );

    sheet.appendRow([
      new Date(),
      data.date,
      data.addaName || "",
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Adda payment added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add adda payment error: " + error.toString(),
    };
  }
}

function getAddaPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.ADDA_PAYMENTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      addaName: row[2],
      cashAmount: row[3],
      bankAmount: row[4],
      totalAmount: row[5],
      remarks: row[6],
      submittedBy: row[7],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get adda payments error: " + error.toString(),
    };
  }
}

// Union Payments
function addUnionPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.UNION_PAYMENTS,
    );

    sheet.appendRow([
      new Date(),
      data.date,
      data.unionName || "",
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Union payment added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add union payment error: " + error.toString(),
    };
  }
}

function getUnionPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.UNION_PAYMENTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      unionName: row[2],
      cashAmount: row[3],
      bankAmount: row[4],
      totalAmount: row[5],
      remarks: row[6],
      submittedBy: row[7],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get union payments error: " + error.toString(),
    };
  }
}

// Service Payments
function addServicePayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.SERVICE_PAYMENTS,
    );

    sheet.appendRow([
      new Date(),
      data.date,
      data.serviceType || "",
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.serviceDetails || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Service payment added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add service payment error: " + error.toString(),
    };
  }
}

function getServicePayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.SERVICE_PAYMENTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      serviceType: row[2],
      cashAmount: row[3],
      bankAmount: row[4],
      totalAmount: row[5],
      serviceDetails: row[6],
      submittedBy: row[7],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get service payments error: " + error.toString(),
    };
  }
}

// Other Payments
function addOtherPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OTHER_PAYMENTS,
    );

    sheet.appendRow([
      new Date(),
      data.date,
      data.paymentType || "",
      data.description || "",
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.category || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Other payment added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add other payment error: " + error.toString(),
    };
  }
}

function getOtherPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OTHER_PAYMENTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      paymentType: row[2],
      description: row[3],
      cashAmount: row[4],
      bankAmount: row[5],
      totalAmount: row[6],
      category: row[7],
      submittedBy: row[8],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get other payments error: " + error.toString(),
    };
  }
}

// Cash Book Entries
function addCashBookEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.CASH_BOOK_ENTRIES,
    );

    sheet.appendRow([
      new Date(),
      data.date,
      data.type || "",
      data.description || "",
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.category || "",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Cash book entry added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add cash book entry error: " + error.toString(),
    };
  }
}

function getCashBookEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.CASH_BOOK_ENTRIES,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      type: row[2],
      description: row[3],
      cashAmount: row[4],
      bankAmount: row[5],
      category: row[6],
      submittedBy: row[7],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get cash book entries error: " + error.toString(),
    };
  }
}

// Approval Data
function addApprovalData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.APPROVAL_DATA,
    );

    sheet.appendRow([
      new Date(),
      data.submissionDate,
      data.managerName || "",
      data.cashHandover || 0,
      data.bankAmount || 0,
      data.totalCashReceipts || 0,
      data.totalCashPayments || 0,
      data.totalBankReceipts || 0,
      data.totalBankPayments || 0,
      data.cashBalance || 0,
      data.bankBalance || 0,
      data.remarks || "",
      data.status || "Pending",
      data.submittedBy || "",
    ]);

    return { success: true, message: "Approval data added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add approval data error: " + error.toString(),
    };
  }
}

function getApprovalData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.APPROVAL_DATA,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      submissionDate: row[1],
      managerName: row[2],
      cashHandover: row[3],
      bankAmount: row[4],
      totalCashReceipts: row[5],
      totalCashPayments: row[6],
      totalBankReceipts: row[7],
      totalBankPayments: row[8],
      cashBalance: row[9],
      bankBalance: row[10],
      remarks: row[11],
      status: row[12],
      submittedBy: row[13],
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get approval data error: " + error.toString(),
    };
  }
}
