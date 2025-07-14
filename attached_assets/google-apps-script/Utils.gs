// ============================================================================
// UTILITY FUNCTIONS (Utils.gs)
// ============================================================================
// Common utility functions used across all modules
// ============================================================================

/**
 * Format current IST timestamp - Returns: "YYYY-MM-DD HH:MM:SS AM/PM"
 * Example: "2025-07-14 05:20:02 PM"
 */
function formatISTTimestamp() {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');

  let hours = istTime.getHours();
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const displayHours = String(hours).padStart(2, '0');

  return `${year}-${month}-${day} ${displayHours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Format date for display - Returns: "YYYY-MM-DD"
 * Example: "2025-07-14"
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
      const now = new Date();
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    if (isNaN(date.getTime())) {
      const now = new Date();
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Convert to IST and return YYYY-MM-DD format
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    const now = new Date();
    return now.toISOString().split('T')[0];
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

/**
 * Format current IST timestamp - Returns: "YYYY-MM-DD HH:MM:SS AM/PM"
 * Example: "2025-07-14 05:20:02 PM"
 */
function formatISTTimestamp() {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');

  let hours = istTime.getHours();
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const displayHours = String(hours).padStart(2, '0');

  return `${year}-${month}-${day} ${displayHours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Format timestamp for display - Returns: "YYYY-MM-DD HH:MM:SS AM/PM"
 * Example: "2025-07-14 05:20:02 PM"
 */
function formatTimestampForDisplay(timestamp) {
  try {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;

    // Convert to IST
    const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));

    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const day = String(istTime.getDate()).padStart(2, '0');

    let hours = istTime.getHours();
    const minutes = String(istTime.getMinutes()).padStart(2, '0');
    const seconds = String(istTime.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const displayHours = String(hours).padStart(2, '0');

    return `${year}-${month}-${day} ${displayHours}:${minutes}:${seconds} ${ampm}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
}

/**
 * Format current IST timestamp - Returns: "YYYY-MM-DD HH:MM:SS AM/PM"
 * Example: "2025-07-14 05:20:02 PM"
 */
function formatISTTimestamp() {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');

  let hours = istTime.getHours();
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const displayHours = String(hours).padStart(2, '0');

  return `${year}-${month}-${day} ${displayHours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Format time for display - Returns: "YYYY-MM-DD HH:MM:SS AM/PM"
 * Example: "2025-07-14 05:20:02 PM"
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

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');

  let hours = istTime.getHours();
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const displayHours = String(hours).padStart(2, '0');

  return `${year}-${month}-${day} ${displayHours}:${minutes}:${seconds} ${ampm}`;
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