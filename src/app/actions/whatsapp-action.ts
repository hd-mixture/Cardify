
'use server';

import twilio from 'twilio';
import { serverConfig } from '@/lib/config';

export async function sendWhatsAppMessageAction(body: string) {
  const { twilioAccountSid, twilioAuthToken, twilioWhatsAppFrom, twilioWhatsAppTo } = serverConfig;

  if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppFrom || !twilioWhatsAppTo) {
    const missing = [
        !twilioAccountSid && "TWILIO_ACCOUNT_SID",
        !twilioAuthToken && "TWILIO_AUTH_TOKEN",
        !twilioWhatsAppFrom && "TWILIO_WHATSAPP_FROM",
        !twilioWhatsAppTo && "TWILIO_WHATSAPP_TO"
    ].filter(Boolean).join(", ");
    // This error is thrown when environment variables are not loaded correctly.
    // Ensure the .env.local file is correct and the server has been restarted.
    throw new Error(`WhatsApp functionality is not configured. Missing environment variables: ${missing}`);
  }

  const client = twilio(twilioAccountSid, twilioAuthToken);

  try {
    const message = await client.messages.create({
      from: `whatsapp:${twilioWhatsAppFrom}`,
      to: `whatsapp:${twilioWhatsAppTo}`,
      body: body,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('Twilio API Error:', error);
    // Re-throw a more specific error to be caught by the calling function
    throw new Error(error.message || 'Failed to send WhatsApp message via Twilio.');
  }
}
