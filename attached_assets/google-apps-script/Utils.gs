// ============================================================================
// UTILITY FUNCTIONS (Utils.gs)
// ============================================================================
// Simplified utility functions - no date formatting
// ============================================================================

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

// Sheet names configuration - centralized configuration
const SHEET_NAMES = {
  USERS: "Users",
  FARE_RECEIPTS: "FareReceipts",
  BOOKING_ENTRIES: "BookingEntries", 
  OFF_DAYS: "OffDays",
  ADDA_PAYMENTS: "AddaPayments",
  FUEL_PAYMENTS: "UnionPayments",
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
 * Test function for API key validation
 */
function testAPIKeyConnection(data) {
  try {
    console.log('🔍 Testing API key connection...');

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
      timestamp: new Date().toISOString(),
      version: "2.0.0"
    };
  } catch (error) {
    console.error('❌ Test API key connection error:', error);

    return {
      success: false,
      error: "API key test failed: " + error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}