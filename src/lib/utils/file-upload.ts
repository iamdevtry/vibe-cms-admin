/**
 * File upload utilities
 * 
 * This module contains utilities for handling file uploads, validations,
 * and storage. It follows the Single Responsibility Principle by isolating
 * file handling logic from the rest of the application.
 */

export interface FileValidationOptions {
  maxSizeInBytes: number;
  allowedMimeTypes: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Default validation options for different file types
 */
export const DEFAULT_VALIDATION_OPTIONS = {
  image: {
    maxSizeInBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  document: {
    maxSizeInBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  video: {
    maxSizeInBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  },
};

/**
 * Validates a file against the given validation options
 * 
 * @param file - The file to validate
 * @param options - Validation options
 * @returns A validation result object
 */
export function validateFile(
  file: File,
  options: FileValidationOptions
): FileValidationResult {
  // Check file size
  if (file.size > options.maxSizeInBytes) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size of ${formatFileSize(options.maxSizeInBytes)}`,
    };
  }
  
  // Check file type
  if (!options.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
    };
  }
  
  return { valid: true };
}

/**
 * Formats a file size in bytes to a human-readable string
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extracts the file extension from a filename
 * 
 * @param filename - The name of the file
 * @returns The file extension without the dot
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Generates a secure filename for storage
 * 
 * @param originalFilename - The original filename
 * @param prefix - Optional prefix to add to the filename
 * @returns A secure, unique filename
 */
export function generateSecureFilename(originalFilename: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = getFileExtension(originalFilename);
  
  const filename = `${prefix ? prefix + '_' : ''}${timestamp}_${randomString}.${extension}`;
  return filename;
}

/**
 * Determines if a file is an image
 * 
 * @param mimeType - The MIME type of the file
 * @returns True if the file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Determines if a file is a video
 * 
 * @param mimeType - The MIME type of the file
 * @returns True if the file is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Determines if a file is a document
 * 
 * @param mimeType - The MIME type of the file
 * @returns True if the file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  return [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ].includes(mimeType);
}
