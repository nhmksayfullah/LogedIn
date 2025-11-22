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
      .select('id, username, bio, profile_picture_url, avatar_url, cover_photo_url, cover_color, is_public')
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

    return NextResponse.json({
      profile: {
        username: userData.username,
        bio: userData.bio,
        profilePictureUrl: userData.profile_picture_url || userData.avatar_url,
        coverPhotoUrl: userData.cover_photo_url,
        coverColor: userData.cover_color || '#1DA1F2',
      },
      journeys: journeys || [],
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
