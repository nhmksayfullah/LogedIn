'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/hooks/usePurchase';
import { AccountManagement } from '@/components/AccountManagement';

// Force dynamic rendering - this page cannot be statically generated
export const dynamic = 'force-dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { StripeBuyButton } from '@/components/StripeBuyButton';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Crown, ArrowRight } from 'lucide-react';

function ProfileContent() {
  const { user } = useAuth();
  const { purchase, hasLifetimeAccess, isLoading: isLoadingPurchase, refetch: refetchPurchase } = usePurchase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [error, setError] = useState<string | null>(null);

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
      router.push('/');
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400 mb-4 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 text-landing-body">Failed to load purchase details. Please try refreshing.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-white dark:bg-slate-900">
        {/* Success Banner */}
        {paymentStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-800"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm sm:text-base text-green-700 dark:text-green-300 font-medium text-center">
                  🎉 Welcome to Lifetime Pro! Your payment was successful.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-landing-xl">
          {/* Account Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 overflow-visible"
          >
            <h2 className="text-lg sm:text-landing-card-title font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Account Details</h2>
            <AccountManagement hasLifetimeAccess={hasLifetimeAccess} />
          </motion.div>

          {/* Subscription Status Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <p className="text-red-600 dark:text-red-400 text-landing-body">{error}</p>
              </div>
            ) : isLoadingPurchase ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm sm:text-landing-small text-slate-600 dark:text-slate-300">Loading your subscription...</p>
                </div>
              </div>
            ) : hasLifetimeAccess ? (
              // Pro User Card
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-500 dark:border-blue-600 rounded-xl p-4 sm:p-6 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 dark:bg-blue-400/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative">
                  {/* Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-base sm:text-landing-body font-bold text-slate-900 dark:text-white">Lifetime Pro</span>
                    </div>
                    <span className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs sm:text-landing-tiny font-semibold rounded-full w-fit">
                      ACTIVE
                    </span>
                  </div>

                  {/* Purchase Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-2.5 sm:p-3">
                      <p className="text-xs sm:text-landing-tiny text-slate-600 dark:text-slate-400 mb-1">Plan Type</p>
                      <p className="text-sm sm:text-landing-small font-semibold text-slate-900 dark:text-white">
                        {purchase?.purchase_type?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-2.5 sm:p-3">
                      <p className="text-xs sm:text-landing-tiny text-slate-600 dark:text-slate-400 mb-1">Purchased</p>
                      <p className="text-sm sm:text-landing-small font-semibold text-slate-900 dark:text-white">
                        {purchase?.purchased_at ? new Date(purchase.purchased_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-2.5 sm:p-3">
                      <p className="text-xs sm:text-landing-tiny text-slate-600 dark:text-slate-400 mb-1">Amount Paid</p>
                      <p className="text-sm sm:text-landing-small font-semibold text-slate-900 dark:text-white">
                        ${purchase?.amount_paid ? (purchase.amount_paid / 100).toFixed(2) : '0.00'} {purchase?.currency?.toUpperCase()}
                      </p>
                    </div>
                    {purchase?.coupon_id && (
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs sm:text-landing-tiny text-slate-600 dark:text-slate-400 mb-1">Coupon</p>
                        <p className="text-sm sm:text-landing-small font-semibold text-slate-900 dark:text-white">{purchase.coupon_id}</p>
                      </div>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm sm:text-landing-small font-semibold text-slate-900 dark:text-white">Your Benefits</p>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1.5">
                      <li className="flex items-center text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400 mr-1.5 flex-shrink-0" />
                        Unlimited journeys
                      </li>
                      <li className="flex items-center text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400 mr-1.5 flex-shrink-0" />
                        No watermark
                      </li>
                      <li className="flex items-center text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400 mr-1.5 flex-shrink-0" />
                        Custom themes
                      </li>
                      <li className="flex items-center text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400 mr-1.5 flex-shrink-0" />
                        Priority support
                      </li>
                      <li className="flex items-center text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400 mr-1.5 flex-shrink-0" />
                        All future updates
                      </li>
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full px-6 py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group text-landing-small"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              // Free User - Upgrade Card
              <div className="space-y-4 sm:space-y-6">
                {/* Current Plan Card */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-landing-card-title font-bold text-slate-900 dark:text-white">Current Plan</h3>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-landing-tiny font-semibold rounded-full w-fit">
                      FREE
                    </span>
                  </div>
                  
                  <p className="text-sm sm:text-landing-small text-slate-600 dark:text-slate-300">
                    Limited to 1 journey with basic features.
                  </p>
                </div>

                {/* Upgrade CTA Card */}
                <div className="relative">
                  {/* Decorative Badge - Outside overflow-hidden */}
                  <div className="absolute top-0 right-4 -translate-y-1/2 z-20">
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 dark:bg-blue-600 text-white text-xs sm:text-landing-tiny font-semibold rounded-full shadow-lg whitespace-nowrap">
                      One-time · Lifetime access
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-500 dark:border-blue-600 rounded-xl p-4 sm:p-6 pt-8 sm:pt-10 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-400/10 dark:bg-blue-400/5 rounded-full translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-base sm:text-landing-card-title font-bold text-slate-900 dark:text-white">
                          Upgrade to Lifetime Pro
                        </h3>
                      </div>
                      
                      <div className="mb-3 sm:mb-4">
                        <p className="text-sm sm:text-landing-small text-slate-700 dark:text-slate-300 mb-2">
                          Get unlimited journeys and all premium features
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                          <span className="text-base sm:text-landing-body text-slate-400 dark:text-slate-500 line-through">$99.99</span>
                          <span className="text-2xl sm:text-landing-section font-bold text-blue-600 dark:text-blue-400">$39</span>
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs sm:text-landing-tiny font-semibold rounded">
                            LAUNCHDEAL
                          </span>
                        </div>
                        <p className="text-xs sm:text-landing-tiny text-slate-600 dark:text-slate-400 text-center mt-1">
                          60% off launch discount · One-time payment
                        </p>
                      </div>

                      {/* Features Grid */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">Unlimited journeys</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">No watermark</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">Custom themes</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">Priority support</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">Future updates</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-landing-tiny text-slate-700 dark:text-slate-300">Before/after view</span>
                        </div>
                      </div>

                      {/* Stripe Button Container */}
                      <div className="flex justify-center mb-2 sm:mb-3">
                        <StripeBuyButton
                          buttonText="Upgrade to Lifetime Pro"
                        />
                      </div>

                      <p className="text-xs sm:text-landing-tiny text-slate-600 dark:text-slate-400 text-center">
                        Limited time offer · Prices increase soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
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
