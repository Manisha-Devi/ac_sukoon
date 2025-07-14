// ============================================================================
// UTILITY FUNCTIONS & CONFIGURATION (Utils.gs)
// ============================================================================
// Common utility functions and configuration management
// ============================================================================

// Sheet names configuration
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
 * Test Google Apps Script connection
 */
function testConnection(data) {
  try {
    console.log('🔍 Testing connection...');

    return {
      success: true,
      message: "Google Apps Script is working!",
      timestamp: new Date().toISOString(),
      version: "2.0.0"
    };
  } catch (error) {
    console.error('❌ Test connection error:', error);

    return {
      success: false,
      error: "Connection test failed: " + error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test API key connection with authentication
 */
function testAPIKeyConnection(data) {
  try {
    console.log('🔐 Testing API key connection...');

    // If data has API key, validate it
    if (data && data.apiKey) {
      const keyValidation = validateAPIKey(data.apiKey);
      if (!keyValidation.valid) {
        console.log('❌ Invalid API key for test connection');
        return {
          success: false,
          error: "Invalid API key"
        };
      }
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