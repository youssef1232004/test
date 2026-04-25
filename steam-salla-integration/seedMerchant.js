/**
 * One-time script to seed the Merchant record with the token
 * received from Salla's app.store.authorize webhook.
 *
 * Usage: node seedMerchant.js
 */
require("dotenv").config();
const connectDB = require("./config/db");
const Merchant = require("./models/Merchant");

const seedMerchant = async () => {
  await connectDB();

  // Data from your webhook.site capture
  const webhookData = {
    merchantId: 1325358010,
    appName: "تسليم ستيم الآلي",
    accessToken:
      "ory_at_-dUNAf_rso8hc8gQttizJuPC2r1r2HT9Jls76BCriOM.7Duyrwdf8pPYqrmJGd5YgbRqiY-bsgtDUz1TmhtoTgM",
    refreshToken:
      "ory_rt_ucUpdgmmHrb56duK8u3CuYy4vnqt4BfAwYWA_wCzbsY.etm39AuiPFVVDNCSlgd5knrRceU1vXVYLRs4dYmGN_M",
    expiresAt: new Date(1777728055 * 1000), // Unix timestamp → JS Date
  };

  const merchant = await Merchant.findOneAndUpdate(
    { merchantId: webhookData.merchantId },
    webhookData,
    { upsert: true, new: true }
  );

  console.log("✅ Merchant seeded successfully!");
  console.log(`   Merchant ID: ${merchant.merchantId}`);
  console.log(`   App Name:    ${merchant.appName}`);
  console.log(`   Token Expires: ${merchant.expiresAt.toISOString()}`);

  // Check if the token is still valid
  const now = new Date();
  if (merchant.expiresAt > now) {
    const daysLeft = Math.floor(
      (merchant.expiresAt - now) / (1000 * 60 * 60 * 24)
    );
    console.log(`   ✅ Token is VALID (${daysLeft} days remaining)`);
  } else {
    console.log(
      "   ⚠️  Token is EXPIRED. The server will auto-refresh it on first API call."
    );
  }

  process.exit(0);
};

seedMerchant().catch((err) => {
  console.error("💥 Seeding failed:", err);
  process.exit(1);
});
