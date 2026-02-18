/**
 * Supabase Storage Service
 * Handles file uploads for ticket attachments
 */

import { supabase } from '@/integrations/supabase/client';

const STORAGE_BUCKET = 'ticket-attachments';

/**
 * Initialize storage bucket (call once on app startup)
 */
export async function initializeStorage() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
      });

      if (error) {
        console.error('Error creating storage bucket:', error);
        return false;
      }

      console.log('Storage bucket created successfully');
    }

    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

/**
 * Upload a file to Supabase Storage
 * @param {File} file - File object to upload
 * @param {string} ticketId - Ticket ID for organizing files
 * @param {string} userId - User ID of uploader
 * @returns {Promise<{path: string, url: string}>} File path and public URL
 */
export async function uploadFile(file, ticketId, userId) {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${ticketId}/${userId}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL (this will require authentication to access)
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
}

/**
 * Upload multiple files
 * @param {FileList} files - Files to upload
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of upload results
 */
export async function uploadMultipleFiles(files, ticketId, userId) {
  const uploads = Array.from(files).map(file => uploadFile(file, ticketId, userId));
  return await Promise.all(uploads);
}

/**
 * Get signed URL for private file access
 * @param {string} filePath - File path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedUrl(filePath, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}

/**
 * Delete a file from storage
 * @param {string} filePath - File path to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteFile(filePath) {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * List files for a ticket
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Array>} Array of file objects
 */
export async function listTicketFiles(ticketId) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(ticketId, {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

/**
 * Save file attachment metadata to database
 * @param {string} ticketId - Ticket ID
 * @param {string} commentId - Optional comment ID
 * @param {string} userId - User ID
 * @param {Object} fileData - File metadata
 * @returns {Promise<Object>} Attachment record
 */
export async function saveAttachmentMetadata(ticketId, userId, fileData, commentId = null) {
  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        comment_id: commentId,
        uploaded_by: userId,
        file_name: fileData.fileName,
        file_path: fileData.path,
        file_type: fileData.fileType,
        file_size: fileData.fileSize,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving attachment metadata:', error);
    throw error;
  }
}

/**
 * Get attachments for a ticket
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Array>} Array of attachment records with uploader info
 */
export async function getTicketAttachments(ticketId) {
  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select(`
        *,
        uploader:uploaded_by (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting attachments:', error);
    return [];
  }
}

export default {
  initializeStorage,
  uploadFile,
  uploadMultipleFiles,
  getSignedUrl,
  deleteFile,
  listTicketFiles,
  saveAttachmentMetadata,
  getTicketAttachments,
};
