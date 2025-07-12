
// ============================================================================
// API KEYS SERVICE (keys.js)
// ============================================================================
// Frontend API key management and validation
// ============================================================================

class KeysService {
  constructor() {
    // Store API keys directly in frontend (secure for client-side use)
    this.API_KEYS = {
      driver: "AC_SUKOON_2025_DRIVER_KEY_001",
      admin: "AC_SUKOON_2025_ADMIN_KEY_002", 
      manager: "AC_SUKOON_2025_MANAGER_KEY_003"
    };
    
    // Current active API key
    this.currentApiKey = null;
    this.currentKeyType = null;
  }

  /**
   * Set API key based on user type
   * @param {string} userType - User type (driver, admin, manager)
   */
  setApiKeyForUser(userType) {
    try {
      console.log(`🔑 Setting API key for user type: ${userType}`);
      
      const apiKey = this.API_KEYS[userType.toLowerCase()];
      if (!apiKey) {
        console.error(`❌ No API key found for user type: ${userType}`);
        return false;
      }

      this.currentApiKey = apiKey;
      this.currentKeyType = userType.toLowerCase();
      
      console.log(`✅ API key set successfully for ${userType}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error setting API key:', error);
      return false;
    }
  }

  /**
   * Get current API key
   * @returns {string|null} Current API key
   */
  getCurrentApiKey() {
    if (!this.currentApiKey) {
      console.warn('⚠️ No API key set. User may not be authenticated.');
      return null;
    }
    return this.currentApiKey;
  }

  /**
   * Get current key type
   * @returns {string|null} Current key type
   */
  getCurrentKeyType() {
    return this.currentKeyType;
  }

  /**
   * Validate if current user has permission for operation
   * @param {string} operation - Operation to check
   * @returns {boolean} True if permitted
   */
  hasPermission(operation) {
    try {
      if (!this.currentKeyType) {
        console.log('❌ No key type set');
        return false;
      }

      // Define permissions based on key type
      const permissions = {
        "driver": [
          "addFareReceipt", "addBookingEntry", "addOffDay", "addFuelPayment", 
          "addAddaPayment", "addUnionPayment", "addServicePayment", "addOtherPayment",
          "getFareReceipts", "getBookingEntries", "getOffDays", "getFuelPayments",
          "getAddaPayments", "getUnionPayments", "getServicePayments", "getOtherPayments",
          "updateFareReceipt", "updateBookingEntry", "updateOffDay", "updateFuelPayment",
          "updateAddaPayment", "updateUnionPayment", "updateServicePayment", "updateOtherPayment",
          "deleteFareReceipt", "deleteBookingEntry", "deleteOffDay", "deleteFuelPayment",
          "deleteAddaPayment", "deleteUnionPayment", "deleteServicePayment", "deleteOtherPayment",
          "login", "test"
        ],
        "admin": ["*"], // Admin has all permissions
        "manager": ["*"] // Manager has all permissions
      };

      const allowedOps = permissions[this.currentKeyType] || [];
      const hasAccess = allowedOps.includes("*") || allowedOps.includes(operation);
      
      if (!hasAccess) {
        console.log(`❌ Permission denied for operation: ${operation} with key type: ${this.currentKeyType}`);
      }
      
      return hasAccess;
      
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Add API key to request data
   * @param {Object} requestData - Request data to modify
   * @returns {Object} Modified request data with API key
   */
  addApiKeyToRequest(requestData) {
    try {
      const apiKey = this.getCurrentApiKey();
      if (!apiKey) {
        throw new Error('No API key available. User authentication required.');
      }

      // Check permissions for the action
      if (requestData.action && !this.hasPermission(requestData.action)) {
        throw new Error(`Permission denied for action: ${requestData.action}`);
      }

      // Add API key to request
      return {
        ...requestData,
        apiKey: apiKey
      };
      
    } catch (error) {
      console.error('❌ Error adding API key to request:', error);
      throw error;
    }
  }

  /**
   * Clear current API key (for logout)
   */
  clearApiKey() {
    console.log('🔑 Clearing API key');
    this.currentApiKey = null;
    this.currentKeyType = null;
  }

  /**
   * Check if user is authenticated (has valid API key)
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return this.currentApiKey !== null && this.currentKeyType !== null;
  }

  /**
   * Get available API keys for debugging (without exposing actual keys)
   * @returns {Object} Available key types
   */
  getAvailableKeyTypes() {
    return Object.keys(this.API_KEYS);
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} True if format is valid
   */
  isValidKeyFormat(apiKey) {
    try {
      if (!apiKey || typeof apiKey !== 'string') {
        return false;
      }

      // Check if key matches expected pattern
      const keyPattern = /^AC_SUKOON_\d{4}_[A-Z]+_KEY_\d{3}$/;
      return keyPattern.test(apiKey);
      
    } catch (error) {
      console.error('❌ Error validating key format:', error);
      return false;
    }
  }

  /**
   * Initialize API key on login
   * @param {Object} user - User object from login response
   * @returns {boolean} True if initialization successful
   */
  initializeForUser(user) {
    try {
      console.log('🔑 Initializing API key for user:', user.username);
      
      if (!user || !user.userType) {
        console.error('❌ Invalid user object provided');
        return false;
      }

      const success = this.setApiKeyForUser(user.userType);
      if (success) {
        console.log(`✅ API key initialized successfully for ${user.userType}: ${user.username}`);
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Error initializing API key for user:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new KeysService();
