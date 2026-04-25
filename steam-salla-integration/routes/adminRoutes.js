const express = require("express");
const router = express.Router();

// Middlewares
const { protectAdmin, protectSuperAdmin } = require("../middlewares/adminAuth");
// NEW: Import Validators
const {
  validateRequest,
  validateAdminLogin,
  validateAddAccount,
  validateCreateEmployee,
  validateUpdateProfile,
} = require("../middlewares/validators");

// Controllers
const { loginAdmin } = require("../controllers/adminAuthController");
const {
  getAllAccounts,
  addAccount,
  toggleAccountStatus,
  deleteAccount,
  getAdminSteamCode,
  updateAccount
} = require("../controllers/adminInventoryController");
const {
  getAllOrders,
  topUpSteamGuard,
  toggleRevokeStatus,
} = require("../controllers/adminOrderController");
const {
  getAdmins,
  createAdmin,
  deleteAdmin,
  updateProfile,
} = require("../controllers/adminUsersController");

// Authentication (Protected by Validator)
router.post("/login", validateAdminLogin, validateRequest, loginAdmin);

// Inventory Management
router.get("/accounts", protectAdmin, getAllAccounts);
// NEW: Protected by Validator
router.post(
  "/accounts",
  protectAdmin,
  validateAddAccount,
  validateRequest,
  addAccount,
);
router.put("/accounts/:id/toggle", protectAdmin, toggleAccountStatus);
router.delete("/accounts/:id", protectAdmin, deleteAccount);
router.get("/accounts/:id/steam-guard", protectAdmin, getAdminSteamCode);
router.put('/accounts/:id', protectAdmin, updateAccount);

// Order Management
router.get("/orders", protectAdmin, getAllOrders);
router.put("/orders/:referenceId/top-up", protectAdmin, topUpSteamGuard);
router.put("/orders/:referenceId/revoke", protectAdmin, toggleRevokeStatus);

// Profile Management
// NEW: Protected by Validator
router.put(
  "/profile",
  protectAdmin,
  validateUpdateProfile,
  validateRequest,
  updateProfile,
);

// Employee Management
router.get("/users", protectAdmin, protectSuperAdmin, getAdmins);
// NEW: Protected by Validator
router.post(
  "/users",
  protectAdmin,
  protectSuperAdmin,
  validateCreateEmployee,
  validateRequest,
  createAdmin,
);
router.delete("/users/:id", protectAdmin, protectSuperAdmin, deleteAdmin);

module.exports = router;
