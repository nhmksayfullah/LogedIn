# Stripe Webhook Events Configuration

## 📋 Complete Event List for One-Time Payment Integration

Configure these events in your [Stripe Dashboard Webhooks](https://dashboard.stripe.com/webhooks) settings.

---

## ✅ REQUIRED EVENTS (Must Configure)

These events are **critical** for your payment flow to work correctly:

### Core Payment Flow
- [x] `checkout.session.completed`
- [x] `checkout.session.async_payment_succeeded`
- [x] `checkout.session.async_payment_failed`
- [x] `payment_intent.succeeded`
- [x] `payment_intent.payment_failed`

**Why:** Handle both instant payments (cards) and delayed payments (ACH, bank transfers) correctly.

---

## ⚠️ IMPORTANT EVENTS (Strongly Recommended)

These events handle **customer service scenarios** that will happen in production:

### Refunds & Disputes
- [ ] `charge.refunded`
- [ ] `charge.dispute.created`
- [ ] `charge.dispute.closed`
- [ ] `charge.dispute.funds_withdrawn`
- [ ] `charge.dispute.funds_reinstated`

**Why:** 
- Handle refund requests from customers
- Respond to chargebacks/disputes
- Revoke access when disputes are lost
- Restore access when disputes are won

---

## 📊 ANALYTICS EVENTS (Optional - Recommended)

Track business metrics and improve conversion:

### Checkout Analytics
- [ ] `checkout.session.expired`

### Charge Tracking
- [ ] `charge.succeeded`
- [ ] `charge.failed`
- [ ] `charge.captured`
- [ ] `charge.updated`

**Why:** 
- Measure checkout abandonment rates
- Track payment success/failure rates
- Monitor payment processing issues

---

## 👥 CUSTOMER MANAGEMENT EVENTS (Optional)

Sync customer data with your CRM:

- [ ] `customer.created`
- [ ] `customer.updated`
- [ ] `customer.deleted`

**Why:** Keep customer records in sync between Stripe and your database.

---

## 💳 PAYMENT METHOD EVENTS (Optional)

Track saved payment methods:

- [ ] `payment_method.attached`
- [ ] `payment_method.detached`
- [ ] `payment_method.updated`

**Why:** Monitor when customers save/remove payment methods.

---

## 🔧 Configuration Steps

### 1. Add Webhook Endpoint in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select API version: **Latest** (or match your Stripe SDK version)

### 2. Select Events

**Minimum Required (5 events):**
```
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
payment_intent.succeeded
payment_intent.payment_failed
```

**Recommended Production Setup (11 events):**
```
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
charge.dispute.created
charge.dispute.closed
charge.dispute.funds_withdrawn
charge.dispute.funds_reinstated
```

**Complete Integration (22 events):**
```
# Core
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired

# Payment Intent
payment_intent.succeeded
payment_intent.payment_failed

# Charges
charge.succeeded
charge.failed
charge.captured
charge.refunded
charge.updated

# Disputes
charge.dispute.created
charge.dispute.closed
charge.dispute.funds_withdrawn
charge.dispute.funds_reinstated

# Customers
customer.created
customer.updated
customer.deleted

# Payment Methods
payment_method.attached
payment_method.detached
payment_method.updated
```

### 3. Copy Webhook Secret

After creating the endpoint:
1. Click on your newly created webhook endpoint
2. Click **"Reveal"** under "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Update your `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

---

## 🧪 Testing Webhooks

### Local Testing with Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to your Stripe account:
   ```bash
   stripe login
   ```
3. Forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. In another terminal, trigger test events:
   ```bash
   # Test successful payment
   stripe trigger checkout.session.completed
   
   # Test async payment success
   stripe trigger checkout.session.async_payment_succeeded
   
   # Test payment failure
   stripe trigger payment_intent.payment_failed
   
   # Test refund
   stripe trigger charge.refunded
   
   # Test dispute
   stripe trigger charge.dispute.created
   ```

### Production Testing

1. Use test mode first: https://dashboard.stripe.com/test/webhooks
2. Create a test purchase with card `4242 4242 4242 4242`
3. Check webhook delivery logs in Dashboard
4. Verify purchase created in your Supabase database

---

## 🔒 Security Best Practices

1. **Always verify webhook signatures** ✅ (Already implemented)
2. **Use HTTPS in production** (required by Stripe)
3. **Return 200 response quickly** - Don't block on long operations
4. **Handle idempotency** - Same webhook may be sent multiple times
5. **Log all webhook events** ✅ (Already implemented)

---

## 📈 Monitoring

### Check Webhook Health

Monitor in Stripe Dashboard:
- Success rate should be > 99%
- Response time should be < 1 second
- Failed deliveries indicate issues

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Signature verification fails | Wrong webhook secret | Update STRIPE_WEBHOOK_SECRET |
| Timeout errors | Slow database/API calls | Return 200 immediately, process async |
| 4xx errors | Invalid data handling | Check error logs, fix code |

---

## 🎯 Current Implementation Status

Your webhook handler currently handles:

✅ **Fully Implemented:**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

📋 **Event logged, no action needed:**
- `checkout.session.expired`

⚠️ **Not yet handled (add if needed):**
- Dispute funds withdrawn/reinstated
- Customer CRUD events
- Payment method events
- Charge tracking events

---

## 🚀 Ready for Production?

### Checklist:

- [ ] Webhook endpoint URL configured in Stripe Dashboard (production)
- [ ] All required events selected (minimum 5)
- [ ] Webhook secret copied to production environment variables
- [ ] Tested with Stripe CLI locally
- [ ] Tested in Stripe test mode
- [ ] Monitoring/alerting set up for failed webhooks
- [ ] 200 response time < 1 second verified

---

## 📞 Support Resources

- Stripe Webhooks Docs: https://stripe.com/docs/webhooks
- Event Types Reference: https://stripe.com/docs/api/events/types
- Webhook Best Practices: https://stripe.com/docs/webhooks/best-practices
- Test Your Integration: https://stripe.com/docs/testing

---

**Last Updated:** November 22, 2025
**Integration Type:** One-Time Payment (Checkout Sessions)
**Payment Mode:** `payment` (not subscription)
