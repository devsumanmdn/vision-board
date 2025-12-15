/**
 * Cloudinary Image Upload Service
 * 
 * Uploads images to Cloudinary using unsigned uploads (no SDK required).
 * Uses environment variables for configuration.
 */

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface CloudinaryError {
  error: {
    message: string;
  };
}

/**
 * Upload an image to Cloudinary
 * 
 * @param localUri - Local file URI from expo-image-picker
 * @returns Promise<string> - The secure Cloudinary URL
 * @throws Error if upload fails or credentials are missing
 */
export const uploadToCloudinary = async (localUri: string): Promise<string> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary credentials missing. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env file.'
    );
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  // Create form data for the upload
  const formData = new FormData();
  
  // Extract filename from URI
  const filename = localUri.split('/').pop() || 'image.jpg';
  
  // Determine MIME type from extension
  const extension = filename.split('.').pop()?.toLowerCase();
  const mimeType = extension === 'png' ? 'image/png' : 
                   extension === 'gif' ? 'image/gif' : 
                   extension === 'webp' ? 'image/webp' : 
                   'image/jpeg';

  // Append the file
  formData.append('file', {
    uri: localUri,
    type: mimeType,
    name: filename,
  } as any);
  
  // Append the upload preset (required for unsigned uploads)
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as CloudinaryError;
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result = data as CloudinaryUploadResponse;
    return result.secure_url;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
    throw new Error('Cloudinary upload failed: Unknown error');
  }
};

/**
 * Check if Cloudinary is properly configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
};
