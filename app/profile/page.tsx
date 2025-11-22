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
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Crown, Clock, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 text-landing-body">Failed to load purchase details. Please try refreshing.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-white">
        {/* Success Banner */}
        {paymentStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200"
          >
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-green-700 font-medium">
                  🎉 Welcome to Lifetime Pro! Your payment was successful.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-landing-xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-landing-xl"
          >
            <h1 className="text-landing-section md:text-landing-section-lg font-bold text-slate-900 mb-3">
              Your Profile
            </h1>
            <p className="text-landing-body text-slate-600">
              Manage your account and subscription
            </p>
          </motion.div>

          {/* Account Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-xl p-6 mb-6"
          >
            <h2 className="text-landing-card-title font-bold text-slate-900 mb-4">Account Details</h2>
            <AccountManagement />
          </motion.div>

          {/* Subscription Status Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-red-600 text-landing-body">{error}</p>
              </div>
            ) : isLoadingPurchase ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-600 text-landing-small">Loading your subscription...</p>
                </div>
              </div>
            ) : hasLifetimeAccess ? (
              // Pro User Card
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-xl p-6 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-blue-600" />
                      <span className="text-landing-body font-bold text-slate-900">Lifetime Pro</span>
                    </div>
                    <span className="px-3 py-1 bg-blue-500 text-white text-landing-tiny font-semibold rounded-full">
                      ACTIVE
                    </span>
                  </div>

                  {/* Purchase Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-landing-tiny text-slate-600 mb-1">Plan Type</p>
                      <p className="text-landing-small font-semibold text-slate-900">
                        {purchase?.purchase_type?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-landing-tiny text-slate-600 mb-1">Purchased</p>
                      <p className="text-landing-small font-semibold text-slate-900">
                        {purchase?.purchased_at ? new Date(purchase.purchased_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-landing-tiny text-slate-600 mb-1">Amount Paid</p>
                      <p className="text-landing-small font-semibold text-slate-900">
                        ${purchase?.amount_paid ? (purchase.amount_paid / 100).toFixed(2) : '0.00'} {purchase?.currency?.toUpperCase()}
                      </p>
                    </div>
                    {purchase?.coupon_id && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-landing-tiny text-slate-600 mb-1">Coupon</p>
                        <p className="text-landing-small font-semibold text-slate-900">{purchase.coupon_id}</p>
                      </div>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <p className="text-landing-small font-semibold text-slate-900">Your Benefits</p>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      <li className="flex items-center text-landing-tiny text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                        Unlimited journeys
                      </li>
                      <li className="flex items-center text-landing-tiny text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                        No watermark
                      </li>
                      <li className="flex items-center text-landing-tiny text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                        Custom themes
                      </li>
                      <li className="flex items-center text-landing-tiny text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                        Priority support
                      </li>
                      <li className="flex items-center text-landing-tiny text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
                        All future updates
                      </li>
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group text-landing-small"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              // Free User - Upgrade Card
              <div className="space-y-6">
                {/* Current Plan Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-landing-card-title font-bold text-slate-900">Current Plan</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-landing-tiny font-semibold rounded-full">
                      FREE
                    </span>
                  </div>
                  
                  {isInTrial ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-landing-small font-semibold text-yellow-900 mb-1">48-Hour Trial Active</p>
                        <p className="text-landing-small text-yellow-700">
                          Your trial will end on {trialEndTime ? new Date(trialEndTime).toLocaleDateString() : 'soon'}.
                        </p>
                      </div>
                    </div>
                  ) : trialEndTime ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-landing-small text-red-700">
                        Your trial period ended on {new Date(trialEndTime).toLocaleDateString()}.
                      </p>
                    </div>
                  ) : (
                    <p className="text-landing-small text-slate-600">
                      Limited to 1 journey with basic features.
                    </p>
                  )}
                </div>

                {/* Upgrade CTA Card */}
                <div className="relative">
                  {/* Decorative Badge - Outside overflow-hidden */}
                  <div className="absolute top-0 right-4 -translate-y-1/2 z-20">
                    <span className="px-3 py-1.5 bg-blue-500 text-white text-landing-tiny font-semibold rounded-full shadow-lg whitespace-nowrap">
                      One-time · Lifetime access
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-xl p-6 pt-10 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-5 h-5 text-blue-600" />
                        <h3 className="text-landing-card-title font-bold text-slate-900">
                          Upgrade to Lifetime Pro
                        </h3>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-landing-small text-slate-700 mb-2">
                          Get unlimited journeys and all premium features
                        </p>
                        <div className="flex items-center justify-center space-x-3">
                          <span className="text-landing-body text-slate-400 line-through">$99.99</span>
                          <span className="text-landing-section font-bold text-blue-600">$39</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-landing-tiny font-semibold rounded">
                            LAUNCHDEAL
                          </span>
                        </div>
                        <p className="text-landing-tiny text-slate-600 text-center mt-1">
                          60% off launch discount · One-time payment
                        </p>
                      </div>

                      {/* Features Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-landing-tiny text-slate-700">Unlimited journeys</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-landing-tiny text-slate-700">No watermark</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-landing-tiny text-slate-700">Custom themes</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-landing-tiny text-slate-700">Priority support</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-landing-tiny text-slate-700">Future updates</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-landing-tiny text-slate-700">Before/after view</span>
                        </div>
                      </div>

                      {/* Stripe Button Container */}
                      <div className="flex justify-center mb-3">
                        <StripeBuyButton
                          buyButtonId={process.env.NEXT_PUBLIC_STRIPE_BUTTON_ID || ''}
                          publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
                          promoCode="LAUNCHDEAL"
                        />
                      </div>

                      <p className="text-landing-tiny text-slate-600 text-center">
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
