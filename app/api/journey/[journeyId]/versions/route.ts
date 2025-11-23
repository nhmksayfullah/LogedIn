import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ journeyId: string }> }
) {
  try {
    const { journeyId } = await context.params;
    const supabase = await createClient();

    // Check if journey is public
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .select('is_public')
      .eq('id', journeyId)
      .single();

    if (journeyError || !journey || !journey.is_public) {
      return NextResponse.json({ error: 'Journey not found or not public' }, { status: 404 });
    }

    // Fetch versions for public journey
    const { data: versions, error: versionsError } = await supabase
      .from('versions')
      .select('*')
      .eq('journey_id', journeyId)
      .order('date', { ascending: false });

    if (versionsError) {
      console.error('Error fetching versions:', versionsError);
      return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
    }

    return NextResponse.json(versions || []);
  } catch (error) {
    console.error('Error in GET /api/journey/[journeyId]/versions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
