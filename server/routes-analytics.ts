import type { Express } from "express";
import { requireAuth, requireRole } from "./middleware";
import { asyncHandler, AppError } from "./errorHandler";
import * as analytics from "./analytics";

/**
 * Analytics & Reports Routes
 * Comprehensive analytics and reporting endpoints
 */
export function registerAnalyticsRoutes(app: Express) {
  
  // ============================================
  // Clinic Analytics
  // ============================================
  
  // Get clinic analytics
  app.get('/api/analytics/clinic/:clinicId', requireAuth, asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getClinicAnalytics(
      clinicId,
      start_date as string,
      end_date as string
    );
    
    res.json(data);
  }));
  
  // Get daily appointments
  app.get('/api/analytics/clinic/:clinicId/daily-appointments', requireAuth, asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getDailyAppointments(
      clinicId,
      start_date as string,
      end_date as string
    );
    
    res.json({ data });
  }));
  
  // Get weekly consultations
  app.get('/api/analytics/clinic/:clinicId/weekly-consultations', requireAuth, asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getWeeklyConsultations(
      clinicId,
      start_date as string,
      end_date as string
    );
    
    res.json({ data });
  }));
  
  // Get monthly patients
  app.get('/api/analytics/clinic/:clinicId/monthly-patients', requireAuth, asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getMonthlyPatients(
      clinicId,
      start_date as string,
      end_date as string
    );
    
    res.json({ data });
  }));
  
  // Get patient demographics
  app.get('/api/analytics/clinic/:clinicId/demographics', requireAuth, asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    
    const data = await analytics.getPatientDemographics(clinicId);
    
    res.json(data);
  }));
  
  // Get top doctors
  app.get('/api/analytics/clinic/:clinicId/top-doctors', requireAuth, asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { start_date, end_date, limit } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getTopDoctors(
      clinicId,
      start_date as string,
      end_date as string,
      limit ? parseInt(limit as string) : 10
    );
    
    res.json({ data });
  }));
  
  // Get most active patients
  app.get('/api/analytics/clinic/:clinicId/active-patients', requireAuth, asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { start_date, end_date, limit } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getMostActivePatients(
      clinicId,
      start_date as string,
      end_date as string,
      limit ? parseInt(limit as string) : 10
    );
    
    res.json({ data });
  }));
  
  // ============================================
  // Doctor Performance Analytics
  // ============================================
  
  // Get doctor performance
  app.get('/api/analytics/doctor/:doctorId', requireAuth, asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getDoctorPerformance(
      doctorId,
      start_date as string,
      end_date as string
    );
    
    res.json(data);
  }));
  
  // ============================================
  // System-wide Analytics (Admin Only)
  // ============================================
  
  // Get system analytics
  app.get('/api/analytics/system', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getSystemAnalytics(
      start_date as string,
      end_date as string
    );
    
    res.json(data);
  }));
  
  // Get clinic growth
  app.get('/api/analytics/system/clinic-growth', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getClinicGrowth(
      start_date as string,
      end_date as string
    );
    
    res.json({ data });
  }));
  
  // ============================================
  // Export Reports
  // ============================================
  
  // Export clinic report (CSV format)
  app.get('/api/analytics/clinic/:clinicId/export', requireAuth, asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError(400, 'start_date and end_date are required');
    }
    
    const data = await analytics.getClinicAnalytics(
      clinicId,
      start_date as string,
      end_date as string
    );
    
    // Convert to CSV format
    const csv = convertToCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=clinic-report-${clinicId}-${start_date}-${end_date}.csv`);
    res.send(csv);
  }));
  
  console.log('[Analytics Routes] Analytics routes registered successfully');
}

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  const lines: string[] = [];
  
  // Overview section
  lines.push('OVERVIEW');
  lines.push('Metric,Value');
  lines.push(`Total Patients,${data.overview.total_patients}`);
  lines.push(`New Patients,${data.overview.new_patients}`);
  lines.push(`Total Appointments,${data.overview.total_appointments}`);
  lines.push(`Total Consultations,${data.overview.total_consultations}`);
  lines.push('');
  
  // Appointments by status
  lines.push('APPOINTMENTS BY STATUS');
  lines.push('Status,Count');
  data.appointments.by_status.forEach((item: any) => {
    lines.push(`${item.status},${item.count}`);
  });
  lines.push('');
  
  // Follow-ups
  lines.push('FOLLOW-UPS');
  lines.push('Metric,Value');
  lines.push(`Total,${data.follow_ups.total}`);
  lines.push(`Completed,${data.follow_ups.completed}`);
  lines.push(`Completion Rate,${data.follow_ups.completion_rate}%`);
  lines.push('');
  
  // Communications
  lines.push('COMMUNICATIONS');
  lines.push('Type,Count');
  data.communications.by_type.forEach((item: any) => {
    lines.push(`${item.type},${item.count}`);
  });
  lines.push('');
  lines.push(`Total Communications,${data.communications.total}`);
  lines.push(`Successful,${data.communications.successful}`);
  lines.push(`Success Rate,${data.communications.success_rate}%`);
  
  return lines.join('\n');
}
