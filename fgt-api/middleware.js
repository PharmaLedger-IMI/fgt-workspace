const {Unauthorized} = require("./utils/errorHandler");

const requireAuth = (req, res, next) => {
    const unauthorized = function (msg) {
        const err = new Unauthorized();
        res.statusCode = err.statusCode;
        res.write(JSON.stringify({
            status: err.statusCode,
            error: err.message,
            message: msg || err.customMsg
        }));
        res.send();
    }

    const {authorization} = req.headers;
    console.log("$$$ authorization=", authorization);
    if (!authorization)
        return unauthorized();

    const split = authorization.split('Basic ');
    if (split.length !== 2 || !split[1])
        return unauthorized("Can not read authorization");

    const buffer = new Buffer(split[1], 'base64');
    const token = buffer.toString('ascii');
    console.log("$$$ token=", token);
    if (token !== "foo:bar")
        return unauthorized();

    next();
};

module.exports = {
    requireAuth
}