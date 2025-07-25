// ============================================================================
// UTILITY FUNCTIONS (Utils.gs)
// ============================================================================
// Common utility functions used across all modules
// ============================================================================

/**
 * Format IST timestamp for consistent display
 */
function formatISTTimestamp() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);

  const day = String(istTime.getUTCDate()).padStart(2, '0');
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const year = istTime.getUTCFullYear();
  const hours = String(istTime.getUTCHours()).padStart(2, '0');
  const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format date for display in DD-MM-YYYY format
 */
function formatDateForDisplay(dateValue) {
  try {
    let date;

    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (typeof dateValue === 'number') {
      // Handle Excel serial date numbers
      date = new Date((dateValue - 25569) * 86400 * 1000);
    } else {
      return new Date().toLocaleDateString('en-IN');
    }

    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString('en-IN');
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toLocaleDateString('en-IN');
  }
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

// Duplicate function removed - using main formatISTTimestamp below

/**
 * Format timestamp for display - IST format
 */
function formatTimestampForDisplay(timestamp) {
  try {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;

    // Format as DD-MM-YYYY HH:MM:SS in IST
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
}

// Main formatISTTimestamp function - keeping this one

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

// API Key constant - defined here to avoid missing reference errors
const API_KEY = "adsfsyierya778ysafgkiuadgakjdgkjfgdkjf78";

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
  FOOD_PAYMENTS: "FoodPayments",
  TRANSPORT_PAYMENTS: "TransportPayments",
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