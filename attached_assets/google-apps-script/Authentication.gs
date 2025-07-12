
// ============================================================================
// AUTHENTICATION FUNCTIONS (Authentication.gs)
// ============================================================================
// User login and authentication related functions
// ============================================================================

/**
 * Handle user login authentication
 * Validates credentials against Users sheet and updates last login timestamp
 */
function handleLogin(data) {
  try {
    console.log("🔐 Processing login attempt for user:", data.username);
    
    // Get Users sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.USERS);
    
    if (!sheet) {
      throw new Error("Users sheet not found. Please check sheet configuration.");
    }

    // Get all user data
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data
    if (values.length <= 1) {
      console.log("❌ No users found in Users sheet");
      return {
        success: false,
        error: "No users configured in the system"
      };
    }

    // Validate credentials
    for (let i = 1; i < values.length; i++) {
      const sheetUsername = String(values[i][0]).trim();
      const sheetPassword = String(values[i][1]).trim();
      const inputUsername = String(data.username).trim();
      const inputPassword = String(data.password).trim();

      // Check if credentials match
      if (sheetUsername === inputUsername && sheetPassword === inputPassword) {
        console.log("✅ Login successful for user:", inputUsername);
        
        // Update last login timestamp
        const istTimestamp = data.timestamp || formatISTTimestamp();
        sheet.getRange(i + 1, 7).setValue(istTimestamp);

        // Generate API key for session
        const apiKeyResult = generateApiKey(values[i][0]);
        
        // Return user data with API key
        return {
          success: true,
          message: "Login successful",
          user: {
            username: values[i][0],
            userType: values[i][2],
            fullName: values[i][3],
            status: values[i][4],
            fixedCash: values[i][7] || 0,
            lastLogin: istTimestamp
          },
          apiKey: apiKeyResult.success ? apiKeyResult.apiKey : null,
          sessionExpiry: apiKeyResult.success ? apiKeyResult.expiryTime : null,
          timestamp: istTimestamp
        };
      }
    }

    console.log("❌ Invalid credentials for user:", data.username);
    return {
      success: false,
      error: "Invalid username or password"
    };

  } catch (error) {
    console.error("❌ Login error:", error);
    return { 
      success: false, 
      error: "Login error: " + error.toString() 
    };
  }
}

/**
 * Generate API key for authenticated user
 */
function generateApiKey(username) {
  try {
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const apiKey = `ak_${username}_${timestamp}_${randomStr}`;
    
    // Store API key with expiry (24 hours)
    const expiryTime = timestamp + (24 * 60 * 60 * 1000); // 24 hours
    
    PropertiesService.getScriptProperties().setProperty(
      `apikey_${username}`, 
      JSON.stringify({
        key: apiKey,
        expiry: expiryTime,
        created: timestamp
      })
    );
    
    console.log("🔑 API Key generated for user:", username);
    return {
      success: true,
      apiKey: apiKey,
      expiryTime: expiryTime
    };
    
  } catch (error) {
    console.error("❌ API Key generation error:", error);
    return {
      success: false,
      error: "Failed to generate API key: " + error.toString()
    };
  }
}

/**
 * Validate API key for requests
 */
function validateApiKey(apiKey, username) {
  try {
    if (!apiKey || !username) {
      return { success: false, error: "API key and username required" };
    }
    
    const storedData = PropertiesService.getScriptProperties().getProperty(`apikey_${username}`);
    
    if (!storedData) {
      return { success: false, error: "Invalid session. Please login again." };
    }
    
    const keyData = JSON.parse(storedData);
    const currentTime = new Date().getTime();
    
    // Check if key matches and hasn't expired
    if (keyData.key === apiKey && currentTime < keyData.expiry) {
      return { success: true };
    } else if (currentTime >= keyData.expiry) {
      // Remove expired key
      PropertiesService.getScriptProperties().deleteProperty(`apikey_${username}`);
      return { success: false, error: "Session expired. Please login again." };
    } else {
      return { success: false, error: "Invalid API key" };
    }
    
  } catch (error) {
    console.error("❌ API Key validation error:", error);
    return { success: false, error: "Key validation failed" };
  }
}
