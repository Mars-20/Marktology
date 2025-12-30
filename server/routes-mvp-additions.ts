import type { Express } from "express";
import { requireAuth } from "./middleware";
import { asyncHandler, AppError } from "./errorHandler";
import {
  insertFollowUpTaskSchema,
  insertCommunicationLogSchema,
  insertPatientFileSchema,
} from "@shared/schema";
import * as mvpStorage from "./storage-mvp-additions";

/**
 * Register MVP Additional Routes
 * These routes complete the MVP requirements:
 * - Follow-up tasks management
 * - Communication logs
 * - Patient files
 */
export function registerMVPRoutes(app: Express) {
  
  // ============================================
  // Follow-up Tasks Routes
  // ============================================
  
  // List follow-up tasks
  app.get('/api/follow-up-tasks', requireAuth, asyncHandler(async (req, res) => {
    const { clinic_id, doctor_id, patient_id, is_completed } = req.query;
    
    if (!clinic_id) {
      throw new AppError(400, 'clinic_id is required');
    }
    
    const tasks = await mvpStorage.getFollowUpTasks(clinic_id as string, {
      doctorId: doctor_id as string | undefined,
      patientId: patient_id as string | undefined,
      isCompleted: is_completed === 'true' ? true : is_completed === 'false' ? false : undefined,
    });
    
    res.json({ tasks });
  }));
  
  // Get due follow-up tasks
  app.get('/api/follow-up-tasks/due', requireAuth, asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await mvpStorage.getDueFollowUpTasks(today);
    res.json({ tasks });
  }));
  
  // Get overdue follow-up tasks
  app.get('/api/follow-up-tasks/overdue', requireAuth, asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await mvpStorage.getOverdueFollowUpTasks(today);
    res.json({ tasks });
  }));
  
  // Create follow-up task
  app.post('/api/follow-up-tasks', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertFollowUpTaskSchema.parse(req.body);
    const task = await mvpStorage.createFollowUpTask(validatedData);
    res.status(201).json({ task });
  }));
  
  // Complete follow-up task
  app.post('/api/follow-up-tasks/:id/complete', requireAuth, asyncHandler(async (req, res) => {
    const { notes } = req.body;
    const userId = (req.user as any).id;
    
    const task = await mvpStorage.completeFollowUpTask(req.params.id, userId, notes);
    
    if (!task) {
      throw new AppError(404, 'Follow-up task not found');
    }
    
    res.json({ task });
  }));
  
  // Update follow-up task
  app.patch('/api/follow-up-tasks/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertFollowUpTaskSchema.partial().parse(req.body);
    const task = await mvpStorage.updateFollowUpTask(req.params.id, validatedData);
    
    if (!task) {
      throw new AppError(404, 'Follow-up task not found');
    }
    
    res.json({ task });
  }));
  
  // Delete follow-up task
  app.delete('/api/follow-up-tasks/:id', requireAuth, asyncHandler(async (req, res) => {
    await mvpStorage.deleteFollowUpTask(req.params.id);
    res.json({ success: true });
  }));
  
  // ============================================
  // Communication Logs Routes
  // ============================================
  
  // List communication logs for a patient
  app.get('/api/patients/:patientId/communications', requireAuth, asyncHandler(async (req, res) => {
    const logs = await mvpStorage.getCommunicationLogs(req.params.patientId);
    res.json({ logs });
  }));
  
  // Create communication log
  app.post('/api/communication-logs', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertCommunicationLogSchema.parse(req.body);
    const log = await mvpStorage.createCommunicationLog(validatedData);
    res.status(201).json({ log });
  }));
  
  // Update communication log
  app.patch('/api/communication-logs/:id', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertCommunicationLogSchema.partial().parse(req.body);
    const log = await mvpStorage.updateCommunicationLog(req.params.id, validatedData);
    
    if (!log) {
      throw new AppError(404, 'Communication log not found');
    }
    
    res.json({ log });
  }));
  
  // Delete communication log
  app.delete('/api/communication-logs/:id', requireAuth, asyncHandler(async (req, res) => {
    await mvpStorage.deleteCommunicationLog(req.params.id);
    res.json({ success: true });
  }));
  
  // ============================================
  // Patient Files Routes
  // ============================================
  
  // List patient files
  app.get('/api/patients/:patientId/files', requireAuth, asyncHandler(async (req, res) => {
    const { file_type } = req.query;
    const files = await mvpStorage.getPatientFiles(
      req.params.patientId,
      file_type as string | undefined
    );
    res.json({ files });
  }));
  
  // Get single file
  app.get('/api/patient-files/:id', requireAuth, asyncHandler(async (req, res) => {
    const file = await mvpStorage.getPatientFile(req.params.id);
    
    if (!file) {
      throw new AppError(404, 'File not found');
    }
    
    res.json({ file });
  }));
  
  // Upload patient file
  app.post('/api/patient-files', requireAuth, asyncHandler(async (req, res) => {
    const validatedData = insertPatientFileSchema.parse(req.body);
    const file = await mvpStorage.createPatientFile(validatedData);
    res.status(201).json({ file });
  }));
  
  // Delete patient file
  app.delete('/api/patient-files/:id', requireAuth, asyncHandler(async (req, res) => {
    await mvpStorage.deletePatientFile(req.params.id);
    res.json({ success: true });
  }));
  
  // ============================================
  // Enhanced Patient Profile Route
  // ============================================
  
  // Get full patient profile with all related data
  app.get('/api/patients/:id/full-profile', requireAuth, asyncHandler(async (req, res) => {
    const profile = await mvpStorage.getPatientFullProfile(req.params.id);
    
    if (!profile) {
      throw new AppError(404, 'Patient not found');
    }
    
    res.json(profile);
  }));
  
  // ============================================
  // Dashboard Statistics Route
  // ============================================
  
  // Get doctor dashboard statistics
  app.get('/api/dashboard/stats', requireAuth, asyncHandler(async (req, res) => {
    const { doctor_id, clinic_id } = req.query;
    
    if (!doctor_id || !clinic_id) {
      throw new AppError(400, 'doctor_id and clinic_id are required');
    }
    
    const stats = await mvpStorage.getDoctorDashboardStats(
      doctor_id as string,
      clinic_id as string
    );
    
    res.json(stats);
  }));
  
  console.log('[MVP Routes] Additional MVP routes registered successfully');
}
