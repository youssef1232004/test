const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    // 1. Account Details
    gameName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, index: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    sharedSecret: { type: String, required: true },

    // 2. Inventory Management
    maxSales: { type: Number, required: true, default: 1 },
    currentSales: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // 3. SETTINGS (Lean & Clean)
    settings: {
      maxSteamGuardRequests: { type: Number, default: 3 }, 
      warningViewCount: { type: Number, default: 5 }, 
      resetPeriodDays: { type: Number, default: 0 }, 
    },

    // 4. Customer History
    assignedOrders: [
      {
        orderId: String,
        referenceId: String,
        assignedAt: { type: Date, default: Date.now },
        // NEW: Tracks the start of the current quota cycle
        lastResetAt: { type: Date, default: Date.now }, 
        steamGuardRequests: { type: Number, default: 0 },
        accountViews: { type: Number, default: 1 },
        extraGuardAttempts: { type: Number, default: 0 },
        isRevoked: { type: Boolean, default: false },
        revocationReason: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Account", accountSchema);