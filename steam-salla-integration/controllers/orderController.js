const Account = require("../models/Account");
const { decryptData } = require("../utils/encryption");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/AppError");
const { getSallaOrderDetails } = require("../services/sallaService");

// Notice how we wrap the whole function in asyncWrapper!
const verifySallaOrder = asyncWrapper(async (req, res, next) => {
  const customerReferenceId = req.params.orderId;
  const cleanRefId = customerReferenceId.replace("#", "").trim();

  // 1. USE THE SERVICE (Returns all items in the order)
  const { orderId, items } = await getSallaOrderDetails(cleanRefId);

  // 2. Fetch all accounts already assigned to this reference ID to avoid redundant lookups
  const alreadyAssignedAccounts = await Account.find({
    "assignedOrders.referenceId": cleanRefId,
  });

  const finalAccounts = [];

  // 3. Process each item from the order
  for (const item of items) {
    // Check if an account for this SKU is already assigned to this order reference
    let assignedAccount = alreadyAssignedAccounts.find((acc) => acc.sku === item.sku);

    if (assignedAccount) {
      const orderRecord = assignedAccount.assignedOrders.find(
        (o) => o.referenceId === cleanRefId
      );

      // If revoked, we still include it in the list so the user knows it's blocked, 
      // but we DON'T send the sensitive credentials.
      if (orderRecord.isRevoked) {
        finalAccounts.push({
          accountId: assignedAccount._id,
          gameName: assignedAccount.gameName,
          isRevoked: true,
          revocationReason: orderRecord.revocationReason || "",
          views: orderRecord.accountViews,
          warningLimit: assignedAccount.settings.warningViewCount,
        });
        continue;
      }

      // Increment views ONLY if it's a single-item order. 
      // For multi-item orders, we wait until they choose a game (handled by a separate endpoint).
      if (items.length === 1) {
        await Account.findOneAndUpdate(
          { _id: assignedAccount._id, "assignedOrders.referenceId": cleanRefId },
          { $inc: { "assignedOrders.$.accountViews": 1 } }
        );
      }

      finalAccounts.push({
        accountId: assignedAccount._id,
        gameName: assignedAccount.gameName,
        username: decryptData(assignedAccount.username),
        password: decryptData(assignedAccount.password),
        views: items.length === 1 ? orderRecord.accountViews + 1 : orderRecord.accountViews,
        warningLimit: assignedAccount.settings.warningViewCount,
      });
    } else {
      // ATOMIC ASSIGNMENT - Assign a new account for this SKU
      assignedAccount = await Account.findOneAndUpdate(
        {
          sku: item.sku,
          isActive: true,
          $expr: { $lt: ["$currentSales", "$maxSales"] },
        },
        {
          $push: { 
            assignedOrders: { 
              orderId: orderId, 
              referenceId: cleanRefId,
              accountViews: items.length === 1 ? 1 : 0 // Start at 0 for multi-game until selected
            } 
          },
          $inc: { currentSales: 1 },
        },
        { returnDocument: "after" }
      );

      if (assignedAccount) {
        // Auto-disable if max sales reached
        if (assignedAccount.currentSales >= assignedAccount.maxSales) {
          assignedAccount.isActive = false;
          await assignedAccount.save();
        }

        finalAccounts.push({
          accountId: assignedAccount._id,
          gameName: assignedAccount.gameName,
          username: decryptData(assignedAccount.username),
          password: decryptData(assignedAccount.password),
          views: items.length === 1 ? 1 : 0,
          warningLimit: assignedAccount.settings.warningViewCount,
        });
      }
    }
  }

  // 4. Handle results
  if (finalAccounts.length === 0) {
    return next(
      new AppError(
        "عذراً، لم يتم العثور على حسابات متوفرة لمنتجاتك حالياً. يرجى التواصل مع الدعم.",
        404
      )
    );
  }

  return res.status(200).json({
    success: true,
    message: finalAccounts.length === items.length 
      ? "تم تسليم جميع الحسابات بنجاح!" 
      : "تم تسليم الحسابات المتوفرة فقط.",
    data: finalAccounts, // Now returns an array!
  });
}); 

const recordAccountView = asyncWrapper(async (req, res, next) => {
  const { orderId, accountId } = req.params;
  const cleanRefId = orderId.replace("#", "").trim();

  await Account.findOneAndUpdate(
    { _id: accountId, "assignedOrders.referenceId": cleanRefId },
    { $inc: { "assignedOrders.$.accountViews": 1 } }
  );

  return res.status(200).json({ success: true });
});

module.exports = { verifySallaOrder, recordAccountView };
