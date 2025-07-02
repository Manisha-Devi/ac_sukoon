
import authService from './authService.js';
import localStorageService from './localStorageService.js';

// Hybrid Data Service - Combines localStorage with Google Sheets sync
class HybridDataService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncQueue = [];

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting auto sync');
      this.autoSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Gone offline - using localStorage only');
    });

    // Start periodic sync when online
    this.startPeriodicSync();
  }

  // Initialize data - Load from localStorage first, then sync with Google Sheets
  async initializeData() {
    try {
      console.log('🚀 Initializing hybrid data system...');

      // First load from localStorage for immediate response
      let localData = localStorageService.loadFareData();
      console.log('📂 Loaded from localStorage:', localData.length, 'entries');

      // If online, try to sync with Google Sheets in background
      if (this.isOnline) {
        this.backgroundSync().catch(error => {
          console.error('⚠️ Background sync failed:', error);
        });
      }

      return localData;

    } catch (error) {
      console.error('❌ Error initializing data:', error);
      return localStorageService.loadFareData(); // Fallback to localStorage
    }
  }

  // Background sync with Google Sheets
  async backgroundSync() {
    try {
      if (this.syncInProgress) return;
      this.syncInProgress = true;

      console.log('🔄 Starting background sync...');

      // Get data from Google Sheets
      const [fareReceipts, bookingEntries, offDays] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays()
      ]);

      // Combine all data with proper type and sync status
      let allData = [];

      if (fareReceipts.success && fareReceipts.data) {
        allData = [...allData, ...fareReceipts.data.map(entry => ({
          ...entry,
          type: 'daily',
          synced: true,
          pendingSync: false
        }))];
      }

      if (bookingEntries.success && bookingEntries.data) {
        allData = [...allData, ...bookingEntries.data.map(entry => ({
          ...entry,
          type: 'booking',
          synced: true,
          pendingSync: false
        }))];
      }

      if (offDays.success && offDays.data) {
        allData = [...allData, ...offDays.data.map(entry => ({
          ...entry,
          type: 'off',
          synced: true,
          pendingSync: false
        }))];
      }

      // Sort by timestamp (newest first)
      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Save to localStorage
      localStorageService.saveFareData(allData);
      localStorageService.updateLastSync();

      // Sync pending entries
      await this.syncPendingEntries();

      console.log('✅ Background sync completed:', allData.length, 'entries');
      return allData;

    } catch (error) {
      console.error('❌ Background sync error:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Add new fare entry - Save to localStorage immediately, sync to Google Sheets in background
  async addFareEntry(entryData, currentFareData) {
    try {
      console.log('📝 Adding entry with hybrid system...');

      const newEntry = {
        ...entryData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        synced: false,
        pendingSync: true
      };

      // Save to localStorage immediately for instant response
      const updatedData = [newEntry, ...currentFareData];
      localStorageService.saveFareData(updatedData);
      localStorageService.markPendingSync(newEntry.id);

      console.log('💾 Entry saved to localStorage immediately');

      // Try to sync to Google Sheets in background if online
      if (this.isOnline) {
        this.syncSingleEntry(newEntry).catch(error => {
          console.error('⚠️ Background sync failed for entry:', newEntry.id, error);
        });
      }

      return { success: true, data: updatedData, entry: newEntry };

    } catch (error) {
      console.error('❌ Error adding fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync single entry to Google Sheets
  async syncSingleEntry(entry) {
    try {
      let result;

      // Add to appropriate Google Sheet based on type
      if (entry.type === 'daily') {
        result = await authService.addFareReceipt({
          entryId: entry.entryId,
          date: entry.date,
          route: entry.route,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount,
          submittedBy: 'driver'
        });
      } else if (entry.type === 'booking') {
        result = await authService.addBookingEntry({
          entryId: entry.entryId,
          bookingDetails: entry.bookingDetails,
          dateFrom: entry.dateFrom,
          dateTo: entry.dateTo,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount,
          submittedBy: 'driver'
        });
      } else if (entry.type === 'off') {
        result = await authService.addOffDay({
          entryId: entry.entryId,
          date: entry.date,
          reason: entry.reason,
          submittedBy: 'driver'
        });
      }

      if (result && result.success) {
        // Mark as synced in localStorage
        const currentData = localStorageService.loadFareData();
        const updatedData = currentData.map(item => 
          item.id === entry.id 
            ? { 
                ...item, 
                synced: true, 
                pendingSync: false
              }
            : item
        );
        localStorageService.saveFareData(updatedData);
        localStorageService.removePendingSync(entry.id);

        console.log('✅ Entry synced to Google Sheets:', entry.id);
        return true;
      } else {
        throw new Error(result?.error || 'Failed to sync to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error syncing entry:', error);
      return false;
    }
  }

  // Update existing entry - Update localStorage immediately, sync to Google Sheets in background
  async updateFareEntry(entryId, updatedData, currentFareData) {
    try {
      console.log('📝 Updating entry with hybrid system...');

      // Find the existing entry
      const existingEntry = currentFareData.find(entry => entry.id === entryId);
      if (!existingEntry) {
        throw new Error('Entry not found');
      }

      // Update in localStorage immediately
      const updatedFareData = currentFareData.map(entry => 
        entry.id === entryId 
          ? { 
              ...entry, 
              ...updatedData, 
              lastModified: new Date().toISOString(),
              synced: false,
              pendingSync: true
            }
          : entry
      );

      localStorageService.saveFareData(updatedFareData);
      localStorageService.markPendingSync(entryId);

      console.log('💾 Entry updated in localStorage immediately');

      // Try to sync to Google Sheets in background if online
      if (this.isOnline && existingEntry.synced) {
        this.syncUpdateToGoogleSheets(entryId, updatedData, existingEntry.type).catch(error => {
          console.error('⚠️ Background update sync failed:', error);
        });
      }

      return { success: true, data: updatedFareData };

    } catch (error) {
      console.error('❌ Error updating fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync update to Google Sheets
  async syncUpdateToGoogleSheets(entryId, updatedData, entryType) {
    try {
      console.log('🔄 Updating in Google Sheets with ID:', entryId);

      let result;

      // Call appropriate update function based on entry type
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
        // Mark as synced in localStorage
        const currentData = localStorageService.loadFareData();
        const updatedLocalData = currentData.map(item => 
          item.id === entryId 
            ? { ...item, synced: true, pendingSync: false }
            : item
        );
        localStorageService.saveFareData(updatedLocalData);
        localStorageService.removePendingSync(entryId);

        console.log('✅ Update synced to Google Sheets:', entryId);
        return true;
      } else {
        throw new Error(result?.error || 'Failed to sync update to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error syncing update:', error);
      return false;
    }
  }

  // Delete entry - Remove from localStorage immediately, sync to Google Sheets in background
  async deleteFareEntry(entryId, currentFareData) {
    try {
      console.log('🗑️ Deleting entry with hybrid system...');

      const existingEntry = currentFareData.find(entry => entry.id === entryId);
      if (!existingEntry) {
        throw new Error('Entry not found');
      }

      // Remove from localStorage immediately
      const updatedData = currentFareData.filter(entry => entry.id !== entryId);
      localStorageService.saveFareData(updatedData);

      console.log('💾 Entry deleted from localStorage immediately');

      // Try to sync deletion to Google Sheets in background if online
      if (this.isOnline && existingEntry.synced) {
        this.syncDeleteToGoogleSheets(entryId, existingEntry.type).catch(error => {
          console.error('⚠️ Background delete sync failed:', error);
        });
      }

      // Remove from pending sync
      localStorageService.removePendingSync(entryId);

      return { success: true, data: updatedData };

    } catch (error) {
      console.error('❌ Error deleting fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync delete to Google Sheets
  async syncDeleteToGoogleSheets(entryId, entryType) {
    try {
      console.log('🗑️ Deleting from Google Sheets with ID:', entryId);

      let result;

      // Call appropriate delete function based on entry type
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
        console.log('✅ Delete synced to Google Sheets:', entryId);
        return true;
      } else {
        throw new Error(result?.error || 'Failed to sync delete to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error syncing delete:', error);
      return false;
    }
  }

  // Sync all pending entries
  async syncPendingEntries() {
    try {
      const pendingIds = localStorageService.getPendingSync();
      if (pendingIds.length === 0) return;

      console.log('🔄 Syncing pending entries:', pendingIds.length);

      const currentData = localStorageService.loadFareData();
      const pendingEntries = currentData.filter(entry => pendingIds.includes(entry.id));

      for (const entry of pendingEntries) {
        if (!entry.synced && entry.pendingSync) {
          // Check if this is a new entry (no previous sync) or an update
          if (!entry.lastModified) {
            // New entry - add to Google Sheets
            await this.syncSingleEntry(entry);
          } else {
            // Updated entry - sync the update
            const updatedData = {
              date: entry.date,
              route: entry.route,
              totalAmount: entry.totalAmount,
              bookingDetails: entry.bookingDetails,
              dateFrom: entry.dateFrom,
              dateTo: entry.dateTo,
              reason: entry.reason
            };
            await this.syncUpdateToGoogleSheets(entry.id, updatedData, entry.type);
          }
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('✅ All pending entries synced');

    } catch (error) {
      console.error('❌ Error syncing pending entries:', error);
    }
  }

  // Get connection and sync status
  getSyncStatus() {
    const pendingSync = localStorageService.getPendingSync();
    const lastSync = localStorageService.getLastSync();

    return {
      isOnline: this.isOnline,
      pendingSync: pendingSync.length,
      lastSync: lastSync,
      syncInProgress: this.syncInProgress
    };
  }

  // Manual force sync
  async forceSync() {
    try {
      if (!this.isOnline) {
        throw new Error('No internet connection available');
      }

      console.log('🔄 Manual sync started...');
      const result = await this.backgroundSync();
      
      // Also refresh the UI data
      return result;

    } catch (error) {
      console.error('❌ Error in force sync:', error);
      throw error;
    }
  }

  // Auto sync when coming online
  async autoSync() {
    if (this.isOnline && !this.syncInProgress) {
      try {
        await this.syncPendingEntries();
        await this.backgroundSync();
      } catch (error) {
        console.error('❌ Auto sync failed:', error);
      }
    }
  }

  // Start periodic sync (every 5 minutes when online)
  startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.autoSync();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

export default new HybridDataService();
