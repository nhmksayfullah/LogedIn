import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { withCors } from '@/utils/cors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function for consistent logging
function logWebhookEvent(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] WEBHOOK: ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// Need to disable body parsing for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};


async function checkExistingPurchase(userId: string): Promise<boolean> {
  const { data: existingPurchase } = await supabaseAdmin
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return !!existingPurchase;
}

// ============================================================================
// WEBHOOK EVENTS FOR ONE-TIME PAYMENT CHECKOUT SESSIONS
// ============================================================================
//
// CORE EVENTS (Required - Must handle):
// 1. checkout.session.completed - Customer completes checkout (instant payments)
// 2. checkout.session.async_payment_succeeded - Delayed payment succeeds (ACH, bank transfers)
// 3. checkout.session.async_payment_failed - Delayed payment fails
// 4. payment_intent.succeeded - Payment successfully processed
// 5. payment_intent.payment_failed - Payment fails
//
// REFUND & DISPUTE EVENTS (Important - Customer service):
// 6. charge.refunded - Full or partial refund issued
// 7. charge.refund.updated - Refund status changes
// 8. charge.dispute.created - Customer disputes payment
// 9. charge.dispute.closed - Dispute resolved (won/lost)
// 10. charge.dispute.funds_withdrawn - Funds withdrawn for dispute
// 11. charge.dispute.funds_reinstated - Dispute won, funds returned
//
// ANALYTICS & MONITORING EVENTS (Optional - Business intelligence):
// 12. checkout.session.expired - Session expires (24h timeout, no payment)
// 13. charge.succeeded - Charge successfully created
// 14. charge.failed - Charge attempt fails
// 15. charge.captured - Charge captured (for auth/capture flow)
// 16. charge.updated - Charge details updated
//
// CUSTOMER EVENTS (Optional - CRM/Support):
// 17. customer.created - New customer created
// 18. customer.updated - Customer details updated
// 19. customer.deleted - Customer deleted
//
// PAYMENT METHOD EVENTS (Optional - Payment management):
// 20. payment_method.attached - Payment method saved to customer
// 21. payment_method.detached - Payment method removed
// 22. payment_method.updated - Payment method details updated
//
// ============================================================================

export const POST = withCors(async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  try {
    logWebhookEvent('Received webhook request');

    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logWebhookEvent(`Event received: ${event.type}`, event.data.object);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        logWebhookEvent('Processing checkout.session.completed', {
          sessionId: session.id,
          clientReferenceId: session.client_reference_id,
          customerId: session.customer,
          paymentIntent: session.payment_intent,
          mode: session.mode,
          paymentStatus: session.payment_status
        });

        // Only handle payment mode (one-time purchases)
        if (session.mode !== 'payment') {
          logWebhookEvent('Skipping non-payment mode session', { mode: session.mode });
          return NextResponse.json({ status: 'skipped', message: 'Not a one-time payment' });
        }

        // If payment_intent is missing, we can't process this
        if (!session.payment_intent) {
          logWebhookEvent('Missing payment_intent', { sessionId: session.id });
          return NextResponse.json({ error: 'No payment intent' }, { status: 400 });
        }

        // If we have client_reference_id and customer, use the standard flow
        if (session.client_reference_id && session.customer) {
          // Check for existing purchase
          const hasExistingPurchase = await checkExistingPurchase(session.client_reference_id);
          
          if (hasExistingPurchase) {
            logWebhookEvent('Duplicate purchase attempt blocked', {
              userId: session.client_reference_id,
              sessionId: session.id
            });
            
            return NextResponse.json({ 
              status: 'blocked',
              message: 'User already has an active purchase'
            });
          }

          // For instant payment methods, payment_status will be 'paid'
          // For delayed payment methods (ACH, bank transfers), payment_status will be 'unpaid'
          // We create the purchase record in both cases, but with different status
          const purchaseStatus = session.payment_status === 'paid' ? 'active' : 'pending';

          try {
            const purchase = await createPurchase(
              session.payment_intent as string,
              session.client_reference_id!,
              session.customer as string,
              purchaseStatus
            );
            logWebhookEvent('Successfully created purchase', purchase);
          } catch (error) {
            logWebhookEvent('Failed to create purchase', error);
            throw error;
          }
        } else {
          // Fallback: No client_reference_id or customer
          // Try to get email from customer_details as additional fallback
          const email = session.customer_details?.email || session.customer_email;
          
          if (email) {
            logWebhookEvent('Attempting email-based user lookup from customer_details', { email });
            
            try {
              const { data: user, error: userError } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

              if (user && !userError) {
                logWebhookEvent('Found user by email, creating purchase', { userId: user.id });
                
                // Check for existing purchase
                const hasExistingPurchase = await checkExistingPurchase(user.id);
                
                if (!hasExistingPurchase) {
                  const purchaseStatus = session.payment_status === 'paid' ? 'active' : 'pending';
                  
                  await createPurchase(
                    session.payment_intent as string,
                    user.id,
                    (session.customer as string) || '',
                    purchaseStatus
                  );
                  
                  return NextResponse.json({ 
                    status: 'success',
                    message: 'Purchase created via email lookup'
                  });
                } else {
                  logWebhookEvent('User already has existing purchase', { userId: user.id });
                }
              } else {
                logWebhookEvent('Could not find user by email', { email, error: userError });
              }
            } catch (error) {
              logWebhookEvent('Error in email-based user lookup', error);
            }
          }
          
          // Last resort: Let payment_intent.succeeded handle this
          logWebhookEvent('Checkout session missing client_reference_id - deferring to payment_intent.succeeded', {
            sessionId: session.id,
            paymentIntent: session.payment_intent,
            paymentStatus: session.payment_status
          });
          
          return NextResponse.json({ 
            status: 'deferred',
            message: 'Will be processed by payment_intent.succeeded event'
          });
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        logWebhookEvent('Processing checkout.session.async_payment_succeeded', {
          sessionId: session.id,
          paymentIntent: session.payment_intent,
          customerId: session.customer
        });

        // Update purchase status to active for delayed payment methods
        if (session.payment_intent) {
          const { error } = await supabaseAdmin
            .from('purchases')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', session.payment_intent as string);

          if (error) {
            logWebhookEvent('Error activating purchase on async payment success', error);
          } else {
            logWebhookEvent('Purchase activated successfully for async payment');
          }
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        logWebhookEvent('Processing checkout.session.async_payment_failed', {
          sessionId: session.id,
          paymentIntent: session.payment_intent,
          customerId: session.customer
        });

        // Mark purchase as failed for delayed payment methods
        if (session.payment_intent) {
          const { error } = await supabaseAdmin
            .from('purchases')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', session.payment_intent as string);

          if (error) {
            logWebhookEvent('Error marking purchase as failed on async payment failure', error);
          } else {
            logWebhookEvent('Purchase marked as failed for async payment');
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        logWebhookEvent('Processing checkout.session.expired', {
          sessionId: session.id,
          clientReferenceId: session.client_reference_id
        });

        // Optional: Track expired sessions for analytics
        // You could log this to your database or analytics system
        // No critical action needed - just awareness of abandoned checkouts
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        logWebhookEvent('Processing charge.refunded', {
          chargeId: charge.id,
          amountRefunded: charge.amount_refunded,
          refunded: charge.refunded
        });

        // Handle full or partial refunds
        if (charge.payment_intent) {
          const { error } = await supabaseAdmin
            .from('purchases')
            .update({
              status: charge.refunded ? 'refunded' : 'partially_refunded',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', charge.payment_intent as string);

          if (error) {
            logWebhookEvent('Error updating purchase on refund', error);
          }
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        
        logWebhookEvent('Processing charge.dispute.created', {
          disputeId: dispute.id,
          chargeId: dispute.charge,
          amount: dispute.amount,
          reason: dispute.reason
        });

        // Mark purchase as disputed
        if (dispute.payment_intent) {
          const { error } = await supabaseAdmin
            .from('purchases')
            .update({
              status: 'disputed',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', dispute.payment_intent as string);

          if (error) {
            logWebhookEvent('Error marking purchase as disputed', error);
          }
        }
        break;
      }

      case 'charge.dispute.closed': {
        const dispute = event.data.object as Stripe.Dispute;
        
        logWebhookEvent('Processing charge.dispute.closed', {
          disputeId: dispute.id,
          chargeId: dispute.charge,
          status: dispute.status
        });

        // Update purchase based on dispute outcome
        if (dispute.payment_intent) {
          const newStatus = dispute.status === 'won' ? 'active' : 'dispute_lost';
          
          const { error } = await supabaseAdmin
            .from('purchases')
            .update({
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', dispute.payment_intent as string);

          if (error) {
            logWebhookEvent('Error updating purchase after dispute closed', error);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        logWebhookEvent('Processing payment_intent.succeeded', {
          paymentIntentId: paymentIntent.id,
          customerId: paymentIntent.customer,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });

        // First, try to update an existing purchase record
        const { data: existingPurchase, error: updateError } = await supabaseAdmin
          .from('purchases')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .select()
          .single();

        if (updateError && updateError.code !== 'PGRST116') {
          logWebhookEvent('Error updating purchase on payment success', updateError);
        }

        // If no existing purchase and no customer, try to create one by looking up user by email
        if (!existingPurchase && !paymentIntent.customer) {
          logWebhookEvent('Payment succeeded without customer - attempting to create purchase via email lookup', {
            paymentIntentId: paymentIntent.id
          });

          try {
            // Retrieve the charge to get billing email
            const paymentIntentWithCharge = await stripe.paymentIntents.retrieve(paymentIntent.id, {
              expand: ['latest_charge']
            });

            const charge = paymentIntentWithCharge.latest_charge as Stripe.Charge | null;
            const billingEmail = charge?.billing_details?.email;

            if (billingEmail) {
              logWebhookEvent('Found billing email, looking up user', { email: billingEmail });

              // Look up user by email
              const { data: user, error: userError } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', billingEmail)
                .single();

              if (user && !userError) {
                logWebhookEvent('Found user, creating purchase record', { userId: user.id });

                // Check if user already has an active purchase
                const { data: existingUserPurchase } = await supabaseAdmin
                  .from('purchases')
                  .select('*')
                  .eq('user_id', user.id)
                  .eq('status', 'active')
                  .single();

                if (existingUserPurchase) {
                  logWebhookEvent('User already has active purchase, skipping', { userId: user.id });
                } else {
                  // Create purchase record
                  const { data: newPurchase, error: insertError } = await supabaseAdmin
                    .from('purchases')
                    .insert({
                      user_id: user.id,
                      stripe_customer_id: null,
                      stripe_payment_intent_id: paymentIntent.id,
                      purchase_type: 'lifetime_pro',
                      status: 'active',
                      amount_paid: paymentIntent.amount,
                      currency: paymentIntent.currency,
                      coupon_id: null,
                      purchased_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                  if (insertError) {
                    logWebhookEvent('Error creating purchase from email lookup', insertError);
                  } else {
                    logWebhookEvent('Successfully created purchase from email lookup', newPurchase);
                  }
                }
              } else {
                logWebhookEvent('Could not find user by email', { email: billingEmail, error: userError });
              }
            } else {
              logWebhookEvent('No billing email found on charge');
            }
          } catch (error) {
            logWebhookEvent('Error in email-based purchase creation', error);
          }
        }
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        logWebhookEvent('Processing payment_intent.payment_failed', {
          paymentIntentId: paymentIntent.id,
          customerId: paymentIntent.customer
        });

        // Mark purchase as failed
        const { error } = await supabaseAdmin
          .from('purchases')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          logWebhookEvent('Error updating purchase on payment failure', error);
        }
        
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logWebhookEvent('Webhook error', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
});

async function createPurchase(paymentIntentId: string, userId: string, customerId: string, initialStatus: string = 'active') {
  logWebhookEvent('Starting createPurchase', { paymentIntentId, userId, customerId, initialStatus });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge']
    });
    logWebhookEvent('Retrieved payment intent', paymentIntent);

    // Check if purchase already exists
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      logWebhookEvent('Error checking existing purchase', checkError);
    }

    if (existingData) {
      logWebhookEvent('Purchase already exists', existingData);
      return existingData;
    }

    // Extract coupon information if available
    const charge = paymentIntent.latest_charge as Stripe.Charge | null;
    const invoice = charge?.invoice ? await stripe.invoices.retrieve(charge.invoice as string) : null;
    const couponId = invoice?.discount?.coupon?.id || null;

    logWebhookEvent('Creating new purchase record');
    const { data, error: insertError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_payment_intent_id: paymentIntentId,
        purchase_type: 'lifetime_pro',
        status: initialStatus,
        amount_paid: paymentIntent.amount,
        currency: paymentIntent.currency,
        coupon_id: couponId,
        purchased_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      logWebhookEvent('Error inserting new purchase', insertError);
      throw insertError;
    }

    logWebhookEvent('Successfully created new purchase', data);
    return data;
  } catch (error) {
    logWebhookEvent('Error in createPurchase', error);
    throw error;
  }
} 