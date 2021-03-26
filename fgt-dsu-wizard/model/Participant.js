/**
 * @module fgt-dsu-wizard.model
 */
const { Validatable } = require('../../pdm-dsu-toolkit/model/Validations');

class Participant extends Validatable{
    id = "";
    name = "";
    email = "";
    tin = "";
    address = "";

    constructor(participant){
        super();
        console.log("participant:" + participant);
        this._copyProps(participant);
    }

    _copyProps(participant){
        if (typeof participant !== undefined)
            for (let prop in participant)
                if (participant.hasOwnProperty(prop))
                    this[prop] = participant[prop];
    }

    validate() {
        const errors = [];
        if (!this.id)
            errors.push('id is required');
        if (!this.name)
            errors.push('Name is required.');
        if (!this.email)
            errors.push('email is required');
        if (!this.tin)
            errors.push('nif is required');

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.id}
    }
}

module.exports = Participant;