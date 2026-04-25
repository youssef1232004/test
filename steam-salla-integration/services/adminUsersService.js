const Admin = require("../models/Admin");
const AppError = require('../utils/AppError');

const getAdmins = async () => {
    return await Admin.find({}).select("-password");
};

const createAdmin = async (username, password) => {
    const adminExists = await Admin.findOne({ username });
    if (adminExists) throw new AppError('اسم المستخدم موجود مسبقاً', 400);

    await Admin.create({ username, password, role: "admin" });
};

const deleteAdmin = async (idToDelete, requestingAdminId) => {
    if (idToDelete === requestingAdminId.toString()) {
        throw new AppError('لا يمكنك حذف حسابك الخاص.', 400);
    }

    const adminToDelete = await Admin.findById(idToDelete);
    if (!adminToDelete) throw new AppError('المستخدم غير موجود', 404);

    if (adminToDelete.role === "superadmin") {
        throw new AppError('لا يمكن حذف حساب المشرف العام (Super Admin).', 403);
    }

    await adminToDelete.deleteOne();
};

const updateProfile = async (adminId, username, password) => {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new AppError('المشرف غير موجود', 404);

    admin.username = username || admin.username;
    if (password) admin.password = password;

    await admin.save();
};

module.exports = { getAdmins, createAdmin, deleteAdmin, updateProfile };