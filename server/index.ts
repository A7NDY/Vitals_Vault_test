import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  fetchWearableVitals,
  getWearableStatus,
  initiateGoogleFitAuth,
  disconnectSmartwatch,
} from "./routes/wearable";
import { authMiddleware, requirePatient } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ============================================================================
  // Wearable Integration Routes (Google Fit + Future Providers)
  // ============================================================================

  /**
   * GET /api/vitals/status
   * Check smartwatch connection status and get latest vitals
   * Requires: Authentication, Patient role
   */
  app.get("/api/vitals/status", authMiddleware, requirePatient, getWearableStatus);

  /**
   * POST /api/vitals/fetch
   * Fetch latest vitals from smartwatch
   * Auto-refreshes token if expired
   * Requires: Authentication, Patient role
   */
  app.post(
    "/api/vitals/fetch",
    authMiddleware,
    requirePatient,
    fetchWearableVitals
  );

  /**
   * POST /api/auth/google-fit
   * Initiate Google Fit OAuth authentication
   * Returns authorization URL for redirect
   * Requires: Authentication, Patient role
   */
  app.post(
    "/api/auth/google-fit",
    authMiddleware,
    requirePatient,
    initiateGoogleFitAuth
  );

  /**
   * POST /api/auth/google-fit/disconnect
   * Disconnect smartwatch and revoke OAuth tokens
   * Requires: Authentication, Patient role
   */
  app.post(
    "/api/auth/google-fit/disconnect",
    authMiddleware,
    requirePatient,
    disconnectSmartwatch
  );

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
    });
  });

  return app;
}
