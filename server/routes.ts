import type { Express } from "express";
import { type Server } from "http";
import passport from "./auth";
import { storage } from "./storage";
import { requireAuth, requireRole, loginLimiter } from "./middleware";
import { asyncHandler, AppError } from "./errorHandler";
import { generateFileNumber } from "./utils/generators";
import {
  insertUserSchema,
  insertClinicSchema,
  insertPatientSchema,
  insertAppointmentSchema,
  insertConsultationSchema,
  insertReferralSchema,
  insertPatientFileSchema,
  insertCommunicationLogSchema,
  insertFollowUpTaskSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============================================
  // Health Check Endpoint
  // ============================================
  
  app.get('/health', asyncHandler(async (req, res) => {
    try {
      // Check database connection
      await storage.getClinics();
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }));
  
  // ============================================
  // Authentication Routes
  // ============================================
  
  // Login (with rate limiting)
  app.post('/api/auth/login', loginLimiter, (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Remove password from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  // Logout
  app.post('/api/auth/logout', requireAuth, (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Get current user
  app.get('/api/auth/me', requireAuth, (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });

  // ============================================
  // User Management Routes
  // ============================================
  
  // List users
  app.get('/api/users', requireAuth, asyncHandler(async (req, res) => {
    const { clinic_id, role } = req.query;
    const users = await storage.getUsers(
      clinic_id as string | undefined,
      role as string | undefined
    );
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map((user: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json({ users: usersWithoutPasswords });
  }));

  // Get user by ID
  app.get('/api/users/:id', requireAuth, asyncHandler(async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  }));

  // Create user
  app.post('/api/users', requireAuth, requireRole('system_admin', 'clinic_owner'), asyncHandler(async (req, res) => {
    const validatedData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(validatedData);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
  }));

  // Update user
  app.patch('/api/users/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertUserSchema.partial().parse(req.body);
    const user = await storage.updateUser(req.params.id, validatedData);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  }));

  // Delete user
  app.delete('/api/users/:id', requireAuth, requireRole('system_admin', 'clinic_owner'), asyncHandler(async (req, res) => {
    await storage.deleteUser(req.params.id);
    res.json({ success: true });
  }));

  // ============================================
  // Clinic Management Routes
  // ============================================
  
  // List clinics (system admin only)
  app.get('/api/clinics', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const clinics = await storage.getClinics();
    res.json({ clinics });
  }));

  // Get clinic by ID
  app.get('/api/clinics/:id', requireAuth, asyncHandler(async (req, res) => {
    const clinic = await storage.getClinic(req.params.id);
    if (!clinic) {
      throw new AppError(404, 'Clinic not found');
    }
    res.json({ clinic });
  }));

  // Register new clinic
  app.post('/api/clinics', asyncHandler(async (req, res) => {
    const { owner_info, ...clinicData } = req.body;
    
    // Validate clinic data
    const validatedClinicData = insertClinicSchema.parse(clinicData);
    
    // Create clinic
    const clinic = await storage.createClinic(validatedClinicData);
    
    // Create owner user if provided
    let owner = null;
    if (owner_info) {
      const ownerData = insertUserSchema.parse({
        ...owner_info,
        role: 'clinic_owner',
        clinic_id: clinic.id,
      });
      owner = await storage.createUser(ownerData);
    }
    
    res.status(201).json({ 
      clinic, 
      owner: owner ? { ...owner, password: undefined } : null
    });
  }));

  // Update clinic
  app.patch('/api/clinics/:id', requireAuth, requireRole('system_admin', 'clinic_owner'), asyncHandler(async (req, res) => {
    const validatedData = insertClinicSchema.partial().parse(req.body);
    const clinic = await storage.updateClinic(req.params.id, validatedData);
    
    if (!clinic) {
      throw new AppError(404, 'Clinic not found');
    }
    
    res.json({ clinic });
  }));

  // Get clinic statistics
  app.get('/api/clinics/:id/stats', requireAuth, asyncHandler(async (req, res) => {
    const stats = await storage.getClinicStats(req.params.id);
    res.json(stats);
  }));

  // ============================================
  // Patient Management Routes
  // ============================================
  
  // List patients
  app.get('/api/patients', requireAuth, asyncHandler(async (req, res) => {
    const { clinic_id, search } = req.query;
    
    if (!clinic_id) {
      throw new AppError(400, 'clinic_id is required');
    }
    
    const patients = await storage.getPatients(
      clinic_id as string,
      search as string | undefined
    );
    
    res.json({ patients });
  }));

  // Get patient by ID
  app.get('/api/patients/:id', requireAuth, asyncHandler(async (req, res) => {
    const patient = await storage.getPatient(req.params.id);
    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }
    
    // Get recent appointments and consultations
    const appointments = await storage.getAppointments(patient.clinic_id, { patientId: patient.id });
    const consultations = await storage.getConsultations(patient.id);
    
    res.json({ 
      patient,
      recent_appointments: appointments.slice(0, 5),
      recent_consultations: consultations.slice(0, 5)
    });
  }));

  // Create patient
  app.post('/api/patients', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertPatientSchema.parse(req.body);
    
    // Generate file_number if not provided
    if (!validatedData.file_number) {
      validatedData.file_number = generateFileNumber();
    }
    
    const patient = await storage.createPatient(validatedData);
    res.status(201).json({ patient });
  }));

  // Update patient
  app.patch('/api/patients/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertPatientSchema.partial().parse(req.body);
    const patient = await storage.updatePatient(req.params.id, validatedData);
    
    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }
    
    res.json({ patient });
  }));

  // Delete patient
  app.delete('/api/patients/:id', requireAuth, asyncHandler(async (req, res) => {
    await storage.deletePatient(req.params.id);
    res.json({ success: true });
  }));

  // ============================================
  // Appointment Management Routes
  // ============================================
  
  // List appointments
  app.get('/api/appointments', requireAuth, asyncHandler(async (req, res) => {
    const { clinic_id, date, doctor_id, patient_id, start_date, end_date } = req.query;
    
    if (!clinic_id) {
      throw new AppError(400, 'clinic_id is required');
    }
    
    const appointments = await storage.getAppointments(clinic_id as string, {
      date: date as string | undefined,
      doctorId: doctor_id as string | undefined,
      patientId: patient_id as string | undefined,
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
    });
    
    res.json({ appointments });
  }));

  // Get appointment by ID
  app.get('/api/appointments/:id', requireAuth, asyncHandler(async (req, res) => {
    const appointment = await storage.getAppointment(req.params.id);
    if (!appointment) {
      throw new AppError(404, 'Appointment not found');
    }
    res.json({ appointment });
  }));

  // Create appointment
  app.post('/api/appointments', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertAppointmentSchema.parse(req.body);
    
    // Check for conflicts
    const hasConflict = await storage.checkAppointmentConflict(
      validatedData.doctor_id,
      validatedData.appointment_date,
      validatedData.appointment_time
    );
    
    if (hasConflict) {
      throw new AppError(409, 'Appointment time conflict');
    }
    
    const appointment = await storage.createAppointment(validatedData);
    res.status(201).json({ appointment });
  }));

  // Update appointment
  app.patch('/api/appointments/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertAppointmentSchema.partial().parse(req.body);
    const appointment = await storage.updateAppointment(req.params.id, validatedData);
    
    if (!appointment) {
      throw new AppError(404, 'Appointment not found');
    }
    
    res.json({ appointment });
  }));

  // Delete appointment
  app.delete('/api/appointments/:id', requireAuth, asyncHandler(async (req, res) => {
    await storage.deleteAppointment(req.params.id);
    res.json({ success: true });
  }));

  // Start consultation
  app.post('/api/appointments/:id/start', requireAuth, asyncHandler(async (req, res) => {
    const appointment = await storage.getAppointment(req.params.id);
    if (!appointment) {
      throw new AppError(404, 'Appointment not found');
    }
    
    // Update appointment status
    const updatedAppointment = await storage.updateAppointment(req.params.id, {
      status: 'in_progress'
    });
    
    // Create consultation
    const consultation = await storage.createConsultation({
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      chief_complaint: '',
      examination: '',
      diagnosis: '',
      treatment: '',
      prescription: null,
      notes: '',
      status: 'in-progress'
    });
    
    res.json({ appointment: updatedAppointment, consultation });
  }));

  // Complete appointment
  app.post('/api/appointments/:id/complete', requireAuth, asyncHandler(async (req, res) => {
    const appointment = await storage.updateAppointment(req.params.id, {
      status: 'completed'
    });
    
    if (!appointment) {
      throw new AppError(404, 'Appointment not found');
    }
    
    res.json({ appointment });
  }));

  // ============================================
  // Consultation Management Routes
  // ============================================
  
  // List consultations
  app.get('/api/consultations', requireAuth, asyncHandler(async (req, res) => {
    const { patient_id, doctor_id } = req.query;
    
    const consultations = await storage.getConsultations(
      patient_id as string | undefined,
      doctor_id as string | undefined
    );
    
    res.json({ consultations });
  }));

  // Get consultation by ID
  app.get('/api/consultations/:id', requireAuth, asyncHandler(async (req, res) => {
    const consultation = await storage.getConsultation(req.params.id);
    if (!consultation) {
      throw new AppError(404, 'Consultation not found');
    }
    res.json({ consultation });
  }));

  // Create consultation
  app.post('/api/consultations', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertConsultationSchema.parse(req.body);
    const consultation = await storage.createConsultation(validatedData);
    res.status(201).json({ consultation });
  }));

  // Update consultation
  app.patch('/api/consultations/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertConsultationSchema.partial().parse(req.body);
    const consultation = await storage.updateConsultation(req.params.id, validatedData);
    
    if (!consultation) {
      throw new AppError(404, 'Consultation not found');
    }

    // If consultation is completed and has follow-up date, create follow-up task
    if (validatedData.status === 'completed' && consultation.follow_up_date) {
      const patient = await storage.getPatient(consultation.patient_id);
      
      if (patient) {
        await storage.createFollowUpTask({
          patient_id: consultation.patient_id,
          consultation_id: consultation.id,
          clinic_id: patient.clinic_id,
          doctor_id: consultation.doctor_id,
          due_date: consultation.follow_up_date,
          title: `متابعة ${patient.full_name}`,
          description: `متابعة بعد ${consultation.follow_up_days} يوم من الكشف`,
          is_completed: false,
        });

        // Create notification for doctor
        await storage.createNotification({
          user_id: consultation.doctor_id,
          type: 'follow_up',
          title: 'تم جدولة متابعة جديدة',
          message: `تم جدولة متابعة للمريض ${patient.full_name} في ${consultation.follow_up_date}`,
          related_id: consultation.id,
          related_type: 'consultation',
          is_read: false,
        });
      }
    }
    
    res.json({ consultation });
  }));

  // ============================================
  // Referral Management Routes
  // ============================================
  
  // List referrals
  app.get('/api/referrals', requireAuth, asyncHandler(async (req, res) => {
    const { patient_id, status } = req.query;
    
    const referrals = await storage.getReferrals(
      patient_id as string | undefined,
      status as string | undefined
    );
    
    res.json({ referrals });
  }));

  // Create referral
  app.post('/api/referrals', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertReferralSchema.parse(req.body);
    const referral = await storage.createReferral(validatedData);
    res.status(201).json({ referral });
  }));

  // Update referral
  app.patch('/api/referrals/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertReferralSchema.partial().parse(req.body);
    const referral = await storage.updateReferral(req.params.id, validatedData);
    
    if (!referral) {
      throw new AppError(404, 'Referral not found');
    }
    
    res.json({ referral });
  }));

  // ============================================
  // Notification Management Routes
  // ============================================
  
  // List notifications
  app.get('/api/notifications', requireAuth, asyncHandler(async (req, res) => {
    const { user_id, is_read } = req.query;
    
    if (!user_id) {
      throw new AppError(400, 'user_id is required');
    }
    
    const notifications = await storage.getNotifications(
      user_id as string,
      is_read === 'true' ? true : is_read === 'false' ? false : undefined
    );
    
    res.json({ notifications });
  }));

  // Mark notification as read
  app.patch('/api/notifications/:id/read', requireAuth, asyncHandler(async (req, res) => {
    const notification = await storage.markNotificationAsRead(req.params.id);
    
    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }
    
    res.json({ notification });
  }));

  // Mark all notifications as read
  app.patch('/api/notifications/read-all', requireAuth, asyncHandler(async (req, res) => {
    const { user_id } = req.body;
    
    if (!user_id) {
      throw new AppError(400, 'user_id is required');
    }
    
    const count = await storage.markAllNotificationsAsRead(user_id);
    res.json({ count });
  }));

  // ============================================
  // Patient Files Routes
  // ============================================
  
  // Get patient files
  app.get('/api/patients/:patientId/files', requireAuth, asyncHandler(async (req, res) => {
    const files = await storage.getPatientFiles(req.params.patientId);
    res.json({ files });
  }));

  // Upload patient file
  app.post('/api/patients/:patientId/files', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertPatientFileSchema.parse({
      ...req.body,
      patient_id: req.params.patientId,
      uploaded_by: (req.user as any).id,
    });
    
    const file = await storage.createPatientFile(validatedData);
    res.status(201).json({ file });
  }));

  // Delete patient file
  app.delete('/api/patients/:patientId/files/:fileId', requireAuth, asyncHandler(async (req, res) => {
    await storage.deletePatientFile(req.params.fileId);
    res.json({ success: true });
  }));

  // ============================================
  // Communication Logs Routes
  // ============================================
  
  // Get communication logs for patient
  app.get('/api/patients/:patientId/communications', requireAuth, asyncHandler(async (req, res) => {
    const logs = await storage.getCommunicationLogs(req.params.patientId);
    res.json({ logs });
  }));

  // Create communication log
  app.post('/api/patients/:patientId/communications', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertCommunicationLogSchema.parse({
      ...req.body,
      patient_id: req.params.patientId,
      user_id: (req.user as any).id,
    });
    
    const log = await storage.createCommunicationLog(validatedData);
    res.status(201).json({ log });
  }));

  // Update communication log
  app.patch('/api/communications/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertCommunicationLogSchema.partial().parse(req.body);
    const log = await storage.updateCommunicationLog(req.params.id, validatedData);
    
    if (!log) {
      throw new AppError(404, 'Communication log not found');
    }
    
    res.json({ log });
  }));

  // ============================================
  // Follow-up Tasks Routes
  // ============================================
  
  // Get follow-up tasks
  app.get('/api/follow-ups', requireAuth, asyncHandler(async (req, res) => {
    const { clinic_id, doctor_id, is_completed, due_date } = req.query;
    
    if (!clinic_id) {
      throw new AppError(400, 'clinic_id is required');
    }
    
    const tasks = await storage.getFollowUpTasks(clinic_id as string, {
      doctorId: doctor_id as string | undefined,
      isCompleted: is_completed === 'true' ? true : is_completed === 'false' ? false : undefined,
      dueDate: due_date as string | undefined,
    });
    
    res.json({ tasks });
  }));

  // Get overdue follow-up tasks
  app.get('/api/follow-ups/overdue', requireAuth, asyncHandler(async (req, res) => {
    const { clinic_id } = req.query;
    
    if (!clinic_id) {
      throw new AppError(400, 'clinic_id is required');
    }
    
    const tasks = await storage.getOverdueFollowUpTasks(clinic_id as string);
    res.json({ tasks });
  }));

  // Create follow-up task
  app.post('/api/follow-ups', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertFollowUpTaskSchema.parse(req.body);
    const task = await storage.createFollowUpTask(validatedData);
    res.status(201).json({ task });
  }));

  // Update follow-up task
  app.patch('/api/follow-ups/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertFollowUpTaskSchema.partial().parse(req.body);
    const task = await storage.updateFollowUpTask(req.params.id, validatedData);
    
    if (!task) {
      throw new AppError(404, 'Follow-up task not found');
    }
    
    res.json({ task });
  }));

  // Complete follow-up task
  app.post('/api/follow-ups/:id/complete', requireAuth, asyncHandler(async (req, res) => {
    const { notes } = req.body;
    const task = await storage.completeFollowUpTask(
      req.params.id,
      (req.user as any).id,
      notes
    );
    
    if (!task) {
      throw new AppError(404, 'Follow-up task not found');
    }
    
    res.json({ task });
  }));

  // ============================================
  // Admin Routes
  // ============================================
  
  // List all clinics with stats (system admin only)
  app.get('/api/admin/clinics', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const clinics = await storage.getClinics();
    
    // Get stats for each clinic
    const clinicsWithStats = await Promise.all(
      clinics.map(async (clinic: any) => {
        const stats = await storage.getClinicStats(clinic.id);
        return { ...clinic, stats };
      })
    );
    
    res.json({ clinics: clinicsWithStats });
  }));

  // List all users across clinics (system admin only)
  app.get('/api/admin/users', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const users = await storage.getUsers();
    const usersWithoutPasswords = users.map((user: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json({ users: usersWithoutPasswords });
  }));

  // Activate/deactivate clinic
  app.patch('/api/admin/clinics/:id/activate', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const { status } = req.body;
    const clinic = await storage.updateClinic(req.params.id, { status });
    
    if (!clinic) {
      throw new AppError(404, 'Clinic not found');
    }
    
    res.json({ clinic });
  }));

  // Reset user password
  app.post('/api/admin/users/:id/reset-password', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const { new_password } = req.body;
    
    if (!new_password) {
      throw new AppError(400, 'new_password is required');
    }
    
    const user = await storage.updateUser(req.params.id, { password: new_password });
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    
    res.json({ success: true });
  }));

  // Get platform-wide statistics
  app.get('/api/admin/stats', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const clinics = await storage.getClinics();
    const users = await storage.getUsers();
    
    let totalPatients = 0;
    let totalAppointments = 0;
    
    for (const clinic of clinics) {
      const stats = await storage.getClinicStats(clinic.id);
      totalPatients += stats.total_patients;
      totalAppointments += stats.total_appointments;
    }
    
    res.json({
      total_clinics: clinics.length,
      active_clinics: clinics.filter((c: any) => c.status === 'active').length,
      total_users: users.length,
      active_users: users.filter((u: any) => u.status === 'active').length,
      total_patients: totalPatients,
      total_appointments: totalAppointments,
    });
  }));

  // ============================================
  // MVP Additional Routes
  // ============================================
  
  // Import and register MVP routes
  const { registerMVPRoutes } = await import('./routes-mvp-additions');
  registerMVPRoutes(app);
  
  // Import and register File Upload routes
  const { registerFileUploadRoutes } = await import('./routes-file-upload');
  registerFileUploadRoutes(app);
  
  // Import and register Analytics routes
  const { registerAnalyticsRoutes } = await import('./routes-analytics');
  registerAnalyticsRoutes(app);
  
  // Import and register Clinic Registration routes
  const { registerClinicRegistrationRoutes } = await import('./routes-clinic-registration');
  registerClinicRegistrationRoutes(app);

  return httpServer;
}
