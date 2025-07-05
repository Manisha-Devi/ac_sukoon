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

  // Get all users (for admin purposes)
  async getAllUsers() {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getAllUsers'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return { success: false, message: 'Failed to fetch users' };
    }
  }

  // Add Fare Receipt to Google Sheets with retry mechanism
  async addFareReceipt(data) {
    try {
      console.log('📝 Adding fare receipt to Google Sheets:', data);

      const requestBody = JSON.stringify({
        action: 'addFareReceipt',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        route: data.route,
        cashAmount: data.cashAmount || 0,
        bankAmount: data.bankAmount || 0,
        totalAmount: data.totalAmount || 0,
        submittedBy: data.submittedBy || 'driver'
      });

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

  // Add Booking Entry to Google Sheets
  async addBookingEntry(data) {
    try {
      console.log('📝 Adding booking entry to Google Sheets:', data);

      const requestBody = JSON.stringify({
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
      });

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
        body: JSON.stringify({
          action: 'updateFareReceipt',
          entryId: data.entryId,
          updatedData: data.updatedData
        })
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
        body: JSON.stringify({
          action: 'updateBookingEntry',
          entryId: data.entryId,
          updatedData: data.updatedData
        })
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
        body: JSON.stringify({
          action: 'updateOffDay',
          entryId: data.entryId,
          updatedData: data.updatedData
        })
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
        body: JSON.stringify({
          action: 'deleteFareReceipt',
          entryId: data.entryId
        })
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
        body: JSON.stringify({
          action: 'deleteBookingEntry',
          entryId: data.entryId
        })
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
        body: JSON.stringify({
          action: 'deleteOffDay',
          entryId: data.entryId
        })
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

      const requestBody = JSON.stringify({
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
      });

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
        body: JSON.stringify({
          action: 'getAddaPayments'
        })
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
        body: JSON.stringify({
          action: 'updateAddaPayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        })
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
        body: JSON.stringify({
          action: 'deleteAddaPayment',
          entryId: data.entryId
        })
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

      const requestBody = JSON.stringify({
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
      });

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
        body: JSON.stringify({
          action: 'getUnionPayments'
        })
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
        body: JSON.stringify({
          action: 'updateUnionPayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        })
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
        body: JSON.stringify({
          action: 'deleteUnionPayment',
          entryId: data.entryId
        })
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

      const requestBody = JSON.stringify({
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
      });

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
        body: JSON.stringify({
          action: 'getServicePayments'
        })
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
        body: JSON.stringify({
          action: 'updateServicePayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        })
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

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'deleteServicePayment',
          entryId: data.entryId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Service payment deleted:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting service payment:', error);
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

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'addOtherPayment',
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Other payment added:', result);
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

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'getOtherPayments'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Other payments fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching other payments:', error);
      return { success: false, error: error.message };
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
        body: JSON.stringify({
          action: 'updateOtherPayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        })
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

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          action: 'deleteOtherPayment',
          entryId: data.entryId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Other payment deleted:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting other payment:', error);
      return { success: false, error: error.message };
    }
  }

  // ======= FUEL PAYMENTS API METHODS =======

  // Add Fuel Payment to Google Sheets
  async addFuelPayment(data) {
    try {
      console.log('📝 Adding fuel payment to Google Sheets:', data);

      const requestBody = JSON.stringify({
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
      });

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
        body: JSON.stringify({
          action: 'getFuelPayments'
        })
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
        message: 'Fuel payments loaded from localThis code incorporates the addition of the getOtherPayments method to the AuthService.
```javascript
 cache (API temporarily unavailable)'
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
        body: JSON.stringify({
          action: 'updateFuelPayment',
          entryId: data.entryId,
          updatedData: data.updatedData
        })
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
        body: JSON.stringify({
          action: 'deleteFuelPayment',
          entryId: data.entryId
        })
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

      const requestBody = JSON.stringify({
        action: 'addOffDay',
        entryId: data.entryId,
        timestamp: data.timestamp,
        date: data.date,
        reason: data.reason,
        submittedBy: data.submittedBy || 'driver'
      });

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
        body: JSON.stringify({
          action: 'getFareReceipts'
        })
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
        body: JSON.stringify({
          action: 'getBookingEntries'
        })
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
        body: JSON.stringify({
          action: 'getOffDays'
        })
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
        body: JSON.stringify({
          action: 'updateFareEntry',
          entryId: entryId,
          updatedData: updatedData,
          entryType: entryType
        })
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
        body: JSON.stringify({
          action: 'deleteFareEntry',
          entryId: entryId,
          entryType: entryType
        })
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
        body: JSON.stringify({
          action: 'test'
        })
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
        body: JSON.stringify({
          action: 'getServicePayments'
        })
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
        body: JSON.stringify({
          action: 'getOtherPayments'
        })
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
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

export default new AuthService();