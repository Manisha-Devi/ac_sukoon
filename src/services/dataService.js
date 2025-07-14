
import authService from './authService.js';

// Online-Only Data Service - Direct Google Sheets Integration
class DataService {
  constructor() {
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Gone offline - service unavailable');
    });
  }

  // Helper function to safely parse date values from Google Sheets
  parseGoogleDate(dateValue) {
    if (!dateValue) return null;
    
    try {
      if (typeof dateValue === 'string') {
        // Handle DD-MM-YYYY format from Google Sheets
        if (dateValue.includes('-') && dateValue.split('-').length === 3) {
          const parts = dateValue.split('-');
          if (parts[0].length === 2) {
            // DD-MM-YYYY format - convert to YYYY-MM-DD
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else if (parts[0].length === 4) {
            // YYYY-MM-DD format - return as is
            return dateValue;
          }
        }
        
        // Handle DD/MM/YYYY format
        if (dateValue.includes('/') && dateValue.split('/').length === 3) {
          const parts = dateValue.split('/');
          if (parts[0].length === 2) {
            // DD/MM/YYYY format
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
        
        // Try to parse as date and convert to YYYY-MM-DD
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          // Ensure we get the correct date in IST
          const istDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
          return istDate.toISOString().split('T')[0];
        }
      }
      
      return dateValue;
    } catch (error) {
      console.warn('Error parsing date:', dateValue, error);
      return dateValue;
    }
  }

  // Helper function to safely parse timestamp values from Google Sheets
  parseGoogleTimestamp(timestampValue) {
    if (!timestampValue) return new Date().toISOString();
    
    try {
      if (typeof timestampValue === 'string') {
        // Handle DD-MM-YYYY HH:MM:SS format from Google Sheets
        if (timestampValue.includes('-') && timestampValue.includes(':')) {
          const [datePart, timePart] = timestampValue.split(' ');
          if (datePart && timePart) {
            const [day, month, year] = datePart.split('-');
            const properDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
            const date = new Date(properDateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
        }
        
        // Handle time-only strings like "1:33:41 PM"
        if (timestampValue.includes(':') && (timestampValue.includes('AM') || timestampValue.includes('PM'))) {
          const today = new Date();
          const todayDateStr = today.toISOString().split('T')[0];
          const fullTimeStr = `${todayDateStr} ${timestampValue}`;
          const date = new Date(fullTimeStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
        
        // Try direct parsing
        const date = new Date(timestampValue);
        if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
          return date.toISOString();
        }
      }
      
      // If all else fails, return current timestamp
      return new Date().toISOString();
    } catch (error) {
      console.warn('Error parsing timestamp:', timestampValue, error);
      return new Date().toISOString();
    }
  }

  checkOnlineStatus() {
    if (!this.isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
  }

  async initializeData() {
    try {
      this.checkOnlineStatus();
      console.log('🚀 Loading data from Google Sheets...');

      const [fareReceipts, bookingEntries, offDays, fuelPayments, addaPayments, unionPayments, servicePayments, otherPayments] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays(),
        authService.getFuelPayments(),
        authService.getAddaPayments(),
        authService.getUnionPayments(),
        authService.getServicePayments(),
        authService.getOtherPayments()
      ]);

      let allData = [];

      if (fareReceipts.success && fareReceipts.data) {
        allData = [...allData, ...fareReceipts.data.map(entry => ({
          ...entry,
          type: 'daily',
          entryType: 'daily'
        }))];
      }

      if (bookingEntries.success && bookingEntries.data) {
        allData = [...allData, ...bookingEntries.data.map(entry => ({
          ...entry,
          type: 'booking',
          entryType: 'booking'
        }))];
      }

      if (offDays.success && offDays.data) {
        allData = [...allData, ...offDays.data.map(entry => ({
          ...entry,
          type: 'off',
          entryType: 'off'
        }))];
      }

      // Add expense data
      if (fuelPayments.success && fuelPayments.data) {
        allData = [...allData, ...fuelPayments.data.map(entry => ({
          ...entry,
          type: 'fuel',
          entryType: 'fuel'
        }))];
      }

      if (addaPayments.success && addaPayments.data) {
        allData = [...allData, ...addaPayments.data.map(entry => ({
          ...entry,
          type: 'adda',
          entryType: 'adda'
        }))];
      }

      if (unionPayments.success && unionPayments.data) {
        allData = [...allData, ...unionPayments.data.map(entry => ({
          ...entry,
          type: 'union',
          entryType: 'union'
        }))];
      }

      if (servicePayments.success && servicePayments.data) {
        allData = [...allData, ...servicePayments.data.map(entry => ({
          ...entry,
          type: 'service',
          entryType: 'service'
        }))];
      }

      if (otherPayments.success && otherPayments.data) {
        allData = [...allData, ...otherPayments.data.map(entry => ({
          ...entry,
          type: 'other',
          entryType: 'other'
        }))];
      }

      // Sort by timestamp (newest first)
      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('✅ Data loaded from Google Sheets:', allData.length, 'entries');
      return allData;

    } catch (error) {
      console.error('❌ Error loading data from Google Sheets:', error);
      throw error;
    }
  }

  async addFareEntry(entryData) {
    try {
      this.checkOnlineStatus();

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';

      let result;
      const newEntry = {
        ...entryData,
        entryId: Date.now(),
        timestamp: new Date().toISOString(),
        submittedBy: submittedBy
      };

      if (entryData.type === 'daily') {
        result = await authService.addFareReceipt({
          entryId: newEntry.entryId,
          timestamp: newEntry.timestamp,
          date: entryData.date,
          route: entryData.route,
          cashAmount: entryData.cashAmount || 0,
          bankAmount: entryData.bankAmount || 0,
          totalAmount: entryData.totalAmount,
          submittedBy: submittedBy
        });
      } else if (entryData.type === 'booking') {
        result = await authService.addBookingEntry({
          entryId: newEntry.entryId,
          timestamp: newEntry.timestamp,
          bookingDetails: entryData.bookingDetails,
          dateFrom: entryData.dateFrom,
          dateTo: entryData.dateTo,
          cashAmount: entryData.cashAmount || 0,
          bankAmount: entryData.bankAmount || 0,
          totalAmount: entryData.totalAmount,
          submittedBy: submittedBy
        });
      } else if (entryData.type === 'off') {
        result = await authService.addOffDay({
          entryId: newEntry.entryId,
          timestamp: newEntry.timestamp,
          date: entryData.date,
          reason: entryData.reason,
          submittedBy: submittedBy
        });
      }

      if (result && result.success) {
        console.log('✅ Entry added to Google Sheets successfully');
        return { success: true, entry: newEntry };
      } else {
        throw new Error(result?.error || 'Failed to add entry to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error adding fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  async updateFareEntry(entryId, updatedData, entryType) {
    try {
      this.checkOnlineStatus();

      let result;

      if (entryType === 'daily') {
        result = await authService.updateFareReceipt({
          entryId: entryId,
          updatedData: updatedData
        });
      } else if (entryType === 'booking') {
        result = await authService.updateBookingEntry({
          entryId: entryId,
          updatedData: updatedData
        });
      } else if (entryType === 'off') {
        result = await authService.updateOffDay({
          entryId: entryId,
          updatedData: updatedData
        });
      }

      if (result && result.success) {
        console.log('✅ Entry updated in Google Sheets successfully');
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to update entry in Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error updating fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteFareEntry(entryId, entryType) {
    try {
      this.checkOnlineStatus();

      let result;

      if (entryType === 'daily') {
        result = await authService.deleteFareReceipt({
          entryId: entryId
        });
      } else if (entryType === 'booking') {
        result = await authService.deleteBookingEntry({
          entryId: entryId
        });
      } else if (entryType === 'off') {
        result = await authService.deleteOffDay({
          entryId: entryId
        });
      }

      if (result && result.success) {
        console.log('✅ Entry deleted from Google Sheets successfully');
        return { success: true };
      } else {
        throw new Error(result?.error || 'Failed to delete entry from Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error deleting fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingSync: 0,
      lastSync: new Date().toISOString(),
      syncInProgress: false
    };
  }

  async forceSync() {
    try {
      this.checkOnlineStatus();
      console.log('🔄 Refreshing data from Google Sheets...');
      return await this.initializeData();
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      throw error;
    }
  }
}

export default new DataService();
