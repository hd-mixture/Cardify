
import { 
    Phone, 
    MapPin, 
    Mail, 
    Globe, 
    FileText, 
    GalleryVerticalEnd 
} from 'lucide-react';

import {
    WhatsAppIcon,
    FacebookIcon,
    TwitterIcon,
    InstagramIcon,
    LinkedInIcon,
    YouTubeIcon
} from '@/components/social-icons';

export const iconMapping = {
  call: Phone,
  whatsapp: WhatsAppIcon,
  location: MapPin,
  email: Mail,
  website: Globe,
  brochure: FileText,
  workGallery: GalleryVerticalEnd,
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
};

export const getHref = (key: string, link: any): string => {
  if (!link.enabled) return '#';

  switch (key) {
    case 'call':
      return link.number ? `tel:${link.countryCode}${link.number.replace(/\D/g, '')}` : '#';
    case 'whatsapp':
      return link.number ? `https://wa.me/${link.countryCode.replace(/\D/g, '')}${link.number.replace(/\D/g, '')}` : '#';
    case 'email':
      return link.value ? `mailto:${link.value}` : '#';
    case 'brochure':
       if (link.fileData) return link.fileData;
       if (!link.value) return '#';
       return link.value.startsWith('http') ? link.value : `https://${link.value}`;
    case 'location':
    case 'website':
    case 'facebook':
    case 'twitter':
    case 'instagram':
    case 'linkedin':
    case 'youtube':
       if (!link.value) return '#';
       return link.value.startsWith('http') ? link.value : `https://` + link.value;
    default:
      return '#';
  }
};

export const downloadQrCode = async (qrCodeValue: string, companyName: string): Promise<{ success: boolean; filename?: string; message?: string }> => {
  if (!qrCodeValue) {
    return { success: false, message: "QR Code data is empty." };
  }

  const sanitizedFilename = (companyName || 'cardify_qr').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_qr.png';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    qrCodeValue
  )}&size=800x800&margin=20&ecc=H`;

  try {
    // Use fetch to get the image as a blob
    const response = await fetch(qrUrl);
    if (!response.ok) throw new Error('Failed to fetch QR code from API.');
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedFilename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the temporary URL
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename: sanitizedFilename };
  } catch (error) {
    console.error("QR Code download failed:", error);
    return { success: false, message: "Could not download the QR code. Please try again." };
  }
};
