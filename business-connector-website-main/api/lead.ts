import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const webhookUrl = process.env.GHL_WEBHOOK_URL || process.env.VITE_GHL_WEBHOOK_URL;
    const webhookId = process.env.GHL_WEBHOOK_ID || "";
    const { recaptchaToken, payload } = (req.body as any) || {};

    if (!webhookUrl) {
      return res.status(500).json({ ok: false, error: "Webhook URL not configured" });
    }

    // No reCAPTCHA verification for now (explicitly skipped per user instruction)

    const forwardBody = {
      webhook_id: webhookId,
      ...(payload || {}),
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ ok: false, error: `Webhook failed: ${text}` });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("/api/lead error", err);
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}
