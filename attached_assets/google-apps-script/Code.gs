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
 * Handle OPTIONS requests for CORS (Cross-Origin Resource Sharing)
 */
function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

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
    let result;

    console.log(`📥 Incoming POST request - Action: ${action}`);

    // Route request to appropriate handler based on action
    switch (action) {
      // ==================== AUTHENTICATION ====================
      case "login":
        result = handleLogin(data);
        break;
      case "test":
        result = testConnection();
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

      // ==================== APPROVAL WORKFLOW OPERATIONS ====================
      // Fare Receipts Approval
      case 'approveFareReceipt':
        result = approveFareReceipt(data);
        break;
      case 'resendFareReceipt':
        result = resendFareReceipt(data);
        break;
      case 'setFareReceiptWaiting':
        result = setFareReceiptWaiting(data);
        break;

      // Fuel Payments Approval
      case 'approveFuelPayment':
        result = approveFuelPayment(data);
        break;
      case 'resendFuelPayment':
        result = resendFuelPayment(data);
        break;
      case 'setFuelPaymentWaiting':
        result = setFuelPaymentWaiting(data);
        break;

      // Other Payments Approval
      case 'approveOtherPayment':
        result = approveOtherPayment(data);
        break;
      case 'resendOtherPayment':
        result = resendOtherPayment(data);
        break;
      case 'setOtherPaymentWaiting':
        result = setOtherPaymentWaiting(data);
        break;

      // Adda Payments Approval
      case 'approveAddaPayment':
        result = approveAddaPayment(data);
        break;
      case 'resendAddaPayment':
        result = resendAddaPayment(data);
        break;
      case 'setAddaPaymentWaiting':
        result = setAddaPaymentWaiting(data);
        break;

      // Service Payments Approval
      case 'approveServicePayment':
        result = approveServicePayment(data);
        break;
      case 'resendServicePayment':
        result = resendServicePayment(data);
        break;
      case 'setServicePaymentWaiting':
        result = setServicePaymentWaiting(data);
        break;

      // Union Payments Approval
      case 'approveUnionPayment':
        result = approveUnionPayment(data);
        break;
      case 'resendUnionPayment':
        result = resendUnionPayment(data);
        break;
      case 'setUnionPaymentWaiting':
        result = setUnionPaymentWaiting(data);
        break;

      // ==================== LEGACY SUPPORT ====================
      case "updateFareEntry":
        result = updateFareEntryLegacy(data);
        break;
      case "deleteFareEntry":
        result = deleteFareEntryLegacy(data);
        break;

      // ==================== TESTING OPERATIONS ====================
      case "test":
        result = testConnection();
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
    let result;

    console.log(`📥 Incoming GET request - Action: ${action}`);

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