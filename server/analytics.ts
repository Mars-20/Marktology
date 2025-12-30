import { db } from "./storage";
import { 
  clinics,
  users,
  patients,
  appointments,
  consultations,
  followUpTasks,
  communicationLogs,
  referrals
} from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

/**
 * Analytics Service
 * Provides comprehensive analytics and reporting functionality
 */

// ============================================
// Clinic Analytics
// ============================================

export async function getClinicAnalytics(clinicId: string, startDate: string, endDate: string) {
  // Total patients
  const [totalPatients] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(patients)
    .where(eq(patients.clinic_id, clinicId));

  // New patients in period
  const [newPatients] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(patients)
    .where(and(
      eq(patients.clinic_id, clinicId),
      gte(patients.created_at, new Date(startDate)),
      lte(patients.created_at, new Date(endDate))
    ));

  // Total appointments
  const [totalAppointments] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(and(
      eq(appointments.clinic_id, clinicId),
      gte(appointments.appointment_date, startDate),
      lte(appointments.appointment_date, endDate)
    ));

  // Appointments by status
  const appointmentsByStatus = await db
    .select({
      status: appointments.status,
      count: sql<number>`count(*)::int`
    })
    .from(appointments)
    .where(and(
      eq(appointments.clinic_id, clinicId),
      gte(appointments.appointment_date, startDate),
      lte(appointments.appointment_date, endDate)
    ))
    .groupBy(appointments.status);

  // Total consultations
  const [totalConsultations] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(consultations)
    .innerJoin(patients, eq(consultations.patient_id, patients.id))
    .where(and(
      eq(patients.clinic_id, clinicId),
      gte(consultations.consultation_date, new Date(startDate)),
      lte(consultations.consultation_date, new Date(endDate))
    ));

  // Follow-up completion rate
  const [totalFollowUps] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(followUpTasks)
    .where(and(
      eq(followUpTasks.clinic_id, clinicId),
      gte(followUpTasks.created_at, new Date(startDate)),
      lte(followUpTasks.created_at, new Date(endDate))
    ));

  const [completedFollowUps] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(followUpTasks)
    .where(and(
      eq(followUpTasks.clinic_id, clinicId),
      eq(followUpTasks.is_completed, true),
      gte(followUpTasks.created_at, new Date(startDate)),
      lte(followUpTasks.created_at, new Date(endDate))
    ));

  const followUpCompletionRate = totalFollowUps.count > 0 
    ? (completedFollowUps.count / totalFollowUps.count) * 100 
    : 0;

  // Communication logs by type
  const communicationsByType = await db
    .select({
      type: communicationLogs.communication_type,
      count: sql<number>`count(*)::int`
    })
    .from(communicationLogs)
    .where(and(
      eq(communicationLogs.clinic_id, clinicId),
      gte(communicationLogs.created_at, new Date(startDate)),
      lte(communicationLogs.created_at, new Date(endDate))
    ))
    .groupBy(communicationLogs.communication_type);

  // Communication success rate
  const [totalCommunications] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(communicationLogs)
    .where(and(
      eq(communicationLogs.clinic_id, clinicId),
      gte(communicationLogs.created_at, new Date(startDate)),
      lte(communicationLogs.created_at, new Date(endDate))
    ));

  const [successfulCommunications] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(communicationLogs)
    .where(and(
      eq(communicationLogs.clinic_id, clinicId),
      eq(communicationLogs.status, 'successful'),
      gte(communicationLogs.created_at, new Date(startDate)),
      lte(communicationLogs.created_at, new Date(endDate))
    ));

  const communicationSuccessRate = totalCommunications.count > 0
    ? (successfulCommunications.count / totalCommunications.count) * 100
    : 0;

  return {
    overview: {
      total_patients: totalPatients.count || 0,
      new_patients: newPatients.count || 0,
      total_appointments: totalAppointments.count || 0,
      total_consultations: totalConsultations.count || 0,
    },
    appointments: {
      by_status: appointmentsByStatus,
      total: totalAppointments.count || 0,
    },
    follow_ups: {
      total: totalFollowUps.count || 0,
      completed: completedFollowUps.count || 0,
      completion_rate: Math.round(followUpCompletionRate * 100) / 100,
    },
    communications: {
      by_type: communicationsByType,
      total: totalCommunications.count || 0,
      successful: successfulCommunications.count || 0,
      success_rate: Math.round(communicationSuccessRate * 100) / 100,
    },
  };
}

// ============================================
// Doctor Performance Analytics
// ============================================

export async function getDoctorPerformance(doctorId: string, startDate: string, endDate: string) {
  // Total appointments
  const [totalAppointments] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(and(
      eq(appointments.doctor_id, doctorId),
      gte(appointments.appointment_date, startDate),
      lte(appointments.appointment_date, endDate)
    ));

  // Completed appointments
  const [completedAppointments] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(and(
      eq(appointments.doctor_id, doctorId),
      eq(appointments.status, 'completed'),
      gte(appointments.appointment_date, startDate),
      lte(appointments.appointment_date, endDate)
    ));

  // Total consultations
  const [totalConsultations] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(consultations)
    .where(and(
      eq(consultations.doctor_id, doctorId),
      gte(consultations.consultation_date, new Date(startDate)),
      lte(consultations.consultation_date, new Date(endDate))
    ));

  // Unique patients
  const [uniquePatients] = await db
    .select({ count: sql<number>`count(distinct ${consultations.patient_id})::int` })
    .from(consultations)
    .where(and(
      eq(consultations.doctor_id, doctorId),
      gte(consultations.consultation_date, new Date(startDate)),
      lte(consultations.consultation_date, new Date(endDate))
    ));

  // Follow-ups created
  const [followUpsCreated] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(followUpTasks)
    .where(and(
      eq(followUpTasks.doctor_id, doctorId),
      gte(followUpTasks.created_at, new Date(startDate)),
      lte(followUpTasks.created_at, new Date(endDate))
    ));

  // Referrals made
  const [referralsMade] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(referrals)
    .where(and(
      eq(referrals.from_doctor_id, doctorId),
      gte(referrals.created_at, new Date(startDate)),
      lte(referrals.created_at, new Date(endDate))
    ));

  // Referrals received
  const [referralsReceived] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(referrals)
    .where(and(
      eq(referrals.to_doctor_id, doctorId),
      gte(referrals.created_at, new Date(startDate)),
      lte(referrals.created_at, new Date(endDate))
    ));

  return {
    appointments: {
      total: totalAppointments.count || 0,
      completed: completedAppointments.count || 0,
      completion_rate: totalAppointments.count > 0 
        ? Math.round((completedAppointments.count / totalAppointments.count) * 100 * 100) / 100
        : 0,
    },
    consultations: {
      total: totalConsultations.count || 0,
      unique_patients: uniquePatients.count || 0,
    },
    follow_ups: {
      created: followUpsCreated.count || 0,
    },
    referrals: {
      made: referralsMade.count || 0,
      received: referralsReceived.count || 0,
    },
  };
}

// ============================================
// Time-based Analytics
// ============================================

export async function getDailyAppointments(clinicId: string, startDate: string, endDate: string) {
  const dailyAppointments = await db
    .select({
      date: appointments.appointment_date,
      count: sql<number>`count(*)::int`
    })
    .from(appointments)
    .where(and(
      eq(appointments.clinic_id, clinicId),
      gte(appointments.appointment_date, startDate),
      lte(appointments.appointment_date, endDate)
    ))
    .groupBy(appointments.appointment_date)
    .orderBy(appointments.appointment_date);

  return dailyAppointments;
}

export async function getWeeklyConsultations(clinicId: string, startDate: string, endDate: string) {
  const weeklyConsultations = await db
    .select({
      week: sql<string>`to_char(${consultations.consultation_date}, 'IYYY-IW')`,
      count: sql<number>`count(*)::int`
    })
    .from(consultations)
    .innerJoin(patients, eq(consultations.patient_id, patients.id))
    .where(and(
      eq(patients.clinic_id, clinicId),
      gte(consultations.consultation_date, new Date(startDate)),
      lte(consultations.consultation_date, new Date(endDate))
    ))
    .groupBy(sql`to_char(${consultations.consultation_date}, 'IYYY-IW')`)
    .orderBy(sql`to_char(${consultations.consultation_date}, 'IYYY-IW')`);

  return weeklyConsultations;
}

export async function getMonthlyPatients(clinicId: string, startDate: string, endDate: string) {
  const monthlyPatients = await db
    .select({
      month: sql<string>`to_char(${patients.created_at}, 'YYYY-MM')`,
      count: sql<number>`count(*)::int`
    })
    .from(patients)
    .where(and(
      eq(patients.clinic_id, clinicId),
      gte(patients.created_at, new Date(startDate)),
      lte(patients.created_at, new Date(endDate))
    ))
    .groupBy(sql`to_char(${patients.created_at}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${patients.created_at}, 'YYYY-MM')`);

  return monthlyPatients;
}

// ============================================
// Patient Analytics
// ============================================

export async function getPatientDemographics(clinicId: string) {
  // Gender distribution
  const genderDistribution = await db
    .select({
      gender: patients.gender,
      count: sql<number>`count(*)::int`
    })
    .from(patients)
    .where(eq(patients.clinic_id, clinicId))
    .groupBy(patients.gender);

  // Age groups (calculated from date_of_birth)
  const ageGroups = await db
    .select({
      age_group: sql<string>`
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(${patients.date_of_birth})) < 18 THEN '0-17'
          WHEN EXTRACT(YEAR FROM AGE(${patients.date_of_birth})) BETWEEN 18 AND 30 THEN '18-30'
          WHEN EXTRACT(YEAR FROM AGE(${patients.date_of_birth})) BETWEEN 31 AND 50 THEN '31-50'
          WHEN EXTRACT(YEAR FROM AGE(${patients.date_of_birth})) BETWEEN 51 AND 70 THEN '51-70'
          ELSE '70+'
        END
      `,
      count: sql<number>`count(*)::int`
    })
    .from(patients)
    .where(eq(patients.clinic_id, clinicId))
    .groupBy(sql`
      CASE 
        WHEN EXTRACT(YEAR FROM AGE(${patients.date_of_birth})) < 18 THEN '0-17'
        WHEN EXTRACT(YEAR FROM AGE(${patients.date_of_birth})) BETWEEN 18 AND 30 THEN '18-30'
        WHEN EXTRACT(YEAR FROM AGE(${patients.date_of_birth})) BETWEEN 31 AND 50 THEN '31-50'
        WHEN EXTRACT(YEAR FROM AGE(${patients.date_of_birth})) BETWEEN 51 AND 70 THEN '51-70'
        ELSE '70+'
      END
    `);

  return {
    gender: genderDistribution,
    age_groups: ageGroups,
  };
}

// ============================================
// Top Performers
// ============================================

export async function getTopDoctors(clinicId: string, startDate: string, endDate: string, limit: number = 10) {
  const topDoctors = await db
    .select({
      doctor_id: consultations.doctor_id,
      doctor_name: users.full_name,
      consultation_count: sql<number>`count(*)::int`
    })
    .from(consultations)
    .innerJoin(users, eq(consultations.doctor_id, users.id))
    .innerJoin(patients, eq(consultations.patient_id, patients.id))
    .where(and(
      eq(patients.clinic_id, clinicId),
      gte(consultations.consultation_date, new Date(startDate)),
      lte(consultations.consultation_date, new Date(endDate))
    ))
    .groupBy(consultations.doctor_id, users.full_name)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return topDoctors;
}

export async function getMostActivePatients(clinicId: string, startDate: string, endDate: string, limit: number = 10) {
  const activePatients = await db
    .select({
      patient_id: consultations.patient_id,
      patient_name: patients.full_name,
      visit_count: sql<number>`count(*)::int`
    })
    .from(consultations)
    .innerJoin(patients, eq(consultations.patient_id, patients.id))
    .where(and(
      eq(patients.clinic_id, clinicId),
      gte(consultations.consultation_date, new Date(startDate)),
      lte(consultations.consultation_date, new Date(endDate))
    ))
    .groupBy(consultations.patient_id, patients.full_name)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return activePatients;
}

// ============================================
// System-wide Analytics (Admin)
// ============================================

export async function getSystemAnalytics(startDate: string, endDate: string) {
  // Total clinics
  const [totalClinics] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clinics);

  // Active clinics
  const [activeClinics] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clinics)
    .where(eq(clinics.status, 'active'));

  // Total users
  const [totalUsers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  // Active users
  const [activeUsers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.status, 'active'));

  // Total patients
  const [totalPatients] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(patients);

  // New patients in period
  const [newPatients] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(patients)
    .where(and(
      gte(patients.created_at, new Date(startDate)),
      lte(patients.created_at, new Date(endDate))
    ));

  // Total appointments in period
  const [totalAppointments] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(and(
      gte(appointments.appointment_date, startDate),
      lte(appointments.appointment_date, endDate)
    ));

  // Total consultations in period
  const [totalConsultations] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(consultations)
    .where(and(
      gte(consultations.consultation_date, new Date(startDate)),
      lte(consultations.consultation_date, new Date(endDate))
    ));

  // Clinics by status
  const clinicsByStatus = await db
    .select({
      status: clinics.status,
      count: sql<number>`count(*)::int`
    })
    .from(clinics)
    .groupBy(clinics.status);

  // Users by role
  const usersByRole = await db
    .select({
      role: users.role,
      count: sql<number>`count(*)::int`
    })
    .from(users)
    .groupBy(users.role);

  return {
    overview: {
      total_clinics: totalClinics.count || 0,
      active_clinics: activeClinics.count || 0,
      total_users: totalUsers.count || 0,
      active_users: activeUsers.count || 0,
      total_patients: totalPatients.count || 0,
      new_patients: newPatients.count || 0,
      total_appointments: totalAppointments.count || 0,
      total_consultations: totalConsultations.count || 0,
    },
    clinics: {
      by_status: clinicsByStatus,
    },
    users: {
      by_role: usersByRole,
    },
  };
}

export async function getClinicGrowth(startDate: string, endDate: string) {
  const clinicGrowth = await db
    .select({
      month: sql<string>`to_char(${clinics.registration_date}, 'YYYY-MM')`,
      count: sql<number>`count(*)::int`
    })
    .from(clinics)
    .where(and(
      gte(clinics.registration_date, new Date(startDate)),
      lte(clinics.registration_date, new Date(endDate))
    ))
    .groupBy(sql`to_char(${clinics.registration_date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${clinics.registration_date}, 'YYYY-MM')`);

  return clinicGrowth;
}
