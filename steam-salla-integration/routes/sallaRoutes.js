const express = require("express");
const crypto = require("crypto");
const Merchant = require("../models/Merchant");

const router = express.Router();

// ==========================================
// WEBHOOK SIGNATURE VERIFICATION MIDDLEWARE
// ==========================================

/**
 * Verifies that the incoming webhook request is genuinely from Salla
 * by comparing HMAC-SHA256 signatures using the webhook secret.
 */
const verifySallaWebhook = (req, res, next) => {
  const sallaSignature = req.headers["x-salla-signature"];

  if (!sallaSignature) {
    console.warn("⚠️ [SALLA WEBHOOK] Missing signature header. Rejected.");
    return res.status(401).json({ error: "Missing signature" });
  }

  const computedSignature = crypto
    .createHmac("sha256", process.env.SALLA_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (computedSignature !== sallaSignature) {
    console.warn("⚠️ [SALLA WEBHOOK] Invalid signature. Rejected.");
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
};

// ==========================================
// WEBHOOK HANDLER: /api/salla/webhook
// ==========================================

/**
 * The single entry point for ALL Salla webhook events.
 * Salla sends different events to the same URL. We route
 * them internally based on the `event` field in the body.
 *
 * KEY EVENT: `app.store.authorize`
 * In Easy Mode, Salla sends the OAuth tokens directly
 * via this webhook when a merchant installs the app.
 */
router.post("/webhook", verifySallaWebhook, async (req, res) => {
  const { event, merchant: merchantId, data } = req.body;

  console.log(`📩 [SALLA WEBHOOK] Event received: ${event}`);

  try {
    switch (event) {
      // ==========================================
      // APP INSTALLED / TOKEN RECEIVED (Easy Mode)
      // ==========================================
      case "app.store.authorize": {
        const {
          access_token,
          refresh_token,
          expires,
          app_name,
        } = data;

        // Calculate expiration date
        const expiresAt = new Date(expires * 1000);

        // Upsert: Create or update the merchant record
        await Merchant.findOneAndUpdate(
          { merchantId },
          {
            merchantId,
            appName: app_name,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt,
          },
          { upsert: true, new: true }
        );

        console.log(
          `✅ [SALLA] Merchant ${merchantId} authorized successfully. Token expires: ${expiresAt.toISOString()}`
        );
        break;
      }

      // ==========================================
      // APP UNINSTALLED
      // ==========================================
      case "app.uninstalled": {
        await Merchant.findOneAndDelete({ merchantId });
        console.log(
          `🗑️ [SALLA] Merchant ${merchantId} uninstalled. Tokens removed.`
        );
        break;
      }

      // ==========================================
      // TOKEN REFRESHED (Salla may push refreshed tokens)
      // ==========================================
      case "app.token.refreshed": {
        const {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires: newExpires,
        } = data;

        const newExpiresAt = new Date(newExpires * 1000);

        await Merchant.findOneAndUpdate(
          { merchantId },
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresAt: newExpiresAt,
          }
        );

        console.log(
          `🔄 [SALLA] Token refreshed for merchant ${merchantId}. New expiry: ${newExpiresAt.toISOString()}`
        );
        break;
      }

      // ==========================================
      // DEFAULT: Log unhandled events (no-op)
      // ==========================================
      default:
        console.log(
          `ℹ️ [SALLA WEBHOOK] Unhandled event: ${event}. Ignoring.`
        );
        break;
    }

    // Always respond 200 to acknowledge the webhook
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`💥 [SALLA WEBHOOK] Error processing event ${event}:`, error);
    // Still return 200 to prevent Salla from retrying
    return res.status(200).json({ success: true });
  }
});

module.exports = router;
