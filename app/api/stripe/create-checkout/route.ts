import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { withCors } from '@/utils/cors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const POST = withCors(async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, priceId } = await request.json();

    // Validate required fields
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and userEmail' },
        { status: 400 }
      );
    }

    // Use provided priceId or fall back to environment variable
    const stripePriceId = priceId || process.env.STRIPE_PRICE_ID;
    
    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'No price ID configured. Set STRIPE_PRICE_ID environment variable.' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Checkout Session with guaranteed client_reference_id
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId, // ✅ This will ALWAYS be passed
      customer_email: userEmail,
      metadata: {
        userId: userId, // Extra safety - also in metadata
        purchaseType: 'lifetime_pro',
      },
      success_url: `${appUrl}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/profile?canceled=true`,
      allow_promotion_codes: true, // Allow users to apply discount codes
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
});
