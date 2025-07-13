// Environment-based API key configuration
const API_CONFIG = {
  // Use environment variable or fallback to hardcoded value
  API_KEY: import.meta.env.VITE_API_KEY || "adsfsyieryieradafas123ew45",
  API_URL: import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec",
  APP_NAME: import.meta.env.VITE_APP_NAME || "AC SUKOON Transport",
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true' || false
};

// Export API key
export const API_KEY = API_CONFIG.API_KEY;
export const API_URL = API_CONFIG.API_URL;
export const APP_NAME = API_CONFIG.APP_NAME;
export const DEBUG_MODE = API_CONFIG.DEBUG_MODE;

// Debug logging (only in development)
if (DEBUG_MODE) {
  console.log('🔑 API Configuration loaded:', {
    API_URL: API_CONFIG.API_URL,
    HAS_API_KEY: !!API_CONFIG.API_KEY,
    APP_NAME: API_CONFIG.APP_NAME,
    DEBUG_MODE: API_CONFIG.DEBUG_MODE
  });
}

export default API_CONFIG;