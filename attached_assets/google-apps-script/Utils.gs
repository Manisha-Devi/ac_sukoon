
// ============================================================================
// UTILITY FUNCTIONS (Utils.gs)
// ============================================================================
// Common utility functions used across all modules
// ============================================================================

/**
 * Test the connection to Google Apps Script
 */
function testConnection() {
  try {
    console.log("🔍 Testing connection to Google Apps Script...");
    
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
 * Format current timestamp in IST (Indian Standard Time)
 */
function formatISTTimestamp() {
  const now = new Date();
  const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  return istDate.toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    hour12: true,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Generate unique entry ID based on current timestamp
 */
function generateEntryId() {
  return Date.now().toString();
}
