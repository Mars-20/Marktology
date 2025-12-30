import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { config, isFileUploadEnabled } from './config';

/**
 * File Storage Configuration
 * Using Cloudinary for file uploads
 */

// Configure Cloudinary only if credentials are available
if (isFileUploadEnabled) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME || '',
    api_key: config.CLOUDINARY_API_KEY || '',
    api_secret: config.CLOUDINARY_API_SECRET || '',
  });
}

// Configure Multer with Cloudinary Storage or Memory Storage
const storage = isFileUploadEnabled 
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req: any, file: Express.Multer.File) => {
        // Determine folder based on file type
        const fileType = req.body?.file_type || 'other';
        const folder = `smartcare/${fileType}`;
        
        // Allowed formats
        const allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
        
        return {
          folder: folder,
          allowed_formats: allowedFormats,
          resource_type: 'auto' as const,
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
      },
    })
  : multer.memoryStorage(); // Use memory storage in test/dev without Cloudinary

// Create multer upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allowed mime types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX are allowed.'));
    }
  },
});

// Helper function to delete file from Cloudinary
export async function deleteFileFromCloudinary(fileUrl: string): Promise<boolean> {
  try {
    // Extract public_id from URL
    const urlParts = fileUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    const folder = urlParts.slice(-2, -1)[0];
    const fullPublicId = `smartcare/${folder}/${publicId}`;
    
    const result = await cloudinary.uploader.destroy(fullPublicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
}

// Helper function to get file info
export function getFileInfo(file: Express.Multer.File) {
  return {
    file_name: file.originalname,
    file_url: (file as any).path, // Cloudinary URL
    file_size: file.size,
    mime_type: file.mimetype,
  };
}

export { cloudinary };
