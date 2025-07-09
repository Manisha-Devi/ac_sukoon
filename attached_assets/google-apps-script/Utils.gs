// ============================================================================
// UTILITY FUNCTIONS (Utils.gs)
// ============================================================================
// Common utility functions used across all modules
// ============================================================================

/**
 * Test the connection to Google Apps Script
 */
function testConnection() {
  try {
    console.log("🔍 Testing connection to Google Apps Script...");

    return {
      success: true,
      message: "Google Apps Script is working!",
      timestamp: formatISTTimestamp(),
      version: "2.0.0"
    };
  } catch (error) {
    console.error("❌ Connection test failed:", error);

    return {
      success: false,
      error: "Test connection error: " + error.toString()
    };
  }
}

/**
 * Format current timestamp in IST (Indian Standard Time)
 * Returns format: DD-MM-YYYY HH:MM:SS
 */
function formatISTTimestamp() {
  const now = new Date();
  const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const year = istDate.getFullYear();
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const seconds = String(istDate.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Set up Script Properties (Run this once to configure your spreadsheet ID)
 * This function can be used to set the spreadsheet ID programmatically
 */
function setupScriptProperties() {
  const properties = PropertiesService.getScriptProperties();

  // Set your actual spreadsheet ID here
  const spreadsheetId = "1bM61ei_kP2QdBQQyRN_d00aOAu0qcWACleOidEmhzgM";

  properties.setProperty('SHEET_ID', spreadsheetId);

  console.log('✅ Script Properties configured successfully');
  console.log('📋 Spreadsheet ID:', spreadsheetId);

  return {
    success: true,
    message: 'Script Properties set up successfully',
    spreadsheetId: spreadsheetId
  };
}

/**
 * Get current Script Properties (For debugging)
 */
function getScriptProperties() {
  const properties = PropertiesService.getScriptProperties();
  const allProperties = properties.getProperties();

  console.log('📋 Current Script Properties:', allProperties);

  return {
    success: true,
    properties: allProperties
  };
}

/**
 * Generate unique entry ID based on current timestamp
 */
function generateEntryId() {
  return Date.now().toString();
}

// Sheet names configuration - centralized configuration
const SHEET_NAMES = {
  USERS: "Users",
  FARE_RECEIPTS: "FareReceipts",
  BOOKING_ENTRIES: "BookingEntries", 
  OFF_DAYS: "OffDays",
  ADDA_PAYMENTS: "AddaPayments",
  FUEL_PAYMENTS: "FuelPayments",
  UNION_PAYMENTS: "UnionPayments",
  SERVICE_PAYMENTS: "ServicePayments",
  OTHER_PAYMENTS: "OtherPayments"
};