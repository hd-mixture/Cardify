
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
  Globe,
  FileText,
  Contact,
  Link as LinkIcon,
  MapPin,
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

const TemplateOne = React.forwardRef<HTMLDivElement, TemplateProps>(
  ({ cardData, vcfData, qrCodeValue, isExporting }, ref) => {
    const { toast } = useToast();
    const hasBgImage = !!cardData.backgroundImage;

    const workGalleryData = cardData.links.workGallery;
    const galleryEnabled = workGalleryData.enabled;
    const hasUploadedImages = galleryEnabled && workGalleryData.images && workGalleryData.images.length > 0;
    const hasGalleryLink = galleryEnabled && workGalleryData.value;
    const GalleryIcon = iconMapping['workGallery'];
    const showGallery = galleryEnabled && (isExporting !== 'png');

    const brochureData = cardData.links.brochure;
    const brochureEnabled = brochureData.enabled;
    const hasBrochureContent = brochureEnabled && (!!brochureData.value || !!brochureData.fileData);
    const BrochureIcon = iconMapping['brochure'];
    const [qrCodeSize, setQrCodeSize] = useState(60);
    
    const useWhiteBg = !hasBgImage && cardData.backgroundColor === '#ffffff';

    const { logoShape = 'square', logoFit = 'contain', logoRemoveBorder = false } = cardData;

    const logoContainerClasses = cn(
      "relative w-12 h-12 md:w-24 md:h-24 mb-1 md:mb-4 bg-white flex items-center justify-center overflow-hidden",
      {
        'rounded-full': logoShape === 'circle',
        'rounded-xl': logoShape === 'rounded',
        'border-2 border-white': !logoRemoveBorder,
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
            setQrCodeSize(window.innerWidth < 768 ? 50 : 100);
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    const activeLinks = Object.entries(cardData.links)
      .filter(([, link]) => link.enabled)
      .filter(([key]) => key !== 'workGallery' && key !== 'brochure')
      .map(([key, link]) => {
          const value = (key === 'call' || key === 'whatsapp') ? (link as any).number : (link as any).value;
          const hasValue = !!value;
          return {
              key,
              Icon: iconMapping[key as keyof typeof iconMapping],
              href: getHref(key, link),
              hasValue: hasValue,
          }
      });
      
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
            <Icon className="h-4 w-4 md:h-6 md:w-6 text-[var(--card-primary-color)]" />
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
        className={cn(
          "aspect-[1050/600] w-full shadow-lg rounded-xl overflow-hidden",
          "transition-all duration-300 ease-in-out relative"
        )}
        style={{
          '--card-primary-color': cardData.primaryColor || 'hsl(var(--primary))',
          '--card-accent-color': cardData.accentColor || 'hsl(var(--accent))',
          backgroundColor: cardData.backgroundColor,
          fontFamily: cardData.fontFamily || 'Inter',
        } as React.CSSProperties}
      >
        {hasBgImage && (
            <Image
                src={cardData.backgroundImage!}
                alt="Card Background"
                fill
                className="object-cover opacity-15 z-0"
            />
        )}
        <div className="relative z-10 flex h-full w-full">
          {/* Left Section */}
          <div className={cn(
            "w-1/3 text-primary-foreground p-2 md:p-6 flex flex-col justify-between items-center text-center",
            hasBgImage ? 'bg-primary/80 backdrop-blur-sm' : 'bg-[var(--card-primary-color)]'
            )}>
            <div className="w-full flex flex-col items-center">
                <div className={logoContainerClasses} style={logoContainerStyles}>
                    {cardData.companyLogo ? (
                        <Image data-ai-hint="logo" src={cardData.companyLogo} alt="Company Logo" fill className={logoImageClasses} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/20">
                            <span className="text-[10px] md:text-sm text-gray-400">Logo</span>
                        </div>
                    )}
                </div>
                <h2 className="text-xs md:text-2xl font-bold break-words">{cardData.companyName || "Your Company Name"}</h2>
                { (cardData.companySlogan || !cardData.companyName) && <p className="text-[9px] md:text-lg leading-tight mt-1 break-words">{cardData.companySlogan || "Your Company Slogan"}</p>}
            </div>
            
            <div className="flex flex-col items-center">
                <div data-qr-code-wrapper="true" className="relative group/qr p-1 md:p-1.5 bg-white rounded-md">
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
                                <div className="h-5 w-5 md:h-9 md:w-9 bg-white/90 rounded-full flex items-center justify-center">
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

          {/* Right Section */}
          <div className={cn(
              "w-2/3 text-card-foreground p-2 md:p-6 flex flex-col",
              (hasBgImage || !useWhiteBg) ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'
            )}>
            <div className="flex-grow">
              <h1 className={cn(
                "text-lg md:text-4xl font-bold break-words",
                 (hasBgImage || !useWhiteBg) ? "text-primary" : "text-[var(--card-primary-color)]"
                 )}>{cardData.contactPersonName || "Your Name"}</h1>
              <p className="text-sm md:text-xl text-muted-foreground mt-1 break-words">{cardData.designation || "Your Designation"}</p>

              <div className="border-t my-2 md:my-4 border-border"></div>

              {(cardData.address || !cardData.contactPersonName) && <p className="text-[10px] md:text-base mb-1 md:mb-2 break-words">{cardData.address || "123 Example St, City"}</p>}

              <div className="space-y-1 md:space-y-1.5 text-[9px] md:text-sm">
                {cardData.contactDetails?.map((contact, index) =>
                  (contact.phone || !cardData.contactPersonName) && (
                    <div key={index} className="flex items-center break-all">
                      <span className="font-semibold w-8 md:w-20 shrink-0">{contact.name || `Contact ${index+1}`}:</span>
                      <span>{contact.phone ? `${contact.countryCode || ''} ${contact.phone}` : 'xxxxx-xxxxx'}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-auto pt-2">
                <div className="flex flex-wrap gap-1 md:gap-3 justify-center">
                    {activeLinks.map(({ key, Icon, href, hasValue }) => {
                       if (!Icon) return null;
                       return (
                       <a 
                          key={key} 
                          href={href} 
                          target={hasValue ? "_blank" : "_self"}
                          rel="noopener noreferrer" 
                          className={cn("text-center group", !hasValue && "pointer-events-none opacity-50")}
                        >
                            <div className={cn(
                              "w-7 h-7 md:w-11 md:h-11 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300",
                              hasValue && "group-hover:bg-[var(--card-accent-color)]"
                            )}>
                                <Icon className={cn(
                                  "h-3 w-3 md:h-6 md:h-6 text-gray-600 transition-all duration-300",
                                  hasValue && "group-hover:text-white"
                                  )} />
                            </div>
                       </a>
                       )
                    })}
                    
                    {brochureEnabled && (
                       <a
                          href={hasBrochureContent ? getHref('brochure', brochureData) : '#'}
                          download={brochureData.fileData ? (brochureData.fileName || 'brochure') : undefined}
                          target={!brochureData.fileData && hasBrochureContent ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={cn("text-center group", !hasBrochureContent && "pointer-events-none opacity-50")}
                          aria-label="Download brochure"
                        >
                          <div className={cn(
                              "w-7 h-7 md:w-11 md:h-11 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300",
                              hasBrochureContent && "group-hover:bg-[var(--card-accent-color)]"
                            )}>
                              <BrochureIcon className={cn(
                                  "h-3 w-3 md:h-6 md:h-6 text-gray-600 transition-all duration-300",
                                  hasBrochureContent && "group-hover:text-white"
                                  )} />
                          </div>
                       </a>
                    )}

                    {showGallery && (
                      <>
                        {hasUploadedImages ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button data-gallery-trigger="true" className="text-center group focus:outline-none" aria-label="Open work gallery">
                                <div className="w-7 h-7 md:w-11 md:h-11 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--card-accent-color)]">
                                    <GalleryIcon className="h-3 w-3 md:h-6 md:h-6 text-gray-600 transition-all duration-300 group-hover:text-white" />
                                </div>
                              </button>
                            </DialogTrigger>
                             <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none shadow-none" hideCloseButton>
                               <ModernImageSlider images={workGalleryData.images!} companyLogo={cardData.companyLogo} />
                            </DialogContent>
                          </Dialog>
                        ) : hasGalleryLink ? (
                          <a data-gallery-trigger="true" href={getHref('workGallery', { enabled: true, value: workGalleryData.value!})} target="_blank" rel="noopener noreferrer" className="text-center group">
                            <div className="w-7 h-7 md:w-11 md:h-11 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--card-accent-color)]">
                                <GalleryIcon className="h-3 w-3 md:h-6 md:h-6 text-gray-600 transition-all duration-300 group-hover:text-white" />
                            </div>
                          </a>
                        ) : (
                          <div data-gallery-trigger="true" className="text-center group opacity-50 cursor-not-allowed">
                            <div className="w-7 h-7 md:w-11 md:h-11 rounded-full bg-gray-100 flex items-center justify-center">
                                <GalleryIcon className="h-3 w-3 md:h-6 md:h-6 text-gray-600" />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TemplateOne.displayName = 'TemplateOne';
export default TemplateOne;
