
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
  MapPin,
  Mail,
  Globe,
  FileText,
  Contact,
  Link as LinkIcon,
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

const TemplateSeven = React.forwardRef<HTMLDivElement, TemplateProps>(
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

    const { logoShape = 'square', logoFit = 'contain', logoRemoveBorder = false } = cardData;

    const logoContainerClasses = cn(
      "w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden p-1",
      {
        'rounded-full': logoShape === 'circle',
        'rounded-xl': logoShape === 'rounded',
        'rounded-none': logoShape === 'square',
        'border-2 md:border-4 border-[var(--card-primary-color)]': !logoRemoveBorder,
      }
    );

    const logoContainerStyles = logoShape === 'hexagon' ? { clipPath: 'polygon(50% 0, 90% 20%, 90% 80%, 50% 100%, 10% 80%, 10% 20%)' } : {};

    const logoImageClasses = cn(
      "w-full h-full",
      {
        'object-contain': logoFit === 'contain',
        'object-cover': logoFit === 'cover',
        'object-none': logoFit === 'fixed',
      }
    );


    useEffect(() => {
        const checkSize = () => {
            setQrCodeSize(window.innerWidth < 768 ? 50 : 70);
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
            <Icon className="h-3 w-3 md:h-4 md:w-4 text-[var(--card-primary-color)]" />
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
        className={cn("aspect-[1050/600] w-full shadow-lg rounded-xl overflow-hidden flex flex-col")}
        style={{
          '--card-primary-color': cardData.primaryColor || 'hsl(var(--primary))',
          '--card-accent-color': cardData.accentColor || 'hsl(var(--accent))',
          backgroundColor: cardData.backgroundColor,
          fontFamily: cardData.fontFamily || 'Inter',
        } as React.CSSProperties}
      >
        {hasBgImage && <Image src={cardData.backgroundImage!} alt="Card Background" fill className="object-cover opacity-10 z-0" />}
        
        <div className="flex-grow min-h-0 flex flex-col justify-center">
          <div>
            <div className={cn("relative z-10 p-2 md:p-4 flex items-center gap-2 md:gap-6", (hasBgImage || !useWhiteBg) ? 'bg-card/80 backdrop-blur-sm' : 'bg-card')}>
                <div className="relative w-14 h-14 md:w-28 md:h-28 shrink-0">
                    <div className={logoContainerClasses} style={logoContainerStyles}>
                        <div className="relative w-full h-full flex items-center justify-center">
                            {cardData.companyLogo ? (
                                <Image data-ai-hint="logo" src={cardData.companyLogo} alt="Profile Photo" fill className={logoImageClasses} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                    <span className="text-[10px] md:text-sm text-muted-foreground">Logo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex-grow">
                    <h2 className="text-sm md:text-2xl font-bold break-words">{cardData.companyName || "Your Company Name"}</h2>
                    <h1 className="text-base md:text-3xl font-bold text-[var(--card-primary-color)] mt-0.5 break-words">{cardData.contactPersonName || "Your Name"}</h1>
                    <p className="text-xs md:text-lg text-muted-foreground break-words">{cardData.designation || "Your Designation"}</p>
                </div>
                <div className="flex flex-col items-center gap-1.5 pr-2">
                    <div data-qr-code-wrapper="true" className="relative group/qr p-1 md:p-1.5 bg-white rounded-md border">
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
                                    <div className="h-5 w-5 md:h-7 md:w-7 bg-white/90 rounded-full flex items-center justify-center">
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
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity duration-300 rounded-md cursor-pointer"
                                aria-label="Download QR Code"
                            >
                                <Download className="h-1/3 w-1/3 text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={cn("relative z-10 p-2 md:p-4 pt-0", (hasBgImage || !useWhiteBg) ? 'bg-card/80 backdrop-blur-sm' : 'bg-card')}>
                <div className="border-t pt-2 grid grid-cols-2 gap-x-2 md:gap-x-6 gap-y-1 text-[9px] md:text-sm">
                    {cardData.contactDetails?.map((contact, index) =>
                      (contact.phone || !cardData.contactPersonName) && (
                        <div key={index} className="flex items-center gap-1.5 md:gap-2">
                            <Phone className="h-3 w-3 md:h-5 md:h-5 text-[var(--card-accent-color)] shrink-0" />
                            <div>
                                <div className="font-medium break-all">{contact.name || 'Phone'}</div>
                                <div className="break-all">{contact.phone ? `${contact.countryCode || ''} ${contact.phone}`: 'xxxxx-xxxxx'}</div>
                            </div>
                        </div>
                      )
                    )}
                    {cardData.links.email.enabled && (cardData.links.email.value || !cardData.contactPersonName) && (
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <Mail className="h-3 w-3 md:h-5 md:h-5 text-[var(--card-accent-color)] shrink-0" />
                            <div>
                                <div className="font-medium">Email</div>
                                <div className="break-all">{cardData.links.email.value || "your.email@example.com"}</div>
                            </div>
                        </div>
                    )}
                    {cardData.links.website.enabled && (cardData.links.website.value || !cardData.contactPersonName) && (
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <Globe className="h-3 w-3 md:h-5 md:h-5 text-[var(--card-accent-color)] shrink-0" />
                            <div>
                                <div className="font-medium">Website</div>
                                <div className="break-all">{cardData.links.website.value || "your-website.com"}</div>
                            </div>
                        </div>
                    )}
                    {(cardData.address || !cardData.contactPersonName) && (
                        <div className="flex items-start gap-1.5 md:gap-2 col-span-2">
                            <MapPin className="h-3 w-3 md:h-5 md:h-5 text-[var(--card-accent-color)] shrink-0 mt-0.5" />
                            <div>
                                <div className="font-medium">Address</div>
                                <div className="break-words">{cardData.address || "123 Example St, City"}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
        <div className={cn("relative z-10 p-2 md:p-3 bg-[var(--card-primary-color)]")}>
            <div className="flex flex-wrap gap-x-3 md:gap-x-4 gap-y-2 justify-center items-center">
                {activeLinks.map(([key, link]) => {
                        const Icon = iconMapping[key as keyof typeof iconMapping];
                        if (!Icon) return null;
                        const href = getHref(key, link);
                        const hasValue = !!((key === 'call' || key === 'whatsapp') ? (link as any).number : (link as any).value) || (key === 'brochure' && hasBrochureContent) || (key === 'workGallery' && (hasUploadedImages || hasGalleryLink));

                        if (key === 'workGallery') {
                            return showGallery && (
                                <React.Fragment key={key}>
                                {hasUploadedImages ? (
                                  <Dialog><DialogTrigger asChild><button data-gallery-trigger="true" className={cn("group focus:outline-none", !hasValue && "pointer-events-none opacity-50")}><Icon className="h-4 w-4 md:h-6 md:h-6 text-primary-foreground transition-all duration-300 group-hover:text-white/80" /></button></DialogTrigger>
                                  <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none shadow-none" hideCloseButton>
                                     <ModernImageSlider images={workGalleryData.images!} companyLogo={cardData.companyLogo} />
                                  </DialogContent>
                                  </Dialog>
                                ) : ( <a data-gallery-trigger="true" href={hasValue ? href : '#'} target={hasValue ? "_blank" : "_self"} rel="noopener noreferrer" className={cn("group", !hasValue && "pointer-events-none opacity-50")}><Icon className="h-4 w-4 md:h-6 md:h-6 text-primary-foreground transition-all duration-300 group-hover:text-white/80" /></a> )}
                                </React.Fragment>
                            )
                        }
                        if (key === 'brochure') {
                          return <a key={key} href={hasValue ? href : '#'} download={brochureData.fileData ? (brochureData.fileName || 'brochure') : undefined} target={!brochureData.fileData && hasValue ? "_blank" : "_self"} rel="noopener noreferrer" className={cn("group", !hasValue && "pointer-events-none opacity-50")}><Icon className="h-4 w-4 md:h-6 md:h-6 text-primary-foreground transition-all duration-300 group-hover:text-white/80" /></a>
                        }

                        return(
                            <a key={key} href={hasValue ? href : '#'} target={hasValue ? "_blank" : "_self"} rel="noopener noreferrer" className={cn("group", !hasValue && "pointer-events-none opacity-50")}>
                                <Icon className="h-4 w-4 md:h-6 md:h-6 text-primary-foreground transition-all duration-300 group-hover:text-white/80" />
                            </a>
                        );
                    })}
            </div>
        </div>
      </div>
    );
  }
);

TemplateSeven.displayName = 'TemplateSeven';
export default TemplateSeven;
