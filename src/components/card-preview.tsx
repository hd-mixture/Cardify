
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { CardData } from '@/lib/types';
import { generateVcf } from '@/lib/vcf';
import { Skeleton } from './ui/skeleton';

const TemplateOne = dynamic(() => import('./card-templates/template-one'), { loading: () => <TemplateSkeleton /> });
const TemplateTwo = dynamic(() => import('./card-templates/template-two'), { loading: () => <TemplateSkeleton /> });
const TemplateThree = dynamic(() => import('./card-templates/template-three'), { loading: () => <TemplateSkeleton /> });
const TemplateFour = dynamic(() => import('./card-templates/template-four'), { loading: () => <TemplateSkeleton /> });
const TemplateFive = dynamic(() => import('./card-templates/template-five'), { loading: () => <TemplateSkeleton /> });
const TemplateSix = dynamic(() => import('./card-templates/template-six'), { loading: () => <TemplateSkeleton /> });
const TemplateSeven = dynamic(() => import('./card-templates/template-seven'), { loading: () => <TemplateSkeleton /> });
const TemplateEight = dynamic(() => import('./card-templates/template-eight'), { loading: () => <TemplateSkeleton /> });
const TemplateNine = dynamic(() => import('./card-templates/template-nine'), { loading: () => <TemplateSkeleton /> });

interface CardPreviewProps {
  cardData: CardData;
  isExporting?: false | 'png' | 'pdf';
}

const TemplateSkeleton = () => <Skeleton className="aspect-[1050/600] w-full" />;

const templates: { [key: string]: React.ElementType } = {
  'template-1': TemplateOne,
  'template-2': TemplateTwo,
  'template-3': TemplateThree,
  'template-4': TemplateFour,
  'template-5': TemplateFive,
  'template-6': TemplateSix,
  'template-7': TemplateSeven,
  'template-8': TemplateEight,
  'template-9': TemplateNine,
};

const CardPreview = React.forwardRef<HTMLDivElement, CardPreviewProps>(
  ({ cardData, isExporting = false }, ref) => {
    const vcfData = generateVcf(cardData);
    const selectedTemplate = cardData.template || 'template-1';
    const TemplateComponent = templates[selectedTemplate] || TemplateOne;
    
    const getQrCodeValue = () => {
      const { qrCodeContent, qrCodeCustomUrl, links } = cardData;
      const fallback = ''; // Use an empty string to prevent incorrect fallbacks

      switch (qrCodeContent) {
        case 'website':
          return links.website.enabled && links.website.value ? links.website.value : fallback;
        case 'brochure':
          // For QR codes, only the URL is practical. Data URIs of files are too large.
          return links.brochure.enabled && links.brochure.value ? links.brochure.value : fallback;
        case 'location':
          return links.location.enabled && links.location.value ? links.location.value : fallback;
        case 'custom':
          return qrCodeCustomUrl || fallback;
        case 'vcf':
        default:
          return vcfData;
      }
    };

    const qrCodeValue = getQrCodeValue();

    return (
      <TemplateComponent
        ref={ref}
        cardData={cardData}
        vcfData={vcfData}
        qrCodeValue={qrCodeValue}
        isExporting={isExporting}
      />
    );
  }
);

CardPreview.displayName = 'CardPreview';

export default CardPreview;
