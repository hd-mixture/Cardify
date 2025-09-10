
import { CardData, VCardDetails } from './types';

function generateDetailedVcf(details: VCardDetails): string {
    let vcfString = `BEGIN:VCARD\n`;
    vcfString += `VERSION:3.0\n`;
    
    // Name and Formatted Name
    const nameParts = [details.firstName || '', details.lastName || ''].filter(Boolean);
    if (nameParts.length > 0) {
      vcfString += `N:${details.lastName || ''};${details.firstName || ''};;;\n`;
      vcfString += `FN:${nameParts.join(' ')}\n`;
    }

    if (details.title) vcfString += `TITLE:${details.title}\n`;
    if (details.company) vcfString += `ORG:${details.company}\n`;

    if (details.phoneBusiness) vcfString += `TEL;TYPE=WORK,VOICE:${details.phoneBusiness}\n`;
    if (details.phoneMobile) vcfString += `TEL;TYPE=CELL:${details.phoneMobile}\n`;
    if (details.phonePersonal) vcfString += `TEL;TYPE=HOME,VOICE:${details.phonePersonal}\n`;
    
    const adr = [details.street, details.city, '', details.zip, details.country].filter(Boolean);
    if (adr.length > 0) {
      const formattedAddress = `;;${details.street || ''};${details.city || ''};;${details.zip || ''};${details.country || ''}`;
      vcfString += `ADR;TYPE=WORK:${formattedAddress}\n`;
    }

    if (details.emailBusiness) vcfString += `EMAIL;TYPE=WORK:${details.emailBusiness}\n`;
    if (details.emailPersonal) vcfString += `EMAIL;TYPE=HOME:${details.emailPersonal}\n`;

    if (details.website) vcfString += `URL:${details.website}\n`;

    vcfString += `END:VCARD`;
    return vcfString;
}


export function generateVcf(data: CardData): string {
  const { vCardDetails } = data;

  // If vCardDetails has meaningful data, generate the full VCF string.
  if (vCardDetails && Object.values(vCardDetails).some(v => !!v)) {
    return generateDetailedVcf(vCardDetails);
  }

  // Otherwise, return an empty string. This will signal to the preview component
  // that there is no valid QR code value to display, triggering the placeholder.
  return '';
}
