
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
const PROTECTED_ROUTES = ['/', '/profile-settings', '/gallery'];

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);

    React.useEffect(() => {
        if (loading) return;

        // If user is logged in and tries to access an auth route, redirect to home
        if (user && isAuthRoute) {
            router.push('/');
            return;
        }

        // If user is not logged in, handle redirection based on cookies and route
        if (!user) {
            const hasVisited = Cookies.get('cardify_visited');
            
            if (isProtectedRoute) {
                if (hasVisited) {
                    router.push('/login');
                } else {
                    router.push('/signup');
                }
                return;
            }
            
            if (!hasVisited) {
                Cookies.set('cardify_visited', 'true', { expires: 365 });
            }
        }

    }, [user, loading, router, isAuthRoute, isProtectedRoute, pathname]);

    // While loading, show a skeleton loader to prevent flicker
    if (loading) {
        return <SkeletonLoader />;
    }

    // If a logged-in user is on an auth page, show loader until redirect happens
    if (user && isAuthRoute) {
        return <SkeletonLoader />;
    }
    
    // If a logged-out user is on a protected page, show loader until redirect happens
    if (!user && isProtectedRoute) {
        return <SkeletonLoader />;
    }

    return <>{children}</>;
}
