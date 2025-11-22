"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface Journey {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function JourneyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJourney = async () => {
      if (!params.id || !user?.id) return;

      try {
        const { data, error } = await supabase
          .from('journeys')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setJourney(data);
      } catch (err) {
        console.error('Error fetching journey:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJourney();
  }, [params.id, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Journey not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-500 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journeys</span>
        </button>

        {/* Journey Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {journey.title}
          </h1>
          {journey.description && (
            <p className="text-lg text-slate-600">
              {journey.description}
            </p>
          )}
        </div>

        {/* Versions Section - Coming Soon */}
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Versions Coming Soon
          </h2>
          <p className="text-slate-600">
            Start adding versions to track your journey progress
          </p>
        </div>
      </div>
    </div>
  );
}
