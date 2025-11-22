import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { withCors } from '@/utils/cors';

export const DELETE = withCors(async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Starting account soft-deletion for user:', userId);

    // 1. Mark user's purchases as inactive (one-time payments cannot be cancelled)
    const { error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (purchaseError) {
      console.error('Purchase update error:', purchaseError);
    }

    // 2. Soft delete the profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .update({ 
        deleted_at: new Date().toISOString(),
        is_deleted: true
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile', details: profileError },
        { status: 500 }
      );
    }

    console.log('Account soft-deletion completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in account soft-deletion:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process account deletion', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}); 