
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import AuthGuard from '@/components/auth-guard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Contact, Heart, Info, KeyRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { uploadAction } from '../actions/upload-action';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
    message: "New password cannot be the same as the current password.",
    path: ['newPassword']
});


type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


function ProfileSettingsPageContent() {
  const { user, updateUserProfile, reauthenticateAndChangePassword, logout } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
  });
  
  useEffect(() => {
    if (user) {
        profileForm.reset({ name: user.displayName || '' });
    }
  }, [user, profileForm]);

  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (isGoogleUser || !user || !profileForm.formState.isDirty) return;
    try {
      await updateUserProfile({ name: data.name });
      toast({ title: "Success", description: "Profile updated successfully.", variant: 'success' });
      profileForm.reset({ name: data.name });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
        await reauthenticateAndChangePassword(data.currentPassword, data.newPassword);
        toast({ title: "Success", description: "Password changed successfully. Please log in again.", variant: 'success' });
        await logout();
        // AuthGuard will handle the redirect to /login
    } catch (error: any) {
        let description = "An unexpected error occurred.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "The current password you entered is incorrect.";
        }
        toast({ title: "Error", description, variant: 'destructive' });
    }
  };

  const handleAvatarClick = () => {
    if (!isGoogleUser && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File Too Large", description: "Profile picture must be less than 5MB.", variant: "destructive" });
        return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please select a PNG, JPG, or WEBP image.", variant: "destructive" });
        return;
    }

    setIsUploading(true);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            
            try {
                const result = await uploadAction(base64data);

                if (result.success && result.url) {
                    await updateUserProfile({ photoURL: result.url });
                    toast({ title: "Success", description: "Profile picture updated.", variant: 'success' });
                } else {
                    toast({ title: "Upload Failed", description: result.message || "Could not upload image. Please try again.", variant: 'destructive' });
                }
            } catch (error: any) {
                console.error("Upload action failed:", error);
                toast({ title: "Upload Failed", description: error.message || "An unexpected error occurred.", variant: 'destructive' });
            } finally {
                setIsUploading(false);
                if(fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.onerror = () => {
            toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
            setIsUploading(false);
        }
    } catch (uploadError) {
        console.error("General upload error:", uploadError);
        toast({ title: "Upload Error", description: "Something went wrong during the upload.", variant: "destructive" });
        setIsUploading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-secondary/40 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <div className="relative bg-background p-6 md:p-8 rounded-2xl shadow-2xl border border-border/50">
           <div className="absolute top-4 right-4">
               <Button variant="ghost" size="icon" asChild className="rounded-full h-9 w-9">
                  <Link href="/">
                      <X size={20} />
                      <span className="sr-only">Close</span>
                  </Link>
               </Button>
           </div>
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold mb-1">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account settings here.</p>
          </div>
          
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 text-4xl rounded-lg" onClick={handleAvatarClick}>
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="rounded-lg">
                    <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Contact className="w-10 h-10" />
                    </div>
                  </AvatarFallback>
                </Avatar>
                
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <div className="w-full h-full after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-background/30 after:to-transparent"></div>
                  </div>
                ) : !isGoogleUser ? (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                    <Camera className="text-white" />
                  </div>
                ) : null}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                disabled={isUploading || isGoogleUser}
              />
              {!isGoogleUser && <p className="text-xs text-muted-foreground text-center">Click avatar to upload a new image (max 5MB).</p>}
              {isGoogleUser && <p className="text-xs text-muted-foreground text-center">Profile picture and name are managed by your Google account.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                {...profileForm.register('name')}
                disabled={profileForm.formState.isSubmitting || isGoogleUser || isUploading}
              />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>

            {!isGoogleUser && (
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={profileForm.formState.isSubmitting || isUploading || !profileForm.formState.isDirty} className="flex-1">
                  {profileForm.formState.isSubmitting || isUploading ? 'Saving...' : 'Save Changes'}
                </Button>
                {profileForm.formState.isDirty && !isUploading && (
                    <Button type="button" variant="ghost" onClick={() => profileForm.reset({ name: user?.displayName || '' })}>
                        Cancel
                    </Button>
                )}
              </div>
            )}
          </form>

          {!isGoogleUser && (
              <Accordion type="single" collapsible className="w-full mt-6">
                  <AccordionItem value="change-password">
                      <AccordionTrigger>
                          <div className="flex items-center gap-2 text-base font-semibold">
                              <KeyRound className="h-5 w-5" />
                              Change Password
                          </div>
                      </AccordionTrigger>
                      <AccordionContent>
                          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 pt-4">
                              <div className="space-y-2">
                                  <Label htmlFor="currentPassword">Current Password</Label>
                                  <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} disabled={passwordForm.formState.isSubmitting} />
                                  {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>}
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="newPassword">New Password</Label>
                                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} disabled={passwordForm.formState.isSubmitting} />
                                  {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                  <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} disabled={passwordForm.formState.isSubmitting} />
                                  {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
                              </div>
                              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                  {passwordForm.formState.isSubmitting ? 'Updating...' : 'Update Password'}
                              </Button>
                          </form>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
          )}

        </div>
        
        {/* About Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-6 w-full"
        >
          <div className="group relative bg-background p-6 rounded-2xl border border-border/50 text-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
             <div className="absolute top-0 right-0 -mr-2 -mt-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                 <Heart className="h-4 w-4 text-primary" />
             </div>
             <Info className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
             <h3 className="font-semibold text-lg">About Cardify</h3>
             <p className="text-sm text-muted-foreground mt-2">
                This app is a project by <span className="font-bold text-primary">Darshan Prajapati</span>. 
                <br/>
                Designed to create beautiful, simple virtual cards.
             </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ProfileSettingsPage() {
    return (
        <AuthGuard>
            <ProfileSettingsPageContent />
        </AuthGuard>
    )
}
