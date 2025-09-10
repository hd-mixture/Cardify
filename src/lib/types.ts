
import { z } from 'zod';

export const contactDetailSchema = z.object({
  name: z.string().optional(),
  countryCode: z.string().optional(),
  phone: z.string().optional(),
});

const linkPhoneSchema = z.object({ 
    enabled: z.boolean(), 
    countryCode: z.string(), 
    number: z.string() 
});

export const vCardDetailsSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  emailPersonal: z.string().email('Invalid email').or(z.literal('')).optional(),
  emailBusiness: z.string().email('Invalid email').or(z.literal('')).optional(),
  phonePersonal: z.string().optional(),
  phoneMobile: z.string().optional(),
  phoneBusiness: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
});

export type VCardDetails = z.infer<typeof vCardDetailsSchema>;

export const cardDataSchema = z.object({
  template: z.string().optional(),
  companyName: z.string().min(1, { message: "Company name is required." }),
  companySlogan: z.string().optional(),
  contactPersonName: z.string().min(1, { message: "Name is required." }),
  designation: z.string().min(1, { message: "Designation is required." }),
  address: z.string().min(1, { message: "Address is required." }),
  companyLogo: z.string().optional(),
  logoShape: z.enum(['square', 'circle', 'rounded', 'hexagon']).default('rounded').optional(),
  logoFit: z.enum(['contain', 'cover', 'fixed']).default('cover').optional(),
  logoRemoveBorder: z.boolean().optional().default(false),
  backgroundImage: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
  qrCodeContent: z.string().optional(),
  qrCodeCustomUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  contactDetails: z.array(contactDetailSchema).max(3).optional(),
  links: z.object({
    call: linkPhoneSchema,
    whatsapp: linkPhoneSchema,
    location: z.object({ enabled: z.boolean(), value: z.string() }),
    email: z.object({ enabled: z.boolean(), value: z.string().email('Invalid email address').or(z.literal('')) }),
    website: z.object({ enabled: z.boolean(), value: z.string().url('Invalid URL').or(z.literal('')) }),
    brochure: z.object({ 
      enabled: z.boolean(), 
      value: z.string().url('Invalid URL').or(z.literal('')),
      fileData: z.string().optional(),
      fileName: z.string().optional(),
    }),
    workGallery: z.object({ enabled: z.boolean(), value: z.string().url('Invalid URL').or(z.literal('')), images: z.array(z.string()).optional() }),
    facebook: z.object({ enabled: z.boolean(), value: z.string().url('Invalid URL').or(z.literal('')) }),
    twitter: z.object({ enabled: z.boolean(), value: z.string().url('Invalid URL').or(z.literal('')) }),
    instagram: z.object({ enabled: z.boolean(), value: z.string().url('Invalid URL').or(z.literal('')) }),
    linkedin: z.object({ enabled: z.boolean(), value: z.string().url('Invalid URL').or(z.literal('')) }),
    youtube: z.object({ enabled: z.boolean(), value: z.string().url('Invalid URL').or(z.literal('')) }),
  }),
  vCardDetails: vCardDetailsSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.contactDetails?.some(c => c.phone && c.phone.trim().length >= 10)) {
        // At least one phone number is valid, so we are good.
        return;
    }
    
    // If no phone number is valid, check if any has been partially filled.
    const hasPartialPhone = data.contactDetails?.some(c => c.phone && c.phone.trim().length > 0);
    
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: hasPartialPhone ? "Phone number must be at least 10 digits." : "At least one contact number is required.",
        path: ['contactDetails'],
    });
});

export type CardData = z.infer<typeof cardDataSchema>;

// Get field names from Zod schema for type safety
type CardDataKeys = keyof CardData;
export type CardDataField =
  | CardDataKeys
  | `links.${keyof CardData['links']}`
  | `contactDetails.${number}.${keyof z.infer<typeof contactDetailSchema>}`
  | `links.${keyof CardData['links']}.value`
  | `links.${keyof CardData['links']}.enabled`
  | `links.call.number`
  | `links.call.countryCode`
  | `links.whatsapp.number`
  | `links.whatsapp.countryCode`
  | `links.workGallery.images`
  | `links.brochure.fileName`
  | `links.brochure.fileData`
  | 'logoShape'
  | 'logoFit'
  | 'logoRemoveBorder';
  

export const defaultCardData: CardData = {
  template: "template-1",
  companyName: "",
  companySlogan: "",
  contactPersonName: "",
  designation: "",
  address: "",
  companyLogo: "",
  logoShape: "rounded",
  logoFit: "cover",
  logoRemoveBorder: false,
  backgroundImage: "",
  primaryColor: "#0ea5e9",
  accentColor: "#008080",
  backgroundColor: "#ffffff",
  fontFamily: "Inter",
  qrCodeContent: 'vcf',
  qrCodeCustomUrl: '',
  contactDetails: [
    { name: "Work", countryCode: "+91", phone: "" },
  ],
  links: {
    call: { enabled: true, countryCode: "+91", number: "" },
    whatsapp: { enabled: false, countryCode: "+91", number: "" },
    location: { enabled: false, value: "" },
    email: { enabled: true, value: "" },
    website: { enabled: true, value: "" },
    brochure: { enabled: false, value: "", fileData: "", fileName: "" },
    workGallery: { enabled: false, value: "", images: [] },
    facebook: { enabled: false, value: "" },
    twitter: { enabled: false, value: "" },
    instagram: { enabled: false, value: "" },
    linkedin: { enabled: false, value: "" },
    youtube: { enabled: false, value: "" },
  },
  vCardDetails: {
    firstName: '',
    lastName: '',
    title: '',
    company: '',
    emailPersonal: '',
    emailBusiness: '',
    phonePersonal: '',
    phoneMobile: '',
    phoneBusiness: '',
    street: '',
    city: '',
    zip: '',
    country: '',
    website: '',
  }
};
