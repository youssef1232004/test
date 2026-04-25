const rateLimit = require('express-rate-limit');

// 1. General API Throttling (Protects against brute-forcing Salla Order IDs)
const orderVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 20, // Increased for testing (was 10)
    message: {
        success: false,
        message: "تم تجاوز الحد الأقصى لمحاولات التحقق من هذا الجهاز. يرجى المحاولة بعد 15 دقيقة."
    }
});

// 2. Strict Throttling for Steam Guard Codes
const steamGuardLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes window
    max: 30, // INCREASED TO 30 FOR TESTING (was 5)
    message: {
        success: false,
        message: "تم تجاوز الحد الأقصى للطلبات من شبكتك لحماية الحساب. يرجى المحاولة لاحقاً."
    }
});

module.exports = { orderVerificationLimiter, steamGuardLimiter };