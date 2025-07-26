
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { CardData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { downloadQrCode } from '@/lib/card-utils';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Phone,
  Mail,
  Globe,
  Contact,
  Link as LinkIcon,
  MapPin,
  FileText,
  Download,
} from 'lucide-react';
import { iconMapping, getHref } from '@/lib/card-utils';

const ModernImageSlider = dynamic(() => import('@/components/modern-image-slider'));

interface TemplateProps {
  cardData: CardData;
  vcfData: string;
  qrCodeValue: string;
  isExporting: false | 'png' | 'pdf';
}

const TemplateEight = React.forwardRef<HTMLDivElement, TemplateProps>(
  ({ cardData, vcfData, qrCodeValue, isExporting }, ref) => {
    const { toast } = useToast();
    const hasBgImage = !!cardData.backgroundImage;
    const workGalleryData = cardData.links.workGallery;
    const galleryEnabled = workGalleryData.enabled;
    const hasUploadedImages = galleryEnabled && workGalleryData.images && workGalleryData.images.length > 0;
    const hasGalleryLink = galleryEnabled && workGalleryData.value;
    const showGallery = galleryEnabled && (isExporting !== 'png');
    const brochureData = cardData.links.brochure;
    const brochureEnabled = brochureData.enabled;
    const hasBrochureContent = brochureEnabled && (!!brochureData.value || !!brochureData.fileData);
    const [qrCodeSize, setQrCodeSize] = useState(70);
    const useWhiteBg = !hasBgImage && cardData.backgroundColor === '#ffffff';

    const { logoShape = 'square', logoFit = 'contain' } = cardData;

    const logoContainerClasses = cn(
      "relative w-14 h-14 md:w-24 md:h-24 shrink-0 flex items-center justify-center overflow-hidden",
      {
        'rounded-full': logoShape === 'circle',
        'rounded-xl': logoShape === 'rounded',
      }
    );

    const logoContainerStyles = logoShape === 'hexagon' ? { clipPath: 'polygon(50% 0, 90% 20%, 90% 80%, 50% 100%, 10% 80%, 10% 20%)' } : {};

    const logoImageClasses = cn(
      "w-full h-full",
      {
        'object-contain': logoFit === 'contain',
        'object-cover': logoFit === 'cover',
        'object-none': logoFit === 'fixed',
      },
      logoFit === 'contain' ? 'p-2' : ''
    );

    useEffect(() => {
        const checkSize = () => {
            setQrCodeSize(window.innerWidth < 768 ? 60 : 80);
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    const activeLinks = Object.entries(cardData.links).filter(([, link]) => link.enabled);

    const QrIcon = () => {
        const { qrCodeContent } = cardData;
        const iconMap: { [key: string]: React.ElementType } = {
            vcf: Contact,
            website: Globe,
            brochure: FileText,
            location: MapPin,
            custom: LinkIcon,
        };
        const Icon = iconMap[qrCodeContent || 'vcf'];

        return (
            <Icon className="h-4 w-4 md:h-5 md:h-5 text-[var(--card-primary-color)]" />
        );
    };

    const handleQrDownload = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const result = await downloadQrCode(qrCodeValue, cardData.companyName);
      if (result.success) {
        toast({
          title: "QR Code Downloaded",
          description: `Saved as ${result.filename}`,
        });
      } else {
        toast({
          title: "Download Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    };

    return (
      <div
        ref={ref}
        id="visiting-card"
        className={cn("aspect-[1050/600] w-full shadow-lg rounded-xl overflow-hidden flex")}
        style={{
          '--card-primary-color': cardData.primaryColor || 'hsl(var(--primary))',
          '--card-accent-color': cardData.accentColor || 'hsl(var(--accent))',
          backgroundColor: cardData.backgroundColor,
          fontFamily: cardData.fontFamily || 'Inter',
        } as React.CSSProperties}
      >
        {hasBgImage && <Image src={cardData.backgroundImage!} alt="Card Background" fill className="object-cover opacity-10 z-0" />}
        
        <div className={cn("relative z-10 w-[40%] h-full p-2 md:p-6 flex flex-col justify-between items-center text-center text-primary-foreground", hasBgImage ? 'bg-primary/80 backdrop-blur-sm' : 'bg-[var(--card-primary-color)]')}>
            <div>
              <h1 className="text-base md:text-4xl font-bold break-words">{cardData.contactPersonName || "Your Name"}</h1>
              <p className="text-[10px] md:text-xl opacity-90 mt-1 break-words">{cardData.designation || "Your Designation"}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center items-center">
                {activeLinks.map(([key, link]) => {
                    const Icon = iconMapping[key as keyof typeof iconMapping];
                    if (!Icon) return null;
                        const href = getHref(key, link);
                        const hasValue = !!((key === 'call' || key === 'whatsapp') ? (link as any).number : (link as any).value) || (key === 'brochure' && hasBrochureContent) || (key === 'workGallery' && (hasUploadedImages || hasGalleryLink));

                        if (key === 'workGallery') {
                        return showGallery && (
                            <React.Fragment key={key}>
                            {hasUploadedImages ? (
                                <Dialog><DialogTrigger asChild><button data-gallery-trigger="true" className={cn("group focus:outline-none", !hasValue && "pointer-events-none opacity-50")}><Icon className="h-4 w-4 md:h-7 md:h-7 text-primary-foreground transition-all duration-300 group-hover:text-[var(--card-accent-color)]" /></button></DialogTrigger>
                                <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none shadow-none" hideCloseButton>
                                   <ModernImageSlider images={workGalleryData.images!} companyLogo={cardData.companyLogo} />
                                </DialogContent></Dialog>
                            ) : ( <a data-gallery-trigger="true" href={hasValue ? href : '#'} target={hasValue ? "_blank" : "_self"} rel="noopener noreferrer" className={cn("group", !hasValue && "pointer-events-none opacity-50")}><Icon className="h-4 w-4 md:h-7 md:h-7 text-primary-foreground transition-all duration-300 group-hover:text-[var(--card-accent-color)]" /></a> )}
                            </React.Fragment>
                        )
                    }
                    if (key === 'brochure') {
                        return <a key={key} href={hasValue ? href : '#'} download={brochureData.fileData ? (brochureData.fileName || 'brochure') : undefined} target={!brochureData.fileData && hasValue ? "_blank" : "_self"} rel="noopener noreferrer" className={cn("group", !hasValue && "pointer-events-none opacity-50")}><Icon className="h-4 w-4 md:h-7 md:h-7 text-primary-foreground transition-all duration-300 group-hover:text-[var(--card-accent-color)]" /></a>
                    }

                    return(
                        <a key={key} href={hasValue ? href : '#'} target={hasValue ? "_blank" : "_self"} rel="noopener noreferrer" className={cn("group", !hasValue && "pointer-events-none opacity-50")}>
                            <Icon className="h-4 w-4 md:h-7 md:h-7 text-primary-foreground transition-all duration-300 group-hover:text-[var(--card-accent-color)]" />
                        </a>
                    );
                })}
            </div>

             <div className="flex flex-col items-center gap-2">
                <div data-qr-code-wrapper="true" className="relative group/qr p-1.5 bg-white rounded-lg border">
                    {qrCodeValue ? (
                        <div className="relative" style={{ width: qrCodeSize, height: qrCodeSize }}>
                            <Image
                                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                                    qrCodeValue
                                )}&size=1000x1000&margin=0&ecc=H`}
                                alt="QR Code"
                                fill
                                className="object-contain"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-5 w-5 md:h-8 md:w-8 bg-white/90 rounded-full flex items-center justify-center">
                                    <QrIcon />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: qrCodeSize, height: qrCodeSize }} className="flex items-center justify-center bg-gray-100 rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-1/2 h-1/2 text-muted-foreground opacity-50"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/><path d="M12 21h.01"/></svg>
                        </div>
                    )}
                    {qrCodeValue && (
                        <button
                            onClick={handleQrDownload}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity duration-300 rounded-lg cursor-pointer"
                            aria-label="Download QR Code"
                        >
                            <Download className="h-1/3 w-1/3 text-white" />
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className={cn("relative z-10 w-[60%] h-full p-2 md:p-6 flex flex-col items-start justify-between text-left", (hasBgImage || !useWhiteBg) ? 'bg-card/80 backdrop-blur-sm' : 'bg-card')}>
            <div className="w-full flex items-center gap-2 md:gap-4">
                <div className={logoContainerClasses} style={logoContainerStyles}>
                    {cardData.companyLogo ? (
                        <Image data-ai-hint="logo" src={cardData.companyLogo} alt="Company Logo" fill className={logoImageClasses} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                            <span className="text-[10px] md:text-sm text-muted-foreground">Logo</span>
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <h2 className="text-sm md:text-3xl font-bold break-words">{cardData.companyName || "Your Company Name"}</h2>
                    {(cardData.companySlogan || !cardData.companyName) && <p className="text-[9px] md:text-lg mt-1 text-muted-foreground break-words">{cardData.companySlogan || "Your Company Slogan"}</p>}
                </div>
            </div>

            <div className="space-y-1 md:space-y-2 text-[9px] md:text-base">
                {cardData.contactDetails?.map((contact, index) =>
                    (contact.phone || !cardData.contactPersonName) && (
                    <p key={index} className="flex items-center gap-1.5 md:gap-2 break-all">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 shrink-0 text-muted-foreground" />
                        <span><strong className='font-medium'>{contact.name || 'Phone'}:</strong> {contact.phone ? `${contact.countryCode || ''} ${contact.phone}`: 'xxxxx-xxxxx'}</span>
                    </p>
                    )
                )}
                {cardData.links.email.enabled && (cardData.links.email.value || !cardData.contactPersonName) && (
                    <p className="flex items-center gap-1.5 md:gap-2 break-all"><Mail className="h-3 w-3 md:h-4 md:w-4 shrink-0 text-muted-foreground" /><strong className='font-medium'>Email:</strong> <span className="break-all">{cardData.links.email.value || "your.email@example.com"}</span></p>
                )}
                {cardData.links.website.enabled && (cardData.links.website.value || !cardData.contactPersonName) && (
                    <p className="flex items-center gap-1.5 md:gap-2 break-all"><Globe className="h-3 w-3 md:h-4 md:w-4 shrink-0 text-muted-foreground" /><strong className='font-medium'>Website:</strong> <span className="break-all">{cardData.links.website.value || "your-website.com"}</span></p>
                )}
                {(cardData.address || !cardData.contactPersonName) && (
                    <p className='flex items-start gap-1.5 md:gap-2 break-words'><MapPin className="h-3 w-3 md:h-4 md:w-4 shrink-0 text-muted-foreground mt-0.5" /><strong className='font-medium'>Address:</strong> <span className="break-words">{cardData.address || "123 Example St, City"}</span></p>
                )}
            </div>

            {/* This space is intentionally left blank as QR is moved to the left */}
            <div></div>
        </div>
      </div>
    );
  }
);

TemplateEight.displayName = 'TemplateEight';
export default TemplateEight;
