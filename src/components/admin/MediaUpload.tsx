/**
 * Media Upload Component
 *
 * Drag-and-drop file upload with Supabase Storage integration.
 * Validates file types and sizes, shows upload progress.
 *
 * @module components/admin/MediaUpload
 */

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { supabase } from '@/utils/admin/supabase';

interface MediaUploadProps {
  onUploadComplete?: (url: string, filename: string) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

/**
 * Media Upload Component
 *
 * Provides drag-and-drop file upload with visual feedback.
 * Uploads to Supabase Storage and inserts metadata to database.
 *
 * @example
 * ```tsx
 * <MediaUpload
 *   maxSizeMB={10}
 *   allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
 *   onUploadComplete={(url, filename) => console.log('Uploaded:', url)}
 * />
 * ```
 */
export function MediaUpload({
  onUploadComplete,
  maxSizeMB = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return `File too large (max ${maxSizeMB}MB)`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  /**
   * Upload file to Supabase Storage
   */
  const uploadFile = async (uploadFile: UploadFile) => {
    const { file } = uploadFile;
    const fileExt = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    try {
      // Update status to uploading
      setFiles(prev =>
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f)
      );

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filename);

      // Insert metadata to database
      const { error: dbError } = await supabase
        .from('media_meta')
        .insert({
          filename: file.name,
          url: publicUrl,
          size: file.size,
          mime_type: file.type
        });

      if (dbError) {
        console.warn('Failed to insert media metadata:', dbError);
      }

      // Update status to success
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'success' as const, progress: 100, url: publicUrl }
            : f
        )
      );

      // Callback
      if (onUploadComplete) {
        onUploadComplete(publicUrl, file.name);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        )
      );
    }
  };

  /**
   * Handle file selection
   */
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadFile[] = [];

    Array.from(fileList).forEach(file => {
      const error = validateFile(file);

      if (error) {
        // Add invalid file with error
        newFiles.push({
          file,
          id: Math.random().toString(36),
          progress: 0,
          status: 'error',
          error
        });
      } else {
        // Add valid file
        const uploadFile: UploadFile = {
          file,
          id: Math.random().toString(36),
          progress: 0,
          status: 'pending'
        };
        newFiles.push(uploadFile);

        // Start upload
        uploadFile(uploadFile);
      }
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  /**
   * Drag and drop handlers
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  /**
   * File input change handler
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  /**
   * Clear completed uploads
   */
  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg
          className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Drag and drop files here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          Max {maxSizeMB}MB • {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Upload List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Uploads ({files.length})
            </p>
            {files.some(f => f.status === 'success') && (
              <button
                onClick={clearCompleted}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {/* Status Icon */}
                    {file.status === 'success' && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {file.status === 'error' && (
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {file.status === 'uploading' && (
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}

                    {/* Filename */}
                    <p className="text-sm text-neutral-900 dark:text-neutral-100 truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Copy URL Button */}
                  {file.status === 'success' && file.url && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(file.url!);
                      }}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Copy URL"
                    >
                      Copy URL
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'error' && file.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{file.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
