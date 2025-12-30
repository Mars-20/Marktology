import type { Express, Request, Response } from "express";
import { requireAuth } from "./middleware";
import { asyncHandler, AppError } from "./errorHandler";
import { upload, getFileInfo, deleteFileFromCloudinary } from "./fileStorage";
import * as mvpStorage from "./storage-mvp-additions";
import { insertPatientFileSchema } from "@shared/schema";

/**
 * File Upload Routes
 * Handles file uploads for patient files
 */
export function registerFileUploadRoutes(app: Express) {
  
  // Upload patient file
  app.post(
    '/api/patient-files/upload',
    requireAuth,
    upload.single('file'),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.file) {
        throw new AppError(400, 'No file uploaded');
      }
      
      const { patient_id, clinic_id, consultation_id, file_type, description } = req.body;
      const userId = (req.user as any).id;
      
      // Validate required fields
      if (!patient_id || !clinic_id || !file_type) {
        throw new AppError(400, 'patient_id, clinic_id, and file_type are required');
      }
      
      // Get file info from Cloudinary
      const fileInfo = getFileInfo(req.file);
      
      // Create file record in database
      const fileData = {
        patient_id,
        clinic_id,
        consultation_id: consultation_id || null,
        file_type,
        file_name: fileInfo.file_name,
        file_url: fileInfo.file_url,
        file_size: fileInfo.file_size,
        description: description || null,
        uploaded_by: userId,
      };
      
      // Validate with schema
      const validatedData = insertPatientFileSchema.parse(fileData);
      
      // Save to database
      const file = await mvpStorage.createPatientFile(validatedData);
      
      res.status(201).json({
        success: true,
        file,
        message: 'File uploaded successfully',
      });
    })
  );
  
  // Upload multiple files
  app.post(
    '/api/patient-files/upload-multiple',
    requireAuth,
    upload.array('files', 5), // Max 5 files
    asyncHandler(async (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        throw new AppError(400, 'No files uploaded');
      }
      
      const { patient_id, clinic_id, consultation_id, file_type, description } = req.body;
      const userId = (req.user as any).id;
      
      // Validate required fields
      if (!patient_id || !clinic_id || !file_type) {
        throw new AppError(400, 'patient_id, clinic_id, and file_type are required');
      }
      
      const uploadedFiles = [];
      
      // Process each file
      for (const file of files) {
        const fileInfo = getFileInfo(file);
        
        const fileData = {
          patient_id,
          clinic_id,
          consultation_id: consultation_id || null,
          file_type,
          file_name: fileInfo.file_name,
          file_url: fileInfo.file_url,
          file_size: fileInfo.file_size,
          description: description || null,
          uploaded_by: userId,
        };
        
        const validatedData = insertPatientFileSchema.parse(fileData);
        const savedFile = await mvpStorage.createPatientFile(validatedData);
        uploadedFiles.push(savedFile);
      }
      
      res.status(201).json({
        success: true,
        files: uploadedFiles,
        count: uploadedFiles.length,
        message: `${uploadedFiles.length} files uploaded successfully`,
      });
    })
  );
  
  // Delete file (with Cloudinary cleanup)
  app.delete(
    '/api/patient-files/:id/delete',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const fileId = req.params.id;
      
      // Get file info first
      const file = await mvpStorage.getPatientFile(fileId);
      
      if (!file) {
        throw new AppError(404, 'File not found');
      }
      
      // Delete from Cloudinary
      const cloudinaryDeleted = await deleteFileFromCloudinary(file.file_url);
      
      if (!cloudinaryDeleted) {
        console.warn(`Failed to delete file from Cloudinary: ${file.file_url}`);
      }
      
      // Delete from database
      await mvpStorage.deletePatientFile(fileId);
      
      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    })
  );
  
  console.log('[File Upload Routes] File upload routes registered successfully');
}
