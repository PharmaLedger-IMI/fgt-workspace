const {Unauthorized} = require("./utils/errorHandler");
const {authenticate} = require("./utils/basicAuth");

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
    if (!authorization || authorization.indexOf('Basic ') === -1)
        return unauthorized('Missing Authorization');

    const [user, base64Pass] =  authorization.split(' ')[1].split(":");
    const password = Buffer.from(base64Pass, 'base64').toString('ascii');
    if (!authenticate(user, password))
        return unauthorized();

    next();
};

module.exports = {
    requireAuth
}