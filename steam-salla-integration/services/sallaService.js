const axios = require("axios");
const https = require("https");
const Merchant = require("../models/Merchant");
const AppError = require("../utils/AppError");

// Configure Axios to use IPv4 to prevent ETIMEDOUT issues on Node 18+
axios.defaults.httpsAgent = new https.Agent({ family: 4 });

// ==========================================
// 1. SALLA OAUTH TOKEN MANAGEMENT
// ==========================================

/**
 * Refreshes the access token using the stored refresh token.
 * Implements Salla's OAuth 2.0 Refresh Token Rotation — saves
 * the new refresh_token that comes back with every refresh.
 */
const refreshAccessToken = async (merchant) => {
  try {
    const response = await axios.post(
      "https://accounts.salla.sa/oauth2/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.SALLA_CLIENT_ID,
        client_secret: process.env.SALLA_CLIENT_SECRET,
        refresh_token: merchant.refreshToken,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Calculate the exact expiration timestamp
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Update the merchant record with the new tokens (Refresh Token Rotation)
    merchant.accessToken = access_token;
    merchant.refreshToken = refresh_token;
    merchant.expiresAt = expiresAt;
    await merchant.save();

    console.log(
      `🔑 [SALLA] Token refreshed for merchant ${merchant.merchantId}. Expires at: ${expiresAt.toISOString()}`
    );

    return access_token;
  } catch (error) {
    console.error(
      "💥 [SALLA] Token refresh failed:",
      error.response?.data || error.message
    );
    throw new AppError(
      "فشل في تجديد رمز الوصول إلى المتجر. يرجى إعادة ربط التطبيق.",
      503
    );
  }
};

/**
 * Gets a valid (non-expired) access token.
 * If the current token is expired (or within a 5-minute safety buffer),
 * it automatically refreshes it before returning.
 */
const getValidAccessToken = async () => {
  const merchant = await Merchant.findOne();

  if (!merchant) {
    throw new AppError(
      "لم يتم ربط المتجر بعد. يرجى إعداد تطبيق سلة أولاً.",
      503
    );
  }

  // Safety buffer: refresh 5 minutes BEFORE actual expiry
  const SAFETY_BUFFER_MS = 5 * 60 * 1000;
  const now = new Date();
  const isExpired = merchant.expiresAt.getTime() - SAFETY_BUFFER_MS <= now.getTime();

  if (isExpired) {
    console.log("⏰ [SALLA] Token expired or expiring soon. Refreshing...");
    return await refreshAccessToken(merchant);
  }

  return merchant.accessToken;
};

// ==========================================
// 2. SALLA ORDER API CALLS
// ==========================================

/**
 * Fetches order details and items from the Salla Merchant API.
 * This is the main function consumed by the orderController.
 *
 * Flow:
 *  1. Search orders by reference ID (keyword)
 *  2. Validate the order status is "completed"
 *  3. Fetch order items and extract the SKU
 *
 * @param {string} cleanRefId - The cleaned order reference ID
 * @returns {{ orderId: string, sku: string }}
 */
const getSallaOrderDetails = async (cleanRefId) => {
  // 🔥 GET THE SECURE, AUTO-REFRESHED TOKEN FIRST
  const token = await getValidAccessToken();

  // 1. Fetch Order from Salla
  const searchResponse = await axios.get(
    "https://api.salla.dev/admin/v2/orders",
    {
      params: { keyword: cleanRefId },
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const searchData = searchResponse.data.data;
  if (!searchData || searchData.length === 0) {
    throw new AppError("رقم الطلب غير صحيح. يرجى التحقق من الفاتورة.", 404);
  }

  const order = searchData[0];
  const validStatuses = ["completed"];

  if (!validStatuses.includes(order.status.slug)) {
    throw new AppError(
      `حالة الطلب هي '${order.status.name}'. يرجى الانتظار حتى تأكيد الدفع.`,
      400
    );
  }

  // 2. Fetch Order Items
  const itemsResponse = await axios.get(
    `https://api.salla.dev/admin/v2/orders/items?order_id=${order.id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const itemsData = itemsResponse.data.data;
  if (!itemsData || itemsData.length === 0) {
    throw new AppError("هذا الطلب لا يحتوي على أي منتجات.", 400);
  }

  // Filter and map all products that have a SKU
  const items = itemsData
    .filter((item) => item.sku)
    .map((item) => ({
      sku: item.sku,
      name: item.name,
    }));

  if (items.length === 0) {
    throw new AppError(
      "خطأ في المتجر: لا توجد منتجات مرتبطة برمز SKU في هذا الطلب.",
      400
    );
  }

  // Return the extracted, clean data back to the controller
  return {
    orderId: order.id,
    items,
  };
};

module.exports = { getSallaOrderDetails, getValidAccessToken };
