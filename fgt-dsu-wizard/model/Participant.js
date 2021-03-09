/**
 * @module fgt-dsu-wizard.model
 */
class Participant{
    id = "";
    name = "";
    tin = "";
    address = "";

    constructor(participant){
        console.log("actor:" + participant);
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
        if (!this.name)
            errors.push('Name is required.');
        if (!this.id)
            errors.push('id is required');
        if (!this.tin)
            errors.push('nif is required');

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.id}
    }
}

module.exports = Participant;