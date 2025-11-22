"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usePurchase } from '@/hooks/usePurchase';
import { useJourneys, Journey } from '@/hooks/useJourneys';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import { AuthPaymentModal } from '@/components/AuthPaymentModal';
import { JourneyModal, JourneyFormData } from '@/components/JourneyModal';
import { JourneyCard } from '@/components/JourneyCard';

const AUTH_TIMEOUT = 15000; // 15 seconds

export default function Dashboard() {
  const { user, hasLifetimeAccess, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { refetch: refetchPurchase } = usePurchase();
  const [hasCheckedPurchase, setHasCheckedPurchase] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  const { journeys, isLoading: isLoadingJourneys, createJourney, updateJourney, deleteJourney, refetch } = useJourneys();
  
  // Journey modal state
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Access check - Only redirect if no access AND initial check is complete
  // DISABLED: This was causing navigation issues. Users can manually visit profile anytime.
  // The profile page itself will show upgrade options if needed.
  // useEffect(() => {
  //   if (isPurchaseLoading || isTrialLoading || isAuthLoading) return;
  //   
  //   const hasValidPurchase = purchase?.status === 'active' && purchase?.purchase_type === 'lifetime_pro';
  //   
  //   // Only redirect if we've checked everything and user has no access
  //   if (hasCheckedPurchase && !hasValidPurchase && !isInTrial && !hasLifetimeAccess) {
  //     router.replace('/profile');
  //   }
  // }, [purchase, isPurchaseLoading, isTrialLoading, isAuthLoading, router, isInTrial, hasLifetimeAccess, hasCheckedPurchase]);

  // Add refresh effect
  useEffect(() => {
    const refreshPurchase = async () => {
      await refetchPurchase();
      setHasCheckedPurchase(true);
    };
    
    if (user?.id) {
      refreshPurchase();
    }
  }, [user?.id, refetchPurchase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && isAuthLoading) {
        setAuthTimeout(true);
      }
    }, AUTH_TIMEOUT);
    
    return () => clearTimeout(timer);
  }, [user, isAuthLoading]);

  // Update the loading check
  if (!user && isAuthLoading && !hasCheckedPurchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4 mx-auto"></div>
          <p className="text-foreground">
            {authTimeout ? 
              "Taking longer than usual? Try refreshing the page 😊." :
              "Verifying access..."}
          </p>
        </div>
      </div>
    );
  }

  const handleCreateJourney = async (data: JourneyFormData) => {
    // Check journey limit for free users
    if (!hasLifetimeAccess && journeys.length >= 1) {
      throw new Error('Free plan allows only 1 journey. Upgrade to create more!');
    }

    await createJourney(data);
    
    // Manually trigger a refetch after a short delay
    setTimeout(() => {
      refetch();
    }, 500);
  };

  const handleEditJourney = async (data: JourneyFormData) => {
    if (!editingJourney) return;
    
    await updateJourney(editingJourney.id, data);
    
    // Refresh the journeys list
    setTimeout(() => {
      refetch();
    }, 500);
  };

  const handleDeleteJourney = async (journeyId: string) => {
    await deleteJourney(journeyId);
    
    // Refresh the journeys list
    setTimeout(() => {
      refetch();
    }, 500);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingJourney(null);
    setIsJourneyModalOpen(true);
  };

  const openEditModal = (journey: Journey) => {
    setModalMode('edit');
    setEditingJourney(journey);
    setIsJourneyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 mt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Journeys</h1>
            <p className="text-slate-600 mt-2">
              Track your transformations, one version at a time
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>New Journey</span>
          </button>
        </div>

        {/* Journeys Grid */}
        {isLoadingJourneys ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : journeys.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Start Your First Journey
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Create a journey to document your transformation. Track progress, add versions, and share your story.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Journey</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey, index) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                index={index}
                onClick={() => router.push(`/journey/${journey.id}`)}
                onEdit={() => openEditModal(journey)}
                onDelete={() => handleDeleteJourney(journey.id)}
              />
            ))}
          </div>
        )}

        {/* Free Plan Notice */}
        {!hasLifetimeAccess && journeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
          >
            <p className="text-slate-700">
              You&apos;re on the <span className="font-semibold">Free Plan</span> (1 journey limit).{' '}
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Upgrade to Lifetime Pro
              </button>{' '}
              for unlimited journeys.
            </p>
          </motion.div>
        )}
      </div>

      {/* Journey Modal */}
      <JourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        onSave={modalMode === 'create' ? handleCreateJourney : handleEditJourney}
        initialData={editingJourney ? {
          title: editingJourney.title,
          description: editingJourney.description || '',
          is_public: editingJourney.is_public
        } : undefined}
        mode={modalMode}
      />
      
      {/* Payment Modal */}
      <AuthPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        intent="payment"
      />
    </div>
  );
}