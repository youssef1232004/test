const AppError = require('../utils/AppError');

// Handle specific MongoDB errors nicely
const handleCastErrorDB = err => new AppError(`بيانات غير صالحة: ${err.value}`, 400);
const handleDuplicateFieldsDB = err => new AppError(`هذه البيانات مسجلة مسبقاً، يرجى استخدام قيمة أخرى.`, 400);
const handleJWTError = () => new AppError('الجلسة غير صالحة. يرجى تسجيل الدخول مجدداً.', 401);
const handleJWTExpiredError = () => new AppError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.', 401);

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = { ...err, message: err.message, name: err.name, code: err.code };

    // Catch specific Mongoose/JWT errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // If it's an operational error (one we threw on purpose), send it to the client
    if (error.isOperational) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    } 
    
    // If it's an unknown programming error (server crash), don't leak details to the client
    console.error('💥 [CRITICAL ERROR DUMP]:', err);
    return res.status(500).json({
        success: false,
        message: 'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.'
    });
};

module.exports = globalErrorHandler;