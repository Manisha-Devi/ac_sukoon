// Authentication service for Google Sheets database
class AuthService {
  constructor() {
    // Google Apps Script Web App URL - Updated to use the correct deployment URL
    this.API_URL = 'https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec';
  }

  // Authenticate user against Google Sheets database
  async authenticateUser(username, password, userType) {
    try {
      console.log('🔐 Authenticating user:', { username, userType });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        signal: controller.signal,
        redirect: 'follow',
        mode: 'cors',
        body: JSON.stringify({
          action: 'login',
          username: username,
          password: password,
          userType: userType
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        console.log('Non-JSON response:', textResult);
        // Try to parse as JSON anyway in case the content-type is wrong
        try {
          result = JSON.parse(textResult);
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${textResult}`);
        }
      }

      console.log('🔍 Authentication response:', result);

      if (result.success) {
        // Update last login timestamp
        await this.updateLastLogin(username);

        return {
          success: true,
          user: {
            username: result.user.username,
            userType: result.user.userType,
            fullName: result.user.fullName,
            status: result.user.status,
            fixedCash: result.user.fixedCash || 0,
            isAuthenticated: true
          }
        };
      } else {
        return {
          success: false,
          message: result.message || 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return {
        success: false,
        message: 'Authentication service unavailable'
      };
    }
  }

  // Update last login timestamp
  async updateLastLogin(username) {
    try {
      await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'updateLastLogin',
          username: username,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('⚠️ Failed to update last login:', error);
    }
  }

  // Generic API request method with timeout and better error handling
  async makeAPIRequest(url, body, timeout = 10000, retries = 1) {
    let attempt = 0;
    while (attempt < retries + 1) {
      try {
        attempt++;
        console.log(`Attempt ${attempt} of ${retries + 1} to make API request`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          mode: 'cors',
          redirect: 'follow',
          signal: controller.signal,
          body: body
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP Error Response (Attempt ${attempt}):`, errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error(`API Request failed (Attempt ${attempt}):`, error);
        if (error.name === 'AbortError') {
          if (attempt <= retries) {
            console.log(`Request timed out. Retrying... (${attempt}/${retries})`);
            continue; // Retry if timeout and retries are remaining
          } else {
            throw new Error('Request timeout - API took too long to respond after multiple retries');
          }
        }
        if (attempt <= retries) {
          console.log(`Request failed. Retrying... (${attempt}/${retries})`);
          continue; // Retry if other errors and retries are remaining
        } else {
          throw new Error(`Failed to fetch after multiple retries: ${error.message}`);
        }
      }
    }
  }

  // Generic request method for consistent API calls
  async makeRequest(action, data) {
    try {
      console.log(`🔄 Making API request: ${action}`, data);

      const requestBody = JSON.stringify({
        action: action,
        ...data
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ API response for ${action}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ API request failed for ${action}:`, error);
      throw error;
    }
  }

  // Get all users from Users sheet
  async getAllUsers() {
    try {
      console.log('👥 Fetching all users from Google Sheets...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        signal: controller.signal,
        body: JSON.stringify({
          action: 'getAllUsers'
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ getAllUsers API response:', result);

      if (result.success) {
        return result;
      } else {
        console.error('❌ API returned error:', result.error || result.message);
        return { 
          success: false, 
          error: result.error || result.message || 'Failed to fetch users',
          data: [],
          count: 0
        };
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);

      if (error.name === 'AbortError') {
        return { 
          success: false, 
          error: 'Request timeout - API took too long to respond',
          data: [],
          count: 0
        };
      }

      return { 
        success: false, 
        error: error.message || 'Failed to fetch users',
        data: [],
        count: 0
      };
    }
  }

  // ==================== CASH DEPOSIT METHODS ====================
  async addCashDeposit(data) {
    console.log('💰 AuthService: Adding cash deposit:', data);
    try {
      const response = await this.makeRequest('addCashDeposit', data);
      console.log('💰 AuthService: Cash deposit response:', response);
      return response;
    } catch (error) {
      console.error('❌ AuthService: Cash deposit error:', error);
      return { success: false, error: error.message };
    }
  }

  async getCashDeposits() {
    console.log('📋 AuthService: Fetching cash deposits...');
    try {
      const response = await this.makeRequest('getCashDeposits', {});
      console.log('📋 AuthService: Cash deposits response:', response);
      return response;
    } catch (error) {
      console.error('❌ AuthService: Get cash deposits error:', error);
      return { success: true, data: [] };
    }
  }

  async updateCashDeposit(data) {
    console.log('📝 AuthService: Updating cash deposit:', data);
    try {
      const response = await this.makeRequest('updateCashDeposit', data);
      console.log('📝 AuthService: Update cash deposit response:', response);
      return response;
    } catch (error) {
      console.error('❌ AuthService: Update cash deposit error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteCashDeposit(data) {
    console.log('🗑️ AuthService: Deleting cash deposit:', data);
    try {
      const response = await this.makeRequest('deleteCashDeposit', data);
      console.log('🗑️ AuthService: Delete cash deposit response:', response);
      return response;
    } catch (error) {
      console.error('❌ AuthService: Delete cash deposit error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== FARE RECEIPT METHODS ====================
  async addFareReceipt(data) {
    try {
      const response = await this.makeRequest('addFareReceipt', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFareReceipts() {
    try {
      const response = await this.makeRequest('getFareReceipts', {});
      return response;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async updateFareReceipt(data) {
    try {
      const response = await this.makeRequest('updateFareReceipt', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFareReceipt(data) {
    try {
      const response = await this.makeRequest('deleteFareReceipt', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== BOOKING ENTRY METHODS ====================
  async addBookingEntry(data) {
    try {
      const response = await this.makeRequest('addBookingEntry', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getBookingEntries() {
    try {
      const response = await this.makeRequest('getBookingEntries', {});
      return response;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async updateBookingEntry(data) {
    try {
      const response = await this.makeRequest('updateBookingEntry', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteBookingEntry(data) {
    try {
      const response = await this.makeRequest('deleteBookingEntry', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== OFF DAY METHODS ====================
  async addOffDay(data) {
    try {
      const response = await this.makeRequest('addOffDay', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOffDays() {
    try {
      const response = await this.makeRequest('getOffDays', {});
      return response;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async updateOffDay(data) {
    try {
      const response = await this.makeRequest('updateOffDay', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteOffDay(data) {
    try {
      const response = await this.makeRequest('deleteOffDay', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== FUEL PAYMENT METHODS ====================
  async addFuelPayment(data) {
    try {
      const response = await this.makeRequest('addFuelPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFuelPayments() {
    try {
      const response = await this.makeRequest('getFuelPayments', {});
      return response;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async updateFuelPayment(data) {
    try {
      const response = await this.makeRequest('updateFuelPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFuelPayment(data) {
    try {
      const response = await this.makeRequest('deleteFuelPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== ADDA PAYMENT METHODS ====================
  async addAddaPayment(data) {
    try {
      const response = await this.makeRequest('addAddaPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAddaPayments() {
    try {
      const response = await this.makeRequest('getAddaPayments', {});
      return response;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async updateAddaPayment(data) {
    try {
      const response = await this.makeRequest('updateAddaPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteAddaPayment(data) {
    try {
      const response = await this.makeRequest('deleteAddaPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== UNION PAYMENT METHODS ====================
  async addUnionPayment(data) {
    try {
      const response = await this.makeRequest('addUnionPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUnionPayments() {
    try {
      const response = await this.makeRequest('getUnionPayments', {});
      return response;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async updateUnionPayment(data) {
    try {
      const response = await this.makeRequest('updateUnionPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteUnionPayment(data) {
    try {
      const response = await this.makeRequest('deleteUnionPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== SERVICE PAYMENT METHODS ====================
  async addServicePayment(data) {
    try {
      const response = await this.makeRequest('addServicePayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getServicePayments() {
    try {
      const response = await this.makeRequest('getServicePayments', {});
      return response;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async updateServicePayment(data) {
    try {
      const response = await this.makeRequest('updateServicePayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteServicePayment(data) {
    try {
      const response = await this.makeRequest('deleteServicePayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== OTHER PAYMENT METHODS ====================
  async addOtherPayment(data) {
    try {
      const response = await this.makeRequest('addOtherPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOtherPayments() {
    try {
      const response = await this.makeRequest('getOtherPayments', {});
      return response;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async updateOtherPayment(data) {
    try {
      const response = await this.makeRequest('updateOtherPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteOtherPayment(data) {
    try {
      const response = await this.makeRequest('deleteOtherPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== APPROVAL METHODS ====================
  async approveFareReceipt(data) {
    try {
      const response = await this.makeRequest('approveFareReceipt', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approveBookingEntry(data) {
    try {
      const response = await this.makeRequest('approveBookingEntry', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approveFuelPayment(data) {
    try {
      const response = await this.makeRequest('approveFuelPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approveAddaPayment(data) {
    try {
      const response = await this.makeRequest('approveAddaPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approveUnionPayment(data) {
    try {
      const response = await this.makeRequest('approveUnionPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approveServicePayment(data) {
    try {
      const response = await this.makeRequest('approveServicePayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approveOtherPayment(data) {
    try {
      const response = await this.makeRequest('approveOtherPayment', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approveOffDay(data) {
    try {
      const response = await this.makeRequest('approveOffDay', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== STATUS UPDATE METHODS ====================
  async updateFareReceiptStatus(entryId, newStatus, approverName) {
    try {
      const data = { entryId, newStatus, approverName };
      const response = await this.makeRequest('updateFareReceiptStatus', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateBookingEntryStatus(entryId, newStatus, approverName) {
    try {
      const data = { entryId, newStatus, approverName };
      const response = await this.makeRequest('updateBookingEntryStatus', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateFuelPaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = { entryId, newStatus, approverName };
      const response = await this.makeRequest('updateFuelPaymentStatus', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateAddaPaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = { entryId, newStatus, approverName };
      const response = await this.makeRequest('updateAddaPaymentStatus', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUnionPaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = { entryId, newStatus, approverName };
      const response = await this.makeRequest('updateUnionPaymentStatus', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateServicePaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = { entryId, newStatus, approverName };
      const response = await this.makeRequest('updateServicePaymentStatus', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateOtherPaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = { entryId, newStatus, approverName };
      const response = await this.makeRequest('updateOtherPaymentStatus', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateOffDayStatus(entryId, newStatus, approverName) {
    try {
      const data = { entryId, newStatus, approverName };
      const response = await this.makeRequest('updateOffDayStatus', data);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== TEST CONNECTION ====================
  async testConnection() {
    try {
      console.log('🔍 Testing Google Sheets database connection...');
      const response = await this.makeRequest('test', {});
      console.log('✅ Database connection successful:', response);
      return true;
    } catch (error) {
      console.error('❌ Database connection error:', error);
      return false;
    }
  }
}

export default new AuthService();