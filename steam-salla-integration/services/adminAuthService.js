const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const AppError = require('../utils/AppError');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const loginAdmin = async (username, password) => {
    const admin = await Admin.findOne({ username });
    
    if (!admin || !(await admin.matchPassword(password))) {
        throw new AppError('كلمة المرور أو اسم المستخدم غير صحيح', 401);
    }
    
    return {
        token: generateToken(admin._id),
        username: admin.username,
        role: admin.role
    };
};

module.exports = { loginAdmin };