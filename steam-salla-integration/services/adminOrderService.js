const Account = require('../models/Account');
const AppError = require('../utils/AppError');

const getAllOrders = async () => {
    const accounts = await Account.find({}, 'gameName sku settings assignedOrders');
    let allOrders = [];
    
    accounts.forEach(acc => {
        acc.assignedOrders.forEach(order => {
            allOrders.push({
                ...order.toObject(),
                gameName: acc.gameName,
                sku: acc.sku,
                accountId: acc._id,
                settings: acc.settings
            });
        });
    });

    return allOrders.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
};

const topUpSteamGuard = async (referenceId, sku) => {
    const cleanId = referenceId.replace("#", "").trim();
    const account = await Account.findOneAndUpdate(
        { "assignedOrders.referenceId": cleanId, sku: sku },
        { $inc: { "assignedOrders.$.extraGuardAttempts": 1 } }
    );
    if (!account) throw new AppError('الطلب غير موجود لهذا المنتج', 404);
};

const toggleRevokeStatus = async (referenceId, sku, reason = "") => {
    const cleanId = referenceId.replace("#", "").trim();
    const account = await Account.findOne({ "assignedOrders.referenceId": cleanId, sku: sku });
    if (!account) throw new AppError('الطلب غير موجود لهذا المنتج', 404);

    const orderIndex = account.assignedOrders.findIndex(o => o.referenceId === cleanId);
    if (orderIndex === -1) throw new AppError('بيانات الطلب غير متطابقة', 400);
    
    const currentStatus = account.assignedOrders[orderIndex].isRevoked;
    
    account.assignedOrders[orderIndex].isRevoked = !currentStatus;
    // Set or clear reason
    if (!currentStatus) {
        account.assignedOrders[orderIndex].revocationReason = reason;
    } else {
        account.assignedOrders[orderIndex].revocationReason = "";
    }
    
    await account.save();
    
    return !currentStatus; 
};

module.exports = { getAllOrders, topUpSteamGuard, toggleRevokeStatus };