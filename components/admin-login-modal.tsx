
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { emailLogin, signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginValues) => {
    setIsLoading(true);

    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (data.username !== adminUsername || data.password !== adminPassword) {
      toast({
        title: 'Login Failed',
        description: 'The username or password you entered is incorrect.',
        variant: 'error',
      });
      setIsLoading(false);
      return;
    }

    const adminEmail = `${adminUsername}@cardify.app`;

    try {
      // Try to log in first
      await emailLogin(adminEmail, adminPassword as string);
      router.push('/admin/dashboard');
    } catch (error: any) {
      // If user not found, create the admin account
      if (error instanceof FirebaseError && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        try {
          await signup(adminEmail, adminPassword as string, 'Cardify Admin');
          toast({
            title: 'Admin Account Created',
            description: 'Your admin account has been set up. Logging in...',
            variant: 'success',
          });
          router.push('/admin/dashboard');
        } catch (signupError: any) {
          toast({
            title: 'Admin Setup Failed',
            description: signupError.message,
            variant: 'error',
          });
        }
      } else {
        // Handle other login errors
        toast({
          title: 'Login Failed',
          description: error.message || 'An unexpected error occurred.',
          variant: 'error',
        });
      }
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Access</DialogTitle>
          <DialogDescription>
            Enter your admin credentials to proceed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...form.register('username')} disabled={isLoading} />
            {form.formState.errors.username && <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register('password')} disabled={isLoading} />
            {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
