/**
 *
 */

var crypto = require("crypto");

const SALT_LENGTH = 6;
const CHAR_LIST = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
                   'a', 'b', 'c', 'd', 'e', 'f'];

function generateSalt() {
    var str = "";
    for (var i = 0; i < SALT_LENGTH; i++) {
        str += CHAR_LIST[Math.floor(Math.random() * CHAR_LIST.length)];
    }
    return str;
}

/**
 * Encrypt the password with the salt
 * @param salt
 * @param password
 */
exports.encrypt = function (salt, password) {
    return encrypt(salt, password);
}

/**
 * Check if the given password is correct
 * @param password, the password to be checked
 * @param encrypted, the encrypted password stored
 */
exports.match = function (password, encrypted) {
    var salt = encrypted.substring(0, SALT_LENGTH);
    return encrypt(salt, password) === encrypted;
}

/**
 * Generate Encrypted Password that is going to be stored
 * @param password, the password to be encrypted by new salt
 */
exports.genEncrypted = function (password) {
    return encrypt(generateSalt(), password);
}

/**
 * Encrypt the password with the salt
 * @param salt
 * @param password
 */
function encrypt(salt, password) {
    var hash = crypto.createHash('sha256').update(salt + password).digest('base64');
    return salt + hash;
}
