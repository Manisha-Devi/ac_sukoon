
// ============================================================================
// API KEYS AUTHENTICATION SYSTEM (Keys.gs)
// ============================================================================
// Secure API key validation for all incoming requests
// ============================================================================

/**
 * Valid API Keys Configuration
 * Add your API keys here manually for authentication
 */
const VALID_API_KEYS = [
  "AC_SUKOON_2025_DRIVER_KEY_001",
  "AC_SUKOON_2025_ADMIN_KEY_002", 
  "AC_SUKOON_2025_MANAGER_KEY_003",
  // Add more keys as needed
];

/**
 * Validate API Key
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateApiKey(apiKey) {
  try {
    console.log("🔐 Validating API key...");
    
    if (!apiKey) {
      console.log("❌ No API key provided");
      return false;
    }

    // Check if the provided key exists in our valid keys list
    const isValid = VALID_API_KEYS.includes(apiKey.trim());
    
    if (isValid) {
      console.log("✅ API key validation successful");
      return true;
    } else {
      console.log("❌ Invalid API key provided");
      return false;
    }
    
  } catch (error) {
    console.error("❌ API key validation error:", error);
    return false;
  }
}

/**
 * Get API Key Information
 * @param {string} apiKey - The API key to get info for
 * @returns {Object} API key information or null
 */
function getApiKeyInfo(apiKey) {
  try {
    if (!validateApiKey(apiKey)) {
      return null;
    }

    // Return basic info about the API key (without exposing the actual key)
    const keyIndex = VALID_API_KEYS.indexOf(apiKey.trim());
    
    return {
      keyIndex: keyIndex,
      keyType: getKeyType(apiKey),
      isValid: true,
      lastUsed: formatISTTimestamp()
    };
    
  } catch (error) {
    console.error("❌ Error getting API key info:", error);
    return null;
  }
}

/**
 * Determine key type based on key name
 * @param {string} apiKey - The API key
 * @returns {string} Key type
 */
function getKeyType(apiKey) {
  if (apiKey.includes("DRIVER")) return "driver";
  if (apiKey.includes("ADMIN")) return "admin";
  if (apiKey.includes("MANAGER")) return "manager";
  return "unknown";
}

/**
 * Check if API key has specific permissions
 * @param {string} apiKey - The API key
 * @param {string} operation - The operation to check
 * @returns {boolean} True if permitted
 */
function checkApiKeyPermissions(apiKey, operation) {
  try {
    const keyInfo = getApiKeyInfo(apiKey);
    if (!keyInfo) return false;

    const keyType = keyInfo.keyType;

    // Define permissions based on key type
    const permissions = {
      "driver": ["addFareReceipt", "addBookingEntry", "addOffDay", "addFuelPayment", 
                "addAddaPayment", "addUnionPayment", "addServicePayment", "addOtherPayment",
                "getFareReceipts", "getBookingEntries", "getOffDays", "getFuelPayments",
                "getAddaPayments", "getUnionPayments", "getServicePayments", "getOtherPayments",
                "updateFareReceipt", "updateBookingEntry", "updateOffDay", "updateFuelPayment",
                "updateAddaPayment", "updateUnionPayment", "updateServicePayment", "updateOtherPayment",
                "deleteFareReceipt", "deleteBookingEntry", "deleteOffDay", "deleteFuelPayment",
                "deleteAddaPayment", "deleteUnionPayment", "deleteServicePayment", "deleteOtherPayment"],
      "admin": ["*"], // Admin has all permissions
      "manager": ["*"] // Manager has all permissions
    };

    // Check if operation is allowed for this key type
    const allowedOps = permissions[keyType] || [];
    return allowedOps.includes("*") || allowedOps.includes(operation);
    
  } catch (error) {
    console.error("❌ Error checking API key permissions:", error);
    return false;
  }
}

/**
 * Log API key usage for monitoring
 * @param {string} apiKey - The API key used
 * @param {string} operation - The operation performed
 * @param {boolean} success - Whether operation was successful
 */
function logApiKeyUsage(apiKey, operation, success) {
  try {
    const keyInfo = getApiKeyInfo(apiKey);
    if (!keyInfo) return;

    console.log(`🔑 API Key Usage - Type: ${keyInfo.keyType}, Operation: ${operation}, Success: ${success}, Time: ${formatISTTimestamp()}`);
    
    // You can extend this to write to a separate logging sheet if needed
    
  } catch (error) {
    console.error("❌ Error logging API key usage:", error);
  }
}

/**
 * Create standardized authentication error response
 * @param {string} message - Error message
 * @returns {Object} Error response
 */
function createAuthErrorResponse(message = "Authentication failed") {
  return {
    success: false,
    error: message,
    code: "AUTH_ERROR",
    timestamp: formatISTTimestamp()
  };
}

/**
 * Authenticate incoming request
 * Main function to be called at the start of every API endpoint
 * @param {Object} requestData - The incoming request data
 * @returns {Object} Authentication result
 */
function authenticateRequest(requestData) {
  try {
    console.log("🔐 Authenticating incoming request...");
    
    // Extract API key from request
    const apiKey = requestData.apiKey || requestData.api_key;
    
    if (!apiKey) {
      console.log("❌ No API key provided in request");
      return {
        success: false,
        error: "API key is required for all operations",
        code: "MISSING_API_KEY"
      };
    }

    // Validate API key
    if (!validateApiKey(apiKey)) {
      console.log("❌ Invalid API key provided");
      return {
        success: false,
        error: "Invalid API key provided",
        code: "INVALID_API_KEY"
      };
    }

    // Check permissions for the requested action
    const action = requestData.action;
    if (action && !checkApiKeyPermissions(apiKey, action)) {
      console.log(`❌ API key does not have permission for action: ${action}`);
      return {
        success: false,
        error: `API key does not have permission for action: ${action}`,
        code: "INSUFFICIENT_PERMISSIONS"
      };
    }

    // Log successful authentication
    logApiKeyUsage(apiKey, action, true);
    
    console.log("✅ Request authentication successful");
    return {
      success: true,
      keyInfo: getApiKeyInfo(apiKey),
      message: "Authentication successful"
    };
    
  } catch (error) {
    console.error("❌ Authentication error:", error);
    return {
      success: false,
      error: "Authentication system error",
      code: "AUTH_SYSTEM_ERROR"
    };
  }
}
