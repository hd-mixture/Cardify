
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VCardDetails, vCardDetailsSchema } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

// Helper component for floating label input
const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ label, id, ...props }, ref) => {
  return (
    <div className="relative z-0 w-full group">
      <Input
        id={id}
        ref={ref}
        {...props}
        placeholder=" "
        className={cn(
            "block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-input appearance-none focus:outline-none peer",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
        )}
      />
      <Label
        htmlFor={id}
        className="peer-focus:font-medium absolute text-sm text-muted-foreground duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
      >
        {label}
      </Label>
    </div>
  );
});
FloatingLabelInput.displayName = 'FloatingLabelInput';

// Helper for the submit button gradient
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};


interface VCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: VCardDetails) => void;
  initialData?: VCardDetails;
}

export function VCardDialog({ isOpen, onClose, onSubmit, initialData }: VCardDialogProps) {
  const { toast } = useToast();
  const form = useForm<VCardDetails>({
    resolver: zodResolver(vCardDetailsSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(initialData || {});
    }
  }, [initialData, form, isOpen]);

  const handleFormSubmit = async (data: VCardDetails) => {
    // Sanitize data to remove any fields that are empty strings, which we consider "not set" by the user
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== '' && value !== undefined && value !== null)
    );
    onSubmit(sanitizedData as VCardDetails);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
       <DialogContent className="w-full max-w-md rounded-lg bg-background p-4 md:p-8 flex flex-col max-h-[90vh]">
        <DialogHeader className="text-left flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            Edit vCard Contents
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            This info will be in your QR code for easy contact saving.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4">
            <Form {...form}>
              <form className="my-4 space-y-5 pt-2" onSubmit={form.handleSubmit(handleFormSubmit)}>
                
                <div className="grid md:grid-cols-2 md:gap-6">
                  <FormField name="firstName" control={form.control} render={({ field }) => (
                      <FormItem><FormControl><FloatingLabelInput id="firstName" label="First Name" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField name="lastName" control={form.control} render={({ field }) => (
                      <FormItem><FormControl><FloatingLabelInput id="lastName" label="Last Name" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                
                <FormField name="title" control={form.control} render={({ field }) => (
                    <FormItem><FormControl><FloatingLabelInput id="title" label="Title (e.g. CEO)" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="company" control={form.control} render={({ field }) => (
                    <FormItem><FormControl><FloatingLabelInput id="company" label="Company" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <div className="my-4 h-[1px] w-full bg-border" />
                
                <div className="grid md:grid-cols-2 md:gap-6">
                  <FormField name="phoneBusiness" control={form.control} render={({ field }) => (
                      <FormItem><FormControl><FloatingLabelInput id="phoneBusiness" label="Phone (Business)" type="tel" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField name="phoneMobile" control={form.control} render={({ field }) => (
                      <FormItem><FormControl><FloatingLabelInput id="phoneMobile" label="Phone (Mobile)" type="tel" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                 <FormField name="phonePersonal" control={form.control} render={({ field }) => (
                    <FormItem><FormControl><FloatingLabelInput id="phonePersonal" label="Phone (Personal)" type="tel" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <div className="my-4 h-[1px] w-full bg-border" />
                
                <FormField name="emailBusiness" control={form.control} render={({ field }) => (
                    <FormItem><FormControl><FloatingLabelInput id="emailBusiness" label="Email (Business)" type="email" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="emailPersonal" control={form.control} render={({ field }) => (
                    <FormItem><FormControl><FloatingLabelInput id="emailPersonal" label="Email (Personal)" type="email" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="website" control={form.control} render={({ field }) => (
                    <FormItem><FormControl><FloatingLabelInput id="website" label="Website" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <div className="my-4 h-[1px] w-full bg-border" />
                
                <FormField name="street" control={form.control} render={({ field }) => (
                    <FormItem><FormControl><FloatingLabelInput id="street" label="Street" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid md:grid-cols-2 md:gap-6">
                  <FormField name="city" control={form.control} render={({ field }) => (
                      <FormItem><FormControl><FloatingLabelInput id="city" label="City" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField name="zip" control={form.control} render={({ field }) => (
                      <FormItem><FormControl><FloatingLabelInput id="zip" label="Zip Code" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <FormField name="country" control={form.control} render={({ field }) => (
                    <FormItem><FormControl><FloatingLabelInput id="country" label="Country" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <div className="flex flex-col gap-4 pt-4">
                  <button
                    className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    type="submit"
                  >
                    Save Changes <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">&rarr;</span>
                    <BottomGradient />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-10 w-full rounded-md bg-transparent font-medium text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
