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

    // Validate API key first
    const keyValidation = validateAPIKey(data.apiKey);
    if (!keyValidation.valid) {
      console.log("❌ Invalid API key for login attempt");
      return {
        success: false,
        error: "Invalid API key"
      };
    }

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
            fixedCash: values[i][7] || 0,
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

/**
 * Get all users from Users sheet
 */
function getAllUsers(data) {
  try {
    console.log('👥 Fetching all users...');

    // Validate API key first
    const keyValidation = validateAPIKey(data.apiKey);
    if (!keyValidation.valid) {
      console.log("❌ Invalid API key for getAllUsers");
      return {
        success: false,
        error: "Invalid API key"
      };
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');

    if (!sheet) {
      throw new Error('Users sheet not found');
    }

    const values = sheet.getDataRange().getValues();

    if (!values || values.length <= 1) {
      console.log('⚠️ No users found in Users sheet');
      return {
        success: true,
        data: [],
        count: 0,
        timestamp: formatISTTimestamp()
      };
    }

    const headers = values[0];
    const usersData = [];

    // Find exact column indices based on actual headers
    // Headers: Username, Password, UserType, FullName, Status, CreatedDate, LastLogin, FixedCash
    const usernameIndex = 0;      // Username column
    const fullNameIndex = 3;      // FullName column  
    const createdDateIndex = 5;   // CreatedDate column
    const fixedCashIndex = 7;     // FixedCash column

    console.log('📋 Using fixed column indices:', { usernameIndex, fullNameIndex, createdDateIndex, fixedCashIndex });

    // Process each user row (skip header)
    for (let i = 1; i < values.length; i++) {
      const row = values[i];

      if (row[usernameIndex] && row[usernameIndex].toString().trim()) { // Only include rows with username
        const user = {
          username: row[usernameIndex].toString().trim(),
          name: row[fullNameIndex] ? row[fullNameIndex].toString().trim() : '',
          date: row[createdDateIndex] ? 
                formatDateForDisplay(row[createdDateIndex]) : 
                new Date().toLocaleDateString('en-IN'),
          fixedCash: row[fixedCashIndex] ? (parseFloat(row[fixedCashIndex]) || 0) : 0
        };

        usersData.push(user);
        console.log('👤 User processed:', user);
      }
    }

    console.log(`✅ Found ${usersData.length} users in Google Sheets`);

    return {
      success: true,
      data: usersData,
      count: usersData.length,
      timestamp: formatISTTimestamp()
    };

  } catch (error) {
    console.error('❌ Error fetching all users:', error);

    return {
      success: false,
      error: "Failed to fetch users: " + error.toString(),
      timestamp: formatISTTimestamp(),
      data: [],
      count: 0
    };
  }
}

/**
 * Test connection to Google Sheets
 */
function testConnection(data) {
  try {
    console.log('🔍 Testing connection...');

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
      timestamp: formatISTTimestamp(),
      version: "2.0.0"
    };
  } catch (error) {
    console.error('❌ Test connection error:', error);

    return {
      success: false,
      error: "Connection test failed: " + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}