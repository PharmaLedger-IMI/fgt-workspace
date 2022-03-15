const HTTP_STATUS_CODE = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500,
    NOT_IMPLEMENTED: 501
}

class BaseError extends Error {
    constructor (err, statusCode, description) {
        super(description);
        this.name = err;
        this.statusCode = statusCode;
        this.customMsg = err instanceof Error ? err.message : err;
        Error.captureStackTrace(this);
    }
}

class BadRequest extends BaseError {
    constructor (
        err = "The server could not understand your request",
        statusCode = HTTP_STATUS_CODE.BAD_REQUEST,
        description = 'Bad Request'
    ) {
        super(err, statusCode, description);
    }
}

class Unauthorized extends BaseError {
    constructor (
        err = "You do not have permission to view the resource that you looking for",
        statusCode = HTTP_STATUS_CODE.UNAUTHORIZED,
        description = 'Unauthorized'
    ) {
        super(err, statusCode, description);
    }
}

class NotFound extends BaseError {
    constructor (
        err = "The resource that you looking for does not exist",
        statusCode = HTTP_STATUS_CODE.NOT_FOUND,
        description = 'Not found'
    ) {
        super(err, statusCode, description);
    }
}

class InternalServerError extends BaseError {
    constructor (
        err = "The server encountered an internal error and was unable to complete your request",
        statusCode = HTTP_STATUS_CODE.INTERNAL_SERVER,
        description = 'Internal Server Error'
    ) {
        super(err, statusCode, description);
    }
}

class NotImplemented extends BaseError {
    constructor (
        err = "The resource that you are attempting could not be understand by the server",
        statusCode = HTTP_STATUS_CODE.NOT_IMPLEMENTED,
        description = 'Not implemented'
    ) {
        super(err, statusCode, description);
    }
}

module.exports = {
    Unauthorized,
    BadRequest,
    NotFound,
    InternalServerError,
    NotImplemented
}