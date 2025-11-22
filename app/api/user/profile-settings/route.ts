import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isPublic, bio } = body;

    // Validate inputs
    if (typeof isPublic !== 'boolean' && bio === undefined) {
      return NextResponse.json(
        { error: 'isPublic (boolean) or bio (string) is required' },
        { status: 400 }
      );
    }

    // Validate bio length if provided
    if (bio !== undefined && bio !== null) {
      if (typeof bio !== 'string') {
        return NextResponse.json({ error: 'Bio must be a string' }, { status: 400 });
      }
      if (bio.length > 500) {
        return NextResponse.json({ error: 'Bio must be 500 characters or less' }, { status: 400 });
      }
    }

    // Build update object
    const updates: { is_public?: boolean; bio?: string } = {};
    if (typeof isPublic === 'boolean') {
      updates.is_public = isPublic;
    }
    if (bio !== undefined) {
      updates.bio = bio;
    }

    // Update user profile
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { journeyId, isPublic } = body;

    if (!journeyId || typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'journeyId and isPublic (boolean) are required' },
        { status: 400 }
      );
    }

    // Verify journey ownership
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .select('user_id')
      .eq('id', journeyId)
      .single();

    if (journeyError || !journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    if (journey.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update journey visibility
    const { error } = await supabase
      .from('journeys')
      .update({ is_public: isPublic })
      .eq('id', journeyId);

    if (error) {
      console.error('Error updating journey visibility:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating journey visibility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
