import type { VercelRequest, VercelResponse } from "@vercel/node";

const GHL_API_BASE = "https://rest.gohighlevel.com/v1";

async function forwardToWebhook(payload: any, url: string, webhookId?: string) {
  const forwardBody = {
    webhook_id: webhookId,
    ...(payload || {}),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(forwardBody),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Webhook failed: ${text}`);
  }

  return { destination: "webhook", status: response.status };
}

async function upsertGoHighLevelContact(payload: any) {
  const token = process.env.GOHIGHLEVEL_API_KEY;
  const locationId = process.env.GOHIGHLEVEL_LOCATION_ID;
  if (!token || !locationId) {
    throw new Error("GoHighLevel API credentials not configured");
  }

  const data = payload?.data || {};
  if (!data.email && !data.phone) {
    throw new Error("Lead is missing email or phone");
  }

  const source = payload?.source || "property-detail";
  const tags = ["website-lead", source];
  if (payload?.type) {
    tags.push(`type-${payload.type}`);
  }

  const contactBody = {
    locationId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    source: payload?.meta?.location || source,
    tags,
    customFields: {
      message: data.message || "",
      property_id: payload?.propertyId || "",
      agree_terms: data.agreeTerms ? "true" : "false",
      agree_consent: data.agreeConsent ? "true" : "false",
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const contactResp = await fetch(`${GHL_API_BASE}/contacts/`, {
    method: "POST",
    headers,
    body: JSON.stringify(contactBody),
  });

  let contactId: string | undefined;
  if (contactResp.ok) {
    const json = await contactResp.json();
    contactId = json?.contact?.id;
  } else if (contactResp.status === 422 && data.email) {
    const dupUrl = new URL(`${GHL_API_BASE}/contacts/search/duplicate`);
    dupUrl.searchParams.set("locationId", locationId);
    dupUrl.searchParams.set("email", data.email);
    const dupResp = await fetch(dupUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!dupResp.ok) {
      const text = await dupResp.text();
      throw new Error(`GoHighLevel duplicate search failed: ${text}`);
    }
    const dupJson = await dupResp.json();
    contactId = dupJson?.contact?.id;
  } else {
    const text = await contactResp.text();
    throw new Error(`GoHighLevel contact error: ${contactResp.status} ${text}`);
  }

  if (contactId && process.env.GOHIGHLEVEL_PIPELINE_ID && process.env.GOHIGHLEVEL_STAGE_ID) {
    await fetch(`${GHL_API_BASE}/opportunities/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        locationId,
        pipelineId: process.env.GOHIGHLEVEL_PIPELINE_ID,
        pipelineStageId: process.env.GOHIGHLEVEL_STAGE_ID,
        contactId,
        name: payload?.type === "mortgage" ? "Mortgage Lead" : "Home Buyer Lead",
        status: "open",
        monetaryValue: 0,
      }),
    });
  }

  return { destination: "gohighlevel", contactId };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const webhookUrl = process.env.GHL_WEBHOOK_URL || process.env.VITE_GHL_WEBHOOK_URL;
    const webhookId = process.env.GHL_WEBHOOK_ID || "";
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body as any) || {};
    const payload = rawBody?.payload ?? rawBody;

    const destinationsTried: string[] = [];
    const successes: any[] = [];
    const failures: Array<{ destination: string; error: string }> = [];

    if (webhookUrl) {
      destinationsTried.push("webhook");
      try {
        const result = await forwardToWebhook(payload, webhookUrl, webhookId);
        successes.push(result);
      } catch (err: any) {
        failures.push({ destination: "webhook", error: err?.message || "Webhook error" });
      }
    }

    if (process.env.GOHIGHLEVEL_API_KEY && process.env.GOHIGHLEVEL_LOCATION_ID) {
      destinationsTried.push("gohighlevel");
      try {
        const result = await upsertGoHighLevelContact(payload);
        successes.push(result);
      } catch (err: any) {
        failures.push({ destination: "gohighlevel", error: err?.message || "GoHighLevel error" });
      }
    }

    if (destinationsTried.length === 0) {
      return res.status(500).json({ ok: false, error: "No lead destinations configured" });
    }

    if (successes.length === 0) {
      const message = failures.map((f) => `${f.destination}: ${f.error}`).join(" | ");
      console.warn("/api/lead all destinations failed", message);
      return res.status(200).json({ ok: false, error: message, failures });
    }

    return res.status(200).json({ ok: true, successes, failures: failures.length ? failures : undefined });
  } catch (err: any) {
    console.error("/api/lead error", err);
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}
