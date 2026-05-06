const { customAlphabet } = require('nanoid');

// URL-safe alphabet without ambiguous characters (0, O, I, l)
const alphabet = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
const generateCode = customAlphabet(alphabet, 6);

module.exports = { generateCode };
