
// ============================================================================
// API KEY SERVICE (key.js)
// ============================================================================
// Frontend API key management for secure backend communication
// ============================================================================

class APIKeyService {
  constructor() {
    // Store API key securely - In production, use environment variables
    this.API_KEY = 'adsfsyieryieradafas123ew45';
    this.BACKUP_KEY = 'backup-key-emergency-2025';
  }

  /**
   * Get the current API key
   * @returns {string} - The API key
   */
  getAPIKey() {
    return this.API_KEY;
  }

  /**
   * Get backup API key (for emergency situations)
   * @returns {string} - The backup API key
   */
  getBackupAPIKey() {
    return this.BACKUP_KEY;
  }

  /**
   * Validate API key format (frontend validation)
   * @param {string} key - The API key to validate
   * @returns {boolean} - Whether the key format is valid
   */
  validateKeyFormat(key) {
    if (!key || typeof key !== 'string') return false;
    
    // Check minimum length
    if (key.length < 10) return false;
    
    // Check for valid characters (alphanumeric, hyphens)
    const validPattern = /^[a-zA-Z0-9-]+$/;
    return validPattern.test(key);
  }

  /**
   * Add API key to request payload
   * @param {Object} requestData - The request data object
   * @returns {Object} - Request data with API key added
   */
  addAPIKey(requestData) {
    if (!requestData || typeof requestData !== 'object') {
      throw new Error('Invalid request data provided');
    }

    const apiKey = this.getAPIKey();
    
    if (!this.validateKeyFormat(apiKey)) {
      throw new Error('Invalid API key format');
    }

    return {
      ...requestData,
      apiKey: apiKey
    };
  }

  /**
   * Add API key to GET request URL
   * @param {string} baseUrl - The base URL
   * @param {Object} params - URL parameters
   * @returns {string} - Complete URL with API key
   */
  addAPIKeyToURL(baseUrl, params = {}) {
    const apiKey = this.getAPIKey();
    
    if (!this.validateKeyFormat(apiKey)) {
      throw new Error('Invalid API key format');
    }

    const urlParams = new URLSearchParams({
      ...params,
      apiKey: apiKey
    });

    return `${baseUrl}?${urlParams.toString()}`;
  }

  /**
   * Handle API key authentication errors
   * @param {Object} response - API response
   * @returns {Object} - Processed response
   */
  handleAuthError(response) {
    if (!response.success && response.error && response.error.includes('Authentication failed')) {
      console.error('🔐 API Key Authentication Error:', response.error);
      
      // You could implement retry logic with backup key here
      return {
        ...response,
        isAuthError: true,
        suggestion: 'Please check your API key configuration'
      };
    }
    
    return response;
  }

  /**
   * Test API key validity with backend
   * @returns {Promise<boolean>} - Whether the API key is valid
   */
  async testAPIKey() {
    try {
      console.log('🔍 Testing API key validity...');
      
      const testData = this.addAPIKey({
        action: 'test'
      });

      const response = await fetch('https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ API key is valid and working');
        return true;
      } else {
        console.error('❌ API key test failed:', result.error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error testing API key:', error);
      return false;
    }
  }

  /**
   * Get API key information (for debugging)
   * @returns {Object} - API key information
   */
  getKeyInfo() {
    return {
      keyPreview: `${this.API_KEY.substring(0, 10)}...`,
      keyLength: this.API_KEY.length,
      hasBackupKey: !!this.BACKUP_KEY,
      isValidFormat: this.validateKeyFormat(this.API_KEY)
    };
  }
}

// Export singleton instance
export default new APIKeyService();
