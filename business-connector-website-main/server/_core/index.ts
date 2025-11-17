import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Lead collection endpoint with optional reCAPTCHA
  app.post("/api/lead", async (req, res) => {
    try {
      const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
      const webhookUrl = process.env.GHL_WEBHOOK_URL || process.env.VITE_GHL_WEBHOOK_URL;
      const { recaptchaToken, payload } = req.body || {};

      if (!webhookUrl) {
        return res.status(500).json({ ok: false, error: "Webhook URL not configured" });
      }

      if (recaptchaSecret) {
        if (!recaptchaToken) {
          return res.status(400).json({ ok: false, error: "Missing reCAPTCHA token" });
        }
        const params = new URLSearchParams();
        params.set("secret", recaptchaSecret);
        params.set("response", recaptchaToken);
        const verifyResp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
        const verifyJson = (await verifyResp.json()) as any;
        if (!verifyJson.success || (typeof verifyJson.score === "number" && verifyJson.score < 0.5)) {
          return res.status(400).json({ ok: false, error: "Failed reCAPTCHA verification" });
        }
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
      });
      if (!response.ok) {
        const text = await response.text();
        return res.status(502).json({ ok: false, error: `Webhook failed: ${text}` });
      }
      return res.json({ ok: true });
    } catch (err: any) {
      console.error("/api/lead error", err);
      return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
    }
  });
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
