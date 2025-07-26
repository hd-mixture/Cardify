
'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadAction(base64Image: string) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'cardify-profile-images',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    const errorMessage = (error as any)?.message || 'Upload failed due to a server error.';
    return { success: false, message: errorMessage };
  }
}
