
'use server';

import twilio from 'twilio';
import { serverConfig } from '@/lib/config';

interface SendMessageArgs {
    to: string; // The full number e.g., +919876543210
    name: string;
}

export async function sendUserWhatsAppMessageAction({ to, name }: SendMessageArgs) {
  const { twilioAccountSid, twilioAuthToken, twilioWhatsAppFrom } = serverConfig;
  
  // This is a publicly accessible URL provided by Twilio for testing status callbacks.
  // In a real production app, you would create your own endpoint to receive these callbacks.
  const statusCallbackUrl = 'https://demo.twilio.com/welcome/sms/reply/';

  if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppFrom) {
    const missing = [
        !twilioAccountSid && "TWILIO_ACCOUNT_SID",
        !twilioAuthToken && "TWILIO_AUTH_TOKEN",
        !twilioWhatsAppFrom && "TWILIO_WHATSAPP_FROM",
    ].filter(Boolean).join(", ");
    
    const errorMessage = `WhatsApp functionality is not configured. Missing environment variables: ${missing}`;
    console.error(errorMessage);
    return { success: false, message: errorMessage };
  }

  // Twilio requires numbers to be in the format: "whatsapp:+14155238886"
  // The 'to' and 'from' numbers must include the '+' sign.
  const formattedTo = `whatsapp:${to}`;
  const formattedFrom = `whatsapp:${twilioWhatsAppFrom}`;
  const body = `Dear ${name}, Thank you for your valuable feedback!`;

  const client = twilio(twilioAccountSid, twilioAuthToken);

  try {
    const message = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: body,
      statusCallback: statusCallbackUrl, // This tells Twilio where to send delivery status updates.
    });
    // This only means the message was successfully QUEUED by Twilio, not delivered.
    console.log(`Thank you message queued for ${to} with SID: ${message.sid}. Status: ${message.status}`);
    return { success: true, sid: message.sid, status: message.status };
  } catch (error: any) {
    // This block will catch errors if Twilio rejects the message immediately (e.g., bad format, invalid 'from' number).
    console.error(`Twilio API Error when sending to ${to}:`, JSON.stringify(error, null, 2));
    
    // Provide a clear error message back to the client
    const defaultMessage = 'Failed to send WhatsApp message via Twilio.';
    const errorMessage = `Error ${error.code || 'UNKNOWN'}: ${error.message || defaultMessage}`;
    
    return { success: false, message: errorMessage, errorDetails: error };
  }
}
