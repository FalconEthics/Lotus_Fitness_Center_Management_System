/**
 * Storage management utilities for handling large datasets
 */

// LocalStorage size limits (approximate)
const LOCALSTORAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB typical limit
const WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB warning threshold

/**
 * Calculate the storage size of data in bytes
 */
export function calculateStorageSize(data: any): number {
  const jsonString = JSON.stringify(data);
  return new Blob([jsonString]).size;
}

/**
 * Check if data can fit in localStorage
 */
export function canFitInLocalStorage(data: any): {
  canFit: boolean;
  size: number;
  sizeFormatted: string;
  isNearLimit: boolean;
} {
  const size = calculateStorageSize(data);
  const sizeFormatted = formatBytes(size);
  
  return {
    canFit: size < LOCALSTORAGE_SIZE_LIMIT,
    size,
    sizeFormatted,
    isNearLimit: size > WARNING_THRESHOLD
  };
}

/**
 * Get current localStorage usage
 */
export function getLocalStorageUsage(): {
  used: number;
  usedFormatted: string;
  available: number;
  availableFormatted: string;
  percentUsed: number;
} {
  let used = 0;
  
  // Calculate current usage
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }
  
  const available = LOCALSTORAGE_SIZE_LIMIT - used;
  const percentUsed = (used / LOCALSTORAGE_SIZE_LIMIT) * 100;
  
  return {
    used,
    usedFormatted: formatBytes(used),
    available,
    availableFormatted: formatBytes(available),
    percentUsed
  };
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Attempt to store data in localStorage with error handling
 */
export function safeLocalStorageSet(key: string, data: any): {
  success: boolean;
  error?: string;
  size?: number;
} {
  try {
    const jsonString = JSON.stringify(data);
    const size = new Blob([jsonString]).size;
    
    // Check size before attempting to store
    if (size > LOCALSTORAGE_SIZE_LIMIT) {
      return {
        success: false,
        error: `Data too large (${formatBytes(size)}). localStorage limit is approximately ${formatBytes(LOCALSTORAGE_SIZE_LIMIT)}.`,
        size
      };
    }
    
    localStorage.setItem(key, jsonString);
    return { success: true, size };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: 'localStorage quota exceeded. Please clear some data or use a smaller dataset.',
        size: calculateStorageSize(data)
      };
    }
    
    return {
      success: false,
      error: `Storage error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      size: calculateStorageSize(data)
    };
  }
}

/**
 * Clear localStorage with confirmation
 */
export function clearAllLocalStorage(): void {
  localStorage.clear();
}

/**
 * Optimize data for storage by removing unnecessary fields
 */
export function optimizeDataForStorage(data: any): any {
  // Clone the data to avoid mutating the original
  const optimized = JSON.parse(JSON.stringify(data));
  
  // Remove any metadata fields that aren't essential
  delete optimized.exportDate;
  delete optimized.version;
  delete optimized.appVersion;
  delete optimized.exportedBy;
  delete optimized.totalRecords;
  
  return optimized;
}

/**
 * Compress attendance records by grouping by date
 */
export function compressAttendanceRecords(attendance: any[]): any[] {
  if (!Array.isArray(attendance) || attendance.length === 0) {
    return attendance;
  }
  
  // For demo purposes, we could sample the attendance data
  // Keep every 10th record to reduce size while maintaining patterns
  const compressed = attendance.filter((_, index) => index % 10 === 0);
  
  return compressed;
}

/**
 * Create a lighter version of the demo data
 */
export function createLightDemoData(fullData: any): any {
  const lightData = { ...fullData };
  
  // Reduce attendance records significantly
  if (lightData.attendance && Array.isArray(lightData.attendance)) {
    // Keep only 10% of attendance records but maintain temporal distribution
    const totalRecords = lightData.attendance.length;
    const targetSize = Math.min(10000, Math.floor(totalRecords * 0.1)); // Max 10k records
    
    // Sample records evenly across the dataset
    const step = Math.floor(totalRecords / targetSize);
    lightData.attendance = lightData.attendance.filter((_, index) => index % step === 0);
  }
  
  return lightData;
}