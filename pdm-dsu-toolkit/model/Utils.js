/**
 * @module utils
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

function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

/**
 * Generates a string of the provided length filled with random characters from the provided characterSet
 * Clone of PrivateSky Code
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

module.exports = {
    /**
     * Generates a string of the provided length filled with random characters from 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
     * Clone of PrivateSky Code
     */
    generateID(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return generate(characters, length);
    },

    /**
     * Generates a string of the provided length filled with random numeric characters
     * Clone of PrivateSky Code
     */
    generateNumericID(length) {
        const characters = '0123456789';
        return generate(characters, length);
    },

    /**
     * Clone of PrivateSky Code
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
    generateRandomInt,
    stringFormat,
    getRandom
}