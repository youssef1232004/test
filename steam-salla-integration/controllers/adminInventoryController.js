const asyncWrapper = require("../middlewares/asyncWrapper");
const adminInventoryService = require("../services/adminInventoryService");

const getAllAccounts = asyncWrapper(async (req, res, next) => {
  const accounts = await adminInventoryService.getAllAccounts();
  res.json({ success: true, data: accounts });
});

const addAccount = asyncWrapper(async (req, res, next) => {
  await adminInventoryService.addAccount(req.body);
  res.status(201).json({ success: true, message: "تمت إضافة الحساب بنجاح" });
});

const toggleAccountStatus = asyncWrapper(async (req, res, next) => {
  const isActive = await adminInventoryService.toggleAccountStatus(
    req.params.id,
  );
  res.json({
    success: true,
    message: `حالة الحساب الآن: ${isActive ? "نشط" : "معطل"}`,
  });
});

const deleteAccount = asyncWrapper(async (req, res, next) => {
  await adminInventoryService.deleteAccount(req.params.id);
  res.json({ success: true, message: "تم حذف الحساب" });
});

const getAdminSteamCode = asyncWrapper(async (req, res, next) => {
  const code = await adminInventoryService.getAdminSteamCode(req.params.id);
  res.json({ success: true, code });
});

const updateAccount = asyncWrapper(async (req, res, next) => {
  await adminInventoryService.updateAccount(req.params.id, req.body);
  res.json({ success: true, message: "تم تحديث بيانات الحساب بنجاح" });
});

module.exports = {
  getAllAccounts,
  addAccount,
  toggleAccountStatus,
  deleteAccount,
  getAdminSteamCode,
  updateAccount,
};
