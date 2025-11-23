import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const supabase = await createClient();
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Fetch user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, name, bio, profile_picture_url, avatar_url, cover_photo_url, cover_color, is_public, twitter_url, website_url')
      .eq('username', username)
      .eq('is_public', true)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
    }

    if (userError || !userData) {
      return NextResponse.json({ error: 'Profile not found or is private' }, { status: 404 });
    }

    // Fetch public journeys
    const { data: journeys, error: journeysError } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', userData.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (journeysError) {
      console.error('Error fetching journeys:', journeysError);
    }

    // Fetch version counts for each journey
    const journeysWithCount = await Promise.all(
      (journeys || []).map(async (journey: { id: string }) => {
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

    return NextResponse.json({
      profile: {
        username: userData.username,
        name: userData.name,
        bio: userData.bio,
        profilePictureUrl: userData.profile_picture_url || userData.avatar_url,
        coverPhotoUrl: userData.cover_photo_url,
        coverColor: userData.cover_color || '#1DA1F2',
        twitterUrl: userData.twitter_url,
        websiteUrl: userData.website_url,
      },
      journeys: journeysWithCount,
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
