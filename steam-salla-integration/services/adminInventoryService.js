const Account = require("../models/Account");
const { encryptData, decryptData } = require("../utils/encryption");
const SteamTotp = require("steam-totp");
const AppError = require("../utils/AppError");

const getAllAccounts = async () => {
    // 1. Fetch all accounts and use .lean() to get plain JavaScript objects
    const accounts = await Account.find()
        .sort({ createdAt: -1 }) // Sort newest first
        .lean();

    // 2. Loop through each account and decrypt the sensitive fields for the Admin
    const decryptedAccounts = accounts.map(account => {
        try {
            // Decrypt the username and password so the Admin can copy them
            if (account.username) account.username = decryptData(account.username);
            if (account.password) account.password = decryptData(account.password);
            
            // We intentionally leave 'sharedSecret' encrypted because the Admin 
            // doesn't need to read it visually, and it keeps the system safer.
        } catch (error) {
            console.error(`[Encryption Error] Failed to decrypt account ${account._id}:`, error);
            // Fallback in case an old account wasn't encrypted properly
            account.username = "خطأ في فك التشفير";
            account.password = "خطأ في فك التشفير";
        }
        return account;
    });

    return decryptedAccounts;
};

const addAccount = async (accountData) => {
  const {
    gameName,
    sku,
    username,
    password,
    sharedSecret,
    maxSales,
    settings,
  } = accountData;

  const newAccount = new Account({
    gameName,
    sku,
    maxSales,
    settings,
    username: encryptData(username),
    password: encryptData(password),
    sharedSecret: encryptData(sharedSecret),
  });

  await newAccount.save();
};

const toggleAccountStatus = async (id) => {
  const account = await Account.findById(id);
  if (!account) throw new AppError("الحساب غير موجود", 404);

  account.isActive = !account.isActive;
  await account.save();
  return account.isActive;
};

const deleteAccount = async (id) => {
  const account = await Account.findById(id);
  if (!account) throw new AppError("الحساب غير موجود", 404);

  if (account.currentSales > 0) {
    throw new AppError("لا يمكن حذف حساب يحتوي على طلبات نشطة.", 400);
  }
  await account.deleteOne();
};

const getAdminSteamCode = async (id) => {
  const account = await Account.findById(id);
  if (!account) throw new AppError("الحساب غير موجود", 404);

  const decryptedSecret = decryptData(account.sharedSecret);
  try {
    return SteamTotp.generateAuthCode(decryptedSecret);
  } catch (steamError) {
    console.error("[STEAM ERROR]", steamError);
    throw new AppError("رمز Shared Secret غير صالح. تعذر توليد الكود.", 400);
  }
};


const updateAccount = async (id, updateData) => {
  const account = await Account.findById(id);
  if (!account) throw new AppError("الحساب غير موجود", 404);

  // Update basic text fields
  if (updateData.gameName) account.gameName = updateData.gameName;
  if (updateData.sku) account.sku = updateData.sku;
  if (updateData.maxSales) account.maxSales = updateData.maxSales;

  // Update settings if provided
  if (updateData.settings) {
    account.settings = { ...account.settings, ...updateData.settings };
  }

  // Only encrypt and update sensitive fields if the admin actually typed new ones
  if (updateData.username) account.username = encryptData(updateData.username);
  if (updateData.password) account.password = encryptData(updateData.password);
  if (updateData.sharedSecret)
    account.sharedSecret = encryptData(updateData.sharedSecret);

  if (account.currentSales >= account.maxSales) {
    account.isActive = false;
  }

  await account.save();
  return account;
};

module.exports = {
  getAllAccounts,
  addAccount,
  toggleAccountStatus,
  deleteAccount,
  getAdminSteamCode,
  updateAccount,
};
