
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

const TemplateThree = React.forwardRef<HTMLDivElement, TemplateProps>(
  ({ cardData, vcfData, qrCodeValue, isExporting }, ref) => {
    const { toast } = useToast();
    const hasBgImage = !!cardData.backgroundImage;
    const workGalleryData = cardData.links.workGallery;
    const galleryEnabled = workGalleryData.enabled;
    const hasUploadedImages = galleryEnabled && workGalleryData.images && workGalleryData.images.length > 0;
    const hasGalleryLink = galleryEnabled && workGalleryData.value;
    const showGallery = galleryEnabled && (isExporting !== 'png');
    const brochureData = cardData.links.brochure;
    const hasBrochureContent = brochureData.enabled && (!!brochureData.value || !!brochureData.fileData);
    const [qrCodeSize, setQrCodeSize] = useState(70);
    const useWhiteBg = !hasBgImage && cardData.backgroundColor === '#ffffff';

    const { logoShape = 'square', logoFit = 'contain' } = cardData;

    const logoContainerClasses = cn(
      "relative w-10 h-10 md:w-20 md:h-20 shrink-0 flex items-center justify-center overflow-hidden",
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
      logoFit === 'contain' ? 'p-1' : ''
    );

    useEffect(() => {
        const checkSize = () => {
            setQrCodeSize(window.innerWidth < 768 ? 60 : 90);
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    const activeLinks = Object.entries(cardData.links)
      .filter(([key, link]) => link.enabled)
      .map(([key, link]) => ({
          key,
          Icon: iconMapping[key as keyof typeof iconMapping],
          href: getHref(key, link),
          hasValue: !!((key === 'call' || key === 'whatsapp') ? (link as any).number : (link as any).value) || (key === 'brochure' && hasBrochureContent) || (key === 'workGallery' && (hasUploadedImages || hasGalleryLink)),
      }));

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
        className={cn("aspect-[1050/600] w-full shadow-lg rounded-xl overflow-hidden relative flex flex-col p-2 md:p-6")}
        style={{
          '--card-primary-color': cardData.primaryColor || 'hsl(var(--primary))',
          '--card-accent-color': cardData.accentColor || 'hsl(var(--accent))',
          backgroundColor: cardData.backgroundColor,
          fontFamily: cardData.fontFamily || 'Inter',
        } as React.CSSProperties}
      >
        {hasBgImage && <Image src={cardData.backgroundImage!} alt="Card Background" fill className="object-cover opacity-10 z-0" />}
        <div className={cn("relative z-10 w-full h-full flex flex-col justify-between", (hasBgImage || !useWhiteBg) && "bg-card/60 backdrop-blur-sm rounded-lg p-1.5 md:p-4")}>
            
            <header className="flex items-center gap-2 md:gap-4 border-b pb-1 md:pb-2">
                <div className={logoContainerClasses} style={logoContainerStyles}>
                  {cardData.companyLogo ? (
                      <Image data-ai-hint="logo" src={cardData.companyLogo} alt="Company Logo" fill className={logoImageClasses} />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-md bg-muted/50">
                          <span className="text-[10px] md:text-sm text-muted-foreground">Logo</span>
                      </div>
                  )}
                </div>
                <div className="flex-grow">
                    <h2 className="text-sm md:text-3xl font-bold text-[var(--card-primary-color)] break-words">{cardData.companyName || "Your Company Name"}</h2>
                    {(cardData.companySlogan || !cardData.companyName) && <p className="text-[9px] md:text-base text-muted-foreground break-words">{cardData.companySlogan || "Your Company Slogan"}</p>}
                </div>
            </header>

            <main className="flex-grow flex items-center py-1">
                <div className="w-full flex justify-between items-start gap-2 md:gap-8">
                    <div className="space-y-0.5 text-left flex-grow">
                        <h1 className="text-base md:text-4xl font-bold break-words">{cardData.contactPersonName || "Your Name"}</h1>
                        <p className="text-[9px] md:text-xl text-muted-foreground break-words">{cardData.designation || "Your Designation"}</p>
                        
                        <div className="pt-1.5 grid grid-cols-2 gap-x-2 md:gap-x-4 gap-y-0.5 text-[7px] md:text-sm">
                            {(cardData.address || !cardData.contactPersonName) && (
                                <p className="flex items-start gap-1 md:gap-2 break-words col-span-2 max-w-full"><MapPin className="h-2.5 w-2.5 md:h-4 md:w-4 shrink-0 mt-0.5" /><span>{cardData.address || "123 Example St, City"}</span></p>
                            )}
                            {cardData.contactDetails?.map((contact, index) =>
                                (contact.phone || !cardData.contactPersonName) && (
                                <div key={index} className="flex items-center gap-1 md:gap-2 break-all">
                                    <Phone className="h-2.5 w-2.5 md:h-4 md:w-4 shrink-0" />
                                    <span>{`${contact.name ? contact.name + ': ' : ''}${contact.phone ? `${contact.countryCode || ''} ${contact.phone}` : 'xxxxx-xxxxx'}`}</span>
                                </div>
                                )
                            )}
                            {cardData.links.email.enabled && (cardData.links.email.value || !cardData.contactPersonName) && (
                                <div className="flex items-center gap-1 md:gap-2 break-all">
                                    <Mail className="h-2.5 w-2.5 md:h-4 md:w-4 shrink-0" />
                                    <span className="break-all">{cardData.links.email.value || "your.email@example.com"}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center gap-2 shrink-0">
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
                                        <div className="h-5 w-5 md:h-8 md:w-8 bg-white/90 rounded-full flex items-center justify-center">
                                            <QrIcon />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ width: qrCodeSize, height: qrCodeSize }} className="flex items-center justify-center bg-gray-100 rounded-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-1/2 h-1/2 text-muted-foreground opacity-50"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/><path d="M12 21h.01"/></svg>
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
            </main>

            <footer className="w-full flex flex-wrap gap-x-2 md:gap-x-4 gap-y-1.5 justify-center items-center mt-1 pt-1 md:pt-2 border-t">
                {activeLinks.map(({ key, Icon, href, hasValue }) => {
                   if (!Icon) return null;
                   
                   if (key === 'workGallery') {
                      return showGallery && (
                          <React.Fragment key={key}>
                          {hasUploadedImages ? (
                            <Dialog><DialogTrigger asChild><button data-gallery-trigger="true" className={cn("group focus:outline-none", !hasValue && "pointer-events-none opacity-50")}><div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--card-accent-color)]"><Icon className="h-4 w-4 md:h-6 md:h-6 text-gray-600 group-hover:text-white" /></div></button></DialogTrigger>
                             <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none shadow-none" hideCloseButton>
                               <ModernImageSlider images={workGalleryData.images!} companyLogo={cardData.companyLogo} />
                            </DialogContent>
                            </Dialog>
                          ) : ( <a data-gallery-trigger="true" href={hasValue ? href : '#'} target={hasValue ? "_blank" : "_self"} rel="noopener noreferrer" className={cn("group", !hasValue && "pointer-events-none opacity-50")}><div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--card-accent-color)]"><Icon className="h-4 w-4 md:h-6 md:h-6 text-gray-600 group-hover:text-white" /></div></a> )}
                          </React.Fragment>
                      )
                  }

                   return (
                     <a key={key} href={href} target={hasValue ? "_blank" : "_self"} rel="noopener noreferrer" className={cn("text-center group", !hasValue && "pointer-events-none opacity-50")}>
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--card-accent-color)]"><Icon className="h-4 w-4 md:h-6 md:h-6 text-gray-600 group-hover:text-white" /></div>
                     </a>
                   )
                })}
            </footer>
        </div>
      </div>
    );
  }
);

TemplateThree.displayName = 'TemplateThree';
export default TemplateThree;
