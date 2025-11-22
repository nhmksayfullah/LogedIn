'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePurchase } from '@/hooks/usePurchase';
import { StripeBuyButton } from '@/components/StripeBuyButton';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';

export default function PaymentPage() {
  const { purchase, hasLifetimeAccess, isLoading, error } = usePurchase();
  const router = useRouter();

  // Redirect if already has lifetime access
  useEffect(() => {
    if (hasLifetimeAccess) {
      const timer = setTimeout(() => {
        router.push('/profile');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasLifetimeAccess, router]);

  // Check if user can purchase
  const canPurchase = !isLoading && (!purchase || purchase.status !== 'active');

  // Add error handling
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-center">Error Loading Purchase</h1>
        <p className="text-gray-600 mb-4 text-center">
          Unable to load purchase information. Please try again later.
        </p>
        <button
          onClick={() => router.push('/pay')}
          className="bg-primary hover:bg-primary-darker text-white px-6 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!canPurchase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-center">Already Purchased</h1>
        <p className="text-gray-600 mb-4 text-center">
          You already have Lifetime Pro access!
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="bg-primary hover:bg-primary-darker text-white px-6 py-2 rounded-lg"
        >
          View Purchase Details
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">Get Lifetime Pro Access</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Pay once, own forever. Unlock unlimited journeys and all premium features.
      </p>
      
      <SubscriptionStatus />

      <div className="w-full max-w-md px-4">
        <StripeBuyButton
          className="flex justify-center text-neutral"
          buyButtonId={process.env.NEXT_PUBLIC_STRIPE_BUTTON_ID || ''}
          publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
        />
      </div>
    </div>
  );
}





