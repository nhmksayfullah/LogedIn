import { usePurchase } from '@/hooks/usePurchase';
import { useRouter } from 'next/navigation';

export function SubscriptionStatus() {
  const { hasLifetimeAccess, isLoading, error } = usePurchase();
  const router = useRouter();

  if (isLoading) {
    return <div className="animate-pulse">Checking purchase status...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error checking purchase: {error}</div>;
  }

  if (hasLifetimeAccess) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          You have Lifetime Pro access! 🎉
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="bg-primary hover:bg-primary-darker text-white px-6 py-2 rounded-lg"
        >
          View Purchase Details
        </button>
      </div>
    );
  }

  return null;
} 