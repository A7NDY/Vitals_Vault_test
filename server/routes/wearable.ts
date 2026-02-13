import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { encryptToken, decryptToken } from "../utils/encryption";
import {
  logVitalsSyncActivity,
  logTokenRefresh,
  logAuthEvent,
  logAccessEvent,
} from "../utils/logger";
import { ProviderFactory } from "../lib/wearable-providers";

/**
 * POST /api/vitals/fetch
 * Fetch latest vitals from wearable device
 * Requires: Patient role, authenticated user
 */
export const fetchWearableVitals: RequestHandler = async (req: AuthRequest, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  try {
    if (!req.user) {
      logAccessEvent("anonymous", "/api/vitals/fetch", "POST", 401, ipAddress);
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const { userId } = req.user;

    // Log access event
    logAccessEvent(userId, "/api/vitals/fetch", "POST", 200, ipAddress);

    // Step 1: Retrieve user's stored Google Fit tokens from database
    // This would query: SELECT * FROM google_fit_tokens WHERE user_id = ?
    const storedTokenData = null; // Placeholder - would come from DB

    if (!storedTokenData) {
      logVitalsSyncActivity(userId, "fetch_vitals", "failure", {
        reason: "no_tokens_found",
      });

      res.status(401).json({
        error: "Not Connected",
        message: "Smartwatch not connected. Please connect first.",
        status: "not_connected",
      });
      return;
    }

    // Step 2: Decrypt stored access token
    let accessToken: string;
    try {
      accessToken = decryptToken(storedTokenData.access_token);
    } catch (error) {
      logVitalsSyncActivity(userId, "fetch_vitals", "failure", {
        reason: "decryption_failed",
        error: String(error),
      });

      res.status(500).json({
        error: "Server Error",
        message: "Failed to decrypt stored token",
        status: "error",
      });
      return;
    }

    // Step 3: Check if token is expired and refresh if needed
    const provider = ProviderFactory.createProvider("google_fit", {
      clientId: process.env.GOOGLE_FIT_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_FIT_REDIRECT_URI || "",
      scopes: [
        "https://www.googleapis.com/auth/fitness.heart_rate.read",
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.sleep.read",
      ],
    });

    const tokenData = {
      accessToken,
      refreshToken: storedTokenData.refresh_token,
      expiresAt: new Date(storedTokenData.expiry_date),
      scope: storedTokenData.scope || [],
    };

    if (!provider.isTokenValid(tokenData)) {
      try {
        // Token expired, refresh it
        const newToken = await provider.refreshToken(tokenData.refreshToken);

        // Encrypt and update in database
        const encryptedAccessToken = encryptToken(newToken.accessToken);
        // UPDATE google_fit_tokens SET access_token = ?, expiry_date = ? WHERE user_id = ?
        // (This would update the database)

        logTokenRefresh(userId, "google_fit", true);

        accessToken = newToken.accessToken;
      } catch (error) {
        logTokenRefresh(userId, "google_fit", false, String(error));

        res.status(500).json({
          error: "Token Refresh Failed",
          message: "Could not refresh smartwatch token",
          status: "error",
        });
        return;
      }
    }

    // Step 4: Fetch vitals from Google Fit API
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days
    const endDate = new Date();

    let vitals;
    try {
      vitals = await provider.fetchVitals(tokenData, startDate, endDate);
    } catch (error) {
      logVitalsSyncActivity(userId, "fetch_vitals", "failure", {
        reason: "api_fetch_failed",
        error: String(error),
      });

      res.status(500).json({
        error: "Fetch Failed",
        message: "Could not fetch vitals from wearable device",
        status: "error",
      });
      return;
    }

    // Step 5: Get latest vitals (most recent entry)
    const latestVital = vitals[vitals.length - 1] || {
      heartRate: 0,
      steps: 0,
      calories: 0,
      sleepDuration: 0,
      recordedAt: new Date(),
    };

    // Step 6: Store vitals in wearable_vitals table
    // INSERT INTO wearable_vitals (user_id, heart_rate, steps, calories, sleep_minutes, recorded_at, source)
    // VALUES (?, ?, ?, ?, ?, ?, 'google_fit')

    logVitalsSyncActivity(userId, "fetch_vitals", "success", {
      heartRate: latestVital.heartRate,
      steps: latestVital.steps,
      calories: latestVital.calories,
      sleepDuration: latestVital.sleepDuration,
      entriesCount: vitals.length,
    });

    // Step 7: Return normalized response
    res.status(200).json({
      heart_rate: latestVital.heartRate || 0,
      steps: latestVital.steps || 0,
      calories: latestVital.calories || 0,
      sleep_minutes: latestVital.sleepDuration || 0,
      status: "Synced Successfully",
      recordedAt: latestVital.recordedAt,
      source: "google_fit",
    });
  } catch (error) {
    logVitalsSyncActivity(req.user?.email || "unknown", "fetch_vitals", "failure", {
      reason: "unexpected_error",
      error: String(error),
    });

    res.status(500).json({
      error: "Server Error",
      message: "Failed to sync vitals",
      status: "error",
    });
  }
};

/**
 * GET /api/vitals/status
 * Check smartwatch connection status
 * Requires: Patient role, authenticated user
 */
export const getWearableStatus: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const { userId } = req.user;

    // Query: SELECT * FROM google_fit_tokens WHERE user_id = ?
    const tokenData = null; // Placeholder - would come from DB

    if (!tokenData) {
      res.status(404).json({
        connected: false,
        message: "No smartwatch connected",
      });
      return;
    }

    // Get latest vitals
    // SELECT * FROM wearable_vitals WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1
    const latestVital = null; // Placeholder - would come from DB

    res.status(200).json({
      connected: true,
      provider: "google_fit",
      lastSyncTime: latestVital?.recorded_at || tokenData.last_refreshed_at,
      vitals: latestVital
        ? {
            heartRate: latestVital.heart_rate,
            steps: latestVital.steps,
            calories: latestVital.calories,
            sleepDuration: latestVital.sleep_minutes,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
      message: "Failed to check wearable status",
    });
  }
};

/**
 * POST /api/auth/google-fit
 * Initiate Google Fit OAuth flow
 * Requires: Patient role, authenticated user
 */
export const initiateGoogleFitAuth: RequestHandler = async (req: AuthRequest, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  try {
    if (!req.user) {
      logAccessEvent("anonymous", "/api/auth/google-fit", "POST", 401, ipAddress);
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const { userId } = req.user;

    // Create provider instance
    const provider = ProviderFactory.createProvider("google_fit", {
      clientId: process.env.GOOGLE_FIT_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_FIT_REDIRECT_URI || "",
      scopes: [
        "https://www.googleapis.com/auth/fitness.heart_rate.read",
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.sleep.read",
      ],
    });

    // Generate state for CSRF protection
    const state = Buffer.from(`${userId}_${Date.now()}`).toString("base64");

    // Store state in session (in production, use session storage)
    // SESSION[state] = { userId, timestamp: Date.now() }

    // Get authorization URL
    const authUrl = provider.getAuthorizationUrl(state);

    logAuthEvent(userId, "authorize", "google_fit", true, ipAddress);

    res.status(200).json({
      authUrl,
      message: "Redirect to this URL to authorize",
    });
  } catch (error) {
    logAuthEvent(
      req.user?.email || "unknown",
      "authorize",
      "google_fit",
      false,
      ipAddress || ""
    );

    res.status(500).json({
      error: "Server Error",
      message: "Failed to initiate authentication",
    });
  }
};

/**
 * POST /api/auth/google-fit/disconnect
 * Disconnect smartwatch
 * Requires: Patient role, authenticated user
 */
export const disconnectSmartwatch: RequestHandler = async (req: AuthRequest, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  try {
    if (!req.user) {
      logAccessEvent("anonymous", "/api/auth/google-fit/disconnect", "POST", 401, ipAddress);
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const { userId } = req.user;

    // Get stored token
    // SELECT * FROM google_fit_tokens WHERE user_id = ?
    const tokenData = null; // Placeholder - would come from DB

    if (!tokenData) {
      res.status(404).json({
        error: "Not Connected",
        message: "No smartwatch connected",
      });
      return;
    }

    try {
      // Decrypt token
      const accessToken = decryptToken(tokenData.access_token);

      // Revoke token with provider
      const provider = ProviderFactory.createProvider("google_fit", {
        clientId: process.env.GOOGLE_FIT_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET || "",
        redirectUri: process.env.GOOGLE_FIT_REDIRECT_URI || "",
        scopes: [],
      });

      await provider.revokeToken({
        accessToken,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(tokenData.expiry_date),
        scope: [],
      });
    } catch (error) {
      console.error("Token revocation failed:", error);
      // Continue with deletion even if revocation fails
    }

    // Delete token from database
    // DELETE FROM google_fit_tokens WHERE user_id = ?

    logAuthEvent(userId, "disconnect", "google_fit", true, ipAddress);

    res.status(200).json({
      message: "Smartwatch disconnected successfully",
      status: "disconnected",
    });
  } catch (error) {
    logAuthEvent(
      req.user?.email || "unknown",
      "disconnect",
      "google_fit",
      false,
      ipAddress || ""
    );

    res.status(500).json({
      error: "Server Error",
      message: "Failed to disconnect smartwatch",
    });
  }
};

export default {
  fetchWearableVitals,
  getWearableStatus,
  initiateGoogleFitAuth,
  disconnectSmartwatch,
};
