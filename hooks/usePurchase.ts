'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Purchase {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_payment_intent_id: string | null;
  purchase_type: string;
  status: string;
  price_id: string | null;
  amount_paid: number | null;
  currency: string;
  coupon_id: string | null;
  purchased_at: string;
  created_at: string;
  updated_at: string;
}

export function usePurchase() {
  const { user, supabase } = useAuth();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchase = useCallback(async () => {
    if (!user?.id) {
      setPurchase(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      setPurchase(data);
    } catch (err) {
      console.error('Purchase fetch error:', err);
      setError('Failed to load purchase');
      setPurchase(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchPurchase();
  }, [fetchPurchase]);

  // Set up real-time subscription for purchase updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('purchase_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newPurchase = payload.new as Purchase;
            if (newPurchase.status === 'active') {
              setPurchase(newPurchase);
            }
          } else if (payload.eventType === 'DELETE') {
            setPurchase(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const hasLifetimeAccess = purchase?.status === 'active' && purchase?.purchase_type === 'lifetime_pro';

  return {
    purchase,
    hasLifetimeAccess,
    isLoading: loading,
    error,
    refetch: fetchPurchase
  };
}
