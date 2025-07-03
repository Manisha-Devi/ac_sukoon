// This service is no longer needed as we're using only React state
// File kept for backward compatibility but will be removed
console.log('⚠️ LocalStorageService is deprecated - using React state only');

export default {
  saveFareData: () => console.log('⚠️ localStorage deprecated'),
  getFareData: () => [],
  updateSyncStatus: () => console.log('⚠️ localStorage deprecated'),
  getSyncStatus: () => null,
  clearAllData: () => console.log('⚠️ localStorage deprecated')
};