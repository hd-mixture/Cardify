
"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SkeletonLoader } from './skeleton-loader';
import Cookies from 'js-cookie';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AUTH_ROUTES = ['/login', '/signup'];
// Gallery is also a protected route accessible via a special link, even if not logged in
const PUBLIC_ROUTES = ['/gallery'];

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    // Any route that is not a public or auth route is considered protected.
    const isProtectedRoute = !isAuthRoute && !isPublicRoute;

    const isAdminUser = user?.email === `${process.env.NEXT_PUBLIC_ADMIN_USERNAME}@cardify.app`;

    React.useEffect(() => {
        if (loading) return;

        // --- Handle Logged-In Users ---
        if (user) {
            // Set visited cookie if it doesn't exist
            if (!Cookies.get('cardify_visited')) {
                Cookies.set('cardify_visited', 'true', { expires: 365 });
            }

            // Redirect admin from auth routes to dashboard
            if (isAdminUser && isAuthRoute) {
                router.push('/admin/dashboard');
                return;
            }
            // Redirect normal user from auth routes to home
            if (!isAdminUser && isAuthRoute) {
                router.push('/');
                return;
            }
            // Redirect normal user from admin routes to home
            if (pathname.startsWith('/admin') && !isAdminUser) {
                router.push('/');
                return;
            }
            return; // User is logged in and on a valid page
        }

        // --- Handle Non-Logged-In Users ---
        if (!user && isProtectedRoute) {
            const hasVisited = Cookies.get('cardify_visited');
            
            // New user, redirect to signup
            if (!hasVisited) {
                router.push('/signup');
                return;
            }
            
            // Returning user, redirect to login
            router.push('/login');
            return;
        }

    }, [user, loading, router, pathname, isAuthRoute, isProtectedRoute, isAdminUser]);

    // --- Render Logic ---

    // Show skeleton loader while auth state is being determined
    if (loading) {
        return <SkeletonLoader />;
    }

    // Show skeleton loader for logged-in users on auth routes (during redirect)
    if (user && isAuthRoute) {
        return <SkeletonLoader />;
    }

    // Show skeleton loader for non-logged-in users on protected routes (during redirect)
    if (!user && isProtectedRoute) {
        return <SkeletonLoader />;
    }
    
    // Show skeleton loader if a normal user tries to access admin routes
    if (pathname.startsWith('/admin') && !isAdminUser) {
        return <SkeletonLoader />;
    }

    return <>{children}</>;
}
