
function genDate(offsetFromToday){
    let date = new Date();
    date.setDate(date.getDate() + offsetFromToday);
    return date;
}

function generateGtin(){
    function pad(n, width, padding) {
        padding = padding || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
    }

    return pad(Math.floor(Math.random() * 999999999999), 12);
}

function generateProductName() {
    const syllables = ["aba", "xo", "ra", "asp", "pe", "cla", "ri", "bru", "be", "nu", "as", "cos", "sen"];
    const suffixes = ['gix', 'don', 'gix', 'fen', 'ron', 'tix'];
    const name = [];

    let syllableCount = Math.floor(Math.random() * 4) + 2;
    while (syllableCount >= 0){
        name.push(syllables[Math.floor(Math.random() * syllables.length)]);
        syllableCount --;
    }
    name.push(suffixes[Math.floor(Math.random() * suffixes.length)]);
    return name.join('');
}

function generateBatchNumber(){
    const chars = 'ABCDEFGHIJKLMNOPQRSUVWXYZ';
    const numbers = '1234567890';
    const options = [chars, numbers];
    const length = 6;
    const batchNumber = []
    for (let i = 0 ; i < length; i++){
        const slot = Math.floor(Math.random() * 2);
        batchNumber.push(options[slot].charAt(Math.floor(Math.random() * options[slot].length)));
    }
    return batchNumber.join('');
}

function impersonateDSUStorage(dsu){
    dsu.directAccessEnabled = false;
    dsu.enableDirectAccess = (callback) => callback();

    const setObject = function(path, data, callback) {
        try {
            dsu.writeFile(path, JSON.stringify(data), callback);
        } catch (e) {
            callback(createOpenDSUErrorWrapper("setObject failed", e));
        }
    }

    const getObject = function(path, callback) {
        dsu.readFile(path, (err, data) => {
           if (err)
               return callback(createOpenDSUErrorWrapper("getObject failed" ,err));

           try{
               data = JSON.parse(data);
           } catch (e){
               return callback(createOpenDSUErrorWrapper(`Could not parse JSON ${data.toString()}`, e));
           }
           callback(undefined, data);
        });
    }

    dsu.getObject = getObject;
    dsu.setObject = setObject;
    return dsu;
 }

module.exports = {
    generateProductName,
    generateGtin,
    generateBatchNumber,
    genDate,
    impersonateDSUStorage
}