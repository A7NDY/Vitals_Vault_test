/**
 * Storage Utility
 * Provides a clean, type-safe interface for localStorage operations
 * Used for local client-side data persistence
 */

interface StorageItem {
  key: string;
  value: unknown;
  expiresAt?: number;
}

class Storage {
  /**
   * Get an item from localStorage
   * @param key - Storage key
   * @param defaultValue - Value to return if key not found
   */
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue ?? null;

      const parsed = JSON.parse(raw) as { value: T; expiresAt?: number };

      // Check if item has expired
      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        localStorage.removeItem(key);
        return defaultValue ?? null;
      }

      return parsed.value;
    } catch (e) {
      console.error(`Error reading from storage key "${key}":`, e);
      return defaultValue ?? null;
    }
  }

  /**
   * Set an item in localStorage
   * @param key - Storage key
   * @param value - Value to store
   * @param expiresInMinutes - Optional expiration time in minutes
   */
  static set(key: string, value: unknown, expiresInMinutes?: number): void {
    try {
      const item: StorageItem = { key, value };

      if (expiresInMinutes) {
        item.expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
      }

      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.error(`Error writing to storage key "${key}":`, e);
    }
  }

  /**
   * Remove an item from localStorage
   * @param key - Storage key
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing storage key "${key}":`, e);
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Error clearing storage:", e);
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param key - Storage key
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

/**
 * Patient Data Utilities
 */

interface PatientData {
  // Section 1: Physical & Demographic
  height: string;
  weight: string;
  bmi: string;
  bloodGroup: string;

  // Section 2: Medical History
  chronicConditions: {
    diabetes: boolean;
    hypertension: boolean;
    heartDisease: boolean;
    asthmaOrCOPD: boolean;
  };
  pastSurgeries: string;
  ongoingConditions: string;
  familyHistory: string;
  pregnancyStatus: "Not Applicable / No" | "Yes";

  // Section 3: Medications
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

export const PatientDataStorage = {
  /**
   * Get patient data from localStorage
   * @param email - Patient's email
   */
  getPatientData(email: string): PatientData | null {
    return Storage.get<PatientData>(`vv_patient_data_${email}`);
  },

  /**
   * Save patient data to localStorage
   * @param email - Patient's email
   * @param data - Patient data to save
   */
  savePatientData(email: string, data: PatientData): void {
    Storage.set(`vv_patient_data_${email}`, data);
  },

  /**
   * Check if patient has completed data entry
   * @param email - Patient's email
   */
  hasPatientData(email: string): boolean {
    return Storage.has(`vv_patient_data_${email}`);
  },

  /**
   * Delete patient data
   * @param email - Patient's email
   */
  deletePatientData(email: string): void {
    Storage.remove(`vv_patient_data_${email}`);
  },
};

export default Storage;
export type { PatientData };
