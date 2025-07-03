
import authService from './authService.js';

class SimpleDataService {
  constructor() {
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
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

      const [fareReceipts, bookingEntries, offDays] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays()
      ]);

      let allData = [];

      if (fareReceipts.success && fareReceipts.data) {
        allData = [...allData, ...fareReceipts.data.map(entry => ({
          ...entry,
          type: 'daily'
        }))];
      }

      if (bookingEntries.success && bookingEntries.data) {
        allData = [...allData, ...bookingEntries.data.map(entry => ({
          ...entry,
          type: 'booking'
        }))];
      }

      if (offDays.success && offDays.data) {
        allData = [...allData, ...offDays.data.map(entry => ({
          ...entry,
          type: 'off'
        }))];
      }

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

      const result = await authService.updateFareEntry(entryId, updatedData, entryType);

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

      const result = await authService.deleteFareEntry(entryId, entryType);

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
}

export default new SimpleDataService();
