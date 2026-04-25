const asyncWrapper = require('../middlewares/asyncWrapper');
const adminAuthService = require('../services/adminAuthService');

const loginAdmin = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body;
    const loginData = await adminAuthService.loginAdmin(username, password);
    res.json({ success: true, ...loginData });
});

module.exports = { loginAdmin };