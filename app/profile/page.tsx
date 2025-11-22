'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/hooks/usePurchase';
import { AccountManagement } from '@/components/AccountManagement';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { StripeBuyButton } from '@/components/StripeBuyButton';
import { useTrialStatus } from '@/hooks/useTrialStatus';

function ProfileContent() {
  const { user } = useAuth();
  const { purchase, hasLifetimeAccess, isLoading: isLoadingPurchase, refetch: refetchPurchase } = usePurchase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [error, setError] = useState<string | null>(null);
  const { isInTrial, trialEndTime } = useTrialStatus();

  // Show payment success message if redirected from successful payment
  useEffect(() => {
    if (paymentStatus === 'success') {
      console.log('Payment successful!');
    }
  }, [paymentStatus]);

  // Add loading timeout with auto-refresh
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let refreshAttempts = 0;
    const MAX_REFRESH_ATTEMPTS = 3;
    const REFRESH_INTERVAL = 3000; // 3 seconds
    
    const attemptRefresh = async () => {
      if (refreshAttempts < MAX_REFRESH_ATTEMPTS) {
        refreshAttempts++;
        console.log(`Attempting auto-refresh (${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})`);
        await refetchPurchase();
        
        // If still loading, schedule next attempt
        if (isLoadingPurchase) {
          timeoutId = setTimeout(attemptRefresh, REFRESH_INTERVAL);
        }
      } else {
        setError('Loading purchase is taking longer than expected. Please refresh the page.');
      }
    };

    if (isLoadingPurchase) {
      timeoutId = setTimeout(attemptRefresh, REFRESH_INTERVAL);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoadingPurchase, refetchPurchase]);

  // Add useEffect for auth check
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Add refresh effect
  useEffect(() => {
    if (user?.id) {
      refetchPurchase();
    }
  }, [user?.id, refetchPurchase]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4 mx-auto"></div>
          <p className="text-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-red-500">
          Failed to load purchase details. Please try refreshing.
        </div>
      }
    >
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark p-8 max-w-4xl mx-auto">
        {paymentStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-green-600 dark:text-green-400">
              🎉 Thank you for your purchase! Payment was successful.
            </p>
          </div>
        )}
        
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <AccountManagement />

        {/* Purchase Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Purchase Status</h2>
          {error ? (
            <div className="text-red-500 dark:text-red-400">{error}</div>
          ) : isLoadingPurchase ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Loading purchase details...</span>
            </div>
          ) : hasLifetimeAccess ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎉</span>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Lifetime Pro Access
                </p>
              </div>
              <p><span className="font-medium">Plan:</span> {purchase?.purchase_type?.replace('_', ' ').toUpperCase()}</p>
              <p><span className="font-medium">Purchased:</span> {purchase?.purchased_at ? new Date(purchase.purchased_at).toLocaleDateString() : 'N/A'}</p>
              <p><span className="font-medium">Amount Paid:</span> ${purchase?.amount_paid ? (purchase.amount_paid / 100).toFixed(2) : '0.00'} {purchase?.currency?.toUpperCase()}</p>
              {purchase?.coupon_id && (
                <p><span className="font-medium">Coupon Applied:</span> {purchase.coupon_id}</p>
              )}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-blue-700 dark:text-blue-300">
                  ✨ You have unlimited access to all features, forever!
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {/* Current Plan Status */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Current Plan: Free
                </h3>
                {isInTrial ? (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    You are currently in your 48-hour trial period. Your trial will end on {' '}
                    {trialEndTime ? new Date(trialEndTime).toLocaleDateString() : 'soon'}.
                  </p>
                ) : trialEndTime ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Your trial period ended on {new Date(trialEndTime).toLocaleDateString()}.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Limited to 1 journey with basic features.
                  </p>
                )}
              </div>

              {/* Upgrade CTA */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  ✨ Upgrade to Lifetime Pro
                </h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  Get unlimited journeys, all premium features, and lifetime access for just $99.99 one-time payment.
                </p>
                <ul className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited journeys & versions
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    No watermark on exports
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Custom themes & styling
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    All future updates included
                  </li>
                </ul>
                
                <StripeBuyButton
                  buyButtonId={process.env.NEXT_PUBLIC_STRIPE_BUTTON_ID || ''}
                  publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfileContent />
    </Suspense>
  );
}
