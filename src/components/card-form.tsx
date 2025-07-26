
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperCore } from 'swiper';
import 'swiper/css';

import { CardData, cardDataSchema, CardDataField, VCardDetails } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, QrCode, Pencil, X, ArrowRight, ArrowLeft, Download, FileDown, Phone, Briefcase, Users, Info, Type, Building2, MessageSquare, Image as ImageIcon, UserCircle, MapPin, Link as LinkIcon, Palette, CheckCircle2, LayoutTemplate, Paintbrush, Square, Circle, AppWindow, Hexagon, Expand, Crop, Move, ShieldOff, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";
import { Switch } from '@/components/ui/switch';
import PhoneInput from 'react-phone-input-2';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FontPicker } from './font-picker';
import { ColorPicker } from '@/components/ui/color-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { TemplatePicker } from './template-picker';
import CardPreview from './card-preview';

interface CardFormProps {
  isMobile: boolean;
  data: CardData;
  dataVersion: number;
  onFormChange: (data: CardData) => void;
  onDownload: (format: 'png' | 'pdf') => void;
  onOpenVCardDialog: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  cardRef: React.RefObject<HTMLDivElement>;
}

const steps = [
  { id: 1, name: 'Company Info', icon: Building2, requiredFields: ['companyName'] },
  { id: 2, name: 'Contact Person', icon: UserCircle, requiredFields: ['contactPersonName', 'designation', 'address', 'contactDetails'] },
  { id: 3, name: 'Links & Actions', icon: LinkIcon, requiredFields: [] },
  { id: 4, name: 'Appearance', icon: Palette, requiredFields: [] },
  { id: 5, name: 'Finalize', icon: CheckCircle2, requiredFields: [] },
];

const communicationLinks = [
  { id: 'call', label: 'Call' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email', type: 'email' },
] as const;

const businessInfoLinks = [
  { id: 'website', label: 'Website', type: 'url' },
  { id: 'location', label: 'Location', type: 'url' },
  { id: 'brochure', label: 'Brochure' },
  { id: 'workGallery', label: 'Work Gallery' },
] as const;

const socialLinks = [
  { id: 'facebook', label: 'Facebook', type: 'url' },
  { id: 'twitter', label: 'Twitter/X', type: 'url' },
  { id: 'instagram', label: 'Instagram', type: 'url' },
  { id: 'linkedin', label: 'LinkedIn', type: 'url' },
  { id: 'youtube', label: 'YouTube', type: 'url' },
] as const;

const logoShapes = [
    { id: 'square', label: 'Square', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'rounded', label: 'Rounded', icon: AppWindow },
    { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
] as const;

const logoFits = [
    { id: 'contain', label: 'Fit to Box', icon: Expand },
    { id: 'cover', label: 'Crop to Center', icon: Crop },
    { id: 'fixed', label: 'Fixed Size', icon: Move },
] as const;


const DesktopFormLayout = (props: any) => {
  const { form, nextStep, prevStep, goToStep, currentStep, direction, variants, onDownload, isStepComplete } = props;
  
  const scrollableContainerRef = React.useRef<HTMLDivElement>(null);
  const Icon = steps[currentStep-1].icon;

  useEffect(() => {
    if (scrollableContainerRef.current) {
        scrollableContainerRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  return (
    <>
      <div className="px-6 sm:px-8 lg:px-10 py-1">
          <div className="flex w-full items-center gap-2">
              {steps.map((step, index) => {
                  const stepNumber = index + 1;
                  const isCompleted = stepNumber < currentStep;

                  return (
                      <button
                          key={step.id}
                          type="button"
                          onClick={() => goToStep(stepNumber)}
                          disabled={!isCompleted && stepNumber !== currentStep}
                          className={cn(
                              "h-1 flex-1 rounded-full transition-colors duration-500",
                              stepNumber <= currentStep ? "bg-primary" : "bg-muted",
                              (isCompleted || stepNumber === currentStep)
                              ? "cursor-pointer hover:bg-primary/80"
                              : "cursor-default"
                          )}
                          aria-label={`Go to step ${stepNumber}: ${step.name}`}
                      />
                  );
              })}
          </div>
          <div className="relative flex items-center justify-center mt-3 h-8">
              {currentStep > 1 && (
                  <Button
                      type="button"
                      onClick={prevStep}
                      variant="ghost"
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full h-9 w-9"
                      aria-label="Go back"
                  >
                      <ArrowLeft />
                  </Button>
              )}
              <h2 className="text-xl font-bold text-center tracking-tight flex items-center justify-center gap-2">
                  <Icon className="h-6 w-6" />
                  {steps[currentStep-1].name}
              </h2>
          </div>
      </div>
      
      <div ref={scrollableContainerRef} className="flex-grow overflow-y-auto custom-scrollbar px-6 sm:px-8 lg:px-10 pb-24">
          <div className="relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentStep}
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={direction}
                  className="w-full"
                >
                  <StepContent {...props} />
                </motion.div>
              </AnimatePresence>
          </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10">
          <AnimatePresence>
              {currentStep < steps.length && (
                  <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: isStepComplete ? 1 : 0.8, opacity: isStepComplete ? 1 : 0.7 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                      <Button type="button" onClick={nextStep} size="icon" aria-label="Next step" className="rounded-full shadow-lg">
                          <ArrowRight />
                      </Button>
                  </motion.div>
              )}
          </AnimatePresence>
          {currentStep === steps.length && (
              <Button type="button" onClick={() => onDownload('pdf')} className="rounded-full shadow-lg">
                  Finish &amp; Download <Download className="ml-2"/>
              </Button>
          )}
      </div>
    </>
  );
};


const MobileFormLayout = (props: any) => {
    const { swiper, currentStep, data, cardRef, goToStep, onDownload, onStepChange, setSwiper, handleSlideChange } = props;

    return (
        <div className="h-full flex flex-col py-4">
            <div className="flex w-full items-center gap-2 mb-4 shrink-0 px-4">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => goToStep(stepNumber)}
                            disabled={!isCompleted && stepNumber !== currentStep}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-colors duration-500",
                                stepNumber <= currentStep ? "bg-primary" : "bg-muted",
                                (isCompleted || stepNumber === currentStep) ? "cursor-pointer hover:bg-primary/80" : "cursor-default"
                            )}
                            aria-label={`Go to step ${stepNumber}: ${step.name}`}
                        />
                    );
                })}
            </div>
            
            <Swiper
                onSwiper={(s) => setSwiper(s)}
                onSlideChangeTransitionStart={handleSlideChange}
                onSlideChange={(s) => onStepChange(s.activeIndex + 1)}
                className="w-full flex-grow min-h-0"
                initialSlide={currentStep - 1}
            >
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <SwiperSlide key={step.id} className="overflow-y-auto custom-scrollbar">
                            {step.id === 5 ? (
                                 <div className="flex flex-col h-full pt-4 pb-8 px-4">
                                     <div className="shrink-0 space-y-4 text-center">
                                        <h2 className="text-2xl font-bold">You're All Set!</h2>
                                        <p className="text-muted-foreground">Your virtual card is ready. Download it as a PNG or an interactive PDF.</p>
                                        <div className="flex justify-center gap-4 pt-4">
                                            <Button onClick={() => onDownload('png')} size="lg" className="shadow-md">
                                                <Download /> <span>PNG</span>
                                            </Button>
                                            <Button onClick={() => onDownload('pdf')} variant="outline" size="lg" className="shadow-md">
                                                <FileDown /> <span>PDF</span>
                                            </Button>
                                        </div>
                                     </div>
                                    <AnimatePresence>
                                        <motion.div
                                            id="final-preview-card"
                                            initial={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                                            className="w-full mt-12"
                                        >
                                            <p className="text-muted-foreground mb-4 flex items-center justify-center gap-2">
                                                <Eye size={16} />
                                                Live Preview
                                            </p>
                                            <CardPreview cardData={data} ref={cardRef} isExporting={false} />
                                        </motion.div>
                                    </AnimatePresence>
                                 </div>
                            ) : (
                               <div className="pb-8">
                                 <div className="flex items-center gap-2 mb-4 px-4">
                                   <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                                     <Icon className="h-5 w-5" />
                                   </div>
                                   <h2 className="text-xl font-bold tracking-tight">{step.name}</h2>
                                 </div>
                                 <div className="px-4">
                                    <StepContent {...props} currentStep={index + 1} />
                                 </div>
                               </div>
                            )}
                        </SwiperSlide>
                    )
                })}
            </Swiper>
        </div>
    );
};


const StepContent = (props: any) => {
    const { currentStep, form, fields, append, remove, handleLogoUpload, handleWorkGalleryChange, handleBrochureUpload, handleBackgroundImageUpload, onDownload, onOpenVCardDialog, fieldsToAnimate, fieldRefs, cardRef } = props;
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (props.isMobile) {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    };
    
    switch (currentStep) {
        case 1:
            return (
                <div className="space-y-3 p-1">
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                        <FormItem ref={(el) => (fieldRefs.current['companyName'] = el)}>
                            <FormLabel className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" />Company Name</FormLabel>
                            <FormControl><Input onFocus={handleFocus} placeholder="Your Company Name" {...field} className={cn(fieldsToAnimate.has('companyName') && 'animate-input-shake animate-neon-pulse')} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="companySlogan" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground" />Company Slogan</FormLabel>
                            <FormControl><Input onFocus={handleFocus} placeholder="Your Company Slogan" {...field} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="companyLogo" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" />Company Logo & Style</FormLabel>
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                                    <FormControl>
                                        <div className="h-full">
                                            {field.value ? (
                                                <div className="relative w-full h-24 mx-auto border border-dashed rounded-lg flex items-center justify-center">
                                                    <Image src={field.value} alt="Logo Preview" fill className="rounded-md p-2 object-contain" />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background" onClick={(e) => { e.preventDefault(); e.stopPropagation(); form.setValue('companyLogo', '', { shouldValidate: true }); }}> <X className="h-4 w-4" /> </Button>
                                                </div>
                                            ) : (
                                                <FileUpload onChange={handleLogoUpload} />
                                            )}
                                        </div>
                                    </FormControl>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-normal">Logo Shape</Label>
                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                {logoShapes.map(shape => (
                                                    <TooltipProvider key={shape.id}><Tooltip><TooltipTrigger asChild>
                                                        <Button type="button" variant={form.watch('logoShape') === shape.id ? 'secondary' : 'outline'} size="icon" onClick={() => form.setValue('logoShape', shape.id, { shouldDirty: true })} > <shape.icon className="h-5 w-5" /> </Button>
                                                    </TooltipTrigger><TooltipContent>{shape.label}</TooltipContent></Tooltip></TooltipProvider>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-normal">Logo Fit & Style</Label>
                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                {logoFits.map(fit => (
                                                    <TooltipProvider key={fit.id}><Tooltip><TooltipTrigger asChild>
                                                        <Button type="button" variant={form.watch('logoFit') === fit.id ? 'secondary' : 'outline'} onClick={() => form.setValue('logoFit', fit.id, { shouldDirty: true })} size="icon" > <fit.icon className="h-5 w-5" /> </Button>
                                                    </TooltipTrigger><TooltipContent>{fit.label}</TooltipContent></Tooltip></TooltipProvider>
                                                ))}
                                                <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                                    <motion.div whileTap={{ scale: 0.9 }}>
                                                        <Button type="button" variant={form.watch('logoRemoveBorder') ? 'secondary' : 'outline'} onClick={() => form.setValue('logoRemoveBorder', !form.watch('logoRemoveBorder'), { shouldDirty: true })} size="icon" > <ShieldOff className="h-5 w-5" /> </Button>
                                                    </motion.div>
                                                </TooltipTrigger><TooltipContent>Remove Border</TooltipContent></Tooltip></TooltipProvider>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FormItem>
                    )} />
                </div>
            );
        case 2:
            return (
                <div className="space-y-3 p-1">
                    <FormField control={form.control} name="contactPersonName" render={({ field }) => (
                        <FormItem ref={(el) => (fieldRefs.current['contactPersonName'] = el)}>
                            <FormLabel className="flex items-center gap-2"><UserCircle className="h-4 w-4 text-muted-foreground" />Name</FormLabel>
                            <FormControl><Input onFocus={handleFocus} placeholder="Your Name" {...field} className={cn(fieldsToAnimate.has('contactPersonName') && 'animate-input-shake animate-neon-pulse')} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="designation" render={({ field }) => (
                        <FormItem ref={(el) => (fieldRefs.current['designation'] = el)}>
                            <FormLabel className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" />Designation/Title</FormLabel>
                            <FormControl><Input onFocus={handleFocus} placeholder="Your Designation" {...field} className={cn(fieldsToAnimate.has('designation') && 'animate-input-shake animate-neon-pulse')} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem ref={(el) => (fieldRefs.current['address'] = el)}>
                            <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Address</FormLabel>
                            <FormControl><Textarea onFocus={handleFocus} placeholder="123 Example St, City" {...field} rows={2} className={cn(fieldsToAnimate.has('address') && 'animate-input-shake animate-neon-pulse')} /></FormControl>
                        </FormItem>
                    )} />
                    <div ref={(el) => (fieldRefs.current['contactDetails'] = el)}>
                        <Label className="mb-2 block flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />Contact Numbers</Label>
                        {fields.map((field: any, index: number) => (
                            <div key={field.id} className="grid grid-cols-[1fr_auto] gap-2 mb-2 items-start">
                                <FormField control={form.control} name={`contactDetails.${index}.name`} render={({ field }) => (<FormItem><FormControl><Input onFocus={handleFocus} placeholder="Label" {...field} /></FormControl></FormItem>)} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                <div className="col-span-2">
                                    <FormField control={form.control} name={`contactDetails.${index}.phone`} render={({ field: phoneField }) => (
                                        <FormItem>
                                            <FormControl>
                                                <PhoneInput country={'in'} enableSearch placeholder="xxxxx-xxxxx" disableSearchIcon={true} searchPlaceholder='Search country' value={form.getValues(`contactDetails.${index}.countryCode`) + phoneField.value} onChange={(phone, country: any) => { phoneField.onChange(phone.substring(country.dialCode.length)); form.setValue(`contactDetails.${index}.countryCode`, `+${country.dialCode}`, { shouldValidate: true }); }} containerClass={cn(fieldsToAnimate.has('contactDetails') && 'animate-input-shake animate-neon-pulse rounded-lg')} inputProps={{ onFocus: handleFocus, name: `contactDetails.${index}.phone` }} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        ))}
                        {fields.length < 3 && (<Button type="button" variant="outline" size="sm" onClick={() => append({ name: 'Work', countryCode: '+91', phone: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Contact</Button>)}
                    </div>
                </div>
            );
        case 3:
            return (
                <div className="space-y-6 p-1">
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <h3 className="flex items-center gap-2 font-semibold mb-4 text-base"><Phone size={14} /> Communication</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            {communicationLinks.map(link => (
                                <div key={link.id}>
                                    <FormField control={form.control} name={`links.${link.id}.enabled`} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel className="font-normal text-sm">{link.label}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                    )} />
                                    <AnimatePresence>
                                        {form.watch(`links.${link.id}.enabled`) && (
                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                                                <div className="pt-3">
                                                    {(link.id === 'call' || link.id === 'whatsapp') ? (
                                                        <FormField control={form.control} name={`links.${link.id}.number`} render={({ field }) => (
                                                            <FormItem><FormControl>
                                                                <PhoneInput country={'in'} enableSearch placeholder="xxxxx-xxxxx" disableSearchIcon={true} searchPlaceholder='Search country' value={form.getValues(`links.${link.id}.countryCode`) + field.value} onChange={(phone, country: any) => { field.onChange(phone.substring(country.dialCode.length)); form.setValue(`links.${link.id}.countryCode`, `+${country.dialCode}`, { shouldValidate: true }); }} inputProps={{ onFocus: handleFocus, name: `links.${link.id}.number` }} />
                                                            </FormControl></FormItem>
                                                        )} />
                                                    ) : 'type' in link ? (
                                                        <FormField control={form.control} name={`links.${link.id}.value`} render={({ field }) => (<FormItem><FormControl><Input onFocus={handleFocus} type={link.type} placeholder={`Your ${link.label} address`} {...field} /></FormControl></FormItem>)} />
                                                    ) : null}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <h3 className="flex items-center gap-2 font-semibold mb-4 text-base"><Briefcase size={14} /> Business Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            {businessInfoLinks.map(link => (
                                <div key={link.id}>
                                    <FormField control={form.control} name={`links.${link.id}.enabled`} render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel className="font-normal text-sm">{link.label}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                    <AnimatePresence>
                                        {form.watch(`links.${link.id}.enabled`) && (
                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                                                <div className="pt-3 space-y-3">
                                                    {link.id === 'brochure' ? (<> <FormField control={form.control} name="links.brochure.value" render={({ field }) => (<FormItem><FormLabel>Brochure Link</FormLabel><FormControl><Input onFocus={handleFocus} type="url" placeholder="https://example.com/brochure.pdf" {...field} /></FormControl></FormItem>)} /> <FormItem><FormLabel>Or Upload Brochure</FormLabel><FormControl><Input type="file" onChange={handleBrochureUpload} /></FormControl>{form.watch('links.brochure.fileName') && (<FormDescription>Current file: {form.watch('links.brochure.fileName')}</FormDescription>)}</FormItem> </>) : link.id === 'workGallery' ? (<> <FormField control={form.control} name="links.workGallery.value" render={({ field }) => (<FormItem><FormLabel>Gallery Link</FormLabel><FormControl><Input onFocus={handleFocus} type="url" placeholder="https://example.com/gallery" {...field} /></FormControl></FormItem>)} /> <FormItem><FormLabel>Or Upload Images</FormLabel><FormControl><Input type="file" accept="image/*" multiple onChange={handleWorkGalleryChange} /></FormControl></FormItem> <div className="flex flex-wrap gap-2"> {form.watch('links.workGallery.images')?.map((image: string, index: number) => (<div key={index} className="relative group"> <Image src={image} alt={`Gallery image ${index + 1}`} width={60} height={60} className="h-16 w-16 rounded-md object-cover" /> <Button type="button" variant="destructive" size="icon" className="absolute -right-2 -top-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { const updatedImages = form.getValues('links.workGallery.images')?.filter((_: any, i: number) => i !== index); form.setValue('links.workGallery.images', updatedImages, { shouldDirty: true, shouldValidate: true }); }}><Trash2 className="h-3 w-3" /></Button> </div>))} </div> </>) : (<FormField control={form.control} name={`links.${link.id}.value`} render={({ field }) => (<FormItem><FormControl><Input onFocus={handleFocus} type={link.type} placeholder={`Your ${link.label} link`} {...field} /></FormControl></FormItem>)} />)}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="social-media" className="rounded-lg border bg-card shadow-sm data-[state=open]:pb-4">
                            <AccordionTrigger className="px-4 py-2 hover:no-underline"><h3 className="flex items-center gap-2 font-semibold text-base"><Users size={14} /> Social Media</h3></AccordionTrigger>
                            <AccordionContent className="px-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pt-4 border-t">
                                    {socialLinks.map(link => (
                                        <div key={link.id}>
                                            <FormField control={form.control} name={`links.${link.id}.enabled`} render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><FormLabel className="font-normal text-sm">{link.label}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                            <AnimatePresence>
                                                {form.watch(`links.${link.id}.enabled`) && (
                                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                                                        <div className="pt-3"><FormField control={form.control} name={`links.${link.id}.value`} render={({ field }) => (<FormItem><FormControl><Input onFocus={handleFocus} type={link.type} placeholder={`https://...`} {...field} /></FormControl></FormItem>)} /></div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            );
        case 4:
            return (
                <div className="space-y-6 p-1">
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4"><QrCode className="h-4 w-4" /><h3 className="font-semibold text-sm">QR Code Action</h3><TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="focus:outline-none"><Info size={14} className="text-muted-foreground" /></button></TooltipTrigger><TooltipContent><p>Define the action when QR is scanned.</p></TooltipContent></Tooltip></TooltipProvider></div>
                        <div className="space-y-4">
                            <FormField control={form.control} name="qrCodeContent" render={({ field }) => (<FormItem><FormLabel>When Scanned, Open...</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select QR code action" /></SelectTrigger></FormControl><SelectContent><SelectItem value="vcf">vCard (Contact Info)</SelectItem><SelectItem value="website">Website Link</SelectItem><SelectItem value="brochure">Brochure Link</SelectItem><SelectItem value="location">Location Link</SelectItem><SelectItem value="custom">Custom URL</SelectItem></SelectContent></Select></FormItem>)} />
                            {form.watch('qrCodeContent') === 'vcf' && (<div className="pt-2"><Button type="button" variant="outline" size="sm" onClick={onOpenVCardDialog}><Pencil className="mr-2 h-4 w-4" /> Edit vCard Details</Button></div>)}
                            {form.watch('qrCodeContent') === 'custom' && (<FormField control={form.control} name="qrCodeCustomUrl" render={({ field }) => (<FormItem><FormLabel>Custom URL</FormLabel><FormControl><Input onFocus={handleFocus} placeholder="https://example.com" {...field} /></FormControl></FormItem>)} />)}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4"><LayoutTemplate className="h-4 w-4" /><h3 className="font-semibold text-sm">Card Template</h3><TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="focus:outline-none"><Info size={14} className="text-muted-foreground" /></button></TooltipTrigger><TooltipContent><p>Choose a layout for your card.</p></TooltipContent></Tooltip></TooltipProvider></div>
                        <FormField control={form.control} name="template" render={({ field }) => (<FormControl><TemplatePicker value={field.value || ''} onChange={field.onChange} /></FormControl>)} />
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4"><Paintbrush className="h-4 w-4" /><h3 className="font-semibold text-sm">Theme &amp; Background</h3><TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="focus:outline-none"><Info size={14} className="text-muted-foreground" /></button></TooltipTrigger><TooltipContent><p>Customize colors and background.</p></TooltipContent></Tooltip></TooltipProvider></div>
                        <div className="space-y-4">
                            <FormField control={form.control} name="fontFamily" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Type className="h-4 w-4 text-muted-foreground" />Font Family</FormLabel><FormControl><FontPicker value={field.value || 'Inter'} onChange={field.onChange} /></FormControl></FormItem>)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="primaryColor" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4 text-muted-foreground" />Primary Color</FormLabel><FormControl><ColorPicker value={field.value || ''} onChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="accentColor" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4 text-muted-foreground" />Accent Color</FormLabel><FormControl><ColorPicker value={field.value || ''} onChange={field.onChange} /></FormControl></FormItem>)} />
                            </div>
                            <FormField control={form.control} name="backgroundColor" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4 text-muted-foreground" />Background Color</FormLabel><FormControl><ColorPicker value={field.value || ''} onChange={field.onChange} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="backgroundImage" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" />Background Image</FormLabel>
                                    <FormControl>
                                        <div>
                                            {field.value ? (
                                                <div className="relative w-full h-24 mx-auto border border-dashed rounded-lg flex items-center justify-center">
                                                    <Image src={field.value} alt="Background Preview" fill className="rounded-md object-cover" />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 hover:bg-background" onClick={(e) => { e.preventDefault(); e.stopPropagation(); form.setValue('backgroundImage', '', { shouldValidate: true }); }}><X className="h-4 w-4" /></Button>
                                                </div>
                                            ) : (
                                                <FileUpload onChange={handleBackgroundImageUpload} label="Upload Background Image" />
                                            )}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </div>
            );
        case 5:
            return (
                <div className="flex flex-col items-center justify-center text-center space-y-4 h-full pt-12">
                   {!props.isMobile && (
                        <>
                            <h2 className="text-2xl font-bold">You're All Set!</h2>
                            <p className="text-muted-foreground">Your virtual card is ready. Download it as a PNG or an interactive PDF.</p>
                        </>
                    )}
                    <div className="flex justify-center gap-4 pt-4">
                        <Button asChild size="lg" className="shadow-md">
                            <motion.button onClick={() => onDownload('png')} whileHover="hover"><motion.div variants={{ hover: { y: -2 } }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}><Download /></motion.div><span>Download PNG</span></motion.button>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="shadow-md">
                            <motion.button onClick={() => onDownload('pdf')} whileHover="hover"><motion.div variants={{ hover: { y: -2 } }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}><FileDown /></motion.div><span>Download PDF</span></motion.button>
                        </Button>
                    </div>
                </div>
            );
        default: return null;
    }
};


export default function CardForm({ isMobile, data, dataVersion, onFormChange, onDownload, onOpenVCardDialog, currentStep, onStepChange, cardRef }: CardFormProps) {
  const [direction, setDirection] = useState(1);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [fieldsToAnimate, setFieldsToAnimate] = useState<Set<string>>(new Set());
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const [swiper, setSwiper] = useState<SwiperCore | null>(null);

  const form = useForm<CardData>({
    resolver: zodResolver(cardDataSchema),
    defaultValues: data,
    mode: 'onTouched',
  });
  
  useEffect(() => {
    // Only reset the form if the dataVersion has been explicitly incremented.
    // This prevents resetting on every parent re-render from `onFormChange`.
    if (dataVersion > 0) {
      form.reset(data);
    }
  }, [dataVersion]); // Removed `data` and `form` from dependencies to break the loop
  
  const checkStepCompletion = React.useCallback(() => {
    const stepConfig = steps[currentStep - 1];
    if (!stepConfig) return false;
    
    const requiredFields = stepConfig.requiredFields as CardDataField[];

    if (requiredFields.length > 0) {
        const isComplete = requiredFields.every(field => {
            const fieldValue = form.getValues(field as any);
            if (field === 'contactDetails') {
            return Array.isArray(fieldValue) && fieldValue.some(c => c.phone && c.phone.trim().length >= 10);
            }
            return fieldValue && String(fieldValue).trim() !== '';
        });
        setIsStepComplete(isComplete);
        return isComplete;
    } else {
        setIsStepComplete(true);
        return true;
    }
  }, [currentStep, form]);

  useEffect(() => {
    checkStepCompletion();
    const subscription = form.watch((value) => {
      onFormChange(value as CardData);
      checkStepCompletion();
    });

    return () => subscription.unsubscribe();
  }, [form, onFormChange, checkStepCompletion]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "contactDetails" });
  const handleLogoUpload = (files: File[]) => { if (files && files[0]) { const file = files[0]; const reader = new FileReader(); reader.onloadend = () => form.setValue('companyLogo', reader.result as string, { shouldDirty: true, shouldValidate: true }); reader.readAsDataURL(file); } };
  const handleWorkGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files) { const files = Array.from(event.target.files); if (files.length === 0) return; const imagePromises = files.map(file => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file); })); Promise.all(imagePromises).then(base64Images => { const currentImages = form.getValues('links.workGallery.images') || []; form.setValue('links.workGallery.images', [...currentImages, ...base64Images], { shouldValidate: true }); }); event.target.value = ''; } };
  const handleBrochureUpload = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files && event.target.files[0]) { const file = event.target.files[0]; const reader = new FileReader(); reader.onloadend = () => { form.setValue('links.brochure.fileData', reader.result as string, { shouldDirty: true }); form.setValue('links.brochure.fileName', file.name, { shouldDirty: true, shouldValidate: true }); }; reader.readAsDataURL(file); event.target.value = ''; } };
  const handleBackgroundImageUpload = (files: File[]) => { if (files && files[0]) { const file = files[0]; const reader = new FileReader(); reader.onloadend = () => form.setValue('backgroundImage', reader.result as string, { shouldDirty: true, shouldValidate: true }); reader.readAsDataURL(file); } };

  const triggerValidationAnimation = () => {
    const errorKeys = Object.keys(form.formState.errors);
    const fieldsToAnimateSet = new Set(errorKeys);
    errorKeys.forEach(key => { if (key.startsWith('contactDetails.')) fieldsToAnimateSet.add('contactDetails'); });
    setFieldsToAnimate(fieldsToAnimateSet as Set<string>);
    
    const stepConfig = steps[currentStep - 1];
    if (stepConfig) {
        const firstErrorKey = stepConfig.requiredFields.find(field => fieldsToAnimateSet.has(field));
        if (firstErrorKey) {
            const fieldElement = fieldRefs.current[firstErrorKey];
            fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    setTimeout(() => setFieldsToAnimate(new Set()), 1200);
  }

  const nextStep = async () => {
    const stepConfig = steps[currentStep - 1];
    if (!stepConfig) return;

    const fieldsToValidate = stepConfig.requiredFields as CardDataField[];
    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
        triggerValidationAnimation();
        return;
    }

    if (currentStep < steps.length) {
      setDirection(1);
      const newStep = currentStep + 1;
      onStepChange(newStep);
      if (isMobile && swiper) swiper.slideTo(newStep - 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      const newStep = currentStep - 1;
      onStepChange(newStep);
      if (isMobile && swiper) swiper.slideTo(newStep - 1);
    }
  };

  const goToStep = async (step: number) => {
    if (step < currentStep) {
      setDirection(-1);
      onStepChange(step);
      if(isMobile && swiper) swiper.slideTo(step - 1);
      return;
    }
    if (step > currentStep) {
        for (let i = currentStep - 1; i < step - 1; i++) {
            const stepConfig = steps[i];
            if (!stepConfig) continue;
            const fieldsToValidate = stepConfig.requiredFields as CardDataField[];
            const isValid = await form.trigger(fieldsToValidate);
            if (!isValid) {
                const failedStep = i + 1;
                onStepChange(failedStep);
                if(isMobile && swiper) swiper.slideTo(i);
                triggerValidationAnimation(); // To trigger validation animation
                return;
            }
        }
        setDirection(1);
        onStepChange(step);
        if(isMobile && swiper) swiper.slideTo(step - 1);
    }
  };

  const handleSlideChange = async (swiperInstance: SwiperCore) => {
    const previousIndex = swiperInstance.previousIndex;
    const newIndex = swiperInstance.activeIndex;

    // Only validate when moving forward
    if (newIndex > previousIndex) {
        const stepConfig = steps[previousIndex];
        if (stepConfig) {
            const fieldsToValidate = stepConfig.requiredFields as CardDataField[];
            const isValid = await form.trigger(fieldsToValidate);
            if (!isValid) {
                // Prevent slide change and show animation
                swiperInstance.slideTo(previousIndex, 300); // 300ms transition
                triggerValidationAnimation();
            }
        }
    }
  };

  const variants = {
    hidden: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0, scale: 0.98 }),
    visible: { x: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: 'easeOut' } }),
  };

  const commonProps = { form, fields, append, remove, handleLogoUpload, handleWorkGalleryChange, handleBrochureUpload, handleBackgroundImageUpload, nextStep, prevStep, goToStep, currentStep, direction, variants, onDownload, onOpenVCardDialog, isStepComplete, fieldsToAnimate, fieldRefs, onStepChange, data, isMobile, setSwiper, swiper, cardRef, handleSlideChange };

  return (
    <Form {...form}>
      <div className="h-full w-full flex flex-col">
        {isMobile ? <MobileFormLayout {...commonProps} /> : <DesktopFormLayout {...commonProps} />}
      </div>
    </Form>
  );
}
