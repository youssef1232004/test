const SteamTotp = require("steam-totp");
const Account = require("../models/Account");
const { decryptData } = require("../utils/encryption");
const AppError = require("../utils/AppError");

const generateSteamCodeForOrder = async (cleanRefId, accountId = null) => {
  const query = { "assignedOrders.referenceId": cleanRefId };
  if (accountId) query._id = accountId;

  const assignedAccount = await Account.findOne(query);

  if (!assignedAccount) {
    throw new AppError("لا يوجد حساب مرتبط بهذا الطلب.", 404);
  }

  const orderRecord = assignedAccount.assignedOrders.find(
    (o) => o.referenceId === cleanRefId,
  );

  if (orderRecord.isRevoked) {
    throw new AppError(
      "تم إلغاء صلاحية وصولك لهذا الحساب. يرجى التواصل مع الدعم الفني.",
      403,
    );
  }

  // ==========================================
  // LAZY EVALUATION: Check for Auto-Reset
  // ==========================================
  const now = new Date();
  const resetPeriodDays = assignedAccount.settings.resetPeriodDays || 0;
  
  let currentRequests = orderRecord.steamGuardRequests;
  let extraAttempts = orderRecord.extraGuardAttempts;
  // Fallback to assignedAt for old orders that don't have lastResetAt yet
  let lastReset = orderRecord.lastResetAt || orderRecord.assignedAt; 
  let needsReset = false;

  // If a reset period is set (greater than 0)
  if (resetPeriodDays > 0) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysSinceLastReset = Math.floor((now - lastReset) / msPerDay);

    // If enough days have passed, trigger the reset logic
    if (daysSinceLastReset >= resetPeriodDays) {
      needsReset = true;
      currentRequests = 0; 
      extraAttempts = 0; // Bonus attempts reset on a new cycle
      lastReset = now;
    }
  }
  // ==========================================

  const baseLimit = assignedAccount.settings.maxSteamGuardRequests;
  const totalAllowedLimit = baseLimit + extraAttempts;

  // Check if they hit the limit (using the potentially reset variables)
  if (currentRequests >= totalAllowedLimit) {
    console.log(
      `[WARNING] Order ${cleanRefId} hit the limit of ${totalAllowedLimit}.`,
    );
    throw new AppError(
      "لقد تجاوزت الحد الأقصى لطلبات كود التحقق. يرجى التواصل مع الدعم الفني لإعادة التعيين.",
      403,
    );
  }

  const decryptedSecret = decryptData(assignedAccount.sharedSecret);
  let steamCode;

  try {
    steamCode = SteamTotp.generateAuthCode(decryptedSecret);
  } catch (error) {
    throw new AppError(
      "حدث خطأ في النظام أثناء توليد الكود. يرجى التواصل مع الدعم.",
      500,
    );
  }

  // Update Database based on whether a reset happened or not
  let updateQuery = {};
  
  if (needsReset) {
    // If we did a reset, set requests to 1 (since they just generated one now)
    // Clear extra attempts, and update the lastResetAt timestamp to today
    updateQuery = {
      $set: {
        "assignedOrders.$.steamGuardRequests": 1,
        "assignedOrders.$.extraGuardAttempts": 0,
        "assignedOrders.$.lastResetAt": now,
      }
    };
  } else {
    // Standard behavior: just increment by 1
    updateQuery = {
      $inc: { "assignedOrders.$.steamGuardRequests": 1 }
    };
  }

  await Account.findOneAndUpdate(
    { _id: assignedAccount._id, "assignedOrders.referenceId": cleanRefId },
    updateQuery
  );

  return {
    steamCode,
    remainingAttempts: totalAllowedLimit - (currentRequests + 1),
  };
};

module.exports = { generateSteamCodeForOrder };