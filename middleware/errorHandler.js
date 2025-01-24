const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`); // Log the error message for debugging

    // Set default error status and message
    const statusCode = err.statusCode || 500; // Default to 500 (Internal Server Error)
    const message = err.message || 'An unexpected error occurred';

    // Send a JSON response with the error details
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only show the stack trace in development
        },
    });
};

module.exports = errorHandler;
