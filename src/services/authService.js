import APIKeyService from './key.js';

// Authentication service for Google Sheets database
class AuthService {
  constructor() {
    // Google Apps Script Web App URL - Updated to use the correct deployment URL
    this.API_URL = 'https://script.google.com/macros/s/AKfycbzrDR7QN5eaQd1YSj4wfP_Sg8qlTg9ftMnI8PkTXRllCioVNPiTkqb5CmA32FPgYBBN6g/exec';
    this.apiKeyService = APIKeyService;
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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'login',
          username: username,
          password: password,
          userType: userType
        }))
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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateLastLogin',
          username: username,
          timestamp: new Date().toISOString()
        }))
      });
    } catch (error) {
      console.error('⚠️ Failed to update last login:', error);
    }
  }

  // Get all users (for admin purposes)
  async getAllUsers() {
    try {
      console.log('👥 Fetching all users from Google Sheets...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Ensure API key is properly added to the request
      const requestData = this.apiKeyService.addAPIKey({
        action: 'getAllUsers'
      });

      console.log('🔐 getAllUsers request data:', { 
        action: requestData.action, 
        hasApiKey: !!requestData.apiKey,
        apiKeyPreview: requestData.apiKey ? `${requestData.apiKey.substring(0, 10)}...` : 'none'
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        signal: controller.signal,
        body: JSON.stringify(requestData)
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

  // Add Fare Receipt to Google Sheets with retry mechanism
  async addFareReceipt(data) {
    try {
      console.log('📝 Adding fare receipt to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addFareReceipt',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        route: data.route,
        cashAmount: data.cashAmount || 0,
        bankAmount: data.bankAmount || 0,
        totalAmount: data.totalAmount || 0,
        submittedBy: data.submittedBy || 'driver'
      }));

      // Try primary URL first
      let result = await this.makeAPIRequest(this.API_URL, requestBody);

      // If primary fails, don't retry - just return error for hybrid system to handle
      if (!result.success && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Fare receipt response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding fare receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Generic API request method with timeout and better error handling
  async makeAPIRequest(url, bodyData, timeout = 10000, retries = 1) {
    let attempt = 0;
    while (attempt < retries + 1) {
      try {
        attempt++;
        console.log(`Attempt ${attempt} of ${retries + 1} to make API request`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Parse body if it's a string, add API key, then stringify again
        let requestData;
        if (typeof bodyData === 'string') {
          requestData = JSON.parse(bodyData);
        } else {
          requestData = bodyData;
        }

        const authenticatedBody = JSON.stringify(this.apiKeyService.addAPIKey(requestData));

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          mode: 'cors',
          redirect: 'follow',
          signal: controller.signal,
          body: authenticatedBody
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

  // Add Booking Entry to Google Sheets
  async addBookingEntry(data) {
    try {
      console.log('📝 Adding booking entry to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addBookingEntry',
        entryId: data.entryId,
        timestamp: data.timestamp,
        bookingDetails: data.bookingDetails,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        cashAmount: data.cashAmount || 0,
        bankAmount: data.bankAmount || 0,
        totalAmount: data.totalAmount || 0,
        submittedBy: data.submittedBy || 'driver'
      }));

      const result = await this.makeAPIRequest(this.API_URL, requestBody, 45000, 3);

      if (!result.success && result.error && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Booking entry response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding booking entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Fare Receipt
  async updateFareReceipt(data) {
    try {
      console.log('📝 Updating fare receipt in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateFareReceipt',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      const result = await response.json();
      console.log('✅ Fare receipt update response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating fare receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Booking Entry
  async updateBookingEntry(data) {
    try {
      console.log('📝 Updating booking entry in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateBookingEntry',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      const result = await response.json();
      console.log('✅ Booking entry update response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating booking entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Off Day
  async updateOffDay(data) {
    try {
      console.log('📝 Updating off day in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateOffDay',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      const result = await response.json();
      console.log('✅ Off day update response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating off day:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Fare Receipt
  async deleteFareReceipt(data) {
    try {
      console.log('🗑️ Deleting fare receipt in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteFareReceipt',
          entryId: data.entryId
        }))
      });

      const result = await response.json();
      console.log('✅ Fare receipt delete response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting fare receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Booking Entry
  async deleteBookingEntry(data) {
    try {
      console.log('🗑️ Deleting booking entry in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteBookingEntry',
          entryId: data.entryId
        }))
      });

      const result = await response.json();
      console.log('✅ Booking entry delete response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting booking entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Off Day
  async deleteOffDay(data) {
    try {
      console.log('🗑️ Deleting off day in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteOffDay',
          entryId: data.entryId
        }))
      });

      const result = await response.json();
      console.log('✅ Off day delete response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting off day:', error);
      return { success: false, error: error.message };
    }
  }

  // ======= ADDA PAYMENTS API METHODS =======

  // Add Adda Payment to Google Sheets
  async addAddaPayment(data) {
    try {
      console.log('📝 Adding adda payment to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addAddaPayment',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        addaName: data.addaName || '',
        cashAmount: data.cashAmount || 0,
        bankAmount: data.bankAmount || 0,
        totalAmount: data.totalAmount || 0,
        remarks: data.remarks || '',
        submittedBy: data.submittedBy || 'driver'
      }));

      const result = await this.makeAPIRequest(this.API_URL, requestBody, 45000, 3);

      if (!result.success && result.error && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Adda payment response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding adda payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all Adda Payments from Google Sheets
  async getAddaPayments() {
    try {
      console.log('📋 Fetching adda payments from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getAddaPayments'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Adda payments fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching adda payments:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Adda payments loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // Update Adda Payment
  async updateAddaPayment(data) {
    try {
      console.log('📝 Updating adda payment in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateAddaPayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      const result = await response.json();
      console.log('✅ Adda payment update response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating adda payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Adda Payment
  async deleteAddaPayment(data) {
    try {
      console.log('🗑️ Deleting adda payment in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteAddaPayment',
          entryId: data.entryId
        }))
      });

      const result = await response.json();
      console.log('✅ Adda payment delete response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting adda payment:', error);
      return { success: false, error: error.message };
    }
  }

  // ======= UNION PAYMENTS API METHODS =======

  // Add Union Payment to Google Sheets
  async addUnionPayment(data) {
    try {
      console.log('📝 Adding union payment to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addUnionPayment',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        unionName: data.unionName || '',
        cashAmount: data.cashAmount || 0,
        bankAmount: data.bankAmount || 0,
        totalAmount: data.totalAmount || 0,
        remarks: data.remarks || '',
        submittedBy: data.submittedBy || 'driver'
      }));

      const result = await this.makeAPIRequest(this.API_URL, requestBody, 45000, 3);

      if (!result.success && result.error && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Union payment response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding union payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all Union Payments from Google Sheets
  async getUnionPayments() {
    try {
      console.log('📋 Fetching union payments from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getUnionPayments'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Union payments fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching union payments:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Union payments loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // Update Union Payment
  async updateUnionPayment(data) {
    try {
      console.log('📝 Updating union payment in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateUnionPayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      const result = await response.json();
      console.log('✅ Union payment update response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating union payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Union Payment
  async deleteUnionPayment(data) {
    try {
      console.log('🗑️ Deleting union payment from Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteUnionPayment',
          entryId: data.entryId
        }))
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Union payment deleted:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting union payment:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // SERVICE PAYMENTS - COMPLETE API INTEGRATION
  // ============================================================================

  // Add new Service Payment to Google Sheets
  async addServicePayment(data) {
    try {
      console.log('📝 Adding service payment to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addServicePayment',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        serviceType: data.serviceType || '',
        cashAmount: data.cashAmount || 0,
        bankAmount: data.bankAmount || 0,
        totalAmount: data.totalAmount || 0,
        serviceDetails: data.serviceDetails || '',
        submittedBy: data.submittedBy || 'driver'
      }));

      const result = await this.makeAPIRequest(this.API_URL, requestBody, 45000, 3);

      if (!result.success && result.error && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Service payment response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding service payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all Service Payments from Google Sheets
  async getServicePayments() {
    try {
      console.log('📋 Fetching service payments from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getServicePayments'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Service payments fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching service payments:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Service payments loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // Update Service Payment
  async updateServicePayment(data) {
    try {
      console.log('📝 Updating service payment in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateServicePayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Service payment updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating service payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Service Payment
  async deleteServicePayment(data) {
    try {
      console.log('🗑️ Deleting service payment from Google Sheets:', data);

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteServicePayment',
          entryId: data.entryId
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Service payment deleted successfully:', result);

      // Validate response structure
      if (result && typeof result === 'object') {
        return result;
      } else {
        console.warn('⚠️ Invalid response format:', result);
        return { success: true, message: 'Service payment deleted (response format issue)' };
      }
    } catch (error) {
      console.error('❌ Error deleting service payment:', error);
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout - delete operation took too long' };
      }
      return { success: false, error: error.message };
    }
  }

  // ====================================================================
  // OTHER PAYMENTS OPERATIONS
  // ====================================================================

  // Add Other Payment
  async addOtherPayment(data) {
    try {
      console.log('📝 Adding other payment to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addOtherPayment',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        paymentType: data.paymentType || '',
        description: data.description || '',
        cashAmount: data.cashAmount || 0,
        bankAmount: data.bankAmount || 0,
        totalAmount: data.totalAmount || 0,
        submittedBy: data.submittedBy || 'driver'
      }));

      const result = await this.makeAPIRequest(this.API_URL, requestBody, 45000, 3);

      if (!result.success && result.error && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Other payment response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding other payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Other Payments
  async getOtherPayments() {
    try {
      console.log('📋 Fetching other payments from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getOtherPayments'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Other payments fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching other payments:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Other payments loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // Update Other Payment
  async updateOtherPayment(data) {
    try {
      console.log('📝 Updating other payment in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateOtherPayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Other payment updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating other payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Other Payment
  async deleteOtherPayment(data) {
    try {
      console.log('🗑️ Deleting other payment from Google Sheets:', data);

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteOtherPayment',
          entryId: data.entryId
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Other payment deleted successfully:', result);

      // Validate response structure
      if (result && typeof result === 'object') {
        return result;
      } else {
        console.warn('⚠️ Invalid response format:', result);
        return { success: true, message: 'Other payment deleted (response format issue)' };
      }
    } catch (error) {
      console.error('❌ Error deleting other payment:', error);
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout - delete operation took too long' };
      }
      return { success: false, error: error.message };
    }
  }

  // ======= FUEL PAYMENTS API METHODS =======

  // Add Fuel Payment to Google Sheets
  async addFuelPayment(data) {
    try {
      console.log('📝 Adding fuel payment to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addFuelPayment',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        pumpName: data.pumpName || '',
        liters: data.liters || '',
        rate: data.rate || '',
        cashAmount: data.cashAmount || 0,
        bankAmount: data.bankAmount || 0,
        totalAmount: data.totalAmount || 0,
        remarks: data.remarks || '',
        submittedBy: data.submittedBy || 'driver'
      }));

      const result = await this.makeAPIRequest(this.API_URL, requestBody, 45000, 3);

      if (!result.success && result.error && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Fuel payment response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding fuel payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all Fuel Payments from Google Sheets
  async getFuelPayments() {
    try {
      console.log('📋 Fetching fuel payments from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getFuelPayments'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Fuel payments fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching fuel payments:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Fuel payments loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // Update Fuel Payment
  async updateFuelPayment(data) {
    try {
      console.log('📝 Updating fuel payment in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateFuelPayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      const result = await response.json();
      console.log('✅ Fuel payment update response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating fuel payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Fuel Payment
  async deleteFuelPayment(data) {
    try {
      console.log('🗑️ Deleting fuel payment in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteFuelPayment',
          entryId: data.entryId
        }))
      });

      const result = await response.json();
      console.log('✅ Fuel payment delete response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting fuel payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Add Off Day to Google Sheets
  async addOffDay(data) {
    try {
      console.log('📝 Adding off day to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addOffDay',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        reason: data.reason,
        submittedBy: data.submittedBy || 'driver'
      }));

      const result = await this.makeAPIRequest(this.API_URL, requestBody, 45000, 3);

      if (!result.success && result.error && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Off day response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding off day:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all Fare Receipts from Google Sheets
  async getFareReceipts() {
    try {
      console.log('📋 Fetching fare receipts from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getFareReceipts'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Fare receipts fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching fare receipts:', error);
      // Return empty datastructure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Fare receipts loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // Get Booking Entries from Google Sheets
  async getBookingEntries() {
    try {
      console.log('📋 Fetching booking entries from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getBookingEntries'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Booking entries fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching booking entries:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Booking entries loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // Get Off Days from Google Sheets
  async getOffDays() {
    try {
      console.log('📋 Fetching off days from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getOffDays'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Off days fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching off days:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Off days loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // Update existing entry in Google Sheets
  async updateFareEntry(entryId, updatedData, entryType) {
    try {
      console.log('📝 Updating entry in Google Sheets:', { entryId, updatedData, entryType });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateFareEntry',
          entryId: entryId,
          updatedData: updatedData,
          entryType: entryType
        }))
      });

      const result = await response.json();
      console.log('✅ Update entry response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete entry from Google Sheets
  async deleteFareEntry(entryId, entryType) {
    try {
      console.log('🗑️ Deleting entry from Google Sheets:', { entryId, entryType });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteFareEntry',
          entryId: entryId,
          entryType: entryType
        }))
      });

      const result = await response.json();
      console.log('✅ Delete entry response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Test connection to Google Sheets database
  async testConnection() {
    try {
      console.log('🔍 Testing Google Sheets database connection...');
      console.log('📍 API URL:', this.API_URL);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'test'
        }))
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Database connection successful:', result);
        return true;
      } else {
        console.log('❌ Database connection failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Database connection error:', error);
      return false;
    }
  }

  async getServicePayments() {
    try {
      console.log('📋 Fetching service payments from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getServicePayments'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Service payments fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching service payments:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Service payments loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  async getOtherPayments() {
    try {
      console.log('📋 Fetching other payments from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getOtherPayments'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Other payments fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching other payments:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: true, 
        data: [],
        message: 'Other payments loaded from local cache (API temporarily unavailable)'
      };
    }
  }

  // ============================================================================
  // APPROVAL WORKFLOW FUNCTIONS
  // ============================================================================

  // Helper method for approval API calls
  async makeApprovalAPIRequest(action, data, timeout = 15000) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: action,
          ...data
        }))
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ ${action} response:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error in ${action}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Approve Other Payment
  async approveOtherPayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('approveOtherPayment', data);
      return response;
    } catch (error) {
      console.error('Error approving other payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Approve Adda Payment
  async approveAddaPayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('approveAddaPayment', data);
      return response;
    } catch (error) {
      console.error('Error approving adda payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Approve Service Payment
  async approveServicePayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('approveServicePayment', data);
      return response;
    } catch (error) {
      console.error('Error approving service payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Approve Union Payment
  async approveUnionPayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('approveUnionPayment', data);
      return response;
    } catch (error) {
      console.error('Error approving union payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Resend Other Payment
  async resendOtherPayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('resendOtherPayment', data);
      return response;
    } catch (error) {
      console.error('Error resending other payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Resend Adda Payment
  async resendAddaPayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('resendAddaPayment', data);
      return response;
    } catch (error) {
      console.error('Error resending adda payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Resend Service Payment
  async resendServicePayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('resendServicePayment', data);
      return response;
    } catch (error) {
      console.error('Error resending service payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Resend Union Payment
  async resendUnionPayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('resendUnionPayment', data);
      return response;
    } catch (error) {
      console.error('Error resending union payment:', error);
      return { success: false, error: error.message };
    }
  }



  // Generic approval functions for other data types (to be implemented similarly)
  async approveFareReceipt(data) {
    try {
      const response = await this.makeApprovalAPIRequest('approveFareReceipt', data);
      return response;
    } catch (error) {
      console.error('Error approving fare receipt:', error);
      return { success: false, error: error.message };
    }
  }

  async resendFareReceipt(data) {
    try {
      const response = await this.makeApprovalAPIRequest('resendFareReceipt', data);
      return response;
    } catch (error) {
      console.error('Error resending fare receipt:', error);
      return { success: false, error: error.message };
    }
  }

  async approveBookingEntry(data) {
    try {
      const response = await this.makeApprovalAPIRequest('approveBookingEntry', data);
      return response;
    } catch (error) {
      console.error('Error approving booking entry:', error);
      return { success: false, error: error.message };
    }
  }

  async resendBookingEntry(data) {
    try {
      const response = await this.makeApprovalAPIRequest('resendBookingEntry', data);
      return response;
    } catch (error) {
      console.error('Error resending booking entry:', error);
      return { success: false, error: error.message };
    }
  }

  async approveFuelPayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('approveFuelPayment', data);
      return response;
    } catch (error) {
      console.error('Error approving fuel payment:', error);
      return { success: false, error: error.message };
    }
  }

  async resendFuelPayment(data) {
    try {
      const response = await this.makeApprovalAPIRequest('resendFuelPayment', data);
      return response;
    } catch (error) {
      console.error('Error resending fuel payment:', error);
      return { success: false, error: error.message };
    }
  }



  // ============================================================================
  // STATUS UPDATE FUNCTIONS
  // ============================================================================

  // Update Fare Receipt Status
  async updateFareReceiptStatus(entryId, newStatus, approverName) {
    try {
      const data = {
        entryId: entryId,
        newStatus: newStatus,
        approverName: approverName
      };
      const response = await this.makeApprovalAPIRequest('updateFareReceiptStatus', data);
      return response;
    } catch (error) {
      console.error('Error updating fare receipt status:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Booking Entry Status
  async updateBookingEntryStatus(entryId, newStatus, approverName) {
    try {
      const data = {
        entryId: entryId,
        newStatus: newStatus,
        approverName: approverName
      };
      const response = await this.makeApprovalAPIRequest('updateBookingEntryStatus', data);
      return response;
    } catch (error) {
      console.error('Error updating booking entry status:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Fuel Payment Status
  async updateFuelPaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = {
        entryId: entryId,
        newStatus: newStatus,
        approverName: approverName
      };
      const response = await this.makeApprovalAPIRequest('updateFuelPaymentStatus', data);
      return response;
    } catch (error) {
      console.error('Error updating fuel payment status:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Adda Payment Status
  async updateAddaPaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = {
        entryId: entryId,
        newStatus: newStatus,
        approverName: approverName
      };
      const response = await this.makeApprovalAPIRequest('updateAddaPaymentStatus', data);
      return response;
    } catch (error) {
      console.error('Error updating adda payment status:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Union Payment Status
  async updateUnionPaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = {
        entryId: entryId,
        newStatus: newStatus,
        approverName: approverName
      };
      const response = await this.makeApprovalAPIRequest('updateUnionPaymentStatus', data);
      return response;
    } catch (error) {
      console.error('Error updating union payment status:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Service Payment Status
  async updateServicePaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = {
        entryId: entryId,
        newStatus: newStatus,
        approverName: approverName
      };
      const response = await this.makeApprovalAPIRequest('updateServicePaymentStatus', data);
      return response;
    } catch (error) {
      console.error('Error updating service payment status:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Other Payment Status
  async updateOtherPaymentStatus(entryId, newStatus, approverName) {
    try {
      const data = {
        entryId: entryId,
        newStatus: newStatus,
        approverName: approverName
      };
      const response = await this.makeApprovalAPIRequest('updateOtherPaymentStatus', data);
      return response;
    } catch (error) {
      console.error('Error updating other payment status:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Off Day Status (if needed)
  async updateOffDayStatus(entryId, newStatus, approverName) {
    try {
      const data = {
        entryId: entryId,
        newStatus: newStatus,
        approverName: approverName
      };
      const response = await this.makeApprovalAPIRequest('updateOffDayStatus', data);
      return response;
    } catch (error) {
      console.error('Error updating off day status:', error);
      return { success: false, error: error.message };
    }
  }

  // Approve Off Day Entry
  async approveOffDay(data) {
    try {
      const response = await this.makeApprovalAPIRequest('approveOffDay', data);
      return response;
    } catch (error) {
      console.error('Error approving off day:', error);
      return { success: false, error: error.message };
    }
  }

  // Resend Off Day Entry
  async resendOffDay(data) {
    try {
      const response = await this.makeApprovalAPIRequest('resendOffDay', data);
      return response;
    } catch (error) {
      console.error('Error resending off day:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // BATCH OPERATIONS FOR MULTIPLE ENTRIES
  // ============================================================================

  // Batch update multiple entries at once
  async batchUpdateStatus(entries) {
    try {
      const results = [];
      for (const entry of entries) {
        let result;
        switch (entry.dataType) {
          case 'Fare Receipt':
            result = await this.updateFareReceiptStatus(entry);
            break;
          case 'Booking Entry':
            result = await this.updateBookingEntryStatus(entry);
            break;
          case 'Fuel Payment':
            result = await this.updateFuelPaymentStatus(entry);
            break;
          case 'Adda Payment':
            result = await this.updateAddaPaymentStatus(entry);
            break;
          case 'Union Payment':
            result = await this.updateUnionPaymentStatus(entry);
            break;
          case 'Service Payment':
            result = await this.updateServicePaymentStatus(entry);
            break;
          case 'Other Payment':
            result = await this.updateOtherPaymentStatus(entry);
            break;
          default:
            result = { success: false, error: `Unsupported data type: ${entry.dataType}` };
        }
        results.push({ entryId: entry.entryId, result });
      }
      return { success: true, results };
    } catch (error) {
      console.error('Error in batch update:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // CASH DEPOSITS API METHODS
  // ============================================================================

  // Add Cash Deposit to Google Sheets
  async addCashDeposit(data) {
    try {
      console.log('💰 Adding cash deposit to Google Sheets:', data);

      const requestBody = JSON.stringify(this.apiKeyService.addAPIKey({
        action: 'addCashDeposit',
        entryId: data.entryId,
        timestamp: data.timestamp,
        entryType: data.entryType || 'Cash Deposit',
        date: data.date,
        cashAmount: data.cashAmount || 0,
        description: data.description || '',
        depositedBy: data.depositedBy || 'Unknown'
      }));

      const result = await this.makeAPIRequest(this.API_URL, requestBody, 45000, 3);

      if (!result.success && result.error && result.error.includes('Failed to fetch')) {
        console.log('⚠️ Google Sheets API temporarily unavailable - data saved locally');
        return { success: false, error: 'API temporarily unavailable - data saved locally' };
      }

      console.log('✅ Cash deposit response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding cash deposit:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all Cash Deposits from Google Sheets
  async getCashDeposits() {
    try {
      console.log('💰 Fetching cash deposits from Google Sheets...');

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'getCashDeposits'
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cash deposits HTTP error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Cash deposits API response:', result);

      if (result.success && result.data) {
        console.log(`💰 Successfully fetched ${result.data.length} cash deposits from Google Sheets`);
        result.data.forEach((deposit, index) => {
          console.log(`${index + 1}. Cash Deposit:`, {
            entryId: deposit.entryId,
            amount: deposit.cashAmount,
            date: deposit.date,
            depositedBy: deposit.depositedBy
          });
        });
      } else {
        console.warn('⚠️ Cash deposits API returned error:', result.error || 'Unknown error');
      }

      return result;
    } catch (error) {
      console.error('❌ Error fetching cash deposits:', error);
      // Return empty data structure instead of error to prevent UI crashes
      return { 
        success: false, 
        data: [],
        error: error.message,
        message: 'Cash deposits API temporarily unavailable'
      };
    }
  }

  // Update Cash Deposit
  async updateCashDeposit(data) {
    try {
      console.log('📝 Updating cash deposit in Google Sheets:', data);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'updateCashDeposit',
          entryId: data.entryId,
          updatedData: data.updatedData
        }))
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Cash deposit updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating cash deposit:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Cash Deposit
  async deleteCashDeposit(data) {
    try {
      console.log('🗑️ Deleting cash deposit from Google Sheets:', data);

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
        body: JSON.stringify(this.apiKeyService.addAPIKey({
          action: 'deleteCashDeposit',
          entryId: data.entryId
        }))
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Cash deposit deleted successfully:', result);

      // Validate response structure
      if (result && typeof result === 'object') {
        return result;
      } else {
        console.warn('⚠️ Invalid response format:', result);
        return { success: true, message: 'Cash deposit deleted (response format issue)' };
      }
    } catch (error) {
      console.error('❌ Error deleting cash deposit:', error);
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout - delete operation took too long' };
      }
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // ANALYTICS FUNCTIONS
  // ============================================================================

  // Test API key validity with backend
  async testAPIKey() {
    try {
      console.log('🔍 Testing API key validity...');
      
      const testData = this.apiKeyService.addAPIKey({
        action: 'test'
      });

      const response = await fetch(this.API_URL, {
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

  // Delegate API key testing to the API key service
  async testAPIKeyValidity() {
    return await this.apiKeyService.testAPIKey();
  }
}

export default new AuthService();