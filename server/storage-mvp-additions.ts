import { storage } from "./storage";
import { 
  followUpTasks, 
  communicationLogs, 
  patientFiles,
  patients,
  users,
  appointments,
  consultations
} from "@shared/schema";
import { eq, and, lte, gte, desc, sql } from "drizzle-orm";
import type { 
  InsertFollowUpTask, 
  InsertCommunicationLog, 
  InsertPatientFile 
} from "@shared/schema";

// Lazy getter for db to avoid initialization issues
function getDb() {
  const dbExport = (storage as any).db;
  if (!dbExport) {
    throw new Error('Database not initialized. Ensure DATABASE_URL is set.');
  }
  return dbExport;
}

// ============================================
// Follow-up Tasks Functions
// ============================================

export async function createFollowUpTask(data: InsertFollowUpTask) {
  const db = getDb();
  const [task] = await db.insert(followUpTasks).values(data).returning();
  return task;
}

export async function getFollowUpTasks(clinicId: string, filters?: {
  doctorId?: string;
  patientId?: string;
  isCompleted?: boolean;
}) {
  const db = getDb();
  let query = db
    .select({
      task: followUpTasks,
      patient: patients,
      doctor: users,
    })
    .from(followUpTasks)
    .leftJoin(patients, eq(followUpTasks.patient_id, patients.id))
    .leftJoin(users, eq(followUpTasks.doctor_id, users.id))
    .where(eq(followUpTasks.clinic_id, clinicId));

  if (filters?.doctorId) {
    query = query.where(eq(followUpTasks.doctor_id, filters.doctorId));
  }
  
  if (filters?.patientId) {
    query = query.where(eq(followUpTasks.patient_id, filters.patientId));
  }
  
  if (filters?.isCompleted !== undefined) {
    query = query.where(eq(followUpTasks.is_completed, filters.isCompleted));
  }

  return await query.orderBy(desc(followUpTasks.due_date));
}

export async function getDueFollowUpTasks(date: string) {
  const db = getDb();
  return await db
    .select({
      id: followUpTasks.id,
      patient_id: followUpTasks.patient_id,
      doctor_id: followUpTasks.doctor_id,
      due_date: followUpTasks.due_date,
      title: followUpTasks.title,
      patient_name: patients.full_name,
    })
    .from(followUpTasks)
    .leftJoin(patients, eq(followUpTasks.patient_id, patients.id))
    .where(
      and(
        eq(followUpTasks.due_date, date),
        eq(followUpTasks.is_completed, false)
      )
    );
}

export async function getOverdueFollowUpTasks(currentDate: string) {
  const db = getDb();
  return await db
    .select({
      id: followUpTasks.id,
      patient_id: followUpTasks.patient_id,
      doctor_id: followUpTasks.doctor_id,
      due_date: followUpTasks.due_date,
      title: followUpTasks.title,
      patient_name: patients.full_name,
    })
    .from(followUpTasks)
    .leftJoin(patients, eq(followUpTasks.patient_id, patients.id))
    .where(
      and(
        lte(followUpTasks.due_date, currentDate),
        eq(followUpTasks.is_completed, false)
      )
    );
}

export async function completeFollowUpTask(taskId: string, completedBy: string, notes?: string) {
  const db = getDb();
  const [task] = await db
    .update(followUpTasks)
    .set({
      is_completed: true,
      completed_at: new Date(),
      completed_by: completedBy,
      notes: notes,
    })
    .where(eq(followUpTasks.id, taskId))
    .returning();
  
  return task;
}

export async function updateFollowUpTask(taskId: string, data: Partial<InsertFollowUpTask>) {
  const db = getDb();
  const [task] = await db
    .update(followUpTasks)
    .set(data)
    .where(eq(followUpTasks.id, taskId))
    .returning();
  
  return task;
}

export async function deleteFollowUpTask(taskId: string) {
  const db = getDb();
  await db.delete(followUpTasks).where(eq(followUpTasks.id, taskId));
}

// ============================================
// Communication Logs Functions
// ============================================

export async function createCommunicationLog(data: InsertCommunicationLog) {
  const db = getDb();
  const [log] = await db.insert(communicationLogs).values(data).returning();
  return log;
}

export async function getCommunicationLogs(patientId: string) {
  const db = getDb();
  return await db
    .select({
      log: communicationLogs,
      user: {
        id: users.id,
        full_name: users.full_name,
        role: users.role,
      },
    })
    .from(communicationLogs)
    .leftJoin(users, eq(communicationLogs.user_id, users.id))
    .where(eq(communicationLogs.patient_id, patientId))
    .orderBy(desc(communicationLogs.created_at));
}

export async function updateCommunicationLog(logId: string, data: Partial<InsertCommunicationLog>) {
  const db = getDb();
  const [log] = await db
    .update(communicationLogs)
    .set(data)
    .where(eq(communicationLogs.id, logId))
    .returning();
  
  return log;
}

export async function deleteCommunicationLog(logId: string) {
  const db = getDb();
  await db.delete(communicationLogs).where(eq(communicationLogs.id, logId));
}

// ============================================
// Patient Files Functions
// ============================================

export async function createPatientFile(data: InsertPatientFile) {
  const db = getDb();
  const [file] = await db.insert(patientFiles).values(data).returning();
  return file;
}

export async function getPatientFiles(patientId: string, fileType?: string) {
  const db = getDb();
  let query = db
    .select({
      file: patientFiles,
      uploaded_by_user: {
        id: users.id,
        full_name: users.full_name,
      },
    })
    .from(patientFiles)
    .leftJoin(users, eq(patientFiles.uploaded_by, users.id))
    .where(eq(patientFiles.patient_id, patientId));

  if (fileType) {
    query = query.where(eq(patientFiles.file_type, fileType as any));
  }

  return await query.orderBy(desc(patientFiles.uploaded_at));
}

export async function getPatientFile(fileId: string) {
  const db = getDb();
  const [file] = await db
    .select()
    .from(patientFiles)
    .where(eq(patientFiles.id, fileId));
  
  return file;
}

export async function deletePatientFile(fileId: string) {
  const db = getDb();
  await db.delete(patientFiles).where(eq(patientFiles.id, fileId));
}

// ============================================
// Appointment Reminders Functions
// ============================================

export async function getUpcomingAppointments(hoursAhead: number) {
  const db = getDb();
  const now = new Date();
  const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  
  return await db
    .select({
      id: appointments.id,
      doctor_id: appointments.doctor_id,
      patient_id: appointments.patient_id,
      appointment_date: appointments.appointment_date,
      appointment_time: appointments.appointment_time,
      patient_name: patients.full_name,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patient_id, patients.id))
    .where(
      and(
        eq(appointments.appointment_date, now.toISOString().split('T')[0]),
        gte(appointments.appointment_time, now.toTimeString().split(' ')[0]),
        lte(appointments.appointment_time, futureTime.toTimeString().split(' ')[0]),
        eq(appointments.status, 'scheduled')
      )
    );
}

// ============================================
// Enhanced Patient Profile Functions
// ============================================

export async function getPatientFullProfile(patientId: string) {
  const db = getDb();
  
  // Get patient basic info
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId));
  
  if (!patient) {
    return null;
  }
  
  // Get recent consultations
  const recentConsultations = await db
    .select({
      consultation: consultations,
      doctor: {
        id: users.id,
        full_name: users.full_name,
        specialization: users.specialization,
      },
    })
    .from(consultations)
    .leftJoin(users, eq(consultations.doctor_id, users.id))
    .where(eq(consultations.patient_id, patientId))
    .orderBy(desc(consultations.consultation_date))
    .limit(10);
  
  // Get upcoming appointments
  const upcomingAppointments = await db
    .select({
      appointment: appointments,
      doctor: {
        id: users.id,
        full_name: users.full_name,
      },
    })
    .from(appointments)
    .leftJoin(users, eq(appointments.doctor_id, users.id))
    .where(
      and(
        eq(appointments.patient_id, patientId),
        gte(appointments.appointment_date, new Date().toISOString().split('T')[0])
      )
    )
    .orderBy(appointments.appointment_date);
  
  // Get pending follow-ups
  const pendingFollowUps = await db
    .select()
    .from(followUpTasks)
    .where(
      and(
        eq(followUpTasks.patient_id, patientId),
        eq(followUpTasks.is_completed, false)
      )
    )
    .orderBy(followUpTasks.due_date);
  
  // Get recent files
  const recentFiles = await db
    .select()
    .from(patientFiles)
    .where(eq(patientFiles.patient_id, patientId))
    .orderBy(desc(patientFiles.uploaded_at))
    .limit(5);
  
  // Get communication history
  const communicationHistory = await db
    .select({
      log: communicationLogs,
      user: {
        id: users.id,
        full_name: users.full_name,
      },
    })
    .from(communicationLogs)
    .leftJoin(users, eq(communicationLogs.user_id, users.id))
    .where(eq(communicationLogs.patient_id, patientId))
    .orderBy(desc(communicationLogs.created_at))
    .limit(10);
  
  return {
    patient,
    recent_consultations: recentConsultations,
    upcoming_appointments: upcomingAppointments,
    pending_follow_ups: pendingFollowUps,
    recent_files: recentFiles,
    communication_history: communicationHistory,
  };
}

// ============================================
// Dashboard Statistics Functions
// ============================================

export async function getDoctorDashboardStats(doctorId: string) {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  
  // Today's appointments count
  const [todayAppointments] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctor_id, doctorId),
        eq(appointments.appointment_date, today)
      )
    );
  
  // Pending follow-ups count
  const [pendingFollowUps] = await db
    .select({ count: sql<number>`count(*)` })
    .from(followUpTasks)
    .where(
      and(
        eq(followUpTasks.doctor_id, doctorId),
        eq(followUpTasks.is_completed, false),
        lte(followUpTasks.due_date, today)
      )
    );
  
  // Pending referrals count
  const [pendingReferrals] = await db
    .select({ count: sql<number>`count(*)` })
    .from(followUpTasks)
    .where(
      and(
        eq(followUpTasks.doctor_id, doctorId),
        eq(followUpTasks.is_completed, false)
      )
    );
  
  // Total patients count
  const [totalPatients] = await db
    .select({ count: sql<number>`count(distinct ${patients.id})` })
    .from(consultations)
    .leftJoin(patients, eq(consultations.patient_id, patients.id))
    .where(eq(consultations.doctor_id, doctorId));
  
  return {
    today_appointments: todayAppointments?.count || 0,
    pending_follow_ups: pendingFollowUps?.count || 0,
    pending_referrals: pendingReferrals?.count || 0,
    total_patients: totalPatients?.count || 0,
  };
}
