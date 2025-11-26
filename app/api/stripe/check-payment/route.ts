import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/utils/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Diagnostic endpoint to check payment and create missing purchase records
export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, userEmail } = await request.json();

    if (!paymentIntentId && !userEmail) {
      return NextResponse.json(
        { error: 'Provide either paymentIntentId or userEmail' },
        { status: 400 }
      );
    }

    const results: {
      paymentIntent: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        customer: string | null;
        metadata: Record<string, string>;
        created: string;
      } | null;
      user: { id: string; email: string } | null;
      existingPurchase: Record<string, unknown> | null;
      created: boolean;
      error: string | null;
      billingEmail?: string;
      newPurchase?: Record<string, unknown>;
      purchases?: Record<string, unknown>[];
    } = {
      paymentIntent: null,
      user: null,
      existingPurchase: null,
      created: false,
      error: null
    };

    // If payment intent ID provided, check it
    if (paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['latest_charge']
        });
        
        results.paymentIntent = {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customer: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
          metadata: paymentIntent.metadata as Record<string, string>,
          created: new Date(paymentIntent.created * 1000).toISOString()
        };

        // Get billing email from charge
        const charge = paymentIntent.latest_charge as Stripe.Charge | null;
        const billingEmail = charge?.billing_details?.email;
        
        if (billingEmail) {
          results.billingEmail = billingEmail;
          
          // Look up user
          const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .eq('email', billingEmail)
            .single();

          if (user) {
            results.user = user;

            // Check if purchase exists
            const { data: existingPurchase } = await supabaseAdmin
              .from('purchases')
              .select('*')
              .eq('stripe_payment_intent_id', paymentIntentId)
              .single();

            results.existingPurchase = existingPurchase;

            // If no purchase exists and payment succeeded, create it
            if (!existingPurchase && paymentIntent.status === 'succeeded') {
              const { data: newPurchase, error: insertError } = await supabaseAdmin
                .from('purchases')
                .insert({
                  user_id: user.id,
                  stripe_customer_id: paymentIntent.customer as string || null,
                  stripe_payment_intent_id: paymentIntent.id,
                  purchase_type: 'lifetime_pro',
                  status: 'active',
                  amount_paid: paymentIntent.amount,
                  currency: paymentIntent.currency,
                  purchased_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                  .single();

              if (insertError) {
                results.error = insertError.message;
              } else {
                results.created = true;
                results.newPurchase = newPurchase;
              }
            }
          } else {
            results.error = userError?.message || 'User not found with that email';
          }
        }
      } catch (error) {
        results.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // If user email provided, check their purchases
    if (userEmail) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('email', userEmail)
        .single();

      if (user) {
        results.user = user;

        const { data: purchases } = await supabaseAdmin
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        results.purchases = purchases || [];
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
