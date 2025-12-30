import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, pgEnum, integer, date, time, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// Enums (matching Neon database)
// ============================================

export const userRoleEnum = pgEnum('user_role', ['doctor', 'nurse', 'clinic_owner', 'system_admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);
export const registrationMethodEnum = pgEnum('registration_method', ['clinic_owner', 'invited', 'self_registered']);

export const clinicStatusEnum = pgEnum('clinic_status', ['pending', 'active', 'suspended', 'rejected']);

export const genderEnum = pgEnum('gender', ['male', 'female']);

export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']);

export const consultationStatusEnum = pgEnum('consultation_status', ['in-progress', 'completed']);

export const referralStatusEnum = pgEnum('referral_status', ['pending', 'accepted', 'rejected', 'completed']);
export const referralUrgencyEnum = pgEnum('referral_urgency', ['routine', 'urgent', 'emergency']);

export const notificationTypeEnum = pgEnum('notification_type', ['appointment', 'referral', 'follow_up', 'system', 'alert']);

export const communicationTypeEnum = pgEnum('communication_type', ['phone_call', 'whatsapp', 'sms', 'email', 'in_person']);
export const communicationStatusEnum = pgEnum('communication_status', ['successful', 'failed', 'no_answer', 'scheduled']);

export const fileTypeEnum = pgEnum('file_type', ['lab_result', 'radiology', 'prescription', 'report', 'other']);

// ============================================
// Clinics Table
// ============================================

export const clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  status: clinicStatusEnum("status").notNull().default('pending'),
  specialty: text("specialty"),
  license_number: text("license_number"),
  registration_date: timestamp("registration_date").notNull().defaultNow(),
  approved_by: varchar("approved_by"),
  approved_at: timestamp("approved_at"),
  rejection_reason: text("rejection_reason"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_clinics_email").on(table.email),
  index("idx_clinics_status").on(table.status),
]);

// ============================================
// Users Table
// ============================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinic_id: varchar("clinic_id").references(() => clinics.id, { onDelete: 'cascade' }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  full_name: text("full_name").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  phone: text("phone").notNull(),
  role: userRoleEnum("role").notNull().default('doctor'),
  status: userStatusEnum("status").notNull().default('active'),
  specialization: text("specialization"),
  registration_method: registrationMethodEnum("registration_method").notNull().default('clinic_owner'),
  is_first_login: boolean("is_first_login").notNull().default(true),
  last_login_at: timestamp("last_login_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_users_clinic_id").on(table.clinic_id),
  index("idx_users_email").on(table.email),
  index("idx_users_username").on(table.username),
]);

// ============================================
// Patients Table
// ============================================

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinic_id: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  file_number: text("file_number").notNull(),
  full_name: text("full_name").notNull(),
  date_of_birth: date("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  blood_type: text("blood_type"),
  chronic_diseases: jsonb("chronic_diseases"),
  allergies: jsonb("allergies"),
  current_medications: jsonb("current_medications"),
  emergency_contact_name: text("emergency_contact_name"),
  emergency_contact_phone: text("emergency_contact_phone"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_patients_clinic_id").on(table.clinic_id),
  index("idx_patients_file_number").on(table.file_number),
  index("idx_patients_full_name").on(table.full_name),
]);

// ============================================
// Appointments Table
// ============================================

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinic_id: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  patient_id: varchar("patient_id").notNull().references(() => patients.id, { onDelete: 'cascade' }),
  doctor_id: varchar("doctor_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  appointment_date: date("appointment_date").notNull(),
  appointment_time: time("appointment_time").notNull(),
  duration: integer("duration").notNull().default(30),
  status: appointmentStatusEnum("status").notNull().default('scheduled'),
  notes: text("notes"),
  created_by: varchar("created_by").notNull().references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_appointments_clinic_date").on(table.clinic_id, table.appointment_date),
  index("idx_appointments_patient").on(table.patient_id),
  index("idx_appointments_doctor").on(table.doctor_id),
  index("idx_appointments_status").on(table.status),
]);

// ============================================
// Consultations Table
// ============================================

export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointment_id: varchar("appointment_id").references(() => appointments.id, { onDelete: 'cascade' }),
  patient_id: varchar("patient_id").notNull().references(() => patients.id, { onDelete: 'cascade' }),
  doctor_id: varchar("doctor_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  consultation_date: timestamp("consultation_date").notNull().defaultNow(),
  chief_complaint: text("chief_complaint").notNull(),
  examination: text("examination").notNull(),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  prescription: jsonb("prescription"),
  notes: text("notes"),
  follow_up_days: integer("follow_up_days"),
  follow_up_date: date("follow_up_date"),
  status: consultationStatusEnum("status").notNull().default('in-progress'),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_consultations_patient").on(table.patient_id),
  index("idx_consultations_doctor").on(table.doctor_id),
  index("idx_consultations_appointment").on(table.appointment_id),
  index("idx_consultations_status").on(table.status),
]);

// ============================================
// Referrals Table
// ============================================

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patient_id: varchar("patient_id").notNull().references(() => patients.id, { onDelete: 'cascade' }),
  from_doctor_id: varchar("from_doctor_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  to_doctor_id: varchar("to_doctor_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  reason: text("reason").notNull(),
  patient_summary: text("patient_summary").notNull(),
  urgency: referralUrgencyEnum("urgency").notNull().default('routine'),
  status: referralStatusEnum("status").notNull().default('pending'),
  response_notes: text("response_notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  responded_at: timestamp("responded_at"),
}, (table) => [
  index("idx_referrals_patient").on(table.patient_id),
  index("idx_referrals_from_doctor").on(table.from_doctor_id),
  index("idx_referrals_to_doctor").on(table.to_doctor_id),
  index("idx_referrals_status").on(table.status),
]);

// ============================================
// Notifications Table
// ============================================

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  related_id: varchar("related_id"),
  related_type: text("related_type"),
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_notifications_user_unread").on(table.user_id, table.is_read),
  index("idx_notifications_created_at").on(table.created_at),
]);

// ============================================
// Communication Logs Table
// ============================================

export const communicationLogs = pgTable("communication_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patient_id: varchar("patient_id").notNull().references(() => patients.id, { onDelete: 'cascade' }),
  clinic_id: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  user_id: varchar("user_id").notNull().references(() => users.id),
  communication_type: communicationTypeEnum("communication_type").notNull(),
  status: communicationStatusEnum("status").notNull(),
  subject: text("subject"),
  notes: text("notes"),
  scheduled_at: timestamp("scheduled_at"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_communication_logs_patient").on(table.patient_id),
  index("idx_communication_logs_clinic").on(table.clinic_id),
  index("idx_communication_logs_user").on(table.user_id),
  index("idx_communication_logs_created_at").on(table.created_at),
]);

// ============================================
// Patient Files Table
// ============================================

export const patientFiles = pgTable("patient_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patient_id: varchar("patient_id").notNull().references(() => patients.id, { onDelete: 'cascade' }),
  clinic_id: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  consultation_id: varchar("consultation_id").references(() => consultations.id, { onDelete: 'set null' }),
  file_type: fileTypeEnum("file_type").notNull(),
  file_name: text("file_name").notNull(),
  file_url: text("file_url").notNull(),
  file_size: integer("file_size"),
  description: text("description"),
  uploaded_by: varchar("uploaded_by").notNull().references(() => users.id),
  uploaded_at: timestamp("uploaded_at").notNull().defaultNow(),
}, (table) => [
  index("idx_patient_files_patient").on(table.patient_id),
  index("idx_patient_files_clinic").on(table.clinic_id),
  index("idx_patient_files_consultation").on(table.consultation_id),
  index("idx_patient_files_type").on(table.file_type),
]);

// ============================================
// Follow-up Tasks Table
// ============================================

export const followUpTasks = pgTable("follow_up_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patient_id: varchar("patient_id").notNull().references(() => patients.id, { onDelete: 'cascade' }),
  consultation_id: varchar("consultation_id").references(() => consultations.id, { onDelete: 'cascade' }),
  clinic_id: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  doctor_id: varchar("doctor_id").notNull().references(() => users.id),
  due_date: date("due_date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  is_completed: boolean("is_completed").notNull().default(false),
  completed_at: timestamp("completed_at"),
  completed_by: varchar("completed_by").references(() => users.id),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_follow_up_tasks_patient").on(table.patient_id),
  index("idx_follow_up_tasks_clinic").on(table.clinic_id),
  index("idx_follow_up_tasks_doctor").on(table.doctor_id),
  index("idx_follow_up_tasks_due_date").on(table.due_date),
  index("idx_follow_up_tasks_completed").on(table.is_completed),
]);

// ============================================
// Zod Schemas for Validation
// ============================================

export const insertClinicSchema = createInsertSchema(clinics, {
  email: z.string().email(),
  phone: z.string().min(10),
}).omit({ id: true, created_at: true, updated_at: true, registration_date: true });

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(10),
}).omit({ id: true, created_at: true, updated_at: true });

export const insertPatientSchema = createInsertSchema(patients, {
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10),
}).omit({ id: true, created_at: true, updated_at: true });

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true,
  consultation_date: true 
});

export const insertReferralSchema = createInsertSchema(referrals).omit({ 
  id: true, 
  created_at: true,
  responded_at: true 
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  created_at: true 
});

export const insertPatientFileSchema = createInsertSchema(patientFiles).omit({ 
  id: true, 
  uploaded_at: true 
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({ 
  id: true, 
  created_at: true 
});

export const insertFollowUpTaskSchema = createInsertSchema(followUpTasks).omit({ 
  id: true, 
  created_at: true 
});

// ============================================
// TypeScript Types
// ============================================

export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = z.infer<typeof insertClinicSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type PatientFile = typeof patientFiles.$inferSelect;
export type InsertPatientFile = z.infer<typeof insertPatientFileSchema>;

export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;

export type FollowUpTask = typeof followUpTasks.$inferSelect;
export type InsertFollowUpTask = z.infer<typeof insertFollowUpTaskSchema>;
