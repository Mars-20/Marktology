import { db } from "./storage";
import { clinics, users } from "@shared/schema";
import type { InsertClinic, InsertUser } from "@shared/schema";
import { hashPassword } from "./storage";
import { eq } from "drizzle-orm";

/**
 * Clinic Registration Service
 * Professional clinic registration with code generation
 */

// ============================================
// Code Generation
// ============================================

/**
 * Generate unique clinic code
 * Format: CL-XXXXX (e.g., CL-12345)
 */
export async function generateClinicCode(): Promise<string> {
  let code = '';
  let exists = true;
  
  while (exists) {
    // Generate 5-digit random number
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    code = `CL-${randomNum}`;
    
    // Check if code already exists
    const [existing] = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, code))
      .limit(1);
    
    exists = !!existing;
  }
  
  return code;
}

/**
 * Generate unique license number
 * Format: LIC-YYYYMMDD-XXXX (e.g., LIC-20251230-1234)
 */
export function generateLicenseNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  
  return `LIC-${year}${month}${day}-${random}`;
}

/**
 * Generate username from name
 * Format: firstname.lastname or firstname.lastname.X if exists
 */
export async function generateUsername(firstName: string, lastName: string): Promise<string> {
  const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, '');
  let username = baseUsername;
  let counter = 1;
  let exists = true;
  
  while (exists) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (!existing) {
      exists = false;
    } else {
      username = `${baseUsername}.${counter}`;
      counter++;
    }
  }
  
  return username;
}

/**
 * Generate temporary password
 * Format: Clinic@XXXX (e.g., Clinic@1234)
 */
export function generateTemporaryPassword(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `Clinic@${random}`;
}

// ============================================
// Registration Process
// ============================================

export interface ClinicRegistrationData {
  // Clinic info
  name: string;
  address: string;
  phone: string;
  email: string;
  specialty?: string;
  
  // Owner info
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  owner_specialization?: string;
}

export interface RegistrationResult {
  clinic: {
    id: string;
    code: string;
    name: string;
    license_number: string;
    status: string;
  };
  owner: {
    id: string;
    username: string;
    temporary_password: string;
    full_name: string;
    email: string;
  };
  access_info: {
    clinic_code: string;
    username: string;
    temporary_password: string;
    login_url: string;
  };
}

/**
 * Register new clinic with complete setup
 */
export async function registerClinic(data: ClinicRegistrationData): Promise<RegistrationResult> {
  // Generate codes
  const licenseNumber = generateLicenseNumber();
  const username = await generateUsername(data.owner_first_name, data.owner_last_name);
  const temporaryPassword = generateTemporaryPassword();
  
  // Create clinic
  const clinicData: InsertClinic = {
    name: data.name,
    address: data.address,
    phone: data.phone,
    email: data.email,
    specialty: data.specialty || null,
    license_number: licenseNumber,
    status: 'pending', // Will be activated by admin
  };
  
  const [clinic] = await db
    .insert(clinics)
    .values(clinicData)
    .returning();
  
  // Create owner user
  const hashedPassword = await hashPassword(temporaryPassword);
  
  const ownerData: InsertUser = {
    clinic_id: clinic.id,
    username: username,
    password: hashedPassword,
    email: data.owner_email,
    full_name: `${data.owner_first_name} ${data.owner_last_name}`,
    first_name: data.owner_first_name,
    last_name: data.owner_last_name,
    phone: data.owner_phone,
    role: 'clinic_owner',
    status: 'active',
    specialization: data.owner_specialization || null,
    registration_method: 'clinic_owner',
    is_first_login: true,
  };
  
  const [owner] = await db
    .insert(users)
    .values(ownerData)
    .returning();
  
  // Return registration result
  return {
    clinic: {
      id: clinic.id,
      code: clinic.id,
      name: clinic.name,
      license_number: clinic.license_number!,
      status: clinic.status,
    },
    owner: {
      id: owner.id,
      username: owner.username,
      temporary_password: temporaryPassword,
      full_name: owner.full_name,
      email: owner.email,
    },
    access_info: {
      clinic_code: clinic.id,
      username: owner.username,
      temporary_password: temporaryPassword,
      login_url: process.env.APP_URL || 'http://localhost:5000',
    },
  };
}

// ============================================
// Clinic Activation
// ============================================

export interface ActivationData {
  clinic_id: string;
  approved_by: string;
  notes?: string;
}

/**
 * Activate clinic (admin only)
 */
export async function activateClinic(data: ActivationData) {
  const [clinic] = await db
    .update(clinics)
    .set({
      status: 'active',
      approved_by: data.approved_by,
      approved_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(clinics.id, data.clinic_id))
    .returning();
  
  if (!clinic) {
    throw new Error('Clinic not found');
  }
  
  return clinic;
}

/**
 * Reject clinic registration
 */
export async function rejectClinic(clinicId: string, reason: string) {
  const [clinic] = await db
    .update(clinics)
    .set({
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date(),
    })
    .where(eq(clinics.id, clinicId))
    .returning();
  
  if (!clinic) {
    throw new Error('Clinic not found');
  }
  
  return clinic;
}

/**
 * Suspend clinic
 */
export async function suspendClinic(clinicId: string, reason: string) {
  const [clinic] = await db
    .update(clinics)
    .set({
      status: 'suspended',
      rejection_reason: reason, // Using same field for suspension reason
      updated_at: new Date(),
    })
    .where(eq(clinics.id, clinicId))
    .returning();
  
  if (!clinic) {
    throw new Error('Clinic not found');
  }
  
  return clinic;
}

// ============================================
// Validation
// ============================================

/**
 * Validate clinic registration data
 */
export function validateRegistrationData(data: ClinicRegistrationData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Clinic validation
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Clinic name must be at least 3 characters');
  }
  
  if (!data.address || data.address.trim().length < 10) {
    errors.push('Address must be at least 10 characters');
  }
  
  if (!data.phone || !/^\+?[\d\s-]{10,}$/.test(data.phone)) {
    errors.push('Invalid phone number');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid clinic email');
  }
  
  // Owner validation
  if (!data.owner_first_name || data.owner_first_name.trim().length < 2) {
    errors.push('Owner first name must be at least 2 characters');
  }
  
  if (!data.owner_last_name || data.owner_last_name.trim().length < 2) {
    errors.push('Owner last name must be at least 2 characters');
  }
  
  if (!data.owner_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.owner_email)) {
    errors.push('Invalid owner email');
  }
  
  if (!data.owner_phone || !/^\+?[\d\s-]{10,}$/.test(data.owner_phone)) {
    errors.push('Invalid owner phone number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if email already exists
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const [existingClinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.email, email))
    .limit(1);
  
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return !!(existingClinic || existingUser);
}

/**
 * Check if phone already exists
 */
export async function checkPhoneExists(phone: string): Promise<boolean> {
  const [existingClinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.phone, phone))
    .limit(1);
  
  return !!existingClinic;
}
