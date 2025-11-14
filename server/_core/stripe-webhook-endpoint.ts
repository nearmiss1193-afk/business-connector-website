import { Request, Response } from "express";
import { ENV } from "./env";
import { handleStripeWebhook, verifyWebhookSignature } from "../stripe-webhooks";

/**
 * Stripe webhook endpoint handler
 * Mount at POST /api/webhooks/stripe
 */
export async function handleStripeWebhookEndpoint(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  try {
    // Get raw body for signature verification
    const body = (req as any).rawBody || JSON.stringify(req.body);

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, ENV.stripeWebhookSecret);

    if (!event) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Handle the event
    await handleStripeWebhook(event);

    // Return success
    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing Stripe webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
