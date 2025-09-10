
// This file is for server-side configuration only.
// It helps to centralize and securely access environment variables on the server.
// Do not import this file into client-side components.

import 'dotenv/config';

export const serverConfig = {
    // Twilio Configuration
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioWhatsAppFrom: process.env.TWILIO_WHATSAPP_FROM,
    twilioWhatsAppTo: process.env.TWILIO_WHATSAPP_TO,

    // Cloudinary Configuration
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,

    // Firebase Configuration (Server-side access if needed, though typically used on client)
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

    // EmailJS Configuration
    emailJsServiceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    emailJsTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    emailJsPublicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};
