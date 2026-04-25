const { check, validationResult } = require("express-validator");

// ==========================================
// 1. The Error Catcher Middleware
// ==========================================
// This function runs after the checks. If any check failed, it blocks the request.
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "بيانات غير صالحة" /* "Invalid data" */,
      errors: errors.array(),
    });
  }
  next();
};

// ==========================================
// 2. The Validation Rules
// ==========================================

// Rules for Admin Login
const validateAdminLogin = [
  check("username", "اسم المستخدم مطلوب").notEmpty().trim(),
  check("password", "كلمة المرور مطلوبة").notEmpty(),
];

// Rules for Adding a New Account
const validateAddAccount = [
    check('gameName', 'اسم اللعبة مطلوب').notEmpty().trim(),
    check('sku', 'رمز المنتج (SKU) مطلوب').notEmpty().trim(),
    check('username', 'اسم مستخدم الحساب مطلوب').notEmpty().trim(),
    check('password', 'كلمة مرور الحساب مطلوبة').notEmpty(),
    
    check('sharedSecret', 'رمز Shared Secret غير صالح. ')
        .notEmpty()
        .isBase64(), 
        
    check('maxSales', 'الحد الأقصى للمبيعات يجب أن يكون رقماً أكبر من صفر').isInt({ min: 1 })
];

// Rules for Creating an Employee
const validateCreateEmployee = [
  check("username", "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
    .notEmpty()
    .isLength({ min: 3 })
    .trim(),
  check("password", "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .notEmpty()
    .isLength({ min: 6 }),
];

// Rules for Updating Profile
const validateUpdateProfile = [
  check("password", "إذا أردت تغيير كلمة المرور، يجب أن تكون 6 أحرف على الأقل")
    .optional()
    .isLength({ min: 6 }),
];

module.exports = {
  validateRequest,
  validateAdminLogin,
  validateAddAccount,
  validateCreateEmployee,
  validateUpdateProfile,
};
