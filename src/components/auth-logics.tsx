
"use client";
import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Contact } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { AdminLoginModal } from "./admin-login-modal";
import { ForgotPasswordModal } from "./forgot-password-modal";

const GoogleAuth = dynamic(() => import("./google-auth"), {
  loading: () => <Skeleton className="h-10 w-full" />,
});

interface AuthLogicsProps {
  mode: 'login' | 'signup';
}

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type SignupFormValues = z.infer<typeof signupSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthLogics({ mode }: AuthLogicsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { emailLogin, signup, checkEmailExists } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [isForgotModalOpen, setForgotModalOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const isLoginMode = mode === 'login';
  const schema = isLoginMode ? loginSchema : signupSchema;
  type FormValues = typeof isLoginMode extends true ? LoginFormValues : SignupFormValues;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isLoginMode
      ? { email: "", password: "" }
      : { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    if (isLoginMode) {
      // --- LOGIN LOGIC ---
      const { email, password } = data as LoginFormValues;
       try {
        await emailLogin(email, password);
        toast({ title: "Success", description: "Logged in successfully!", variant: 'success' });
        router.push('/');
      } catch (error: any) {
        let description = "An unexpected error occurred.";
         // This is the most reliable check for modern Firebase SDKs
        if (error.code === 'auth/invalid-credential') {
             description = "The email or password you entered is incorrect. Please try again.";
        }
        toast({ title: "Login Failed", description, variant: 'error' });
      } finally {
        setIsLoading(false);
      }

    } else {
      // --- SIGNUP LOGIC ---
      const { name, email, password } = data as SignupFormValues;
      try {
        const methods = await checkEmailExists(email);

        if (methods.length > 0) {
          toast({ title: "Signup Failed", description: "This email is already registered. Please log in instead.", variant: 'error' });
          router.push('/login');
          setIsLoading(false);
          return;
        }
        
        await signup(email, password, name);
        toast({ title: "Success", description: "Account created successfully!", variant: 'success' });
        router.push('/');
      } catch (error: any) {
        let description = "An unexpected error occurred during sign up.";
        if (error.code === 'auth/email-already-in-use') {
          description = "This email is already registered. Please log in.";
           router.push('/login');
        } else if (error.message) {
          description = error.message;
        }
        toast({ title: "Signup Failed", description, variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogoClick = () => {
    if (isLoginMode) {
        const newClickCount = logoClickCount + 1;
        setLogoClickCount(newClickCount);
        if (newClickCount >= 5) {
            setAdminModalOpen(true);
            setLogoClickCount(0); // Reset counter
        }
        // Reset after a timeout if not clicked enough times
        setTimeout(() => setLogoClickCount(0), 1500);
    }
  };


  return (
    <div className="min-h-screen w-full bg-secondary/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="shadow-2xl mx-auto w-full max-w-md rounded-2xl bg-background p-4 md:p-8 border border-border/50"
      >
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                  {isLoginMode ? 'Welcome Back!' : 'Create an Account'}
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {isLoginMode ? 'Log in to continue to Cardify.' : 'Sign up to start creating your virtual cards.'}
                </p>
            </div>
            <button
                type="button"
                onClick={handleLogoClick}
                className={cn("w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg shadow-md shrink-0", isLoginMode && "cursor-pointer")}
                aria-label={isLoginMode ? "Cardify Logo - Click for admin login" : "Cardify Logo"}
            >
                <Contact className="w-7 h-7" />
            </button>
        </div>


        <form className="my-8" onSubmit={form.handleSubmit(onSubmit)}>
          {!isLoginMode && (
            <LabelInputContainer className="mb-4">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" type="text" {...form.register('name' as any)} disabled={isLoading} />
              {form.formState.errors.name && <p className="text-sm text-destructive">{(form.formState.errors as any).name.message}</p>}
            </LabelInputContainer>
          )}

          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" placeholder="name@example.com" type="email" {...form.register('email' as any)} disabled={isLoading} />
            {form.formState.errors.email && <p className="text-sm text-destructive">{(form.formState.errors as any).email.message}</p>}
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
               {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
            </div>
            <div className="relative">
              <Input 
                id="password" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"} 
                {...form.register('password' as any)} 
                disabled={isLoading} 
                className="pr-10"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.8 }}
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </motion.button>
            </div>
             {form.formState.errors.password && <p className="text-sm text-destructive">{(form.formState.errors as any).password.message}</p>}
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLoginMode ? 'Log In →' : 'Sign Up →')}
            <BottomGradient />
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="flex flex-col space-y-4">
             <Suspense fallback={<Skeleton className="h-10 w-full" />}>
               <GoogleAuth setIsLoading={setIsLoading} isLoading={isLoading} />
             </Suspense>
          </div>
        </form>
        <p className="text-center text-sm text-muted-foreground">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link href={isLoginMode ? '/signup' : '/login'} className="text-primary hover:underline font-medium">
                {isLoginMode ? 'Sign up' : 'Log in'}
            </Link>
        </p>
      </motion.div>
      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setAdminModalOpen(false)} />
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setForgotModalOpen(false)} />
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
