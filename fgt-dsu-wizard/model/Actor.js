class Actor{
    id = "";
    name = "";
    nif = "";
    address = "";

    constructor(actor){
        console.log("actor:" + actor);
        this._copyProps(actor);
    }

    _copyProps(actor){
        if (typeof actor !== undefined)
            for (let prop in actor)
                if (actor.hasOwnProperty(prop))
                    this[prop] = actor[prop];
    }

    validate() {
        const errors = [];
        if (!this.name)
            errors.push('Name is required.');
        if (!this.id)
            errors.push('id is required');
        if (!this.nif)
            errors.push('nif is required');

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.id}
    }
}

module.exports = Actor;