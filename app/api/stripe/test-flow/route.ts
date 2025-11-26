import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/utils/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Test endpoint to verify the entire payment flow
export async function POST(request: NextRequest) {
  const results: {
    step: string;
    success: boolean;
    data?: unknown;
    error?: string;
  }[] = [];

  try {
    const { userId, userEmail } = await request.json();

    // Step 1: Verify Supabase connection
    results.push({ step: '1. Testing Supabase connection', success: false });
    try {
      const { data: testUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('id', userId)
        .single();

      if (testUser) {
        results[results.length - 1].success = true;
        results[results.length - 1].data = { userId: testUser.id, email: testUser.email };
      } else {
        results[results.length - 1].error = userError?.message || 'User not found';
      }
    } catch (error) {
      results[results.length - 1].error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Step 2: Verify Stripe API connection
    results.push({ step: '2. Testing Stripe API connection', success: false });
    try {
      const balance = await stripe.balance.retrieve();
      results[results.length - 1].success = true;
      results[results.length - 1].data = { connected: true, currency: balance.available[0]?.currency };
    } catch (error) {
      results[results.length - 1].error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Step 3: Test checkout session creation
    results.push({ step: '3. Creating test checkout session', success: false });
    try {
      const testSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        }],
        client_reference_id: userId,
        customer_email: userEmail,
        metadata: {
          userId: userId,
          purchaseType: 'lifetime_pro',
          test: 'true',
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?canceled=true`,
      });

      results[results.length - 1].success = true;
      results[results.length - 1].data = {
        sessionId: testSession.id,
        client_reference_id: testSession.client_reference_id,
        customer_email: testSession.customer_email,
        metadata: testSession.metadata,
        url: testSession.url
      };
    } catch (error) {
      results[results.length - 1].error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Step 4: Verify webhook secret is configured
    results.push({ step: '4. Checking webhook configuration', success: false });
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      results[results.length - 1].success = true;
      results[results.length - 1].data = {
        configured: true,
        prefix: process.env.STRIPE_WEBHOOK_SECRET.substring(0, 8) + '...'
      };
    } else {
      results[results.length - 1].error = 'STRIPE_WEBHOOK_SECRET not configured';
    }

    // Step 5: Check recent payments
    results.push({ step: '5. Checking recent Stripe payments', success: false });
    try {
      const paymentIntents = await stripe.paymentIntents.list({ limit: 5 });
      results[results.length - 1].success = true;
      results[results.length - 1].data = {
        count: paymentIntents.data.length,
        mostRecent: paymentIntents.data[0] ? {
          id: paymentIntents.data[0].id,
          amount: paymentIntents.data[0].amount,
          status: paymentIntents.data[0].status,
          customer: paymentIntents.data[0].customer,
          metadata: paymentIntents.data[0].metadata
        } : null
      };
    } catch (error) {
      results[results.length - 1].error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Step 6: Check existing purchases for user
    results.push({ step: '6. Checking existing purchases in database', success: false });
    try {
      const { data: purchases, error: purchaseError } = await supabaseAdmin
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      results[results.length - 1].success = true;
      results[results.length - 1].data = {
        count: purchases?.length || 0,
        purchases: purchases || []
      };
    } catch (error) {
      results[results.length - 1].error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Summary
    const successCount = results.filter(r => r.success).length;
    const totalSteps = results.length;

    return NextResponse.json({
      summary: `${successCount}/${totalSteps} steps passed`,
      allPassed: successCount === totalSteps,
      results,
      recommendations: generateRecommendations(results)
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 });
  }
}

function generateRecommendations(results: { step: string; success: boolean; error?: string }[]) {
  const recommendations: string[] = [];

  results.forEach(result => {
    if (!result.success) {
      if (result.step.includes('Supabase')) {
        recommendations.push('❌ Supabase connection failed. Check SUPABASE_SERVICE_ROLE_KEY');
      }
      if (result.step.includes('Stripe API')) {
        recommendations.push('❌ Stripe API connection failed. Check STRIPE_SECRET_KEY');
      }
      if (result.step.includes('checkout session')) {
        recommendations.push('❌ Cannot create checkout sessions. Check STRIPE_PRICE_ID and API keys');
      }
      if (result.step.includes('webhook')) {
        recommendations.push('❌ Webhook secret not configured. Set STRIPE_WEBHOOK_SECRET');
      }
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('✅ All systems operational!');
    recommendations.push('💡 If payments still aren\'t saving, check webhook delivery in Stripe Dashboard');
  }

  return recommendations;
}
