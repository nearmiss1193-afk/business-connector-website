import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const webhookUrl = process.env.GHL_WEBHOOK_URL || "https://eomhc.m.pipedream.net";
    const webhookId = process.env.GHL_WEBHOOK_ID || "pit-b0a41b0b-24e5-4cee-8126-ee7b80b4c89e";
    const { payload } = (req.body as any) || {};

    if (!webhookUrl) {
      return res.status(500).json({ ok: false, error: "Webhook URL not configured" });
    }

    console.log("[API/LEAD] Forwarding to webhook:", webhookUrl);
    console.log("[API/LEAD] Payload:", JSON.stringify(payload, null, 2));

    const forwardBody = {
      webhook_id: webhookId,
      timestamp: new Date().toISOString(),
      ...(payload || {}),
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
    });

    const responseText = await response.text();
    console.log("[API/LEAD] Webhook response:", response.status, responseText);

    if (!response.ok) {
      return res.status(502).json({ 
        ok: false, 
        error: `Webhook failed: ${responseText}`,
        status: response.status 
      });
    }

    return res.status(200).json({ ok: true, message: "Lead forwarded successfully" });
  } catch (err: any) {
    console.error("[API/LEAD] Error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}
