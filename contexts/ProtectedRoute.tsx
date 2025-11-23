'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {usePathname } from 'next/navigation';
// import { useRouter, usePathname } from 'next/navigation';

// List of public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',  // Landing page
  '/verify-email', 
  '/reset-password', 
  '/update-password',
  '/terms',
  '/privacy-policy'
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  // const router = useRouter();
  const pathname = usePathname();

  // Check if current path is a public profile or journey page
  // Format: /username (profile) or /username/journeyslug (journey)
  const pathSegments = pathname.split('/').filter(Boolean);
  const isPublicProfileOrJourneyPage = pathname.startsWith('/') && 
    (pathSegments.length === 1 || pathSegments.length === 2) &&
    pathname !== '/' &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/profile') &&
    !pathname.startsWith('/journey/') &&
    !pathname.startsWith('/auth/') &&
    !PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isLoading && !user && !PUBLIC_ROUTES.includes(pathname) && !isPublicProfileOrJourneyPage) {
      // Redirect to home page where user can sign in via modal
      window.location.assign('/');
    }
  }, [user, isLoading, pathname, isPublicProfileOrJourneyPage]);

  // Show loading state only if actually loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col space-y-4 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <div>Loading at lightspeed ⚡️</div>
      </div>
    );
  }

  // Only render children if we're on a public route or user is authenticated
  if (PUBLIC_ROUTES.includes(pathname) || isPublicProfileOrJourneyPage || user) {
    return <>{children}</>;
  }

  return null;
} 