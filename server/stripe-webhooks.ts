import Stripe from "stripe";
import { ENV } from "./_core/env";
import {
  updateAgentSubscription,
  getSubscriptionByStripeId,
  updatePayment,
  getPaymentByStripeId,
  updateLead,
  getLeadPurchase,
  updateLeadPurchase,
} from "./db-revenue";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

/**
 * Verify webhook signature from Stripe
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret) as Stripe.Event;
  } catch (error) {
    console.error("[Stripe] Webhook signature verification failed:", error);
    return null;
  }
}

/**
 * Handle subscription events
 */
export async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = subscription.id;

  try {
    switch (event.type) {
      case "customer.subscription.created":
        console.log("[Stripe] Subscription created:", stripeSubscriptionId);
        // Subscription is already created in DB before webhook
        break;

      case "customer.subscription.updated":
        console.log("[Stripe] Subscription updated:", stripeSubscriptionId);
        const existingSub = await getSubscriptionByStripeId(stripeSubscriptionId);
        if (existingSub) {
          const status = subscription.status === "active" ? "active" : "paused";
          const renewalTime = subscription.current_period_end ?? Math.floor(Date.now() / 1000) + 2592000;
          await updateAgentSubscription(existingSub.id, {
            status: status as any,
            renewalDate: new Date(renewalTime * 1000),
          });
        }
        break;

      case "customer.subscription.deleted":
        console.log("[Stripe] Subscription cancelled:", stripeSubscriptionId);
        const cancelledSub = await getSubscriptionByStripeId(stripeSubscriptionId);
        if (cancelledSub) {
          await updateAgentSubscription(cancelledSub.id, {
            status: "cancelled",
            cancelledAt: new Date(),
          });
        }
        break;
    }
  } catch (error) {
    console.error("[Stripe] Error handling subscription event:", error);
    throw error;
  }
}

/**
 * Handle payment intent events
 */
export async function handlePaymentIntentEvent(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("[Stripe] Payment succeeded:", paymentIntent.id);
        const succeededPayment = await getPaymentByStripeId(paymentIntent.id);
        if (succeededPayment) {
          await updatePayment(succeededPayment.id, {
            status: "succeeded",
          });

          // If this is a lead purchase payment, mark the lead as purchased
          if (succeededPayment.leadPurchaseId) {
            const leadPurchase = await getLeadPurchase(succeededPayment.leadPurchaseId);
            if (leadPurchase) {
              await updateLeadPurchase(leadPurchase.id, {
                paymentStatus: "succeeded",
                deliveredAt: new Date(),
              });

              // Mark the lead as purchased
              await updateLead(leadPurchase.leadId, {
                isPurchased: true,
                purchasedBy: leadPurchase.agentId,
                purchasedAt: new Date(),
                purchasePrice: leadPurchase.price as any,
              });
            }
          }
        }
        break;

      case "payment_intent.payment_failed":
        console.log("[Stripe] Payment failed:", paymentIntent.id);
        const failedPayment = await getPaymentByStripeId(paymentIntent.id);
        if (failedPayment) {
          await updatePayment(failedPayment.id, {
            status: "failed",
          });

          if (failedPayment.leadPurchaseId) {
            const leadPurchase = await getLeadPurchase(failedPayment.leadPurchaseId);
            if (leadPurchase) {
              await updateLeadPurchase(leadPurchase.id, {
                paymentStatus: "failed",
              });
            }
          }
        }
        break;
    }
  } catch (error) {
    console.error("[Stripe] Error handling payment intent event:", error);
    throw error;
  }
}

/**
 * Handle invoice events
 */
export async function handleInvoiceEvent(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
        console.log("[Stripe] Invoice paid:", invoice.id);
        // Update subscription renewal date
        const subscriptionId = invoice.subscription as string | null;
        if (subscriptionId) {
          const subscription = await getSubscriptionByStripeId(subscriptionId);
          if (subscription) {
            await updateAgentSubscription(subscription.id, {
              renewalDate: new Date(invoice.lines.data[0]?.period?.end * 1000),
            });
          }
        }
        break;

      case "invoice.payment_failed":
        console.log("[Stripe] Invoice payment failed:", invoice.id);
        // Handle failed invoice payment
        const failedSubId = invoice.subscription as string | null;
        if (failedSubId) {
          const subscription = await getSubscriptionByStripeId(failedSubId);
          if (subscription) {
            await updateAgentSubscription(subscription.id, {
              status: "paused",
            });
          }
        }
        break;
    }
  } catch (error) {
    console.error("[Stripe] Error handling invoice event:", error);
    throw error;
  }
}

/**
 * Main webhook handler
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    // Route to appropriate handler based on event type
    if (event.type.startsWith("customer.subscription")) {
      await handleSubscriptionEvent(event);
    } else if (event.type.startsWith("payment_intent")) {
      await handlePaymentIntentEvent(event);
    } else if (event.type.startsWith("invoice")) {
      await handleInvoiceEvent(event);
    }

    return { received: true };
  } catch (error) {
    console.error("[Stripe] Webhook handling error:", error);
    throw error;
  }
}

/**
 * Create a subscription in Stripe
 */
export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    return subscription;
  } catch (error) {
    console.error("[Stripe] Error creating subscription:", error);
    throw error;
  }
}

/**
 * Create a payment intent for lead purchase
 */
export async function createLeadPurchasePaymentIntent(
  customerId: string,
  amount: number,
  leadId: number,
  agentId: number,
  metadata?: Record<string, string>
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        leadId: leadId.toString(),
        agentId: agentId.toString(),
        ...metadata,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error("[Stripe] Error creating payment intent:", error);
    throw error;
  }
}

/**
 * Get or create Stripe customer
 */
export async function getOrCreateStripeCustomer(
  userId: number,
  email: string,
  name?: string
) {
  try {
    // Search for existing customer
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId.toString(),
      },
    });

    return customer;
  } catch (error) {
    console.error("[Stripe] Error getting/creating customer:", error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("[Stripe] Error cancelling subscription:", error);
    throw error;
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return refund;
  } catch (error) {
    console.error("[Stripe] Error refunding payment:", error);
    throw error;
  }
}
