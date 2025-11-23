import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's limits
    const { data: limits, error: limitsError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (limitsError) {
      console.error('Error fetching user limits:', limitsError);
      // If no limits found, assume free tier defaults
      return NextResponse.json({
        canCreate: false,
        currentCount: 0,
        limit: 1,
        isLifetimePro: false,
        message: 'Free plan allows only 1 journey. Upgrade to create more!'
      });
    }

    // Count current journeys
    const { count: currentCount, error: countError } = await supabase
      .from('journeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error counting journeys:', countError);
      return NextResponse.json(
        { error: 'Failed to check journey limit' },
        { status: 500 }
      );
    }

    const journeyCount = currentCount || 0;
    const journeyLimit = limits.journey_limit || 1;
    const isLifetimePro = journeyLimit > 100; // Effectively unlimited
    const canCreate = journeyCount < journeyLimit;

    let message = '';
    if (!canCreate) {
      if (isLifetimePro) {
        message = 'You have reached the maximum number of journeys.';
      } else {
        message = `Free plan allows only ${journeyLimit} journey. Upgrade to Lifetime Pro for unlimited journeys!`;
      }
    }

    return NextResponse.json({
      canCreate,
      currentCount: journeyCount,
      limit: journeyLimit,
      isLifetimePro,
      message,
      limits: {
        canHideMilestones: limits.can_hide_milestones,
        hasVerifiedBadge: limits.has_verified_badge,
        hasCustomThemes: limits.has_custom_themes,
      }
    });
  } catch (error) {
    console.error('Error in check-limit endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
