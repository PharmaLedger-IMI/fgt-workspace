/**
 * @module commands
 * A simple variable store
 */


const VarStore = function(){
    const _memory = {};
    let _hasVars = false;
    const self = this;

    this.define = function(name, value){
        _memory[name] = value;
        _hasVars = true;
        console.log(`Variable ${name} defined as ${value}`)
    }

    const tryReplace = function(value){
        for (let name in _memory)
            if (value.includes(name)) {
                value = value.replace(name, _memory[name]);
                console.log(`Replaced variable ${name}`)
            }
        return value;
    }

    this.checkVariables = function(args){
        if (!_hasVars)
            return args;
        if (typeof args === 'string')
            return tryReplace(args);
        if (args instanceof Array)
            return args.map(a => self.checkVariables(a));
        if (typeof args !== 'object')
            return args;
        const result = {};
        Object.keys(args).forEach(k => {
            result[k] = self.checkVariables(args[k]);
        });
        return result;
    }
}

module.exports = VarStore;