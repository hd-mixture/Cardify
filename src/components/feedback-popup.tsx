
"use client";

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { sendWhatsAppMessageAction } from '@/app/actions/whatsapp-action';
import { sendUserWhatsAppMessageAction } from '@/app/actions/send-user-whatsapp-action';
import type { CardData } from '@/lib/types';


interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: CardData;
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
}

const ratings = [
  { lottieSrc: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/lottie.json', value: 'angry' },
  { lottieSrc: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f610/lottie.json', value: 'neutral' },
  { lottieSrc: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f642/lottie.json', value: 'happy' },
  { lottieSrc: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/lottie.json', value: 'awesome' },
];

const getEmailTemplate = (rating: string, comment: string, fromName: string) => {
    const primaryColor = "#29ABE2";
    const accentColor = "#008080";
    const backgroundColor = "#F8FAFC";
    const textColor = "#020817";

    const ratingTextMap: { [key: string]: string } = {
        angry: '😡 Angry',
        neutral: '😐 Neutral',
        happy: '😊 Happy',
        awesome: '🤩 Awesome!',
    };
    const cardifyLogoBase64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJVSURBVHgB7ZfBbtpQEIb/JizGQ3wDkklKnoDuwJgEjpAUJ6A5wU3YmhHcBJwniLgT1BwlqSQLfGZmM5sVihRprPol5wzLMpZklj3ffL83A7DMKkS/jYg5i3EwG3Ecbp4LzT0wYdFkU4EB4MKgcVAMBAKzYDFU7AIKgUDM4CSoHIp9ARvQh2zQ9g2o1sXjOIbHICL+vge4LgP6BvSBfVDxplQqkSoVq1YtWo1Wq1U6ZkxxBIcYx4FpA9O2r7i4D7X2LwD2A7A+BvQEfI+6HwT0g/qX3QyUyqXyE13XpUKhECllDh06lEql0lKpjEqlYgSgq2g1g1qsFhUKhUKhWPM9wHfIu1XwLuR9sBfq/R5QdY3kSrmcTqdRo9EgkUjQaDQIIZSwsJDF42Gz2cjlclitVhIJBJquQ/4b2G9Av+B9sN+BfiP4HnA9z+C1D+A6zONwHAfTAfAGdBoNI5IkkkgkEEsikUAYhuPj45AkSZIkiYuLC3Rdp2maNE3L5XKESJLJZJBIJDDGmLAs8/b2BiEEYRjK5TJc1+X5+RmSJHNzc6xYLAqFAnM4HIumCRAEyfN8nufn5wefz0ctFg0GA/b5fMjlclitVhIJBJquQ/4b2G9Av+B9sN+BfiP4HnA9z+C1D+A6zONwHAfTAfAGdBoNI5IkkkgkEEsikUAYhuPj45AkSZIkiYuLC3Rdp2maNE3L5XKESJLJZJBIJDDGmLAs8/b2BiEEYRjK5TJc1+X5+RmSJHNzc6xYLAqFAnM4HIumCRAEyfN8nufn5wefz0ctFg0GA/b5fMjlclitVhIJBJquQ/4b2G9Av+B9sN+BfiP4HnA9z+C1D+A6zONwHAfTAfAGdBoNI5IkkkgkEEsikUAYhuPj45AkSZIkiYuLC3Rdp2maNE3L5XKESJLJZJBIJDDGmLAs8/b2BiEEYRjK5TJc1+X5+RmSJHNzc6xYLAqFAnM4HIumCRAEyfN8nufn5wefz0ctFg0GA/b5fMjlclitVhIJBJquQ/4b2G9Av+B9sN+BfiP4HnA9z+C1D+A6zONwHAfTAfAGdBoNI5IkkkgkEEsikUAYhuPj45AkSZIkiYuLC3Rdp2maNE3L5XKESJLJZJBIJDDGmLAs8/b2BiEEYRjK5TJc1+X5+RmSJHNzc6xYLAqFAnM4HIumCRAEyfN8nufn5wefz0ctFg0GA/b5fMjlcoQQ6LoOISSEEIQQ6vU6kUjEtG1bLBacn5+zpmlb1qVSiRBCtVplu93CNE2WZc3nc1QqFX6/Pz4+PmCaJhgMSJKkDMOIaZqmaWzbvgmCMAwjhFgslslkQhAEkiQRT0R8Ojs7QRDk+fnZtq26rhMEXTAMA8MwDMOEEGia3gH8A9eDqFcQSqj/AAAAAElFTkSuQmCC`;


    return `
    <div style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: ${textColor}; background-color: ${backgroundColor}; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: ${primaryColor}; padding: 24px 16px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align: middle;">
                <h1 style="font-size: 28px; color: #ffffff; margin: 0;">New Feedback Received!</h1>
              </td>
              <td style="vertical-align: middle; text-align: right;">
                 <img src="${cardifyLogoBase64}" alt="Cardify Logo" width="32" height="32" style="vertical-align: middle;" />
              </td>
            </tr>
          </table>
        </div>
        <div style="padding: 24px;">
          <h2 style="font-size: 20px; color: ${primaryColor}; margin-top: 0;">A user has shared their experience.</h2>
          <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
            <p style="margin: 0;"><strong>From:</strong> ${fromName}</p>
            <p style="margin: 4px 0 0 0;"><strong>Rating:</strong> <span style="font-weight: bold; color: ${accentColor};">${ratingTextMap[rating] || rating}</span></p>
          </div>
          <div style="margin-top: 20px;">
            <h3 style="font-size: 18px; color: ${textColor}; border-bottom: 2px solid ${primaryColor}; padding-bottom: 4px; margin-bottom: 12px;">Comment:</h3>
            <p style="white-space: pre-wrap; background-color: #f8fafc; padding: 12px; border-radius: 8px; margin: 0; min-height: 50px;">${comment || '<em>No comment provided.</em>'}</p>
          </div>
        </div>
        <div style="text-align: center; background-color: #f1f5f9; padding: 16px; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">This feedback was sent from the Cardify app.</p>
        </div>
      </div>
    </div>
  `;
};


export function FeedbackPopup({ isOpen, onClose, cardData, serviceId, templateId, publicKey }: FeedbackPopupProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedRating, setSelectedRating] = useState<string>('happy');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!selectedRating) return;
    setIsSubmitting(true);

    const from_name = user?.displayName || 'Cardify User';
    
    const ratingTextMap: { [key: string]: string } = {
        angry: '😡 Angry',
        neutral: '😐 Neutral',
        happy: '😊 Happy',
        awesome: '🤩 Awesome!',
    };

    const whatsAppMessageBody = `New Cardify Feedback!
--------------------
From: ${from_name}
Rating: ${ratingTextMap[selectedRating] || selectedRating}
Comment: ${comment || 'No comment provided.'}`;

    let emailSent = false;
    // --- Send Email ---
    if (serviceId && templateId && publicKey) {
        const reply_to = user?.email || 'no-reply@cardify.app';
        const message_html = getEmailTemplate(selectedRating, comment, from_name);
        const templateParams = {
            from_name: from_name,
            to_name: 'Cardify Admin',
            message_html: message_html,
            reply_to: reply_to,
        };
        try {
            await emailjs.send(serviceId, templateId, templateParams, publicKey);
            emailSent = true;
        } catch (emailError: any) {
            console.error('EmailJS Error:', emailError);
            toast({
                title: "Email Failed",
                description: "Could not send feedback via email. Please try again.",
                variant: "error",
            });
        }
    }

    // --- Send WhatsApp Message to Admin ---
    try {
        await sendWhatsAppMessageAction(whatsAppMessageBody);
        toast({
            title: "Feedback Sent!",
            description: "Thank you! Your feedback helps make us better.",
            variant: "success",
        });
    } catch (whatsappError: any) {
        toast({
            title: emailSent ? "Feedback Sent!" : "Feedback Failed",
            description: emailSent ? "Thank you! Your feedback helps make us better." : (whatsappError.message || "Could not send feedback."),
            variant: emailSent ? "success" : "warning",
        });
    }

    // --- Send "Thank You" WhatsApp Message to User ---
    const userName = cardData.contactPersonName;
    const userContact = cardData.contactDetails?.[0];

    if (userName && userContact?.phone && userContact?.countryCode) {
        const fullPhoneNumber = `${userContact.countryCode}${userContact.phone}`;
        try {
            const result = await sendUserWhatsAppMessageAction({
                to: fullPhoneNumber,
                name: userName
            });

            if (!result.success) {
                // Log the specific error from Twilio to the browser console for debugging
                console.error("Failed to send 'Thank You' WhatsApp message to user:", result.message);
            }
        } catch (err: any) {
            // Log any unexpected errors during the action call
            console.error("Error calling sendUserWhatsAppMessageAction:", err.message);
        }
    }

    setIsSubmitting(false);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setTimeout(() => {
        setSelectedRating('happy');
        setComment('');
        setIsSubmitting(false);
      }, 200);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Rate your experience</DialogTitle>
          <DialogDescription className="text-center">
            Your feedback helps us improve Cardify.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-center items-center gap-1 sm:gap-2 mb-6">
            {ratings.map(({ lottieSrc, value }) => (
                <button
                  key={value}
                  onClick={() => setSelectedRating(value)}
                  className={cn(
                    'flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ease-in-out transform focus:outline-none',
                    selectedRating === value
                      ? 'scale-110 bg-primary/20 ring-2 ring-primary/80 shadow-lg'
                      : 'scale-90 opacity-70 hover:opacity-100 hover:scale-100'
                  )}
                  aria-label={`Rate as ${value}`}
                >
                  <div className="h-16 w-16">
                      <DotLottieReact
                        src={lottieSrc}
                        loop={selectedRating === value}
                        autoplay={selectedRating === value}
                        playOnHover={selectedRating !== value}
                        style={{ height: '100%', width: '100%' }}
                      />
                  </div>
                </button>
            ))}
          </div>
          <Textarea
            placeholder="Tell us more... (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Sending..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
