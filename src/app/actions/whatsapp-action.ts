
'use server';

import twilio from 'twilio';

export async function sendWhatsAppMessageAction(body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.TWILIO_WHATSAPP_TO;

  if (!accountSid || !authToken || !from || !to) {
    const missing = [
        !accountSid && "TWILIO_ACCOUNT_SID",
        !authToken && "TWILIO_AUTH_TOKEN",
        !from && "TWILIO_WHATSAPP_FROM",
        !to && "TWILIO_WHATSAPP_TO"
    ].filter(Boolean).join(", ");
    // This error is thrown when environment variables are not loaded correctly.
    // Ensure the .env.local file is correct and the server has been restarted.
    throw new Error(`WhatsApp functionality is not configured. Missing environment variables: ${missing}`);
  }

  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body: body,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('Twilio API Error:', error);
    // Re-throw a more specific error to be caught by the calling function
    throw new Error(error.message || 'Failed to send WhatsApp message via Twilio.');
  }
}
