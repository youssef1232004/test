const asyncWrapper = require("../middlewares/asyncWrapper");
const adminUsersService = require("../services/adminUsersService");

const getAdmins = asyncWrapper(async (req, res, next) => {
  const admins = await adminUsersService.getAdmins();
  res.json({ success: true, data: admins });
});

const createAdmin = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;
  await adminUsersService.createAdmin(username, password);
  res
    .status(201)
    .json({ success: true, message: "تم إنشاء حساب الموظف بنجاح" });
});

const deleteAdmin = asyncWrapper(async (req, res, next) => {
  await adminUsersService.deleteAdmin(req.params.id, req.admin._id);
  res.json({ success: true, message: "تم حذف حساب الموظف" });
});

const updateProfile = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;
  await adminUsersService.updateProfile(req.admin._id, username, password);
  res.json({ success: true, message: "تم تحديث الملف الشخصي بنجاح" });
});

module.exports = { getAdmins, createAdmin, deleteAdmin, updateProfile };
