
/**
 * @prop {string} subject
 * @prop {{}} body
 * @class Notification
 * @memberOf Model
 */
class Notification {
    subject;
    body;

    /**
     * @param {Notification | {}} notification
     * @constructor
     */
    constructor(notification) {
        if (typeof notification !== undefined)
            for (let prop in notification)
                if (notification.hasOwnProperty(prop))
                    this[prop] = notification[prop];
    }

    validate() {
        if (!this.subject) {
            return 'subject is mandatory field';
        }
        if (!this.body) {
            return  'body is a mandatory field.';
        }
        return undefined;
    }
}

module.exports = Notification;
