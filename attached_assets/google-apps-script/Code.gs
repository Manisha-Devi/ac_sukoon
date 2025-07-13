// ============================================================================
// AC SUKOON TRANSPORT MANAGEMENT - MAIN FILE (Code.gs)
// ============================================================================
// This is the main entry point for all API requests
// All other functions are imported from separate files
// ============================================================================

// Get Spreadsheet ID from Script Properties (more secure approach)
// To set: Go to Project Settings > Script Properties > Add Property
// Key: SHEET_ID, Value: Your actual spreadsheet ID
let spreadsheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
const SPREADSHEET_ID = spreadsheetId || "1bM61ei_kP2QdBQQyRN_d00aOAu0qcWACleOidEmhzgM"; // Fallback

// ============================================================================
// MAIN REQUEST HANDLERS
// ============================================================================

/**
 * Main POST request handler - Routes to appropriate functions
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received in POST request");
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const apiKey = data.apiKey;

    console.log(`📥 Incoming POST request - Action: ${action}`);

    // Validate API key for all requests except test
    if (action !== 'test') {
      const keyValidation = validateAPIKey(apiKey);
      if (!keyValidation.valid) {
        console.log('❌ API key validation failed:', keyValidation.error);
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: `Authentication failed: ${keyValidation.error}`,
          timestamp: formatISTTimestamp()
        })).setMimeType(ContentService.MimeType.JSON);
      }

      console.log('✅ API key validated for:', keyValidation.keyName);
    }

    let result;

    // Route request to appropriate handler based on action
    switch (action) {
      // ==================== AUTHENTICATION ====================
      case "login":
        result = handleLogin(data);
        break;
      case "getAllUsers":
        result = getAllUsers();
        break;
      case "test":
        result = testConnection({});
        break;

      // ==================== FARE RECEIPTS ====================
      case "addFareReceipt":
        result = addFareReceipt(data);
        break;
      case "getFareReceipts":
        result = getFareReceipts();
        break;
      case "updateFareReceipt":
        result = updateFareReceipt(data);
        break;
      case "deleteFareReceipt":
        result = deleteFareReceipt(data);
        break;
      case "updateFareReceiptStatus":
        result = updateFareReceiptStatus(data);
        break;

      // ==================== BOOKING ENTRIES ====================
      case "addBookingEntry":
        result = addBookingEntry(data);
        break;
      case "getBookingEntries":
        result = getBookingEntries();
        break;
      case "updateBookingEntry":
        result = updateBookingEntry(data);
        break;
      case "deleteBookingEntry":
        result = deleteBookingEntry(data);
        break;
      case "updateBookingEntryStatus":
        result = updateBookingEntryStatus(data);
        break;

      // ==================== OFF DAYS ====================
      case "addOffDay":
        result = addOffDay(data);
        break;
      case "getOffDays":
        result = getOffDays();
        break;
      case "updateOffDay":
        result = updateOffDay(data);
        break;
      case "deleteOffDay":
        result = deleteOffDay(data);
        break;
      case "updateOffDayStatus":
        result = updateOffDayStatus(data);
        break;
      case "approveOffDay":
        result = approveOffDay(data);
        break;

      // ==================== ADDA PAYMENTS ====================
      case "addAddaPayment":
        result = addAddaPayment(data);
        break;
      case "getAddaPayments":
        result = getAddaPayments();
        break;
      case "updateAddaPayment":
        result = updateAddaPayment(data);
        break;
      case "deleteAddaPayment":
        result = deleteAddaPayment(data);
        break;
      case "updateAddaPaymentStatus":
        result = updateAddaPaymentStatus(data);
        break;

      // ==================== FUEL PAYMENTS ====================
      case "addFuelPayment":
        result = addFuelPayment(data);
        break;
      case "getFuelPayments":
        result = getFuelPayments();
        break;
      case "updateFuelPayment":
        result = updateFuelPayment(data);
        break;
      case "deleteFuelPayment":
        result = deleteFuelPayment(data);
        break;
      case "updateFuelPaymentStatus":
        result = updateFuelPaymentStatus(data);
        break;

      // ==================== UNION PAYMENTS ====================
      case "addUnionPayment":
        result = addUnionPayment(data);
        break;
      case "getUnionPayments":
        result = getUnionPayments();
        break;
      case "updateUnionPayment":
        result = updateUnionPayment(data);
        break;
      case "deleteUnionPayment":
        result = deleteUnionPayment(data);
        break;
      case "updateUnionPaymentStatus":
        result = updateUnionPaymentStatus(data);
        break;

      // ==================== SERVICE PAYMENTS ====================
      case "addServicePayment":
        result = addServicePayment(data);
        break;
      case "getServicePayments":
        result = getServicePayments();
        break;
      case "updateServicePayment":
        result = updateServicePayment(data);
        break;
      case "deleteServicePayment":
        result = deleteServicePayment(data);
        break;
      case "updateServicePaymentStatus":
        result = updateServicePaymentStatus(data);
        break;

      // ==================== OTHER PAYMENTS ====================
      case "addOtherPayment":
        result = addOtherPayment(data);
        break;
      case "getOtherPayments":
        result = getOtherPayments();
        break;
      case "updateOtherPayment":
        result = updateOtherPayment(data);
        break;
      case "deleteOtherPayment":
        result = deleteOtherPayment(data);
        break;
      case "updateOtherPaymentStatus":
        result = updateOtherPaymentStatus(data);
        break;

      // ==================== CASH DEPOSITS ====================
      case "addCashDeposit":
        result = addCashDeposit(data);
        break;
      case "getCashDeposits":
        result = getCashDeposits();
        break;
      case "updateCashDeposit":
        result = updateCashDeposit(data);
        break;
      case "deleteCashDeposit":
        result = deleteCashDeposit(data);
        break;

      // ==================== APPROVAL WORKFLOW OPERATIONS ====================
      // Fare Receipts Approval
      case 'approveFareReceipt':
        result = approveFareReceipt(data);
        break;
      case 'resendFareReceipt':
        result = resendFareReceipt(data);
        break;

      // Fuel Payments Approval
      case 'approveFuelPayment':
        result = approveFuelPayment(data);
        break;
      case 'resendFuelPayment':
        result = resendFuelPayment(data);
        break;

      // Other Payments Approval
      case 'approveOtherPayment':
        result = approveOtherPayment(data);
        break;
      case 'resendOtherPayment':
        result = resendOtherPayment(data);
        break;

      // Adda Payments Approval
      case 'approveAddaPayment':
        result = approveAddaPayment(data);
        break;
      case 'resendAddaPayment':
        result = resendAddaPayment(data);
        break;

      // Service Payments Approval
      case 'approveServicePayment':
        result = approveServicePayment(data);
        break;
      case 'resendServicePayment':
        result = resendServicePayment(data);
        break;

      // Union Payments Approval
      case 'approveUnionPayment':
        result = approveUnionPayment(data);
        break;
      case 'resendUnionPayment':
        result = resendUnionPayment(data);
        break;

      // Booking Entries Approval
      case 'approveBookingEntry':
        result = approveBookingEntry(data);
        break;
      case 'resendBookingEntry':
        result = resendBookingEntry(data);
        break;

      // ==================== LEGACY SUPPORT ====================
      case "updateFareEntry":
        result = updateFareEntryLegacy(data);
        break;
      case "deleteFareEntry":
        result = deleteFareEntryLegacy(data);
        break;

      default:
        result = { 
          success: false, 
          error: `Invalid action: ${action}` 
        };
    }

    console.log(`✅ POST request completed - Action: ${action}, Success: ${result.success}`);

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(`❌ POST request error:`, error);

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Server Error: " + error.toString(),
      timestamp: formatISTTimestamp()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main GET request handler
 */
function doGet(e) {
  try {
    if (!e || !e.parameter || !e.parameter.action) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "No action parameter provided in GET request",
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const action = e.parameter.action;
    const apiKey = e.parameter.apiKey;

    console.log(`📥 Incoming GET request - Action: ${action}`);

    // Validate API key for all requests except test
    if (action !== 'test') {
      const keyValidation = validateAPIKey(apiKey);
      if (!keyValidation.valid) {
        console.log('❌ API key validation failed:', keyValidation.error);
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: `Authentication failed: ${keyValidation.error}`,
          timestamp: formatISTTimestamp()
        })).setMimeType(ContentService.MimeType.JSON);
      }

      console.log('✅ API key validated for:', keyValidation.keyName);
    }

    let result;

    switch (action) {
      case "test":
        result = testConnection({});
        break;
      case "getAllUsers":
        result = getAllUsers({ apiKey: apiKey });
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
      case "getCashDeposits":
        result = getCashDeposits();
        break;
      default:
        result = { 
          success: false, 
          error: `Invalid GET action: ${action}` 
        };
    }

    console.log(`✅ GET request completed - Action: ${action}, Success: ${result.success}`);

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(`❌ GET request error:`, error);

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "GET Error: " + error.toString(),
    })).setMimeType(ContentService.MimeType.JSON);
  }
}