/**
 * Utility functions for generating unique identifiers
 */

/**
 * Generate a unique file number for a patient
 * Format: FN-YYYYMMDD-XXXX
 * Example: FN-20241230-1234
 */
export function generateFileNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  
  return `FN-${year}${month}${day}-${random}`;
}

/**
 * Generate a unique appointment reference
 * Format: APT-YYYYMMDD-XXXX
 * Example: APT-20241230-5678
 */
export function generateAppointmentReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  
  return `APT-${year}${month}${day}-${random}`;
}

/**
 * Generate a unique consultation reference
 * Format: CON-YYYYMMDD-XXXX
 * Example: CON-20241230-9012
 */
export function generateConsultationReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  
  return `CON-${year}${month}${day}-${random}`;
}

/**
 * Generate a unique referral reference
 * Format: REF-YYYYMMDD-XXXX
 * Example: REF-20241230-3456
 */
export function generateReferralReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  
  return `REF-${year}${month}${day}-${random}`;
}

/**
 * Validate file number format
 */
export function isValidFileNumber(fileNumber: string): boolean {
  const pattern = /^FN-\d{8}-\d{4}$/;
  return pattern.test(fileNumber);
}

/**
 * Extract date from file number
 */
export function extractDateFromFileNumber(fileNumber: string): Date | null {
  if (!isValidFileNumber(fileNumber)) {
    return null;
  }
  
  const datePart = fileNumber.split('-')[1];
  const year = parseInt(datePart.substring(0, 4));
  const month = parseInt(datePart.substring(4, 6)) - 1;
  const day = parseInt(datePart.substring(6, 8));
  
  return new Date(year, month, day);
}
