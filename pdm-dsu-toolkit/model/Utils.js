/**
 * @namespace Utils
 * @memberOf Model
 */

/**
 * Deep Object Comparison
 * https://stackoverflow.com/questions/30476150/javascript-deep-comparison-recursively-objects-and-properties
 *
 * with optional ignored properties
 * @param {{}} a
 * @param {{}} b
 * @param {string} [propsToIgnore]
 * @return {boolean}
 */
const isEqual = (a, b,...propsToIgnore) => {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (a.prototype !== b.prototype) return false;
    let keys = Object.keys(a).filter(k => propsToIgnore.indexOf(k) === -1);
    if (keys.length !== Object.keys(b).filter(k => propsToIgnore.indexOf(k) === -1).length) return false;
    return keys.every(k => propsToIgnore.indexOf(k) !== -1 || isEqual(a[k], b[k], ...propsToIgnore));
};

/**
 * @memberOf Utils
 */
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

    const beforeChecksum = pad(Math.floor(Math.random() * 9999999999999), 13); // has to be 13. the checksum is the 4th digit
    const checksum = calculateGtinCheckSum(beforeChecksum);
    return `${beforeChecksum}${checksum}`;
}

function validateGtin(gtin){
    gtin = gtin + '';
    if (!gtin.match(/\d{14}/g))
        return false
    const digits = gtin.splice(0, 13);
    const checksum = calculateGtinCheckSum(digits);
    return parseInt(checksum) === parseInt(gtin.charAt(13));
}

// https://www.gs1.org/services/how-calculate-check-digit-manually
function calculateGtinCheckSum(digits){
    digits = '' + digits;
    if (digits.length !== 13)
        throw new Error(`needs to received 13 digits`);
    const multiplier = [3,1,3,1,3,1,3,1,3,1,3,1,3];
    let sum = 0;
    try {
        // multiply each digit for its multiplier according to the table
        for (let i = 0; i < 13; i++)
            sum += parseInt(digits.charAt(i)) * multiplier[i];

        // Find the nearest equal or higher multiple of ten
        const remainder = sum % 10;
        let nearest;
        if (remainder  === 0)
            nearest = sum;
        else
            nearest = sum - remainder + 10;

        return nearest - sum;
    } catch (e){
        throw new Error(`Did this received numbers? ${e}`);
    }
}
/**
 * @memberOf Utils
 */
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
/**
 * @memberOf Utils
 */
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
/**
 * @memberOf Utils
 */
function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

/**
 * Generates a string of the provided length filled with random characters from the provided characterSet
 * Clone of PrivateSky Code
 * @memberOf Utils
 */
function generate(charactersSet, length){
    let result = '';
    const charactersLength = charactersSet.length;
    for (let i = 0; i < length; i++) {
        result += charactersSet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


/**
 * Util function to provide string format functionality similar to C#'s string.format
 *
 * @param {string} string
 * @param {string} args replacements made by order of appearance (replacement0 wil replace {0} and so on)
 * @return {string} formatted string
 * @memberOf Utils
 */
function stringFormat(string, ...args){
    return string.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
}

/**
 * Select n elements from array at random (non destructive)
 * (https://stackoverflow.com/a/19270021)
 * @param arr
 * @param n
 * @return {any[]}
 * @memberOf Utils
 */
function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

/**
 * Generates the 2D Data Matrix code for a batch or a serial
 * @param gtin
 * @param {string} batchNumber
 * @param {string} expiry (must be parseable to date)
 * @param [serialNumber]
 * @return {string}
 */
function generate2DMatrixCode(gtin, batchNumber, expiry, serialNumber){
    const formattedExpiry = new Date(expiry).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
    }).split('/').reverse().join('');

    if (!serialNumber)
        return `(01)${gtin}(10)${batchNumber}(17)${formattedExpiry}`;
    return `(01)${gtin}(21)${serialNumber}(10)${batchNumber}(17)${formattedExpiry}`;
}

module.exports = {
    /**
     * Generates a string of the provided length filled with random characters from 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
     * Clone of PrivateSky Code
     * @memberOf Utils
     */
    generateID(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return generate(characters, length);
    },

    /**
     * Generates a string of the provided length filled with random numeric characters
     * Clone of PrivateSky Code
     * @memberOf Utils
     */
    generateNumericID(length) {
        const characters = '0123456789';
        return generate(characters, length);
    },

    /**
     * Clone of PrivateSky Code
     * @memberOf Utils
     */
    generateSerialNumber(length){
        let char = generate("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 2);
        let number = this.generateNumericID(length-char.length);
        return char+number;
    },
    generateRandomInt,
    genDate,
    generateProductName,
    generateBatchNumber,
    generateGtin,
    validateGtin,
    calculateGtinCheckSum,
    generateRandomInt,
    stringFormat,
    getRandom,
    generate2DMatrixCode,
    isEqual
}