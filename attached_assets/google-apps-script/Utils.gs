// ============================================================================
// UTILITY FUNCTIONS (Utils.gs)
// ============================================================================
// Common utility functions used across all modules
// ============================================================================

/**
 * Return timestamp as-is without formatting
 */
function formatISTTimestamp() {
  // Return current timestamp as-is without any formatting
  return new Date().toISOString();
}

/**
 * Return date as-is without formatting
 */
function formatDateForDisplay(dateValue) {
  // Return date value exactly as received without any formatting
  return dateValue;
}

/**
 * Test the connection to Google Apps Script
 */
function testConnection(data) {
  try {
    console.log("🔍 Testing connection to Google Apps Script...");

    // Validate API key first
    const keyValidation = validateAPIKey(data.apiKey);
    if (!keyValidation.valid) {
      console.log("❌ Invalid API key for test connection");
      return {
        success: false,
        error: "Invalid API key"
      };
    }

    return {
      success: true,
      message: "Google Apps Script is working!",
      timestamp: new Date().toISOString(),
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
 * Return timestamp as-is without formatting
 */
function formatTimestampForDisplay(timestamp) {
  // Return timestamp exactly as received without any formatting
  return timestamp;
}

/**
 * Format IST Timestamp - Returns current IST timestamp
 */
function formatISTTimestamp() {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST
  return Utilities.formatDate(istTime, 'Asia/Kolkata', 'dd-MM-yyyy HH:mm:ss');
}

/**
 * Format time for display - Returns formatted time string
 */
function formatTimeForDisplay(date) {
  if (!date) {
    return formatISTTimestamp();
  }

  if (typeof date === 'string') {
    date = new Date(date);
  }

  // Convert to IST
  const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  return Utilities.formatDate(istTime, 'Asia/Kolkata', 'dd-MM-yyyy HH:mm:ss');
}

// Properties are handled directly in Code.gs and LegacyFunctions.gs
// No separate setup functions needed since fallback mechanism is already implemented

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
  OTHER_PAYMENTS: "OtherPayments",
  CASH_DEPOSITS: "CashDeposits"
};

/**
 * Validate API key for authentication
 */
function validateAPIKey(providedKey) {
  try {
    console.log("🔐 Validating API key...", {
      hasProvidedKey: !!providedKey,
      providedKeyType: typeof providedKey,
      providedKeyPreview: providedKey ? `${providedKey.substring(0, 10)}...` : 'none',
      expectedKeyPreview: API_KEY ? `${API_KEY.substring(0, 10)}...` : 'none'
    });

    if (!providedKey || typeof providedKey !== 'string') {
      console.log("❌ API key validation failed: No key provided or invalid type");
      return { valid: false, error: "API key is required" };
    }

    if (providedKey !== API_KEY) {
      console.log("❌ API key validation failed: Key mismatch");
      return { valid: false, error: "Invalid API key" };
    }

    console.log("✅ API key validation successful");
    return { valid: true };
  } catch (error) {
    console.error("❌ API key validation error:", error);
    return { valid: false, error: "API key validation failed" };
  }
}

/**
 * Test function for API key validation - handles both test and regular actions
 */
function testAPIKeyConnection(data) {
  try {
    console.log('🔍 Testing API key connection...');

    // Validate API key first
    const keyValidation = validateAPIKey(data.apiKey);
    if (!keyValidation.valid) {
      console.log("❌ Invalid API key for test connection");
      return {
        success: false,
        error: "Authentication failed: " + keyValidation.error
      };
    }

    return {
      success: true,
      message: "API key authentication successful",
      timestamp: formatISTTimestamp(),
      version: "2.0.0"
    };
  } catch (error) {
    console.error('❌ Test API key connection error:', error);

    return {
      success: false,
      error: "API key test failed: " + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}