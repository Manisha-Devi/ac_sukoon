
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

        // Return user data
        return {
          success: true,
          message: "Login successful",
          user: {
            username: values[i][0],
            userType: values[i][2],
            fullName: values[i][3],
            status: values[i][4],
            lastLogin: istTimestamp
          },
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
