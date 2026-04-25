const asyncWrapper = require("../middlewares/asyncWrapper");
const adminOrderService = require("../services/adminOrderService");

const getAllOrders = asyncWrapper(async (req, res, next) => {
  const allOrders = await adminOrderService.getAllOrders();
  res.json({ success: true, data: allOrders });
});

const topUpSteamGuard = asyncWrapper(async (req, res, next) => {
  const { sku } = req.body;
  await adminOrderService.topUpSteamGuard(req.params.referenceId, sku);
  res.json({
    success: true,
    message: "تمت إضافة محاولة تحقق (Steam Guard) إضافية للطلب.",
  });
});

const toggleRevokeStatus = asyncWrapper(async (req, res, next) => {
  const reason = req.body?.reason || "";
  const sku = req.body?.sku;
  const cleanRefId = req.params.referenceId.replace("#", "").trim();
  
  const isRevoked = await adminOrderService.toggleRevokeStatus(
    cleanRefId,
    sku,
    reason
  );
  res.json({
    success: true,
    message: `حالة وصول الطلب: ${isRevoked ? "تم الإلغاء (Revoked)" : "تمت الاستعادة"}`,
  });
});

module.exports = { getAllOrders, topUpSteamGuard, toggleRevokeStatus };
