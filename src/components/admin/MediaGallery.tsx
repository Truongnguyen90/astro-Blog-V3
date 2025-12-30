/**
 * Media Gallery Component
 *
 * Displays uploaded media in a grid with search, filter, and actions.
 * Fetches media from Supabase Storage via database metadata.
 *
 * @module components/admin/MediaGallery
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/admin/supabase';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
  alt_text?: string;
  tags?: string[];
}

interface MediaGalleryProps {
  onSelect?: (media: MediaItem) => void;
  selectable?: boolean;
}

/**
 * Media Gallery Component
 *
 * Grid view of uploaded media with search and actions.
 *
 * @example
 * ```tsx
 * <MediaGallery
 *   selectable
 *   onSelect={(media) => console.log('Selected:', media)}
 * />
 * ```
 */
export function MediaGallery({ onSelect, selectable = false }: MediaGalleryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /**
   * Fetch media from database
   */
  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('media_meta')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (fetchError) throw fetchError;

      setMedia(data || []);
      setFilteredMedia(data || []);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete media item
   */
  const deleteMedia = async (item: MediaItem) => {
    if (!confirm(`Delete ${item.filename}?`)) return;

    try {
      // Extract filename from URL
      const urlParts = item.url.split('/');
      const storageFilename = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([storageFilename]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_meta')
        .delete()
        .eq('id', item.id);

      if (dbError) throw dbError;

      // Update local state
      setMedia(prev => prev.filter(m => m.id !== item.id));
      setFilteredMedia(prev => prev.filter(m => m.id !== item.id));
    } catch (err) {
      console.error('Failed to delete media:', err);
      alert('Failed to delete media. Please try again.');
    }
  };

  /**
   * Copy URL to clipboard
   */
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  /**
   * Handle search
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMedia(media);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = media.filter(
      item =>
        item.filename.toLowerCase().includes(query) ||
        item.alt_text?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
    );

    setFilteredMedia(filtered);
  }, [searchQuery, media]);

  /**
   * Fetch media on mount
   */
  useEffect(() => {
    fetchMedia();
  }, []);

  /**
   * Format file size
   */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading media...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={fetchMedia}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <input
          type="search"
          placeholder="Search media..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={fetchMedia}
          className="ml-3 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12">
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {searchQuery ? 'No media found matching your search' : 'No media uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map(item => (
            <div
              key={item.id}
              className={`group relative bg-white dark:bg-neutral-900 border rounded-lg overflow-hidden transition-all ${
                selectable && selectedId === item.id
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
              onClick={() => {
                if (selectable) {
                  setSelectedId(item.id);
                  onSelect?.(item);
                }
              }}
            >
              {/* Image Preview */}
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                {item.mime_type.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <svg className="w-12 h-12 text-neutral-400 dark:text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatSize(item.size)}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(item.uploaded_at)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    copyUrl(item.url);
                  }}
                  className="p-2 bg-white dark:bg-neutral-800 rounded-md shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  title="Copy URL"
                >
                  <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteMedia(item);
                  }}
                  className="p-2 bg-white dark:bg-neutral-800 rounded-md shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete"
                >
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
