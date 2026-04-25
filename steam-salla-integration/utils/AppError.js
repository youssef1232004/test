class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // If status code is 4xx, it's a client 'fail'. If 5xx, it's a server 'error'.
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Marks this as a predicted error, not a random server crash

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;