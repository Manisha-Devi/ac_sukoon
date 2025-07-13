
// ============================================================================
// API KEY MANAGEMENT SYSTEM (Key.gs)
// ============================================================================
// Secure API key validation for frontend-backend communication
// ============================================================================

// Store API keys securely - In production, use PropertiesService for better security
const API_KEYS = {
  // Main application API key
  'adsfsyieryieradafas123ew45': {
    name: 'AC Sukoon Transport App',
    permissions: ['read', 'write', 'delete'],
    created: '2025-01-13',
    active: true
  },
  
  // Backup API key for emergency access
  'backup-key-emergency-2025': {
    name: 'Emergency Backup Key',
    permissions: ['read', 'write'],
    created: '2025-01-13',
    active: true
  }
};

/**
 * Validate API key and return permissions
 * @param {string} apiKey - The API key to validate
 * @returns {Object} - Validation result with permissions
 */
function validateAPIKey(apiKey) {
  try {
    console.log('🔐 Validating API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'No key provided');
    
    // Check if API key exists and is active
    if (!apiKey || !API_KEYS[apiKey]) {
      console.log('❌ Invalid API key provided');
      return {
        valid: false,
        error: 'Invalid API key',
        permissions: []
      };
    }
    
    const keyInfo = API_KEYS[apiKey];
    
    // Check if key is active
    if (!keyInfo.active) {
      console.log('❌ API key is inactive');
      return {
        valid: false,
        error: 'API key is inactive',
        permissions: []
      };
    }
    
    console.log('✅ API key validated successfully for:', keyInfo.name);
    
    return {
      valid: true,
      keyName: keyInfo.name,
      permissions: keyInfo.permissions,
      created: keyInfo.created
    };
    
  } catch (error) {
    console.error('❌ Error validating API key:', error);
    return {
      valid: false,
      error: 'API key validation error',
      permissions: []
    };
  }
}

/**
 * Check if API key has specific permission
 * @param {string} apiKey - The API key to check
 * @param {string} permission - The permission to check ('read', 'write', 'delete')
 * @returns {boolean} - Whether the key has the permission
 */
function hasPermission(apiKey, permission) {
  const validation = validateAPIKey(apiKey);
  return validation.valid && validation.permissions.includes(permission);
}

/**
 * Get all active API keys (for admin purposes)
 * @returns {Array} - List of active API keys with info
 */
function getActiveAPIKeys() {
  const activeKeys = [];
  
  for (const [key, info] of Object.entries(API_KEYS)) {
    if (info.active) {
      activeKeys.push({
        keyPreview: `${key.substring(0, 10)}...`,
        name: info.name,
        permissions: info.permissions,
        created: info.created
      });
    }
  }
  
  return activeKeys;
}

/**
 * Generate a new API key (for admin use)
 * @param {string} name - Name for the new API key
 * @param {Array} permissions - Array of permissions for the key
 * @returns {string} - The generated API key
 */
function generateNewAPIKey(name, permissions = ['read']) {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const newKey = `acsukoon-${timestamp}-${randomStr}`;
  
  API_KEYS[newKey] = {
    name: name,
    permissions: permissions,
    created: formatISTTimestamp(),
    active: true
  };
  
  console.log('🔑 New API key generated:', newKey);
  return newKey;
}

/**
 * Deactivate an API key
 * @param {string} apiKey - The API key to deactivate
 * @returns {boolean} - Success status
 */
function deactivateAPIKey(apiKey) {
  if (API_KEYS[apiKey]) {
    API_KEYS[apiKey].active = false;
    console.log('🔒 API key deactivated:', apiKey);
    return true;
  }
  return false;
}
