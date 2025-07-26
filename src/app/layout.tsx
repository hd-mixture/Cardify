
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import 'react-phone-input-2/lib/style.css'
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cardify',
  description: 'Create and download your virtual visiting card.',
  icons: {
    icon: { url: '/logo.svg?v=2', type: 'image/svg+xml' },
    shortcut: { url: '/logo.svg?v=2', type: 'image/svg+xml' },
    apple: { url: '/logo.svg?v=2', type: 'image/svg+xml' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", inter.variable)}>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
