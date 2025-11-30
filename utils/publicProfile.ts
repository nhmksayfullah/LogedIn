import { createClient } from '@/utils/supabase/server';

export interface PublicProfile {
  username: string;
  name: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  coverPhotoUrl: string | null;
  coverColor: string;
  twitterUrl: string | null;
  websiteUrl: string | null;
  isVerified: boolean;
}

export interface PublicJourney {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  cover_color: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  version_count?: number;
}

export interface PublicVersion {
  id: string;
  journey_id: string;
  date: string;
  title: string;
  description: string;
  cover_photo_url: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches a public user profile by username
 * Returns null if user not found or profile is not public
 */
export async function getPublicProfileByUsername(
  username: string
): Promise<{ profile: PublicProfile; userId: string } | null> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, username, name, bio, profile_picture_url, avatar_url, cover_photo_url, cover_color, is_public, twitter_url, website_url, is_verified')
    .eq('username', username)
    .eq('is_public', true)
    .single();

  if (userError || !userData) {
    console.error('[getPublicProfileByUsername] Error:', userError);
    return null;
  }

  return {
    userId: userData.id,
    profile: {
      username: userData.username,
      name: userData.name,
      bio: userData.bio,
      profilePictureUrl: userData.profile_picture_url || userData.avatar_url,
      coverPhotoUrl: userData.cover_photo_url,
      coverColor: userData.cover_color || '#1DA1F2',
      twitterUrl: userData.twitter_url,
      websiteUrl: userData.website_url,
      isVerified: userData.is_verified || false,
    },
  };
}

/**
 * Fetches all public journeys for a user
 */
export async function getPublicJourneysByUserId(
  userId: string
): Promise<PublicJourney[]> {
  const supabase = await createClient();

  const { data: journeys, error: journeysError } = await supabase
    .from('journeys')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (journeysError) {
    console.error('[getPublicJourneysByUserId] Error:', journeysError);
    return [];
  }

  // Fetch version counts for each journey
  const journeysWithCount = await Promise.all(
    (journeys || []).map(async (journey) => {
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

  return journeysWithCount;
}

/**
 * Fetches a specific public journey by slug and username
 */
export async function getPublicJourneyBySlug(
  username: string,
  journeySlug: string
): Promise<{ profile: PublicProfile; journey: PublicJourney } | null> {
  // First get the user profile
  const profileData = await getPublicProfileByUsername(username);
  if (!profileData) {
    return null;
  }

  // Get all public journeys and find the matching one
  const journeys = await getPublicJourneysByUserId(profileData.userId);
  const journey = journeys.find((j) => j.slug === journeySlug);

  if (!journey) {
    console.error('[getPublicJourneyBySlug] Journey not found or not public');
    return null;
  }

  return {
    profile: profileData.profile,
    journey,
  };
}

/**
 * Fetches all versions for a journey
 */
export async function getVersionsByJourneyId(
  journeyId: string
): Promise<PublicVersion[]> {
  const supabase = await createClient();

  const { data: versions, error } = await supabase
    .from('versions')
    .select('*')
    .eq('journey_id', journeyId)
    .order('date', { ascending: false });

  if (error) {
    console.error('[getVersionsByJourneyId] Error:', error);
    return [];
  }

  return versions || [];
}
