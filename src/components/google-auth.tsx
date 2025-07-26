
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { IconBrandGoogle } from "@tabler/icons-react";

const BottomGradient = () => {
    return (
      <>
        <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
        <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
      </>
    );
  };

export default function GoogleAuth({ setIsLoading, isLoading }: { setIsLoading: (val: boolean) => void, isLoading: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const { googleLogin } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await googleLogin();
      toast({ title: "Success", description: "Signed in with Google!", variant: 'success' });
      router.push('/');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
          toast({ title: "Google Sign-In Failed", description: "Could not sign in with Google. Please try again.", variant: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="group/btn shadow-input relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-card px-4 font-medium text-foreground dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] disabled:opacity-50"
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <IconBrandGoogle className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Sign in with Google
      </span>
      <BottomGradient />
    </button>
  );
}
