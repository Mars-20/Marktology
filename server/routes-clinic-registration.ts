import type { Express } from "express";
import { requireAuth, requireRole } from "./middleware";
import { asyncHandler, AppError } from "./errorHandler";
import * as clinicReg from "./clinic-registration";

/**
 * Clinic Registration Routes
 * Professional clinic registration system
 */
export function registerClinicRegistrationRoutes(app: Express) {
  
  // ============================================
  // Public Registration
  // ============================================
  
  // Register new clinic (public endpoint)
  app.post('/api/register-clinic', asyncHandler(async (req, res) => {
    const data = req.body;
    
    // Validate data
    const validation = clinicReg.validateRegistrationData(data);
    if (!validation.valid) {
      throw new AppError(400, validation.errors.join(', '));
    }
    
    // Check if email exists
    const emailExists = await clinicReg.checkEmailExists(data.email);
    if (emailExists) {
      throw new AppError(409, 'Clinic email already registered');
    }
    
    const ownerEmailExists = await clinicReg.checkEmailExists(data.owner_email);
    if (ownerEmailExists) {
      throw new AppError(409, 'Owner email already registered');
    }
    
    // Check if phone exists
    const phoneExists = await clinicReg.checkPhoneExists(data.phone);
    if (phoneExists) {
      throw new AppError(409, 'Phone number already registered');
    }
    
    // Register clinic
    const result = await clinicReg.registerClinic(data);
    
    res.status(201).json({
      success: true,
      message: 'Clinic registered successfully. Awaiting admin approval.',
      data: result,
    });
  }));
  
  // Check email availability
  app.post('/api/register-clinic/check-email', asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      throw new AppError(400, 'Email is required');
    }
    
    const exists = await clinicReg.checkEmailExists(email);
    
    res.json({
      available: !exists,
      message: exists ? 'Email already registered' : 'Email available',
    });
  }));
  
  // Check phone availability
  app.post('/api/register-clinic/check-phone', asyncHandler(async (req, res) => {
    const { phone } = req.body;
    
    if (!phone) {
      throw new AppError(400, 'Phone is required');
    }
    
    const exists = await clinicReg.checkPhoneExists(phone);
    
    res.json({
      available: !exists,
      message: exists ? 'Phone already registered' : 'Phone available',
    });
  }));
  
  // ============================================
  // Admin Clinic Management
  // ============================================
  
  // Activate clinic (admin only)
  app.post('/api/admin/clinics/:id/activate', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = (req.user as any).id;
    
    const clinic = await clinicReg.activateClinic({
      clinic_id: id,
      approved_by: userId,
      notes,
    });
    
    res.json({
      success: true,
      message: 'Clinic activated successfully',
      clinic,
    });
  }));
  
  // Reject clinic (admin only)
  app.post('/api/admin/clinics/:id/reject', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      throw new AppError(400, 'Rejection reason is required');
    }
    
    const clinic = await clinicReg.rejectClinic(id, reason);
    
    res.json({
      success: true,
      message: 'Clinic registration rejected',
      clinic,
    });
  }));
  
  // Suspend clinic (admin only)
  app.post('/api/admin/clinics/:id/suspend', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      throw new AppError(400, 'Suspension reason is required');
    }
    
    const clinic = await clinicReg.suspendClinic(id, reason);
    
    res.json({
      success: true,
      message: 'Clinic suspended',
      clinic,
    });
  }));
  
  // Generate new clinic code (admin only)
  app.get('/api/admin/generate-clinic-code', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const code = await clinicReg.generateClinicCode();
    
    res.json({
      code,
    });
  }));
  
  // Generate license number (admin only)
  app.get('/api/admin/generate-license-number', requireAuth, requireRole('system_admin'), asyncHandler(async (req, res) => {
    const licenseNumber = clinicReg.generateLicenseNumber();
    
    res.json({
      license_number: licenseNumber,
    });
  }));
  
  console.log('[Clinic Registration Routes] Clinic registration routes registered successfully');
}
