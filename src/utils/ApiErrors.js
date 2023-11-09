class ApiError extends Error {
    constructor(statusCode, message = "Something wents wrong", errors = [], statck = "") {
        super(message);
        this.statusCode = statusCode
        this.message = message
        this.errors = errors
        this.data = null
        this.success = false

        if (statck) {
            this.stack = statck
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export { ApiError }