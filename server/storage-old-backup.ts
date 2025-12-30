import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, or, like, gte, lte, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as schema from '@shared/schema';
import type {
  User,
  InsertUser,
  Clinic,
  InsertClinic,
  Patient,
  InsertPatient,
  Appointment,
  InsertAppointment,
  Consultation,
  InsertConsultation,
  Referral,
  InsertReferral,
  Notification,
  InsertNotification,
} from '@shared/schema';

const SALT_ROUNDS = 10;

// Helper functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(clinicId?: string, role?: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Clinic methods
  getClinic(id: string): Promise<Clinic | undefined>;
  getClinics(): Promise<Clinic[]>;
  createClinic(clinic: InsertClinic): Promise<Clinic>;
  updateClinic(id: string, clinic: Partial<InsertClinic>): Promise<Clinic | undefined>;
  getClinicStats(clinicId: string): Promise<{
    total_patients: number;
    total_appointments: number;
    active_users: number;
  }>;

  // Patient methods
  getPatient(id: string): Promise<Patient | undefined>;
  getPatients(clinicId: string, search?: string): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: string): Promise<boolean>;

  // Appointment methods
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointments(
    clinicId: string,
    filters?: {
      date?: string;
      doctorId?: string;
      patientId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
  checkAppointmentConflict(
    doctorId: string,
    date: string,
    time: string,
    excludeId?: string
  ): Promise<boolean>;

  // Consultation methods
  getConsultation(id: string): Promise<Consultation | undefined>;
  getConsultations(patientId?: string, doctorId?: string): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, consultation: Partial<InsertConsultation>): Promise<Consultation | undefined>;

  // Referral methods
  getReferral(id: string): Promise<Referral | undefined>;
  getReferrals(patientId?: string, status?: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: string, referral: Partial<InsertReferral>): Promise<Referral | undefined>;

  // Notification methods
  getNotifications(userId: string, isRead?: boolean): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<number>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    this.pool = new Pool({ 
      connectionString,
      max: 20, // maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    
    this.db = drizzle(this.pool, { schema });
    
    // Log successful connection
    console.log('✅ Database connection pool initialized');
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return user;
  }

  async getUsers(clinicId?: string, role?: string): Promise<User[]> {
    let query = this.db.select().from(schema.users);

    const conditions = [];
    if (clinicId) {
      conditions.push(eq(schema.users.clinic_id, clinicId));
    }
    if (role) {
      conditions.push(eq(schema.users.role, role as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const [user] = await this.db
      .insert(schema.users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const data = { ...updateData };
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    const [user] = await this.db
      .update(schema.users)
      .set({ ...data, updated_at: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id));
    return true;
  }

  // Clinic methods
  async getClinic(id: string): Promise<Clinic | undefined> {
    const [clinic] = await this.db
      .select()
      .from(schema.clinics)
      .where(eq(schema.clinics.id, id))
      .limit(1);
    return clinic;
  }

  async getClinics(): Promise<Clinic[]> {
    return this.db.select().from(schema.clinics);
  }

  async createClinic(insertClinic: InsertClinic): Promise<Clinic> {
    const [clinic] = await this.db
      .insert(schema.clinics)
      .values(insertClinic)
      .returning();
    return clinic;
  }

  async updateClinic(id: string, updateData: Partial<InsertClinic>): Promise<Clinic | undefined> {
    const [clinic] = await this.db
      .update(schema.clinics)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(schema.clinics.id, id))
      .returning();
    return clinic;
  }

  async getClinicStats(clinicId: string): Promise<{
    total_patients: number;
    total_appointments: number;
    active_users: number;
  }> {
    const [patientsCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.patients)
      .where(eq(schema.patients.clinic_id, clinicId));

    const [appointmentsCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.appointments)
      .where(eq(schema.appointments.clinic_id, clinicId));

    const [usersCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.users)
      .where(and(
        eq(schema.users.clinic_id, clinicId),
        eq(schema.users.status, 'active')
      ));

    return {
      total_patients: patientsCount?.count || 0,
      total_appointments: appointmentsCount?.count || 0,
      active_users: usersCount?.count || 0,
    };
  }

  // Patient methods
  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await this.db
      .select()
      .from(schema.patients)
      .where(eq(schema.patients.id, id))
      .limit(1);
    return patient;
  }

  async getPatients(clinicId: string, search?: string): Promise<Patient[]> {
    const conditions = [eq(schema.patients.clinic_id, clinicId)];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(schema.patients.full_name, searchPattern),
          like(schema.patients.file_number, searchPattern),
          like(schema.patients.phone, searchPattern)
        )!
      );
    }

    return this.db
      .select()
      .from(schema.patients)
      .where(and(...conditions))
      .orderBy(desc(schema.patients.created_at));
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await this.db
      .insert(schema.patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatient(id: string, updateData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [patient] = await this.db
      .update(schema.patients)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(schema.patients.id, id))
      .returning();
    return patient;
  }

  async deletePatient(id: string): Promise<boolean> {
    await this.db
      .delete(schema.patients)
      .where(eq(schema.patients.id, id));
    return true;
  }

  // Appointment methods
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await this.db
      .select()
      .from(schema.appointments)
      .where(eq(schema.appointments.id, id))
      .limit(1);
    return appointment;
  }

  async getAppointments(
    clinicId: string,
    filters?: {
      date?: string;
      doctorId?: string;
      patientId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Appointment[]> {
    const conditions = [eq(schema.appointments.clinic_id, clinicId)];

    if (filters?.date) {
      conditions.push(eq(schema.appointments.appointment_date, filters.date));
    }
    if (filters?.doctorId) {
      conditions.push(eq(schema.appointments.doctor_id, filters.doctorId));
    }
    if (filters?.patientId) {
      conditions.push(eq(schema.appointments.patient_id, filters.patientId));
    }
    if (filters?.startDate) {
      conditions.push(gte(schema.appointments.appointment_date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(schema.appointments.appointment_date, filters.endDate));
    }

    return this.db
      .select()
      .from(schema.appointments)
      .where(and(...conditions))
      .orderBy(schema.appointments.appointment_date, schema.appointments.appointment_time);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await this.db
      .insert(schema.appointments)
      .values(insertAppointment)
      .returning();
    return appointment;
  }

  async updateAppointment(id: string, updateData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await this.db
      .update(schema.appointments)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(schema.appointments.id, id))
      .returning();
    return appointment;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    await this.db
      .delete(schema.appointments)
      .where(eq(schema.appointments.id, id));
    return true;
  }

  async checkAppointmentConflict(
    doctorId: string,
    date: string,
    time: string,
    excludeId?: string
  ): Promise<boolean> {
    const conditions = [
      eq(schema.appointments.doctor_id, doctorId),
      eq(schema.appointments.appointment_date, date),
      eq(schema.appointments.appointment_time, time),
    ];

    if (excludeId) {
      // Exclude the appointment being updated
      conditions.push(sql`${schema.appointments.id} != ${excludeId}`);
    }

    const [existing] = await this.db
      .select()
      .from(schema.appointments)
      .where(and(...conditions))
      .limit(1);

    return !!existing;
  }

  // Consultation methods
  async getConsultation(id: string): Promise<Consultation | undefined> {
    const [consultation] = await this.db
      .select()
      .from(schema.consultations)
      .where(eq(schema.consultations.id, id))
      .limit(1);
    return consultation;
  }

  async getConsultations(patientId?: string, doctorId?: string): Promise<Consultation[]> {
    const conditions = [];

    if (patientId) {
      conditions.push(eq(schema.consultations.patient_id, patientId));
    }
    if (doctorId) {
      conditions.push(eq(schema.consultations.doctor_id, doctorId));
    }

    let query = this.db
      .select()
      .from(schema.consultations)
      .orderBy(desc(schema.consultations.created_at));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query;
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const [consultation] = await this.db
      .insert(schema.consultations)
      .values(insertConsultation)
      .returning();
    return consultation;
  }

  async updateConsultation(id: string, updateData: Partial<InsertConsultation>): Promise<Consultation | undefined> {
    const [consultation] = await this.db
      .update(schema.consultations)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(schema.consultations.id, id))
      .returning();
    return consultation;
  }

  // Referral methods
  async getReferral(id: string): Promise<Referral | undefined> {
    const [referral] = await this.db
      .select()
      .from(schema.referrals)
      .where(eq(schema.referrals.id, id))
      .limit(1);
    return referral;
  }

  async getReferrals(patientId?: string, status?: string): Promise<Referral[]> {
    const conditions = [];

    if (patientId) {
      conditions.push(eq(schema.referrals.patient_id, patientId));
    }
    if (status) {
      conditions.push(eq(schema.referrals.status, status as any));
    }

    let query = this.db
      .select()
      .from(schema.referrals)
      .orderBy(desc(schema.referrals.created_at));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query;
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await this.db
      .insert(schema.referrals)
      .values(insertReferral)
      .returning();
    return referral;
  }

  async updateReferral(id: string, updateData: Partial<InsertReferral>): Promise<Referral | undefined> {
    const [referral] = await this.db
      .update(schema.referrals)
      .set(updateData)
      .where(eq(schema.referrals.id, id))
      .returning();
    return referral;
  }

  // Notification methods
  async getNotifications(userId: string, isRead?: boolean): Promise<Notification[]> {
    const conditions = [eq(schema.notifications.user_id, userId)];

    if (isRead !== undefined) {
      conditions.push(eq(schema.notifications.is_read, isRead));
    }

    return this.db
      .select()
      .from(schema.notifications)
      .where(and(...conditions))
      .orderBy(desc(schema.notifications.created_at));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await this.db
      .insert(schema.notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [notification] = await this.db
      .update(schema.notifications)
      .set({ is_read: true })
      .where(eq(schema.notifications.id, id))
      .returning();
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    const result = await this.db
      .update(schema.notifications)
      .set({ is_read: true })
      .where(and(
        eq(schema.notifications.user_id, userId),
        eq(schema.notifications.is_read, false)
      ))
      .returning();
    
    return result.length;
  }

  // Cleanup method
  async close(): Promise<void> {
    await this.pool.end();
    console.log('✅ Database connection pool closed');
  }
}

// Export storage instance
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : null as any;

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  if (storage) {
    await storage.close();
  }
});

process.on('SIGINT', async () => {
  if (storage) {
    await storage.close();
  }
});
