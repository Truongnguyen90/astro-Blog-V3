/**
 * Media Management Utilities
 *
 * Helper functions for media upload, validation, and management.
 *
 * @module utils/admin/media
 */

import { supabase } from './supabase';

/**
 * Allowed MIME types for upload
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf'
] as const;

/**
 * Max file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate file for upload
 *
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes
 * @param allowedTypes - Allowed MIME types
 * @returns Error message or null if valid
 *
 * @example
 * ```typescript
 * const error = validateFileForUpload(file);
 * if (error) {
 *   console.error(error);
 * }
 * ```
 */
export function validateFileForUpload(
  file: File,
  maxSize: number = MAX_FILE_SIZE,
  allowedTypes: readonly string[] = ALLOWED_MIME_TYPES
): string | null {
  if (file.size > maxSize) {
    const maxMB = (maxSize / 1024 / 1024).toFixed(0);
    return `File too large. Maximum size is ${maxMB}MB.`;
  }

  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }

  return null;
}

/**
 * Generate unique filename
 *
 * @param originalFilename - Original filename
 * @returns Unique filename with timestamp
 *
 * @example
 * ```typescript
 * const filename = generateUniqueFilename('photo.jpg');
 * // Returns: "1234567890-abc123.jpg"
 * ```
 */
export function generateUniqueFilename(originalFilename: string): string {
  const ext = originalFilename.split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 *
 * @example
 * ```typescript
 * formatFileSize(1500000); // "1.43 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/**
 * Get file extension from filename
 *
 * @param filename - Filename
 * @returns File extension without dot
 *
 * @example
 * ```typescript
 * getFileExtension('photo.jpg'); // "jpg"
 * ```
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop() || '';
}

/**
 * Check if file is an image
 *
 * @param mimeType - MIME type
 * @returns Whether file is an image
 *
 * @example
 * ```typescript
 * isImageFile('image/jpeg'); // true
 * isImageFile('application/pdf'); // false
 * ```
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Upload file to Supabase Storage
 *
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @returns Public URL and storage path
 *
 * @example
 * ```typescript
 * const { url, path, error } = await uploadFileToStorage(file, 'media');
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log('Uploaded to:', url);
 * }
 * ```
 */
export async function uploadFileToStorage(
  file: File,
  bucket: string = 'media'
): Promise<{ url: string | null; path: string | null; error: Error | null }> {
  try {
    const filename = generateUniqueFilename(file.name);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return { url: publicUrl, path: filename, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      url: null,
      path: null,
      error: error instanceof Error ? error : new Error('Upload failed')
    };
  }
}

/**
 * Delete file from Supabase Storage
 *
 * @param path - Storage path
 * @param bucket - Storage bucket name
 * @returns Success status
 *
 * @example
 * ```typescript
 * const { success, error } = await deleteFileFromStorage('1234567890-abc123.jpg');
 * if (!success) {
 *   console.error(error);
 * }
 * ```
 */
export async function deleteFileFromStorage(
  path: string,
  bucket: string = 'media'
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Delete failed')
    };
  }
}

/**
 * Extract storage path from public URL
 *
 * @param url - Public URL
 * @returns Storage path
 *
 * @example
 * ```typescript
 * const path = extractStoragePathFromUrl('https://xxx.supabase.co/storage/v1/object/public/media/file.jpg');
 * // Returns: "file.jpg"
 * ```
 */
export function extractStoragePathFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

/**
 * Get media item by ID
 *
 * @param id - Media ID
 * @returns Media item or null
 */
export async function getMediaById(id: string) {
  try {
    const { data, error } = await supabase
      .from('media_meta')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Fetch failed')
    };
  }
}

/**
 * Get all media items
 *
 * @param limit - Maximum number of items to return
 * @returns Array of media items
 */
export async function getAllMedia(limit?: number) {
  try {
    let query = supabase
      .from('media_meta')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Fetch failed')
    };
  }
}
