class MAH {
    id = "";
    name = "";

    constructor(mah) {
        if (typeof mah !== undefined) {
            for (let prop in mah) {
                if (mah.hasOwnProperty(prop))
                    this[prop] = mah[prop];
            }
        }
    }

    validate() {
        const errors = [];
        if (!this.name) {
            errors.push('Name is required.');
        }

        if (!this.id) {
            errors.push('id is required');
        }

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {id: this.id, name: this.name}
    }
}

module.exports = MAH;