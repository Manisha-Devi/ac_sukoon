import authService from './authService.js';

// Online-Only Data Service - Direct Google Sheets Integration
class DataService {
  constructor() {
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Gone offline - service unavailable');
    });
  }

  // Check if online before any operation
  checkOnlineStatus() {
    if (!this.isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
  }

  // Initialize data - Load directly from Google Sheets
  async initializeData() {
    try {
      this.checkOnlineStatus();
      console.log('🚀 Loading data from Google Sheets...');

      // Get all data from Google Sheets
      const [fareReceipts, bookingEntries, offDays] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays()
      ]);

      // Combine all data with proper type
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
      console.error('❌ Error loading data from Google Sheets:', error);
      if (!this.isOnline) {
        throw new Error('No internet connection. Cannot load data.');
      }
      throw error;
    }
  }

  // Add new fare entry - Direct to Google Sheets
  async addFareEntry(entryData, currentFareData) {
    try {
      this.checkOnlineStatus();

      let result;
      const newEntry = {
        ...entryData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };

      // Add to appropriate Google Sheet based on type
      if (entryData.type === 'daily') {
        result = await authService.addFareReceipt({
          date: entryData.date,
          route: entryData.route,
          cashAmount: entryData.cashAmount || 0,
          bankAmount: entryData.bankAmount || 0,
          totalAmount: entryData.totalAmount,
          submittedBy: 'driver'
        });
      } else if (entryData.type === 'booking') {
        result = await authService.addBookingEntry({
          bookingDetails: entryData.bookingDetails,
          dateFrom: entryData.dateFrom,
          dateTo: entryData.dateTo,
          cashAmount: entryData.cashAmount || 0,
          bankAmount: entryData.bankAmount || 0,
          totalAmount: entryData.totalAmount,
          submittedBy: 'driver'
        });
      } else if (entryData.type === 'off') {
        result = await authService.addOffDay({
          date: entryData.date,
          reason: entryData.reason,
          submittedBy: 'driver'
        });
      }

      if (result && result.success) {
        // Add to current data array for immediate UI update
        const updatedData = [newEntry, ...currentFareData];
        console.log('✅ Entry added to Google Sheets successfully');
        return { success: true, data: updatedData, entry: newEntry };
      } else {
        throw new Error(result?.error || 'Failed to add entry to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error adding fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Update existing entry - Direct to Google Sheets
  async updateFareEntry(entryId, updatedData, currentFareData) {
    try {
      this.checkOnlineStatus();

      // Note: For now, we'll update locally and inform user about Google Sheets limitation
      const updatedFareData = currentFareData.map(entry => 
        entry.id === entryId 
          ? { ...entry, ...updatedData, lastModified: new Date().toISOString() }
          : entry
      );

      console.log('⚠️ Entry updated locally. Note: Google Sheets doesn\'t support direct updates.');
      return { success: true, data: updatedFareData };

    } catch (error) {
      console.error('❌ Error updating fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete entry - Remove from local data only
  async deleteFareEntry(entryId, currentFareData) {
    try {
      this.checkOnlineStatus();

      const updatedData = currentFareData.filter(entry => entry.id !== entryId);

      console.log('⚠️ Entry deleted locally. Note: Google Sheets entry will remain.');
      return { success: true, data: updatedData };

    } catch (error) {
      console.error('❌ Error deleting fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Get connection status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingSync: 0, // No pending sync in online-only mode
      lastSync: new Date().toISOString(),
      syncInProgress: false
    };
  }

  // Manual refresh from Google Sheets
  async forcSync() {
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