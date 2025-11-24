import { NextResponse } from 'next/server';
import { getPublicProfileByUsername, getPublicJourneysByUserId } from '@/utils/publicProfile';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Fetch user profile data using shared utility
    const profileData = await getPublicProfileByUsername(username);

    if (!profileData) {
      return NextResponse.json({ error: 'Profile not found or is private' }, { status: 404 });
    }

    // Fetch public journeys using shared utility
    const journeys = await getPublicJourneysByUserId(profileData.userId);

    return NextResponse.json({
      profile: profileData.profile,
      journeys,
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
