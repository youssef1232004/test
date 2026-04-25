const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    merchantId: { type: Number, required: true, unique: true },
    appName: { type: String },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Merchant", merchantSchema);