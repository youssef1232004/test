const asyncWrapper = require("../middlewares/asyncWrapper");
const steamService = require("../services/steamService");

const generateSteamGuardCode = asyncWrapper(async (req, res, next) => {
    const customerReferenceId = req.params.orderId;
    const accountId = req.query.accountId; // NEW: Get specific account ID if provided
    const cleanRefId = customerReferenceId.replace("#", "").trim();

    const { steamCode, remainingAttempts } = await steamService.generateSteamCodeForOrder(cleanRefId, accountId);

    return res.status(200).json({
        success: true,
        message: `تم توليد الرمز. (المحاولات المتبقية: ${remainingAttempts})`,
        data: { steamGuardCode: steamCode },
    });
});

module.exports = { generateSteamGuardCode };