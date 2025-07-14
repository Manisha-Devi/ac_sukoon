
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
