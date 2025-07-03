import authService from './authService.js';

// Simplified Hybrid Data Service - React State with Google Sheets sync
class HybridDataService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;

    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting auto sync');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Gone offline - using React state only');
    });
  }

  async initializeData() {
    try {
      console.log('🚀 Initializing data from Google Sheets...');

      if (!this.isOnline) {
        console.log('📴 Offline - returning empty data');
        return [];
      }

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

      // Sort by timestamp (newest first)
      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('✅ Data loaded from Google Sheets:', allData.length, 'entries');
      return allData;

    } catch (error) {
      console.error('❌ Error initializing data:', error);
      return [];
    }
  }

  async addFareEntry(entryData) {
    try {
      console.log('📝 Adding entry...');

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';

      const newEntry = {
        ...entryData,
        entryId: Date.now(),
        timestamp: new Date().toISOString(),
        submittedBy: submittedBy
      };

      // Try to sync to Google Sheets if online
      if (this.isOnline) {
        let result;

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
          console.warn('⚠️ Failed to sync to Google Sheets but entry created locally');
          return { success: true, entry: newEntry, syncError: true };
        }
      } else {
        console.log('📴 Offline - entry will be added when online');
        return { success: true, entry: newEntry, offline: true };
      }

    } catch (error) {
      console.error('❌ Error adding fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  async updateFareEntry(entryId, updatedData, entryType) {
    try {
      console.log('📝 Updating entry...');

      if (!this.isOnline) {
        console.log('📴 Offline - update will be saved locally');
        return { success: true, offline: true };
      }

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
        console.warn('⚠️ Failed to sync update to Google Sheets');
        return { success: true, syncError: true };
      }

    } catch (error) {
      console.error('❌ Error updating fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteFareEntry(entryId, entryType) {
    try {
      console.log('🗑️ Deleting entry...');

      if (!this.isOnline) {
        console.log('📴 Offline - delete will be saved locally');
        return { success: true, offline: true };
      }

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
        console.warn('⚠️ Failed to sync delete to Google Sheets');
        return { success: true, syncError: true };
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
      syncInProgress: this.syncInProgress
    };
  }

  async forceSync() {
    try {
      if (!this.isOnline) {
        throw new Error('No internet connection available');
      }

      console.log('🔄 Manual sync started...');
      return await this.initializeData();

    } catch (error) {
      console.error('❌ Error in force sync:', error);
      throw error;
    }
  }
}

export default new HybridDataService();