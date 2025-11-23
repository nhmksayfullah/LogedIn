import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Journey {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  cover_color: string | null;
  is_public: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
  version_count?: number;
}

export function useJourneys() {
  const { user } = useAuth();
  const supabase = createClient(); // Create client instance
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneys = async () => {
    if (!user?.id) {
      setJourneys([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch journeys first
      const { data: journeysData, error: fetchError } = await supabase
        .from('journeys')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // For each journey, count versions
      const journeysWithCount = await Promise.all(
        (journeysData || []).map(async (journey) => {
          const { count } = await supabase
            .from('versions')
            .select('*', { count: 'exact', head: true })
            .eq('journey_id', journey.id);

          return {
            ...journey,
            version_count: count || 0,
          };
        })
      );

      setJourneys(journeysWithCount);
    } catch (err) {
      console.error('Error fetching journeys:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch journeys');
    } finally {
      setIsLoading(false);
    }
  };

  const createJourney = async (journeyData: {
    title: string;
    description?: string;
    is_public?: boolean;
  }) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      // Generate slug from title
      const slug = journeyData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const insertData = {
        user_id: user.id,
        title: journeyData.title,
        description: journeyData.description || null,
        is_public: journeyData.is_public || false,
        slug,
      };

      const { data, error: insertError } = await supabase
        .from('journeys')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }

      // Refresh journeys list - but don't wait for it or throw on error
      fetchJourneys().catch(err => {
        console.error('Error refreshing journeys after create:', err);
        // Don't throw - the journey was created successfully
      });

      return data;
    } catch (err) {
      console.error('Error creating journey:', err);
      throw err;
    }
  };

  const updateJourney = async (
    journeyId: string,
    updates: Partial<Journey>
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { error: updateError } = await supabase
        .from('journeys')
        .update(updates)
        .eq('id', journeyId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Refresh journeys list
      await fetchJourneys();
    } catch (err) {
      console.error('Error updating journey:', err);
      throw err;
    }
  };

  const deleteJourney = async (journeyId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('journeys')
        .delete()
        .eq('id', journeyId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Refresh journeys list
      await fetchJourneys();
    } catch (err) {
      console.error('Error deleting journey:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchJourneys();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    journeys,
    isLoading,
    error,
    createJourney,
    updateJourney,
    deleteJourney,
    refetch: fetchJourneys,
  };
}
