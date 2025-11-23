import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Version {
  id: string;
  journey_id: string;
  title: string;
  description: string | null;
  version_number: string;
  date: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  version_id: string;
  url: string;
  caption: string | null;
  created_at: string;
}

export function useVersions(journeyId: string | null) {
  const { user } = useAuth();
  const supabase = createClient(); // Create client instance
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = async () => {
    if (!journeyId || !user?.id) {
      setVersions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First verify the journey belongs to the user
      const { data: journey } = await supabase
        .from('journeys')
        .select('user_id')
        .eq('id', journeyId)
        .eq('user_id', user.id)
        .single();

      if (!journey) {
        throw new Error('Journey not found or access denied');
      }

      // Fetch versions with photos
      const { data: versionsData, error: fetchError } = await supabase
        .from('versions')
        .select(`
          *,
          photos (*)
        `)
        .eq('journey_id', journeyId)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setVersions(versionsData || []);
    } catch (err) {
      console.error('Error fetching versions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch versions');
    } finally {
      setIsLoading(false);
    }
  };

  const createVersion = async (versionData: {
    title: string;
    description?: string;
    date?: string;
    tags?: string[];
  }) => {
    if (!journeyId || !user?.id) throw new Error('Invalid journey or user');

    try {
      // Get the current version count for this journey
      const { count } = await supabase
        .from('versions')
        .select('*', { count: 'exact', head: true })
        .eq('journey_id', journeyId);

      // Generate version number (v1.0, v1.1, v1.2, etc.)
      const versionNumber = `v1.${(count || 0)}`;

      const { data, error: insertError } = await supabase
        .from('versions')
        .insert({
          journey_id: journeyId,
          title: versionData.title,
          description: versionData.description || null,
          version_number: versionNumber,
          date: versionData.date || new Date().toISOString(),
          tags: versionData.tags || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh versions list
      fetchVersions().catch(err => {
        console.error('Error refreshing versions after create:', err);
      });

      return data;
    } catch (err) {
      console.error('Error creating version:', err);
      throw err;
    }
  };

  const updateVersion = async (
    versionId: string,
    updates: Partial<Version>
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { error: updateError } = await supabase
        .from('versions')
        .update(updates)
        .eq('id', versionId);

      if (updateError) throw updateError;

      await fetchVersions();
    } catch (err) {
      console.error('Error updating version:', err);
      throw err;
    }
  };

  const deleteVersion = async (versionId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('versions')
        .delete()
        .eq('id', versionId);

      if (deleteError) throw deleteError;

      await fetchVersions();
    } catch (err) {
      console.error('Error deleting version:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchVersions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId, user?.id]);

  return {
    versions,
    isLoading,
    error,
    createVersion,
    updateVersion,
    deleteVersion,
    refetch: fetchVersions,
  };
}
